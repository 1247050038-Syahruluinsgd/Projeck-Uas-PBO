"""
detection_api.py — REST API Deteksi Atribut menggunakan FastAPI + YOLO
======================================================================
Cara menjalankan:
    uvicorn detection_api:app --host 0.0.0.0 --port 8000 --reload

Endpoint tersedia:
    GET  /              → Health check & info API.
    GET  /health        → Status kesehatan server.
    POST /predict       → Upload gambar → deteksi atribut → JSON response.

Contoh pengujian dengan curl:
    curl -X POST "http://localhost:8000/predict" \
         -F "file=@foto_test.jpg"

Contoh pengujian dengan Python requests:
    import requests
    resp = requests.post(
        "http://localhost:8000/predict",
        files={"file": open("foto_test.jpg", "rb")}
    )
    print(resp.json())

LOGIKA DETEKSI (Two-Stage):
    1. Tahap 1 — Deteksi ORANG menggunakan yolov8n.pt (COCO).
       Jika tidak ada orang terdeteksi → semua atribut = False.
    2. Tahap 2 — Di dalam bounding box orang, jalankan model kustom
       untuk mendeteksi atribut (kemeja, kerudung, nametag, dll).
    3. Validasi tambahan: cek warna dominan & ukuran minimal ROI.
       Jika tidak lolos validasi → atribut dianggap False.
"""

import io
from pathlib import Path
from datetime import datetime
from typing import Optional

import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO


# ──────────────────────────────────────────────────────────────
#  KONFIGURASI
# ──────────────────────────────────────────────────────────────
# Model COCO untuk deteksi orang (tahap 1)
PERSON_MODEL_PATH = "yolov8n.pt"
PERSON_CLASS_ID = 0        # class 0 = 'person' di COCO
PERSON_CONFIDENCE = 0.45   # threshold deteksi orang

# Model kustom untuk deteksi atribut (tahap 2)
CUSTOM_MODEL_PATH = Path("best.pt")
TRAINED_MODEL_PATHS = [
    Path("runs/detect/deteksi_atribut-2/weights/best.pt"),
    Path("runs/detect/deteksi_atribut/weights/best.pt"),
]
ATTRIBUTE_CONFIDENCE = 0.50   # threshold lebih tinggi untuk atribut

# Padding untuk memperluas area person box (agar atribut di tepi tidak terpotong)
PERSON_BOX_PADDING = 0.10  # 10% dari ukuran box

# Daftar semua atribut yang HARUS dideteksi
# Jika atribut tidak terdeteksi → otomatis False
ALL_ATTRIBUTES = [
    "celana_benar",
    "celana_salah",
    "kemeja_benar",
    "kemeja_salah",
    "kerudung_benar",
    "kerudung_salah",
    "nametag_ada",
    "rok_benar",
    "rok_salah",
    "sabuk_ada",
]

# ──────────────────────────────────────────────────────────────
#  ATURAN VALIDASI PER ATRIBUT
# ──────────────────────────────────────────────────────────────
# Setiap atribut punya aturan validasi untuk mengurangi false positive.
# - min_area_ratio: rasio minimal luas bbox atribut terhadap luas person box
# - max_area_ratio: rasio maksimal (cegah bbox terlalu besar / salah)
# - expected_region: area relatif dalam person box ("top", "middle", "bottom", "any")
#     top    = 0% - 40% dari atas person box (kepala, bahu)
#     middle = 20% - 70% dari person box (badan)
#     bottom = 50% - 100% dari person box (kaki)
#     any    = tidak dibatasi
# - expected_colors: warna dominan yang valid (opsional), None = tidak dicek
ATTRIBUTE_RULES = {
    "kemeja_benar": {
        "min_area_ratio": 0.03,
        "max_area_ratio": 0.60,
        "expected_region": "middle",
        "expected_colors": ["Putih"],
    },
    "kemeja_salah": {
        "min_area_ratio": 0.03,
        "max_area_ratio": 0.60,
        "expected_region": "middle",
        "expected_colors": None,
    },
    "kerudung_benar": {
        "min_area_ratio": 0.02,
        "max_area_ratio": 0.40,
        "expected_region": "top",
        "expected_colors": None,
    },
    "kerudung_salah": {
        "min_area_ratio": 0.02,
        "max_area_ratio": 0.40,
        "expected_region": "top",
        "expected_colors": None,
    },
    "nametag_ada": {
        "min_area_ratio": 0.005,
        "max_area_ratio": 0.15,
        "expected_region": "middle",
        "expected_colors": None,
    },
    "celana_benar": {
        "min_area_ratio": 0.03,
        "max_area_ratio": 0.55,
        "expected_region": "bottom",
        "expected_colors": None,
    },
    "celana_salah": {
        "min_area_ratio": 0.03,
        "max_area_ratio": 0.55,
        "expected_region": "bottom",
        "expected_colors": None,
    },
    "rok_benar": {
        "min_area_ratio": 0.03,
        "max_area_ratio": 0.50,
        "expected_region": "bottom",
        "expected_colors": None,
    },
    "rok_salah": {
        "min_area_ratio": 0.03,
        "max_area_ratio": 0.50,
        "expected_region": "bottom",
        "expected_colors": None,
    },
    "sabuk_ada": {
        "min_area_ratio": 0.003,
        "max_area_ratio": 0.10,
        "expected_region": "middle",
        "expected_colors": None,
    },
}

# ──────────────────────────────────────────────────────────────
#  DEFINISI RENTANG WARNA HSV
# ──────────────────────────────────────────────────────────────
COLOR_RANGES = [
    ("Merah",  np.array([0, 70, 50]),    np.array([10, 255, 255])),
    ("Merah",  np.array([170, 70, 50]),  np.array([179, 255, 255])),
    ("Kuning", np.array([20, 70, 70]),   np.array([35, 255, 255])),
    ("Hijau",  np.array([36, 50, 50]),   np.array([85, 255, 255])),
    ("Biru",   np.array([90, 50, 50]),   np.array([130, 255, 255])),
    ("Pink",   np.array([140, 30, 100]), np.array([170, 255, 255])),
    ("Putih",  np.array([0, 0, 180]),    np.array([179, 50, 255])),
    ("Hitam",  np.array([0, 0, 0]),      np.array([179, 255, 50])),
]


# ──────────────────────────────────────────────────────────────
#  INISIALISASI APLIKASI FASTAPI
# ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Deteksi Atribut AI — API",
    description=(
        "REST API untuk mendeteksi atribut (kemeja, nametag, kerudung, "
        "celana, rok, sabuk) pada ORANG menggunakan model YOLO 2 tahap. "
        "Tahap 1: Deteksi orang. Tahap 2: Deteksi atribut di area orang."
    ),
    version="2.0.0",
)


# ──────────────────────────────────────────────────────────────
#  MUAT MODEL SAAT STARTUP
# ──────────────────────────────────────────────────────────────
def load_person_model() -> YOLO:
    """Muat model COCO untuk deteksi orang (tahap 1)."""
    print(f"[INFO] Memuat model deteksi orang: {PERSON_MODEL_PATH}")
    return YOLO(PERSON_MODEL_PATH)


def load_attribute_model() -> YOLO:
    """Muat model kustom untuk deteksi atribut (tahap 2)."""
    # 1) Cek best.pt di root folder
    if CUSTOM_MODEL_PATH.exists():
        print(f"[INFO] Memuat model atribut kustom: {CUSTOM_MODEL_PATH}")
        return YOLO(str(CUSTOM_MODEL_PATH))

    # 2) Cek hasil training di folder runs/
    for trained_path in TRAINED_MODEL_PATHS:
        if trained_path.exists():
            print(f"[INFO] Memuat model atribut dari: {trained_path}")
            return YOLO(str(trained_path))

    # 3) Tidak ada model kustom
    print(
        "[ERROR] Model kustom untuk atribut TIDAK ditemukan!\n"
        "[ERROR] Jalankan train_model.py untuk melatih model terlebih dahulu."
    )
    return None


# Model dimuat sekali saat server start
person_model = load_person_model()
attribute_model = load_attribute_model()


# ──────────────────────────────────────────────────────────────
#  FUNGSI UTILITAS
# ──────────────────────────────────────────────────────────────
def detect_dominant_color(roi: np.ndarray) -> str:
    """Deteksi warna dominan dari ROI (Region of Interest) dalam format BGR."""
    if roi.size == 0:
        return "Tidak Diketahui"

    hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    best_color = "Tidak Diketahui"
    best_count = 0

    for color_name, lower, upper in COLOR_RANGES:
        mask = cv2.inRange(hsv_roi, lower, upper)
        count = cv2.countNonZero(mask)
        if count > best_count:
            best_count = count
            best_color = color_name

    return best_color


def get_person_boxes(bgr_image: np.ndarray) -> list[dict]:
    """Tahap 1: Deteksi semua orang dalam gambar menggunakan model COCO."""
    results = person_model.predict(source=bgr_image, verbose=False)
    persons = []

    img_h, img_w = bgr_image.shape[:2]

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            # Hanya ambil class 'person' (id=0 di COCO)
            if class_id != PERSON_CLASS_ID:
                continue
            if confidence < PERSON_CONFIDENCE:
                continue

            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

            # Tambahkan padding agar atribut di tepi tidak terpotong
            pad_w = int((x2 - x1) * PERSON_BOX_PADDING)
            pad_h = int((y2 - y1) * PERSON_BOX_PADDING)

            x1 = max(0, x1 - pad_w)
            y1 = max(0, y1 - pad_h)
            x2 = min(img_w, x2 + pad_w)
            y2 = min(img_h, y2 + pad_h)

            persons.append({
                "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                "confidence": round(confidence, 4),
            })

    return persons


def validate_attribute(
    label: str,
    attr_box: dict,
    person_box: dict,
    bgr_image: np.ndarray,
) -> tuple[bool, str]:
    """Validasi apakah deteksi atribut masuk akal berdasarkan aturan.

    Returns:
        (is_valid, reason) — True jika lolos validasi, False + alasan jika tidak.
    """
    rules = ATTRIBUTE_RULES.get(label)
    if rules is None:
        return (False, f"Label '{label}' tidak dikenal")

    # ── Hitung area relatif ──
    person_w = person_box["x2"] - person_box["x1"]
    person_h = person_box["y2"] - person_box["y1"]
    person_area = person_w * person_h

    if person_area <= 0:
        return (False, "Person area = 0")

    attr_w = attr_box["x2"] - attr_box["x1"]
    attr_h = attr_box["y2"] - attr_box["y1"]
    attr_area = attr_w * attr_h
    area_ratio = attr_area / person_area

    # ── Cek rasio area ──
    if area_ratio < rules["min_area_ratio"]:
        return (False, f"Terlalu kecil ({area_ratio:.4f} < {rules['min_area_ratio']})")
    if area_ratio > rules["max_area_ratio"]:
        return (False, f"Terlalu besar ({area_ratio:.4f} > {rules['max_area_ratio']})")

    # ── Cek rasio aspek (lebar / tinggi) ──
    if attr_h > 0:
        aspect_ratio = attr_w / attr_h
        # Rok tidak boleh terlalu ramping/sempit (biasanya celana)
        if label in ["rok_benar", "rok_salah"] and aspect_ratio < 0.45:
            return (False, f"Rasio aspek terlalu ramping ({aspect_ratio:.2f} < 0.45), terindikasi celana")
        # Celana tidak boleh terlalu lebar/kotak (biasanya rok)
        if label in ["celana_benar", "celana_salah"] and aspect_ratio > 0.85:
            return (False, f"Rasio aspek terlalu lebar ({aspect_ratio:.2f} > 0.85), terindikasi rok")

    # ── Cek posisi relatif (region) ──
    expected_region = rules["expected_region"]
    if expected_region != "any":
        # Hitung posisi tengah atribut relatif terhadap person box
        attr_center_y = ((attr_box["y1"] + attr_box["y2"]) / 2 - person_box["y1"]) / person_h

        region_ok = False
        if expected_region == "top" and attr_center_y <= 0.45:
            region_ok = True
        elif expected_region == "middle" and 0.15 <= attr_center_y <= 0.75:
            region_ok = True
        elif expected_region == "bottom" and attr_center_y >= 0.45:
            region_ok = True

        if not region_ok:
            return (False, f"Posisi tidak sesuai (y_rel={attr_center_y:.2f}, expected={expected_region})")

    # ── Cek warna dominan (opsional) ──
    expected_colors = rules.get("expected_colors")
    if expected_colors is not None:
        roi = bgr_image[attr_box["y1"]:attr_box["y2"], attr_box["x1"]:attr_box["x2"]]
        if roi.size > 0:
            dominant_color = detect_dominant_color(roi)
            if dominant_color not in expected_colors:
                return (False, f"Warna '{dominant_color}' tidak sesuai (expected: {expected_colors})")

    return (True, "OK")


def detect_attributes_in_person(
    bgr_image: np.ndarray,
    person_box: dict,
) -> list[dict]:
    """Tahap 2: Deteksi atribut hanya di dalam area person box."""
    px1, py1, px2, py2 = person_box["x1"], person_box["y1"], person_box["x2"], person_box["y2"]

    # Crop area orang
    person_crop = bgr_image[py1:py2, px1:px2]

    if person_crop.size == 0:
        return []

    # Jalankan model atribut pada crop orang
    results = attribute_model.predict(source=person_crop, verbose=False)

    valid_detections = []

    for result in results:
        for box in result.boxes:
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])

            if confidence < ATTRIBUTE_CONFIDENCE:
                continue

            # Koordinat relatif terhadap crop → konversi ke koordinat gambar penuh
            cx1, cy1, cx2, cy2 = map(int, box.xyxy[0].tolist())
            abs_x1 = px1 + cx1
            abs_y1 = py1 + cy1
            abs_x2 = px1 + cx2
            abs_y2 = py1 + cy2

            # Clamp ke batas gambar
            img_h, img_w = bgr_image.shape[:2]
            abs_x1 = max(0, abs_x1)
            abs_y1 = max(0, abs_y1)
            abs_x2 = min(img_w, abs_x2)
            abs_y2 = min(img_h, abs_y2)

            label_name = result.names[class_id]
            attr_box = {"x1": abs_x1, "y1": abs_y1, "x2": abs_x2, "y2": abs_y2}

            # ── VALIDASI: cek apakah deteksi ini masuk akal ──
            is_valid, reason = validate_attribute(
                label_name, attr_box, person_box, bgr_image
            )

            if not is_valid:
                print(f"  [FILTER] {label_name} ditolak: {reason}")
                continue

            valid_detections.append({
                "class_id": class_id,
                "label": label_name,
                "confidence": round(confidence, 4),
                "bbox": attr_box,
                "validated": True,
            })

    return valid_detections


# ──────────────────────────────────────────────────────────────
#  ENDPOINT: Health Check
# ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Info"])
async def root():
    """Endpoint root — informasi dasar API."""
    return {
        "project": "Deteksi Atribut AI",
        "version": "2.0.0",
        "status": "running",
        "logic": "Two-stage: Person detection → Attribute detection + validation",
        "endpoints": {
            "health": "GET /health",
            "predict": "POST /predict (upload gambar)",
        },
    }


@app.get("/health", tags=["Info"])
async def health_check():
    """Cek kesehatan server dan kesiapan model."""
    return {
        "status": "healthy",
        "person_model_loaded": person_model is not None,
        "attribute_model_loaded": attribute_model is not None,
        "timestamp": datetime.now().isoformat(),
    }


# ──────────────────────────────────────────────────────────────
#  ENDPOINT: Prediksi / Deteksi Atribut (Two-Stage)
# ──────────────────────────────────────────────────────────────
@app.post("/predict", tags=["Deteksi"])
async def predict(file: UploadFile = File(...)):
    """Menerima upload gambar dan mengembalikan hasil deteksi atribut.

    **Logika Two-Stage:**
    1. Deteksi orang menggunakan model COCO.
    2. Untuk setiap orang yang terdeteksi, jalankan model kustom
       untuk mendeteksi atribut di area orang tersebut.
    3. Validasi hasil deteksi (warna, ukuran, posisi).
    4. Atribut yang TIDAK terdeteksi otomatis bernilai False.

    **Request:**
    - `file`: File gambar (JPEG, PNG, dll.) via multipart/form-data.

    **Response (JSON):**
    ```json
    {
        "success": true,
        "filename": "foto_test.jpg",
        "image_size": {"width": 640, "height": 480},
        "persons_detected": 1,
        "persons": [
            {
                "person_id": 1,
                "person_bbox": {"x1": 50, "y1": 10, "x2": 400, "y2": 600},
                "attributes": {
                    "kemeja_benar": {"detected": true, "confidence": 0.89, ...},
                    "nametag_ada": {"detected": false},
                    ...
                }
            }
        ]
    }
    ```
    """
    if attribute_model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Model atribut belum tersedia. "
                "Jalankan train_model.py untuk melatih model terlebih dahulu."
            ),
        )

    # ── Validasi tipe file ──
    allowed_types = ["image/jpeg", "image/png", "image/bmp", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Tipe file tidak didukung: {file.content_type}. "
                f"Gunakan salah satu dari: {', '.join(allowed_types)}"
            ),
        )

    try:
        # ── Baca isi file yang diupload ──
        contents = await file.read()

        # ── Konversi bytes → PIL Image → numpy array (BGR untuk OpenCV) ──
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        np_image = np.array(pil_image)
        bgr_image = cv2.cvtColor(np_image, cv2.COLOR_RGB2BGR)

        img_h, img_w = bgr_image.shape[:2]

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Gagal memproses gambar: {str(e)}",
        )

    # ══════════════════════════════════════════════════════════
    #  TAHAP 1: Deteksi Orang
    # ══════════════════════════════════════════════════════════
    person_boxes = get_person_boxes(bgr_image)
    print(f"\n[INFO] Orang terdeteksi: {len(person_boxes)}")

    if len(person_boxes) == 0:
        # Tidak ada orang → semua atribut False
        print("[INFO] Tidak ada orang → semua atribut = False")
        return JSONResponse(
            content={
                "success": True,
                "filename": file.filename,
                "image_size": {"width": img_w, "height": img_h},
                "persons_detected": 0,
                "message": "Tidak ada orang terdeteksi dalam gambar. Semua atribut = False.",
                "persons": [],
                "summary": {attr: False for attr in ALL_ATTRIBUTES},
            }
        )

    # ══════════════════════════════════════════════════════════
    #  TAHAP 2: Deteksi Atribut per Orang
    # ══════════════════════════════════════════════════════════
    all_persons = []

    for idx, pbox in enumerate(person_boxes):
        print(f"\n[INFO] Memproses orang #{idx + 1}: {pbox}")

        # Deteksi atribut di dalam area orang
        detections = detect_attributes_in_person(bgr_image, pbox)

        # Bangun status atribut: True/False untuk setiap atribut
        detected_labels = {d["label"] for d in detections}
        attributes_status = {}

        for attr_name in ALL_ATTRIBUTES:
            matching = [d for d in detections if d["label"] == attr_name]
            if matching:
                # Ambil yang confidence tertinggi
                best = max(matching, key=lambda d: d["confidence"])
                attributes_status[attr_name] = {
                    "detected": True,
                    "confidence": best["confidence"],
                    "bbox": best["bbox"],
                }
            else:
                attributes_status[attr_name] = {
                    "detected": False,
                }

        all_persons.append({
            "person_id": idx + 1,
            "person_confidence": pbox["confidence"],
            "person_bbox": {
                "x1": pbox["x1"],
                "y1": pbox["y1"],
                "x2": pbox["x2"],
                "y2": pbox["y2"],
            },
            "attributes": attributes_status,
        })

    # ── Kembalikan response JSON ──
    return JSONResponse(
        content={
            "success": True,
            "filename": file.filename,
            "image_size": {"width": img_w, "height": img_h},
            "persons_detected": len(all_persons),
            "persons": all_persons,
        }
    )


# ──────────────────────────────────────────────────────────────
#  ENTRY POINT (opsional — bisa langsung pakai uvicorn CLI)
# ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("  DETEKSI ATRIBUT AI — TWO-STAGE API")
    print("=" * 60)
    print("  Tahap 1: Deteksi orang (yolov8n.pt)")
    print("  Tahap 2: Deteksi atribut (best.pt) + validasi")
    print("=" * 60)
    print("[INFO] Menjalankan server API di http://0.0.0.0:8000")
    print("[INFO] Dokumentasi Swagger: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

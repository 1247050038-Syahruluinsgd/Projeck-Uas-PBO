"""
camera_detector_color_check.py — Deteksi Atribut + Validasi Warna (Two-Stage)
===============================================================================
Cara menjalankan:
    python camera_detector_color_check.py

Tekan 'q' pada jendela kamera untuk keluar.

LOGIKA:
  1. Deteksi ORANG dulu pakai yolov8n.pt (COCO)
  2. Di dalam area orang, deteksi atribut pakai best.pt
  3. Validasi: cek warna dominan + posisi relatif
  4. Objek bukan-orang (buku, meja, dll) → TIDAK diproses

Fitur:
  - Two-stage detection (orang → atribut)
  - Validasi warna dominan HSV
  - Validasi posisi atribut (kepala/badan/kaki)
  - Status panel: daftar semua atribut (True/False)
"""

import sys
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from ultralytics import YOLO


# ──────────────────────────────────────────────────────────────
#  KONFIGURASI
# ──────────────────────────────────────────────────────────────
PERSON_MODEL_PATH = "yolov8n.pt"
PERSON_CLASS_ID = 0
PERSON_CONFIDENCE = 0.45

ATTRIBUTE_MODEL_PATH = Path("best.pt")
ATTRIBUTE_CONFIDENCE = 0.50

PERSON_BOX_PADDING = 0.10

CAMERA_INDEX = 0
WINDOW_NAME = "Deteksi Atribut AI + Cek Warna (Two-Stage)"

BOX_THICKNESS = 2
FONT = cv2.FONT_HERSHEY_SIMPLEX
FONT_SCALE = 0.50
FONT_THICKNESS = 1

# Daftar semua atribut
ALL_ATTRIBUTES = [
    "kemeja_benar", "kemeja_salah",
    "kerudung_benar", "kerudung_salah",
    "nametag_ada",
    "celana_benar", "celana_salah",
    "rok_benar", "rok_salah",
    "sabuk_ada",
]

# ──────────────────────────────────────────────────────────────
#  DEFINISI RENTANG WARNA HSV
# ──────────────────────────────────────────────────────────────
COLOR_RANGES = [
    ("Merah",   np.array([0, 70, 50]),    np.array([10, 255, 255]),   (0, 0, 255)),
    ("Merah",   np.array([170, 70, 50]),  np.array([179, 255, 255]), (0, 0, 255)),
    ("Kuning",  np.array([20, 70, 70]),   np.array([35, 255, 255]),  (0, 255, 255)),
    ("Hijau",   np.array([36, 50, 50]),   np.array([85, 255, 255]),  (0, 200, 0)),
    ("Biru",    np.array([90, 50, 50]),   np.array([130, 255, 255]), (255, 100, 0)),
    ("Pink",    np.array([140, 30, 100]), np.array([170, 255, 255]), (180, 105, 255)),
    ("Putih",   np.array([0, 0, 180]),    np.array([179, 50, 255]),  (255, 255, 255)),
    ("Hitam",   np.array([0, 0, 0]),      np.array([179, 255, 50]),  (80, 80, 80)),
]

# Aturan validasi per atribut
ATTRIBUTE_RULES = {
    "kemeja_benar": {
        "region": "middle",
        "expected_colors": ["Putih"],
    },
    "kemeja_salah": {
        "region": "middle",
        "expected_colors": None,
    },
    "kerudung_benar": {
        "region": "top",
        "expected_colors": None,
    },
    "kerudung_salah": {
        "region": "top",
        "expected_colors": None,
    },
    "nametag_ada": {
        "region": "middle",
        "expected_colors": None,
    },
    "celana_benar": {
        "region": "bottom",
        "expected_colors": None,
    },
    "celana_salah": {
        "region": "bottom",
        "expected_colors": None,
    },
    "rok_benar": {
        "region": "bottom",
        "expected_colors": None,
    },
    "rok_salah": {
        "region": "bottom",
        "expected_colors": None,
    },
    "sabuk_ada": {
        "region": "middle",
        "expected_colors": None,
    },
}


# ──────────────────────────────────────────────────────────────
#  FUNGSI UTILITAS
# ──────────────────────────────────────────────────────────────
def detect_dominant_color(roi: np.ndarray) -> tuple[str, tuple[int, int, int]]:
    """Deteksi warna dominan dari sebuah ROI."""
    if roi.size == 0:
        return ("N/A", (200, 200, 200))

    hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    best_color_name = "N/A"
    best_color_bgr = (200, 200, 200)
    best_pixel_count = 0

    for color_name, lower, upper, box_color in COLOR_RANGES:
        mask = cv2.inRange(hsv_roi, lower, upper)
        pixel_count = cv2.countNonZero(mask)

        if pixel_count > best_pixel_count:
            best_pixel_count = pixel_count
            best_color_name = color_name
            best_color_bgr = box_color

    return (best_color_name, best_color_bgr)


def validate_region(label: str, attr_center_y_rel: float) -> bool:
    """Cek apakah posisi atribut sesuai region yang diharapkan."""
    rules = ATTRIBUTE_RULES.get(label)
    if rules is None:
        return False

    region = rules["region"]
    if region == "top":
        return attr_center_y_rel <= 0.45
    elif region == "middle":
        return 0.15 <= attr_center_y_rel <= 0.75
    elif region == "bottom":
        return attr_center_y_rel >= 0.45
    return True


def validate_color(label: str, dominant_color: str) -> bool:
    """Cek apakah warna dominan sesuai yang diharapkan (jika ada aturan)."""
    rules = ATTRIBUTE_RULES.get(label)
    if rules is None:
        return False

    expected = rules.get("expected_colors")
    if expected is None:
        return True  # Tidak ada aturan warna → lolos
    return dominant_color in expected


def load_models():
    """Muat kedua model."""
    print("[INFO] Memuat model deteksi orang (yolov8n.pt)...")
    person_model = YOLO(PERSON_MODEL_PATH)

    if not ATTRIBUTE_MODEL_PATH.exists():
        print(f"[ERROR] Model atribut '{ATTRIBUTE_MODEL_PATH}' tidak ditemukan!")
        print("[ERROR] Jalankan train_model.py terlebih dahulu.")
        sys.exit(1)

    print(f"[INFO] Memuat model atribut ({ATTRIBUTE_MODEL_PATH})...")
    attribute_model = YOLO(str(ATTRIBUTE_MODEL_PATH))
    print(f"[INFO] Kelas atribut: {attribute_model.names}")

    return person_model, attribute_model


def draw_status_panel(frame: np.ndarray, detected_attrs: dict):
    """Gambar panel status atribut di kiri frame."""
    panel_x = 10
    panel_y = 60
    line_height = 22

    # Background semi-transparan
    overlay = frame.copy()
    panel_h = len(ALL_ATTRIBUTES) * line_height + 20
    cv2.rectangle(overlay, (5, panel_y - 15), (220, panel_y + panel_h), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

    cv2.putText(frame, "STATUS ATRIBUT:", (panel_x, panel_y),
                FONT, 0.45, (255, 255, 255), 1)
    panel_y += line_height

    for attr in ALL_ATTRIBUTES:
        info = detected_attrs.get(attr)
        if info and info["detected"]:
            color = (0, 255, 0)
            text = f"[V] {attr} ({info['confidence']:.0%})"
            if info.get("color"):
                text += f" [{info['color']}]"
        else:
            color = (0, 0, 255)
            text = f"[X] {attr}"

        cv2.putText(frame, text, (panel_x, panel_y), FONT, 0.38, color, 1)
        panel_y += line_height


def main() -> None:
    """Loop utama: Two-stage detection dengan validasi warna."""
    person_model, attribute_model = load_models()

    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print("[ERROR] Tidak dapat membuka kamera.")
        sys.exit(1)

    print(f"[INFO] Kamera terbuka. Tekan 'q' untuk keluar.")
    print("[INFO] Logika: Orang dulu → Atribut + Warna → Validasi")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[WARN] Gagal membaca frame.")
            break

        frame_h, frame_w = frame.shape[:2]

        # ════════════════════════════════════════════
        #  TAHAP 1: Deteksi Orang
        # ════════════════════════════════════════════
        person_results = person_model.predict(source=frame, verbose=False)
        person_boxes = []

        for result in person_results:
            for box in result.boxes:
                if int(box.cls[0]) != PERSON_CLASS_ID:
                    continue
                if float(box.conf[0]) < PERSON_CONFIDENCE:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                pad_w = int((x2 - x1) * PERSON_BOX_PADDING)
                pad_h = int((y2 - y1) * PERSON_BOX_PADDING)

                x1 = max(0, x1 - pad_w)
                y1 = max(0, y1 - pad_h)
                x2 = min(frame_w, x2 + pad_w)
                y2 = min(frame_h, y2 + pad_h)

                person_boxes.append((x1, y1, x2, y2))

        # Status jumlah orang
        cv2.putText(frame, f"Orang: {len(person_boxes)}", (10, 25),
                    FONT, 0.6, (255, 255, 255), 2)

        if len(person_boxes) == 0:
            # Tidak ada orang → semua False
            cv2.putText(frame, "Tidak ada orang - semua atribut False",
                        (10, 50), FONT, 0.5, (0, 0, 255), 1)
            draw_status_panel(frame, {})
            cv2.imshow(WINDOW_NAME, frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
            continue

        # ════════════════════════════════════════════
        #  TAHAP 2: Deteksi Atribut + Warna per Orang
        # ════════════════════════════════════════════
        all_detected = {}

        for (px1, py1, px2, py2) in person_boxes:
            # Gambar person box (biru muda tipis)
            cv2.rectangle(frame, (px1, py1), (px2, py2), (255, 200, 0), 1)
            cv2.putText(frame, "ORANG", (px1, py1 - 5), FONT, 0.4, (255, 200, 0), 1)

            person_crop = frame[py1:py2, px1:px2]
            if person_crop.size == 0:
                continue

            person_h = py2 - py1
            attr_results = attribute_model.predict(source=person_crop, verbose=False)

            for result in attr_results:
                for box in result.boxes:
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])

                    if confidence < ATTRIBUTE_CONFIDENCE:
                        continue

                    label = result.names[class_id]
                    cx1, cy1, cx2, cy2 = map(int, box.xyxy[0].tolist())

                    # Validasi rasio aspek (lebar / tinggi)
                    w = cx2 - cx1
                    h = cy2 - cy1
                    if h > 0:
                        aspect_ratio = w / h
                        # Rok tidak boleh terlalu ramping/sempit (biasanya celana)
                        if label in ["rok_benar", "rok_salah"] and aspect_ratio < 0.45:
                            continue
                        # Celana tidak boleh terlalu lebar/kotak (biasanya rok)
                        if label in ["celana_benar", "celana_salah"] and aspect_ratio > 0.85:
                            continue

                    # Validasi posisi
                    attr_center_y_rel = ((cy1 + cy2) / 2) / person_h
                    if not validate_region(label, attr_center_y_rel):
                        continue

                    # Koordinat frame penuh
                    ax1 = px1 + cx1
                    ay1 = py1 + cy1
                    ax2 = px1 + cx2
                    ay2 = py1 + cy2

                    # Clamp
                    ax1 = max(0, ax1)
                    ay1 = max(0, ay1)
                    ax2 = min(frame_w, ax2)
                    ay2 = min(frame_h, ay2)

                    # Deteksi warna dominan
                    roi = frame[ay1:ay2, ax1:ax2]
                    if roi.size > 0:
                        color_name, box_color = detect_dominant_color(roi)
                    else:
                        color_name = "N/A"
                        box_color = (0, 255, 0)

                    # Validasi warna
                    if not validate_color(label, color_name):
                        continue

                    # Simpan deteksi (ambil confidence tertinggi per label)
                    if label not in all_detected or confidence > all_detected[label]["confidence"]:
                        all_detected[label] = {
                            "detected": True,
                            "confidence": confidence,
                            "color": color_name,
                            "bbox": (ax1, ay1, ax2, ay2),
                            "box_color": box_color,
                        }

        # ═══ Gambar hasil deteksi ═══
        for label, info in all_detected.items():
            ax1, ay1, ax2, ay2 = info["bbox"]
            box_color = info["box_color"]
            conf = info["confidence"]
            color_name = info["color"]

            # Bounding box
            cv2.rectangle(frame, (ax1, ay1), (ax2, ay2), box_color, BOX_THICKNESS)

            # Label text
            display_text = f"{label} {conf:.2f} [{color_name}]"
            (tw, th), baseline = cv2.getTextSize(display_text, FONT, FONT_SCALE, FONT_THICKNESS)
            cv2.rectangle(frame, (ax1, ay1 - th - baseline - 5),
                          (ax1 + tw + 5, ay1), box_color, cv2.FILLED)
            cv2.putText(frame, display_text, (ax1 + 2, ay1 - baseline - 2),
                        FONT, FONT_SCALE, (0, 0, 0), FONT_THICKNESS)

        # ═══ Status panel ═══
        draw_status_panel(frame, all_detected)

        # ═══ Tampilkan ═══
        cv2.imshow(WINDOW_NAME, frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            print("[INFO] Keluar.")
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

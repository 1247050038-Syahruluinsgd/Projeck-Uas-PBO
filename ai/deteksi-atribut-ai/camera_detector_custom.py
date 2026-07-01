"""
camera_detector_custom.py — Deteksi Atribut Real-Time (Two-Stage)
==================================================================
LOGIKA:
  1. Deteksi ORANG dulu pakai yolov8n.pt (COCO)
  2. Di dalam area orang, baru deteksi atribut pakai best.pt
  3. Selain orang → TIDAK diproses (False)

CARA PAKAI:
  1. Pastikan file 'best.pt' ada (hasil dari training)
  2. python camera_detector_custom.py
  3. Tekan 'q' untuk keluar
"""

import sys
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO


# ──────────────────────────────────────────────────────────────
#  KONFIGURASI
# ──────────────────────────────────────────────────────────────
# Model COCO untuk deteksi orang (tahap 1)
PERSON_MODEL_PATH = "yolov8n.pt"
PERSON_CLASS_ID = 0
PERSON_CONFIDENCE = 0.45

# Model kustom untuk atribut (tahap 2)
ATTRIBUTE_MODEL_PATH = "best.pt"
ATTRIBUTE_CONFIDENCE = 0.50

# Padding person box
PERSON_BOX_PADDING = 0.10

# UI
WINDOW_NAME = "Deteksi Atribut AI — Two-Stage"
FONT = cv2.FONT_HERSHEY_SIMPLEX
FONT_SCALE = 0.5
FONT_THICKNESS = 1

# Daftar atribut yang valid
ALL_ATTRIBUTES = [
    "celana_benar", "celana_salah",
    "kemeja_benar", "kemeja_salah",
    "kerudung_benar", "kerudung_salah",
    "nametag_ada",
    "rok_benar", "rok_salah",
    "sabuk_ada",
]

# Aturan posisi relatif per atribut
# top = kepala/bahu (0-45%), middle = badan (15-75%), bottom = kaki (45-100%)
ATTRIBUTE_REGION = {
    "kemeja_benar": "middle",
    "kemeja_salah": "middle",
    "kerudung_benar": "top",
    "kerudung_salah": "top",
    "nametag_ada": "middle",
    "celana_benar": "bottom",
    "celana_salah": "bottom",
    "rok_benar": "bottom",
    "rok_salah": "bottom",
    "sabuk_ada": "middle",
}

# Warna box per atribut
ATTRIBUTE_COLORS = {
    "kemeja_benar": (0, 200, 0),       # Hijau
    "kemeja_salah": (0, 0, 200),       # Merah
    "kerudung_benar": (0, 200, 0),
    "kerudung_salah": (0, 0, 200),
    "nametag_ada": (200, 200, 0),      # Cyan
    "celana_benar": (0, 200, 0),
    "celana_salah": (0, 0, 200),
    "rok_benar": (0, 200, 0),
    "rok_salah": (0, 0, 200),
    "sabuk_ada": (200, 200, 0),
}


# ──────────────────────────────────────────────────────────────
#  FUNGSI UTILITAS
# ──────────────────────────────────────────────────────────────
def validate_region(label: str, attr_cy_rel: float) -> bool:
    """Cek apakah posisi atribut sesuai region yang diharapkan."""
    region = ATTRIBUTE_REGION.get(label, "any")
    if region == "top":
        return attr_cy_rel <= 0.45
    elif region == "middle":
        return 0.15 <= attr_cy_rel <= 0.75
    elif region == "bottom":
        return attr_cy_rel >= 0.45
    return True


def main():
    # ── Muat model ──
    print("[INFO] Memuat model deteksi orang (yolov8n.pt)...")
    person_model = YOLO(PERSON_MODEL_PATH)

    print(f"[INFO] Memuat model atribut ({ATTRIBUTE_MODEL_PATH})...")
    if not Path(ATTRIBUTE_MODEL_PATH).exists():
        print("[ERROR] File best.pt tidak ditemukan!")
        print("[ERROR] Jalankan train_model.py terlebih dahulu.")
        sys.exit(1)
    attribute_model = YOLO(ATTRIBUTE_MODEL_PATH)

    print(f"[INFO] Model atribut kelas: {attribute_model.names}")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Kamera tidak terdeteksi.")
        sys.exit(1)

    print("[INFO] Kamera aktif. Tekan 'q' untuk keluar.")
    print("[INFO] Logika: Deteksi orang dulu → baru cari atribut di area orang.")

    while True:
        ret, frame = cap.read()
        if not ret:
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

        # Gambar person box (biru muda, garis putus-putus simulasi)
        for (px1, py1, px2, py2) in person_boxes:
            cv2.rectangle(frame, (px1, py1), (px2, py2), (255, 200, 0), 1)
            cv2.putText(frame, "ORANG", (px1, py1 - 5), FONT, 0.45, (255, 200, 0), 1)

        # Status bar di atas
        status_text = f"Orang: {len(person_boxes)}"
        cv2.putText(frame, status_text, (10, 25), FONT, 0.6, (255, 255, 255), 2)

        if len(person_boxes) == 0:
            cv2.putText(frame, "Tidak ada orang - atribut False",
                        (10, 50), FONT, 0.5, (0, 0, 255), 1)
            cv2.imshow(WINDOW_NAME, frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            continue

        # ════════════════════════════════════════════
        #  TAHAP 2: Deteksi Atribut per Orang
        # ════════════════════════════════════════════
        for (px1, py1, px2, py2) in person_boxes:
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

                    # Posisi relatif dalam person box
                    attr_center_y_rel = ((cy1 + cy2) / 2) / person_h

                    # Validasi region
                    if not validate_region(label, attr_center_y_rel):
                        continue

                    # Konversi ke koordinat frame penuh
                    ax1 = px1 + cx1
                    ay1 = py1 + cy1
                    ax2 = px1 + cx2
                    ay2 = py1 + cy2

                    # Gambar box atribut
                    color = ATTRIBUTE_COLORS.get(label, (0, 255, 0))
                    cv2.rectangle(frame, (ax1, ay1), (ax2, ay2), color, 2)

                    # Label
                    text = f"{label} {confidence:.2f}"
                    (tw, th), _ = cv2.getTextSize(text, FONT, FONT_SCALE, FONT_THICKNESS)
                    cv2.rectangle(frame, (ax1, ay1 - th - 6), (ax1 + tw + 4, ay1), color, -1)
                    cv2.putText(frame, text, (ax1 + 2, ay1 - 4), FONT, FONT_SCALE,
                                (0, 0, 0), FONT_THICKNESS)

        cv2.imshow(WINDOW_NAME, frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] Selesai.")


if __name__ == "__main__":
    main()

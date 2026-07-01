"""
camera_detector.py — Deteksi Atribut Real-Time via Webcam
=========================================================
Cara menjalankan:
    python camera_detector.py

Tekan 'q' pada jendela kamera untuk keluar.

Script ini akan:
  1. Memuat model YOLO kustom (best.pt) atau fallback ke yolov8n.pt.
  2. Membuka webcam lokal (index 0).
  3. Melakukan inferensi setiap frame.
  4. Menggambar bounding box + label atribut di layar.
"""

import sys
from pathlib import Path

import cv2
from ultralytics import YOLO


# ──────────────────────────────────────────────────────────────
#  KONFIGURASI
# ──────────────────────────────────────────────────────────────
MODEL_PATH = Path("best.pt")           # Path model kustom Anda
FALLBACK_MODEL = "yolov8n.pt"          # Model default jika best.pt tidak ada
CAMERA_INDEX = 0                       # Index webcam (0 = default)
CONFIDENCE_THRESHOLD = 0.70           # Threshold minimum confidence dinaikkan untuk mengurangi deteksi salah (awalnya 0.45)
WINDOW_NAME = "Deteksi Atribut AI"     # Nama jendela OpenCV

# Warna bounding box (BGR) — hijau terang
BOX_COLOR = (0, 255, 0)
BOX_THICKNESS = 2
FONT = cv2.FONT_HERSHEY_SIMPLEX
FONT_SCALE = 0.6
FONT_THICKNESS = 2
LABEL_BG_COLOR = (0, 255, 0)          # Background label
LABEL_TEXT_COLOR = (0, 0, 0)          # Teks label (hitam)


def load_model() -> YOLO:
    """Muat model YOLO — prioritaskan model kustom, fallback ke pretrained."""
    if MODEL_PATH.exists():
        print(f"[INFO] Memuat model kustom: {MODEL_PATH}")
        return YOLO(str(MODEL_PATH))
    else:
        print(f"[WARN] Model '{MODEL_PATH}' tidak ditemukan. "
              f"Menggunakan fallback: {FALLBACK_MODEL}")
        return YOLO(FALLBACK_MODEL)


def draw_detections(frame, results) -> None:
    """Gambar bounding box dan label atribut pada frame.

    Args:
        frame:   Frame BGR dari OpenCV (numpy array).
        results: Hasil inferensi YOLO (list of Results).
    """
    for result in results:
        boxes = result.boxes  # Objek Boxes dari Ultralytics

        for box in boxes:
            # ── Ambil koordinat bounding box (x1, y1, x2, y2) ──
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

            # ── Ambil confidence score dan class ID ──
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])

            # ── Filter berdasarkan threshold ──
            if confidence < CONFIDENCE_THRESHOLD:
                continue

            # ── Ambil nama label dari model ──
            label_name = result.names[class_id]

            # ── Validasi Aspect Ratio untuk mencegah misdeteksi celana/rok ──
            w = x2 - x1
            h = y2 - y1
            if h > 0:
                aspect_ratio = w / h
                # Rok tidak boleh terlalu ramping/sempit (biasanya celana)
                if label_name in ["rok_benar", "rok_salah"] and aspect_ratio < 0.45:
                    continue
                # Celana tidak boleh terlalu lebar/kotak (biasanya rok)
                if label_name in ["celana_benar", "celana_salah"] and aspect_ratio > 0.85:
                    continue

            display_text = f"{label_name} {confidence:.2f}"

            # ── Gambar bounding box ──
            cv2.rectangle(frame, (x1, y1), (x2, y2), BOX_COLOR, BOX_THICKNESS)

            # ── Hitung ukuran teks untuk background label ──
            (text_w, text_h), baseline = cv2.getTextSize(
                display_text, FONT, FONT_SCALE, FONT_THICKNESS
            )

            # ── Gambar background label (kotak di atas bounding box) ──
            cv2.rectangle(
                frame,
                (x1, y1 - text_h - baseline - 5),
                (x1 + text_w + 5, y1),
                LABEL_BG_COLOR,
                cv2.FILLED,
            )

            # ── Tulis teks label ──
            cv2.putText(
                frame,
                display_text,
                (x1 + 2, y1 - baseline - 2),
                FONT,
                FONT_SCALE,
                LABEL_TEXT_COLOR,
                FONT_THICKNESS,
            )


def main() -> None:
    """Loop utama: baca frame dari webcam → inferensi → tampilkan."""

    # ── Muat model YOLO ──
    model = load_model()

    # ── Buka kamera ──
    # Gunakan cv2.CAP_DSHOW di Windows untuk menghindari error MSMF (Media Foundation)
    cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)
    if not cap.isOpened():
        # Fallback ke default backend jika DirectShow tidak berhasil
        cap = cv2.VideoCapture(CAMERA_INDEX)
        
    if not cap.isOpened():
        print("[ERROR] Tidak dapat membuka kamera. Periksa koneksi webcam Anda.")
        sys.exit(1)

    print(f"[INFO] Kamera terbuka (index={CAMERA_INDEX}). Tekan 'q' untuk keluar.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[WARN] Gagal membaca frame dari kamera.")
            break

        # ── Inferensi YOLO pada frame saat ini ──
        #    verbose=False agar log tidak membanjiri terminal
        results = model.predict(source=frame, verbose=False)

        # ── Gambar hasil deteksi ke frame ──
        draw_detections(frame, results)

        # ── Tampilkan frame di jendela ──
        cv2.imshow(WINDOW_NAME, frame)

        # ── Cek input keyboard — keluar jika 'q' ditekan ──
        if cv2.waitKey(1) & 0xFF == ord("q"):
            print("[INFO] Keluar dari deteksi kamera.")
            break

    # ── Bersihkan resource ──
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

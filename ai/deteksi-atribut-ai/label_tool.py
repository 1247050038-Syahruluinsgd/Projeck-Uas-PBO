"""
label_tool.py — Tool Bantu Labeling Gambar untuk Dataset YOLO
==============================================================
Script ini membuka gambar satu per satu dari folder 'new_samples/',
lalu kamu bisa menggambar bounding box dan memilih kelas atribut
untuk setiap objek yang ada di gambar.

CARA PAKAI:
1. Taruh foto-foto baru kamu di folder:  new_samples/
2. Jalankan:  python label_tool.py
3. Di setiap gambar:
   - Klik & drag untuk menggambar kotak (bounding box)
   - Pilih nomor kelas (0-9) sesuai daftar
   - Tekan 's' untuk SAVE & next image
   - Tekan 'z' untuk UNDO kotak terakhir
   - Tekan 'n' untuk SKIP (next tanpa save)
   - Tekan 'q' untuk QUIT
4. Hasil otomatis disimpan ke SIPMA-3/train/images/ dan SIPMA-3/train/labels/
5. Setelah selesai labeling, jalankan:  python train_model.py

DAFTAR KELAS:
   0: celana_benar
   1: celana_salah
   2: kemeja_benar
   3: kemeja_salah
   4: kerudung_benar
   5: kerudung_salah
   6: nametag_ada
   7: rok_benar
   8: rok_salah
   9: sabuk_ada
"""

import sys
import shutil
from pathlib import Path

import cv2
import numpy as np


# ──────────────────────────────────────────────────────────────
#  KONFIGURASI
# ──────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
NEW_SAMPLES_DIR = BASE_DIR / "new_samples"
DATASET_DIR = BASE_DIR / "SIPMA-3"
TRAIN_IMAGES_DIR = DATASET_DIR / "train" / "images"
TRAIN_LABELS_DIR = DATASET_DIR / "train" / "labels"

# Daftar kelas (HARUS sesuai urutan di data.yaml)
CLASS_NAMES = [
    "celana_benar",     # 0
    "celana_salah",     # 1
    "kemeja_benar",     # 2
    "kemeja_salah",     # 3
    "kerudung_benar",   # 4
    "kerudung_salah",   # 5
    "nametag_ada",      # 6
    "rok_benar",        # 7
    "rok_salah",        # 8
    "sabuk_ada",        # 9
]

# Warna per kelas untuk visualisasi
CLASS_COLORS = [
    (0, 180, 0),       # celana_benar - hijau
    (0, 0, 200),       # celana_salah - merah
    (0, 220, 0),       # kemeja_benar - hijau
    (0, 0, 220),       # kemeja_salah - merah
    (0, 200, 0),       # kerudung_benar - hijau
    (0, 0, 180),       # kerudung_salah - merah
    (200, 200, 0),     # nametag_ada - cyan
    (0, 200, 0),       # rok_benar - hijau
    (0, 0, 200),       # rok_salah - merah
    (200, 200, 0),     # sabuk_ada - cyan
]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
WINDOW_NAME = "Label Tool - Klik & Drag untuk Bounding Box"


# ──────────────────────────────────────────────────────────────
#  GLOBAL STATE
# ──────────────────────────────────────────────────────────────
drawing = False
start_x, start_y = -1, -1
current_x, current_y = -1, -1
boxes = []           # list of (class_id, x1, y1, x2, y2)
current_class = 2    # default: kemeja_benar
original_image = None


def mouse_callback(event, x, y, flags, param):
    """Callback untuk mouse events."""
    global drawing, start_x, start_y, current_x, current_y

    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        start_x, start_y = x, y

    elif event == cv2.EVENT_MOUSEMOVE:
        current_x, current_y = x, y

    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False
        # Normalisasi koordinat (pastikan x1 < x2, y1 < y2)
        bx1 = min(start_x, x)
        by1 = min(start_y, y)
        bx2 = max(start_x, x)
        by2 = max(start_y, y)

        # Abaikan box terlalu kecil (klik tanpa drag)
        if (bx2 - bx1) > 10 and (by2 - by1) > 10:
            boxes.append((current_class, bx1, by1, bx2, by2))
            print(f"  ✅ Box ditambahkan: {CLASS_NAMES[current_class]} "
                  f"({bx1},{by1})-({bx2},{by2})")


def draw_ui(image: np.ndarray) -> np.ndarray:
    """Gambar UI: boxes yang sudah dibuat + guide."""
    display = image.copy()
    img_h, img_w = display.shape[:2]

    # Gambar semua box yang sudah disimpan
    for i, (cls_id, x1, y1, x2, y2) in enumerate(boxes):
        color = CLASS_COLORS[cls_id]
        cv2.rectangle(display, (x1, y1), (x2, y2), color, 2)
        label = f"{i}: {CLASS_NAMES[cls_id]}"
        cv2.putText(display, label, (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

    # Gambar box yang sedang di-drag
    if drawing:
        cv2.rectangle(display, (start_x, start_y), (current_x, current_y),
                      (255, 255, 0), 1)

    # Panel info di atas
    panel_h = 35
    overlay = display.copy()
    cv2.rectangle(overlay, (0, 0), (img_w, panel_h), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.7, display, 0.3, 0, display)

    info = (f"Kelas aktif: [{current_class}] {CLASS_NAMES[current_class]}  |  "
            f"Box: {len(boxes)}  |  "
            f"s=Save  z=Undo  n=Skip  q=Quit  0-9=Pilih kelas")
    cv2.putText(display, info, (5, 22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1)

    return display


def save_annotation(image_path: Path, image: np.ndarray):
    """Simpan gambar + label ke dataset SIPMA-3/train/."""
    img_h, img_w = image.shape[:2]
    dest_name = image_path.stem  # nama file tanpa ekstensi

    # ── Salin gambar ke train/images/ ──
    dest_img = TRAIN_IMAGES_DIR / image_path.name
    shutil.copy2(image_path, dest_img)
    print(f"  📷 Gambar disalin ke: {dest_img}")

    # ── Buat file label (format YOLO) ──
    # Format per baris: class_id center_x center_y width height
    # Semua nilai dinormalisasi ke 0-1
    label_lines = []
    for cls_id, x1, y1, x2, y2 in boxes:
        cx = ((x1 + x2) / 2) / img_w
        cy = ((y1 + y2) / 2) / img_h
        w = (x2 - x1) / img_w
        h = (y2 - y1) / img_h
        label_lines.append(f"{cls_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")

    dest_label = TRAIN_LABELS_DIR / f"{dest_name}.txt"
    with open(dest_label, "w", encoding="utf-8") as f:
        f.write("\n".join(label_lines) + "\n")

    print(f"  📝 Label disimpan ke: {dest_label}")
    print(f"     ({len(label_lines)} objek)")


def main():
    global current_class, boxes, original_image

    # ── Cek folder new_samples ──
    if not NEW_SAMPLES_DIR.exists():
        NEW_SAMPLES_DIR.mkdir(parents=True)
        print(f"📁 Folder '{NEW_SAMPLES_DIR}' telah dibuat.")
        print(f"   Taruh foto-foto sample baru kamu di folder tersebut,")
        print(f"   lalu jalankan ulang script ini.")
        return

    # ── Cari semua gambar di new_samples ──
    images = sorted([
        f for f in NEW_SAMPLES_DIR.iterdir()
        if f.suffix.lower() in IMAGE_EXTENSIONS
    ])

    if not images:
        print(f"❌ Tidak ada gambar di folder '{NEW_SAMPLES_DIR}'.")
        print(f"   Taruh foto-foto sample (.jpg, .png, dll) di folder tersebut.")
        return

    print("=" * 60)
    print("  LABEL TOOL — Tambah Sample ke Dataset YOLO")
    print("=" * 60)
    print(f"  Gambar ditemukan: {len(images)}")
    print()
    print("  DAFTAR KELAS (tekan angka untuk memilih):")
    for i, name in enumerate(CLASS_NAMES):
        print(f"    {i}: {name}")
    print()
    print("  KONTROL:")
    print("    Klik & Drag = Gambar bounding box")
    print("    0-9         = Pilih kelas atribut")
    print("    s           = Save & next image")
    print("    z           = Undo box terakhir")
    print("    n           = Skip image (next)")
    print("    q           = Quit")
    print("=" * 60)

    # ── Pastikan folder tujuan ada ──
    TRAIN_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    TRAIN_LABELS_DIR.mkdir(parents=True, exist_ok=True)

    # ── Hapus label cache agar YOLO baca ulang ──
    cache_file = DATASET_DIR / "train" / "labels.cache"
    if cache_file.exists():
        cache_file.unlink()
        print("[INFO] labels.cache dihapus (akan di-regenerasi saat training)")

    cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)
    cv2.setMouseCallback(WINDOW_NAME, mouse_callback)

    saved_count = 0

    for idx, img_path in enumerate(images):
        print(f"\n── Gambar {idx + 1}/{len(images)}: {img_path.name} ──")

        original_image = cv2.imread(str(img_path))
        if original_image is None:
            print(f"  ⚠️ Gagal membaca gambar, skip.")
            continue

        # Resize untuk tampilan jika terlalu besar
        img_h, img_w = original_image.shape[:2]
        max_display = 900
        if max(img_h, img_w) > max_display:
            scale = max_display / max(img_h, img_w)
            original_image = cv2.resize(original_image,
                                        (int(img_w * scale), int(img_h * scale)))
            print(f"  📐 Diresize ke {original_image.shape[1]}x{original_image.shape[0]} untuk tampilan")

        boxes = []
        current_class = 2  # default: kemeja_benar

        while True:
            display = draw_ui(original_image)
            cv2.imshow(WINDOW_NAME, display)

            key = cv2.waitKey(30) & 0xFF

            # Angka 0-9 → pilih kelas
            if ord('0') <= key <= ord('9'):
                current_class = key - ord('0')
                print(f"  🔄 Kelas aktif: [{current_class}] {CLASS_NAMES[current_class]}")

            # 's' → Save & next
            elif key == ord('s'):
                if boxes:
                    save_annotation(img_path, original_image)
                    saved_count += 1
                    print(f"  ✅ SAVED! ({saved_count} gambar total)")
                else:
                    print(f"  ⚠️ Belum ada box, tidak disave.")
                break

            # 'z' → Undo
            elif key == ord('z'):
                if boxes:
                    removed = boxes.pop()
                    print(f"  ↩️ Undo: {CLASS_NAMES[removed[0]]}")
                else:
                    print(f"  ⚠️ Tidak ada box untuk di-undo.")

            # 'n' → Skip
            elif key == ord('n'):
                print(f"  ⏭️ Skipped.")
                break

            # 'q' → Quit
            elif key == ord('q'):
                print(f"\n[INFO] Keluar. Total disave: {saved_count} gambar.")
                cv2.destroyAllWindows()
                if saved_count > 0:
                    print(f"\n{'=' * 60}")
                    print(f"  ✅ {saved_count} gambar berhasil ditambahkan ke dataset!")
                    print(f"  📁 Lokasi: {TRAIN_IMAGES_DIR}")
                    print(f"")
                    print(f"  LANGKAH SELANJUTNYA:")
                    print(f"    python train_model.py")
                    print(f"  untuk melatih ulang model dengan data baru.")
                    print(f"{'=' * 60}")
                return

    cv2.destroyAllWindows()

    print(f"\n{'=' * 60}")
    print(f"  SELESAI! {saved_count}/{len(images)} gambar berhasil dilabel & disimpan.")
    print(f"  📁 Gambar: {TRAIN_IMAGES_DIR}")
    print(f"  📁 Label:  {TRAIN_LABELS_DIR}")
    print(f"")
    if saved_count > 0:
        print(f"  LANGKAH SELANJUTNYA:")
        print(f"    python train_model.py")
        print(f"  untuk melatih ulang model dengan data baru.")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()

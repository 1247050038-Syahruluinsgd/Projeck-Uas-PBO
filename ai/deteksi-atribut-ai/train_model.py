"""
train_model.py (VERSI FINAL v3 - gunakan dataset lokal SIPMA-3)

Script ini melakukan training model YOLOv8 menggunakan dataset SIPMA-3
yang sudah ada di folder lokal.

Dataset SIPMA-3 memiliki 10 kelas:
  - celana_benar, celana_salah
  - kemeja_benar, kemeja_salah
  - kerudung_benar, kerudung_salah
  - nametag_ada
  - rok_benar, rok_salah
  - sabuk_ada

CARA PAKAI:
1. pip install ultralytics
2. python train_model.py
3. Tunggu sampai training selesai (bisa 30-60 menit tergantung CPU/GPU)
4. Model hasil training otomatis disalin ke: best.pt (root folder)
"""

import shutil
from pathlib import Path

import yaml
from ultralytics import YOLO


# ============================================
# KONFIGURASI
# ============================================
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "SIPMA-3"
DATA_YAML = DATASET_DIR / "data.yaml"
OUTPUT_BEST_PT = BASE_DIR / "best.pt"

# Parameter training
EPOCHS = 100        # Lebih banyak epoch = lebih akurat
IMG_SIZE = 512      # Sesuai preprocessing Roboflow
BATCH_SIZE = 8      # Sesuaikan dengan RAM/VRAM kamu


# ============================================
# STEP 1: Perbaiki path di data.yaml agar absolut
# ============================================
def fix_data_yaml():
    """Perbarui path train/val/test di data.yaml ke path absolut."""
    print(f"[INFO] Memperbaiki path di {DATA_YAML}...")

    with open(DATA_YAML, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    # Set path absolut
    data["train"] = str(DATASET_DIR / "train" / "images")
    data["val"] = str(DATASET_DIR / "valid" / "images")
    data["test"] = str(DATASET_DIR / "test" / "images")

    # Simpan kembali
    fixed_yaml = BASE_DIR / "data_fixed.yaml"
    with open(fixed_yaml, "w", encoding="utf-8") as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True)

    print(f"[INFO] data.yaml diperbaiki → {fixed_yaml}")
    print(f"[INFO] Kelas yang akan dideteksi ({data['nc']} kelas):")
    for i, name in enumerate(data["names"]):
        print(f"       {i}: {name}")

    return str(fixed_yaml)


# ============================================
# STEP 2: Training model
# ============================================
def train():
    """Jalankan training YOLOv8 dengan dataset SIPMA-3."""
    data_yaml_path = fix_data_yaml()

    print("\n" + "=" * 60)
    print("  MEMULAI TRAINING MODEL")
    print("=" * 60)
    print(f"  Dataset  : {DATASET_DIR}")
    print(f"  Epochs   : {EPOCHS}")
    print(f"  Img Size : {IMG_SIZE}")
    print(f"  Batch    : {BATCH_SIZE}")
    print("=" * 60 + "\n")

    # Load model dasar pretrained
    model = YOLO("yolov8n.pt")

    # Mulai training
    results = model.train(
        data=data_yaml_path,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        name="deteksi_atribut",
        patience=20,       # Early stopping jika tidak ada perbaikan
        save=True,
        verbose=True,
    )

    print("\n[INFO] Training selesai!")

    # Cari best.pt hasil training
    best_pt_candidates = sorted(
        Path("runs/detect").glob("deteksi_atribut*/weights/best.pt"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )

    if best_pt_candidates:
        latest_best = best_pt_candidates[0]
        print(f"[INFO] Model terbaik ditemukan: {latest_best}")

        # Salin ke root folder agar detection_api.py bisa langsung pakai
        shutil.copy2(latest_best, OUTPUT_BEST_PT)
        print(f"[INFO] Model disalin ke: {OUTPUT_BEST_PT}")
        print(f"\n✅ Sekarang kamu bisa langsung jalankan detection_api.py!")
        print(f"   Model akan otomatis mendeteksi 10 kelas atribut.")
    else:
        print("[ERROR] File best.pt tidak ditemukan setelah training!")
        print("[ERROR] Cek folder runs/detect/ untuk detail.")


if __name__ == "__main__":
    train()

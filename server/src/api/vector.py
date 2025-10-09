# src/api/vector.py
import os
import pickle
from typing import List, Tuple
import numpy as np
import torch
import clip
from PIL import Image
import faiss

# --- START OF MODIFICATIONS ---

# 1. DEFINE THE PERSISTENT STORAGE DIRECTORY
#    This is the '/data' directory that we mount in the fly.toml configuration.
#    It is the gateway to our permanent disk storage.
PERSISTENT_STORAGE_PATH = "/data"

# 2. CREATE THE DIRECTORY IF IT DOESN'T EXIST
#    This ensures our code doesn't fail if the directory is not yet created on a fresh volume.
os.makedirs(PERSISTENT_STORAGE_PATH, exist_ok=True)

# 3. UPDATE THE FILE PATHS TO USE THE PERSISTENT STORAGE
#    All generated files (FAISS index, metadata, and the AI model cache)
#    will now be saved to the permanent disk volume.
INDEX_FILE = os.path.join(PERSISTENT_STORAGE_PATH, "image_index.faiss")
META_FILE = os.path.join(PERSISTENT_STORAGE_PATH, "image_paths.pkl")
CLIP_CACHE_DIR = os.path.join(PERSISTENT_STORAGE_PATH, "clip_cache")

# The DATA_DIR is still read from the local application code, not persistent storage.
# This assumes you are deploying the images in the imgdata folder with your code.
DATA_DIR = "imgdata" 

# 4. LOAD THE CLIP MODEL AND TELL IT TO USE THE PERSISTENT DISK FOR ITS CACHE
#    On the first run, this will download the model to the /data/clip_cache directory.
#    On all subsequent runs, it will load the model instantly from the disk.
print("--- Initializing CLIP Model ---")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
print(f"Using persistent cache for CLIP model at: {CLIP_CACHE_DIR}")
_model, _preprocess = clip.load("ViT-B/32", device=device, download_root=CLIP_CACHE_DIR)
print("--- CLIP Model Initialized Successfully ---")

# --- END OF MODIFICATIONS ---


# Global FAISS index + metadata
_index = None
_image_paths: List[str] = []


def _get_embedding(image_path: str) -> np.ndarray:
    """Convert image to CLIP embedding."""
    image = _preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = _model.encode_image(image)
    return embedding.cpu().numpy().astype("float32")


def build_index(save: bool = True) -> None:
    """Build FAISS index from all images in data folder."""
    global _index, _image_paths
    print(f"Building FAISS index from images in: {DATA_DIR}")
    _image_paths = [
        os.path.join(DATA_DIR, f)
        for f in os.listdir(DATA_DIR)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    if not _image_paths:
        raise RuntimeError(f"No images found in {DATA_DIR}/ folder. Ensure images are present in the repository.")

    print(f"Found {len(_image_paths)} images to index.")
    embeddings = [_get_embedding(p) for p in _image_paths]
    embeddings = np.vstack(embeddings)

    d = embeddings.shape[1]
    _index = faiss.IndexFlatL2(d)
    _index.add(embeddings)
    print("FAISS index built successfully.")

    if save:
        save_index()


def save_index() -> None:
    """Persist FAISS index and metadata to the persistent disk."""
    if _index is None:
        raise RuntimeError("No index to save. Build it first.")
    
    print(f"Saving FAISS index to: {INDEX_FILE}")
    faiss.write_index(_index, INDEX_FILE)
    print(f"Saving metadata to: {META_FILE}")
    with open(META_FILE, "wb") as f:
        pickle.dump(_image_paths, f)
    print("Index and metadata saved successfully.")


def load_index() -> None:
    """Load FAISS index and metadata from the persistent disk if available."""
    global _index, _image_paths
    if not (os.path.exists(INDEX_FILE) and os.path.exists(META_FILE)):
        print("No saved index found on the persistent volume.")
        raise RuntimeError("No saved index found. Build it first.")

    print(f"Loading FAISS index from: {INDEX_FILE}")
    _index = faiss.read_index(INDEX_FILE)
    print(f"Loading metadata from: {META_FILE}")
    with open(META_FILE, "rb") as f:
        _image_paths = pickle.load(f)
    print("Index and metadata loaded successfully from persistent storage.")


def find_similar(image_path: str, top_k: int = 5) -> List[Tuple[str, float]]:
    """
    Find top_k similar images from the dataset.
    Returns list of (image_path, distance).
    """
    global _index
    if _index is None:
        try:
            # First, try to load the pre-built index from disk
            load_index()
        except RuntimeError:
            # If it doesn't exist, build it for the first time
            print("Index not found on disk, building it now...")
            build_index()

    query_vec = _get_embedding(image_path)
    distances, indices = _index.search(query_vec, top_k)

    results = []
    for idx, dist in zip(indices[0], distances[0]):
        results.append((_image_paths[idx], float(dist)))

    return results
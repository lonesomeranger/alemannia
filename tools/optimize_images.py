from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "assets"

PHOTOS = {
    "Ball.png": "ball",
    "Kommerz.png": "kommerz",
    "Hausfront.png": "hausfront",
    "garten.png": "garten",
    "gemeinschaftszimmer.png": "gemeinschaftszimmer",
    "zimmer1.png": "zimmer",
    "PXL_20260614_052443873.jpg": "hausfront-original",
    "PXL_20260613_085346785(1).jpg": "garten-original",
    "PXL_20260613_082859878.MP(1).jpg": "gemeinschaftszimmer-original",
}

GRAPHICS = {
    "alemannia-wortmarke.png": ("wordmark", 800),
    "wappen-freigestellt.png": ("wappen", 480),
    "Zirkel_alt_klein.png": ("zirkel", 620),
}


def resized(image: Image.Image, width: int) -> Image.Image:
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def save_webp(image: Image.Image, target: Path, *, lossless: bool) -> None:
    options = {"format": "WEBP", "method": 6, "lossless": lossless}
    if not lossless:
        options["quality"] = 82
    if image.info.get("icc_profile"):
        options["icc_profile"] = image.info["icc_profile"]
    image.save(target, **options)


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)

    for source_name, stem in PHOTOS.items():
        with Image.open(ROOT / source_name) as image:
            image = image.convert("RGB")
            for width in (720, 1440):
                save_webp(resized(image, width), OUTPUT / f"{stem}-{width}.webp", lossless=False)

    for source_name, (stem, width) in GRAPHICS.items():
        with Image.open(ROOT / source_name) as image:
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA")
            save_webp(resized(image, width), OUTPUT / f"{stem}-{width}.webp", lossless=True)


if __name__ == "__main__":
    main()

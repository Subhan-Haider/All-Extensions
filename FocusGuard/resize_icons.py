from PIL import Image
import os

input_path = r"C:/Users/setup/.gemini/antigravity/brain/a4113f4a-6123-4689-b4de-e263af9e490d/site_blocker_logo_1769733831859.png"
output_dir = r"c:/Users/setup/Videos/ext5/4/icons"

sizes = [16, 48, 128]

def resize_icon(size):
    with Image.open(input_path) as img:
        # Chrome extension icons should be square and have transparency if possible.
        # The generated image has a white background. I might want to remove it, 
        # but for now, I'll just resize.
        img = img.resize((size, size), Image.Resampling.LANCZOS)
        img.save(os.path.join(output_dir, f"icon{size}.png"))
        print(f"Generated icon{size}.png")

if __name__ == "__main__":
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    for size in sizes:
        resize_icon(size)

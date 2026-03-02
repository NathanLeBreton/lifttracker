#!/usr/bin/env python3
# Génère des icônes PNG placeholder pour la PWA
from PIL import Image, ImageDraw, ImageFont
import os

def make_icon(size, path):
    img = Image.new('RGB', (size, size), '#0d0d14')
    draw = ImageDraw.Draw(img)
    
    # Background circle
    margin = size // 8
    draw.ellipse([margin, margin, size-margin, size-margin], fill='#1a1a2e')
    
    # "LT" text
    font_size = size // 3
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', font_size)
    except:
        font = ImageFont.load_default()
    
    text = "LT"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), text, fill='#a78bfa', font=font)
    
    img.save(path)
    print(f"Created {path}")

os.makedirs('public', exist_ok=True)
make_icon(192, 'public/icon-192.png')
make_icon(512, 'public/icon-512.png')

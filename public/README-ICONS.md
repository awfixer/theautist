# Icon Generation Instructions

This directory needs the following icon files to be generated:

## Required Files:
- `favicon.ico` (16x16, 32x32, 48x48 sizes)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `og-image.png` (1200x630)

## Generation Methods:

### Option 1: Using online tools
1. Visit https://realfavicongenerator.net/
2. Upload a high-resolution logo/icon
3. Download and extract all generated files to this directory

### Option 2: Using ImageMagick (if installed)
```bash
# Create a base 512x512 image first, then resize
convert -size 512x512 xc:black -fill white -pointsize 400 -gravity center -annotate +0+0 "A" base-icon.png

# Generate all required sizes
convert base-icon.png -resize 16x16 favicon-16x16.png
convert base-icon.png -resize 32x32 favicon-32x32.png
convert base-icon.png -resize 180x180 apple-touch-icon.png
convert base-icon.png -resize 192x192 android-chrome-192x192.png
convert base-icon.png -resize 512x512 android-chrome-512x512.png

# Create ICO file
convert favicon-16x16.png favicon-32x32.png favicon.ico
```

### Option 3: Using Node.js with sharp
```bash
npm install sharp
node generate-icons.js
```

## Open Graph Image
Create a 1200x630 image with:
- Background: #000000 (black)
- Title: "theautist.me" (white, large font)
- Subtitle: "Developer Portfolio & Projects"
- Additional text: "AWFixerOS Engineering • Innovative Tech Solutions"

The temporary file `generate-og-image.html` can be opened in a browser to create this image.
# Extension Icons

Generate PNG icons from the icon.svg file:

Using ImageMagick:
```bash
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

Or use an online tool like https://cloudconvert.com/svg-to-png

The icons should be:
- icon16.png - 16x16 pixels
- icon48.png - 48x48 pixels
- icon128.png - 128x128 pixels

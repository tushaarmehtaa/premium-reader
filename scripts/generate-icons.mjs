import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../apps/extension/public/icons');

// Read the SVG file
const svgPath = join(iconsDir, 'icon.svg');
const svgBuffer = readFileSync(svgPath);

// Generate icons at different sizes
const sizes = [16, 48, 128];

async function generateIcons() {
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `icon${size}.png`));
    
    console.log(`✓ Generated icon${size}.png`);
  }
  console.log('\n🎉 All extension icons generated successfully!');
}

generateIcons().catch(console.error);

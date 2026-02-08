import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SIZES = [192, 512];
const INPUT_FILE = path.resolve('public/icons/icon-512.svg'); // Use the larger one as source
const OUTPUT_DIR = path.resolve('public/icons');

const generateIcons = async () => {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Input file not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  for (const size of SIZES) {
    const outputFile = path.join(OUTPUT_DIR, `icon-${size}.png`);
    try {
      await sharp(INPUT_FILE)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      console.log(`Generated: ${outputFile}`);
    } catch (error) {
      console.error(`Error generating ${size}px icon:`, error);
    }
  }

  // Generate apple-touch-icon
  const appleIcon = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
  try {
    await sharp(INPUT_FILE)
      .resize(180, 180) // Standard size for Apple Touch Icon
      .png()
      .toFile(appleIcon);
    console.log(`Generated: ${appleIcon}`);
  } catch (error) {
    console.error('Error generating apple-touch-icon:', error);
  }
};

generateIcons();

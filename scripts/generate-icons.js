/* eslint-env node */
/* eslint-disable no-undef */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets/images');
const outputDir = assetsDir;

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertSvgToPng(svgPath, pngPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`✅ Generated: ${path.basename(pngPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Error generating ${path.basename(pngPath)}:`, error.message);
  }
}

async function generateIcons() {
  console.log('🎨 Generating app icons...\n');

  // Main icon (1024x1024)
  await convertSvgToPng(
    path.join(assetsDir, 'icon-template.svg'),
    path.join(outputDir, 'icon.png'),
    1024
  );

  // Adaptive icon background (1024x1024)
  await convertSvgToPng(
    path.join(assetsDir, 'adaptive-icon-background.svg'),
    path.join(outputDir, 'adaptive-icon-background.png'),
    1024
  );

  // Adaptive icon foreground (1024x1024)
  await convertSvgToPng(
    path.join(assetsDir, 'adaptive-icon-foreground.svg'),
    path.join(outputDir, 'adaptive-icon-foreground.png'),
    1024
  );

  // Favicon for web (48x48)
  await convertSvgToPng(
    path.join(assetsDir, 'icon-template.svg'),
    path.join(outputDir, 'favicon.png'),
    48
  );

  console.log('\n✨ Icon generation complete!');
}

generateIcons().catch(console.error);

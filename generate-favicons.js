const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'chatcard-logo-white.svg');
const publicDir = path.join(__dirname, 'public');

const sizes = [
  { size: 16, name: 'favicon-16.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 48, name: 'favicon-48.png' },
  { size: 64, name: 'favicon-64.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function generateFavicons() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const { size, name } of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  
  // Create favicon.ico from 16x16 and 32x32
  try {
    const favicon16 = await sharp(path.join(publicDir, 'favicon-16.png')).toBuffer();
    const favicon32 = await sharp(path.join(publicDir, 'favicon-32.png')).toBuffer();
    
    // For ICO, we'll just copy the 32x32 as favicon.ico (simplified)
    // Most systems will accept a PNG renamed to .ico
    fs.copyFileSync(path.join(publicDir, 'favicon-32.png'), path.join(publicDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico');
  } catch (error) {
    console.error('✗ Failed to generate favicon.ico:', error.message);
  }
}

generateFavicons().catch(console.error);


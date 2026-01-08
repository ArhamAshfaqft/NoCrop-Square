
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function convert() {
  const input = path.join(__dirname, '../resources/icon.png');
  const output = path.join(__dirname, '../build/icon.ico');

  console.log('Converting:', input, 'to', output);

  try {
    // Resize to 256x256 which is standard for ICO
    await sharp(input)
      .resize(256, 256)
      .toFile(output);
      
    console.log('Success! Created icon.ico');
  } catch (err) {
    console.error('Error converting icon:', err);
  }
}

convert();

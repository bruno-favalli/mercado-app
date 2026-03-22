import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';

const sizes = [192, 512];

mkdirSync('src/assets/icons', { recursive: true });

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fundo verde
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(0, 0, size, size);

  // Círculo central mais claro
  ctx.fillStyle = '#388e3c';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // Texto MM
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.28}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MM', size / 2, size / 2);

  writeFileSync(`src/assets/icons/icon-${size}x${size}.png`, canvas.toBuffer('image/png'));
  console.log(`✓ icon-${size}x${size}.png gerado`);
}
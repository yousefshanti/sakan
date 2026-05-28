// Run with: node generate-icons.js
// Generates SVG icon files for the PWA
const fs = require('fs');

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0d9488"/>
  <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="${size * 0.55}" fill="white">🏠</text>
</svg>`;

fs.writeFileSync('icon-192.svg', svg(192));
fs.writeFileSync('icon-512.svg', svg(512));
console.log('Icons generated');

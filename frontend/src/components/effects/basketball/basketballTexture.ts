
import * as THREE from 'three';

export const createBasketballTexture = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 1024;

  if (ctx) {
    // Create radial gradient for depth
    const gradient = ctx.createRadialGradient(400, 300, 50, 512, 512, 500);
    gradient.addColorStop(0, '#B8621F'); // Lighter orange in center
    gradient.addColorStop(0.6, '#8B4513'); // Main dark orange
    gradient.addColorStop(1, '#5D2F0A'); // Darker edges

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // Add basketball seam pattern
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    // Main vertical seams
    ctx.beginPath();
    ctx.moveTo(512, 0);
    ctx.lineTo(512, 1024);
    ctx.stroke();

    // Horizontal center seam
    ctx.beginPath();
    ctx.moveTo(0, 512);
    ctx.lineTo(1024, 512);
    ctx.stroke();

    // Curved seams for authentic basketball look
    ctx.beginPath();
    ctx.arc(512, 512, 300, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(512, 512, 200, 0, Math.PI * 2);
    ctx.stroke();

    // Add smaller curved lines for detail
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = 512 + Math.cos(angle) * 100;
      const y1 = 512 + Math.sin(angle) * 100;
      const x2 = 512 + Math.cos(angle) * 250;
      const y2 = 512 + Math.sin(angle) * 250;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Add realistic texture dots for grip
    ctx.fillStyle = '#3D1A07';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add subtle brand color highlights
    ctx.fillStyle = 'rgba(247, 208, 70, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

import React, { useEffect, useRef } from 'react';

function PortfolioBlobs() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();

    const blobs = [
      { x: 100, y: 150, baseR: 50, color: '#10b981' },
      { x: 250, y: 120, baseR: 40, color: '#10b981' },
      { x: 400, y: 180, baseR: 35, color: '#ef4444' },
      { x: 550, y: 140, baseR: 45, color: '#10b981' }
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      blobs.forEach((blob, i) => {
        blob.y += Math.sin(time * 0.02 + i) * 0.3;
        blob.r = blob.baseR + Math.sin(time * 0.03 + i * 100) * 5;

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
        gradient.addColorStop(0, blob.color + 'dd');
        gradient.addColorStop(1, blob.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fill();
      });

      time++;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '300px', borderRadius: '16px' }} />;
}

export default PortfolioBlobs;

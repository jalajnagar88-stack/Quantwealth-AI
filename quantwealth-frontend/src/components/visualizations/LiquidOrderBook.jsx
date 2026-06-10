import React, { useEffect, useRef } from 'react';

function LiquidOrderBook() {
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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const midX = width / 2;

      // Buy side (green)
      const buyHeight = height * 0.6;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= midX; x += 10) {
        const y = height - (buyHeight + Math.sin(x * 0.03 + time * 0.05) * 30);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(midX, height);
      ctx.fill();

      // Sell side (red)
      const sellHeight = height * 0.4;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.moveTo(midX, height);
      for (let x = midX; x <= width; x += 10) {
        const y = height - (sellHeight + Math.cos(x * 0.03 + time * 0.05) * 25);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.fill();

      time++;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '300px', borderRadius: '16px' }} />;
}

export default LiquidOrderBook;

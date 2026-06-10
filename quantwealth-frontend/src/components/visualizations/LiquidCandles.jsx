import React, { useEffect, useRef } from 'react';

function LiquidCandles({ stock = 'TCS' }) {
  const canvasRef = useRef(null);
  
  const candleData = [50, 56, 60, 59, 62, 65, 68, 64, 67, 72];

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
      const spacing = width / (candleData.length + 1);

      candleData.forEach((price, i) => {
        const x = (i + 1) * spacing;
        const candleHeight = (price / 80) * height * 0.6;
        const liquidLevel = candleHeight * (0.5 + Math.sin(time * 0.03 + i) * 0.2);

        ctx.fillStyle = price > 60 ? '#10b98144' : '#ef444444';
        ctx.fillRect(x - 15, height * 0.5 - candleHeight / 2, 30, candleHeight);

        ctx.fillStyle = price > 60 ? '#10b981' : '#ef4444';
        ctx.fillRect(x - 15, height * 0.5 - liquidLevel / 2 + candleHeight - liquidLevel, 30, liquidLevel);
      });

      time++;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '300px', borderRadius: '16px' }} />;
}

export default LiquidCandles;

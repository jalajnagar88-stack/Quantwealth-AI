import React, { useEffect, useRef } from 'react';

function WealthMeter() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let time = 0;
    const wealthLevel = 0.72; // 72% of max wealth

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
      const containerWidth = width - 60;
      const containerHeight = height - 80;

      // Container outline
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 20, containerWidth, containerHeight);

      // Wealth liquid fill
      const liquidHeight = containerHeight * wealthLevel;
      const gradient = ctx.createLinearGradient(30, 20, 30, 20 + containerHeight);
      gradient.addColorStop(0, '#10b98100');
      gradient.addColorStop(0.5, '#10b98166');
      gradient.addColorStop(1, '#10b981cc');

      ctx.fillStyle = gradient;
      ctx.fillRect(30, 20 + containerHeight - liquidHeight, containerWidth, liquidHeight);

      // Liquid wave effect
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      for (let x = 30; x <= 30 + containerWidth; x += 5) {
        const waveY = 20 + containerHeight - liquidHeight + Math.sin(x * 0.05 + time * 0.05) * 8;
        if (x === 30) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.lineTo(30 + containerWidth, 20 + containerHeight);
      ctx.lineTo(30, 20 + containerHeight);
      ctx.fill();

      // Percentage text
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(wealthLevel * 100)}%`, width / 2, height - 25);

      // Label
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '12px Arial';
      ctx.fillText('Portfolio Wealth Accumulated', width / 2, height - 5);

      time++;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ fontSize: '14px', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Liquid Wealth Accumulation Meter
      </h3>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '300px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)' }}
      />
    </div>
  );
}

export default WealthMeter;

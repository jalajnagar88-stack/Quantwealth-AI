import React, { useEffect, useRef } from 'react';

function RiskGauge() {
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
      const riskLevel = 0.8; // 80% of max risk

      // Container
      ctx.fillStyle = 'rgba(10, 10, 10, 0.5)';
      ctx.fillRect(20, 50, width - 40, 60);

      // Risk bar - gradient from green to red
      const gradient = ctx.createLinearGradient(20, 50, width - 20, 50);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(0.5, '#f97316');
      gradient.addColorStop(1, '#ef4444');

      ctx.fillStyle = gradient;
      ctx.fillRect(20, 50, (width - 40) * riskLevel, 60);

      // Border
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 50, width - 40, 60);

      // Liquid effect
      const baseHeight = 60 * riskLevel;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      for (let x = 20; x <= width - 20; x += 5) {
        const y = 50 + baseHeight + Math.sin(x * 0.05 + time * 0.05) * 8;
        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(width - 20, 110);
      ctx.lineTo(20, 110);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Safe', 30, 140);

      ctx.fillStyle = '#f97316';
      ctx.textAlign = 'center';
      ctx.fillText('Warning', width / 2, 140);

      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'right';
      ctx.fillText('Danger', width - 30, 140);

      // Risk percentage
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`${Math.round(riskLevel * 100)}%`, width / 2, 35);

      time++;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ fontSize: '14px', marginBottom: '1rem', color: 'var(--text-primary)' }}>Daily Risk Gauge</h3>
      <canvas ref={canvasRef} style={{ width: '100%', height: '200px', borderRadius: '16px' }} />
    </div>
  );
}

export default RiskGauge;

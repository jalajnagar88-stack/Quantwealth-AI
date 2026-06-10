import React, { useEffect, useRef } from 'react';

function TradeExecutionBurst() {
  const canvasRef = useRef(null);
  const burstRef = useRef([]);

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

    const createBurst = () => {
      const isBuy = Math.random() > 0.5;
      const burst = {
        x: canvas.offsetWidth * 0.3,
        y: canvas.offsetHeight * (isBuy ? 0.3 : 0.7),
        particles: Array.from({ length: 20 }, () => ({
          x: 0,
          y: 0,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1
        })),
        isBuy,
        destinationX: canvas.offsetWidth * 0.85,
        destinationY: canvas.offsetHeight * 0.5
      };
      burstRef.current.push(burst);
    };

    const interval = setInterval(createBurst, 2000);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      burstRef.current = burstRef.current.filter(burst => {
        burst.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
        });

        burst.particles.forEach(p => {
          if (p.life > 0) {
            const color = burst.isBuy ? 'rgba(16, 185, 129,' : 'rgba(239, 68, 68,';
            const gradient = ctx.createRadialGradient(
              burst.x + p.x,
              burst.y + p.y,
              0,
              burst.x + p.x,
              burst.y + p.y,
              6
            );
            gradient.addColorStop(0, color + (p.life * 0.8) + ')');
            gradient.addColorStop(1, color + '0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(burst.x + p.x, burst.y + p.y, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        return burst.particles.some(p => p.life > 0);
      });

      time++;
      requestAnimationFrame(animate);
    };

    animate();

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ fontSize: '14px', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Trade Execution Visualization
      </h3>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '250px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)' }}
      />
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
        Particles burst on trade execution • Green = BUY • Red = SELL
      </div>
    </div>
  );
}

export default TradeExecutionBurst;

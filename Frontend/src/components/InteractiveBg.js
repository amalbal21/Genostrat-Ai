'use client';
import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 140;
const CONNECTION_DIST = 120;
const REPULSION_DIST = 70;         // Repulsion zone
const MOUSE_ATTRACT_DIST = 190;    // Attraction zone
const MOUSE_LINE_DIST = 260;
const MAX_RIPPLES = 12;            // To allow multiple rings per click
const MOUSE_LERP = 0.15;
const TRAIL_LENGTH = 28;

// Colors
const P1 = '8,12,20';       // near-black primary
const P2 = '37,99,235';     // electric blue secondary
const P3 = '100,130,180';   // blue-grey accent

export default function InteractiveBg() {
  const canvasRef = useRef(null);
  const rawMouseRef = useRef({ x: null, y: null });
  const lerpMouseRef = useRef({ x: null, y: null });
  const mouseTrailRef = useRef([]);
  const particlesRef = useRef([]);
  const ripplesRef = useRef([]);
  const auroraBlobs = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize aurora drifting blobs with absolute coords upon resize (if empty)
      if (auroraBlobs.current.length === 0) {
        auroraBlobs.current = [
          { x: canvas.width * 0.2, y: canvas.height * 0.2, vx: 0.3, vy: -0.2, r: 0.4 },
          { x: canvas.width * 0.8, y: canvas.height * 0.8, vx: -0.25, vy: 0.3, r: 0.36 },
          { x: canvas.width * 0.5, y: canvas.height * 0.1, vx: 0.2, vy: 0.35, r: 0.27 },
          { x: canvas.width * 0.8, y: canvas.height * 0.2, vx: -0.3, vy: -0.2, r: 0.3 }
        ];
      }
    };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.6 + 0.6,
      phase: (i / PARTICLE_COUNT) * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.15,
      color: Math.random() < 0.70 ? P1 : Math.random() < 0.66 ? P2 : P3,
    }));

    const handleMouseMove = (e) => {
      rawMouseRef.current = { x: e.clientX, y: e.clientY };
      if (lerpMouseRef.current.x === null)
        lerpMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseLeave = () => { 
      rawMouseRef.current = { x: null, y: null }; 
    };

    const handleClick = (e) => {
      // Create 3 concentric shockwave rings per click with different parameters
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.5, speed: 6.5, width: 2.0, color: '37,99,235' });
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.3, speed: 4.5, width: 3.5, color: '100,130,180' });
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.7, speed: 9.0, width: 1.0, color: '14,165,233' });
      
      // Shockwave Blast Physics: Repel particles strongly outward, physics loop brings them back
      particlesRef.current.forEach(p => {
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300 && dist > 0) {
          const blast = ((300 - dist) / 300) * 16;
          p.vx += (dx / dist) * blast;
          p.vy += (dy / dist) * blast;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    let tick = 0;

    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lerp mouse
      const raw = rawMouseRef.current;
      const lerp = lerpMouseRef.current;
      if (raw.x !== null) {
        lerp.x += (raw.x - lerp.x) * MOUSE_LERP;
        lerp.y += (raw.y - lerp.y) * MOUSE_LERP;
      }
      const mouse = raw.x !== null ? lerp : { x: null, y: null };

      const aw = canvas.width;
      const ah = canvas.height;

      // 1. Aurora Breathing Blobs Drifting
      const breathe = 0.5 + Math.sin(tick * 0.006) * 0.5;
      auroraBlobs.current.forEach(b => {
         b.x += b.vx;
         b.y += b.vy;
         if (b.x < -aw * 0.2 || b.x > aw * 1.2) b.vx *= -1;
         if (b.y < -ah * 0.2 || b.y > ah * 1.2) b.vy *= -1;
         
         const rMax = Math.max(aw, ah) * b.r;
         const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rMax);
         const alpha = 0.02 + breathe * 0.015;
         g.addColorStop(0, `rgba(37,99,235,${alpha})`);
         g.addColorStop(0.5, `rgba(37,99,235,${alpha * 0.15})`);
         g.addColorStop(1, 'rgba(37,99,235,0)');
         ctx.beginPath();
         ctx.arc(b.x, b.y, rMax, 0, Math.PI * 2);
         ctx.fillStyle = g;
         ctx.fill();
      });

      const particles = particlesRef.current;

      // 2. Physics & Particle Updates
      for (const p of particles) {
        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 0) {
            if (dist < REPULSION_DIST) {
               // Magnetic Repulsion Zone
               const force = ((REPULSION_DIST - dist) / REPULSION_DIST) * 1.6;
               p.vx += (dx / dist) * force;
               p.vy += (dy / dist) * force;
            } else if (dist < MOUSE_ATTRACT_DIST) {
               // Magnetic Attraction Zone
               const force = ((MOUSE_ATTRACT_DIST - dist) / (MOUSE_ATTRACT_DIST - REPULSION_DIST)) * 0.09;
               p.vx -= (dx / dist) * force;
               p.vy -= (dy / dist) * force;
            }
          }
        }
        
        // Dampening/Friction
        p.vx *= 0.94; 
        p.vy *= 0.94;
        
        // Velocity Cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2.5) { 
          p.vx = (p.vx / spd) * 2.5; 
          p.vy = (p.vy / spd) * 2.5; 
        }
        
        p.x += p.vx; 
        p.y += p.vy;
        
        // Screen Wrap
        if (p.x < -10) p.x = aw + 10;
        if (p.x > aw + 10) p.x = -10;
        if (p.y < -10) p.y = ah + 10;
        if (p.y > ah + 10) p.y = -10;
      }

      // 3. Constellation Web Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CONNECTION_DIST) {
            let t = 1 - dist / CONNECTION_DIST;
            let mouseBoost = 0;
            
            // Highlight connections near mouse
            if (mouse.x !== null) {
              const mx = (particles[i].x + particles[j].x) / 2;
              const my = (particles[i].y + particles[j].y) / 2;
              const mDist = Math.hypot(mx - mouse.x, my - mouse.y);
              if (mDist < MOUSE_LINE_DIST) {
                 mouseBoost = 1 - (mDist / MOUSE_LINE_DIST);
              }
            }
            
            t += mouseBoost * 1.8;
            const alpha = Math.min(t * t * 0.12, 0.7);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${P1},${alpha})`;
            ctx.lineWidth = t * 0.8;
            ctx.stroke();
          }
        }
      }

      // 4. Mouse Features (Web Lines, Trail, Cursor, Halo)
      if (mouse.x !== null) {
        // Dynamic Glowing Connections (Web lines to cursor)
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_LINE_DIST) {
            const t = 1 - dist / MOUSE_LINE_DIST;
            const alpha = t * t * 0.65;
            const grad = ctx.createLinearGradient(p.x, p.y, mouse.x, mouse.y);
            
            // 3-stop gradient: Muted -> Blue -> Electric Blue
            grad.addColorStop(0, `rgba(100,130,180,${alpha * 0.15})`);
            grad.addColorStop(0.5, `rgba(37,99,235,${alpha * 0.5})`);
            grad.addColorStop(1, `rgba(14,165,233,${alpha})`);
            
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = t * 2.2;
            ctx.stroke();
          }
        }

        // Fluid Particle Trail
        mouseTrailRef.current.unshift({ x: mouse.x, y: mouse.y });
        if (mouseTrailRef.current.length > TRAIL_LENGTH) {
            mouseTrailRef.current.pop();
        }
      } else if (mouseTrailRef.current.length > 0) {
        // Fade out trail when cursor stops/leaves
        mouseTrailRef.current.pop();
      }

      // Draw Trail
      const trail = mouseTrailRef.current;
      trail.forEach((pt, idx) => {
          const alpha = 1 - (idx / trail.length);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(0.2, 3.5 - idx * 0.12), 0, Math.PI*2);
          ctx.fillStyle = `rgba(14,165,233, ${alpha * 0.9})`;
          ctx.fill();
      });

      // Cursor rendering 
      if (mouse.x !== null) {
        const ps = 5 + Math.sin(tick * 0.055) * 2.2;
        
        // Large Breathing Spotlight Halo
        const haloR = ps * 25; // Large glow
        const hg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, haloR);
        hg.addColorStop(0, `rgba(14,165,233,0.18)`);
        hg.addColorStop(0.3, `rgba(37,99,235,0.06)`);
        hg.addColorStop(1, 'rgba(37,99,235,0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, haloR, 0, Math.PI*2);
        ctx.fillStyle = hg;
        ctx.fill();

        // 3-layer Magnetic Cursor
        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        
        // Layer 1: Solid Inner Ring
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(37,99,235,1)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Layer 2: Crosshair Tick Marks
        ctx.beginPath();
        ctx.moveTo(0, -14); ctx.lineTo(0, -5);
        ctx.moveTo(0, 5); ctx.lineTo(0, 14);
        ctx.moveTo(-14, 0); ctx.lineTo(-5, 0);
        ctx.moveTo(5, 0); ctx.lineTo(14, 0);
        ctx.strokeStyle = 'rgba(14,165,233,0.9)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Layer 3: Rotating Dashed Outer Ring
        ctx.rotate(tick * 0.025);
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI*2);
        ctx.setLineDash([10, 8]);
        ctx.strokeStyle = `rgba(37,99,235,${0.5 + Math.sin(tick*0.06)*0.3})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();
      }

      // 5. Draw Particles
      for (const p of particles) {
        let boost = 1;
        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_ATTRACT_DIST) {
            const t = (MOUSE_ATTRACT_DIST - dist) / MOUSE_ATTRACT_DIST;
            boost = 1 + t * t * 3.5;
          }
        }
        
        const pulse = 0.28 + Math.sin(tick * p.speed * 0.016 + p.phase) * 0.14;
        const alpha = Math.min(pulse * boost, 0.95);
        const r = p.radius * 4.5 * boost;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(${p.color},${alpha * 0.35})`);
        g.addColorStop(0.6, `rgba(${p.color},${alpha * 0.06})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * boost * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha})`;
        ctx.fill();
      }

      // 6. Shockwave Click Ripples
      ripplesRef.current = ripplesRef.current.filter(r => r.alpha > 0.005);
      for (const rp of ripplesRef.current) {
        // Expand the ripples rapidly
        rp.r += rp.speed;
        rp.alpha *= 0.92;
        
        // Concentric ripples
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rp.color},${rp.alpha})`;
        ctx.lineWidth = rp.width;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}

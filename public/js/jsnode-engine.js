/**
 * Saravest Maple Gold JS Node Engine (jsnode-engine.js)
 * Render Royal Gold Nodes & Blueprint Grids matching Maple India aesthetic
 */

(function () {
  'use strict';

  // HERO CANVAS MAPLE GOLD NODE NETWORK
  function initHeroNodeNetwork() {
    const canvas = document.getElementById('jsNodeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let nodes = [];
    let mouse = { x: null, y: null, maxRadius: 220 };

    function resize() {
      width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
      createNodes();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Node {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1.2;
        this.baseAlpha = Math.random() * 0.45 + 0.4;
        this.pulseSpeed = Math.random() * 0.03 + 0.015;
        this.pulseAngle = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        this.pulseAngle += this.pulseSpeed;
      }

      draw() {
        ctx.beginPath();
        const currentRadius = this.radius + Math.sin(this.pulseAngle) * 0.7;
        ctx.arc(this.x, this.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${this.baseAlpha})`;
        ctx.fill();
      }
    }

    function createNodes() {
      nodes = [];
      const count = Math.floor((width * height) / 10000);
      for (let i = 0; i < Math.max(55, count); i++) {
        nodes.push(new Node());
      }
    }

    function connectNodes() {
      const maxDistance = 150;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = nodes[i].x - mouse.x;
          const dy = nodes[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.maxRadius) {
            const alpha = (1 - dist / mouse.maxRadius) * 0.65;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      nodes.forEach((node) => {
        node.update();
        node.draw();
      });
      connectNodes();
      requestAnimationFrame(animate);
    }

    resize();
    animate();
  }

  // GLOBAL SITE BACKGROUND NETWORK & BLUEPRINT GRID IN GOLD
  function initFullSiteBackground() {
    const canvas = document.getElementById('fullSiteBgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let gridPoints = [];
    let mouse = { x: null, y: null, radius: 240 };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class GlobalParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -(Math.random() * 0.4 + 0.15);
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.4 + 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.y < -10) this.y = height + 10;
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`;
        ctx.fill();
      }
    }

    function initElements() {
      particles = [];
      const particleCount = Math.floor((width * height) / 14000);
      for (let i = 0; i < Math.max(40, particleCount); i++) {
        particles.push(new GlobalParticle());
      }

      gridPoints = [];
      const stepX = 220;
      const stepY = 220;
      for (let x = stepX / 2; x < width; x += stepX) {
        for (let y = stepY / 2; y < height; y += stepY) {
          gridPoints.push({ x, y, alpha: 0.15 });
        }
      }
    }

    function drawBlueprintGrid() {
      ctx.lineWidth = 0.6;
      gridPoints.forEach((pt) => {
        ctx.strokeStyle = `rgba(212, 175, 55, ${pt.alpha})`;
        ctx.beginPath();
        ctx.moveTo(pt.x - 6, pt.y);
        ctx.lineTo(pt.x + 6, pt.y);
        ctx.moveTo(pt.x, pt.y - 6);
        ctx.lineTo(pt.x, pt.y + 6);
        ctx.stroke();
      });
    }

    function connectParticles() {
      const maxDist = 135;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      drawBlueprintGrid();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connectParticles();
      requestAnimationFrame(animate);
    }

    resize();
    animate();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeroNodeNetwork();
    initFullSiteBackground();
  });
})();

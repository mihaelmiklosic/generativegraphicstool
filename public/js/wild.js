// wild.js: Futuristic neon particle and skeleton effect using p5 instance mode
const wildSketch = (p) => {
  let particles = [];
  const maxParticles = 2000;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noCursor();
    p.strokeCap(p.ROUND);
    p.rectMode(p.CENTER);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    // trail fade
    p.background(0, 20);
    // neon additive blend
    p.blendMode(p.ADD);

    // draw glowing hand landmarks as neon points
    if (window.handLandmarks) {
      p.noStroke();
      p.fill(0, 200, 255, 150);
      window.handLandmarks.forEach(hand => {
        hand.forEach(lm => {
          const x = lm.x * p.width;
          const y = lm.y * p.height;
          p.circle(x, y, 12);
        });
      });
    }

    // spawn fingertip particles
    if (window.handLandmarks) {
      window.handLandmarks.forEach(hand => {
        [4, 8, 12, 16, 20].forEach(id => {
          const lm = hand[id];
          const x = lm.x * p.width;
          const y = lm.y * p.height;
          for (let i = 0; i < 5; i++) {
            particles.push({ x, y, vx: p.random(-2, 2), vy: p.random(-2, 2), life: p.random(100, 255) });
          }
        });
      });
    }

    // update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      p.stroke(0, 200, 255, pt.life);
      p.strokeWeight(2);
      p.point(pt.x, pt.y);
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 3;
      if (pt.life <= 0 || particles.length > maxParticles) {
        particles.splice(i, 1);
      }
    }

    // pulsing central orb based on hand spread
    if (window.handLandmarks?.length) {
      let sumX = 0, sumY = 0, cnt = 0;
      window.handLandmarks.forEach(hand => hand.forEach(lm => { sumX += lm.x; sumY += lm.y; cnt++; }));
      const avgX = (sumX / cnt) * p.width;
      const avgY = (sumY / cnt) * p.height;
      const d = p.dist(avgX, avgY, p.width/2, p.height/2);
      const maxD = p.dist(0, 0, p.width/2, p.height/2);
      const sz = p.map(d, 0, maxD, 200, 50);
      p.noFill();
      p.stroke(255, 100, 200, 100);
      p.strokeWeight(4);
      p.ellipse(p.width/2, p.height/2, sz);
    }

    // restore default blend
    p.blendMode(p.BLEND);
  };
};

// initialize p5 instance
new p5(wildSketch);
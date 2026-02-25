const ui = document.getElementById('ui');
  const text = 'I love you ';
  const numLines = 60;

  // Heart parametric: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
  // We'll place lines tangent to the heart shape

  for (let i = 0; i < numLines; i++) {
    const t = (i / numLines) * Math.PI * 2;

    // Heart coordinates (scaled)
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

    // Scale to fit container
    const scale = 14;
    const x = hx * scale;
    const y = hy * scale;

    // Angle tangent to heart
    const dt = 0.01;
    const hx2 = 16 * Math.pow(Math.sin(t + dt), 3);
    const hy2 = -(13 * Math.cos(t+dt) - 5 * Math.cos(2*(t+dt)) - 2 * Math.cos(3*(t+dt)) - Math.cos(4*(t+dt)));
    const dx = hx2 - hx;
    const dy = hy2 - hy;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const div = document.createElement('div');
    div.className = 'love_horizontal';

    // Animate between two radii to create breathing effect
    const r1 = Math.sqrt(x*x + y*y);
    const baseAngle = Math.atan2(y, x) * (180 / Math.PI);

    div.style.cssText = `
      --angle: ${baseAngle}deg;
      --r1: ${r1 * 0.92}px;
      --r2: ${r1 * 1.08}px;
      animation-delay: calc(${i} * -300ms);
    `;

    const span = document.createElement('span');
    span.className = 'love_word';
    span.style.transform = `translateY(-50%) rotateZ(${angle - baseAngle - 30}deg)`;
    span.textContent = text.repeat(3);

    div.appendChild(span);
    ui.appendChild(div);
  }
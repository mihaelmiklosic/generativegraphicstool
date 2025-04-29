 let noiseTime = 0;

 let lastNoise = [];

 const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,
   140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,
   247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,
   57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
   74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,
   60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,
   65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,
   200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,
   52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,
   207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,
   119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
   129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,
   218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,
   81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
   184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,
   222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
   // repeat
   151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,
   140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,
   247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,
   57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
   74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,
   60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,
   65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,
   200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,
   52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,
   207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,
   119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
   129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,
   218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,
   81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
   184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,
   222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
 function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
 function lerpJ(t, a, b) { return a + t * (b - a); }
 function grad(hash, x, y, z) {
   const h = hash & 15;
   const u = h < 8 ? x : y;
   const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
   return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
 }
 function noise3(x, y, z) {
   const X = Math.floor(x) & 255;
   const Y = Math.floor(y) & 255;
   const Z = Math.floor(z) & 255;
   x -= Math.floor(x);
   y -= Math.floor(y);
   z -= Math.floor(z);
   const u = fade(x);
   const v = fade(y);
   const w = fade(z);
   const A  = p[X] + Y;
   const AA = p[A] + Z;
   const AB = p[A + 1] + Z;
   const B  = p[X + 1] + Y;
   const BA = p[B] + Z;
   const BB = p[B + 1] + Z;
   return lerpJ(w,
     lerpJ(v,
       lerpJ(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
       lerpJ(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
     ),
     lerpJ(v,
       lerpJ(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
       lerpJ(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))
     )
   );
 }
 function initNoiseHistory() {

   lastNoise = Array(params.cols).fill().map((_, i) =>
     Array(params.rows).fill().map((_, j) =>
       fbm(
         i * params.noiseScale + params.noiseOffsetX,
         j * params.noiseScale + params.noiseOffsetY,
         noiseTime
       )
     )
   );
 }

 function fbm(x, y, z) {
   let total = 0, amplitude = 1, frequency = 1;
   let maxValue = 0;
   for (let o = 0; o < params.noiseOctaves; o++) {
     total += noise3(x * frequency, y * frequency, z * frequency) * amplitude;
     maxValue += amplitude;
     amplitude *= params.noiseFalloff;
     frequency *= 2;
   }
   return total / maxValue;
 }
// Initialize cloth grid
function initCloth() {
  colsCloth = params.cols;
  rowsCloth = params.rows;
  origXStep = width / colsCloth;
  origYStep = height / rowsCloth;
  clothPoints = [];
  clothVels = [];
  for (let i = 0; i < colsCloth; i++) {
    clothPoints[i] = [];
    clothVels[i] = [];
    for (let j = 0; j < rowsCloth; j++) {
      clothPoints[i][j] = createVector(0, 0);
      clothVels[i][j] = createVector(0, 0);
    }
  }
}

// Update cloth physics
function updateCloth() {
  if (typeof window.handNormX === 'undefined') return;
  const handX = window.handNormX * width;
  const handY = window.handNormY * height;
  const stiffness = 0.1;
  const damping = 0.98;
  const handRadius = min(width, height) * 0.25;
  const handStrength = 0.2;
  // new points buffer
  const newPoints = [];
  for (let i = 0; i < colsCloth; i++) {
    newPoints[i] = [];
    for (let j = 0; j < rowsCloth; j++) {
      const offset = clothPoints[i][j];
      const vel = clothVels[i][j];
      // neighbor average
      let sum = createVector(0, 0);
      let count = 0;
      if (i > 0) { sum.add(clothPoints[i-1][j]); count++; }
      if (i < colsCloth - 1) { sum.add(clothPoints[i+1][j]); count++; }
      if (j > 0) { sum.add(clothPoints[i][j-1]); count++; }
      if (j < rowsCloth - 1) { sum.add(clothPoints[i][j+1]); count++; }
      sum.div(count);
      // spring towards neighbor average
      const acc = p5.Vector.sub(sum, offset).mult(stiffness);
      // hand interaction
      const posX = (i + 0.5) * origXStep + offset.x;
      const posY = (j + 0.5) * origYStep + offset.y;
      const d = dist(posX, posY, handX, handY);
      if (d < handRadius) {
        const dir = createVector(handX - posX, handY - posY).normalize();
        const strength = (1 - d / handRadius) * handStrength;
        acc.add(p5.Vector.mult(dir, strength));
      }
      // update velocity and offset
      vel.add(acc);
      vel.mult(damping);
      newPoints[i][j] = p5.Vector.add(offset, vel);
      clothVels[i][j] = vel;
    }
  }
  // commit new points
  for (let i = 0; i < colsCloth; i++) {
    for (let j = 0; j < rowsCloth; j++) {
      clothPoints[i][j] = newPoints[i][j];
    }
  }
}

// Draw the deformed cloth mesh
function drawCloth() {
  background(255);
  noStroke();
  fill(0);
  for (let i = 0; i < colsCloth - 1; i++) {
    for (let j = 0; j < rowsCloth - 1; j++) {
      const x0 = i * origXStep;
      const y0 = j * origYStep;
      const p00 = createVector(x0 + clothPoints[i][j].x, y0 + clothPoints[i][j].y);
      const p10 = createVector((i + 1) * origXStep + clothPoints[i+1][j].x, y0 + clothPoints[i+1][j].y);
      const p11 = createVector((i + 1) * origXStep + clothPoints[i+1][j+1].x,
                                (j + 1) * origYStep + clothPoints[i+1][j+1].y);
      const p01 = createVector(x0 + clothPoints[i][j+1].x,
                                (j + 1) * origYStep + clothPoints[i][j+1].y);
      beginShape();
      vertex(p00.x, p00.y);
      vertex(p10.x, p10.y);
      vertex(p11.x, p11.y);
      vertex(p01.x, p01.y);
      endShape(CLOSE);
    }
  }
}
 let params = {
   rows: 40,
   cols: 40,
   noiseScale: 0.044,
   timeScale: 0.003,
   noiseStrength: 1,

   noiseOctaves: 6,
   noiseFalloff: 0.5,
  // Offset for noise sampling, updated by hand tracking
  noiseOffsetX: 0,
  noiseOffsetY: 0,

   noiseSmooth: 0.6,
   rotationAmount: 168,

   minW: 10,    // 50% of cell width
   maxW: 400,   // 100% of cell width
   minH: 50,    // 50% of cell height
   maxH: 100,   // 100% of cell height
   frameRateVal: 60,
   padding: 10,
   offsetX: 0,
   offsetY: 0,
   duration: 5,
   currentPalette: 0,
   palettes: [
     { bg: '#ED4146', fg1: '#220D9B' },
     { bg: '#25009C', fg1: '#F4BED1' },
     { bg: '#FE5900', fg1: '#000000' },
     { bg: '#b0bcc6', fg1: '#db3c2a' },
     { bg: '#e9b83f', fg1: '#dee0d5' },
     { bg: '#715fa5', fg1: '#000000' },
     {bg:'#411928', fg1:'#C6B4A7'},
     {bg:'#DFDADD', fg1:'#0A3783'},
     {bg:'#FF9C00', fg1:'#DA4930'}

   ],
   shape: 'rect',
   fgMinOpacity: 1,
   fgMaxOpacity: 1
 };
// Cloth simulation variables
let clothMode = false;
let clothPoints = [];
let clothVels = [];
let colsCloth = 0;
let rowsCloth = 0;
let origXStep = 0;
let origYStep = 0;
 let cnv;
 function setup() {
  // Hand-guided grid: full-screen interactive grid
  if (window.handGridMode) {
    cnv = createCanvas(window.innerWidth, window.innerHeight);
    cnv.position(0, 0);
    frameRate(params.frameRateVal);
    rectMode(CENTER);
    // no additional initialization
    return;
  }
  // Default generator setup
  const dims = getCanvasDimensions();
  const w = dims.w;
  const h = dims.h !== undefined ? dims.h : dims.w;
  cnv = createCanvas(w, h);
  frameRate(params.frameRateVal);
  initNoiseHistory();
  noiseTime = 0;
  cnv.parent('canvasContainer');
  setupControls();
 }

function initExportUI() {

 document.querySelectorAll('#btnExportImage, .export-image').forEach(btn => {
   btn.addEventListener('click', () => saveCanvas('generative_grid', 'png'));
 });

 document.querySelectorAll('#btnExportVideo, .export-video').forEach(btn => {
   btn.addEventListener('click', () => {
     const modal = document.getElementById('videoModal');
     modal.classList.remove('hidden');
     updateModalFields();
   });
 });
 const modalFrameRate = document.getElementById('modalFrameRate');
 const modalDuration  = document.getElementById('modalDuration');
 function updateModalFields() {
   const fr = Number(modalFrameRate.value);
   const du = Number(modalDuration.value);
   document.getElementById('modalFrameRateVal').textContent = fr;
   document.getElementById('modalDurationVal').textContent = du;
   document.getElementById('modalFramesCount').textContent = fr * du;
 }
 modalFrameRate.addEventListener('input', updateModalFields);
 modalDuration.addEventListener('input', updateModalFields);
 document.getElementById('modalCancel').addEventListener('click', () => {
   document.getElementById('videoModal').classList.add('hidden');
 });
 document.getElementById('modalExportConfirm').addEventListener('click', () => {
   const fr = Number(modalFrameRate.value);
   const du = Number(modalDuration.value);
   document.getElementById('modalForm').classList.add('hidden');
   const progress = document.getElementById('modalProgress');
   progress.classList.remove('hidden');
   const circle = document.getElementById('modalProgressCircle');
   const circumference = 2 * Math.PI * 36;

   const stream = cnv.elt.captureStream(fr);

   const recMimeType = 'video/webm';
   const recorder = new MediaRecorder(stream, { mimeType: recMimeType });
   const chunks = [];
   recorder.ondataavailable = e => chunks.push(e.data);
   recorder.onstop = () => {
   
     const blob = new Blob(chunks, { type: recMimeType });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'generative_grid.webm';
     a.click();
     URL.revokeObjectURL(url);
     document.getElementById('videoModal').classList.add('hidden');
   };
   recorder.start();
   const total = du * 1000;
   const start = Date.now();
   const interval = setInterval(() => {
     const elapsed = Date.now() - start;
     const pct = Math.min(elapsed / total, 1);
     const offset = circumference * (1 - pct);
     circle.setAttribute('stroke-dashoffset', offset);
     if (elapsed >= total) {
       clearInterval(interval);
       recorder.stop();
     }
   }, 50);
 });
}
 window.addEventListener('load', initExportUI);
 // p5 draw loop
 function draw() {
   // Hand-guided grid mode: full-screen interactive Perlin cells
   if (window.handGridMode) {
     // ensure canvas matches window
     if (width !== window.innerWidth || height !== window.innerHeight) {
       resizeCanvas(window.innerWidth, window.innerHeight);
     }
     // clear background
     const bg = params.palettes[params.currentPalette]?.bg || params.palettes[0].bg;
     background(bg);
     // compute noise time
     noiseTime += params.timeScale;
     const t = noiseTime;
     // gather active points from landmarks
     const activePts = [];
     if (window.handLandmarks) {
       window.handLandmarks.forEach(hand => {
         hand.forEach(lm => activePts.push({ x: lm.x * width, y: lm.y * height }));
       });
     }
     // grid cell sizes
     const cols = params.cols;
     const rows = params.rows;
     const cellW = width / cols;
     const cellH = height / rows;
     const thresh = Math.max(cellW, cellH) * 0.6;
     // draw only active cells
     rectMode(CENTER);
     // dynamic stroke for livelier grid cells
     // noStroke(); // replace static fill-only
     // determine base fill and stroke colors
     const fgColor = params.palettes[params.currentPalette]?.fg1 || params.palettes[0].fg1;
     fill(fgColor);
     stroke(fgColor);
     for (let i = 0; i < cols; i++) {
       for (let j = 0; j < rows; j++) {
         const cx = (i + 0.5) * cellW;
         const cy = (j + 0.5) * cellH;
         // check if any landmark is near this cell
         let active = false;
         for (const pt of activePts) {
           if (dist(cx, cy, pt.x, pt.y) < thresh) {
             active = true;
             break;
           }
         }
         if (!active) continue;
         // compute noise-based transform
         const raw = fbm(i * params.noiseScale, j * params.noiseScale, t);
         const ang = map(raw, 0, 1, -radians(params.rotationAmount), radians(params.rotationAmount));
         const sc = 1 + (raw - 0.5) * params.noiseStrength;
         const op = map(raw, 0, 1, params.fgMinOpacity, params.fgMaxOpacity);
         push();
         translate(cx, cy);
         rotate(ang);
         scale(sc);
         // apply opacity and dynamic stroke weight
         const fg = params.palettes[params.currentPalette]?.fg1 || params.palettes[0].fg1;
         const c = color(fg);
         c.setAlpha(op * 255);
         fill(c);
         // stroke weight modulated by noise for thickness
         const sw = map(raw, 0, 1, 1, Math.max(cellW, cellH) * 0.3);
         strokeWeight(sw);
         rect(0, 0, cellW * 0.9, cellH * 0.9);
         pop();
       }
     }
     return;
   }
   // default draw (controls-based noise grid)
   const p = params.currentPalette === 'custom'
     ? {
         bg: document.getElementById('bgColorPicker').value,
         fg1: document.getElementById('fg1ColorPicker').value
       }
     : params.palettes[params.currentPalette];
   background(p.bg);
   const pad = (params.padding / 100) * width;
   const drawSize = width - pad * 2;
   const baseX = pad + (params.offsetX / 100) * drawSize;
   const baseY = pad + (params.offsetY / 100) * drawSize;
   const cellX = drawSize / params.cols;
   const cellY = drawSize / params.rows;

   noiseTime += params.timeScale;
   const t = noiseTime;
   for (let i = 0; i < params.cols; i++) {
     for (let j = 0; j < params.rows; j++) {
       const x0 = baseX + i * cellX;
       const y0 = baseY + j * cellY;
       const rawN = fbm(
         i * params.noiseScale + params.noiseOffsetX,
         j * params.noiseScale + params.noiseOffsetY,
         t
       );
       const prevN = (lastNoise[i] && lastNoise[i][j]) || rawN;
       const n = lerp(prevN, rawN, params.noiseSmooth);
       if (!lastNoise[i]) lastNoise[i] = [];
       lastNoise[i][j] = n;
       const angle = map(n, 0, 1, -radians(params.rotationAmount), radians(params.rotationAmount));
       const sf = 1 + (n - 0.5) * params.noiseStrength;
       const c = color(p.fg1);
   
       let tOp = rawN;
       const contrastFactor = 2.5;
       tOp = (tOp - 0.000001) * contrastFactor + 0.5;
       tOp = constrain(tOp, 0, 1);
       const opacityVal = map(tOp, 0, 1, params.fgMinOpacity, params.fgMaxOpacity);
       c.setAlpha(opacityVal * 255);
       push();
       translate(x0 + cellX / 2, y0 + cellY / 2);
       rotate(angle);
       scale(sf);
       fill(c);
       noStroke();
       const minWpx = params.minW;
       const maxWpx = params.maxW;
       const minHpx = params.minH;
       const maxHpx = params.maxH;
       const wRect  = map(n, 0, 1, minWpx, maxWpx);
       const hRect  = map(n, 0, 1, minHpx, maxHpx);
       if (params.shape === 'ellipse') {
         ellipse(0, 0, wRect, hRect);
       } else {
         rect(0, 0, wRect, hRect);
       }
       pop();
     }
   }
 }
 function getCanvasDimensions() {
  const panel = document.getElementById('controlsPanel');
  // if controls panel is hidden (hands mode), use full window
  if (panel && panel.style.display === 'none') {
    return { w: window.innerWidth, h: window.innerHeight };
  }
  const sideW = getSidebarWidth();
  let maxWidth = window.innerWidth - sideW;
  if (window.innerWidth <= 640 && panel && !panel.classList.contains('open')) {
    maxWidth = Math.max(0, maxWidth - 40);
  }
  const maxHeight = window.innerHeight - 60;
  return { w: min(maxWidth, maxHeight) };
 }
 function getSidebarWidth() {
   const panel = document.getElementById('controlsPanel');
   return panel.classList.contains('open') || window.innerWidth > 640 ? panel.offsetWidth : 0;
 }
 function windowResized() {
  // resize canvas to new dimensions
  const dims = getCanvasDimensions();
  const w = dims.w;
  const h = dims.h !== undefined ? dims.h : dims.w;
  resizeCanvas(w, h);
 }
 function setupControls() {

   const controlsPanel = document.getElementById('controlsPanel');
   const toggleBtn = document.getElementById('toggleControls');
   const closeBtn = document.getElementById('closeControls');
   function adjustCanvasSize() {
 
     if (window.innerWidth <= 640 && controlsPanel.classList.contains('open')) {
 
     } else {
       windowResized();
     }
   }
   ['rows','cols','padding','offsetX','offsetY','noiseScale','timeScale','noiseStrength','rotationAmount']
   .forEach(id => {
     const inp = document.getElementById(id);
     const disp = document.getElementById(id + 'Val');
     inp.addEventListener('input', e => {
       params[id] = Number(e.target.value);
       disp.textContent = e.target.value;
       if (id === 'frameRateVal') frameRate(params.frameRateVal);
       if (id === 'rows' || id === 'cols') initNoiseHistory();
 
       adjustCanvasSize();
     });
   });
   document.getElementById('paletteSelect').addEventListener('change', e => {
     params.currentPalette = e.target.value;
     document.getElementById('customColors').classList.toggle('hidden', e.target.value !== 'custom');
   });

   const fallIn = document.getElementById('noiseFalloff');
   const fallDisp = document.getElementById('noiseFalloffVal');
   if (fallIn) {
     fallIn.addEventListener('input', e => {
       params.noiseFalloff = Number(e.target.value);
       fallDisp.textContent = e.target.value;
     });
   }

   ['minW','maxW','minH','maxH'].forEach(id => {
     const inp = document.getElementById(id);
     const disp = document.getElementById(id + 'Val');
     inp.addEventListener('input', e => {
       params[id] = Number(e.target.value);
       disp.textContent = e.target.value;
     });
   });

   const shapeSelect = document.getElementById('shapeSelect');
   shapeSelect.addEventListener('change', e => {
     params.shape = e.target.value;
   });
 
   const fgMinIn = document.getElementById('fgMinOpacity');
   const fgMinDisp = document.getElementById('fgMinOpacityVal');
   if (fgMinIn) {
     fgMinIn.addEventListener('input', e => {
       params.fgMinOpacity = Number(e.target.value);
       fgMinDisp.textContent = e.target.value;
     });
   }
   const fgMaxIn = document.getElementById('fgMaxOpacity');
   const fgMaxDisp = document.getElementById('fgMaxOpacityVal');
   if (fgMaxIn) {
     fgMaxIn.addEventListener('input', e => {
       params.fgMaxOpacity = Number(e.target.value);
       fgMaxDisp.textContent = e.target.value;
     });
   }

   const mobileNav = document.getElementById('mobileNav');
   if (toggleBtn && closeBtn && controlsPanel && mobileNav && canvasContainer) {
     toggleBtn.addEventListener('click', () => {
       controlsPanel.classList.add('open');
       mobileNav.classList.add('hidden');

    
       if (window.innerWidth > 640) adjustCanvasSizeForDesktop();


       if (window.innerWidth <= 640) {
         const cc = canvasContainer;
         const rect = cc.getBoundingClientRect(); 

         cc.style.position = 'fixed';
         cc.style.width = `${rect.width}px`;
         cc.style.height = `${rect.height}px`;
         cc.style.top = '0px'; 


         setTimeout(() => {
             const panelHeight = controlsPanel.offsetHeight;
             const spacing = 16;
             cc.style.bottom = `${panelHeight + spacing}px`;

         
             cc.style.left = '0';
             cc.style.right = '0';
             cc.style.marginLeft = 'auto';
             cc.style.marginRight = 'auto';

       
             cc.style.transformOrigin = 'top center';

       
             const targetMobileWidth = 200; 
             const scale = Math.min(1, targetMobileWidth / rect.width); 
             cc.style.transform = `scale(${scale})`;

             cc.style.alignItems = 'flex-start';

         
             cc.style.transition = 'transform 0.3s ease, bottom 0.3s ease';

         }, 0); 
       }
     });

     closeBtn.addEventListener('click', () => {
       controlsPanel.classList.remove('open');
       mobileNav.classList.remove('hidden');


       if (window.innerWidth > 640) adjustCanvasSizeForDesktop();


       if (window.innerWidth <= 640) {
         const cc = canvasContainer;

    
         cc.style.alignItems = 'center'; 
         cc.style.transition = 'transform 0.3s ease, bottom 0.3s ease'; 
         cc.style.transform = ''; 
         cc.style.bottom = ''; 

  
         setTimeout(() => {
           cc.style.position = '';
           cc.style.width = '';
           cc.style.height = '';
           cc.style.top = '';
           cc.style.left = '';
           cc.style.right = '';
           cc.style.marginLeft = '';
           cc.style.marginRight = '';
           cc.style.transformOrigin = '';
           cc.style.transition = '';

           windowResized();
         }, 300); 
       }
     });
   } else {
       console.error("One or more critical UI elements for mobile toggle not found.");
   }
  
   if (window.innerWidth <= 640) {
     document.querySelectorAll('#controlsPanel details').forEach(detail => {
       detail.setAttribute('open', '');
       const summary = detail.querySelector('summary');
       if (summary) summary.style.pointerEvents = 'none';
     });
   }
 }
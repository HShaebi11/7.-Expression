// p5.js version of Tim Rodenbroeker Kinetic typography tutorial with some extra sliders
// You can find the whole tutorial here 
// https://timrodenbroeker.de/processing-tutorial-kinetic-typography-1/
//
// I left the code snippet to import a custom font.
// Link to the Roboto Mono : https://fonts.google.com/specimen/Roboto+Mono
//
// Have fun ! 

let font;
let pg;
let textInput;

// Store slider elements
let sliders = {};
let sliderValues = {};

// Animation variables
let isPlaying = false;
let currentFrame = 0;
let totalFrames = 120;
let keyframes = {};
let playhead;
let timelineTrack;
let frameInput;

function setup() {
  const canvas = createCanvas(400, 400);
  canvas.parent('canvas-container');
  pg = createGraphics(400, 400);
  
  initControls();
  initTimeline();
}

function initControls() {
  textInput = document.getElementById('textInput');
  
  // Initialize sliders
  sliders = {
    tilesX: document.getElementById('tilesX'),
    tilesY: document.getElementById('tilesY'),
    speed: document.getElementById('speed'),
    dispX: document.getElementById('dispX'),
    dispY: document.getElementById('dispY'),
    offset: document.getElementById('offset'),
    textSize: document.getElementById('textSize'),
    lineHeight: document.getElementById('lineHeight')
  };

  // Initialize slider values and listeners
  for (let id in sliders) {
    sliderValues[id] = parseFloat(sliders[id].value);
    sliders[id].addEventListener('input', function() {
      sliderValues[id] = parseFloat(this.value);
      document.getElementById(id + 'Value').textContent = this.value;
    });
  }
}

function initTimeline() {
  playhead = document.getElementById('playhead');
  timelineTrack = document.getElementById('timelineTrack');
  frameInput = document.getElementById('frameInput');
  
  // Play/Pause button
  document.getElementById('playPause').addEventListener('click', togglePlay);
  
  // Add keyframe button
  document.getElementById('addKeyframe').addEventListener('click', addKeyframe);
  
  // Timeline click handling
  timelineTrack.addEventListener('click', (e) => {
    const rect = timelineTrack.getBoundingClientRect();
    const x = e.clientX - rect.left;
    currentFrame = Math.floor((x / rect.width) * totalFrames);
    updatePlayhead();
  });
  
  // Frame input handling
  frameInput.addEventListener('change', () => {
    currentFrame = parseInt(frameInput.value);
    updatePlayhead();
  });
}

function togglePlay() {
  isPlaying = !isPlaying;
  document.getElementById('playPause').textContent = isPlaying ? 'Pause' : 'Play';
}

function addKeyframe() {
  keyframes[currentFrame] = {...sliderValues};
  updateKeyframeMarkers();
}

function updatePlayhead() {
  const position = (currentFrame / totalFrames) * 100;
  playhead.style.left = `${position}%`;
  frameInput.value = currentFrame;
}

function updateKeyframeMarkers() {
  const markers = document.getElementById('keyframeMarkers');
  markers.innerHTML = '';
  
  Object.keys(keyframes).forEach(frame => {
    const marker = document.createElement('div');
    marker.className = 'keyframe-marker';
    marker.style.left = `${(frame / totalFrames) * 100}%`;
    markers.appendChild(marker);
  });
}

function draw() {
  if (isPlaying) {
    currentFrame = (currentFrame + 1) % totalFrames;
    updatePlayhead();
  }

  // Interpolate values if between keyframes
  let currentValues = {...sliderValues};
  if (Object.keys(keyframes).length > 1) {
    const frames = Object.keys(keyframes).map(Number).sort((a, b) => a - b);
    let prevFrame = frames[0];
    let nextFrame = frames[frames.length - 1];
    
    for (let i = 0; i < frames.length - 1; i++) {
      if (currentFrame >= frames[i] && currentFrame < frames[i + 1]) {
        prevFrame = frames[i];
        nextFrame = frames[i + 1];
        break;
      }
    }
    
    if (currentFrame >= prevFrame && currentFrame <= nextFrame) {
      const t = (currentFrame - prevFrame) / (nextFrame - prevFrame);
      for (let prop in sliderValues) {
        currentValues[prop] = lerp(
          keyframes[prevFrame][prop],
          keyframes[nextFrame][prop],
          t
        );
      }
    }
  }

  // Draw animation using interpolated values
  background(0);
  pg.background(0);
  pg.fill(255);
  pg.textSize(currentValues.textSize);
  pg.push();
  pg.translate(width/2, height/2);
  pg.textAlign(CENTER, CENTER);
  
  let lines = textInput.value.split('\n');
  let totalHeight = (lines.length - 1) * currentValues.lineHeight;
  let startY = -totalHeight/2;
  
  for(let line of lines) {
    pg.text(line, 0, startY);
    startY += currentValues.lineHeight;
  }
  pg.pop();

  // Rest of your drawing code using currentValues instead of sliderValues
  let tilesX = currentValues.tilesX;
  let tilesY = currentValues.tilesY;
  
  let tileW = int(width/tilesX);
  let tileH = int(height/tilesY);

  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      let waveX = int(sin(frameCount * currentValues.speed + (x * y) * currentValues.dispX) * currentValues.offset);
      let waveY = int(sin(frameCount * currentValues.speed + (x * y) * currentValues.dispY) * currentValues.offset);

      if (currentValues.dispX === 0) waveX = 0;
      if (currentValues.dispY === 0) waveY = 0;

      let sx = x*tileW + waveX;
      let sy = y*tileH + waveY;
      let sw = tileW;
      let sh = tileH;
      let dx = x*tileW;
      let dy = y*tileH;
      let dw = tileW;
      let dh = tileH;

      copy(pg, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  }
}
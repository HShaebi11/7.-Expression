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
let selectedKeyframes = new Set();
let isDraggingKeyframe = false;
let dragStartX = 0;
let dragStartPositions = new Map(); // Stores initial positions of all selected keyframes

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
    if (!isDraggingKeyframe) {  // Only update if not dragging
      const rect = timelineTrack.getBoundingClientRect();
      const x = e.clientX - rect.left;
      currentFrame = Math.floor((x / rect.width) * totalFrames);
      updatePlayhead();
    }
  });
  
  // Frame input handling
  frameInput.addEventListener('change', () => {
    currentFrame = parseInt(frameInput.value);
    updatePlayhead();
  });

  // Add keyframe drag handlers
  const keyframeMarkers = document.getElementById('keyframeMarkers');
  keyframeMarkers.addEventListener('mousedown', startDragKeyframe);
  document.addEventListener('mousemove', dragKeyframe);
  document.addEventListener('mouseup', stopDragKeyframe);

  // Add shift-click support for multiple selection
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteSelectedKeyframes();
    }
  });

  // Add keyframe position editor functionality
  const keyframePosition = document.getElementById('keyframePosition');
  const updateKeyframePosition = document.getElementById('updateKeyframePosition');
  const keyframeEditor = document.getElementById('keyframeEditor');

  updateKeyframePosition.addEventListener('click', () => {
    updateSelectedKeyframePosition(parseInt(keyframePosition.value));
  });

  keyframePosition.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      updateSelectedKeyframePosition(parseInt(keyframePosition.value));
    }
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
  const keyframeEditor = document.getElementById('keyframeEditor');
  const keyframePosition = document.getElementById('keyframePosition');
  
  markers.innerHTML = '';
  
  // Update keyframe editor visibility and value
  if (selectedKeyframes.size === 1) {
    keyframeEditor.style.display = 'flex';
    keyframePosition.value = Array.from(selectedKeyframes)[0];
  } else {
    keyframeEditor.style.display = 'none';
  }
  
  Object.keys(keyframes).forEach(frame => {
    const marker = document.createElement('div');
    marker.className = 'keyframe-marker';
    if (selectedKeyframes.has(parseInt(frame))) {
      marker.classList.add('selected');
    }
    marker.style.left = `${(frame / totalFrames) * 100}%`;
    marker.dataset.frame = frame;
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

function startDragKeyframe(e) {
  if (e.target.classList.contains('keyframe-marker')) {
    e.preventDefault();
    isDraggingKeyframe = true;
    const frame = parseInt(e.target.dataset.frame);
    
    // Handle multiple selection with shift key
    if (!e.shiftKey) {
      // If not holding shift, clear previous selection unless clicking on already selected keyframe
      if (!selectedKeyframes.has(frame)) {
        selectedKeyframes.clear();
      }
    }
    
    // Toggle selection of clicked keyframe
    if (selectedKeyframes.has(frame)) {
      if (e.shiftKey) {
        selectedKeyframes.delete(frame);
      }
    } else {
      selectedKeyframes.add(frame);
    }
    
    // Store initial positions of all selected keyframes
    dragStartPositions.clear();
    const rect = timelineTrack.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    
    selectedKeyframes.forEach(frame => {
      dragStartPositions.set(frame, frame);
    });
    
    updateKeyframeMarkers();
  }
}

function dragKeyframe(e) {
  if (isDraggingKeyframe && selectedKeyframes.size > 0) {
    e.preventDefault();
    const rect = timelineTrack.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const deltaFrames = Math.floor((x - dragStartX) / rect.width * totalFrames);
    
    // Calculate new positions for all selected keyframes
    const newPositions = new Map();
    let isValidMove = true;
    
    dragStartPositions.forEach((startFrame, originalFrame) => {
      const newFrame = Math.max(0, Math.min(startFrame + deltaFrames, totalFrames));
      if (!selectedKeyframes.has(newFrame)) {
        newPositions.set(originalFrame, newFrame);
      } else {
        isValidMove = false;
      }
    });
    
    // Apply movement if valid
    if (isValidMove) {
      const newKeyframes = {};
      
      // First, copy all non-selected keyframes
      Object.entries(keyframes).forEach(([frame, values]) => {
        if (!selectedKeyframes.has(parseInt(frame))) {
          newKeyframes[frame] = values;
        }
      });
      
      // Then move selected keyframes to new positions
      newPositions.forEach((newFrame, originalFrame) => {
        newKeyframes[newFrame] = keyframes[originalFrame];
      });
      
      keyframes = newKeyframes;
      updateKeyframeMarkers();
    }
  }
}

function stopDragKeyframe(e) {
  if (isDraggingKeyframe) {
    e.preventDefault();
    isDraggingKeyframe = false;
    dragStartPositions.clear();
    updateKeyframeMarkers();
  }
}

function deleteSelectedKeyframes() {
  selectedKeyframes.forEach(frame => {
    delete keyframes[frame];
  });
  selectedKeyframes.clear();
  updateKeyframeMarkers();
}

function showKeyframeMenu(e) {
  if (e.target.classList.contains('keyframe-marker')) {
    e.preventDefault();
    const frame = parseInt(e.target.dataset.frame);
    
    // Remove existing menu if any
    const oldMenu = document.getElementById('keyframeMenu');
    if (oldMenu) oldMenu.remove();
    
    // Create context menu
    const menu = document.createElement('div');
    menu.id = 'keyframeMenu';
    menu.className = 'keyframe-menu';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    
    // Add menu options
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit Values';
    editBtn.onclick = () => editKeyframe(frame);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteKeyframe(frame);
    
    menu.appendChild(editBtn);
    menu.appendChild(deleteBtn);
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    document.addEventListener('click', closeKeyframeMenu);
  }
}

function closeKeyframeMenu() {
  const menu = document.getElementById('keyframeMenu');
  if (menu) menu.remove();
  document.removeEventListener('click', closeKeyframeMenu);
}

function editKeyframe(frame) {
  // Load keyframe values into sliders
  const values = keyframes[frame];
  for (let prop in values) {
    if (sliders[prop]) {
      sliders[prop].value = values[prop];
      document.getElementById(`${prop}Value`).textContent = values[prop];
    }
  }
  currentFrame = frame;
  updatePlayhead();
  closeKeyframeMenu();
}

function deleteKeyframe(frame) {
  delete keyframes[frame];
  updateKeyframeMarkers();
  closeKeyframeMenu();
}

function updateSelectedKeyframePosition(newPosition) {
  if (selectedKeyframes.size === 1) {
    const oldFrame = Array.from(selectedKeyframes)[0];
    newPosition = Math.max(0, Math.min(newPosition, totalFrames));
    
    // Check if the new position is already occupied
    if (!keyframes.hasOwnProperty(newPosition) || newPosition === oldFrame) {
      keyframes[newPosition] = keyframes[oldFrame];
      delete keyframes[oldFrame];
      selectedKeyframes.clear();
      selectedKeyframes.add(newPosition);
      updateKeyframeMarkers();
    } else {
      alert('Position already occupied by another keyframe!');
    }
  }
}
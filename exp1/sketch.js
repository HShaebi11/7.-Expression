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
  
  // Create professional timeline layout
  const timeline = document.createElement('div');
  timeline.className = 'timeline-container';
  timeline.innerHTML = `
    <div class="timeline-header">
      <div class="timeline-controls">
        <button id="playPause">Play</button>
        <button id="addKeyframe">Add Keyframe</button>
        <div class="timeline-zoom">
          <button id="zoomOut">-</button>
          <button id="zoomIn">+</button>
        </div>
      </div>
      <div class="timeline-info">
        <span>Frame: <input type="number" id="frameInput" min="0" max="${totalFrames}" value="0"></span>
        <span>Time: <span id="timeDisplay">0:00</span></span>
      </div>
    </div>
    <div class="timeline-content">
      <div class="timeline-layers">
        <div class="layer-header">Properties</div>
        ${Object.keys(sliderValues).map(prop => `
          <div class="timeline-layer" data-property="${prop}">
            <div class="layer-label">${prop}</div>
            <div class="layer-track"></div>
          </div>
        `).join('')}
      </div>
      <div class="timeline-track-container">
        <div class="timeline-ruler">
          <div class="ruler-markers"></div>
          <div class="keyframe-track"></div>
        </div>
        <div id="timelineTrack" class="timeline-track">
          <div id="playhead" class="playhead"></div>
        </div>
      </div>
    </div>
  `;
  
  // Insert timeline into bottom panel instead of after canvas
  const oldTimeline = document.querySelector('.timeline-container');
  if (oldTimeline) oldTimeline.replaceWith(timeline);
  else document.querySelector('.bottom-panel').appendChild(timeline);

  // Add CSS styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .timeline-container {
      background: #2a2a2a;
      border-radius: 4px;
      margin: 20px 0;
      padding: 10px;
      font-family: Arial, sans-serif;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #3a3a3a;
    }

    .timeline-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .timeline-controls button {
      background: #3a3a3a;
      border: none;
      color: #fff;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    }

    .timeline-controls button:hover {
      background: #4a4a4a;
    }

    .timeline-zoom {
      display: flex;
      gap: 5px;
    }

    .timeline-info {
      color: #fff;
      display: flex;
      gap: 20px;
    }

    .timeline-info input {
      background: #3a3a3a;
      border: 1px solid #4a4a4a;
      color: #fff;
      width: 60px;
      padding: 2px 5px;
      border-radius: 3px;
    }

    .timeline-content {
      display: flex;
      height: 200px;
      margin-top: 10px;
    }

    .timeline-layers {
      width: 150px;
      border-right: 1px solid #3a3a3a;
      overflow-y: auto;
    }

    .layer-header {
      color: #fff;
      padding: 5px 10px;
      background: #3a3a3a;
      position: sticky;
      top: 0;
    }

    .timeline-layer {
      display: flex;
      height: 30px;
      border-bottom: 1px solid #3a3a3a;
    }

    .layer-label {
      color: #fff;
      padding: 5px 10px;
      width: 100%;
      display: flex;
      align-items: center;
    }

    .timeline-track-container {
      flex-grow: 1;
      overflow-x: auto;
      position: relative;
    }

    .timeline-ruler {
      height: 20px;
      background: #3a3a3a;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .timeline-track {
      position: relative;
      height: calc(100% - 20px);
      background: #2a2a2a;
    }

    .playhead {
      position: absolute;
      top: 0;
      width: 2px;
      height: 100%;
      background: #ff0000;
      pointer-events: none;
      z-index: 2;
    }

    .keyframe-marker {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #ffcc00;
      border-radius: 2px;
      transform: rotate(45deg);
      margin: -5px;
      cursor: pointer;
      z-index: 1;
    }

    .keyframe-marker.selected {
      background: #ff6600;
      border: 2px solid #fff;
      margin: -7px;
    }

    .time-marker {
      position: absolute;
      width: 1px;
      height: 5px;
      background: #4a4a4a;
      bottom: 0;
    }

    .time-marker.major {
      height: 10px;
      background: #6a6a6a;
    }

    .time-marker.major::after {
      content: attr(data-time);
      position: absolute;
      top: -15px;
      left: 2px;
      color: #999;
      font-size: 10px;
    }
  `;
  document.head.appendChild(style);

  // Initialize existing event listeners
  document.getElementById('playPause').addEventListener('click', togglePlay);
  document.getElementById('addKeyframe').addEventListener('click', addKeyframe);
  document.getElementById('zoomIn').addEventListener('click', () => {
    timelineZoom = Math.min(timelineZoom * 1.5, 10);
    updateTimelineView();
  });
  document.getElementById('zoomOut').addEventListener('click', () => {
    timelineZoom = Math.max(timelineZoom / 1.5, 0.1);
    updateTimelineView();
  });

  // Initialize time markers
  updateTimeMarkers();

  // Add click-to-add keyframe functionality for each layer track
  document.querySelectorAll('.layer-track').forEach(track => {
    track.addEventListener('click', (e) => {
      if (e.target.classList.contains('layer-track')) {  // Only if clicking track, not existing keyframe
        const rect = track.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const frame = Math.round((clickPosition / rect.width) * totalFrames / timelineZoom);
        const property = track.parentElement.dataset.property;
        
        // Add keyframe at clicked position with current value
        addKeyframeAtPosition(property, frame, sliderValues[property]);
      }
    });
  });

  // Make timeline track draggable for scrubbing
  const trackContainer = document.querySelector('.timeline-track-container');
  trackContainer.addEventListener('mousedown', startScrubbing);
  document.addEventListener('mousemove', updateScrubbing);
  document.addEventListener('mouseup', stopScrubbing);

  // Update click handler for keyframe placement
  const keyframeTrack = document.querySelector('.keyframe-track');
  keyframeTrack.addEventListener('click', (e) => {
    if (e.target.classList.contains('keyframe-track')) {
      const rect = keyframeTrack.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const frame = Math.round((clickPosition / rect.width) * totalFrames / timelineZoom);
      
      // Add keyframe for all current values
      addKeyframe(frame);
    }
  });
}

function updateTimeMarkers() {
  const ruler = document.querySelector('.timeline-ruler');
  ruler.innerHTML = '';
  
  const markerInterval = 10; // Frames between markers
  const majorInterval = 30; // Frames between major markers

  for (let i = 0; i <= totalFrames; i += markerInterval) {
    const marker = document.createElement('div');
    marker.className = 'time-marker';
    if (i % majorInterval === 0) {
      marker.classList.add('major');
      marker.setAttribute('data-time', i);
    }
    marker.style.left = `${(i / totalFrames) * 100}%`;
    ruler.appendChild(marker);
  }
}

function updateTimelineView() {
  const trackContainer = document.querySelector('.timeline-track-container');
  const track = document.getElementById('timelineTrack');
  track.style.width = `${100 * timelineZoom}%`;
  updateTimeMarkers();
  updateKeyframeMarkers();
}

// Update the updateKeyframeMarkers function
function updateKeyframeMarkers() {
  const keyframeTrack = document.querySelector('.keyframe-track');
  keyframeTrack.innerHTML = '';
  
  // Add keyframe markers to the ruler track
  Object.keys(keyframes).forEach(frame => {
    const marker = document.createElement('div');
    marker.className = 'keyframe-marker';
    if (selectedKeyframes.has(parseInt(frame))) {
      marker.classList.add('selected');
    }
    marker.style.left = `${(frame / totalFrames) * 100}%`;
    marker.dataset.frame = frame;
    
    // Add tooltip with frame number and properties
    const tooltipContent = Object.entries(keyframes[frame])
      .map(([prop, value]) => `${prop}: ${value}`)
      .join('\n');
    marker.title = `Frame: ${frame}\n${tooltipContent}`;
    
    keyframeTrack.appendChild(marker);
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
  
  // Ensure playhead is visible when timeline is zoomed
  const timelineTrack = document.getElementById('timelineTrack');
  const trackRect = timelineTrack.getBoundingClientRect();
  const playheadRect = playhead.getBoundingClientRect();
  
  if (playheadRect.left < trackRect.left || playheadRect.right > trackRect.right) {
    const offset = playheadRect.left - trackRect.left;
    timelineOffset = Math.max(
      Math.min(0, -offset),
      trackRect.width - timelineTrack.scrollWidth
    );
    updateTimelineView();
  }
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
    const property = e.target.dataset.property;
    
    if (!e.shiftKey) {
      if (!selectedKeyframes.has(frame)) {
        selectedKeyframes.clear();
      }
    }
    
    selectedKeyframes.add(frame);
    
    dragStartPositions.clear();
    const rect = e.target.parentElement.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    
    selectedKeyframes.forEach(frame => {
      dragStartPositions.set(frame, {
        frame: frame,
        property: property
      });
    });
    
    updateKeyframeMarkers();
  }
}

function dragKeyframe(e) {
  if (isDraggingKeyframe && dragStartPositions.size > 0) {
    e.preventDefault();
    const track = e.target.closest('.layer-track');
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newFrame = Math.round((x / rect.width) * totalFrames / timelineZoom);
    
    const deltaFrames = newFrame - Math.round((dragStartX / rect.width) * totalFrames / timelineZoom);
    
    // Move all selected keyframes
    const newKeyframes = {...keyframes};
    dragStartPositions.forEach((data, originalFrame) => {
      const targetFrame = Math.max(0, Math.min(data.frame + deltaFrames, totalFrames));
      
      // Only move if target frame is empty or is the original frame
      if (!keyframes[targetFrame] || targetFrame === originalFrame) {
        if (originalFrame !== targetFrame) {
          // Move keyframe to new position
          if (!newKeyframes[targetFrame]) {
            newKeyframes[targetFrame] = {};
          }
          newKeyframes[targetFrame][data.property] = keyframes[originalFrame][data.property];
          
          // Remove from old position
          delete newKeyframes[originalFrame][data.property];
          if (Object.keys(newKeyframes[originalFrame]).length === 0) {
            delete newKeyframes[originalFrame];
          }
        }
      }
    });
    
    keyframes = newKeyframes;
    updateKeyframeMarkers();
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

function showKeyframeEditor(frame) {
  const values = keyframes[frame];
  const editor = document.getElementById('keyframeEditor');
  
  editor.innerHTML = `
    <h3>Edit Keyframe at Frame ${frame}</h3>
    ${Object.entries(values).map(([prop, value]) => `
      <div class="editor-row">
        <label>${prop}</label>
        <input type="number" 
               data-prop="${prop}" 
               value="${value}" 
               step="0.1"
               onchange="updateKeyframeValue(${frame}, '${prop}', this.value)">
      </div>
    `).join('')}
    <div class="editor-row">
      <label>Easing</label>
      <select onchange="updateKeyframeEasing(${frame}, this.value)">
        ${Object.keys(EasingFunctions).map(ease => 
          `<option>${ease}</option>`
        ).join('')}
      </select>
    </div>
  `;
}

let isScrubbing = false;

function startScrubbing(e) {
  if (e.target.classList.contains('keyframe-marker')) return;
  isScrubbing = true;
  updateTimeFromMouse(e);
}

function updateScrubbing(e) {
  if (isScrubbing) {
    updateTimeFromMouse(e);
  }
}

function stopScrubbing() {
  isScrubbing = false;
}

function updateTimeFromMouse(e) {
  const trackContainer = document.querySelector('.timeline-track-container');
  const rect = trackContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  currentFrame = Math.round((x / rect.width) * totalFrames / timelineZoom);
  currentFrame = Math.max(0, Math.min(currentFrame, totalFrames));
  updatePlayhead();
}

function addKeyframeAtPosition(property, frame, value) {
  if (!keyframes[frame]) {
    keyframes[frame] = {};
  }
  keyframes[frame][property] = value;
  updateKeyframeMarkers();
}
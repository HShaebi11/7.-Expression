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
let bgImage = null;
let bgVideo = null;
let isVideo = false;
let textColor;
let bgColor;

// Store slider elements
let sliders = {};
let sliderValues = {};

function setup() {
  const canvas = createCanvas(400, 400);
  canvas.parent('canvas-container');
  pg = createGraphics(400, 400);
  
  // Initialize text input
  textInput = document.getElementById('textInput');
  
  // Initialize sliders
  initSliders();
  
  // Replace image input listener with media input listener
  const mediaInput = document.getElementById('mediaInput');
  mediaInput.addEventListener('change', handleMediaUpload);
  
  // Initialize color pickers
  textColor = color(255);  // Default white
  bgColor = color(0);      // Default black
  
  const textColorPicker = document.getElementById('textColor');
  const bgColorPicker = document.getElementById('bgColor');
  
  textColorPicker.addEventListener('input', function() {
    textColor = color(this.value);
  });
  
  bgColorPicker.addEventListener('input', function() {
    bgColor = color(this.value);
  });
}

function handleMediaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Clear previous media
  if (bgVideo) {
    bgVideo.remove();
    bgVideo = null;
  }
  bgImage = null;
  isVideo = false;

  if (file.type.startsWith('video/')) {
    // Handle video upload
    bgVideo = createVideo(URL.createObjectURL(file), () => {
      bgVideo.loop();
      bgVideo.hide(); // Hide the DOM element
      isVideo = true;
    });
    
    // Add loop control
    const loopCheckbox = document.getElementById('loopVideo');
    loopCheckbox.addEventListener('change', () => {
      if (bgVideo) {
        if (loopCheckbox.checked) {
          bgVideo.loop();
        } else {
          bgVideo.noLoop();
        }
      }
    });
  } else if (file.type.startsWith('image/')) {
    // Handle image upload
    loadImage(URL.createObjectURL(file), img => {
      bgImage = img;
    });
  }
}

function draw() {
  background(bgColor);

  // PGraphics
  pg.background(bgColor);
  
  // Draw background media if available
  if (bgVideo && isVideo) {
    pg.push();
    pg.imageMode(CENTER);
    let scale = Math.max(width / bgVideo.width, height / bgVideo.height);
    pg.image(bgVideo, width/2, height/2, bgVideo.width * scale, bgVideo.height * scale);
    pg.pop();
  } else if (bgImage) {
    pg.push();
    pg.imageMode(CENTER);
    let scale = Math.max(width / bgImage.width, height / bgImage.height);
    pg.image(bgImage, width/2, height/2, bgImage.width * scale, bgImage.height * scale);
    pg.pop();
  }
  
  // Draw text with selected color
  pg.fill(textColor);
  pg.textSize(sliderValues.textSize);
  pg.push();
  pg.translate(width/2, height/2);
  pg.textAlign(CENTER, CENTER);
  
  // Split text into lines and draw with line height
  let lines = textInput.value.split('\n');
  let totalHeight = (lines.length - 1) * sliderValues.lineHeight;
  let startY = -totalHeight/2;
  
  for(let line of lines) {
    pg.text(line, 0, startY);
    startY += sliderValues.lineHeight;
  }
  
  pg.pop();

  let tilesX = sliderValues.tilesX;
  let tilesY = sliderValues.tilesY;

  let tileW = int(width/tilesX);
  let tileH = int(height/tilesY);

  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      // WARP
      let waveX = int(sin(frameCount * sliderValues.speed + (x * y) * sliderValues.dispX) * sliderValues.offset);
      let waveY = int(sin(frameCount * sliderValues.speed + (x * y) * sliderValues.dispY) * sliderValues.offset);

      if (sliderValues.dispX === 0) {
        waveX = 0;
      }
      if (sliderValues.dispY === 0) {
        waveY = 0;
      }

      // SOURCE
      let sx = x*tileW + waveX;
      let sy = y*tileH + waveY;
      let sw = tileW;
      let sh = tileH;

      // DESTINATION
      let dx = x*tileW;
      let dy = y*tileH;
      let dw = tileW;
      let dh = tileH;

      copy(pg, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  }
}

function initSliders() {
  // Initialize all sliders
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

  // Add event listeners and initialize values
  for (let id in sliders) {
    sliderValues[id] = parseFloat(sliders[id].value);
    sliders[id].addEventListener('input', function() {
      sliderValues[id] = parseFloat(this.value);
      document.getElementById(id + 'Value').textContent = this.value;
    });
  }
}
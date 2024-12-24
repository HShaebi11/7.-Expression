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

let tX,tY,sp,dspx,dspy,fct;
let textInput;
let textSizeSlider;

// function preload(){
//   font = loadFont("data/RobotoMono-Regular.ttf");
// }

function setup() {

  createCanvas(400, 400);
  createSliders();
  pg = createGraphics(400, 400);
  
  textInput = createInput('a');
  textInput.position(340, height + 40);
  createP('Text').position(340, height);
}

function draw() {
  background(0);

  // Draw text input on canvas
  fill(255);
  textSize(12);
  textAlign(LEFT);
  text('Type any character:', 10, 20);
  text('Current: ' + textInput.value().charAt(0), 120, 20);

  // PGraphics

  pg.background(0);
  pg.fill(255);
  // pg.textFont(font);
  pg.textSize(textSizeSlider.value());
  pg.push();
  pg.translate(width/2, height/2);
  pg.textAlign(CENTER, CENTER);
  pg.text(textInput.value().charAt(0), 0, 0);
  pg.pop();


  let tilesX = tX.value();
  let tilesY = tY.value();

  let tileW = int(width/tilesX);
  let tileH = int(height/tilesY);

  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {

      // WARP
      let waveX = int(sin(frameCount * sp.value() + ( x * y ) * dspx.value()) * fct.value());
      let waveY = int(sin(frameCount * sp.value() + ( x * y ) * dspy.value()) * fct.value());

      if (dspx.value() === 0){
          waveX = 0;
      }

      if (dspy.value() === 0){
          waveY = 0;
      }
      
      // image(pg,0,0)
      
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

function createSliders(){
  tX = createSlider(1, 80, 16, 1);
  tX.position(20, height + 40);
  createP('Tiles X').position(20, height);

  tY = createSlider(1, 80, 16, 1);
  tY.position(20, height + 100);
  createP('Tiles Y').position(20, height+60);

  sp = createSlider(0, 1, 0.005, 0.01);
  sp.position(20, height + 160);
  createP('Speed').position(20, height+120);

  dspx = createSlider(0, 0.1, 0.05, 0.001);
  dspx.position(180, height + 40);
  createP('Displacement X').position(180, height);

  dspy = createSlider(0, 0.2, 0, 0.01);
  dspy.position(180, height + 100);
  createP('Displacement Y').position(180, height+60);

  fct = createSlider(0, 300, 100, 1);
  fct.position(180, height + 160);
  createP('Offset').position(180, height+120);

  // Add text size slider
  textSizeSlider = createSlider(100, 800, 400, 1);
  textSizeSlider.position(340, height + 160);
  createP('Text Size').position(340, height + 120);
}
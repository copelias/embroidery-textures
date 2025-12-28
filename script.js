1// ================================
// HTML REFERENCES
// ================================
const uploadInput = document.getElementById("upload-btn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const transformBtn = document.getElementById("transform-btn");
const downloadBtn = document.getElementById("download-btn");
const effectSelect = document.getElementById("effect-style");

let img = new Image();
let ready = false;

// ================================
// IMAGE UPLOAD
// ================================
uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

img.onload = () => {
  const maxWidth = 900;
  const scale = Math.min(1, maxWidth / img.width);

  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  ready = true;
  transformBtn.disabled = false;
  downloadBtn.disabled = true;
};

// ================================
// TRANSFORM BUTTON
// ================================
transformBtn.addEventListener("click", () => {
  if (!ready) return;

  // reset image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const effect = effectSelect.value;

  switch (effect) {
    case "grayscale":
      grayscale();
      break;
    case "sepia":
      sepia();
      break;
    case "invert":
      invert();
      break;
    case "highContrast":
      contrast(1.6);
      break;
    case "lowContrast":
      contrast(0.7);
      break;
    case "posterize":
      posterize(4);
      break;
    case "duotone":
      duotone([40, 60, 120], [220, 190, 120]);
      break;
    case "tritone":
      tritone(
        [30, 40, 80],
        [160, 160, 140],
        [230, 210, 180]
      );
      break;
    case "falseColor":
      falseColor();
      break;






      case "biscuit": applyBiscuit(); break;
case "chocolate": applyChocolate(); break;
case "honey": applyHoney(); break;
case "butter": applyButter(); break;
case "dough": applyDough(); break;
case "clay": applyClay(); break;
case "ceramic": applyCeramic(); break;
case "paper": applyPaper(); break;
case "linen": applyLinen(); break;
case "fabric": applyFabric(); break;

case "filmFade": applyFilmFade(); break;
case "retroWarm": applyRetroWarm(); break;
case "polaroid": applyPolaroid(); break;
case "dusty": applyDusty(); break;
case "oldPhoto": applyOldPhoto(); break;
case "fadedInk": applyFadedInk(); break;
case "yellowedPaper": applyYellowedPaper(); break;
case "matteFilm": applyMatteFilm(); break;
case "analogBlue": applyAnalogBlue(); break;
case "analogGreen": applyAnalogGreen(); break;

case "pencil": applyPencil(); break;
case "charcoal": applyCharcoal(); break;
case "ink": applyInk(); break;
case "sketch": applySketch(); break;
case "comic": applyComic(); break;
case "pastel": applyPastel(); break;
case "watercolor": applyWatercolor(); break;
case "crayon": applyCrayon(); break;
case "chalk": applyChalk(); break;
case "marker": applyMarker(); break;

case "glow": applyGlow(); break;
case "softGlow": applySoftGlow(); break;
case "hardLight": applyHardLight(); break;
case "dreamy": applyDreamy(); break;
case "neon": applyNeon(); break;
case "cyber": applyCyber(); break;
case "sunset": applySunset(); break;
case "moonlight": applyMoonlight(); break;
case "lava": applyLava(); break;
case "frost": applyFrost(); break;






      
    case "monochrome":
      monochrome([180, 120, 70]);
      break;
  }

  downloadBtn.disabled = false;
});

// ================================
// DOWNLOAD
// ================================
downloadBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "maacat-effect.jpg";
  a.href = canvas.toDataURL("image/jpeg", 0.95);
  a.click();
});

// ================================
// EFFECT FUNCTIONS
// ================================

function grayscale() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
    d[i] = d[i + 1] = d[i + 2] = avg;
  }
  ctx.putImageData(imgData, 0, 0);
}

function sepia() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    d[i]     = r * 0.393 + g * 0.769 + b * 0.189;
    d[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
    d[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
  }
  ctx.putImageData(imgData, 0, 0);
}

function invert() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    d[i]     = 255 - d[i];
    d[i + 1] = 255 - d[i + 1];
    d[i + 2] = 255 - d[i + 2];
  }
  ctx.putImageData(imgData, 0, 0);
}

function contrast(amount) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    d[i]     = clamp((d[i] - 128) * amount + 128);
    d[i + 1] = clamp((d[i + 1] - 128) * amount + 128);
    d[i + 2] = clamp((d[i + 2] - 128) * amount + 128);
  }
  ctx.putImageData(imgData, 0, 0);
}

function posterize(levels) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const step = 255 / (levels - 1);

  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.round(d[i] / step) * step;
    d[i + 1] = Math.round(d[i + 1] / step) * step;
    d[i + 2] = Math.round(d[i + 2] / step) * step;
  }
  ctx.putImageData(imgData, 0, 0);
}

function duotone(c1, c2) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const t = (d[i] + d[i + 1] + d[i + 2]) / 3 / 255;
    d[i]     = c1[0] * (1 - t) + c2[0] * t;
    d[i + 1] = c1[1] * (1 - t) + c2[1] * t;
    d[i + 2] = c1[2] * (1 - t) + c2[2] * t;
  }
  ctx.putImageData(imgData, 0, 0);
}

function tritone(c1, c2, c3) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const t = (d[i] + d[i + 1] + d[i + 2]) / 3 / 255;

    if (t < 0.5) {
      const k = t * 2;
      d[i]     = c1[0] * (1 - k) + c2[0] * k;
      d[i + 1] = c1[1] * (1 - k) + c2[1] * k;
      d[i + 2] = c1[2] * (1 - k) + c2[2] * k;
    } else {
      const k = (t - 0.5) * 2;
      d[i]     = c2[0] * (1 - k) + c3[0] * k;
      d[i + 1] = c2[1] * (1 - k) + c3[1] * k;
      d[i + 2] = c2[2] * (1 - k) + c3[2] * k;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function falseColor() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    d[i] = g;
    d[i + 1] = b;
    d[i + 2] = r;
  }
  ctx.putImageData(imgData, 0, 0);
}

function monochrome(color) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
    d[i]     = avg * color[0] / 255;
    d[i + 1] = avg * color[1] / 255;
    d[i + 2] = avg * color[2] / 255;
  }
  ctx.putImageData(imgData, 0, 0);
}










function baseEffect(mod){
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  for(let i=0;i<d.length;i+=4){
    const avg=(d[i]+d[i+1]+d[i+2])/3;
    d[i]=avg*mod[0]+mod[3]+(Math.random()-0.5)*mod[6];
    d[i+1]=avg*mod[1]+mod[4]+(Math.random()-0.5)*mod[6];
    d[i+2]=avg*mod[2]+mod[5]+(Math.random()-0.5)*mod[6];
  }
  ctx.putImageData(imgData,0,0);
}

/* FOOD & MATERIAL */
const applyBiscuit=()=>baseEffect([1.1,.9,.6,40,20,0,20]);
const applyChocolate=()=>baseEffect([.8,.5,.3,30,0,0,10]);
const applyHoney=()=>baseEffect([1.2,1,.5,50,30,0,15]);
const applyButter=()=>baseEffect([1.3,1.2,.7,40,40,10,10]);
const applyDough=()=>baseEffect([1,.9,.8,20,10,10,15]);
const applyClay=()=>baseEffect([1,.7,.6,30,10,10,8]);
const applyCeramic=()=>baseEffect([1.1,1.1,1.2,0,0,10,3]);
const applyPaper=()=>baseEffect([1,1,1,10,10,10,12]);
const applyLinen=()=>baseEffect([1,.95,.9,15,15,10,18]);
const applyFabric=()=>baseEffect([1,.9,.8,20,15,10,25]);

/* ANALOG */
const applyFilmFade=()=>baseEffect([.9,.9,.9,30,30,30,5]);
const applyRetroWarm=()=>baseEffect([1.1,1,.8,30,10,0,5]);
const applyPolaroid=()=>baseEffect([1.2,1,.9,20,10,10,5]);
const applyDusty=()=>baseEffect([.9,.9,.9,20,20,20,30]);
const applyOldPhoto=()=>baseEffect([1,.85,.7,40,20,0,10]);
const applyFadedInk=()=>baseEffect([.7,.7,.7,50,50,50,5]);
const applyYellowedPaper=()=>baseEffect([1.1,1,.7,60,40,10,10]);
const applyMatteFilm=()=>baseEffect([.95,.95,.95,15,15,15,4]);
const applyAnalogBlue=()=>baseEffect([.8,.9,1.2,0,0,20,5]);
const applyAnalogGreen=()=>baseEffect([.8,1.2,.8,0,20,0,5]);

/* DRAW */
const applyPencil=()=>baseEffect([.6,.6,.6,100,100,100,5]);
const applyCharcoal=()=>baseEffect([.4,.4,.4,120,120,120,10]);
const applyInk=()=>baseEffect([.3,.3,.3,140,140,140,0]);
const applySketch=()=>baseEffect([.5,.5,.5,90,90,90,15]);
const applyComic=()=>baseEffect([1.4,1.4,1.4,-20,-20,-20,0]);
const applyPastel=()=>baseEffect([1.2,1.1,1,30,30,30,8]);
const applyWatercolor=()=>baseEffect([1.1,1.1,1.1,20,20,20,20]);
const applyCrayon=()=>baseEffect([1.3,1.1,.9,10,10,10,30]);
const applyChalk=()=>baseEffect([.8,.8,.8,80,80,80,25]);
const applyMarker=()=>baseEffect([1.5,1.5,1.5,-30,-30,-30,0]);

/* LIGHT */
const applyGlow=()=>baseEffect([1.2,1.2,1.2,10,10,10,3]);
const applySoftGlow=()=>baseEffect([1.1,1.1,1.1,20,20,20,2]);
const applyHardLight=()=>baseEffect([1.5,1.5,1.5,-40,-40,-40,0]);
const applyDreamy=()=>baseEffect([1.1,1,.9,30,20,10,8]);
const applyNeon=()=>baseEffect([1.6,1.6,1.6,-50,-50,-50,0]);
const applyCyber=()=>baseEffect([.8,1.4,1.6,0,0,0,0]);
const applySunset=()=>baseEffect([1.3,1,.6,40,10,0,5]);
const applyMoonlight=()=>baseEffect([.7,.8,1.2,0,0,20,5]);
const applyLava=()=>baseEffect([1.6,.6,.3,20,0,0,10]);
const applyFrost=()=>baseEffect([.9,1.1,1.4,0,10,30,5]);


function clamp(v) {
  return Math.max(0, Math.min(255, v));
}


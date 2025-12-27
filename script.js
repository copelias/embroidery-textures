// Riferimenti HTML
const uploadBtn = document.getElementById("upload-btn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const transformBtn = document.getElementById("transform-btn");
const downloadBtn = document.getElementById("download-btn");
const effectSelect = document.getElementById("effect-style");

let img = new Image();
let ready = false;

// Carica immagine
uploadBtn.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// Disegna immagine su canvas quando caricata
img.onload = () => {
  const maxW = 900;
  const scale = Math.min(1, maxW / img.width);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ready = true;
  transformBtn.disabled = false;
  downloadBtn.disabled = true;
};

// Trasforma immagine
transformBtn.addEventListener("click", () => {
  if (!ready) return;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const effect = effectSelect.value;

  switch(effect) {
    case "grayscale":
      applyGrayscale();
      break;
    case "sepia":
      applySepia();
      break;
    case "invert":
      applyInvert();
      break;
    case "highContrast":
      applyContrast(1.5);
      break;
    case "lowContrast":
      applyContrast(0.7);
      break;
    case "posterize":
      applyPosterize(4);
      break;
    case "duotone":
      applyDuotone([50,50,150], [200,180,100]);
      break;
    case "tritone":
      applyTritone([30,30,60], [150,150,120], [220,200,180]);
      break;
    case "falseColor":
      applyFalseColor();
      break;
    case "monochrome":
      applyMonochrome([180,120,60]);
      break;
  }

  downloadBtn.disabled = false;
});

// Scarica immagine
downloadBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "maacat-effect.jpg";
  a.href = canvas.toDataURL("image/jpeg", 0.95);
  a.click();
});

// ------------------ EFFECT FUNCTIONS ------------------

// Grayscale
function applyGrayscale() {
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  for(let i=0;i<d.length;i+=4){
    const avg = (d[i]+d[i+1]+d[i+2])/3;
    d[i] = d[i+1] = d[i+2] = avg;
  }
  ctx.putImageData(imgData,0,0);
}

// Sepia
function applySepia() {
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  for(let i=0;i<d.length;i+=4){
    const r=d[i], g=d[i+1], b=d[i+2];
    d[i] = r*0.393+g*0.769+b*0.189;
    d[i+1] = r*0.349+g*0.686+b*0.168;
    d[i+2] = r*0.272+g*0.534+b*0.131;
  }
  ctx.putImageData(imgData,0,0);
}

// Invert
function applyInvert() {
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  for(let i=0;i<d.length;i+=4){
    d[i] = 255-d[i];
    d[i+1] = 255-d[i+1];
    d[i+2] = 255-d[i+2];
  }
  ctx.putImageData(imgData,0,0);
}

// Contrast
function applyContrast(factor){
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  const f = (259*(factor+255))/(255*(259-factor));
  for(let i=0;i<d.length;i+=4){
    d[i] = truncate(f*(d[i]-128)+128);
    d[i+1] = truncate(f*(d[i+1]-128)+128);
    d[i+2] = truncate(f*(d[i+2]-128)+128);
  }
  ctx.putImageData(imgData,0,0);
}

function truncate(value){
  return Math.max(0,Math.min(255,value));
}

// Posterize
function applyPosterize(levels){
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  const step = 255/(levels-1);
  for(let i=0;i<d.length;i+=4){
    d[i] = Math.round(d[i]/step)*step;
    d[i+1] = Math.round(d[i+1]/step)*step;
    d[i+2] = Math.round(d[i+2]/step)*step;
  }
  ctx.putImageData(imgData,0,0);
}

// Duotone
function applyDuotone(color1, color2){
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  for(let i=0;i<d.length;i+=4){
    const avg = (d[i]+d[i+1]+d[i+2])/3/255;
    d[i] = color1[0]*(1-avg)+color2[0]*avg;
    d[i+1] = color1[1]*(1-avg)+color2[1]*avg;
    d[i+2] = color1[2]*(1-avg)+color2[2]*avg;
  }
  ctx.putImageData(imgData,0,0);
}

// Tritone
function applyTritone(c1,c2,c3){
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  for(let i=0;i<d.length;i+=4){
    const avg = (d[i]+d[i+1]+d[i+2])/3/255;
    if(avg<0.5){
      d[i]=c1[0]*(1-avg*2)+c2[0]*avg*2;
      d[i+1]=c1[1]*(1-avg*2)+c2[1]*avg*2;
      d[i+2]=c1[2]*(1-avg*2)+c2[2]*avg*2;
    }else{
      const a=(avg-0.5)*2;
      d[i]=c2[0]*(1-a)+c3[0]*a;
      d[i+1]=c2[1]*(1-a)+c3[1]*a;
      d[i+2]=c2[2]*(1-a)+c3[2]*a;
    }
  }
  ctx.putImageData(imgData,0,0);
}

// False color
function applyFalseColor(){
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  for(let i=0;i<d.length;i+=4){
    const r=d[i], g=d[i+1], b=d[i+2];
    d[i]=g; // swap R->G
    d[i+1]=b; // G->B
    d[i+2]=r; // B->R
  }
  ctx.putImageData(imgData,0,0);
}

// Monochrome tint
function applyMonochrome(color){
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imgData.data;
  for(let i=0;i<d.length;i+=4){
    const avg = (d[i]+d[i+1]+d[i+2])/3;
    d[i] = avg*color[0]/255;
    d[i+1] = avg*color[1]/255;
    d[i+2] = avg*color[2]/255;
  }
  ctx.putImageData(imgData,0,0);
}


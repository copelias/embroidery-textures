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
    
case "paper": applyPaper(); break;

case "pencil": applyPencil(); break;

case "pastel": applyPastel(); break;

case "crayon": applyCrayon(); break;

    case "embroiderySatin":
  applyEmbroiderySatin();
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


const applyPaper=()=>baseEffect([1,1,1,10,10,10,12]);

/* DRAW */
const applyPencil=()=>baseEffect([.6,.6,.6,100,100,100,5]);

const applyPastel=()=>baseEffect([1.2,1.1,1,30,30,30,8]);




function applyCrayon() {
  const w = canvas.width;
  const h = canvas.height;

  // Colori originali
  ctx.drawImage(img, 0, 0, w, h);
  const src = ctx.getImageData(0, 0, w, h).data;

  // Carta
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f7f2e8";
  ctx.fillRect(0, 0, w, h);

  const spacing = 6;
  const angle = 0; // stessa direzione
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  for (let y = 0; y < h; y += spacing) {
    for (let x = 0; x < w; x += spacing) {

      const i = (y * w + x) * 4;
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];
      const a = src[i + 3];
      if (a < 50) continue;

      // più passate = più cera
      const passes = 4 + Math.floor(Math.random() * 3);

      for (let p = 0; p < passes; p++) {
        const len = 18 + Math.random() * 10;
        const thick = 7 + Math.random() * 4;

        const jx = (Math.random() - 0.5) * 3;
        const jy = (Math.random() - 0.5) * 3;

        // STRATO SCURO (accumulo)
        ctx.strokeStyle = `rgb(${r * 0.75},${g * 0.75},${b * 0.75})`;
        ctx.lineWidth = thick + 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + jx, y + jy);
        ctx.lineTo(x + jx + dx * len, y + jy + dy * len);
        ctx.stroke();

        // STRATO CENTRALE (pigmento pieno)
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = thick;
        ctx.beginPath();
        ctx.moveTo(x + jx, y + jy);
        ctx.lineTo(x + jx + dx * len, y + jy + dy * len);
        ctx.stroke();

        // LUCE CEROSA (3D)
        ctx.strokeStyle = `rgba(255,255,255,0.35)`;
        ctx.lineWidth = thick * 0.3;
        ctx.beginPath();
        ctx.moveTo(x + jx - 1, y + jy - 1);
        ctx.lineTo(
          x + jx + dx * len - 1,
          y + jy + dy * len - 1
        );
        ctx.stroke();
      }
    }
  }

  // Grana cera / carta
  for (let i = 0; i < w * h * 0.05; i++) {
    ctx.fillStyle = "rgba(0,0,0,0.03)";
    ctx.fillRect(
      Math.random() * w,
      Math.random() * h,
      1,
      1
    );
  }
}







// ================================
// EMBROIDERY PATCH SATIN EFFECT
// ================================
function applyEmbroiderySatin() {
  const w = canvas.width;
  const h = canvas.height;

  // Disegna prima l'immagine originale
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Pulisce canvas e mette uno sfondo chiaro tipo stoffa
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f5f1e8";
  ctx.fillRect(0, 0, w, h);

  const stitchSpacing = 4;     // distanza tra i punti dei fili
  const stitchLength = 8;      // lunghezza dei fili
  const threadThickness = 2.5; // spessore dei fili
  const layers = 3;            // linee sovrapposte per effetto satin

  for (let y = 0; y < h; y += stitchSpacing) {
    for (let x = 0; x < w; x += stitchSpacing) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 80) continue; // salta trasparenze

      // Direzione principale dei fili (stessa per tutti, leggermente ondulata)
      const angle = Math.PI / 4 + Math.sin(y * 0.05) * 0.1;
      const dx = Math.cos(angle) * stitchLength;
      const dy = Math.sin(angle) * stitchLength;

      for (let l = 0; l < layers; l++) {
        // Piccolo sfalsamento casuale per rendere più realistico
        const offsetX = (Math.random() - 0.5) * 2;
        const offsetY = (Math.random() - 0.5) * 2;

        // Ombra filo (più scura e spessa)
        ctx.strokeStyle = `rgba(0,0,0,0.2)`;
        ctx.lineWidth = threadThickness + 1.5;
        ctx.beginPath();
        drawSatinLine(x + offsetX, y + offsetY, dx, dy);
        ctx.stroke();

        // Filo colorato principale
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = threadThickness;
        ctx.beginPath();
        drawSatinLine(x + offsetX, y + offsetY, dx, dy);
        ctx.stroke();

        // Highlight filo (effetto lucido satin)
        ctx.strokeStyle = `rgba(255,255,255,0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        drawSatinLine(x + offsetX, y + offsetY, dx, dy);
        ctx.stroke();
      }
    }
  }

  // Bordo finale tipo stoffa cucita
  ctx.strokeStyle = "#d8d1c4";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  // Funzione helper per disegnare linea leggermente ondulata
  function drawSatinLine(x, y, dx, dy) {
    const steps = 5;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const midX = x + dx * t + Math.sin(t * Math.PI * 2) * 0.5;
      const midY = y + dy * t + Math.cos(t * Math.PI * 2) * 0.5;
      if (s === 0) ctx.moveTo(midX, midY);
      else ctx.lineTo(midX, midY);
    }
  }
}


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

  // Prendiamo i colori originali
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Carta
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f6f1e7";
  ctx.fillRect(0, 0, w, h);

  const spacing = 7;          // distanza tra zone
  const strokeLen = 14;      // tratti corti (NON lunghi)
  const baseThickness = 6;   // pastello spesso
  const angle = 0;           // stessa direzione (orizzontale)

  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  for (let y = 0; y < h; y += spacing) {
    for (let x = 0; x < w; x += spacing) {

      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 60) continue;

      // 🧠 RIPASSA PIÙ VOLTE (scarabocchio)
      const passes = 3 + Math.floor(Math.random() * 4);

      for (let p = 0; p < passes; p++) {
        const jitterX = (Math.random() - 0.5) * 4;
        const jitterY = (Math.random() - 0.5) * 4;

        const len = strokeLen * (0.6 + Math.random() * 0.6);
        const thickness =
          baseThickness * (0.6 + Math.random() * 0.7);

        ctx.strokeStyle = `rgba(${r},${g},${b},${0.25 + Math.random() * 0.35})`;
        ctx.lineWidth = thickness;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(x + jitterX, y + jitterY);
        ctx.lineTo(
          x + jitterX + dx * len,
          y + jitterY + dy * len
        );
        ctx.stroke();
      }
    }
  }

  // Grana carta più visibile
  for (let i = 0; i < w * h * 0.03; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillStyle = "rgba(0,0,0,0.04)";
    ctx.fillRect(x, y, 1, 1);
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


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
    
case "aluminium_emboss":
  applyAluminiumEmboss();
  break;


case "game_block":
  applyGameBlockEffect();
  break;


case "embroidery_satin":
    applyEmbroiderySatin();
    break;

case "crayon": applyCrayon(); break;

    case "Towel":
  applyTowel();
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

/* FUNCTION aluminium */ 
function applyAluminiumEmboss() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.save();

  // base
  ctx.drawImage(img, 0, 0, w, h);
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);

  const lightX = -0.6;   // direzione luce
  const lightY = -0.8;
  const depth = 4.5;    // profondità incisione
  const shine = 1.2;    // lucidità alluminio

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;

      // luminanza pixel vicini (height map)
      const l = src.data[((y * w + x - 1) * 4)];
      const r = src.data[((y * w + x + 1) * 4)];
      const u = src.data[(((y - 1) * w + x) * 4)];
      const d = src.data[(((y + 1) * w + x) * 4)];

      // normali 3D fake
      const nx = (l - r) * depth;
      const ny = (u - d) * depth;
      const nz = 255;

      // normalizzazione
      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
      const NdotL = (
        (nx/len) * lightX +
        (ny/len) * lightY +
        (nz/len)
      );

      // luce diffusa + speculare
      let light = 180 + NdotL * 90;
      light += Math.pow(Math.max(NdotL, 0), 4) * 255 * shine;

      light = Math.max(80, Math.min(255, light));

      dst.data[i]     = light;
      dst.data[i + 1] = light;
      dst.data[i + 2] = light;
      dst.data[i + 3] = 255;
    }
  }

  ctx.putImageData(dst, 0, 0);

  // riflesso direzionale tipo foglio lucido
  const gloss = ctx.createLinearGradient(0, 0, w, h);
  gloss.addColorStop(0, "rgba(255,255,255,0.35)");
  gloss.addColorStop(0.3, "rgba(255,255,255,0.05)");
  gloss.addColorStop(0.6, "rgba(0,0,0,0.1)");
  gloss.addColorStop(1, "rgba(255,255,255,0.25)");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, w, h);

  // micro graffi metallici
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = 190 + Math.random() * 50;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;

  // bordo foglio inciso
  ctx.strokeStyle = "rgba(90,90,90,0.9)";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  ctx.restore();
}




/* FUNCTION game block*/
function applyGameBlockEffect() {
  g.save();

  const bw = canvas.width;
  const bh = canvas.height;

  // Disegna immagine originale
  g.drawImage(img, 0, 0, bw, bh);
  const imageData = g.getImageData(0, 0, bw, bh);
  const data = imageData.data;

  g.clearRect(0, 0, bw, bh);

  const blockSize = 12; // ↑ più grande = più Minecraft

  for (let y = 0; y < bh; y += blockSize) {
    for (let x = 0; x < bw; x += blockSize) {

      let r = 0, gCol = 0, b = 0, count = 0;

      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const px = ((y + dy) * bw + (x + dx)) * 4;
          if (px >= data.length) continue;

          r += data[px];
          gCol += data[px + 1];
          b += data[px + 2];
          count++;
        }
      }

      r = Math.floor(r / count);
      gCol = Math.floor(gCol / count);
      b = Math.floor(b / count);

      // Blocco base
      g.fillStyle = `rgb(${r},${gCol},${b})`;
      g.fillRect(x, y, blockSize, blockSize);

      // Ombra basso-destra
      g.fillStyle = "rgba(0,0,0,0.25)";
      g.fillRect(x, y + blockSize - 2, blockSize, 2);
      g.fillRect(x + blockSize - 2, y, 2, blockSize);

      // Highlight alto-sinistra
      g.fillStyle = "rgba(255,255,255,0.25)";
      g.fillRect(x, y, blockSize, 2);
      g.fillRect(x, y, 2, blockSize);
    }
  }

  g.restore();
}




/* FUNCTION EMBROIDERY SATIN */ 

function applyEmbroiderySatin() {
  const satinW = canvas.width;
  const satinH = canvas.height;

  // Disegna immagine originale
  ctx.drawImage(img, 0, 0, satinW, satinH);

  const satinImageData = ctx.getImageData(0, 0, satinW, satinH);
  const satinData = satinImageData.data;

  // Sfondo tipo stoffa
  ctx.clearRect(0, 0, satinW, satinH);
  ctx.fillStyle = "#f5f1e8";
  ctx.fillRect(0, 0, satinW, satinH);

  const satinSpacing = 5;
  const satinLength = 10;
  const satinThickness = 3;

  const satinAngle = Math.PI / 6; // 30°

  for (let y = 0; y < satinH; y += satinSpacing) {
    for (let x = 0; x < satinW; x += satinSpacing) {
      const idx = (y * satinW + x) * 4;
      const r = satinData[idx];
      const g = satinData[idx + 1];
      const b = satinData[idx + 2];
      const a = satinData[idx + 3];

      if (a < 80) continue;

      const dx = Math.cos(satinAngle) * satinLength;
      const dy = Math.sin(satinAngle) * satinLength;

      // Ombra
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = satinThickness + 1;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, y + 0.5);
      ctx.lineTo(x + dx + 0.5, y + dy + 0.5);
      ctx.stroke();

      // Filo colorato
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.lineWidth = satinThickness;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();

      // Highlight satin
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 0.5, y - 0.5);
      ctx.lineTo(x + dx - 0.5, y + dy - 0.5);
      ctx.stroke();
    }
  }

  // Bordo finale
  ctx.strokeStyle = "#d8d1c4";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, satinW - 6, satinH - 6);
}










function applyCrayon() {
  const w = canvas.width;
  const h = canvas.height;

  // immagine di riferimento
  ctx.drawImage(img, 0, 0, w, h);
  const ref = ctx.getImageData(0, 0, w, h);
  const d = ref.data;

  // carta
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f7f2e8";
  ctx.fillRect(0, 0, w, h);

  const angle = Math.PI / 4; // diagonale bambino
  const spacing = 10;       // distanza tra tratti
  const strokeLen = 22;     // tratto CORTO
  const passes = 3;         // ripassi disordinati

  ctx.lineCap = "round";

  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y += spacing) {
      for (let x = 0; x < w; x += spacing) {

        const i = (y * w + x) * 4;
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const a = d[i + 3];

        if (a < 40) continue;

        // variazione bambino
        const jitterX = (Math.random() - 0.5) * 6;
        const jitterY = (Math.random() - 0.5) * 6;
        const pressure = 0.5 + Math.random() * 0.5;

        const dx = Math.cos(angle) * strokeLen;
        const dy = Math.sin(angle) * strokeLen;

        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 10 + Math.random() * 6;
        ctx.globalAlpha = pressure;

        ctx.beginPath();
        ctx.moveTo(x + jitterX, y + jitterY);
        ctx.lineTo(x + dx + jitterX, y + dy + jitterY);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
}






// ================================
// EMBROIDERY PATCH SATIN EFFECT
// ================================
function applyTowel() {
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


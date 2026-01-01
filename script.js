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
    
/* case "aluminium_emboss":
  applyAluminiumEmboss();
  break; */

  case "colored_pencil":
    applyColoredPencil();
    break;


  case "clean_line_art":
  applyCleanLineArt();
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

function applyColoredPencil() {
    const w = canvas.width;
    const h = canvas.height;

    // Disegna SOLO per leggere i pixel
    ctx.drawImage(img, 0, 0, w, h);
    const src = ctx.getImageData(0, 0, w, h);
    const s = src.data;

    // PULIZIA TOTALE
    ctx.clearRect(0, 0, w, h);

    // Carta (non bianco puro)
    ctx.fillStyle = "#fdfdfb";
    ctx.fillRect(0, 0, w, h);

    // PARAMETRI MATITA
    const step = 2.5;          // densità tratto
    const maxLen = 3.5;        // lunghezza tratto
    const minLen = 1.2;
    const lineW = 0.9;         // spessore linea

    ctx.lineCap = "round";

    // RICOSTRUZIONE A TRATTI
    for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
            const px = Math.floor(x);
            const py = Math.floor(y);
            const i = (py * w + px) * 4;

            const r = s[i];
            const g = s[i + 1];
            const b = s[i + 2];

            const brightness = (r + g + b) / 3;
            if (brightness > 245) continue; // lascia bianchi veri

            // Tratto leggermente casuale ma controllato
            const angle = Math.random() * Math.PI;
            const len = minLen + Math.random() * maxLen;

            ctx.strokeStyle = `rgb(${r},${g},${b})`;
            ctx.lineWidth = lineW;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * len,
                y + Math.sin(angle) * len
            );
            ctx.stroke();
        }
    }

    // TEXTURE CARTA + GRAFITE
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let i = 0; i < w * h * 0.015; i++) {
        const rx = Math.random() * w;
        const ry = Math.random() * h;
        ctx.fillRect(rx, ry, 0.7, 0.7);
    }
    ctx.globalAlpha = 1;
}





function applyCleanLineArt() {
  const w = canvas.width;
  const h = canvas.height;

  // Disegna immagine base
  ctx.drawImage(img, 0, 0, w, h);
  const src = ctx.getImageData(0, 0, w, h);
  const s = src.data;

  // Grayscale pulito (NO blur artistico)
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < s.length; i += 4) {
    gray[i / 4] =
      0.299 * s[i] +
      0.587 * s[i + 1] +
      0.114 * s[i + 2];
  }

  // Fondo bianco assoluto
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const out = ctx.getImageData(0, 0, w, h);
  const o = out.data;

  // Threshold ALTO = pochissime linee
  const threshold = 50;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;

      // Edge detection secco (decisione netta)
      const d =
        Math.abs(gray[i] - gray[i - 1]) +
        Math.abs(gray[i] - gray[i + 1]) +
        Math.abs(gray[i] - gray[i - w]) +
        Math.abs(gray[i] - gray[i + w]);

      const isEdge = d > threshold;
      const v = isEdge ? 0 : 255;

      const idx = i * 4;
      o[idx]     = v;
      o[idx + 1] = v;
      o[idx + 2] = v;
      o[idx + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);

  // ❗ NIENTE ripasso spesso
  // Linea sottile = pixel-level (computer drawing)
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, w, h);
}



/* FUNCTION aluminium 
function applyAluminiumEmboss() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.save();

   =================================================
     1️⃣ OFFSCREEN CANVAS → EMBROIDERY SATIN ORIGINALE
     ================================================= 
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const offCtx = off.getContext("2d");

  // === CODICE TUO (IDENTICO) ===
  offCtx.drawImage(img, 0, 0, w, h);

  const satinImageDataX = offCtx.getImageData(0, 0, w, h);
  const satinDataX = satinImageDataX.data;

  offCtx.clearRect(0, 0, w, h);
  offCtx.fillStyle = "#f5f1e8";
  offCtx.fillRect(0, 0, w, h);

  const satinSpacingX = 5;
  const satinLengthX = 10;
  const satinThicknessX = 6;
  const satinAngleX = Math.PI / 6;

  for (let y = 0; y < h; y += satinSpacingX) {
    for (let x = 0; x < w; x += satinSpacingX) {
      const idx = (y * w + x) * 4;
      const r = satinDataX[idx];
      const g = satinDataX[idx + 1];
      const b = satinDataX[idx + 2];
      const a = satinDataX[idx + 3];
      if (a < 80) continue;

      const dx = Math.cos(satinAngleX) * satinLengthX;
      const dy = Math.sin(satinAngleX) * satinLengthX;

      // Ombra
      offCtx.strokeStyle = "rgba(0,0,0,0.15)";
      offCtx.lineWidth = satinThicknessX + 1;
      offCtx.beginPath();
      offCtx.moveTo(x + 0.5, y + 0.5);
      offCtx.lineTo(x + dx + 0.5, y + dy + 0.5);
      offCtx.stroke();

      // Filo colorato
      offCtx.strokeStyle = `rgb(${r},${g},${b})`;
      offCtx.lineWidth = satinThicknessX;
      offCtx.beginPath();
      offCtx.moveTo(x, y);
      offCtx.lineTo(x + dx, y + dy);
      offCtx.stroke();

      // Highlight satin
      offCtx.strokeStyle = "rgba(255,255,255,0.25)";
      offCtx.lineWidth = 1;
      offCtx.beginPath();
      offCtx.moveTo(x - 0.5, y - 0.5);
      offCtx.lineTo(x + dx - 0.5, y + dy - 0.5);
      offCtx.stroke();
    }
  }

   =================================================
     2️⃣ HEIGHT MAP → ALUMINIUM PRESS
     ================================================= 
  const heightMap = offCtx.getImageData(0, 0, w, h);
  const src = heightMap.data;
  const out = ctx.createImageData(w, h);

  const lightX = -0.7;
  const lightY = -0.8;
  const depth = 8.5;
  const shine = 1.9;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;

      const l = src[(y * w + x - 1) * 4];
      const r = src[(y * w + x + 1) * 4];
      const u = src[((y - 1) * w + x) * 4];
      const d = src[((y + 1) * w + x) * 4];

      const nx = (l - r) * depth;
      const ny = (u - d) * depth;
      const nz = 255;

      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
      const dot =
        (nx/len) * lightX +
        (ny/len) * lightY +
        (nz/len);

      let v = 150 + dot * 130;
      v += Math.pow(Math.max(dot, 0), 5) * 255 * shine;
      v = Math.max(40, Math.min(255, v));

      out.data[i] = out.data[i+1] = out.data[i+2] = v;
      out.data[i+3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);

   =================================================
     3️⃣ METAL FINISH
     ================================================= 
  const gloss = ctx.createLinearGradient(0, 0, w, h);
  gloss.addColorStop(0, "rgba(255,255,255,0.45)");
  gloss.addColorStop(0.35, "rgba(255,255,255,0.08)");
  gloss.addColorStop(0.6, "rgba(0,0,0,0.18)");
  gloss.addColorStop(1, "rgba(255,255,255,0.4)");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}
*/




/* FUNCTION game block*/
function applyGameBlockEffect() {
  ctx.save();

  const bw = canvas.width;
  const bh = canvas.height;

  // Disegna immagine originale
  ctx.drawImage(img, 0, 0, bw, bh);
  const imageData = ctx.getImageData(0, 0, bw, bh);
  const data = imageData.data;

  ctx.clearRect(0, 0, bw, bh);

  const blockSize = 12; // ↑ più grande = più stile Minecraft

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
      ctx.fillStyle = `rgb(${r},${gCol},${b})`;
      ctx.fillRect(x, y, blockSize, blockSize);

      // Ombra basso-destra
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(x, y + blockSize - 2, blockSize, 2);
      ctx.fillRect(x + blockSize - 2, y, 2, blockSize);

      // Highlight alto-sinistra
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(x, y, blockSize, 2);
      ctx.fillRect(x, y, 2, blockSize);
    }
  }

  ctx.restore();
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
  const satinThickness = 6;

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


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

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}


// ELEMENTI
const uploadInput = document.getElementById("upload-btn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const transformBtn = document.getElementById("transform-btn");
const downloadBtn = document.getElementById("download-btn");
const stitchStyle = document.getElementById("stitch-style");

// TEXTURE SATIN
const satinTexture = new Image();
satinTexture.src = "satin.png"; // nella stessa cartella di index.html

let sourceImage = null;
let ready = false;

/* -------------------------
   UPLOAD + PREVIEW
------------------------- */
uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    sourceImage = new Image();
    sourceImage.onload = () => {
      canvas.width = sourceImage.width;
      canvas.height = sourceImage.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sourceImage, 0, 0);

      ready = true;
      transformBtn.disabled = false;
      downloadBtn.disabled = true;
    };
    sourceImage.src = reader.result;
  };
  reader.readAsDataURL(file);
});

/* -------------------------
   TRANSFORM
------------------------- */
transformBtn.addEventListener("click", () => {
  if (!ready) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(sourceImage, 0, 0);

  const style = stitchStyle.value;

  if (style === "satin") applySatinEmbroidery();
  if (style === "outline") outlineStitch();
  if (style === "cross") crossStitch();

  downloadBtn.disabled = false;
});

/* -------------------------
   SATIN EMBROIDERY (REAL THREAD FEEL)
------------------------- */
function applySatinEmbroidery() {
  if (!satinTexture.complete) {
    satinTexture.onload = applySatinEmbroidery;
    return;
  }

  const step = 4;

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const brightness = (pixel[0] + pixel[1] + pixel[2]) / 3;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(brightness > 128 ? 0 : Math.PI / 4);
      ctx.globalAlpha = 0.4;
      ctx.drawImage(satinTexture, -2, -2, 4, 4);
      ctx.restore();
    }
  }
}

/* -------------------------
   OUTLINE STITCH
------------------------- */
function outlineStitch() {
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
}

/* -------------------------
   CROSS STITCH
------------------------- */
function crossStitch() {
  const step = 10;
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1;

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + step, y + step);
      ctx.moveTo(x + step, y);
      ctx.lineTo(x, y + step);
      ctx.stroke();
    }
  }
}

/* -------------------------
   DOWNLOAD
------------------------- */
downloadBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "maacat-embroidery.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

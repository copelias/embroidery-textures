const inputImage = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const satinTexture = new Image();
satinTexture.src = "satin.png"; // deve stare nella stessa cartella

inputImage.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // disegna immagine originale
      ctx.drawImage(img, 0, 0);

      // applica effetto ricamo
      applyEmbroideryEffect();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function applyEmbroideryEffect() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const i = (y * canvas.width + x) * 4;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = (r + g + b) / 3;

      // direzione filo
      const angle = brightness > 128 ? 0 : Math.PI / 4;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.globalAlpha = 0.35;
      ctx.drawImage(satinTexture, -2, -2, 4, 4);

      ctx.restore();
    }
  }
}

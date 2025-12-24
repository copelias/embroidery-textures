const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

const img = new Image();
img.src = "https://raw.githubusercontent.com/copelias/embroidery-textures/main/satin.png";

img.onload = () => {
  ctx.drawImage(img, 50, 50, 100, 100);
};

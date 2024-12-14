export function generateInitialsImage(username) {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const context = canvas.getContext('2d');

  // Hintergrund
  context.fillStyle = '#5D83B1';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Text-Einstellungen
  const initial = username.charAt(0).toUpperCase();
  context.fillStyle = 'white';
  context.font = 'bold 80px Arial';  // Schriftgröße reduziert
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Exakte Zentrierung
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Text-Metrics für vertikale Zentrierung
  const metrics = context.measureText(initial);
  const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const adjustment = actualHeight / 2;

  // Text zeichnen
  context.fillText(initial, centerX, centerY + adjustment);

  return canvas.toDataURL('image/png');
}

export function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        const size = Math.min(width, height);
        const startX = (width - size) / 2;
        const startY = (height - size) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, MAX_SIZE, MAX_SIZE);
        
        ctx.drawImage(
          img,
          startX, startY, size, size,
          0, 0, MAX_SIZE, MAX_SIZE
        );

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
} 
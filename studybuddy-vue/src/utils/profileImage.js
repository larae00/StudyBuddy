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
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
} 
export async function resizeBuffImage(imageData: string | undefined, scale: number): Promise<string> {
    if (!imageData) return '';
    const img = new Image();
  
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const baseSize = 27;
        const width = Math.floor(baseSize * scale);
        const height = Math.floor(baseSize * scale);
  
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
  
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context could not be created'));
  
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
  
      img.onerror = reject;
      img.src = imageData;
    });
  }
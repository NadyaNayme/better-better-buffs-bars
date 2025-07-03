/**
 * Resize a base64 image to match the desired scale, flooring dimensions to integers.
 * @param {string} dataUrl - The original image as a base64 data URI (with `data:image/png;base64,` prefix).
 * @param {number} scale - Scale as a decimal (e.g. 1.5 for 150%).
 * @returns {Promise<{ scaledDataUrl: string, width: number, height: number }>}
 */
export function resizedataURL(dataUrl, scale) {
    return new Promise((resolve, reject) => {
      const img = new Image();
  
      img.onload = () => {
        const baseSize = 27;
        const width = Math.floor(baseSize * scale);
        const height = Math.floor(baseSize * scale);
  
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
  
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Canvas context could not be created."));
  
        ctx.drawImage(img, 0, 0, width, height);
  
        const scaledDataUrl = canvas.toDataURL('image/png'); // data URI
        resolve({ scaledDataUrl, width, height });
      };
  
      img.onerror = (err) => reject(err);
      img.src = dataUrl;
    });
  }
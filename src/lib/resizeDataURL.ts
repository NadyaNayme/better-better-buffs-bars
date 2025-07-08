/**
 * Resize a base64 image to match the desired scale, flooring dimensions to integers.
 */
export function resizedataURL(dataUrl: string, scale: number): Promise<{ scaledDataUrl: string; width: number; height: number }> {
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

      const scaledDataUrl = canvas.toDataURL('image/png');
      resolve({ scaledDataUrl, width, height });
    };

    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}
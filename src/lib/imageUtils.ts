import { rawImageMap } from "../data/imageData";

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

  const encodedImageCache = new Map<string, Promise<string>>();

  /**
   * Returns a Promise resolving to the encoded 8-bit string suitable for alt1.overLayImage.
   */
  export function getEncodedImageForBuff(buffName: string, a1lib: any): Promise<string> {
    if (encodedImageCache.has(buffName)) {
      return encodedImageCache.get(buffName)!;
    }
  
    const imgSrc = rawImageMap[buffName];
    if (!imgSrc) return Promise.reject(new Error(`No image found for buff: ${buffName}`));
  
    const promise = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // in case of CORS issues
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx === null) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const encoded = a1lib.encodeImageString(imageData); // 8-bit string
        resolve(encoded);
      };
      img.onerror = () => reject(new Error(`Failed to load image for buff: ${buffName}`));
      img.src = imgSrc;
    });
  
    encodedImageCache.set(buffName, promise);
    return promise;
  }
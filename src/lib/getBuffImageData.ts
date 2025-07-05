interface BuffLike {
    buffType?: string;
    foundChild?: {
      imageData?: string;
      desaturatedImageData?: string;
    };
    scaledImageData?: string;
    scaledDesaturatedImageData?: string;
    imageData?: string;
    desaturatedImageData?: string;
  }
  
  export function getBuffImageData(buff: BuffLike, opts?: { desaturated?: boolean }): string | undefined {
    const { desaturated = false } = opts ?? {};
  
    if (buff.buffType === 'Meta' && buff.foundChild) {
      return desaturated
        ? buff.foundChild.desaturatedImageData
        : buff.foundChild.imageData;
    }
  
    if (desaturated) {
      return buff.scaledDesaturatedImageData ?? buff.desaturatedImageData;
    } else {
      return buff.scaledImageData ?? buff.imageData;
    }
  }
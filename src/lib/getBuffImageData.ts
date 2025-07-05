interface BuffLike {
    name: string;
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
  
    // if (buff.buffType === 'Meta' && buff.foundChild) {
    //     const data = buff.foundChild?.imageData
  
    //   if (!data) {
    //     console.warn(`Meta buff "${buff.name}" missing foundChild imageData`);
    //   }
    //   return data;
    // }
  
    const data = desaturated
    ? buff.scaledDesaturatedImageData ?? buff.desaturatedImageData
    : buff.scaledImageData ?? buff.imageData;

    if (!data) {
        console.warn(`Buff "${buff.name}" missing imageData`);
    }

    return data;
  }
export interface IdentifiedBuff {
    name: string;
    time: number;
    childName: string;
    foundChild?: {
      name: string;
      time: number;
      imageData: string;
      scaledImageData: string;
      desaturatedImageData: string;
      scaledDesaturatedImageData: string;
    };
  }
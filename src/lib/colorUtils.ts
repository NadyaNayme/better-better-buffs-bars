import type { Color } from "../types/Color";

  export const rgbToHex = ({ r, g, b }: Color) =>
    `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;

  export const hexToRgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });
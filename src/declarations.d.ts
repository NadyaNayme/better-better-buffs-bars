declare module "store";
declare module "components/Group";
declare module "components/ProfileManager";
declare module "lib/alt1Utils";

interface Alt1 {
    identifyAppUrl(url: string): void;
    permissionOverlay?: boolean;
    overlays?: string[];
}

interface A1Lib {
  once(type: string, callbackfn: function): void;
  getMousePosition(): {x: number, y: number} | null;
  capture(x: number, y: number, width: number, height: number): ImgRefBind;
  captureHold(x: number, y: number, width: number, height: number): ImgRefBind;
  captureHoldFullRs(): ImgRefBind;
  encodeImageString(buf: ImageData): string;
  mixColor(r: number, g: number, b: number);
}
  
interface Window {
  alt1?: Alt1;
  a1lib?: A1Lib;
}
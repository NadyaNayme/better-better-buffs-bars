declare module "store";
declare module "components/Group";
declare module "components/ProfileManager";
declare module "lib/alt1Utils";

interface Alt1 {
    identifyAppUrl(url: string): void;
    permissionOverlay?: boolean;
    overlays?: any;
}

interface A1Lib {
  getMousePosition(): {x, y};
}
  
interface Window {
  alt1?: Alt1;
  a1lib?: A1Lib;
}
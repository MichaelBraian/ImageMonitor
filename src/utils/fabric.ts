declare global {
  interface Window {
    fabric: any;
  }
}

export const fabric = window.fabric;

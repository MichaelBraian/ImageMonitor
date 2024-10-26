declare module 'three/examples/jsm/loaders/STLLoader' {
  import { BufferGeometry, Loader } from 'three';
  export class STLLoader extends Loader {
    load(url: string, onLoad: (geometry: BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(data: ArrayBuffer | string): BufferGeometry;
  }
}

declare module 'three/examples/jsm/loaders/PLYLoader' {
  import { BufferGeometry, Loader } from 'three';
  export class PLYLoader extends Loader {
    load(url: string, onLoad: (geometry: BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(data: ArrayBuffer | string): BufferGeometry;
  }
}

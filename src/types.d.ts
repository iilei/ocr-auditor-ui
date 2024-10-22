declare module '*.md';

declare type BBox = Array<Array<number>>;

declare interface ShapeOptions {
  width: number;
  height: number;
  x: number;
  y: number;
}

declare interface SnapToOuterOptions {
  kindOf?: 'careas' | 'pars' | 'lines' | 'words';
  padding?: {
    left?: number;
    lineEnd?: number;
  };
  snappy?: Boolean;
}

declare type ShapeOptionsNullable = ShapeOptions | false | null | undefined;

declare interface GapDistributionOptions {
  outerBox: ShapeOptions;
  innerBox: ShapeOptions;
  prev?: ShapeOptionsNullable;
  next?: ShapeOptionsNullable;
}

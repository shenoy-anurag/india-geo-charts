export type ChartType = 'choropleth' | 'bubble';

export type LegendPosition = 'top-right' | 'bottom-right';

export type ExportFormat = 'png' | 'svg';

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ColorScaleConfig {
  colors: string[];
  domain?: [number, number];
}

export interface BubbleConfig {
  minRadius: number;
  maxRadius: number;
  fill?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface FontConfig {
  externalFonts?: string[];
  defaultFamily?: string;
}

export interface TooltipConfig {
  offset?: Point;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export interface AnnotationConfig {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  color?: string;
}

export interface ExportConfig {
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number;
}

export interface LegendConfig {
  show?: boolean;
  position?: LegendPosition;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface GeoFeatureProperties {
  name?: string;
  [key: string]: unknown;
}

export interface GeoFeature {
  type: 'Feature';
  id?: string | number;
  properties: GeoFeatureProperties;
  geometry: GeoGeometry;
}

export type GeoGeometry = 
  | PointGeometry
  | MultiPointGeometry
  | LineStringGeometry
  | MultiLineStringGeometry
  | PolygonGeometry
  | MultiPolygonGeometry;

export interface PointGeometry {
  type: 'Point';
  coordinates: [number, number];
}

export interface MultiPointGeometry {
  type: 'MultiPoint';
  coordinates: [number, number][];
}

export interface LineStringGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface MultiLineStringGeometry {
  type: 'MultiLineString';
  coordinates: [number, number][][];
}

export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: [number, number][][][];
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}


// TopoJSON definitions
export interface TopoTopology {
  type: 'Topology';
  objects: Record<string, any>;
  arcs: number[][][];
  transform?: { scale: [number, number]; translate: [number, number] };
  bbox?: [number, number, number, number];
}

export interface ChartDatasetItem {
  feature: GeoFeature;
  value: number;
}

export interface ChartDataset {
  label: string;
  outline: GeoFeature | GeoGeometry;
  showOutline: boolean;
  data: ChartDatasetItem[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface IndiaGeoChartOptions {
  container: HTMLElement | string;
  topoJson?: TopoTopology; // Used for projection bounds / topology data
  data: ChartData;
  chartType?: ChartType;
  
  width?: number;
  height?: number;
  padding?: number;
  
  projection?: 'mercator' | 'albers';
  projectionConfig?: {
    center?: [number, number];
    parallels?: [number, number];
    rotate?: [number, number, number];
  };
  showDistricts?: boolean;
  
  colors?: {
    fill?: string;
    border?: string;
    borderWidth?: number;
    hover?: string;
    scale?: string[];
  };
  
  bubbleConfig?: BubbleConfig;
  
  fontConfig?: FontConfig;
  
  tooltip?: TooltipConfig | false;
  formatValue?: (value: number) => string;
  tooltipContent?: (feature: GeoFeature, value: number | undefined) => string;
  
  title?: string;
  titleConfig?: AnnotationConfig;
  subtitle?: string;
  subtitleConfig?: AnnotationConfig;
  notes?: string;
  notesConfig?: AnnotationConfig;
  source?: string;
  sourceConfig?: AnnotationConfig;
  creator?: string;
  creatorConfig?: AnnotationConfig;
  watermark?: {
    text?: string;
    opacity?: number;
  } | false;
  
  legend?: LegendConfig | false;
  
  exportConfig?: ExportConfig;
  
  onHover?: (feature: GeoFeature | null, value: number | undefined, event: PointerEvent) => void;
  onClick?: (feature: GeoFeature, value: number | undefined, event: MouseEvent) => void;
  onLeave?: () => void;
}

export interface IndiaGeoChart {
  update(data: ChartData): void;
  updateTopoJson(topoJson: TopoTopology): void;
  export(format: ExportFormat): Promise<string | Blob>;
  destroy(): void;
  on(event: 'hover' | 'click' | 'leave', callback: (...args: unknown[]) => void): void;
  getContainer(): HTMLElement;
  getSVG(): SVGSVGElement | null;
}

export interface LegendItem {
  value: number;
  color: string;
  label?: string;
}

export interface BubbleData {
  feature: GeoFeature;
  centroid: Point;
  value: number;
  radius: number;
}

export interface LinearScale {
  (value: number): number;
  domain(): [number, number];
  range(): [number, number];
}

export interface ColorScale {
  (value: number): string;
  domain(): [number, number];
  colors(): string[];
  ticks(count?: number): number[];
}

export type EventCallback = {
  hover: (feature: GeoFeature | null, value: number | undefined, event: PointerEvent) => void;
  click: (feature: GeoFeature, value: number | undefined, event: MouseEvent) => void;
  leave: () => void;
};

export type EventType = keyof EventCallback;

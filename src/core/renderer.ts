import { parseGeoJson, getFeatureId } from './geojson.js';
import { createProjection } from './projection.js';
import { projectFeature, calculateFeatureCentroid, extractBoundsFromGeoJson } from './path.js';
import { createColorScale, createLinearScale, DEFAULT_COLORS } from '../utils/colors.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface TooltipConfig {
  offset: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

interface WatermarkConfig {
  text: string;
  opacity: number;
}

interface LegendConfig {
  show: boolean;
  position: 'top-right' | 'bottom-right';
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

interface AnnotationConfig {
  fontSize: number;
  fontFamily: string;
  color: string;
}

interface ChartOptions {
  container: HTMLElement;
  geoJson: any;
  data: Record<string, number>;
  chartType: 'choropleth' | 'bubble';
  width: number;
  height: number;
  padding: number;
  projection: 'mercator' | 'albers';
  projectionConfig: any;
  colors: {
    fill: string;
    border: string;
    borderWidth: number;
    hover: string;
    scale: string[];
  };
  bubbleConfig: {
    minRadius: number;
    maxRadius: number;
    fill: string;
    borderColor: string;
    borderWidth: number;
  };
  tooltip: TooltipConfig | false;
  formatValue: (v: number) => string;
  tooltipContent: (feature: any, value: number | undefined) => string;
  title: string;
  titleConfig: AnnotationConfig;
  subtitle: string;
  subtitleConfig: AnnotationConfig;
  notes: string;
  notesConfig: AnnotationConfig;
  source: string;
  sourceConfig: AnnotationConfig;
  creator: string;
  creatorConfig: AnnotationConfig;
  watermark: WatermarkConfig | false;
  legend: LegendConfig | false;
  exportConfig: {
    width: number | undefined;
    height: number | undefined;
    backgroundColor: string;
    pixelRatio: number;
  };
  onHover: (feature: any, value: number | undefined, event: PointerEvent) => void;
  onClick: (feature: any, value: number | undefined, event: MouseEvent) => void;
  onLeave: () => void;
}

export class ChartRenderer {
  private container: HTMLElement;
  private svg: SVGSVGElement | null = null;
  private featureElements: Map<string, SVGPathElement> = new Map();
  private bubbleElements: Map<string, SVGCircleElement> = new Map();
  private features: any[] = [];
  private data: Record<string, number> = {};
  private options!: ChartOptions;
  private projection: any = null;
  private colorScale: any = null;
  private bubbleScale: any = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private tooltip: HTMLDivElement | null = null;
  private hoveredFeature: any = null;
  private annotationGroup: SVGGElement | null = null;
  private legendGroup: SVGGElement | null = null;
  
  constructor(options: any) {
    if (typeof options.container === 'string') {
      const el = document.querySelector(options.container);
      if (!el) throw new Error(`Container not found: ${options.container}`);
      this.container = el as HTMLElement;
    } else {
      this.container = options.container;
    }
    
    this.initOptions(options);
    this.init();
  }
  
  private getDefaultTooltipConfig(): TooltipConfig {
    return {
      offset: { x: 15, y: 15 },
      fontSize: 12,
      fontFamily: 'sans-serif',
      backgroundColor: '#ffffff',
      borderColor: '#333333',
      textColor: '#333333',
    };
  }
  
  private getDefaultAnnotationConfig(): AnnotationConfig {
    return { fontSize: 12, fontFamily: 'sans-serif', color: '#333333' };
  }
  
  private initOptions(options: any): void {
    const tooltipConfig = options.tooltip !== false 
      ? { ...this.getDefaultTooltipConfig(), ...(options.tooltip || {}) }
      : false;
    
    const legendConfig = options.legend !== false
      ? {
          show: true,
          position: 'bottom-right' as const,
          width: 150,
          height: 15,
          fontSize: 11,
          fontFamily: 'sans-serif',
          backgroundColor: '#ffffff',
          borderColor: '#cccccc',
          borderWidth: 1,
          ...(options.legend || {})
        }
      : false;
    
    const watermarkConfig = options.watermark !== false
      ? { text: 'india-geo-charts', opacity: 0.3, ...(options.watermark || {}) }
      : false;
    
    this.options = {
      container: this.container,
      geoJson: options.geoJson,
      data: options.data || {},
      chartType: options.chartType || 'choropleth',
      width: options.width || this.container.clientWidth || 800,
      height: options.height || this.container.clientHeight || 600,
      padding: options.padding ?? 20,
      projection: options.projection || 'mercator',
      projectionConfig: options.projectionConfig || {},
      colors: {
        fill: options.colors?.fill ?? DEFAULT_COLORS.fill,
        border: options.colors?.border ?? DEFAULT_COLORS.border,
        borderWidth: options.colors?.borderWidth ?? 1,
        hover: options.colors?.hover ?? DEFAULT_COLORS.hover,
        scale: options.colors?.scale ?? DEFAULT_COLORS.scale,
      },
      bubbleConfig: {
        minRadius: options.bubbleConfig?.minRadius ?? 5,
        maxRadius: options.bubbleConfig?.maxRadius ?? 40,
        fill: options.bubbleConfig?.fill ?? '#e74c3c',
        borderColor: options.bubbleConfig?.borderColor ?? '#ffffff',
        borderWidth: options.bubbleConfig?.borderWidth ?? 2,
      },
      tooltip: tooltipConfig,
      formatValue: options.formatValue || ((v: number) => v.toLocaleString()),
      tooltipContent: options.tooltipContent,
      title: options.title || '',
      titleConfig: { ...this.getDefaultAnnotationConfig(), fontSize: 20, ...(options.titleConfig || {}) },
      subtitle: options.subtitle || '',
      subtitleConfig: { ...this.getDefaultAnnotationConfig(), fontSize: 14, color: '#666666', ...(options.subtitleConfig || {}) },
      notes: options.notes || '',
      notesConfig: { ...this.getDefaultAnnotationConfig(), fontSize: 11, color: '#999999', ...(options.notesConfig || {}) },
      source: options.source || '',
      sourceConfig: { ...this.getDefaultAnnotationConfig(), fontSize: 10, color: '#999999', ...(options.sourceConfig || {}) },
      creator: options.creator || '',
      creatorConfig: { ...this.getDefaultAnnotationConfig(), fontSize: 10, color: '#999999', ...(options.creatorConfig || {}) },
      watermark: watermarkConfig,
      legend: legendConfig,
      exportConfig: {
        width: options.exportConfig?.width,
        height: options.exportConfig?.height,
        backgroundColor: options.exportConfig?.backgroundColor || '#ffffff',
        pixelRatio: options.exportConfig?.pixelRatio ?? 2,
      },
      onHover: options.onHover || (() => {}),
      onClick: options.onClick || (() => {}),
      onLeave: options.onLeave || (() => {}),
    };
  }
  
  private init(): void {
    this.features = parseGeoJson(this.options.geoJson);
    this.data = this.options.data;
    
    this.setupProjection();
    this.createSVG();
    this.setupTooltip();
    this.render();
  }
  
  private setupProjection(): void {
    const bounds = extractBoundsFromGeoJson(this.features);
    this.projection = createProjection(
      this.options.projection,
      bounds,
      this.options.width,
      this.options.height,
      {
        ...this.options.projectionConfig,
        padding: this.options.padding,
      }
    );
    
    if (this.options.chartType === 'choropleth') {
      const values = Object.values(this.data).filter(v => isFinite(v));
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 1;
      this.colorScale = createColorScale([min, max], this.options.colors.scale);
    } else {
      const values = Object.values(this.data).filter(v => isFinite(v));
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 1;
      this.bubbleScale = createLinearScale([min, max], [this.options.bubbleConfig.minRadius, this.options.bubbleConfig.maxRadius]);
    }
  }
  
  private createSVG(): void {
    if (this.svg) {
      this.container.removeChild(this.svg);
    }
    
    this.svg = document.createElementNS(SVG_NS, 'svg');
    this.svg.setAttribute('width', String(this.options.width));
    this.svg.setAttribute('height', String(this.options.height));
    this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    this.svg.style.display = 'block';
    this.svg.style.fontFamily = 'sans-serif';
    
    const defs = document.createElementNS(SVG_NS, 'defs');
    this.svg.appendChild(defs);
    
    const mainGroup = document.createElementNS(SVG_NS, 'g');
    mainGroup.setAttribute('class', 'main-group');
    this.svg.appendChild(mainGroup);
    
    this.annotationGroup = document.createElementNS(SVG_NS, 'g');
    this.annotationGroup.setAttribute('class', 'annotations');
    this.svg.appendChild(this.annotationGroup);
    
    this.legendGroup = document.createElementNS(SVG_NS, 'g');
    this.legendGroup.setAttribute('class', 'legend');
    this.svg.appendChild(this.legendGroup);
    
    this.container.appendChild(this.svg);
  }
  
  private setupTooltip(): void {
    if (!this.options.tooltip) return;
    
    this.tooltip = document.createElement('div');
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.padding = '6px 10px';
    this.tooltip.style.backgroundColor = this.options.tooltip.backgroundColor;
    this.tooltip.style.border = `1px solid ${this.options.tooltip.borderColor}`;
    this.tooltip.style.fontSize = `${this.options.tooltip.fontSize}px`;
    this.tooltip.style.fontFamily = this.options.tooltip.fontFamily;
    this.tooltip.style.color = this.options.tooltip.textColor;
    this.tooltip.style.zIndex = '1000';
    this.tooltip.style.display = 'none';
    this.tooltip.style.whiteSpace = 'nowrap';
    this.container.style.position = 'relative';
    this.container.appendChild(this.tooltip);
  }
  
  private render(): void {
    if (!this.svg || !this.projection) return;
    
    const mainGroup = this.svg.querySelector('.main-group');
    if (!mainGroup) return;
    
    mainGroup.innerHTML = '';
    this.featureElements.clear();
    this.bubbleElements.clear();
    
    if (this.options.chartType === 'choropleth') {
      this.renderChoropleth(mainGroup);
    } else {
      this.renderBubbles(mainGroup);
    }
    
    this.renderAnnotations();
    this.renderLegend();
  }
  
  private renderChoropleth(parent: Element): void {
    for (const feature of this.features) {
      const id = getFeatureId(feature);
      const value = this.data[id];
      const color = value !== undefined && this.colorScale 
        ? this.colorScale(value) 
        : this.options.colors.fill;
      
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', projectFeature(feature, this.projection.project));
      path.setAttribute('fill', color);
      path.setAttribute('stroke', this.options.colors.border);
      path.setAttribute('stroke-width', String(this.options.colors.borderWidth));
      path.setAttribute('data-id', id);
      path.style.cursor = 'pointer';
      
      this.setupFeatureEvents(path, feature, value);
      
      parent.appendChild(path);
      this.featureElements.set(id, path);
    }
  }
  
  private renderBubbles(parent: Element): void {
    const bubbles: any[] = [];
    
    for (const feature of this.features) {
      const id = getFeatureId(feature);
      const value = this.data[id];
      
      if (value === undefined || !this.bubbleScale) continue;
      
      const centroid = calculateFeatureCentroid(feature, this.projection.project);
      const radius = this.bubbleScale(value);
      
      bubbles.push({ feature, centroid, value, radius });
    }
    
    for (const bubble of bubbles) {
      const id = getFeatureId(bubble.feature);
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', String(bubble.centroid.x));
      circle.setAttribute('cy', String(bubble.centroid.y));
      circle.setAttribute('r', String(bubble.radius));
      circle.setAttribute('fill', this.options.bubbleConfig.fill);
      circle.setAttribute('stroke', this.options.bubbleConfig.borderColor);
      circle.setAttribute('stroke-width', String(this.options.bubbleConfig.borderWidth));
      circle.setAttribute('data-id', id);
      circle.style.cursor = 'pointer';
      
      this.setupBubbleEvents(circle, bubble.feature, bubble.value);
      
      parent.appendChild(circle);
      this.bubbleElements.set(id, circle);
    }
  }
  
  private setupFeatureEvents(path: SVGPathElement, feature: any, value: number | undefined): void {
    const id = getFeatureId(feature);
    
    path.addEventListener('pointerenter', (e) => {
      this.handleHover(feature, value, e);
    });
    
    path.addEventListener('pointermove', (e) => {
      this.handlePointerMove(e);
    });
    
    path.addEventListener('pointerleave', () => {
      this.handleLeave();
    });
    
    path.addEventListener('click', (e) => {
      this.handleClick(feature, value, e);
    });
  }
  
  private setupBubbleEvents(circle: SVGCircleElement, feature: any, value: number | undefined): void {
    const id = getFeatureId(feature);
    
    circle.addEventListener('pointerenter', (e) => {
      this.handleHover(feature, value, e);
      circle.setAttribute('fill', this.options.colors.hover);
    });
    
    circle.addEventListener('pointermove', (e) => {
      this.handlePointerMove(e);
    });
    
    circle.addEventListener('pointerleave', () => {
      this.handleLeave();
      circle.setAttribute('fill', this.options.bubbleConfig.fill);
    });
    
    circle.addEventListener('click', (e) => {
      this.handleClick(feature, value, e);
    });
  }
  
  private handleHover(feature: any, value: number | undefined, event: PointerEvent): void {
    this.hoveredFeature = feature;
    
    const id = getFeatureId(feature);
    const path = this.featureElements.get(id);
    if (path) {
      path.setAttribute('fill', this.options.colors.hover);
    }
    
    if (this.tooltip && this.options.tooltip) {
      let content: string;
      if (this.options.tooltipContent) {
        content = this.options.tooltipContent(feature, value);
      } else {
        const name = feature.properties?.name || id;
        const formattedValue = value !== undefined ? this.options.formatValue(value) : 'No data';
        content = `<strong>${name}</strong>: ${formattedValue}`;
      }
      this.tooltip.innerHTML = content;
      this.tooltip.style.display = 'block';
      this.handlePointerMove(event);
    }
    
    const listeners = this.eventListeners.get('hover');
    if (listeners) {
      for (const cb of listeners) {
        cb(feature, value, event);
      }
    }
    
    this.options.onHover(feature, value, event);
  }
  
  private handlePointerMove(event: PointerEvent): void {
    if (!this.tooltip || !this.options.tooltip) return;
    
    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const offset = this.options.tooltip.offset;
    
    let left = x + offset.x;
    let top = y + offset.y;
    
    if (left + tooltipRect.width > this.options.width) {
      left = x - tooltipRect.width - offset.x;
    }
    
    if (top + tooltipRect.height > this.options.height) {
      top = y - tooltipRect.height - offset.y;
    }
    
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }
  
  private handleLeave(): void {
    const feature = this.hoveredFeature;
    
    if (feature) {
      const id = getFeatureId(feature);
      const path = this.featureElements.get(id);
      if (path) {
        const value = this.data[id];
        const color = value !== undefined && this.colorScale 
          ? this.colorScale(value) 
          : this.options.colors.fill;
        path.setAttribute('fill', color);
      }
    }
    
    this.hoveredFeature = null;
    
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
    
    const listeners = this.eventListeners.get('leave');
    if (listeners) {
      for (const cb of listeners) {
        cb();
      }
    }
    
    this.options.onLeave();
  }
  
  private handleClick(feature: any, value: number | undefined, event: MouseEvent): void {
    const listeners = this.eventListeners.get('click');
    if (listeners) {
      for (const cb of listeners) {
        cb(feature, value, event);
      }
    }
    
    this.options.onClick(feature, value, event);
  }
  
  private renderAnnotations(): void {
    if (!this.annotationGroup) return;
    this.annotationGroup.innerHTML = '';
    
    let yOffset = 20;
    
    if (this.options.title) {
      const title = this.createText(
        this.options.title,
        this.options.width / 2,
        yOffset,
        this.options.titleConfig,
        'middle'
      );
      this.annotationGroup.appendChild(title);
      yOffset += this.options.titleConfig.fontSize + 10;
    }
    
    if (this.options.subtitle) {
      const subtitle = this.createText(
        this.options.subtitle,
        this.options.width / 2,
        yOffset,
        this.options.subtitleConfig,
        'middle'
      );
      this.annotationGroup.appendChild(subtitle);
      yOffset += this.options.subtitleConfig.fontSize + 5;
    }
    
    if (this.options.notes) {
      const notes = this.createText(
        this.options.notes,
        this.options.width - 10,
        this.options.height - 10,
        this.options.notesConfig,
        'end'
      );
      notes.setAttribute('text-anchor', 'end');
      this.annotationGroup.appendChild(notes);
    }
    
    let bottomY = this.options.height - 10;
    
    if (this.options.source) {
      const source = this.createText(
        `Source: ${this.options.source}`,
        10,
        bottomY,
        this.options.sourceConfig,
        'start'
      );
      this.annotationGroup.appendChild(source);
      bottomY -= this.options.sourceConfig.fontSize + 5;
    }
    
    if (this.options.creator) {
      const creator = this.createText(
        `Created by: ${this.options.creator}`,
        10,
        bottomY,
        this.options.creatorConfig,
        'start'
      );
      this.annotationGroup.appendChild(creator);
    }
    
    if (this.options.watermark) {
      const watermark = this.createText(
        this.options.watermark.text,
        this.options.width - 10,
        this.options.height - 10,
        {
          fontSize: 10,
          fontFamily: 'sans-serif',
          color: `rgba(128, 128, 128, ${this.options.watermark.opacity})`,
        },
        'end'
      );
      watermark.setAttribute('opacity', String(this.options.watermark.opacity));
      this.annotationGroup.appendChild(watermark);
    }
  }
  
  private createText(
    text: string,
    x: number,
    y: number,
    config: AnnotationConfig,
    anchor: 'start' | 'middle' | 'end'
  ): SVGTextElement {
    const el = document.createElementNS(SVG_NS, 'text');
    el.setAttribute('x', String(x));
    el.setAttribute('y', String(y));
    el.setAttribute('font-size', String(config.fontSize));
    el.setAttribute('font-family', config.fontFamily);
    el.setAttribute('fill', config.color);
    el.setAttribute('text-anchor', anchor);
    el.textContent = text;
    return el;
  }
  
  private renderLegend(): void {
    if (!this.legendGroup || !this.options.legend || !this.options.legend.show) {
      if (this.legendGroup) this.legendGroup.innerHTML = '';
      return;
    }
    
    this.legendGroup.innerHTML = '';
    
    const legend = this.options.legend;
    const isChoropleth = this.options.chartType === 'choropleth';
    
    let legendX: number, legendY: number;
    
    if (legend.position === 'top-right') {
      legendX = this.options.width - legend.width - 20;
      legendY = 20;
    } else {
      legendX = this.options.width - legend.width - 20;
      legendY = this.options.height - 80;
    }
    
    const legendG = document.createElementNS(SVG_NS, 'g');
    legendG.setAttribute('transform', `translate(${legendX}, ${legendY})`);
    
    const bg = document.createElementNS(SVG_NS, 'rect');
    bg.setAttribute('x', '-5');
    bg.setAttribute('y', '-5');
    bg.setAttribute('width', String(legend.width + 10));
    bg.setAttribute('height', String(legend.height + (isChoropleth ? 30 : 40) + 10));
    bg.setAttribute('fill', legend.backgroundColor);
    bg.setAttribute('stroke', legend.borderColor);
    bg.setAttribute('stroke-width', String(legend.borderWidth));
    bg.setAttribute('rx', '3');
    legendG.appendChild(bg);
    
    if (isChoropleth && this.colorScale) {
      const defs = this.svg?.querySelector('defs');
      const gradientId = 'legend-gradient';
      
      let existingGradient = defs?.querySelector(`#${gradientId}`);
      if (existingGradient) defs?.removeChild(existingGradient);
      
      const gradient = document.createElementNS(SVG_NS, 'linearGradient');
      gradient.setAttribute('id', gradientId);
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '100%');
      gradient.setAttribute('x2', '0%');
      gradient.setAttribute('y2', '0%');
      
      const colors = this.options.colors.scale;
      for (const [i, color] of colors.entries()) {
        const stop = document.createElementNS(SVG_NS, 'stop');
        const offset = colors.length > 1 ? (i / (colors.length - 1)) * 100 : 0;
        stop.setAttribute('offset', `${offset}%`);
        stop.setAttribute('stop-color', color);
        gradient.appendChild(stop);
      }
      
      defs?.appendChild(gradient);
      
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', '0');
      rect.setAttribute('width', String(legend.width));
      rect.setAttribute('height', String(legend.height));
      rect.setAttribute('fill', `url(#${gradientId})`);
      legendG.appendChild(rect);
      
      const [minVal, maxVal] = this.colorScale.domain();
      
      const minLabel = this.createText(
        this.options.formatValue(minVal),
        0,
        legend.height + 15,
        { fontSize: legend.fontSize, fontFamily: legend.fontFamily, color: '#666666' },
        'start'
      );
      minLabel.setAttribute('dominant-baseline', 'hanging');
      legendG.appendChild(minLabel);
      
      const maxLabel = this.createText(
        this.options.formatValue(maxVal),
        legend.width,
        legend.height + 15,
        { fontSize: legend.fontSize, fontFamily: legend.fontFamily, color: '#666666' },
        'end'
      );
      maxLabel.setAttribute('dominant-baseline', 'hanging');
      legendG.appendChild(maxLabel);
      
    } else if (!isChoropleth && this.bubbleScale) {
      const [minVal, maxVal] = this.bubbleScale.domain();
      const minR = this.options.bubbleConfig.minRadius;
      const maxR = this.options.bubbleConfig.maxRadius;
      
      const circle1 = document.createElementNS(SVG_NS, 'circle');
      circle1.setAttribute('cx', String(minR + 5));
      circle1.setAttribute('cy', String(maxR + 5));
      circle1.setAttribute('r', String(minR));
      circle1.setAttribute('fill', this.options.bubbleConfig.fill);
      circle1.setAttribute('stroke', this.options.bubbleConfig.borderColor);
      circle1.setAttribute('stroke-width', String(this.options.bubbleConfig.borderWidth));
      legendG.appendChild(circle1);
      
      const label1 = this.createText(
        this.options.formatValue(minVal),
        minR * 2 + 15,
        maxR + 5,
        { fontSize: legend.fontSize, fontFamily: legend.fontFamily, color: '#666666' },
        'start'
      );
      label1.setAttribute('dominant-baseline', 'middle');
      legendG.appendChild(label1);
      
      const circle2 = document.createElementNS(SVG_NS, 'circle');
      circle2.setAttribute('cx', String(maxR * 2 + 5));
      circle2.setAttribute('cy', String(maxR + 5));
      circle2.setAttribute('r', String(maxR));
      circle2.setAttribute('fill', this.options.bubbleConfig.fill);
      circle2.setAttribute('stroke', this.options.bubbleConfig.borderColor);
      circle2.setAttribute('stroke-width', String(this.options.bubbleConfig.borderWidth));
      legendG.appendChild(circle2);
      
      const label2 = this.createText(
        this.options.formatValue(maxVal),
        maxR * 4 + 15,
        maxR + 5,
        { fontSize: legend.fontSize, fontFamily: legend.fontFamily, color: '#666666' },
        'start'
      );
      label2.setAttribute('dominant-baseline', 'middle');
      legendG.appendChild(label2);
    }
    
    this.legendGroup.appendChild(legendG);
  }
  
  public update(data: Record<string, number>): void {
    this.data = data;
    
    if (this.options.chartType === 'choropleth') {
      const values = Object.values(data).filter(v => isFinite(v));
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        this.colorScale = createColorScale([min, max], this.options.colors.scale);
      }
      
      for (const [id, path] of this.featureElements) {
        const value = this.data[id];
        const color = value !== undefined && this.colorScale 
          ? this.colorScale(value) 
          : this.options.colors.fill;
        path.setAttribute('fill', color);
      }
    } else {
      const values = Object.values(data).filter(v => isFinite(v));
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        this.bubbleScale = createLinearScale([min, max], [this.options.bubbleConfig.minRadius, this.options.bubbleConfig.maxRadius]);
      }
      
      for (const [id, circle] of this.bubbleElements) {
        const value = this.data[id];
        if (value !== undefined && this.bubbleScale) {
          const radius = this.bubbleScale(value);
          circle.setAttribute('r', String(radius));
        }
      }
    }
    
    this.renderLegend();
  }
  
  public updateGeoJson(geoJson: any): void {
    this.features = parseGeoJson(geoJson);
    this.setupProjection();
    this.createSVG();
    this.render();
  }
  
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  
  public getContainer(): HTMLElement {
    return this.container;
  }
  
  public getSVG(): SVGSVGElement | null {
    return this.svg;
  }
  
  public async export(format: 'png' | 'svg'): Promise<string | Blob> {
    if (!this.svg) throw new Error('SVG not initialized');
    
    if (format === 'svg') {
      const clone = this.svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('xmlns', SVG_NS);
      return new XMLSerializer().serializeToString(clone);
    }
    
    return this.exportPNG();
  }
  
  private async exportPNG(): Promise<Blob> {
    if (!this.svg) throw new Error('SVG not initialized');
    
    const pixelRatio = this.options.exportConfig.pixelRatio;
    const width = this.options.exportConfig.width ?? this.options.width;
    const height = this.options.exportConfig.height ?? this.options.height;
    
    const svgClone = this.svg.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('width', String(width));
    svgClone.setAttribute('height', String(height));
    svgClone.setAttribute('xmlns', SVG_NS);
    
    const svgString = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        if (this.options.exportConfig.backgroundColor) {
          ctx.fillStyle = this.options.exportConfig.backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.scale(pixelRatio, pixelRatio);
        ctx.drawImage(img, 0, 0, width, height);
        
        URL.revokeObjectURL(svgUrl);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG for PNG export'));
      };
      
      img.src = svgUrl;
    });
  }
  
  public destroy(): void {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    
    this.eventListeners.clear();
    this.featureElements.clear();
    this.bubbleElements.clear();
  }
}

export function createChart(options: any): ChartRenderer {
  return new ChartRenderer(options);
}

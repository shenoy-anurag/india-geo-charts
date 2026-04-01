import { type ColorScale, type LinearScale } from "../types.js";

export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1] ?? '0', 16),
    parseInt(result[2] ?? '0', 16),
    parseInt(result[3] ?? '0', 16)
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function interpolateColor(color1: string, color2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  
  const r = r1 + (r2 - r1) * t;
  const g = g1 + (g2 - g1) * t;
  const b = b1 + (b2 - b1) * t;
  
  return rgbToHex(r, g, b);
}

export function interpolateColors(colors: string[], t: number): string {
  if (colors.length === 0) return '#000000';
  if (colors.length === 1) return colors[0] ?? '#000000';
  
  t = Math.max(0, Math.min(1, t));
  
  const scaledT = t * (colors.length - 1);
  const index = Math.floor(scaledT);
  const remainder = scaledT - index;
  
  const color1 = colors[index] ?? '#000000';
  const color2 = colors[Math.min(index + 1, colors.length - 1)] ?? color1;
  
  if (index >= colors.length - 1) return color2;
  
  return interpolateColor(color1, color2, remainder);
}

export function createLinearScale(
  domain: [number, number] = [0, 1],
  range: [number, number] = [0, 1]
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  
  const scale: LinearScale = ((value: number): number => {
    const t = d1 === d0 ? 0 : (value - d0) / (d1 - d0);
    return r0 + (r1 - r0) * t;
  }) as LinearScale;
  
  scale.domain = () => [d0, d1] as [number, number];
  scale.range = () => [r0, r1] as [number, number];
  
  return scale;
}

export function createColorScale(
  domain: [number, number],
  colors: string[]
): ColorScale {
  const linearScale = createLinearScale(domain, [0, 1]);
  
  const scale: ColorScale = ((value: number): string => {
    const t = linearScale(value);
    return interpolateColors(colors, t);
  }) as ColorScale;
  
  scale.domain = () => [...domain] as [number, number];
  scale.colors = () => [...colors];
  
  scale.ticks = (count = 5): number[] => {
    const [min, max] = domain;
    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, i) => min + step * i);
  };
  
  return scale;
}

export function createQuantileScale(
  values: number[],
  colors: string[]
): (value: number) => string {
  const sorted = [...values].filter(v => isFinite(v)).sort((a, b) => a - b);
  const quantiles: number[] = [];
  
  for (let i = 1; i < colors.length; i++) {
    const index = (i / colors.length) * sorted.length;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const frac = index - lower;
    
    if (lower >= sorted.length) {
      quantiles.push(sorted[sorted.length - 1] ?? 0);
    } else if (upper >= sorted.length) {
      quantiles.push(sorted[lower] ?? 0);
    } else {
      quantiles.push((sorted[lower] ?? 0) * (1 - frac) + (sorted[upper] ?? 0) * frac);
    }
  }
  
  return (value: number): string => {
    for (let i = 0; i < quantiles.length; i++) {
      if (value <= quantiles[i]) {
        return colors[i] ?? '#000000';
      }
    }
    return colors[colors.length - 1] ?? '#000000';
  };
}

export const DEFAULT_COLORS = {
  fill: '#e0e0e0',
  border: '#ffffff',
  hover: '#333333',
  scale: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']
};

export const COLOR_PALETTES = {
  sequential: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
  viridis: ['#440154', '#482878', '#3e4a89', '#31688e', '#26838f', '#1f9d89', '#6cce5a', '#b6de2b', '#fee825'],
  inferno: ['#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60', '#cf4446', '#ed6925', '#fb9b06', '#f7d13d'],
  plasma: ['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26'],
  blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
  greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
  reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
};

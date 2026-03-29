import { useEffect, useRef, useState, useCallback } from 'react';
import type { IndiaGeoChartOptions, IndiaGeoChart } from '../types.js';
import { ChartRenderer } from '../core/renderer.js';

export interface UseIndiaGeoChartOptions extends Omit<IndiaGeoChartOptions, 'container'> {
  containerId?: string;
}

export interface UseIndiaGeoChartReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  chart: IndiaGeoChart | null;
  isLoading: boolean;
  error: Error | null;
  update: (data: import('../types.js').ChartData) => void;
  updateTopoJson: (topoJson: IndiaGeoChartOptions['topoJson']) => void;
  exportChart: (format: 'png' | 'svg') => Promise<string | Blob>;
  destroy: () => void;
}

export function useIndiaGeoChart(options: UseIndiaGeoChartOptions): UseIndiaGeoChartReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IndiaGeoChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) {
      setError(new Error('Container not available'));
      return;
    }
    
    let mounted = true;
    
    try {
      const chart = new ChartRenderer({
        ...options,
        container: containerRef.current
      } as IndiaGeoChartOptions);
      
      if (mounted) {
        chartRef.current = chart as unknown as IndiaGeoChart;
        setIsLoading(false);
      }
      
      return () => {
        mounted = false;
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    } catch (err) {
      if (mounted) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    }
  }, []);
  
  useEffect(() => {
    if (chartRef.current && options.data) {
      chartRef.current.update(options.data);
    }
  }, [options.data]);
  
  const update = useCallback((data: import('../types.js').ChartData) => {
    chartRef.current?.update(data);
  }, []);
  
  const updateTopoJson = useCallback((topoJson: IndiaGeoChartOptions['topoJson']) => {
    if (topoJson) {
      chartRef.current?.updateTopoJson(topoJson);
    }
  }, []);
  
  const exportChart = useCallback(async (format: 'png' | 'svg') => {
    if (!chartRef.current) throw new Error('Chart not initialized');
    return chartRef.current.export(format);
  }, []);
  
  const destroy = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  }, []);
  
  return {
    containerRef,
    chart: chartRef.current,
    isLoading,
    error,
    update,
    updateTopoJson,
    exportChart,
    destroy
  };
}

export interface IndiaMapProps extends UseIndiaGeoChartOptions {
  className?: string;
  style?: React.CSSProperties;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function IndiaMap({
  className,
  style,
  containerProps,
  ...options
}: IndiaMapProps) {
  const { containerRef, isLoading, error } = useIndiaGeoChart(options);
  
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative' as const,
        width: options.width ?? 800,
        height: options.height ?? 600,
        ...style
      }}
      {...containerProps}
    >
      {isLoading && (
        <div style={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666'
        }}>
          Loading...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#c00'
        }}>
          Error: {error.message}
        </div>
      )}
    </div>
  );
}

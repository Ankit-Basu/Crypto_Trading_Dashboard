declare module 'lightweight-charts' {
  export interface ChartOptions {
    width?: number;
    height?: number;
    layout?: {
      background?: {
        type: ColorType;
        color: string;
      };
      textColor?: string;
    };
    grid?: {
      vertLines?: {
        color?: string;
      };
      horzLines?: {
        color?: string;
      };
    };
    timeScale?: {
      timeVisible?: boolean;
      borderColor?: string;
    };
  }

  export interface SeriesOptions {
    color?: string;
    lineWidth?: number;
  }

  export interface ChartData {
    time: number | string;
    value: number;
  }

  export enum ColorType {
    Solid = 0
  }

  export interface IChartApi {
    applyOptions(options: Partial<ChartOptions>): void;
    addLineSeries(options?: Partial<SeriesOptions>): ISeriesApi<'Line'>;
    remove(): void;
  }

  export interface ISeriesApi<T extends string> {
    setData(data: ChartData[]): void;
  }

  export function createChart(container: HTMLElement, options?: Partial<ChartOptions>): IChartApi;
}
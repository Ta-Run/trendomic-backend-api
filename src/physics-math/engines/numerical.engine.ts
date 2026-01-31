import { Injectable } from '@nestjs/common';

interface NumericalParams {
  sample?: boolean;
  x?: number[];
  y?: number[];
}

@Injectable()

export class NumericalEngine {
  sum(data: number[]): number {
    return data.reduce((a, b) => a + b, 0);
  }

  mean(data: number[]): number {
    if (data.length === 0) throw new Error('Empty data');
    return this.sum(data) / data.length;
  }

  variance(data: number[], sample = false): number {
    const m = this.mean(data);
    const sqDiffs = data.map((x) => (x - m) ** 2);
    const n = sample ? data.length - 1 : data.length;
    if (n <= 0) throw new Error('Insufficient data');
    return sqDiffs.reduce((a, b) => a + b, 0) / n;
  }

  std(data: number[], sample = false): number {
    return Math.sqrt(this.variance(data, sample));
  }

  integrateTrapezoidal(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) throw new Error('Invalid data for integration');
    let integral = 0;
    for (let i = 0; i < x.length - 1; i++) {
      integral += ((y[i] + y[i + 1]) / 2) * (x[i + 1] - x[i]);
    }
    return integral;
  }

  differentiate(x: number[], y: number[]): number[] {
    if (x.length !== y.length || x.length < 2) throw new Error('Invalid data');
    const dydx: number[] = [];
    for (let i = 0; i < x.length; i++) {
      if (i === 0) {
        dydx.push((y[1] - y[0]) / (x[1] - x[0]));
      } else if (i === x.length - 1) {
        dydx.push((y[i] - y[i - 1]) / (x[i] - x[i - 1]));
      } else {
        dydx.push((y[i + 1] - y[i - 1]) / (x[i + 1] - x[i - 1]));
      }
    }
    return dydx;
  }

  compute(
  operation: string,
  data: number[] = [],
  params?: NumericalParams
): unknown {
    const d = data ?? [];
    switch (operation.toLowerCase()) {
      case 'sum':
        return this.sum(d);
      case 'mean':
      case 'average':
        return this.mean(d);
      case 'variance':
        const isSample = params?.sample ?? false;
return this.variance(d, isSample);
      case 'std':
      case 'standard_deviation':
        // return this.std(d, params?.sample as boolean);
        const isStd = params?.sample ?? false;
return this.std(d, isStd);
      case 'min':
        return d.length ? Math.min(...d) : null;
      case 'max':
        return d.length ? Math.max(...d) : null;
      case 'integrate':
        if (params?.x && params?.y) {
          return this.integrateTrapezoidal(params.x as number[], params.y as number[]);
        }
        throw new Error('integrate requires params.x and params.y');
      case 'differentiate':
        if (params?.x && params?.y) {
          return this.differentiate(params.x as number[], params.y as number[]);
        }
        throw new Error('differentiate requires params.x and params.y');
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
}

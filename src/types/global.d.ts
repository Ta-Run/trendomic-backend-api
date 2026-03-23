declare module 'ml-regression' {
  export class PolynomialRegression {
    constructor(x: number[], y: number[], degree: number);
    coefficients: number[];
    score(x: number[], y: number[]): { r2: number };
  }
}

declare module 'fft.js' {
  export default class FFT {
    constructor(N: number);
    createComplexArray(): number[];
    realTransform(out: number[], input: number[]): void;
    completeSpectrum(out: number[]): void;
  }
}

declare module 'graphology-metrics/centrality/pagerank' {
  function pagerank(graph: any): Record<string, number>;
  export = pagerank;
}

declare module 'jstat' {
  export const jStat: {
    normal: {
      inv(p: number, mean: number, sd: number): number;
    };
  };
}

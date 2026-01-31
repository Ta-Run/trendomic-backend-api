import { Injectable } from '@nestjs/common';

@Injectable()
export class VectorEngine {
  dot(a: number[], b: number[]): number {
    if (a.length !== b.length) throw new Error('Vectors must have same length');
    return a.reduce((sum, x, i) => sum + x * b[i], 0);
  }

  cross(a: number[], b: number[]): number[] {
    if (a.length !== 3 && b.length !== 3) throw new Error('Cross product requires 3D vectors');
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  add(...vectors: number[][]): number[] {
    const n = vectors[0].length;
    if (vectors.some((v) => v.length !== n)) throw new Error('Vectors must have same length');
    return vectors[0].map((_, i) => vectors.reduce((s, v) => s + v[i], 0));
  }

  scale(v: number[], k: number): number[] {
    return v.map((x) => x * k);
  }

  magnitude(v: number[]): number {
    return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  }

  linearCombination(vectors: number[][], coeffs: number[]): number[] {
    if (vectors.length !== coeffs.length) throw new Error('Vectors and coefficients length mismatch');
    return vectors.reduce(
      (acc, v, i) => this.add(acc, this.scale(v, coeffs[i])),
      new Array(vectors[0].length).fill(0),
    );
  }
}

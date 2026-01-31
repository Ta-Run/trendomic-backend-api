import { Injectable } from '@nestjs/common';

@Injectable()
export class MatrixEngine {
  multiply(A: number[][], B: number[][]): number[][] {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    if (colsA !== B.length) throw new Error('Matrix dimensions incompatible');
    const C: number[][] = [];
    for (let i = 0; i < rowsA; i++) {
      C[i] = [];
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) sum += A[i][k] * B[k][j];
        C[i][j] = sum;
      }
    }
    return C;
  }

  determinant(M: number[][]): number {
    const n = M.length;
    if (n !== M[0]?.length) throw new Error('Matrix must be square');
    if (n === 1) return M[0][0];
    if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];
    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = M.slice(1).map((row) => row.filter((_, c) => c !== j));
      det += (j % 2 === 0 ? 1 : -1) * M[0][j] * this.determinant(minor);
    }
    return det;
  }

  inverse(M: number[][]): number[][] {
    const n = M.length;
    if (n !== M[0]?.length) throw new Error('Matrix must be square');
    const det = this.determinant(M);
    if (Math.abs(det) < 1e-10) throw new Error('Matrix is singular');
    const adj: number[][] = [];
    for (let i = 0; i < n; i++) {
      adj[i] = [];
      for (let j = 0; j < n; j++) {
        const minor = M.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
        adj[i][j] = ((i + j) % 2 === 0 ? 1 : -1) * this.determinant(minor);
      }
    }
    const adjT = this.transpose(adj);
    return adjT.map((row) => row.map((x) => x / det));
  }

  transpose(M: number[][]): number[][] {
    return M[0].map((_, j) => M.map((row) => row[j]));
  }

  add(A: number[][], B: number[][]): number[][] {
    if (A.length !== B.length || A[0].length !== B[0].length) throw new Error('Same dimensions required');
    return A.map((row, i) => row.map((x, j) => x + B[i][j]));
  }
}

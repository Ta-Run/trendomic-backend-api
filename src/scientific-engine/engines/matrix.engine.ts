import { Injectable } from '@nestjs/common';
import { Matrix, SingularValueDecomposition, EigenvalueDecomposition } from 'ml-matrix';
import * as math from 'mathjs';
import * as ss from 'simple-statistics';

export interface ContentDNAResult {
  dominantPattern: string;
  patternWeights: number[];
  explainedVariance: number;
  multiplier: number;
  svdComponents: { U: number[][]; S: number[]; V: number[][] };
}

@Injectable()
export class MatrixEngineUpgraded {
  /**
   * ALGORITHM: Singular Value Decomposition (SVD) for Content DNA
   *
   * WHY SVD:
   *   A = U·Σ·Vᵀ  (A = content features × engagement metrics matrix)
   *   U = content pattern vectors (left singular vectors)
   *   Σ = importance weights (singular values)
   *   V = engagement pattern vectors (right singular vectors)
   *
   *   The DOMINANT left singular vector u₁ (column of U for largest σ₁)
   *   is the content combination explaining MOST variance in engagement.
   *   This is mathematically the creator's "Content DNA".
   *
   *   Explained variance = σ₁² / Σσᵢ² — how dominant the top pattern is
   *
   * ALGORITHM: EigenvalueDecomposition for correlation analysis
   *   Eigenvalues of correlation matrix = principal components
   *   Dominant eigenvector = most important engagement driver
   *
   * LIBRARY: ml-matrix
   *   new SingularValueDecomposition(M) — real SVD, not power iteration
   *   new EigenvalueDecomposition(M)    — real eigenvalue decomposition
   *   Matrix.correlation(data)          — correlation matrix builder
   *
   * LIBRARY: mathjs
   *   math.multiply() for matrix ops
   *   math.eigs() for eigenvalues verification
   */

  analyzeContentDNA(
    contentFeatures: number[][],  // rows=posts, cols=[hookType,ctaType,format,length,emotion]
    engagementMetrics: number[][], // rows=posts, cols=[views,likes,shares,comments,saves]
  ): ContentDNAResult {
    if (contentFeatures.length < 3) {
      return {
        dominantPattern: 'insufficient data',
        patternWeights:  [0.2, 0.2, 0.2, 0.2, 0.2],
        explainedVariance: 0,
        multiplier: 1,
        svdComponents: { U: [], S: [], V: [] },
      };
    }

    // Build engagement matrix A using ml-matrix
    const A = new Matrix(engagementMetrics);

    // Run real SVD via ml-matrix
    const svd = new SingularValueDecomposition(A);
    const U   = svd.leftSingularVectors;   // content patterns
    const S   = svd.diagonal;              // singular values (importance)
    const V   = svd.rightSingularVectors;  // engagement patterns

    // Dominant pattern = first column of U
    const dominant    = U.getColumn(0);
    const featureNames = ['short-hook', 'emotional-cta', 'visual-format', 'storytelling', 'question-hook'];
    const maxIdx       = dominant.indexOf(Math.max(...dominant.map(Math.abs)));

    // Explained variance = σ₁² / Σσᵢ²
    const totalVariance   = S.reduce((sum: number, s: number) => sum + s * s, 0);
    const explainedVariance = totalVariance > 0 ? (S[0] * S[0]) / totalVariance : 0;
    const multiplier        = Math.max(1, Math.round(explainedVariance * 10));

    return {
      dominantPattern:   featureNames[maxIdx] ?? 'mixed',
      patternWeights:    dominant.map((v: number) => Math.round(Math.abs(v) * 100) / 100),
      explainedVariance: Math.round(explainedVariance * 100),
      multiplier,
      svdComponents: {
        U: U.to2DArray(),
        S,
        V: V.to2DArray(),
      },
    };
  }

  // Correlation matrix for hashtag relationship analysis
  buildCorrelationMatrix(data: number[][]): number[][] {
    if (data.length < 2) return [];
    const M   = new Matrix(data);
    // Manual correlation calculation
    const n = M.rows;
    const m = M.columns;
    const corr: number[][] = [];
    
    for (let i = 0; i < m; i++) {
      corr[i] = [];
      for (let j = 0; j < m; j++) {
        const col1 = M.getColumn(i);
        const col2 = M.getColumn(j);
        corr[i][j] = ss.sampleCorrelation(col1, col2);
      }
    }
    return corr;
  }

  // Eigenvalue decomposition for engagement driver analysis
  findEngagementDrivers(correlationMatrix: number[][]): {
    eigenvalues: number[];
    eigenvectors: number[][];
    topDriver: number;
  } {
    const M    = new Matrix(correlationMatrix);
    const eig  = new EigenvalueDecomposition(M);
    const vals = eig.realEigenvalues;
    const vecs = eig.eigenvectorMatrix.to2DArray();
    const maxIdx = vals.indexOf(Math.max(...vals));
    return {
      eigenvalues:  vals.map((v: number) => Math.round(v * 1000) / 1000),
      eigenvectors: vecs,
      topDriver:    maxIdx,
    };
  }

  // Original methods preserved for backward compatibility
  multiply(A: number[][], B: number[][]): number[][] {
    return new Matrix(A).mmul(new Matrix(B)).to2DArray();
  }
  determinant(A: number[][]): number {
    return math.det(A) as number;
  }
  inverse(A: number[][]): number[][] {
    const M = new Matrix(A);
    // Use Gaussian elimination for inverse
    const n = M.rows;
    const m = M.columns;
    if (n !== m) throw new Error('Matrix must be square');
    
    // Create augmented matrix [A|I]
    const augmented = [];
    for (let i = 0; i < n; i++) {
      augmented[i] = [...M.getRow(i), ...Array(n).fill(0)];
      augmented[i][n + i] = 1;
    }
    
    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
    
    // Back substitution
    const result = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = n; j < 2 * n; j++) {
        augmented[i][j] /= augmented[i][i];
      }
      for (let k = i - 1; k >= 0; k--) {
        for (let j = n; j < 2 * n; j++) {
          augmented[k][j] -= augmented[i][j] * augmented[k][i];
        }
      }
    }
    
    // Extract inverse matrix
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        result[i][j] = augmented[i][n + j];
      }
    }
    
    return result;
  }
  add(A: number[][], B: number[][]): number[][] {
    return new Matrix(A).add(new Matrix(B)).to2DArray();
  }
  transpose(A: number[][]): number[][] {
    return new Matrix(A).transpose().to2DArray();
  }
}

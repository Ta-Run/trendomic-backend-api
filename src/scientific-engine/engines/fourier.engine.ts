import { Injectable } from '@nestjs/common';
import FFT from 'fft.js';
import * as ss from 'simple-statistics';

export interface FourierResult {
  dominantFrequencies: { frequency: number; amplitude: number; periodHours: number }[];
  optimalPostingTimes: number[];
  audienceRhythmPattern: string;
  peakEngagementHours: number[];
  spectralEntropy: number;
}

@Injectable()
export class FourierEngine {
  /**
   * ALGORITHM: Fast Fourier Transform (Cooley-Tukey algorithm)
   *
   * WHY FFT over manual DFT:
   *   DFT: O(N²) operations — for N=168 (1 week hourly): 28,224 ops
   *   FFT: O(N log N) operations — for N=168: ~1,176 ops — 24x faster
   *   Cooley-Tukey FFT divides N-point DFT into two N/2-point DFTs recursively.
   *
   * WHAT IT DOES:
   *   Input: engagement time series x[0..N-1] (hourly engagement values)
   *   Output: X[k] = complex amplitude at frequency k/N cycles per sample
   *
   *   |X[k]| = amplitude (strength of rhythm at that frequency)
   *   k/N   = cycles per hour
   *   N/k   = period in hours
   *
   * DOMINANT FREQUENCY:
   *   k such that |X[k]| is maximum (excluding DC component k=0)
   *   Period = N/k hours
   *   If period ≈ 24: strong daily rhythm
   *   If period ≈ 168: strong weekly rhythm
   *
   * SPECTRAL ENTROPY:
   *   H = -Σ (|X[k]|/Σ|X[j]|) · log(|X[k]|/Σ|X[j]|)
   *   High spectral entropy = irregular audience (unpredictable)
   *   Low spectral entropy  = rhythmic audience (schedulable)
   *
   * LIBRARY: fft.js — Cooley-Tukey FFT, returns real+imaginary arrays
   * LIBRARY: simple-statistics — ss.mean() for peak detection
   */

  private nextPowerOf2(n: number): number {
    let p = 1;
    while (p < n) p <<= 1;
    return p;
  }

  analyzeAudienceRhythm(hourlyEngagement: number[]): FourierResult {
    if (hourlyEngagement.length < 24) {
      return {
        dominantFrequencies: [{ frequency: 1 / 24, amplitude: 1, periodHours: 24 }],
        optimalPostingTimes: [7, 12, 19],
        audienceRhythmPattern: 'insufficient data — using platform average',
        peakEngagementHours:   [7, 12, 19],
        spectralEntropy:       1.0,
      };
    }

    // Pad to next power of 2 for FFT
    const N       = this.nextPowerOf2(hourlyEngagement.length);
    const padded  = [...hourlyEngagement, ...new Array(N - hourlyEngagement.length).fill(0)];
    const fft     = new FFT(N);
    const out     = fft.createComplexArray();
    fft.realTransform(out, padded);
    fft.completeSpectrum(out);

    // Compute magnitudes: |X[k]| = sqrt(re² + im²)
    const magnitudes: number[] = [];
    for (let k = 0; k < N / 2; k++) {
      const re  = out[2 * k];
      const im  = out[2 * k + 1];
      magnitudes.push(Math.sqrt(re * re + im * im));
    }

    // Find top 3 dominant frequencies (skip DC at k=0)
    const freqData = magnitudes.slice(1).map((amp, k) => ({
      k: k + 1, amp,
      frequency:   (k + 1) / N,
      periodHours: N / (k + 1),
    }));
    freqData.sort((a, b) => b.amp - a.amp);
    const top3 = freqData.slice(0, 3);

    // Reconstruct signal from dominant frequencies
    const reconstructed = Array.from({ length: N }, (_, n) =>
      top3.reduce((sum, f) =>
        sum + f.amp * Math.cos(2 * Math.PI * f.k * n / N), 0),
    );

    // Peak posting times = top 5 hours in reconstructed signal
    const peakEngagementHours = reconstructed
      .slice(0, Math.min(N, hourlyEngagement.length))
      .map((v, i) => ({ v, h: i % 24 }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 5)
      .map(x => x.h)
      .filter((v, i, a) => a.indexOf(v) === i);

    // Spectral entropy using simple-statistics
    const totalPower  = ss.sum(magnitudes.slice(1));
    const normalised  = magnitudes.slice(1).map(m => m / (totalPower + 1e-10));
    const spectralEntropy = -normalised.reduce((h, p) =>
      h + (p > 0 ? p * Math.log2(p) : 0), 0,
    ) / Math.log2(normalised.length);

    let pattern = 'irregular';
    if (top3[0]?.periodHours > 20 && top3[0]?.periodHours < 28) pattern = 'strong daily rhythm';
    else if (top3[0]?.periodHours > 160 && top3[0]?.periodHours < 180) pattern = 'strong weekly rhythm';

    return {
      dominantFrequencies: top3.map(f => ({
        frequency:   Math.round(f.frequency * 1000) / 1000,
        amplitude:   Math.round(f.amp),
        periodHours: Math.round(f.periodHours * 10) / 10,
      })),
      optimalPostingTimes: peakEngagementHours,
      audienceRhythmPattern: pattern,
      peakEngagementHours,
      spectralEntropy: Math.round(spectralEntropy * 1000) / 1000,
    };
  }
}

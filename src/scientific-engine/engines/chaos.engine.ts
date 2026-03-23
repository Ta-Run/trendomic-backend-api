import { Injectable } from '@nestjs/common';
import * as ss from 'simple-statistics';
import * as math from 'mathjs';

export interface ChaosResult {
  lyapunovExponent: number;
  isChaoticWindow: boolean;
  alert: string;
  confidence: number;
  bifurcationRegime: string;
  postingRecommendation: string;
  autocorrelation: number;
}

@Injectable()
export class ChaosEngine {
  /**
   * ALGORITHM 1: Lyapunov Exponent
   *
   * WHY: λ > 0 means nearby trajectories diverge exponentially.
   *      In content terms: small change in hook causes viral explosion.
   *      This is the butterfly effect, quantified.
   *
   * λ = (1/n) · Σ ln|f'(xᵢ)|
   *   For logistic map f(x)=rx(1-x): f'(x) = r(1-2x)
   *   λ > 0: chaos (viral window alert)
   *   λ < 0: stable (predictable engagement)
   *   λ = 0: bifurcation boundary (phase transition)
   *
   * LIBRARY: mathjs — math.log() for Lyapunov sum
   * LIBRARY: simple-statistics — ss.mean() for autocorrelation
   *
   * ALGORITHM 2: Autocorrelation
   * High autocorrelation = predictable audience (good for scheduling)
   * Low autocorrelation  = random audience (unpredictable)
   *
   * ALGORITHM 3: Logistic Map Bifurcation
   * x_{n+1} = r·x_n·(1-x_n)
   * r < 3:    stable fixed point
   * 3-3.57:   periodic oscillation
   * r > 3.57: deterministic chaos
   */

  computeLyapunov(timeSeries: number[]): number {
    const n = timeSeries.length;
    if (n < 10) return 0;
    const maxVal = Math.max(...timeSeries) + 1e-10;
    let sum = 0;
    for (let i = 0; i < n - 1; i++) {
      const xi     = timeSeries[i] / maxVal;
      const deriv  = Math.abs(1 - 2 * xi);
      if (deriv > 0) sum += math.log(deriv) as number;
    }
    return sum / n;
  }

  computeAutocorrelation(series: number[], lag = 1): number {
    if (series.length < lag + 2) return 0;
    const x    = series.slice(0, -lag);
    const xLag = series.slice(lag);
    return ss.sampleCorrelation(x, xLag);
  }

  detectViralWindow(nicheHistory: number[]): ChaosResult {
    const lambda          = this.computeLyapunov(nicheHistory);
    const autocorrelation = this.computeAutocorrelation(nicheHistory, 1);
    const isChaoticWindow = lambda > 0.1;
    const confidence      = Math.min(95, Math.round(Math.abs(lambda) * 300));

    let alert = 'Stable conditions — standard strategy works';
    if (lambda > 0.4)      alert = '🔥 EXTREME CHAOS — viral explosion possible, post NOW with best hook';
    else if (lambda > 0.2) alert = '⚡ CHAOS WINDOW — elevated viral potential, strong hook required';
    else if (lambda > 0.1) alert = '📈 Near chaos boundary — good time to experiment';

    return {
      lyapunovExponent:      Math.round(lambda * 1000) / 1000,
      isChaoticWindow,
      alert,
      confidence,
      bifurcationRegime:     isChaoticWindow ? 'chaotic' : lambda > 0 ? 'periodic' : 'stable',
      postingRecommendation: isChaoticWindow
        ? 'Post NOW — chaos amplifies quality content exponentially'
        : 'Maintain consistent schedule — stable phase rewards consistency',
      autocorrelation: Math.round(autocorrelation * 1000) / 1000,
    };
  }

  findBifurcationPoint(postsPerDay: number): {
    regime: string; recommendation: string; r: number;
  } {
    const r = 1 + (postsPerDay / 4) * 3;
    if (r < 1)    return { regime: 'underdose',  r, recommendation: 'Post more — algorithm ignoring you' };
    if (r < 3)    return { regime: 'stable',     r, recommendation: 'Perfect frequency — maintain this' };
    if (r < 3.57) return { regime: 'periodic',   r, recommendation: 'Engagement oscillating — reduce by 1/day' };
    return          { regime: 'chaotic',    r, recommendation: 'BURNOUT ZONE — reduce posts immediately' };
  }
}

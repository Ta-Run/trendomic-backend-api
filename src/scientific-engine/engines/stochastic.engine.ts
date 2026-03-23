import { Injectable } from '@nestjs/common';
import * as ss from 'simple-statistics';

export interface StochasticResult {
  mean: number;
  std: number;
  ci95Low: number;
  ci95High: number;
  ci68Low: number;
  ci68High: number;
  probViralThreshold: number;
  skewness: number;
  kurtosis: number;
  sampleTrajectories: number[][];
}

@Injectable()
export class StochasticEngine {
  /**
   * ALGORITHM: Euler-Maruyama (EM) for Stochastic Differential Equations
   *
   * WHY: Real virality is RANDOM. Euler-Maruyama correctly discretizes:
   *   dV = k·V·(1-V/N)dt + σ·V·dW_t
   *   drift: k·V·(1-V/N)dt    — same as ODE (deterministic part)
   *   diffusion: σ·V·dW_t     — Wiener process noise (random part)
   *
   * DISCRETIZATION (Itô interpretation):
   *   V(t+dt) = V(t) + μ(V,t)·dt + σ(V,t)·√dt·Z
   *   Z ~ N(0,1) — fresh standard normal at each step
   *
   * WHY √dt NOT dt:
   *   Wiener increments: W(t+dt)-W(t) ~ N(0,dt)
   *   Standardised: (W(t+dt)-W(t))/√dt ~ N(0,1)
   *   This is Itô isometry — variance scales linearly with time
   *
   * LIBRARY: simple-statistics
   *   ss.quantile()   — 95% and 68% confidence intervals
   *   ss.mean()       — expected views
   *   ss.variance()   — spread of predictions
   *   ss.sampleSkewness()  — distribution shape
   *   ss.sampleKurtosis()  — tail weight (heavy tails = more extreme viral events)
   */

  private readonly nicheVolatility: Record<string, number> = {
    fitness: 0.15, food: 0.18, travel: 0.20, tech: 0.25,
    finance: 0.28, news: 0.45, entertainment: 0.35, fashion: 0.22,
    motivation: 0.20, gaming: 0.30, beauty: 0.18, default: 0.22,
  };

  // Box-Muller transform for normal distribution
  private normalRandom(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  private emStep(V: number, dt: number, k: number, N: number, sigma: number): number {
    const drift     = k * V * (1 - V / N) * dt;
    const diffusion = sigma * V * Math.sqrt(dt) * this.normalRandom();
    return Math.max(0, V + drift + diffusion);
  }

  runMonteCarlo(
    platform: string,
    niche: string,
    simulations = 10000,
    hours = 72,
  ): StochasticResult {
    const kMap = { instagram: 0.3, youtube: 0.5, twitter: 0.7 };
    const NMap = { instagram: 1_000_000, youtube: 5_000_000, twitter: 2_000_000 };
    const k     = kMap[platform as keyof typeof kMap]  ?? 0.3;
    const N     = NMap[platform as keyof typeof NMap]  ?? 1_000_000;
    const sigma = this.nicheVolatility[niche.toLowerCase()] ?? this.nicheVolatility.default;
    const dt    = 0.1;
    const steps = Math.ceil(hours / dt);

    const finals: number[]   = [];
    const sample: number[][] = [];

    for (let sim = 0; sim < simulations; sim++) {
      let V = 10;
      const traj: number[] = [];
      for (let i = 0; i < steps; i++) {
        V = this.emStep(V, dt, k, N, sigma);
        if (sim < 10) traj.push(Math.round(V));
      }
      finals.push(V);
      if (sim < 10) sample.push(traj);
    }

    // simple-statistics for all summary stats
    const mean     = ss.mean(finals);
    const std      = ss.standardDeviation(finals);
    const sorted   = [...finals].sort((a, b) => a - b);
    const skewness = ss.sampleSkewness(finals);
    const kurtosis = ss.sampleKurtosis(finals);

    return {
      mean:    Math.round(mean),
      std:     Math.round(std),
      ci95Low:  Math.round(ss.quantile(sorted, 0.025)),
      ci95High: Math.round(ss.quantile(sorted, 0.975)),
      ci68Low:  Math.round(ss.quantile(sorted, 0.160)),
      ci68High: Math.round(ss.quantile(sorted, 0.840)),
      probViralThreshold: finals.filter(v => v > 100_000).length / simulations,
      skewness: Math.round(skewness * 100) / 100,
      kurtosis: Math.round(kurtosis * 100) / 100,
      sampleTrajectories: sample,
    };
  }
}

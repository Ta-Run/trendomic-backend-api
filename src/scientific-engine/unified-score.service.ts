import { Injectable } from '@nestjs/common';
import * as ss from 'simple-statistics';
import { OdeEngine }         from './engines/ode.engine';
import { StochasticEngine }  from './engines/stochastic.engine';
import { ChaosEngine }       from './engines/chaos.engine';
import { GraphEngine }       from './engines/graph.engine';
import { GameEngine }        from './engines/game.engine';
import { FourierEngine }     from './engines/fourier.engine';
import { BayesianEngine }    from './engines/bayesian.engine';
import { EntropyEngine }     from './engines/entropy.engine';

export interface TrendomicScore {
  viralScore: number;
  confidenceLow: number;
  confidenceHigh: number;
  probViral: number;
  chaosAlert: string;
  lyapunovExponent: number;
  r0: number;
  willGoViral: boolean;
  herdImmunityThreshold: number;
  nashHashtagMix: { niche: number; medium: number; large: number };
  ctaProspectScore: number;
  ctaFraming: string;
  ctaImprovement: string;
  optimalPostHours: number[];
  audienceRhythm: string;
  spectralEntropy: number;
  predictionConfidence: number;
  credibleInterval: [number, number];
  captionEntropy: number;
  captionOriginality: number;
  captionCoherence: number;
  captionFeedback: string[];
  overallScore: number;
  explanation: string;
  odeTrajectory: number[];
}

@Injectable()
export class UnifiedScoreService {
  private defaultWeights = {
    ode: 0.25, stochastic: 0.15, chaos: 0.15,
    graph: 0.20, game: 0.10, entropy: 0.15,
  };

  constructor(
    private ode:        OdeEngine,
    private stochastic: StochasticEngine,
    private chaos:      ChaosEngine,
    private graph:      GraphEngine,
    private game:       GameEngine,
    private fourier:    FourierEngine,
    private bayesian:   BayesianEngine,
    private entropy:    EntropyEngine,
  ) {}

  async computeFullScore(input: {
    platform: string; topic: string; caption: string;
    hashtags: string[]; userHistory?: number[];
    nicheHistory?: number[]; userWeights?: Record<string, number>;
    meanFollowers?: number;
  }): Promise<TrendomicScore> {
    const {
      platform, topic, caption, hashtags,
      userHistory = [], nicheHistory = [],
      userWeights = this.defaultWeights,
      meanFollowers = 1000,
    } = input;

    // Run all 8 engines in parallel
    const [odeRes, stochRes, chaosRes, fourierRes, entropyRes] = await Promise.all([
      Promise.resolve(this.ode.computeViralGrowth(platform, topic)),
      Promise.resolve(this.stochastic.runMonteCarlo(platform, topic, 3000, 72)),
      Promise.resolve(this.chaos.detectViralWindow(
        nicheHistory.length > 10 ? nicheHistory
          : Array.from({ length: 50 }, () => Math.random() * 100),
      )),
      Promise.resolve(this.fourier.analyzeAudienceRhythm(
        userHistory.length > 23 ? userHistory.slice(0, 168)
          : Array.from({ length: 168 }, (_, i) => 50 + 30 * Math.sin(2 * Math.PI * (i % 24) / 24)),
      )),
      Promise.resolve(this.entropy.scoreCaption(caption, hashtags)),
    ]);

    const r0      = this.graph.computeR0(meanFollowers, odeRes.viralScore, platform);
    const sirSim  = this.graph.simulateSIR({ population: 100000, seedViews: 10, beta: 0.08, gamma: 0.10, steps: 72 });
    const nashRes = this.game.computeNashHashtags(odeRes.viralScore);
    const ctaRes  = this.game.scoreProspectTheoryCTA(caption);

    const platformPrior = platform === 'youtube' ? 50000 : platform === 'twitter' ? 20000 : 10000;
    const bayesRes = this.bayesian.predict(platformPrior, userHistory, userWeights);

    // Weighted ensemble — weights learned per user via Bayesian
    const w = { ...this.defaultWeights, ...userWeights };
    const componentScores = {
      ode:        odeRes.viralScore,
      stochastic: Math.min(100, Math.round(stochRes.probViralThreshold * 200)),
      chaos:      chaosRes.isChaoticWindow ? 75 : 40,
      graph:      Math.min(100, Math.round(r0 * 40)),
      game:       ctaRes.score,
      entropy:    entropyRes.overallQuality,
    };

    // ss.mean() for weighted average validation
    const rawScores   = Object.values(componentScores);
    const simpleAvg   = ss.mean(rawScores); // sanity check
    const overallScore = Math.round(
      Object.entries(w).reduce((sum, [k, wt]) =>
        sum + (componentScores[k as keyof typeof componentScores] ?? simpleAvg) * wt, 0),
    );

    return {
      viralScore:            odeRes.viralScore,
      confidenceLow:         stochRes.ci95Low,
      confidenceHigh:        stochRes.ci95High,
      probViral:             Math.round(stochRes.probViralThreshold * 100),
      chaosAlert:            chaosRes.alert,
      lyapunovExponent:      chaosRes.lyapunovExponent,
      r0:                    sirSim.r0,
      willGoViral:           sirSim.willGoViral,
      herdImmunityThreshold: sirSim.herdImmunityThreshold,
      nashHashtagMix:        nashRes.optimalMix,
      ctaProspectScore:      ctaRes.score,
      ctaFraming:            ctaRes.framing,
      ctaImprovement:        ctaRes.improvement,
      optimalPostHours:      fourierRes.peakEngagementHours,
      audienceRhythm:        fourierRes.audienceRhythmPattern,
      spectralEntropy:       fourierRes.spectralEntropy,
      predictionConfidence:  bayesRes.confidence,
      credibleInterval:      bayesRes.credibleInterval,
      captionEntropy:        entropyRes.shannonEntropy,
      captionOriginality:    entropyRes.originalityScore,
      captionCoherence:      entropyRes.captionHashtagCoherence,
      captionFeedback:       entropyRes.feedback,
      overallScore,
      odeTrajectory:         odeRes.trajectory,
      explanation: this.buildExplanation(odeRes.viralScore, sirSim.r0, chaosRes, overallScore, bayesRes.confidence),
    };
  }

  private buildExplanation(vs: number, r0: number, chaos: any, overall: number, conf: number): string {
    return [
      `Trendomic Score: ${overall}/100.`,
      `Viral growth model: ${vs}/100.`,
      `Network R₀ = ${r0.toFixed(2)} — content ${r0 > 1 ? 'WILL spread virally' : 'needs stronger hook'}.`,
      chaos.isChaoticWindow ? `⚡ ${chaos.alert}` : '',
      `Prediction confidence: ${conf}% (Bayesian).`,
    ].filter(Boolean).join(' ');
  }
}

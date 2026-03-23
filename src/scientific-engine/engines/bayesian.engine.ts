import { Injectable } from '@nestjs/common';
import { jStat } from 'jstat';
import * as ss from 'simple-statistics';

export interface BayesianResult {
  predictedViews: number;
  confidence: number;
  credibleInterval: [number, number];
  priorMean: number;
  posteriorMean: number;
  posteriorStd: number;
  updatedWeights: Record<string, number>;
  postsUntilHighConfidence: number;
}

@Injectable()
export class BayesianEngine {
  /**
   * ALGORITHM: Bayesian Inference with Normal-Normal Conjugate Prior
   *
   * WHY BAYESIAN:
   *   Every post the user makes is a NEW OBSERVATION.
   *   Bayesian updating: posterior ∝ likelihood × prior
   *   The model gets SMARTER with every post — personalized predictions.
   *
   * CONJUGATE UPDATE (Normal-Normal):
   *   Prior:     μ  ~ N(μ₀, σ₀²)    — platform average views
   *   Likelihood: xᵢ ~ N(μ,  σ²)    — observed views for this user
   *   Posterior: μ|x ~ N(μₙ, σₙ²)
   *
   *   μₙ  = (σ²·μ₀ + σ₀²·Σxᵢ) / (σ² + n·σ₀²)   — posterior mean
   *   σₙ² = (σ²·σ₀²) / (σ² + n·σ₀²)              — posterior variance
   *
   * As n (post count) grows:
   *   σₙ² → 0    (certainty increases)
   *   μₙ → x̄    (converges to user's actual average)
   *
   * CREDIBLE INTERVAL (Bayesian CI):
   *   [μₙ - z·σₙ, μₙ + z·σₙ]  where z = jStat.normal.inv(0.975, 0, 1)
   *   Meaning: "95% probability true views will be in this range"
   *   (Stronger claim than frequentist CI)
   *
   * LIBRARY: jstat — jStat.normal.inv() for credible interval bounds
   * LIBRARY: simple-statistics — ss.mean(), ss.variance() for observations
   */

  bayesianUpdate(params: {
    priorMean: number;
    priorVariance: number;
    observations: number[];
    likelihoodVariance: number;
  }): { posteriorMean: number; posteriorVariance: number } {
    const { priorMean: mu0, priorVariance: s0sq,
            observations, likelihoodVariance: ssq } = params;
    const n = observations.length;
    if (n === 0) return { posteriorMean: mu0, posteriorVariance: s0sq };

    const sumObs      = ss.sum(observations);
    const postVar     = (ssq * s0sq) / (ssq + n * s0sq);
    const postMean    = (ssq * mu0 + s0sq * sumObs) / (ssq + n * s0sq);
    return {
      posteriorMean:     Math.round(postMean),
      posteriorVariance: Math.round(postVar),
    };
  }

  predict(
    platformPrior: number,
    userHistory: number[],
    currentWeights: Record<string, number>,
  ): BayesianResult {
    const priorVar  = platformPrior * platformPrior * 0.25;
    const likelVar  = priorVar * 0.1;
    const { posteriorMean, posteriorVariance } = this.bayesianUpdate({
      priorMean:          platformPrior,
      priorVariance:      priorVar,
      observations:       userHistory,
      likelihoodVariance: likelVar,
    });

    const posteriorStd = Math.sqrt(posteriorVariance);

    // jStat normal inverse CDF for 95% credible interval
    const z95      = jStat.normal.inv(0.975, 0, 1);
    const ciLow    = Math.max(0, Math.round(posteriorMean - z95 * posteriorStd));
    const ciHigh   = Math.round(posteriorMean + z95 * posteriorStd);
    const confidence = Math.min(95, Math.round((1 - posteriorStd / Math.sqrt(priorVar)) * 100));

    // How many more posts to reach 80% confidence
    const postsUntilHighConfidence = Math.max(0, Math.ceil(
      (priorVar / (likelVar * (1 - 0.8 ** 2 * priorVar / priorVar))) - userHistory.length,
    ));

    // Simple gradient update on ensemble weights
    const updatedWeights = { ...currentWeights };
    if (userHistory.length > 5) {
      const recentMean = ss.mean(userHistory.slice(-5));
      if (recentMean > posteriorMean) {
        updatedWeights['ode']  = Math.max(0.05, (updatedWeights['ode'] || 0.30) + 0.01);
        updatedWeights['chaos'] = Math.max(0.05, (updatedWeights['chaos'] || 0.15) - 0.005);
      }
    }

    return {
      predictedViews: posteriorMean,
      confidence,
      credibleInterval: [ciLow, ciHigh],
      priorMean:        platformPrior,
      posteriorMean,
      posteriorStd:     Math.round(posteriorStd),
      updatedWeights,
      postsUntilHighConfidence,
    };
  }
}

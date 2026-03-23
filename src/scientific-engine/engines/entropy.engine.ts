import { Injectable } from '@nestjs/common';
import * as math from 'mathjs';
import * as ss from 'simple-statistics';

export interface EntropyResult {
  shannonEntropy: number;
  originalityScore: number;
  captionHashtagCoherence: number;
  overallQuality: number;
  feedback: string[];
  mutualInformation: number;
}

@Injectable()
export class EntropyEngine {
  /**
   * ALGORITHM 1: Shannon Entropy H(X)
   *
   * H(X) = -Σ p(xᵢ)·log₂(p(xᵢ))   [bits]
   *   p(xᵢ) = frequency of word xᵢ / total words
   *
   * WHY: Algorithms reward information-rich captions.
   *   Low H = boring repetitive vocabulary (penalised)
   *   High H = rich varied vocabulary (rewarded)
   *   Max H = log₂(vocabulary size) when all words equally likely
   *
   * LIBRARY: mathjs — math.log2() for entropy calculation
   *
   * ALGORITHM 2: Kolmogorov Complexity Approximation
   * K(x) ≈ compressed_length(x) / original_length(x)
   * WHY: True KC is uncomputable (halting problem).
   *   Compression ratio is a practical proxy.
   *   Hard to compress = genuinely original = algorithm reward.
   *   Clichés are highly compressible → low K → penalised.
   *
   * ALGORITHM 3: Mutual Information I(Caption; Hashtags)
   * I(X;Y) = H(X) + H(Y) - H(X,Y)
   * WHY: Instagram/YouTube algorithms detect semantic alignment.
   *   High MI = caption and hashtags tell same story = rewarded
   *   Low MI  = hashtag stuffing (unrelated tags) = penalised
   *
   * LIBRARY: simple-statistics — ss.mean() for vocabulary stats
   */

  shannonEntropy(text: string): number {
    const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    if (words.length === 0) return 0;
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return -Object.values(freq)
      .map(c => c / words.length)
      .reduce((h, p) => h + p * (math.log2(p) as number), 0);
  }

  approximateKolmogorov(text: string): number {
    if (!text || text.length === 0) return 0;
    // Run-length encoding proxy — penalise clichés additionally
    const rle = text.replace(/(.)\1+/g, m => `${m.length}${m[0]}`);
    const kcRatio = rle.length / text.length;
    const cliches = ['hustle','grind','blessed','grateful','amazing','incredible',
                     'awesome','crush','killing','fire','lit','goat','vibe','bestie'];
    const clichePenalty = cliches.filter(c => text.toLowerCase().includes(c)).length * 5;
    return Math.max(0, Math.min(100, Math.round(kcRatio * 80 - clichePenalty)));
  }

  mutualInformation(text1: string, text2: string): number {
    const h1    = this.shannonEntropy(text1);
    const h2    = this.shannonEntropy(text2);
    const hJoint = this.shannonEntropy(text1 + ' ' + text2);
    return Math.max(0, h1 + h2 - hJoint);
  }

  scoreCaption(caption: string, hashtags: string[]): EntropyResult {
    const entropy    = this.shannonEntropy(caption);
    const originality = this.approximateKolmogorov(caption);
    const mi          = this.mutualInformation(caption, hashtags.join(' '));
    const coherence   = Math.min(100, Math.round(mi * 25));
    const overall     = Math.min(100, Math.round(entropy * 14 + originality * 0.5 + coherence * 0.36));

    const feedback: string[] = [];
    if (entropy < 2.5)      feedback.push(`Shannon entropy ${entropy.toFixed(2)} bits — too low. Vary vocabulary more.`);
    if (originality < 40)   feedback.push(`Originality ${originality}/100 — high cliché density. Replace generic phrases.`);
    if (coherence < 40)     feedback.push(`Caption-hashtag MI = ${mi.toFixed(2)} — hashtags misaligned. Algorithm will penalise.`);
    if (feedback.length === 0) feedback.push('All information theory metrics pass — excellent caption quality.');

    return {
      shannonEntropy:          Math.round(entropy * 100) / 100,
      originalityScore:        originality,
      captionHashtagCoherence: coherence,
      mutualInformation:       Math.round(mi * 100) / 100,
      overallQuality:          overall,
      feedback,
    };
  }
}

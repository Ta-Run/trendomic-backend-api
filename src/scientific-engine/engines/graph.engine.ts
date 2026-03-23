import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import pagerank from 'graphology-metrics/centrality/pagerank';
import * as ss from 'simple-statistics';

export interface SIRResult {
  S: number[]; I: number[]; R: number[];
  r0: number;
  peakSharingHour: number;
  totalReach: number;
  willGoViral: boolean;
  herdImmunityThreshold: number;
}

export interface NetworkAnalysis {
  pagerankScores: Record<string, number>;
  topInfluencers: string[];
  networkDensity: number;
  avgClustering: number;
}

@Injectable()
export class GraphEngine {
  /**
   * ALGORITHM 1: SIR Epidemic Model on Social Graph
   *
   * WHY: Content spreads IDENTICALLY to disease through a network.
   *   S = Susceptible (haven't seen post)
   *   I = Infected (actively sharing)
   *   R = Recovered (saw it, moved on)
   *
   *   dS/dt = -β·S·I/N
   *   dI/dt =  β·S·I/N - γ·I
   *   dR/dt =  γ·I
   *
   * R₀ = β/γ  (basic reproduction number)
   *   R₀ < 1: post dies    R₀ > 1: VIRAL epidemic threshold crossed
   *
   * R₀ for heterogeneous networks (Heterogeneous Mean Field):
   *   R₀ = β·<k²> / (γ·<k>)
   *   Social networks have hubs (power law degree distribution)
   *   so <k²>/<k> >> 1 — much higher effective R₀ than homogeneous model
   *
   * Herd immunity threshold: h = 1 - 1/R₀
   *
   * ALGORITHM 2: PageRank (Brin & Page 1998)
   *   PR(u) = (1-d)/N + d·Σ PR(v)/L(v)
   *   d = 0.85, L(v) = out-degree of v
   *   High PR follower = their share cascades exponentially further
   *
   * LIBRARY: graphology — builds the social graph
   * LIBRARY: graphology-algorithms/pagerank — real PageRank on graph
   * LIBRARY: simple-statistics — network statistics
   */

  buildSocialGraph(followers: string[], connections: [string, string][]): Graph {
    const g = new Graph({ type: 'directed' });
    followers.forEach(f => g.addNode(f));
    connections.forEach(([from, to]) => {
      if (g.hasNode(from) && g.hasNode(to) && !g.hasDirectedEdge(from, to)) {
        g.addDirectedEdge(from, to);
      }
    });
    return g;
  }

  analyzeNetwork(graph: Graph): NetworkAnalysis {
    const pr = pagerank(graph) as Record<string, number>;
    const scores = Object.entries(pr).sort((a, b) => (b[1] as number) - (a[1] as number));
    const topInfluencers = scores.slice(0, 5).map(([node]) => node);
    const nodeCount = graph.order;
    const edgeCount = graph.size;
    const maxEdges  = nodeCount * (nodeCount - 1);
    return {
      pagerankScores: pr,
      topInfluencers,
      networkDensity:  maxEdges > 0 ? Math.round((edgeCount / maxEdges) * 1000) / 1000 : 0,
      avgClustering:   Math.round(ss.mean(Object.values(pr)) * 10000) / 10000,
    };
  }

  computeR0(meanFollowers: number, contentQuality: number, platform: string): number {
    const betaMap  = { instagram: 0.08, youtube: 0.12, twitter: 0.15 };
    const gammaMap = { instagram: 0.10, youtube: 0.08, twitter: 0.20 };
    const beta  = (betaMap[platform as keyof typeof betaMap] ?? 0.08) * (contentQuality / 100);
    const gamma = gammaMap[platform as keyof typeof gammaMap] ?? 0.10;
    // Heterogeneous mean-field: <k²>/<k> ≈ sqrt(meanFollowers)/10
    const heterogeneityFactor = Math.sqrt(meanFollowers) / 10;
    return Math.round((beta / gamma) * heterogeneityFactor * 100) / 100;
  }

  simulateSIR(params: {
    population: number; seedViews: number;
    beta: number; gamma: number; steps: number;
  }): SIRResult {
    const { population: N, seedViews, beta, gamma, steps } = params;
    let S = N - seedViews, I = seedViews, R = 0;
    const Sarr = [S], Iarr = [I], Rarr = [R];
    for (let t = 0; t < steps; t++) {
      const newI = (beta * S * I) / N;
      const newR = gamma * I;
      S -= newI; I += newI - newR; R += newR;
      Sarr.push(Math.round(Math.max(0, S)));
      Iarr.push(Math.round(Math.max(0, I)));
      Rarr.push(Math.round(R));
    }
    const r0 = beta / gamma;
    return {
      S: Sarr, I: Iarr, R: Rarr, r0,
      peakSharingHour:       Iarr.indexOf(Math.max(...Iarr)),
      totalReach:            Math.round(R),
      willGoViral:           r0 > 1,
      herdImmunityThreshold: r0 > 1 ? Math.round((1 - 1 / r0) * 100) : 0,
    };
  }
}

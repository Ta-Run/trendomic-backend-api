import { Injectable } from '@nestjs/common';

@Injectable()
export class PdeEngine {
  heat1D(
    domainStart: number,
    domainEnd: number,
    tEnd: number,
    stepX: number,
    stepT: number,
    initialCondition: number[],
    boundaryCondition: [number, number],
  ): { t: number[]; x: number[]; u: number[][] } {
    const x = [];
    for (let xi = domainStart; xi <= domainEnd; xi += stepX) x.push(xi);
    const n = x.length;
    let u = [...initialCondition];
    const alpha = stepT / (stepX * stepX);
    if (alpha > 0.5) throw new Error('Stability: alpha must be <= 0.5 for FTCS');
    const t = [0];
    const history: number[][] = [u.slice()];
    let tCur = 0;
    while (tCur < tEnd) {
      const uNew = [...u];
      uNew[0] = boundaryCondition[0];
      uNew[n - 1] = boundaryCondition[1];
      for (let i = 1; i < n - 1; i++) {
        uNew[i] = u[i] + alpha * (u[i - 1] - 2 * u[i] + u[i + 1]);
      }
      u = uNew;
      tCur += stepT;
      t.push(tCur);
      history.push(u.slice());
    }
    return { t, x, u: history };
  }

  laplace1D(
    domainStart: number,
    domainEnd: number,
    stepX: number,
    boundaryCondition: [number, number],
    initialGuess?: number[],
  ): { x: number[]; u: number[] } {
    const x = [];
    for (let xi = domainStart; xi <= domainEnd; xi += stepX) x.push(xi);
    const n = x.length;
    let u = initialGuess ?? Array(n).fill(0);
    u[0] = boundaryCondition[0];
    u[n - 1] = boundaryCondition[1];
    const maxIter = 10000;
    for (let iter = 0; iter < maxIter; iter++) {
      const uNew = [...u];
      for (let i = 1; i < n - 1; i++) {
        uNew[i] = (u[i - 1] + u[i + 1]) / 2;
      }
      u = uNew;
    }
    return { x, u };
  }

  solve(
    type: string,
    domainStart: number,
    domainEnd: number,
    tEnd: number,
    stepX: number,
    stepT: number,
    initialCondition?: number[],
    boundaryCondition?: number[],
  ): Record<string, unknown> {
    const bc = boundaryCondition ?? [0, 0];
    const ic = initialCondition ?? Array(Math.floor((domainEnd - domainStart) / stepX) + 1).fill(0);
    if (type.toLowerCase() === 'heat') {
      return this.heat1D(domainStart, domainEnd, tEnd, stepX, stepT, ic, bc as [number, number]) as unknown as Record<string, unknown>;
    }
    if (type.toLowerCase() === 'laplace') {
      return this.laplace1D(domainStart, domainEnd, stepX, bc as [number, number], ic) as unknown as Record<string, unknown>;
    }
    throw new Error('Supported PDE types: heat, laplace');
  }
}

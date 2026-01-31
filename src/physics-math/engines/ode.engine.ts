import { Injectable } from '@nestjs/common';

@Injectable()
export class OdeEngine {
  euler(f: (x: number, y: number) => number, x0: number, y0: number, xEnd: number, stepSize: number): { x: number[]; y: number[] } {
    const x = [x0], y = [y0];
    let xn = x0, yn = y0;
    while (xn < xEnd) {
      xn += stepSize;
      yn += stepSize * f(xn - stepSize, yn);
      x.push(xn);
      y.push(yn);
    }
    return { x, y };
  }

  rk4(f: (x: number, y: number) => number, x0: number, y0: number, xEnd: number, stepSize: number): { x: number[]; y: number[] } {
    const x = [x0], y = [y0];
    let xn = x0, yn = y0;
    while (xn < xEnd) {
      const k1 = stepSize * f(xn, yn);
      const k2 = stepSize * f(xn + stepSize / 2, yn + k1 / 2);
      const k3 = stepSize * f(xn + stepSize / 2, yn + k2 / 2);
      const k4 = stepSize * f(xn + stepSize, yn + k3);
      yn += (k1 + 2 * k2 + 2 * k3 + k4) / 6;
      xn += stepSize;
      x.push(xn);
      y.push(yn);
    }
    return { x, y };
  }

  parseSimpleOde(equation: string): (x: number, y: number) => number {
    const normalized = equation.replace(/dy\/dx|y'/gi, '').replace(/=/g, '').trim();
    return (x: number, y: number) => {
      try {
        const expr = normalized.replace(/\by\b/g, String(y)).replace(/\bx\b/g, String(x));
        return Function('"use strict"; return (' + expr + ')')();
      } catch {
        throw new Error('Could not evaluate ODE expression');
      }
    };
  }

  solve(equation: string, x0: number, y0: number, xEnd: number, stepSize: number, method: 'euler' | 'rk4' = 'rk4'): { x: number[]; y: number[] } {
    const f = this.parseSimpleOde(equation);
    return method === 'euler' ? this.euler(f, x0, y0, xEnd, stepSize) : this.rk4(f, x0, y0, xEnd, stepSize);
  }
}

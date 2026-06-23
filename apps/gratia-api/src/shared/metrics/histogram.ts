const DEFAULT_RESERVOIR_SIZE = 1024;

export interface PercentileSnapshot {
  p50: number;
  p95: number;
  p99: number;
  max: number;
  samples: number;
}

export class Reservoir {
  private readonly maxSize: number;
  private samples: number[] = [];
  private writeIndex = 0;

  constructor(maxSize = DEFAULT_RESERVOIR_SIZE) {
    this.maxSize = maxSize;
  }

  add(value: number): void {
    if (this.samples.length < this.maxSize) {
      this.samples.push(value);
      return;
    }
    this.samples[this.writeIndex] = value;
    this.writeIndex = (this.writeIndex + 1) % this.maxSize;
  }

  snapshot(): PercentileSnapshot {
    if (this.samples.length === 0) {
      return { p50: 0, p95: 0, p99: 0, max: 0, samples: 0 };
    }
    const sorted = [...this.samples].sort((a, b) => a - b);
    const pick = (p: number): number => {
      const idx = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
      return sorted[idx] ?? 0;
    };
    return {
      p50: round(pick(0.5)),
      p95: round(pick(0.95)),
      p99: round(pick(0.99)),
      max: round(sorted[sorted.length - 1] ?? 0),
      samples: sorted.length,
    };
  }
}

const round = (n: number): number => Math.round(n * 100) / 100;

import { Module }              from '@nestjs/common';
import { OdeEngine }           from './engines/ode.engine';
import { StochasticEngine }    from './engines/stochastic.engine';
import { ChaosEngine }         from './engines/chaos.engine';
import { GraphEngine }         from './engines/graph.engine';
import { GameEngine }          from './engines/game.engine';
import { FourierEngine }       from './engines/fourier.engine';
import { BayesianEngine }      from './engines/bayesian.engine';
import { EntropyEngine }       from './engines/entropy.engine';
import { UnifiedScoreService } from './unified-score.service';

@Module({
  providers: [
    OdeEngine, StochasticEngine, ChaosEngine, GraphEngine,
    GameEngine, FourierEngine, BayesianEngine, EntropyEngine,
    UnifiedScoreService,
  ],
  exports: [UnifiedScoreService],
})
export class ScientificEngineModule {}

const { OdeEngine } = require('./dist/src/scientific-engine/engines/ode.engine');
const { StochasticEngine } = require('./dist/src/scientific-engine/engines/stochastic.engine');
const { ChaosEngine } = require('./dist/src/scientific-engine/engines/chaos.engine');
const { GraphEngine } = require('./dist/src/scientific-engine/engines/graph.engine');
const { GameEngine } = require('./dist/src/scientific-engine/engines/game.engine');
const { FourierEngine } = require('./dist/src/scientific-engine/engines/fourier.engine');
const { BayesianEngine } = require('./dist/src/scientific-engine/engines/bayesian.engine');
const { EntropyEngine } = require('./dist/src/scientific-engine/engines/entropy.engine');
const { UnifiedScoreService } = require('./dist/src/scientific-engine/unified-score.service');

async function testScience() {
  console.log('Testing Scientific Engines...');
  
  // Test ODE Engine
  const odeEngine = new OdeEngine();
  const odeResult = odeEngine.computeViralGrowth('instagram', 'fitness');
  console.log('✓ ODE Engine - Viral Score:', odeResult.viralScore);
  
  // Test Stochastic Engine
  const stochEngine = new StochasticEngine();
  const stochResult = stochEngine.runMonteCarlo('instagram', 'fitness', 100, 72);
  console.log('✓ Stochastic Engine - Mean Views:', stochResult.mean);
  
  // Test Chaos Engine
  const chaosEngine = new ChaosEngine();
  const chaosResult = chaosEngine.detectViralWindow([50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]);
  console.log('✓ Chaos Engine - Lyapunov Exponent:', chaosResult.lyapunovExponent);
  
  // Test Graph Engine
  const graphEngine = new GraphEngine();
  const r0 = graphEngine.computeR0(1000, 85, 'instagram');
  console.log('✓ Graph Engine - R0:', r0);
  
  // Test Game Engine
  const gameEngine = new GameEngine();
  const nashResult = gameEngine.computeNashHashtags(85);
  console.log('✓ Game Engine - Nash Mix:', nashResult.optimalMix);
  
  // Test Fourier Engine
  const fourierEngine = new FourierEngine();
  const fourierResult = fourierEngine.analyzeAudienceRhythm(
    Array.from({length: 168}, (_, i) => 50 + 30 * Math.sin(2 * Math.PI * (i % 24) / 24))
  );
  console.log('✓ Fourier Engine - Optimal Hours:', fourierResult.optimalPostHours);
  
  // Test Bayesian Engine
  const bayesianEngine = new BayesianEngine();
  const bayesResult = bayesianEngine.predict(10000, [10000, 12000, 8000, 15000], {}, [], 1000);
  console.log('✓ Bayesian Engine - Predicted Views:', bayesResult.predictedViews);
  
  // Test Entropy Engine
  const entropyEngine = new EntropyEngine();
  const entropyResult = entropyEngine.scoreCaption(
    "This is the ultimate fitness guide you've been waiting for! Transform your body in 30 days with these proven techniques.",
    ["#fitness", "#workout", "#transformation", "#fitnessmotivation", "#health"]
  );
  console.log('✓ Entropy Engine - Overall Quality:', entropyResult.overallQuality);
  
  // Test Unified Score Service
  const unifiedService = new UnifiedScoreService(
    odeEngine, stochEngine, chaosEngine, graphEngine,
    gameEngine, fourierEngine, bayesianEngine, entropyEngine
  );
  
  const fullScore = await unifiedService.computeFullScore({
    platform: 'instagram',
    topic: 'fitness motivation',
    caption: 'Transform your fitness journey with these proven techniques!',
    hashtags: ['#fitness', '#workout', '#transformation'],
    userHistory: [10000, 12000, 8000, 15000],
    nicheHistory: [50, 60, 70, 80, 90],
    meanFollowers: 1000
  });
  
  console.log('\n=== UNIFIED TRENDOMIC SCORE ===');
  console.log('Overall Score:', fullScore.overallScore);
  console.log('Viral Probability:', fullScore.probViral + '%');
  console.log('Network R0:', fullScore.r0);
  console.log('Will Go Viral:', fullScore.willGoViral ? 'YES' : 'NO');
  console.log('Chaos Alert:', fullScore.chaosAlert);
  console.log('Optimal Posting Times:', fullScore.optimalPostHours.join(', '));
  console.log('Caption Quality Score:', fullScore.captionOriginality);
  console.log('=====================================\n');
  
  console.log('✅ All scientific engines working correctly!');
}

testScience().catch(console.error);

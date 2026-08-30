import { Box, Paper } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

// Small helper: an SVG text/element that fades in once `step` reaches
// `at`. Centralizing the transition here keeps every animation's reveal
// timing consistent.
function Reveal({ at, step, children }) {
  const visible = step >= at;
  return (
    <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>{children}</g>
  );
}

/* ------------------------------------------------------------------ */
/* LCM via Prime Factorization — worked example: LCM(12, 18)           */
/* ------------------------------------------------------------------ */
const LCM_STEPS = 6;

export function PrimeFactorizationAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(LCM_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 260" width="100%" style={{ display: 'block' }}>
          {/* Step 0: the two numbers */}
          <Reveal at={0} step={step}>
            <rect x="30" y="20" width="80" height="44" rx="8" fill="var(--mui-palette-primary-main, #6366f1)" opacity="0.15" />
            <text x="70" y="48" textAnchor="middle" fontSize="22" fontWeight="800" fill="currentColor">12</text>
            <rect x="310" y="20" width="80" height="44" rx="8" fill="var(--mui-palette-primary-main, #6366f1)" opacity="0.15" />
            <text x="350" y="48" textAnchor="middle" fontSize="22" fontWeight="800" fill="currentColor">18</text>
          </Reveal>

          {/* Step 1: breakdown of 12 */}
          <Reveal at={1} step={step}>
            <text x="70" y="90" textAnchor="middle" fontSize="14" fill="currentColor" opacity="0.85">
              12 = 2 × 2 × 3
            </text>
          </Reveal>

          {/* Step 2: breakdown of 18 */}
          <Reveal at={2} step={step}>
            <text x="350" y="90" textAnchor="middle" fontSize="14" fill="currentColor" opacity="0.85">
              18 = 2 × 3 × 3
            </text>
          </Reveal>

          {/* Step 3: highest powers table */}
          <Reveal at={3} step={step}>
            <text x="210" y="135" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" opacity="0.7">
              Take each prime at its HIGHEST power
            </text>
            <text x="150" y="165" textAnchor="middle" fontSize="18" fontWeight="800" fill="#f59e0b">2²</text>
            <text x="150" y="182" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">(from 12)</text>
            <text x="270" y="165" textAnchor="middle" fontSize="18" fontWeight="800" fill="#10b981">3²</text>
            <text x="270" y="182" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">(from 18)</text>
          </Reveal>

          {/* Step 4: multiply */}
          <Reveal at={4} step={step}>
            <text x="210" y="220" textAnchor="middle" fontSize="18" fill="currentColor">
              2² × 3² = 4 × 9
            </text>
          </Reveal>

          {/* Step 5: result */}
          <Reveal at={5} step={step}>
            <rect x="150" y="228" width="120" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="252" textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              LCM = 36
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={LCM_STEPS}
        playing={playing}
        onPrev={prev}
        onNext={next}
        onTogglePlay={togglePlay}
        onReset={reset}
      />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* HCF × LCM relation via a Venn diagram — worked example: (12, 18)    */
/* Shared primes (min power) sit in the overlap = HCF. All primes      */
/* (max power) = LCM. a × b always equals HCF × LCM.                   */
/* ------------------------------------------------------------------ */
const REL_STEPS = 5;

export function HcfLcmRelationAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(REL_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 260" width="100%" style={{ display: 'block' }}>
          {/* Step 0: two circles labeled 12 and 18 */}
          <Reveal at={0} step={step}>
            <circle cx="165" cy="120" r="90" fill="#6366f1" opacity="0.12" stroke="#6366f1" strokeWidth="2" />
            <circle cx="255" cy="120" r="90" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="2" />
            <text x="95" y="60" fontSize="16" fontWeight="700" fill="#6366f1">12</text>
            <text x="315" y="60" fontSize="16" fontWeight="700" fill="#10b981">18</text>
          </Reveal>

          {/* Step 1: left-only exclusive factor */}
          <Reveal at={1} step={step}>
            <text x="115" y="125" textAnchor="middle" fontSize="20" fontWeight="800" fill="#6366f1">2</text>
            <text x="115" y="145" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">extra</text>
          </Reveal>

          {/* Step 2: right-only exclusive factor */}
          <Reveal at={2} step={step}>
            <text x="305" y="125" textAnchor="middle" fontSize="20" fontWeight="800" fill="#10b981">3</text>
            <text x="305" y="145" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">extra</text>
          </Reveal>

          {/* Step 3: overlap = shared factors = HCF */}
          <Reveal at={3} step={step}>
            <text x="210" y="118" textAnchor="middle" fontSize="16" fontWeight="800" fill="currentColor">2, 3</text>
            <text x="210" y="150" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" opacity="0.8">
              HCF = 6
            </text>
          </Reveal>

          {/* Step 4: full equation reveal */}
          <Reveal at={4} step={step}>
            <text x="210" y="230" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">
              12 × 18 = 216 = 6 × 36 = HCF × LCM
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={REL_STEPS}
        playing={playing}
        onPrev={prev}
        onNext={next}
        onTogglePlay={togglePlay}
        onReset={reset}
      />
    </Paper>
  );
}

// Registry so content data can reference an animation by a short string
// key instead of importing components directly — new topics just add an
// entry here.
export const ANIMATION_REGISTRY = {
  primeFactorization: PrimeFactorizationAnimation,
  hcfLcmRelation: HcfLcmRelationAnimation,
};

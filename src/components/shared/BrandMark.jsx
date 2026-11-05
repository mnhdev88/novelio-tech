import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// The logo's idea drawn large: an unbroken loop that breaks out into a rising arrow.
const LOOP = 'M 720,400 C 655,248 435,248 435,400 C 435,552 655,552 720,400 C 785,248 1005,248 1005,400 C 1005,552 785,552 720,400';
// Starts ON the loop's lower-right curve and along its tangent (t≈0.65 of LOOP's last
// segment), so the butt cap sits flush inside the stroke with no visible join.
const ARROW = 'M 829,504 C 905,517 1040,370 1122,214';
const ARROW_HEAD = '1186,92 1183,250 1050,172';
const EASE = [0.22, 1, 0.36, 1];

// `tone="dark"` lifts the arrow's indigo and violet, which sink into a navy background.
export default function BrandMark({ tone = 'dark', animate = true, className = '' }) {
  const id = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const draw = animate && !reduce;
  const arrowStops = tone === 'dark'
    ? ['#1391C4', '#6B74D6', '#A67BE8']
    : ['#1376B4', '#42499D', '#5E328C'];

  return (
    <svg viewBox="400 60 830 540" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-loop`} gradientUnits="userSpaceOnUse" x1="435" y1="400" x2="1005" y2="400">
          <stop offset="0%" stopColor="#E02A2A" />
          <stop offset="20%" stopColor="#F07030" />
          <stop offset="42%" stopColor="#F0D030" />
          <stop offset="58%" stopColor="#0A924E" />
          <stop offset="74%" stopColor="#129880" />
          <stop offset="100%" stopColor="#1391C4" />
        </linearGradient>
        <linearGradient id={`${id}-arrow`} gradientUnits="userSpaceOnUse" x1="829" y1="504" x2="1186" y2="92">
          {/* Starts on the loop's own colour at the join, so the arrow grows out of it */}
          <stop offset="0%" stopColor="#129880" />
          <stop offset="22%" stopColor={arrowStops[0]} />
          <stop offset="62%" stopColor={arrowStops[1]} />
          <stop offset="100%" stopColor={arrowStops[2]} />
        </linearGradient>
      </defs>

      <motion.path
        d={LOOP}
        stroke={`url(#${id}-loop)`}
        strokeWidth="46"
        strokeLinecap="round"
        initial={draw ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      />
      <motion.path
        d={ARROW}
        stroke={`url(#${id}-arrow)`}
        strokeWidth="46"
        strokeLinecap="butt"
        initial={draw ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: draw ? 1.2 : 0, ease: 'easeOut' }}
      />
      <motion.polygon
        points={ARROW_HEAD}
        fill={arrowStops[2]}
        initial={draw ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: draw ? 1.75 : 0 }}
      />

      {draw && (
        <circle r="9" fill="#ffffff" opacity="0">
          <animate attributeName="opacity" from="0" to="0.9" begin="1.8s" dur="0.4s" fill="freeze" />
          <animateMotion dur="7s" begin="1.8s" repeatCount="indefinite" path={LOOP} />
        </circle>
      )}
    </svg>
  );
}

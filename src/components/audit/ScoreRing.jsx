import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { scoreBand, scoreColor } from './scoreScale';

// The one number everyone looks at first. It animates from zero because a score
// that counts up reads as something that was measured; a number that is simply
// present reads as something that was decided.

export default function ScoreRing({ score, size = 168, stroke = 12, animate = true }) {
  const [counted, setCounted] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(score);

  // Reading straight through when animation is off keeps the effect out of the
  // render path entirely, rather than writing the final value back as state.
  const shown = animate ? counted : score;

  useEffect(() => {
    if (!animate) return;

    // Roughly 1.1s regardless of the distance travelled, so a 30 and a 95 take
    // the same time to land.
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1100);
      // Ease-out: fast at first, settles on the final number.
      setCounted(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, animate]);

  const band = scoreBand(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(27,49,114,0.10)" strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-heading font-700 leading-none"
            style={{ fontSize: size * 0.3, color }}
          >
            {shown}
          </span>
          <span className="text-[11px] text-[#64748b] font-500 tracking-wide mt-1">OUT OF 100</span>
        </div>
      </div>

      <div className="text-center mt-4">
        <div className="font-heading font-700 text-[18px]" style={{ color }}>{band.label}</div>
        <div className="text-[13px] text-[#64748b] mt-0.5 max-w-[220px]">{band.note}</div>
      </div>
    </div>
  );
}

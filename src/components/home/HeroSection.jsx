import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, Star, TrendingUp, Shield, Award, Rocket, Play, ShieldCheck, Check } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// ── Network constellation data ────────────────────────────────────────────────
const NODES = [
  [8,15],[22,8],[35,20],[15,32],[50,12],[65,22],[75,8],[85,18],[92,35],[78,40],
  [60,38],[45,42],[28,55],[10,60],[20,72],[38,78],[55,70],[72,65],[88,72],[95,58],
  [48,88],[65,85],[82,88],[5,80],[30,90],[70,90],[90,15],[3,45],[97,25],[50,50],
];

const EDGES = (() => {
  const e = [];
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      const dx = NODES[i][0] - NODES[j][0];
      const dy = NODES[i][1] - NODES[j][1];
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 18) e.push([i, j, d]);
    }
  }
  return e;
})();

// ── Infinity SVG path (mirrors logo's lemniscate) ─────────────────────────────
const INF = "M 720,400 C 655,248 435,248 435,400 C 435,552 655,552 720,400 C 785,248 1005,248 1005,400 C 1005,552 785,552 720,400";

// ── Floating stat card ────────────────────────────────────────────────────────
function FloatCard({ icon: Icon, value, label, gradient, delay, className }) {
  return (
    <motion.div
      className={`hidden xl:flex absolute items-center gap-3 rounded-2xl p-4 z-20 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(29,78,216,0.14)',
        boxShadow: '0 8px 32px rgba(27,49,114,0.12)',
      }}
      initial={{ opacity: 0, scale: 0.85, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: [24, 0, -9, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: { times: [0, 0.25, 0.65, 1], duration: 5 + delay * 0.3, delay, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-[#1B3172] font-heading font-700 text-base leading-none">{value}</div>
        <div className="text-[#64748b] text-xs mt-0.5 whitespace-nowrap">{label}</div>
      </div>
    </motion.div>
  );
}

// ── Main hero component ───────────────────────────────────────────────────────
export default function HeroSection() {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 25, damping: 22 });
  const sy = useSpring(my, { stiffness: 25, damping: 22 });

  // Two parallax layers at different speeds
  const l1x = useTransform(sx, [0, 1], [-28, 28]);
  const l1y = useTransform(sy, [0, 1], [-16, 16]);
  const l2x = useTransform(sx, [0, 1], [-14, 14]);
  const l2y = useTransform(sy, [0, 1], [-8, 8]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-dark pt-20"
      onMouseMove={onMove}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />

      {/* Radial gradient wash */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% 55%, rgba(107,63,160,0.05) 0%, transparent 70%)',
      }} />

      {/* ── Network constellation layer (faster parallax) ── */}
      <motion.div style={{ x: l1x, y: l1y }} className="absolute inset-0 z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Edges */}
          {EDGES.map(([i, j, d], k) => (
            <line key={k}
              x1={NODES[i][0]} y1={NODES[i][1]}
              x2={NODES[j][0]} y2={NODES[j][1]}
              stroke="#1D4ED8" strokeWidth="0.06"
              opacity={(1 - d / 18) * 0.22}
            />
          ))}
          {/* Nodes with breathing animation */}
          {NODES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.35" fill="#6B3FA0">
              <animate attributeName="opacity" values="0.2;0.75;0.2"
                dur={`${2.4 + (i % 6) * 0.55}s`}
                begin={`${(i * 0.23) % 2.8}s`}
                repeatCount="indefinite" />
              <animate attributeName="r" values="0.25;0.5;0.25"
                dur={`${2.4 + (i % 6) * 0.55}s`}
                begin={`${(i * 0.23) % 2.8}s`}
                repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </motion.div>

      {/* ── Infinity + decorations layer (slower parallax) ── */}
      <motion.div style={{ x: l2x, y: l2y }} className="absolute inset-0 z-0 pointer-events-none">
        <svg viewBox="0 0 1440 800" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none">
          <defs>
            <linearGradient id="ig1" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%"   stopColor="#F97316" />
              <stop offset="22%"  stopColor="#FACC15" />
              <stop offset="48%"  stopColor="#22C55E" />
              <stop offset="72%"  stopColor="#0EA5E9" />
              <stop offset="88%"  stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#6B3FA0" />
            </linearGradient>
            <filter id="ig-glow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Concentric pulse rings (behind infinity) */}
          {[130, 190, 260, 340].map((r, i) => (
            <circle key={i} cx="720" cy="400" r={r} stroke="#6B3FA0" strokeWidth="0.7" fill="none">
              <animate attributeName="r" values={`${r};${r + 28};${r}`} dur={`${4.5 + i * 1.3}s`} begin={`${i * 1.05}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.1;0.03;0.1" dur={`${4.5 + i * 1.3}s`} begin={`${i * 1.05}s`} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Infinity — outer glow */}
          <path d={INF} stroke="url(#ig1)" strokeWidth="18" strokeLinecap="round"
            filter="url(#ig-glow)" opacity="0"
            strokeDasharray="3200" strokeDashoffset="3200">
            <animate attributeName="stroke-dashoffset" from="3200" to="0" dur="2.8s" begin="0.2s" fill="freeze" />
            <animate attributeName="opacity" from="0" to="0.18" dur="0.6s" begin="0.2s" fill="freeze" />
          </path>

          {/* Infinity — crisp stroke */}
          <path d={INF} stroke="url(#ig1)" strokeWidth="3.5" strokeLinecap="round" opacity="0"
            strokeDasharray="3200" strokeDashoffset="3200">
            <animate attributeName="stroke-dashoffset" from="3200" to="0" dur="2.8s" begin="0.2s" fill="freeze" />
            <animate attributeName="opacity" from="0" to="0.65" dur="0.5s" begin="0.2s" fill="freeze" />
          </path>

          {/* Traveling glow dot along infinity */}
          <g filter="url(#dot-glow)">
            <circle r="10" fill="#6B3FA0" fillOpacity="0.35" opacity="0">
              <animate attributeName="opacity" from="0" to="1" begin="3.2s" dur="0.7s" fill="freeze" />
              <animateMotion dur="5s" begin="3.2s" repeatCount="indefinite" path={INF} />
            </circle>
            <circle r="4.5" fill="white" opacity="0">
              <animate attributeName="opacity" from="0" to="1" begin="3.2s" dur="0.7s" fill="freeze" />
              <animateMotion dur="5s" begin="3.2s" repeatCount="indefinite" path={INF} />
            </circle>
          </g>

          {/* Second traveling dot (offset by half period) */}
          <g filter="url(#dot-glow)">
            <circle r="7" fill="#0EA5E9" fillOpacity="0.3" opacity="0">
              <animate attributeName="opacity" from="0" to="0.8" begin="5.7s" dur="0.7s" fill="freeze" />
              <animateMotion dur="5s" begin="5.7s" repeatCount="indefinite" path={INF} />
            </circle>
            <circle r="3" fill="white" opacity="0">
              <animate attributeName="opacity" from="0" to="0.8" begin="5.7s" dur="0.7s" fill="freeze" />
              <animateMotion dur="5s" begin="5.7s" repeatCount="indefinite" path={INF} />
            </circle>
          </g>

          {/* Rising arrow (echoes logo arrow) */}
          <path d="M 1170 630 Q 1240 480 1285 310" stroke="#6B3FA0" strokeWidth="2.5" strokeLinecap="round"
            opacity="0" strokeDasharray="380" strokeDashoffset="380">
            <animate attributeName="stroke-dashoffset" from="380" to="0" begin="2.6s" dur="1.4s" fill="freeze" />
            <animate attributeName="opacity" from="0" to="0.55" begin="2.6s" dur="0.3s" fill="freeze" />
          </path>
          <polygon points="1285,292 1273,322 1300,316" fill="#6B3FA0" opacity="0">
            <animate attributeName="opacity" from="0" to="0.55" begin="4s" dur="0.5s" fill="freeze" />
          </polygon>
          {/* Small dot on arrowhead */}
          <circle cx="1285" cy="300" r="5" fill="#6B3FA0" opacity="0">
            <animate attributeName="opacity" from="0" to="0.7" begin="4s" dur="0.4s" fill="freeze" />
            <animate attributeName="r" values="5;8;5" dur="2s" begin="4.5s" repeatCount="indefinite" />
          </circle>

          {/* Animated data-stream lines */}
          {[
            { x1: 90,   y1: 780, x2: 220,  y2: 40,  c: '#F97316' },
            { x1: 1350, y1: 780, x2: 1220, y2: 60,  c: '#22C55E' },
            { x1: 45,   y1: 780, x2: 120,  y2: 120, c: '#0EA5E9' },
          ].map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.c} strokeWidth="1" opacity="0.12" strokeDasharray="6 14">
              <animate attributeName="stroke-dashoffset" values="0;-200" dur={`${7 + i * 1.5}s`} repeatCount="indefinite" />
            </line>
          ))}

          {/* Corner accent circles */}
          <circle cx="115" cy="95" r="42" stroke="#F97316" strokeWidth="1.5" fill="none" opacity="0"
            strokeDasharray="264" strokeDashoffset="264">
            <animate attributeName="stroke-dashoffset" from="264" to="0" begin="0.5s" dur="1.8s" fill="freeze" />
            <animate attributeName="opacity" from="0" to="0.2" begin="0.5s" dur="0.4s" fill="freeze" />
          </circle>
          <circle cx="115" cy="95" r="24" stroke="#F97316" strokeWidth="1" fill="none" opacity="0"
            strokeDasharray="150" strokeDashoffset="150">
            <animate attributeName="stroke-dashoffset" from="150" to="0" begin="0.9s" dur="1.4s" fill="freeze" />
            <animate attributeName="opacity" from="0" to="0.15" begin="0.9s" dur="0.4s" fill="freeze" />
          </circle>

          <circle cx="1325" cy="710" r="55" stroke="#0EA5E9" strokeWidth="1.5" fill="none" opacity="0"
            strokeDasharray="345" strokeDashoffset="345">
            <animate attributeName="stroke-dashoffset" from="345" to="0" begin="1s" dur="1.8s" fill="freeze" />
            <animate attributeName="opacity" from="0" to="0.18" begin="1s" dur="0.4s" fill="freeze" />
          </circle>
          <circle cx="1325" cy="710" r="30" stroke="#1D4ED8" strokeWidth="1" fill="none" opacity="0"
            strokeDasharray="188" strokeDashoffset="188">
            <animate attributeName="stroke-dashoffset" from="188" to="0" begin="1.4s" dur="1.4s" fill="freeze" />
            <animate attributeName="opacity" from="0" to="0.14" begin="1.4s" dur="0.4s" fill="freeze" />
          </circle>

          {/* Scattered accent dots */}
          {[
            { cx: 180, cy: 680, r: 3, c: '#F97316' },
            { cx: 260, cy: 720, r: 2, c: '#FACC15' },
            { cx: 1260, cy: 130, r: 3, c: '#0EA5E9' },
            { cx: 1180, cy: 90,  r: 2, c: '#6B3FA0' },
            { cx: 140, cy: 480, r: 2, c: '#22C55E' },
          ].map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.c} opacity="0.35">
              <animate attributeName="opacity" values="0.2;0.6;0.2"
                dur={`${3 + i * 0.8}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </motion.div>

      {/* ── Floating stat cards ── */}
      <FloatCard icon={TrendingUp} value="200+"   label="Businesses Served" gradient="from-[#6B3FA0] to-[#1D4ED8]"  delay={1.4} className="left-6 top-[36%]" />
      <FloatCard icon={Star}       value="Free"  label="Growth Audit"         gradient="from-amber-400 to-orange-500" delay={1.7} className="left-6 top-[58%]" />
      <FloatCard icon={Shield}     value="30min" label="Avg Audit Time"       gradient="from-[#1D4ED8] to-[#0EA5E9]"  delay={1.5} className="right-6 top-[36%]" />
      <FloatCard icon={Award}      value="10+"   label="Years Experience"     gradient="from-emerald-500 to-cyan-500" delay={1.8} className="right-6 top-[58%]" />

      {/* ── Main content ── */}
      <div className="container-xl relative z-10 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-8"
          >
            <div className="section-label">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Trusted Digital Growth Partner Since 2014
            </div>
          </motion.div>

          {/* H1 — word-by-word reveal */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-800 text-[#1B3172] leading-[1.1] tracking-[-0.03em] mb-6">
            {['Your', 'Business', 'Deserves', 'a'].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0.01, y: 36, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
              >
                {w}
              </motion.span>
            ))}
            {' '}
            {['Growth', 'Partner,'].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0.01, y: 36, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, delay: 0.51 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
                style={{ background: 'linear-gradient(135deg, #6B3FA0 0%, #1D4ED8 50%, #0EA5E9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                {w}
              </motion.span>
            ))}
            {' '}
            {['Not', 'Just', 'a', 'Vendor'].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0.01, y: 36, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, delay: 0.72 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
              >
                {w}
              </motion.span>
            ))}
          </h1>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: 'easeOut' }}
            className="flex justify-center mb-4"
          >
            <div className="section-label">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Use Before You Trust. Trust Before You Pay.
            </div>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.15, ease: 'easeOut' }}
            className="text-lg sm:text-xl text-[#475569] leading-relaxed max-w-2xl mx-auto mb-10"
          >
            We analyze your digital presence — website, Google listing, leads, automation, branding, and operations — then build and execute a tailored growth plan that drives real revenue.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.25, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <a href="tel:+19082012264" className="btn-primary text-base px-8 py-4 w-full sm:w-auto justify-center">
              <Rocket className="w-5 h-5" />
              No Payment. Just Results.
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </a>
            <a href="#how-it-works" className="btn-ghost text-base px-8 py-4 w-full sm:w-auto justify-center">
              <Play className="w-4 h-4" />
              See How It Works
            </a>
          </motion.div>

          {/* Promise banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.35, ease: 'easeOut' }}
            className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl px-6 py-3.5 max-w-xl mx-auto mb-8"
          >
            <p className="text-sm font-medium text-[#3730A3] mb-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4F46E5] flex-shrink-0" />
              Go Live Today. See the Difference in 15 Days.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {["No lock-in", "No risk", "No charges if you can't see the difference yourself"].map((pill, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs text-[#4338CA] bg-white border border-[#C7D2FE] rounded-full py-1 px-3">
                  <Check className="w-3 h-3 text-[#16A34A] flex-shrink-0" />
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Star rating */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.45, duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 1.5 + i * 0.07, type: 'spring', stiffness: 400, damping: 14 }}
                >
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </motion.div>
              ))}
            </div>
            <span className="text-sm text-[#475569]">Rated 5/5 by small business owners on Google</span>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.55 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm text-[#64748b]"
          >
            {[
              { icon: '✓', text: 'Serving 200+ Small Businesses' },
              { icon: '✓', text: 'Dover, DE Registered' },
              { icon: '✓', text: '5-Star Google Reviews' },
            ].map((b, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-1.5"
              >
                {i > 0 && <span className="text-slate-300 hidden sm:inline">·</span>}
                <span className="text-emerald-500 font-bold">{b.icon}</span>
                {b.text}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="text-[10px] text-[#94a3b8] tracking-[0.25em] uppercase font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-[#94a3b8]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

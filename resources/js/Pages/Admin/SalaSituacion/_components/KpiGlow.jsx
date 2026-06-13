import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function KpiGlow({ icono, label, valor, color, delay = 0, darkMode = true }) {
  const ref = useRef(null);
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.floor(v));

  useEffect(() => {
    motionVal.set(0);
    const timer = setTimeout(() => motionVal.set(valor), 100 + delay);
    return () => clearTimeout(timer);
  }, [valor, delay]);

  const dm = (d, l) => (darkMode ? d : l);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl border p-5 text-center group hover:scale-[1.02] transition-all duration-300 cursor-default ${dm('bg-white/5 backdrop-blur-xl border-white/10', 'bg-white border-slate-200 shadow-sm')}`}
      style={{ boxShadow: darkMode ? `0 0 40px ${color}20, inset 0 1px 0 ${color}30` : `0 0 10px ${color}10` }}
    >
      <div className={`absolute inset-0 pointer-events-none ${dm('bg-gradient-to-br from-transparent via-transparent to-white/5', 'hidden')}`} />
      <div className="text-3xl mb-2">{icono}</div>
      <motion.p className={`text-4xl sm:text-5xl font-black tabular-nums ${dm('text-white', 'text-slate-800')}`}>
        {rounded}
      </motion.p>
      <p className={`text-xs font-semibold uppercase tracking-wider mt-1.5 ${dm('text-white/50', 'text-slate-500')}`}>{label}</p>
      <div
        className={`absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-1000 ${dm('', 'hidden')}`}
        style={darkMode ? {
          width: `${Math.min((valor / 1000) * 100, 100)}%`,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        } : {}}
      />
    </motion.div>
  );
}

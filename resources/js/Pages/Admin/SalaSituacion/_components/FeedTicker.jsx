import { useRef, useEffect, useState } from 'react';

export default function FeedTicker({ items = [], darkMode = true }) {
  const [duplicated, setDuplicated] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    setDuplicated([...items, ...items]);
  }, [items]);

  if (!items.length) return null;

  const dm = (d, l) => (darkMode ? d : l);

  return (
    <div className={`relative overflow-hidden rounded-xl border transition-colors duration-500 ${dm('border-white/10 bg-white/5 backdrop-blur-xl', 'border-slate-200 bg-white shadow-sm')}`}>
      <div className={`px-4 py-2 border-b flex items-center gap-2 ${dm('border-white/5', 'border-slate-100')}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className={`text-xs font-bold uppercase tracking-wider ${dm('text-white/60', 'text-slate-500')}`}>Actividad en vivo</span>
        <span className={`text-[10px] ml-auto ${dm('text-white/30', 'text-slate-300')}`}>hoy</span>
      </div>
      <div className="relative overflow-hidden h-10">
        <div
          ref={containerRef}
          className="absolute flex items-center gap-8 whitespace-nowrap ticker-scroll"
          style={{ animation: 'ticker 30s linear infinite' }}
        >
          {duplicated.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span>{item.icono}</span>
              <span className={`font-medium ${dm('text-white/80', 'text-slate-700')}`}>{item.texto}</span>
              <span className={`text-xs ${dm('text-white/30', 'text-slate-300')}`}>•</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

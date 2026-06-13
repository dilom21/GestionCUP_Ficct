import { motion } from 'framer-motion';

export default function HeroReportes({ kpi }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B2046] via-[#122D5C] to-[#1E62A0] p-6 sm:p-8 mb-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3"
            >
              <span className="text-3xl">📈</span>
              Reportes y Analítica
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-blue-200/80 mt-1 text-sm"
            >
              Visualiza, analiza y exporta los datos del Curso Preuniversitario FICCT
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

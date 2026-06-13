import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingMic({ onClick, isListening }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`fixed z-40 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300
        bottom-20 right-4 sm:bottom-8 sm:right-8
        w-14 h-14 sm:w-16 sm:h-16
        ${isListening
          ? 'bg-red-500 shadow-red-500/50 animate-pulse-mic'
          : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-600/30 hover:shadow-blue-600/50'
        }`}
    >
      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
      {isListening && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-white" />
      )}
    </motion.button>
  );
}

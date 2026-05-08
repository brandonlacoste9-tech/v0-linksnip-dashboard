// SentinelShield.tsx
// Real-Time Status Engine for the MRK Protocol
// Obsidian Glass + Gold Filament visual grammar

import { motion, AnimatePresence } from "framer-motion";
import { SentinelState } from "@/lib/mrk/edge/SentinelStateMachine";

interface SentinelShieldProps {
  state: SentinelState;
  onDenialDismiss?: () => void;
}

const stateMetadata: Record<SentinelState, {
  label: string;
  coreIntensity: number;
  filamentSpeed: number;
  borderGlow: string;
}> = {
  dormant: {
    label: "STANDBY",
    coreIntensity: 0.1,
    filamentSpeed: 8,
    borderGlow: "rgba(212, 175, 55, 0.15)",
  },
  evaluating: {
    label: "EVALUATING",
    coreIntensity: 0.3,
    filamentSpeed: 1.5,
    borderGlow: "rgba(212, 175, 55, 0.4)",
  },
  locked: {
    label: "IDENTITY REQUIRED",
    coreIntensity: 0.6,
    filamentSpeed: 0.8,
    borderGlow: "rgba(212, 175, 55, 0.7)",
  },
  defending: {
    label: "THREAT DETECTED",
    coreIntensity: 0.8,
    filamentSpeed: 0.3,
    borderGlow: "rgba(220, 38, 38, 0.6)",
  },
  resolved: {
    label: "VERIFIED",
    coreIntensity: 1.0,
    filamentSpeed: 0.15,
    borderGlow: "rgba(212, 175, 55, 1)",
  },
  denied: {
    label: "ACCESS DENIED",
    coreIntensity: 0,
    filamentSpeed: 0,
    borderGlow: "rgba(127, 29, 29, 0.8)",
  },
};

export const SentinelShield = ({ state, onDenialDismiss }: SentinelShieldProps) => {
  const meta = stateMetadata[state];
  const isDenied = state === "denied";
  const isResolved = state === "resolved";

  return (
    <div className="relative flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Obsidian Glass Base */}
        <motion.div
          className="absolute inset-0 rounded-full bg-navy-950/90 backdrop-blur-xl shadow-imperial-inner"
          style={{
            border: `1.5px solid ${meta.borderGlow}`,
            boxShadow: `inset 0 0 40px rgba(0,0,0,0.6), 0 0 30px ${meta.borderGlow}`,
          }}
          animate={{
            scale: isResolved ? [1, 1.03] : 1,
            opacity: isDenied ? 0.6 : 1,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Gold Filament Wireframe */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <motion.path
            d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z"
            fill="none"
            stroke={isDenied ? "#7F1D1D" : "url(#goldGradient)"}
            strokeWidth="0.6"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: isResolved ? 1 : [0.3, 0.6, 0.3],
              pathOffset: isResolved ? 0 : [0, 0.5, 1],
            }}
            transition={{
              duration: isResolved ? 0.6 : meta.filamentSpeed,
              repeat: isResolved ? 0 : Infinity,
              ease: "linear",
            }}
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#F9A602" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>

        {/* Resolved: Shatter Effect */}
        <AnimatePresence>
          {isResolved && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-gold-400/80 rounded-sm"
                  initial={{ x: 0, y: 0, scale: 1, opacity: 0.8 }}
                  animate={{
                    x: Math.cos((i / 12) * Math.PI * 2) * 120,
                    y: Math.sin((i / 12) * Math.PI * 2) * 120,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.05,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Denied: Cryptographic Lock */}
        <AnimatePresence>
          {isDenied && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <motion.path
                  d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z"
                  fill="none"
                  stroke="#7F1D1D"
                  strokeWidth="1.2"
                  initial={{ pathLength: 1 }}
                  animate={{ pathLength: 0.6 }}
                />
                <motion.path
                  d="M50 5 L50 50 L75 65"
                  fill="none"
                  stroke="#991B1B"
                  strokeWidth="0.8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                />
                <motion.path
                  d="M50 50 L20 70"
                  fill="none"
                  stroke="#991B1B"
                  strokeWidth="0.8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Agent Core */}
        <motion.div
          className="w-20 h-20 rounded-full bg-gold-500 blur-2xl"
          animate={{
            opacity: isDenied ? 0 : isResolved ? [0.4, 0.9, 0] : [0.1, meta.coreIntensity, 0.1],
            scale: isResolved ? [1, 1.5, 0] : 1,
          }}
          transition={{
            duration: isResolved ? 0.8 : 2,
            repeat: isResolved ? 0 : Infinity,
          }}
        />

        {/* State Label */}
        <motion.span
          className="z-10 font-serif text-xs tracking-[0.3em] uppercase text-center px-4"
          style={{ color: isDenied ? "#991B1B" : "#D4AF37" }}
          animate={{
            opacity: [0.6, 1, 0.6],
            letterSpacing: isDenied ? "0.5em" : "0.3em",
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {meta.label}
        </motion.span>
      </div>

      {/* Denied: Access Denied Message & Retry */}
      <AnimatePresence>
        {isDenied && (
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="font-serif text-sm tracking-wider text-red-400/80 text-center max-w-xs">
              Biometric verification declined. This destination requires sovereign identity confirmation.
            </p>
            <button
              onClick={onDenialDismiss}
              className="px-6 py-2 border border-gold-500/30 text-gold-400 font-serif text-xs tracking-[0.2em] uppercase hover:bg-gold-500/10 transition-colors duration-300"
            >
              Return to Safety
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edge Metadata HUD */}
      {!isDenied && !isResolved && (
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 font-mono text-[10px] tracking-wider text-gold-400/40">
          <span>LAT: 0.4ms</span>
          <span>AUTH: WEBAUTHN</span>
          <span>RES: QUEBEC</span>
        </div>
      )}
    </div>
  );
};

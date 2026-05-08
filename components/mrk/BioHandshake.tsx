// BioHandshake.tsx
// The Handshake Ceremony UI
// Requires hardware enclave verification to claim the mark

import { motion } from "framer-motion";
import { ShieldCheck, Fingerprint, Key, Loader } from "lucide-react";

type HandshakeStatus = "idle" | "preparing" | "waiting" | "verifying" | "success" | "failed";

interface BioHandshakeProps {
  onInitiate: () => void;
  status: HandshakeStatus;
  errorMessage?: string;
}

const statusConfig: Record<HandshakeStatus, {
  icon: React.ReactNode;
  label: string;
  subtext: string;
}> = {
  idle: {
    icon: <ShieldCheck className="w-12 h-12" />,
    label: "Sovereign Handshake",
    subtext: "Verify hardware enclave to claim mark",
  },
  preparing: {
    icon: <Loader className="w-12 h-12 animate-spin" />,
    label: "Preparing Challenge",
    subtext: "Establishing secure channel",
  },
  waiting: {
    icon: <Fingerprint className="w-12 h-12" />,
    label: "Awaiting Verification",
    subtext: "Use Face ID, Touch ID, or security key",
  },
  verifying: {
    icon: <Loader className="w-12 h-12 animate-spin" />,
    label: "Verifying Credential",
    subtext: "Validating cryptographic proof",
  },
  success: {
    icon: <ShieldCheck className="w-12 h-12" />,
    label: "Mark Claimed",
    subtext: "Sovereign identity verified",
  },
  failed: {
    icon: <Key className="w-12 h-12" />,
    label: "Handshake Failed",
    subtext: "Verification declined or timed out",
  },
};

export const BioHandshake = ({ onInitiate, status, errorMessage }: BioHandshakeProps) => {
  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-12 p-12 bg-navy-950/50 backdrop-blur-2xl border border-gold-500/10 rounded-2xl shadow-imperial">
      <div className="relative">
        {/* Aura */}
        <motion.div
          className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Trigger / Status Icon */}
        <button
          onClick={status === "idle" ? onInitiate : undefined}
          disabled={status !== "idle"}
          className="relative z-10 w-32 h-32 flex items-center justify-center rounded-full bg-navy-900 border border-gold-500/30 group hover:border-gold-500/60 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <motion.div
            animate={status === "verifying" || status === "preparing" ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-gold-500/50 group-hover:text-gold-400 transition-colors"
          >
            {config.icon}
          </motion.div>
        </button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="font-serif text-lg tracking-[0.3em] text-gold-400 uppercase">
          {config.label}
        </h2>
        <p className="font-sans text-xs tracking-widest text-gold-500/40 uppercase max-w-xs">
          {config.subtext}
        </p>
        {errorMessage && (
          <p className="font-mono text-[10px] text-red-400 tracking-wider mt-2">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

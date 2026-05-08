// VelocityGraph.tsx
// Real-time gold-line temporal graph for the Imperial Console HUD

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AggregationEngine, VelocityMetric, ThreatSurfaceReport } from "@/lib/mrk/intelligence/AggregationEngine";

interface VelocityGraphProps {
  engine: AggregationEngine;
  refreshIntervalMs?: number;
}

export const VelocityGraph = ({ engine, refreshIntervalMs = 5000 }: VelocityGraphProps) => {
  const [currentVelocity, setCurrentVelocity] = useState<VelocityMetric | null>(null);
  const [historicalData, setHistoricalData] = useState<VelocityMetric[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<'1m' | '5m' | '15m' | '1h' | '24h'>('5m');

  useEffect(() => {
    const interval = setInterval(() => {
      const velocity = engine.getCurrentVelocity(selectedWindow);
      if (velocity) {
        setCurrentVelocity(velocity);
        setHistoricalData(prev => [...prev.slice(-59), velocity]);
      }
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [engine, selectedWindow, refreshIntervalMs]);

  const maxHandshakes = Math.max(...historicalData.map(d => d.totalHandshakes), 1);
  const sparklinePoints = historicalData.map((d, i) => {
    const x = (i / Math.max(historicalData.length - 1, 1)) * 100;
    const y = 100 - (d.totalHandshakes / maxHandshakes) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative bg-navy-950/80 backdrop-blur-xl border border-gold-500/10 rounded-2xl p-8 shadow-imperial">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-serif text-sm tracking-[0.3em] text-gold-400 uppercase">
          Global Handshake Velocity
        </h3>
        <div className="flex gap-2">
          {(['1m', '5m', '15m', '1h', '24h'] as const).map(window => (
            <button
              key={window}
              onClick={() => setSelectedWindow(window)}
              className={`px-3 py-1 font-mono text-[10px] tracking-wider uppercase transition-all duration-300 ${
                selectedWindow === window
                  ? 'text-gold-400 border-b border-gold-500/50'
                  : 'text-gold-500/30 hover:text-gold-500/60'
              }`}
            >
              {window}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-48 mb-6">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[25, 50, 75].map(y => (
            <motion.line
              key={y}
              x1="0" y1={y} x2="100" y2={y}
              stroke="rgba(212, 175, 55, 0.05)"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ))}
          
          <motion.polyline
            points={sparklinePoints}
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {historicalData.map((d, i) => {
            if (d.defendingRate > 0.1) {
              const x = (i / Math.max(historicalData.length - 1, 1)) * 100;
              const y = 100 - (d.totalHandshakes / maxHandshakes) * 100;
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#DC2626"
                  opacity={0.6}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5 }}
                />
              );
            }
            return null;
          })}

          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#F9A602" stopOpacity="1" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {currentVelocity && (
        <div className="grid grid-cols-4 gap-4">
          <MetricTile label="Handshakes" value={currentVelocity.totalHandshakes.toLocaleString()} />
          <MetricTile label="Resolved Rate" value={`${(currentVelocity.resolvedRate * 100).toFixed(1)}%`} />
          <MetricTile label="Avg Latency" value={`${currentVelocity.avgLatencyMs.toFixed(1)}ms`} />
          <MetricTile 
            label="Defending" 
            value={`${(currentVelocity.defendingRate * 100).toFixed(1)}%`}
            isAlert={currentVelocity.defendingRate > 0.05}
          />
        </div>
      )}

      {!currentVelocity && (
        <div className="flex items-center justify-center h-48">
          <p className="font-serif text-xs tracking-[0.2em] text-gold-500/30 uppercase">
            Awaiting Handshake Data
          </p>
        </div>
      )}
    </div>
  );
};

const MetricTile = ({ label, value, isAlert = false }: { label: string; value: string; isAlert?: boolean }) => (
  <div className="text-center">
    <p className="font-mono text-[10px] tracking-wider text-gold-500/40 uppercase mb-1">{label}</p>
    <p className={`font-mono text-lg tracking-wider ${isAlert ? 'text-red-400' : 'text-gold-400'}`}>
      {value}
    </p>
  </div>
);

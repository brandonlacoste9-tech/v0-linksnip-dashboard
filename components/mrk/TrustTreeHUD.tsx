// TrustTreeHUD.tsx
// Spatial gold-filament node graph for trust chain visualization
// Displays Origin → Trust Keys → Sub-Keys with animated severance on revocation

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { TrustAnchor, TrustKey, TrustDelegationEngine } from "@/lib/mrk/trust/TrustDelegationEngine";

interface TreeNode {
  id: string;
  label: string;
  depth: number;
  status: 'active' | 'revoked' | 'unclaimed' | 'purging';
  children: TreeNode[];
  x: number;
  y: number;
  parentId: string | null;
}

interface TrustTreeHUDProps {
  engine: TrustDelegationEngine;
  originHash: string;
  onRevoke: (targetHash: string) => Promise<void>;
  onEmitInvite: () => Promise<void>;
}

export const TrustTreeHUD = ({ engine, originHash, onRevoke, onEmitInvite }: TrustTreeHUDProps) => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [purgingNodes, setPurgingNodes] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [cohortStats, setCohortStats] = useState({ totalOrigins: 0, totalTrustKeys: 0, totalSubKeys: 0 });

  const buildTreeLayout = useCallback(async () => {
    const origin = await engine.getTrustTree(originHash);
    if (!origin) return null;

    const layoutNode = async (anchor: TrustAnchor, depth: number, parentX: number, parentY: number, index: number, totalSiblings: number): Promise<TreeNode> => {
      const angle = (index / totalSiblings) * Math.PI * 2;
      const radius = depth === 0 ? 0 : depth === 1 ? 180 : 120;
      const x = parentX + Math.cos(angle) * radius;
      const y = parentY + Math.sin(angle) * radius;

      const childrenPromises = anchor.delegatedKeys.map(async (key, i) => {
        const childAnchor = await engine.getTrustTree(key.id);
        if (childAnchor) {
          return await layoutNode(childAnchor, depth + 1, x, y, i, anchor.delegatedKeys.length);
        }
        return {
          id: key.id,
          label: 'VACANT',
          depth: depth + 1,
          status: 'unclaimed' as const,
          children: [],
          x: x + Math.cos((i / anchor.delegatedKeys.length) * Math.PI * 2) * 120,
          y: y + Math.sin((i / anchor.delegatedKeys.length) * Math.PI * 2) * 120,
          parentId: anchor.id,
        };
      });

      const children = await Promise.all(childrenPromises);

      const maxDelegations = anchor.maxDelegations || (depth === 0 ? 5 : depth === 1 ? 3 : 0);
      const vacantSlots = maxDelegations - anchor.delegatedKeys.length;
      for (let i = 0; i < vacantSlots; i++) {
        const slotIndex = anchor.delegatedKeys.length + i;
        children.push({
          id: `${anchor.id}_vacant_${i}`,
          label: 'VACANT',
          depth: depth + 1,
          status: 'unclaimed',
          children: [],
          x: x + Math.cos((slotIndex / maxDelegations) * Math.PI * 2) * 120,
          y: y + Math.sin((slotIndex / maxDelegations) * Math.PI * 2) * 120,
          parentId: anchor.id,
        });
      }

      return {
        id: anchor.id,
        label: getNodeLabel(anchor),
        depth,
        status: anchor.isRevoked ? 'revoked' : 'active',
        children,
        x,
        y,
        parentId: anchor.parentProvenanceHash,
      };
    };

    return await layoutNode(origin, 0, 400, 350, 0, 1);
  }, [engine, originHash]);

  const getNodeLabel = (anchor: TrustAnchor): string => {
    switch (anchor.trustDepth) {
      case 0: return 'ORIGIN';
      case 1: return 'TRUST KEY';
      case 2: return 'SUB-KEY';
      default: return 'UNKNOWN';
    }
  };

  const findNodeById = (root: TreeNode, id: string): TreeNode | null => {
    if (root.id === id) return root;
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  const handleRevoke = async (targetHash: string) => {
    if (isRevoking || !treeData) return;
    setIsRevoking(true);
    setPurgingNodes(new Set([targetHash]));

    const collectDescendants = (nodeId: string): string[] => {
      const ids = [nodeId];
      const node = findNodeById(treeData, nodeId);
      if (node) {
        node.children.forEach(child => {
          ids.push(...collectDescendants(child.id));
        });
      }
      return ids;
    };

    const allAffected = collectDescendants(targetHash);
    setPurgingNodes(new Set(allAffected));

    await onRevoke(targetHash);

    setTimeout(async () => {
      setPurgingNodes(new Set());
      setIsRevoking(false);
      const stats = await engine.getAnonymizedCohortStats();
      setCohortStats(stats);
      const newLayout = await buildTreeLayout();
      setTreeData(newLayout);
    }, 3000);
  };

  useEffect(() => {
    engine.getAnonymizedCohortStats().then(setCohortStats);
    buildTreeLayout().then(setTreeData);
  }, [buildTreeLayout, engine]);

  if (!treeData) {
    return (
      <div className="flex items-center justify-center h-96 bg-navy-950/80 backdrop-blur-xl border border-gold-500/10 rounded-2xl">
        <p className="font-serif text-xs tracking-[0.2em] text-gold-500/30 uppercase">
          No Trust Chain Established
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-navy-950/80 backdrop-blur-xl border border-gold-500/10 rounded-2xl p-8 shadow-imperial overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-serif text-sm tracking-[0.3em] text-gold-400 uppercase">
            Sovereign Trust Chain
          </h3>
          <p className="font-mono text-[10px] tracking-wider text-gold-500/30 mt-1">
            {cohortStats.totalOrigins} ORIGINS · {cohortStats.totalTrustKeys} KEYS · {cohortStats.totalSubKeys} SUB-KEYS
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onEmitInvite}
            className="px-4 py-2 border border-gold-500/30 text-gold-400 font-serif text-xs tracking-[0.2em] uppercase hover:bg-gold-500/10 transition-all duration-300"
          >
            Emit Trust Key
          </button>
          {selectedNode && selectedNode !== originHash && (
            <button
              onClick={() => handleRevoke(selectedNode)}
              disabled={isRevoking}
              className="px-4 py-2 border border-red-500/30 text-red-400 font-serif text-xs tracking-[0.2em] uppercase hover:bg-red-500/10 transition-all duration-300 disabled:opacity-30"
            >
              Sever Chain
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full h-[600px]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 700">
          <AnimatePresence>
            {renderConnections(treeData, purgingNodes, hoveredNode)}
          </AnimatePresence>

          <AnimatePresence>
            {renderNodes(treeData, selectedNode, hoveredNode, purgingNodes, setSelectedNode, setHoveredNode)}
          </AnimatePresence>
        </svg>

        <AnimatePresence>
          {selectedNode && (
            <NodeDetailPanel
              node={findNodeById(treeData, selectedNode)}
              onClose={() => setSelectedNode(null)}
              onRevoke={() => handleRevoke(selectedNode)}
              isRevoking={isRevoking}
              isOrigin={selectedNode === originHash}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {purgingNodes.size > 0 && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-red-950/80 border border-red-500/30 rounded-full backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-mono text-[10px] tracking-wider text-red-400 uppercase">
              Propagating Revocation to Global Edge Nodes
            </span>
            <span className="font-mono text-[10px] text-red-500/60">
              {purgingNodes.size} NODES SEVERING
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 flex gap-4">
        <LegendItem color="gold" label="Active" />
        <LegendItem color="red" label="Revoked" />
        <LegendItem color="gray" label="Vacant" />
      </div>
    </div>
  );
};

const renderConnections = (
  node: TreeNode,
  purgingNodes: Set<string>,
  hoveredNode: string | null
): React.ReactNode[] => {
  const lines: React.ReactNode[] = [];
  const traverse = (n: TreeNode) => {
    n.children.forEach(child => {
      const isPurging = purgingNodes.has(child.id) || purgingNodes.has(n.id);
      const isHovered = hoveredNode === n.id || hoveredNode === child.id;
      lines.push(
        <motion.line
          key={`${n.id}-${child.id}`}
          x1={n.x}
          y1={n.y}
          x2={child.x}
          y2={child.y}
          stroke={isPurging ? '#DC2626' : isHovered ? '#F9A602' : 'rgba(212, 175, 55, 0.2)'}
          strokeWidth={isHovered ? 1.5 : 0.5}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: isPurging ? [1, 0] : 1,
            opacity: isPurging ? [1, 0] : isHovered ? 1 : 0.5,
          }}
          transition={{
            duration: isPurging ? 2 : 1,
            ease: "easeInOut",
          }}
        />
      );
      traverse(child);
    });
  };
  traverse(node);
  return lines;
};

const renderNodes = (
  node: TreeNode,
  selectedNode: string | null,
  hoveredNode: string | null,
  purgingNodes: Set<string>,
  setSelectedNode: (id: string | null) => void,
  setHoveredNode: (id: string | null) => void
): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const traverse = (n: TreeNode) => {
    const isSelected = selectedNode === n.id;
    const isHovered = hoveredNode === n.id;
    const isPurging = purgingNodes.has(n.id);
    const isVacant = n.status === 'unclaimed';
    const isRevoked = n.status === 'revoked';
    const isOrigin = n.depth === 0;

    nodes.push(
      <motion.g
        key={n.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isPurging ? [1, 1.2, 0] : 1,
          opacity: isPurging ? [1, 0.5, 0] : 1,
        }}
        transition={{
          duration: isPurging ? 2 : 0.5,
          ease: "easeOut",
        }}
        style={{ transformOrigin: `${n.x}px ${n.y}px` }}
      >
        {!isVacant && !isRevoked && (
          <motion.circle
            cx={n.x}
            cy={n.y}
            r={isOrigin ? 40 : 25}
            fill={isPurging ? '#DC2626' : '#D4AF37'}
            opacity={0.05}
            animate={{
              scale: isHovered ? [1, 1.2, 1] : 1,
              opacity: isHovered ? [0.05, 0.15, 0.05] : 0.05,
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <motion.circle
          cx={n.x}
          cy={n.y}
          r={isOrigin ? 30 : 18}
          fill="transparent"
          stroke={
            isPurging ? '#DC2626' :
            isRevoked ? '#7F1D1D' :
            isVacant ? 'rgba(212, 175, 55, 0.1)' :
            isSelected ? '#F9A602' :
            isHovered ? '#D4AF37' :
            'rgba(212, 175, 55, 0.3)'
          }
          strokeWidth={isOrigin ? 1.5 : 1}
          className="cursor-pointer"
          onClick={() => !isVacant && setSelectedNode(isSelected ? null : n.id)}
          onMouseEnter={() => setHoveredNode(n.id)}
          onMouseLeave={() => setHoveredNode(null)}
          animate={{ strokeWidth: isSelected ? [1.5, 2, 1.5] : isOrigin ? 1.5 : 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {isOrigin && (
          <motion.polygon
            points={getHexagonPoints(n.x, n.y, 15)}
            fill="none"
            stroke={isPurging ? '#DC2626' : '#D4AF37'}
            strokeWidth="0.5"
            animate={{ rotate: isPurging ? [0, 180] : [0, 360] }}
            transition={{ duration: isPurging ? 2 : 20, repeat: Infinity, ease: "linear" }}
          />
        )}
        <motion.text
          x={n.x}
          y={n.y + (isOrigin ? 45 : 30)}
          textAnchor="middle"
          className={`font-mono text-[8px] tracking-wider uppercase fill-current ${
            isPurging ? 'text-red-400' :
            isRevoked ? 'text-red-600' :
            isVacant ? 'text-gold-500/20' :
            'text-gold-400'
          }`}
        >
          {n.label}
        </motion.text>
        {isVacant && (
          <motion.text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            className="font-mono text-[6px] fill-gold-500/20"
          >
            +
          </motion.text>
        )}
      </motion.g>
    );
    n.children.forEach(child => traverse(child));
  };
  traverse(node);
  return nodes;
};

const getHexagonPoints = (cx: number, cy: number, r: number): string => {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(' ');
};

const NodeDetailPanel = ({
  node,
  onClose,
  onRevoke,
  isRevoking,
  isOrigin,
}: {
  node: TreeNode | null;
  onClose: () => void;
  onRevoke: () => void;
  isRevoking: boolean;
  isOrigin: boolean;
}) => {
  if (!node) return null;
  const activeChildren = node.children.filter(c => c.status === 'active').length;
  const totalSlots = node.children.length;
  const vacantSlots = node.children.filter(c => c.status === 'unclaimed').length;

  return (
    <motion.div
      className="absolute top-4 right-4 w-64 bg-navy-900/95 backdrop-blur-xl border border-gold-500/20 rounded-lg p-4 shadow-2xl"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gold-500/40 hover:text-gold-400 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
      <p className="font-serif text-xs tracking-[0.2em] text-gold-400 uppercase mb-3">
        {node.label}
      </p>
      <div className="space-y-2 mb-4">
        <DetailRow label="Status" value={node.status.toUpperCase()} isAlert={node.status === 'revoked'} />
        <DetailRow label="Depth" value={`Level ${node.depth}`} />
        <DetailRow label="Delegates" value={`${activeChildren}/${totalSlots}`} />
        {vacantSlots > 0 && <DetailRow label="Vacant Slots" value={String(vacantSlots)} />}
      </div>
      {!isOrigin && node.status === 'active' && (
        <button
          onClick={onRevoke}
          disabled={isRevoking}
          className="w-full px-3 py-2 border border-red-500/30 text-red-400 font-mono text-[10px] tracking-wider uppercase hover:bg-red-500/10 transition-all duration-300 disabled:opacity-30"
        >
          {isRevoking ? 'Severing...' : 'Sever Chain'}
        </button>
      )}
      {isOrigin && (
        <p className="font-mono text-[8px] text-gold-500/30 text-center">
          Origin cannot be severed
        </p>
      )}
    </motion.div>
  );
};

const DetailRow = ({ label, value, isAlert = false }: { label: string; value: string; isAlert?: boolean }) => (
  <div className="flex justify-between items-center">
    <span className="font-mono text-[8px] tracking-wider text-gold-500/40 uppercase">{label}</span>
    <span className={`font-mono text-[10px] tracking-wider ${isAlert ? 'text-red-400' : 'text-gold-400'}`}>
      {value}
    </span>
  </div>
);

const LegendItem = ({ color, label }: { color: 'gold' | 'red' | 'gray'; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${
      color === 'gold' ? 'bg-gold-500' :
      color === 'red' ? 'bg-red-500' :
      'bg-gold-500/20'
    }`} />
    <span className="font-mono text-[8px] tracking-wider text-gold-500/40">{label}</span>
  </div>
);

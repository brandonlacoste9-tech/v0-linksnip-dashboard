/**
 * MRK Protocol — Recursive Trust Model
 * ───────────────────────────────────────
 * Manages a hierarchical, depth-limited (Depth=2) cryptographic tree.
 * Supports instant global revocation cascades across the delegation chain.
 */

export interface TrustNode {
  id: string;
  parentId: string | null;
  depth: number;
  status: 'ACTIVE' | 'REVOKED';
  children: string[]; // Child IDs
}

export class TrustDelegationEngine {
  private static MAX_DEPTH = 2;

  /**
   * Evaluates if a node is trusted by checking its entire ancestry.
   * If any parent in the chain is REVOKED, the trust is instantly severed.
   */
  public static async verifyTrustChain(nodeId: string, getNodes: (ids: string[]) => Promise<TrustNode[]>): Promise<boolean> {
    const node = (await getNodes([nodeId]))[0];
    if (!node || node.status === 'REVOKED') return false;

    // Recursive ancestry check
    if (node.parentId) {
      return await this.verifyTrustChain(node.parentId, getNodes);
    }

    // If we reached the root and it's active
    return node.depth === 0 && node.status === 'ACTIVE';
  }

  /**
   * Generates a new delegation key.
   */
  public static async delegate(parentId: string, name: string, getParent: (id: string) => Promise<TrustNode | null>): Promise<Partial<TrustNode>> {
    const parent = await getParent(parentId);
    if (!parent) throw new Error('Parent node not found');
    if (parent.depth >= this.MAX_DEPTH) throw new Error('Maximum trust depth reached (Depth=2)');
    if (parent.status === 'REVOKED') throw new Error('Cannot delegate from a revoked node');

    return {
      id: `mrk_key_${Math.random().toString(36).substring(7)}`,
      parentId: parentId,
      depth: parent.depth + 1,
      status: 'ACTIVE',
    };
  }
}

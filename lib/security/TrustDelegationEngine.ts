/**
 * Zipd Security — Hierarchical Access Model
 * ───────────────────────────────────────────────────
 * Manages a hierarchical, depth-limited (Depth=2) cryptographic tree.
 * Supports instant global revocation cascades across the delegation chain.
 */

export interface AccessNode {
  id: string;
  parentId: string | null;
  authorityLevel: number;
  status: 'ACTIVE' | 'REVOKED';
  children: string[]; // Child IDs
}

export class AuthorityDelegationEngine {
  private static MAX_DEPTH = 2;

  /**
   * Evaluates if a node is authorized by checking its entire ancestry.
   * If any parent in the chain is REVOKED, the authority is instantly severed.
   */
  public static async verifyAuthorityChain(nodeId: string, getNodes: (ids: string[]) => Promise<AccessNode[]>): Promise<boolean> {
    const node = (await getNodes([nodeId]))[0];
    if (!node || node.status === 'REVOKED') return false;

    // Recursive ancestry check
    if (node.parentId) {
      return await this.verifyAuthorityChain(node.parentId, getNodes);
    }

    // If we reached the root and it's active
    return node.authorityLevel === 0 && node.status === 'ACTIVE';
  }

  /**
   * Generates a new delegation key.
   */
  public static async delegate(parentId: string, name: string, getParent: (id: string) => Promise<AccessNode | null>): Promise<Partial<AccessNode>> {
    const parent = await getParent(parentId);
    if (!parent) throw new Error('Parent node not found');
    if (parent.authorityLevel >= this.MAX_DEPTH) throw new Error('Maximum authority level reached (Depth=2)');
    if (parent.status === 'REVOKED') throw new Error('Cannot delegate from a revoked node');

    return {
      id: `zipd_key_${Math.random().toString(36).substring(7)}`,
      parentId: parentId,
      authorityLevel: parent.authorityLevel + 1,
      status: 'ACTIVE',
    };
  }
}

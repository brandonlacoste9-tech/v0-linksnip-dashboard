import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  userId: text("user_id"), // Nullable for now to support existing links
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  clicks: integer("clicks").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export const clicks = pgTable("clicks", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").notNull().references(() => links.id, { onDelete: 'cascade' }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  visitorHash: text("visitor_hash"),
  country: text("country"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
}, (table) => ({
  linkIdIdx: index("link_id_idx").on(table.linkId),
  timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

export const bridgeTokens = pgTable("bridge_tokens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  token: text("token").notNull().unique(),
  userId: text("user_id"),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const linksRelations = relations(links, ({ many }) => ({
  clicks: many(clicks),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(links, {
    fields: [clicks.linkId],
    references: [links.id],
  }),
}));

export const authorizedUsers = pgTable("authorized_users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email"),
  role: text("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  clerkIdIdx: index("clerk_id_idx").on(table.clerkId),
}));

export const trustAnchors = pgTable("trust_anchors", {
  id: text("id").primaryKey(), // The identity hash
  publicKeyCredentialId: text("public_key_credential_id").notNull(),
  enrollmentTimestamp: timestamp("enrollment_timestamp").defaultNow().notNull(),
  trustDepth: integer("trust_depth").notNull(),
  parentProvenanceHash: text("parent_provenance_hash"),
  maxDelegations: integer("max_delegations").notNull(),
  isRevoked: integer("is_revoked").default(0).notNull(), 
});

export const delegationInvites = pgTable("delegation_invites", {
  inviteCode: text("invite_code").primaryKey(),
  emittedBy: text("emitted_by").notNull(), // references trustAnchors.id
  trustDepth: integer("trust_depth").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  maxUses: integer("max_uses").notNull(),
  usesRemaining: integer("uses_remaining").notNull(),
  status: text("status").notNull(), // 'active', 'claimed', 'expired', 'revoked'
});

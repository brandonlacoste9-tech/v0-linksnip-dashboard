import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  userId: text("user_id"), // Nullable for now to support existing links
  visitorId: text("visitor_id"), // Track anonymous visitors for limits
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

export const securityIdentities = pgTable("security_identities", {
  id: text("id").primaryKey(), // The identity hash
  credentialId: text("credential_id").notNull(),
  enrollmentTimestamp: timestamp("enrollment_timestamp").defaultNow().notNull(),
  authorityLevel: integer("authority_level").notNull(),
  parentIdentityHash: text("parent_identity_hash"),
  maxDelegations: integer("max_delegations").notNull(),
  isRevoked: integer("is_revoked").default(0).notNull(), 
});

export const accessInvites = pgTable("access_invites", {
  inviteCode: text("invite_code").primaryKey(),
  issuedBy: text("issued_by").notNull(), // references securityIdentities.id
  authorityLevel: integer("authority_level").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  maxUses: integer("max_uses").notNull(),
  usesRemaining: integer("uses_remaining").notNull(),
  status: text("status").notNull(), // 'active', 'claimed', 'expired', 'revoked'
});

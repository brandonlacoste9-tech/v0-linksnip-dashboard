CREATE TABLE "authorized_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "authorized_users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "bridge_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"token" text NOT NULL,
	"user_id" text,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bridge_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"visitor_hash" text,
	"country" text,
	"user_agent" text,
	"referrer" text
);
--> statement-breakpoint
CREATE TABLE "delegation_invites" (
	"invite_code" text PRIMARY KEY NOT NULL,
	"emitted_by" text NOT NULL,
	"trust_depth" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"max_uses" integer NOT NULL,
	"uses_remaining" integer NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"original_url" text NOT NULL,
	"short_code" text NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "links_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "trust_anchors" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key_credential_id" text NOT NULL,
	"enrollment_timestamp" timestamp DEFAULT now() NOT NULL,
	"trust_depth" integer NOT NULL,
	"parent_provenance_hash" text,
	"max_delegations" integer NOT NULL,
	"is_revoked" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clerk_id_idx" ON "authorized_users" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "link_id_idx" ON "clicks" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX "timestamp_idx" ON "clicks" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "links" USING btree ("user_id");
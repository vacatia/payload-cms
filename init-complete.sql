-- Complete Payload CMS v3.60 Schema for PostgreSQL
-- Auto-generated schema based on create-payload-app template

-- Payload system tables
CREATE TABLE IF NOT EXISTS "payload_migrations" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR,
  "batch" INTEGER,
  "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_preferences" (
  "id" SERIAL PRIMARY KEY,
  "key" VARCHAR,
  "value" JSONB,
  "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  "id" SERIAL PRIMARY KEY,
  "order" INTEGER,
  "parent_id" INTEGER NOT NULL,
  "path" VARCHAR NOT NULL,
  "users_id" INTEGER,
  CONSTRAINT "fk_payload_preferences_rels_parent" FOREIGN KEY ("parent_id") REFERENCES "payload_preferences"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  "id" SERIAL PRIMARY KEY,
  "global_slug" VARCHAR,
  "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  "id" SERIAL PRIMARY KEY,
  "order" INTEGER,
  "parent_id" INTEGER NOT NULL,
  "path" VARCHAR NOT NULL,
  "users_id" INTEGER,
  CONSTRAINT "fk_locked_docs_rels_parent" FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id") ON DELETE CASCADE
);

-- Users collection (with auth)
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR,
  "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "email" VARCHAR NOT NULL,
  "reset_password_token" VARCHAR,
  "reset_password_expiration" TIMESTAMP(3) WITH TIME ZONE,
  "salt" VARCHAR,
  "hash" VARCHAR,
  "login_attempts" NUMERIC DEFAULT 0,
  "lock_until" TIMESTAMP(3) WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "users_sessions" (
  "id" SERIAL PRIMARY KEY,
  "_order" INTEGER NOT NULL,
  "_parent_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE,
  "expires_at" TIMESTAMP(3) WITH TIME ZONE,
  CONSTRAINT "fk_users_sessions_parent" FOREIGN KEY ("_parent_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_sessions_parent_idx" ON "users_sessions" ("_parent_id");

-- Destinations collection
CREATE TABLE IF NOT EXISTS "destinations" (
  "id" SERIAL PRIMARY KEY,
  "legacy_id" NUMERIC,
  "name" VARCHAR NOT NULL,
  "slug" VARCHAR NOT NULL UNIQUE,
  "description" JSONB,
  "latitude" NUMERIC,
  "longitude" NUMERIC,
  "radius_miles" NUMERIC,
  "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "destinations_slug_idx" ON "destinations" ("slug");

-- Amenities collection
CREATE TABLE IF NOT EXISTS "amenities" (
  "id" SERIAL PRIMARY KEY,
  "legacy_id" NUMERIC,
  "name" VARCHAR NOT NULL UNIQUE,
  "slug" VARCHAR NOT NULL UNIQUE,
  "category" VARCHAR,
  "featured" BOOLEAN DEFAULT false,
  "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "amenities_slug_idx" ON "amenities" ("slug");

-- Properties collection
CREATE TABLE IF NOT EXISTS "properties" (
  "id" SERIAL PRIMARY KEY,
  "legacy_id" NUMERIC UNIQUE,
  "name" VARCHAR NOT NULL,
  "slug" VARCHAR NOT NULL UNIQUE,
  "tagline" VARCHAR,
  "description" JSONB,
  "location_address" VARCHAR,
  "location_city" VARCHAR,
  "location_state" VARCHAR,
  "location_postal_code" VARCHAR,
  "location_latitude" NUMERIC,
  "location_longitude" NUMERIC,
  "star_rating" NUMERIC,
  "rental_enabled" BOOLEAN DEFAULT true,
  "rental_lowest_price" NUMERIC,
  "rental_check_in_time" VARCHAR,
  "rental_check_out_time" VARCHAR,
  "rental_pets_allowed" BOOLEAN DEFAULT false,
  "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "properties_rels" (
  "id" SERIAL PRIMARY KEY,
  "order" INTEGER,
  "parent_id" INTEGER NOT NULL,
  "path" VARCHAR NOT NULL,
  "destinations_id" INTEGER,
  "amenities_id" INTEGER,
  CONSTRAINT "fk_properties_rels_parent" FOREIGN KEY ("parent_id") REFERENCES "properties"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_properties_rels_destinations" FOREIGN KEY ("destinations_id") REFERENCES "destinations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_properties_rels_amenities" FOREIGN KEY ("amenities_id") REFERENCES "amenities"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "properties_slug_idx" ON "properties" ("slug");
CREATE INDEX IF NOT EXISTS "properties_rels_parent_idx" ON "properties_rels" ("parent_id");

-- Residences collection
CREATE TABLE IF NOT EXISTS "residences" (
  "id" SERIAL PRIMARY KEY,
  "legacy_id" NUMERIC UNIQUE,
  "name" VARCHAR NOT NULL,
  "slug" VARCHAR,
  "description" JSONB,
  "bedrooms" NUMERIC,
  "bathrooms" NUMERIC,
  "max_occupancy" NUMERIC,
  "square_footage" VARCHAR,
  "kitchen_type" VARCHAR,
  "for_rental" BOOLEAN DEFAULT true,
  "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "residences_rels" (
  "id" SERIAL PRIMARY KEY,
  "order" INTEGER,
  "parent_id" INTEGER NOT NULL,
  "path" VARCHAR NOT NULL,
  "properties_id" INTEGER,
  "amenities_id" INTEGER,
  CONSTRAINT "fk_residences_rels_parent" FOREIGN KEY ("parent_id") REFERENCES "residences"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_residences_rels_properties" FOREIGN KEY ("properties_id") REFERENCES "properties"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_residences_rels_amenities" FOREIGN KEY ("amenities_id") REFERENCES "amenities"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "residences_rels_parent_idx" ON "residences_rels" ("parent_id");

-- Media collection
CREATE TABLE IF NOT EXISTS "media" (
  "id" SERIAL PRIMARY KEY,
  "legacy_id" NUMERIC,
  "alt" VARCHAR,
  "caption" VARCHAR,
  "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "url" VARCHAR,
  "thumbnail_u_r_l" VARCHAR,
  "filename" VARCHAR,
  "mime_type" VARCHAR,
  "filesize" NUMERIC,
  "width" NUMERIC,
  "height" NUMERIC,
  "focal_x" NUMERIC,
  "focal_y" NUMERIC
);

-- Insert dev migration
INSERT INTO "payload_migrations" ("name", "batch", "updated_at", "created_at")
VALUES ('dev', -1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

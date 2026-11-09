-- ==============================================================================
-- LAPTOPHUB DATABASE BACKUP BEFORE DEMO DATA SEEDING
-- Created at: 2026-11-10T01:45:30.236646800
-- Host: aws-0-ap-northeast-1.pooler.supabase.com
-- ==============================================================================

-- Table: users
INSERT INTO "users" ("id", "full_name", "email", "password_hash", "phone", "address", "role", "status", "created_at", "updated_at") VALUES (1, 'Phan Huu Kien', 'phankienk51@gmail.com', '$2a$10$2b6zwFXijBtjIQK0yvo6luhi.6r8S4Vl9xzpGPP0lIuxs/nfcdAhy', '0886840889', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-09 18:10:53.275811', NULL) ON CONFLICT DO NOTHING;

-- Table: refresh_tokens
INSERT INTO "refresh_tokens" ("id", "token_hash", "user_id", "created_at", "expires_at", "revoked_at") VALUES (1, '5f976f9dadb7b9082850ddbb6828dd8a54835952cf475fa995748749016eae0c', 1, '2026-11-10 01:11:01.774115', '2026-11-17 01:11:01.774118', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "refresh_tokens" ("id", "token_hash", "user_id", "created_at", "expires_at", "revoked_at") VALUES (2, '6884a1178109e8f7164fe66349757a83accd951423c423dafdab2f226275c99d', 1, '2026-11-10 01:17:33.479985', '2026-11-17 01:17:33.479986', NULL) ON CONFLICT DO NOTHING;

-- Table: brands

-- Table: categories

-- Table: laptops

-- Table: cart_items

-- Table: wishlist_items

-- Table: orders

-- Table: order_items


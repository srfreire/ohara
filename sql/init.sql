-- Tipo ENUM para visibility en colecciones
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility') THEN
    CREATE TYPE visibility AS ENUM ('private', 'unlisted', 'public');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reaction_type') THEN
    CREATE TYPE reaction_type AS ENUM ('like', 'love', 'insight', 'question', 'flag');
  END IF;
END $$;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  name           TEXT,
  avatar_url     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de Colecciones
CREATE TABLE IF NOT EXISTS collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  visibility  visibility NOT NULL DEFAULT 'private',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de Documentos de Colección (relaciona documentos con colecciones)
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_doc_id TEXT NOT NULL,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_doc_id, collection_id)
);

-- Tabla de Comentarios
CREATE TABLE IF NOT EXISTS comments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
  source_doc_id          TEXT NOT NULL,  -- Documento que se está comentando
  collection_document_id UUID REFERENCES collection_documents(id) ON DELETE CASCADE, -- Relación opcional con colecciones
  content                TEXT NOT NULL,
  start_offset           INT4 NOT NULL DEFAULT 0,
  end_offset             INT4 NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de Reacciones a Comentarios
CREATE TABLE IF NOT EXISTS reactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id   UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id, reaction_type)
);

-- Tabla de Tokens de Autenticación (OAuth)
CREATE TABLE IF NOT EXISTS user_auth_tokens (
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source         TEXT NOT NULL,             -- 'google', 'spotify', etc.
  source_user_id TEXT NOT NULL,
  access_token   TEXT,
  refresh_token  TEXT,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, source),
  UNIQUE (source, source_user_id)
);

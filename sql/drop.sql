-- Desactivar constraints y triggers temporales
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TRIGGER IF EXISTS trg_folders_updated_at ON folders;
DROP TRIGGER IF EXISTS trg_collections_updated_at ON collections;
DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;

-- Función auxiliar
DROP FUNCTION IF EXISTS set_updated_at();

-- Tablas (en orden inverso a las dependencias)
DROP TABLE IF EXISTS user_auth_tokens CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- Tipos ENUM
DROP TYPE IF EXISTS reaction_type CASCADE;
DROP TYPE IF EXISTS visibility CASCADE;

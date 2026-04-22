-- ADD_IS_EVENT.sql
-- Ejecuta este script en el SQL Editor de tu cuenta de Supabase.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT FALSE;

-- SOLUCIÓN DEFINITIVA PARA PERMISOS (Copia y pega todo esto en SQL Editor)

-- 1. Asegurar que la tabla de perfiles sea accesible para el dueño
DROP POLICY IF EXISTS "El usuario puede crear su propio perfil." ON profiles;
DROP POLICY IF EXISTS "El usuario puede editar su propio perfil." ON profiles;
DROP POLICY IF EXISTS "Los perfiles son públicos." ON profiles;

CREATE POLICY "Perfil - Todos pueden ver" ON profiles FOR SELECT USING (true);
CREATE POLICY "Perfil - Usuario controla todo su perfil" ON profiles FOR ALL USING (auth.uid() = id);

-- 2. Configurar permisos de STORAGE (Carpeta de fotos)
-- IMPORTANTE: Asegúrate de que el bucket se llame 'avatars'
-- Estas líneas aseguran que cualquier usuario logueado pueda subir y ver fotos.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Avatar - Ver todos" ON storage.objects;
DROP POLICY IF EXISTS "Avatar - Subir dueño" ON storage.objects;
DROP POLICY IF EXISTS "Avatar - Editar dueño" ON storage.objects;

CREATE POLICY "Avatar - Ver todos" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar - Subir dueño" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Avatar - Editar dueño" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Avatar - Borrar dueño" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

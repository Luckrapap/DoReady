-- ACTUALIZACIÓN DE CHECKDAY: MÚLTIPLES CAPAS (RENDIMIENTO Y ÁNIMO)
-- Copia y pega esto en el SQL Editor de Supabase y dale a 'Run'

-- 1. Añadir columna de capa si no existe
ALTER TABLE check_days ADD COLUMN IF NOT EXISTS layer_type TEXT DEFAULT 'performance';

-- 2. Eliminar restricción de valores anteriores (si existe) para permitir estados de ánimo
-- Nota: Buscamos el nombre de la restricción que suele ser check_days_status_check
DO $$ 
BEGIN 
    ALTER TABLE check_days DROP CONSTRAINT IF EXISTS check_days_status_check;
EXCEPTION 
    WHEN undefined_object THEN null; 
END $$;

-- 3. Actualizar la restricción única para permitir una entrada por día POR CAPA
-- Primero eliminamos la antigua (generalmente check_days_user_id_date_key)
ALTER TABLE check_days DROP CONSTRAINT IF EXISTS check_days_user_id_date_key;

-- Añadimos la nueva restricción compuesta
ALTER TABLE check_days ADD CONSTRAINT check_days_user_id_date_layer_type_key UNIQUE (user_id, date, layer_type);

-- 4. Asegurar que RLS siga funcionando correctamente
-- (Ya debería estar activo, pero reforzamos que el usuario solo maneje lo suyo)
DROP POLICY IF EXISTS "Users can manage their own check days" ON check_days;
CREATE POLICY "Users can manage their own check days"
  ON check_days FOR ALL
  USING (auth.uid() = user_id);

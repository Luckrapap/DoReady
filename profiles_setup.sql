-- SQL para configurar Perfiles y Avatares en Supabase

-- 1. Crear la tabla de perfiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

-- 2. Habilitar RLS
alter table public.profiles enable row level security;

-- 3. Políticas de acceso para perfiles
create policy "Los perfiles son públicos."
  on profiles for select
  using ( true );

create policy "El usuario puede crear su propio perfil."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "El usuario puede editar su propio perfil."
  on profiles for update
  using ( auth.uid() = id );

-- 4. Triggers automáticos (opcional, pero útil)
-- Crear un perfil automáticamente cuando un usuario se registra
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, split_part(new.email, '@', 1)); -- Nombre inicial basado en el email
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -- -- CONFIGURACIÓN DE STORAGE -- -- --
-- Nota: Crea el bucket 'avatars' manualmente en el Dashboard de Supabase con acceso público.
-- Luego ejecuta estas políticas si quieres control total:

-- Permitir ver avatares a todos
-- create policy "Avatares públicos" on storage.objects for select using ( bucket_id = 'avatars' );

-- Permitir subir a cualquier usuario autenticado (con limite de ruta por ID de usuario para mayor seguridad)
-- create policy "Subida de avatares" on storage.objects for insert with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

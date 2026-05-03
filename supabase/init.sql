-- ============================================
-- Supabase Schema for Spot Mobile App
-- ============================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Set timezone to Indonesia (WIB = UTC+7)
set timezone to 'Asia/Jakarta';

-- ============================================
-- Helper Function for auto-updating updated_at
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now() at time zone 'Asia/Jakarta';
  return new;
end;
$$ language plpgsql;

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default (now() at time zone 'Asia/Jakarta'),
  updated_at timestamptz default (now() at time zone 'Asia/Jakarta')
);

-- Trigger untuk auto-update updated_at pada profiles
create trigger profiles_updated_at_trigger
before update on profiles
for each row
execute function update_updated_at_column();

-- Enable RLS on profiles
alter table profiles enable row level security;

-- RLS Policy: Users can view and update their own profile
create policy "profile_read" on profiles for select using (
  auth.uid() = id
);

create policy "profile_update" on profiles for update using (
  auth.uid() = id
) with check (
  auth.uid() = id
);

create policy "profile_insert" on profiles for insert with check (
  auth.uid() = id
);

-- ============================================
-- 2. DEVICES TABLE
-- ============================================
create table devices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  identifier text,
  is_active boolean default true,
  last_seen timestamptz,
  created_at timestamptz default (now() at time zone 'Asia/Jakarta'),
  updated_at timestamptz default (now() at time zone 'Asia/Jakarta')
);

-- Trigger untuk auto-update updated_at pada devices
create trigger devices_updated_at_trigger
before update on devices
for each row
execute function update_updated_at_column();

create unique index devices_identifier_key on devices(identifier);

-- Create index for owner queries
create index devices_owner_id_idx on devices(owner_id);

-- Enable RLS on devices
alter table devices enable row level security;

-- RLS Policy: Users can only see their own devices
create policy "device_read" on devices for select using (
  auth.uid() = owner_id
);

-- Users can insert devices (owner_id must be their own ID)
create policy "device_insert" on devices for insert with check (
  auth.uid() = owner_id
);

-- Users can update their own devices
create policy "device_update" on devices for update using (
  auth.uid() = owner_id
) with check (
  auth.uid() = owner_id
);

-- Users can delete their own devices
create policy "device_delete" on devices for delete using (
  auth.uid() = owner_id
);

-- ============================================
-- 3. CONNECTIONS TABLE
-- ============================================
create table connections (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references devices(id) on delete cascade,
  ssid text not null,
  password text,
  created_at timestamptz default (now() at time zone 'Asia/Jakarta'),
  updated_at timestamptz default (now() at time zone 'Asia/Jakarta')
);

-- Trigger untuk auto-update updated_at pada connections
create trigger connections_updated_at_trigger
before update on connections
for each row
execute function update_updated_at_column();

-- Create index for device queries
create index connections_device_id_idx on connections(device_id);

-- Enable RLS on connections
alter table connections enable row level security;

-- RLS Policy: Users can access connections only for devices they own
create policy "connection_read" on connections for select using (
  exists (
    select 1 from devices d where d.id = connections.device_id and d.owner_id = auth.uid()
  )
);

create policy "connection_insert" on connections for insert with check (
  exists (
    select 1 from devices d where d.id = connections.device_id and d.owner_id = auth.uid()
  )
);

create policy "connection_update" on connections for update using (
  exists (
    select 1 from devices d where d.id = connections.device_id and d.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from devices d where d.id = connections.device_id and d.owner_id = auth.uid()
  )
);

create policy "connection_delete" on connections for delete using (
  exists (
    select 1 from devices d where d.id = connections.device_id and d.owner_id = auth.uid()
  )
);

-- ============================================
-- 4. DEVICE_LOCATIONS TABLE
-- ============================================
create table device_locations (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references devices(id) on delete cascade,
  lat numeric not null,
  lng numeric not null,
  heading numeric,
  recorded_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- Create index for efficient queries (device + timestamp)
create index device_locations_device_recorded_idx on device_locations(device_id, recorded_at desc);
create index device_locations_recorded_idx on device_locations(recorded_at desc);

-- Enable RLS on device_locations
alter table device_locations enable row level security;

-- RLS Policy: Users can read locations of their own devices
create policy "location_read" on device_locations for select using (
  exists (
    select 1 from devices d where d.id = device_locations.device_id and d.owner_id = auth.uid()
  )
);

-- RLS Policy: Authenticated users can insert (will validate device ownership via trigger or app logic)
create policy "location_insert" on device_locations for insert with check (
  exists (
    select 1 from devices d where d.id = device_locations.device_id and d.owner_id = auth.uid()
  )
);

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references devices(id) on delete cascade,
  title text not null,
  body text,
  data jsonb,
  is_read boolean default false,
  created_at timestamptz default (now() at time zone 'Asia/Jakarta')
);

-- Create index for user queries
create index notifications_user_id_idx on notifications(user_id);
create index notifications_user_created_idx on notifications(user_id, created_at desc);

-- Enable RLS on notifications
alter table notifications enable row level security;

-- RLS Policy: Users can only read their own notifications
create policy "notification_read" on notifications for select using (
  auth.uid() = user_id
);

-- Users can update their own notifications (mark as read)
create policy "notification_update" on notifications for update using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
);

-- Users can delete their own notifications
create policy "notification_delete" on notifications for delete using (
  auth.uid() = user_id
);

-- ============================================
-- 6. STORAGE: AVATARS BUCKET
-- ============================================
-- Create avatars bucket (run this in Supabase Dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- RLS Policy: Users can upload avatars only to their own folder
create policy "avatar_upload" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can update their own avatars
create policy "avatar_update" on storage.objects for update with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can delete their own avatars
create policy "avatar_delete" on storage.objects for delete using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Public read access to avatars
create policy "avatar_read" on storage.objects for select using (
  bucket_id = 'avatars'
);

-- ============================================
-- Notes:
-- ============================================
-- 1. Run this script in Supabase SQL Editor (Database -> SQL)
-- 2. All RLS policies are enabled for security
-- 3. auth.users: email + password (managed by Supabase Auth, auto-created saat sign up)
-- 4. profiles.email: disimpan juga untuk referensi cepat di app
-- 5. profiles.full_name: dari SignUp input "Full Name"
-- 6. profiles.full_name: dari EditProfileScreen "profileName" (Pengaturan Akun)
-- 7. devices.identifier: field untuk ID/serial perangkat SPOT (dari AddDeviceScreen)
-- 8. connections: ssid & password WiFi (dari AddDevice/EditConnection screens)
-- 9. device_locations.heading dipertahankan untuk arah gerak perangkat
-- 10. No device_users table (single-user per device)
-- 11. ALL TIMESTAMPS: Menggunakan Asia/Jakarta (WIB = UTC+7)
-- 12. created_at: Otomatis set saat record dibuat, tidak berubah
-- 13. updated_at: Otomatis di-update saat record dimodifikasi via TRIGGER
-- 14. Trigger 'update_updated_at_column()': Memastikan updated_at selalu berbeda dari created_at setelah perubahan
-- 15. Tables dengan updated_at: profiles, devices, connections
-- 16. profiles.avatar_url: URL untuk profile picture, disimpan saat user upload via ProfileScreen
-- 17. Storage 'avatars' bucket: Public, menyimpan gambar dalam folder per user_id (avatars/{user_id}/*)
-- 18. Untuk membuat bucket 'avatars', jalankan: INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

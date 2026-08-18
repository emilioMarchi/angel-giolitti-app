-- UNIFICA las políticas "Admin total" al email admin@admin.com
-- (la cuenta real que existe en Supabase Auth).
-- Ejecutar en Supabase → SQL Editor.

DROP POLICY IF EXISTS "Admin total artist_profile" ON artist_profile;
CREATE POLICY "Admin total artist_profile" ON artist_profile FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total artist_documents" ON artist_documents;
CREATE POLICY "Admin total artist_documents" ON artist_documents FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total albums" ON albums;
CREATE POLICY "Admin total albums" ON albums FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total tracks" ON tracks;
CREATE POLICY "Admin total tracks" ON tracks FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total projects" ON projects;
CREATE POLICY "Admin total projects" ON projects FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total media_albums" ON media_albums;
CREATE POLICY "Admin total media_albums" ON media_albums FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total media_items" ON media_items;
CREATE POLICY "Admin total media_items" ON media_items FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total events" ON events;
CREATE POLICY "Admin total events" ON events FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total playlists" ON playlists;
CREATE POLICY "Admin total playlists" ON playlists FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total playlist_tracks" ON playlist_tracks;
CREATE POLICY "Admin total playlist_tracks" ON playlist_tracks FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

DROP POLICY IF EXISTS "Admin total page_views" ON page_views;
CREATE POLICY "Admin total page_views" ON page_views FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@admin.com') WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');
-- Invite codes for registration gate
CREATE TABLE IF NOT EXISTS invite_codes (
  code        text PRIMARY KEY,
  used        boolean NOT NULL DEFAULT false,
  used_by     uuid REFERENCES auth.users(id),
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Plants: require authentication (drop public read)
DROP POLICY IF EXISTS "plants are publicly readable" ON plants;
REVOKE SELECT ON plants FROM anon;

CREATE POLICY "authenticated users can read plants"
  ON plants FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated users can insert plants"
  ON plants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated users can update plants"
  ON plants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated users can delete plants"
  ON plants FOR DELETE TO authenticated USING (true);

-- Storage bucket for new plant photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-photos', 'plant-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "auth users can upload plant photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'plant-photos');

CREATE POLICY "auth users can update plant photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'plant-photos');

CREATE POLICY "plant photos are public"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'plant-photos');

CREATE POLICY "auth users can delete plant photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'plant-photos');

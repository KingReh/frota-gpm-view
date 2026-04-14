CREATE TABLE public.vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate text NOT NULL,
  fleet_type text,
  model text,
  os_number integer,
  requested_date date NOT NULL,
  gad_service_date date,
  workshop_entry_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access for vehicle_maintenance"
  ON public.vehicle_maintenance FOR ALL
  TO public
  USING (true) WITH CHECK (true);
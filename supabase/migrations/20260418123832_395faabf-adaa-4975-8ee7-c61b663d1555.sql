ALTER TABLE public.vehicle_maintenance
ADD CONSTRAINT vehicle_maintenance_plate_unique UNIQUE (plate);
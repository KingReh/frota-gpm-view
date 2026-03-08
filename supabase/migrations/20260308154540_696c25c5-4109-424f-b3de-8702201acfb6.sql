-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create trigger on vehicle_data to fire after any update (statement-level to avoid multiple calls per batch)
CREATE TRIGGER on_vehicle_data_updated
  AFTER UPDATE ON public.vehicle_data
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.notify_fuel_balance_update();
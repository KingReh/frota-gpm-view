export interface Coordination {
  id: string;
  name: string;
  color: string;
  font_color: string;
  order_index: number;
}

export interface VehicleData {
  plate: string;
  model: string | null;
  fleet_type: string | null;
  balance: string | null;
  manufacturer: string | null;
  fleet_number: string | null;
  location: string | null;
  responsible_name: string | null;
  card_number: string | null;
  cost_center: string | null;
  current_limit: string | null;
  next_period_limit: string | null;
  used_value: string | null;
  reserved_value: string | null;
  limit_value: string | null;
}

export interface Vehicle {
  id: string;
  plate: string;
  coordination_id: string | null;
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
}

export interface VehicleWithDetails extends VehicleData {
  coordination: Coordination | null;
  image_url: string | null;
  vehicle_id: string | null;
}

export type ViewMode = 'table' | 'card' | 'carousel';

export type FleetTab = 'fleet' | 'undefined';

export interface UserPreferences {
  viewMode: ViewMode;
  selectedCoordinations: string[];
  activeTab: FleetTab;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  viewMode: 'card',
  selectedCoordinations: [],
  activeTab: 'fleet',
};

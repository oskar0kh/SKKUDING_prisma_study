export interface Restaurant {
  name: string;
  address: string;
  phone: string;
  rating?: number | null;
}

export interface RestaurantList {
  restaurants: Restaurant[];
}
export interface Restaurant {
  name: string;
  address: string;
  phone: string;
  rating?: number;
}

export interface RestaurantList {
  restaurants: Restaurant[];
}
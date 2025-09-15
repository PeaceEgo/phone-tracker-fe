import * as L from "leaflet";

declare module "leaflet" {
  interface MarkerOptions {
    isCustomMarker?: boolean;
  }
  interface PolylineOptions {
    isTrail?: boolean;
  }
}
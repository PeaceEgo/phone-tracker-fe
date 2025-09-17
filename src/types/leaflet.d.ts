import * as L from "leaflet";

declare module "leaflet" {
  interface MarkerOptions {
    isCustomMarker?: boolean;
  }
  interface PolylineOptions {
    isTrail?: boolean;
  }
}
export type LeafletNamespace = typeof L;
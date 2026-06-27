export type Helicopter = {
  id: string;
  tailNumber: string;
  callsign?: string;
  position: { lat: number; lng: number };
  lastTrip: {
    origin: string;
    destination: string;
    duration: string;
    date: string;
    status: string;
  };
};

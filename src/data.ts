import { Helicopter } from './types';

export const HELICOPTERS: Helicopter[] = [
  {
    id: "h1",
    tailNumber: "N407SM",
    callsign: "LIFEFLIGHT",
    position: { lat: 34.5173, lng: -82.6465 }, // Anderson, SC (800 N Fant St)
    lastTrip: {
      origin: "AnMed Health Medical Center",
      destination: "Oconee Memorial Hospital",
      duration: "25m",
      date: "2026-06-27 10:15 AM",
      status: "Offline",
    },
  },
  {
    id: "h2",
    tailNumber: "N407CR",
    callsign: "MEDTRANS",
    position: { lat: 34.9496, lng: -81.9321 }, // Spartanburg, SC
    lastTrip: {
      origin: "Spartanburg Medical Center",
      destination: "Cherokee Medical Center",
      duration: "18m",
      date: "2026-06-27 08:30 AM",
      status: "Offline",
    },
  },
  {
    id: "h3",
    tailNumber: "N222SH",
    callsign: "LIFENET-7",
    position: { lat: 34.5034, lng: -82.6501 }, // Anderson, SC
    lastTrip: {
      origin: "AnMed Health Medical Center",
      destination: "Greenville Downtown Airport",
      duration: "22m",
      date: "2026-06-26 04:45 PM",
      status: "Offline",
    },
  },
  {
    id: "h4",
    tailNumber: "N135NK",
    callsign: "LIFENET-10",
    position: { lat: 34.8153, lng: -82.3023 }, // Greenville, SC (Donaldson)
    lastTrip: {
      origin: "Greenville Memorial Hospital",
      destination: "Laurens County Hospital",
      duration: "31m",
      date: "2026-06-27 11:00 AM",
      status: "Offline",
    },
  }
];

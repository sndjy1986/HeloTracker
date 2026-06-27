import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/flights", async (req, res) => {
    try {
      // Fetch flights in a 250NM radius around central SC
      const url = `https://api.airplanes.live/v2/point/34.0/-81.0/250`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Airplanes.live API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform Airplanes.live format to OpenSky states array format for the frontend compatibility
      // We don't want to rewrite the frontend parsing if we don't have to.
      // Or we can just return the airplanes.live data and change the frontend.
      // Let's change the format to match what the frontend expects: 
      // data = { states: [ [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, ...] ] }
      
      if (data && data.ac) {
        // Filter for rotorcraft
        const rotorcraft = data.ac.filter((ac: any) => 
          ac.category === 'A7' || 
          ac.t === 'H' || 
          (ac.t && typeof ac.t === 'string' && ac.t.toUpperCase().startsWith('R44')) ||
          (ac.t && typeof ac.t === 'string' && ac.t.toUpperCase().startsWith('R22')) ||
          (ac.desc && ac.desc.toUpperCase().includes('ROTORCRAFT')) ||
          (ac.desc && ac.desc.toUpperCase().includes('HELICOPTER'))
        );

        const mappedStates = rotorcraft.map((ac: any) => {
          return [
            ac.hex || '', // 0
            ac.flight ? ac.flight.trim() : ac.r || '', // 1: callsign (airplanes.live puts tail in r if blocked, flight is callsign)
            '', // 2: origin country
            Date.now() / 1000, // 3: time position
            Date.now() / 1000, // 4: last contact
            ac.lon, // 5: longitude
            ac.lat, // 6: latitude
            ac.alt_baro, // 7: baro_altitude
            ac.alt_baro === 'ground', // 8: on_ground
            ac.gs, // 9: velocity (knots to m/s, wait, frontend assumes m/s? Actually airplanes.live is knots, let's keep it as is, we'll fix frontend)
            ac.track, // 10: true_track
            ac.baro_rate, // 11: vertical_rate
          ];
        });
        res.json({ states: mappedStates });
      } else {
        res.json({ states: [] });
      }
    } catch (error: any) {
      console.error("General API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { HELICOPTERS } from './data';
import { HelicopterMarker } from './components/HelicopterMarker';
import { Settings, Map as MapIcon } from 'lucide-react';
import { Helicopter } from './types';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function App() {
  const [helicopters, setHelicopters] = useState<Helicopter[]>(HELICOPTERS);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const [selectedHelicopters, setSelectedHelicopters] = useState<Set<string>>(
    new Set(HELICOPTERS.map(h => h.id))
  );

  useEffect(() => {
    let mounted = true;
    
    const fetchADSB = async () => {
      try {
        const res = await fetch('/api/flights');
        if (!res.ok) throw new Error('Failed to fetch flights');
        const data = await res.json();
        
        if (data && data.states && mounted) {
          setLastRefresh(new Date());
          
          setHelicopters(prev => prev.map(h => {
            // states array format: [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, ...]
            const state = data.states.find((s: any[]) => {
               const callsign = s[1]?.trim() || '';
               // Check if callsign matches tail number or actual callsign
               return callsign === h.tailNumber || (h.callsign && callsign.startsWith(h.callsign));
            });
            
            if (state && state[6] != null && state[5] != null) {
              return {
                ...h,
                position: { lat: state[6], lng: state[5] },
                lastTrip: {
                  ...h.lastTrip,
                  status: state[8] ? 'On Ground' : `Airborne (${Math.round(state[9] || 0)} kts)`,
                }
              };
            }
            return h;
          }));
        }
      } catch (err) {
        console.error('ADSB fetch error:', err);
      }
    };
    
    fetchADSB();
    const interval = setInterval(fetchADSB, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleHelicopter = (id: string) => {
    setSelectedHelicopters(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedHelicopters.size === helicopters.length) {
      setSelectedHelicopters(new Set());
    } else {
      setSelectedHelicopters(new Set(helicopters.map(h => h.id)));
    }
  };

  if (!hasValidKey) {
    return (
      <div className="flex flex-col h-screen bg-[#020617] text-slate-200 font-sans p-4 items-center justify-center">
        <div className="text-left max-w-lg bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-800">
          <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/50 text-sky-400 rounded-xl flex items-center justify-center mb-6">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Google Maps API Key Required</h2>
          <div className="space-y-4 text-slate-400 text-sm">
            <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-sky-400 hover:underline">Get an API Key</a></p>
            <p><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
            <ul className="list-disc pl-5 space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
              <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
              <li>Select <strong>Secrets</strong></li>
              <li>Type <code className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded border border-slate-700">GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
              <li>Paste your API key as the value, press <strong>Enter</strong></li>
            </ul>
            <p className="text-xs mt-4 text-slate-500 uppercase tracking-widest font-mono">The app rebuilds automatically after you add the secret.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">AeroTrack Pro</h1>
            <p className="text-[10px] text-sky-400 font-mono uppercase tracking-widest">Fleet Management Console</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[11px] font-medium text-slate-400">System Active: {selectedHelicopters.size}/{helicopters.length} Displayed</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar: Fleet Selection */}
        <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 z-10">
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <input type="text" placeholder="Search Tail Number..." className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 text-slate-200" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Aircraft</h2>
              <button 
                onClick={toggleAll}
                className="text-[10px] font-bold text-sky-500 hover:text-sky-400 uppercase tracking-widest cursor-pointer transition-colors"
              >
              {selectedHelicopters.size === helicopters.length ? 'Clear All' : 'Select All'}
              </button>
            </div>
            
            {helicopters.map((h) => (
              <button
                key={h.id}
                onClick={() => toggleHelicopter(h.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center justify-between cursor-pointer group
                  ${selectedHelicopters.has(h.id) 
                    ? 'bg-sky-500/10 border-sky-500/50' 
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors
                    ${selectedHelicopters.has(h.id) ? 'border-sky-400 bg-sky-500/20' : 'border-slate-600 bg-slate-800 group-hover:border-slate-500'}
                  `}>
                    {selectedHelicopters.has(h.id) && <div className="w-2 h-2 bg-sky-400 rounded-sm"></div>}
                  </div>
                  <div>
                    <div className={`text-sm font-bold tracking-wide ${selectedHelicopters.has(h.id) ? 'text-white' : 'text-slate-300'}`}>{h.tailNumber}</div>
                    <div className={`text-[10px] uppercase ${selectedHelicopters.has(h.id) ? 'text-sky-400' : 'text-slate-500'}`}>{h.callsign ? `${h.callsign} · ` : ''}{h.lastTrip.duration} &middot; {h.lastTrip.status}</div>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${selectedHelicopters.has(h.id) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
              </button>
            ))}
          </div>
        </aside>

        {/* Map Area */}
        <section className="flex-1 relative bg-slate-900">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={{ lat: 34.8526, lng: -82.3940 }}
              defaultZoom={8}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              disableDefaultUI={true}
              zoomControl={true}
            >
              {helicopters.filter(h => selectedHelicopters.has(h.id) && h.lastTrip.status !== 'Offline').map(h => (
                <HelicopterMarker key={h.id} helicopter={h} />
              ))}
            </Map>
          </APIProvider>
        </section>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-10 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex gap-4">
          <div className="text-[10px] text-slate-500">MAP API: <span className="text-emerald-500">CONNECTED</span></div>
          <div className="text-[10px] text-slate-500">DATA STREAM: <span className="text-emerald-500">ACTIVE</span></div>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          LAST DATA REFRESH: {lastRefresh.toISOString().split('T')[1].split('.')[0]} UTC
        </div>
      </footer>
    </div>
  );
}

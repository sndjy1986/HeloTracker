import { useState } from 'react';
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Helicopter } from '../types';
import { Clock, Navigation, MapPin } from 'lucide-react';

interface HelicopterMarkerProps {
  helicopter: Helicopter;
  key?: string;
}

export function HelicopterMarker({ helicopter }: HelicopterMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker ref={markerRef} position={helicopter.position} onClick={() => setOpen(!open)} title={helicopter.tailNumber}>
        <div className="relative group cursor-pointer z-0">
          {open && <div className="absolute -inset-2 bg-sky-500/30 rounded-full animate-pulse"></div>}
          <div className={`w-8 h-8 rounded-lg rotate-45 border-2 border-white flex items-center justify-center transition-all ${open ? 'bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)] z-10' : 'bg-slate-800 shadow-md hover:bg-slate-700'}`}>
             <div className="-rotate-45 text-[9px] font-bold text-white">
                {helicopter.tailNumber.slice(-3)}
             </div>
          </div>
        </div>
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="p-3 bg-slate-900 text-slate-200 rounded-lg -m-3 mt-0 min-w-[240px] font-sans">
            <h3 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">{helicopter.callsign || 'Aircraft Intel'}</h3>
            <h2 className="text-xl font-bold text-white tracking-tight mb-4">{helicopter.tailNumber}</h2>
            
            <div className="space-y-4">
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase mb-1">Departure</p>
                    <p className="text-xs font-bold text-slate-200">{helicopter.lastTrip.origin}</p>
                  </div>
                  <Navigation className="w-3 h-3 text-slate-600 rotate-90 mx-2 mt-1 shrink-0" />
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase mb-1">Arrival</p>
                    <p className="text-xs font-bold text-slate-200">{helicopter.lastTrip.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Duration
                    </p>
                    <p className="text-sm font-mono font-bold text-sky-400">{helicopter.lastTrip.duration}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase mb-1 flex items-center gap-1">
                       <MapPin className="w-3 h-3" /> Status
                    </p>
                    <p className="text-sm font-mono font-bold text-emerald-400 uppercase">{helicopter.lastTrip.status}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[9px] text-slate-500 text-right mt-3 font-mono">
              LOG: {helicopter.lastTrip.date}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

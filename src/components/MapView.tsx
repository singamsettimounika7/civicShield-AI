import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { HazardReport } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, Navigation, Eye, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  reports: HazardReport[];
  selectedReport?: HazardReport | null;
  onSelectReport?: (report: HazardReport) => void;
  interactiveSelectLocation?: boolean;
  onLocationSelect?: (lat: number, lon: number) => void;
  initialCenter?: [number, number];
  zoom?: number;
  height?: string;
}

export const MapView: React.FC<Props> = ({
  reports,
  selectedReport,
  onSelectReport,
  interactiveSelectLocation = false,
  onLocationSelect,
  initialCenter = [37.7760, -122.4180],
  zoom = 13,
  height = '600px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [tileError, setTileError] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark style OpenStreetMap-compatible CartoDB Dark Matter tiles (modern civic aesthetic)
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      });

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      tileLayer.addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright' })
        .addAttribution('&copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>')
        .addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle interactive location picker
      if (interactiveSelectLocation) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setSelectedCoord([lat, lng]);
          if (onLocationSelect) onLocationSelect(lat, lng);
        });
      }
    } catch (e) {
      console.warn('Map initialization issue', e);
      setTileError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Reports & Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // Color map by category
    const categoryColors: Record<string, string> = {
      'Electrical Hazard': '#EF4444', // Red
      'Waterlogging': '#0284C7',     // Sky Blue
      'Open Drain / Manhole': '#F97316', // Orange
      'Road Damage / Pothole': '#EAB308', // Amber
      'Fallen Tree': '#10B981',       // Emerald
      'Broken Streetlight': '#8B5CF6',// Purple
      'Waste Accumulation': '#64748B',// Slate
      'Blocked Footpath': '#EC4899',  // Pink
    };

    reports.forEach((rep) => {
      if (!rep.latitude || !rep.longitude) return;

      const isCritical = rep.severity === 'Critical';
      const color = categoryColors[rep.category] || '#14B8A6';

      const customIcon = L.divIcon({
        className: 'custom-hazard-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isCritical ? '<div class="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping"></div>' : ''}
            <div style="background-color: ${color};" class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold transform hover:scale-125 transition-transform">
              !
            </div>
            <div class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([rep.latitude, rep.longitude], { icon: customIcon });

      marker.on('click', () => {
        if (onSelectReport) onSelectReport(rep);
      });

      marker.bindPopup(`
        <div style="min-width: 220px; font-family: sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-family: monospace; color: #2DD4BF; font-weight: bold;">${rep.report_code}</span>
            <span style="font-size: 10px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${rep.status}</span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; margin: 0 0 4px 0; color: #FFFFFF;">${rep.title}</h4>
          <p style="font-size: 11px; color: #CBD5E1; margin: 0 0 8px 0; line-clamp: 2;">${rep.general_location}</p>
          <div style="font-size: 10px; color: #94A3B8; margin-bottom: 8px;">
            Priority: <strong>${rep.severity}</strong> (Risk: ${rep.ai_risk_score}/100)
          </div>
          <a href="/reports/${rep.id}" style="display: block; text-align: center; background: #0D9488; color: #060B18; font-weight: bold; font-size: 11px; padding: 6px 10px; border-radius: 6px; text-decoration: none;">
            View Report Details &rarr;
          </a>
        </div>
      `);

      markersGroup.addLayer(marker);
    });

    // In interactive mode, render selected coordinate marker
    if (interactiveSelectLocation && selectedCoord) {
      const pinIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-teal-400/40 animate-ping absolute"></div>
            <div class="w-7 h-7 rounded-full bg-teal-400 border-2 border-white shadow-xl flex items-center justify-center text-navy-950 font-bold text-xs">
              📍
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const pinMarker = L.marker(selectedCoord, { icon: pinIcon });
      markersGroup.addLayer(pinMarker);
    }
  }, [reports, selectedCoord, interactiveSelectLocation]);

  // Center map on selected report
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedReport?.latitude || !selectedReport?.longitude) return;
    mapInstanceRef.current.flyTo(
      [selectedReport.latitude, selectedReport.longitude],
      15,
      { duration: 1.2 }
    );
  }, [selectedReport]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-glass">
      
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Demo Location Watermark / Indicator */}
      <div className="absolute top-3 right-3 z-10 bg-navy-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-slate-300 font-medium">Urban Metro District</span>
        <span className="text-[10px] text-teal-400 font-mono uppercase bg-teal-500/20 px-1 rounded">Demo Data</span>
      </div>

      {/* Fallback Notice if map tiles fail to load */}
      {tileError && (
        <div className="absolute inset-0 bg-navy-950/95 flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <h4 className="text-base font-bold text-white">Interactive Map Tiles Offline</h4>
          <p className="text-xs text-slate-300 max-w-md">
            External map tile provider is currently unreachable. The system is operating in graceful list view mode.
          </p>
        </div>
      )}

      {/* Interactive Picker Instructions */}
      {interactiveSelectLocation && (
        <div className="absolute bottom-3 left-3 z-10 bg-navy-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-teal-500/30 text-xs text-slate-200 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-civic-teal-cyan" />
          <span>Click anywhere on the map to pin the hazard location</span>
        </div>
      )}

    </div>
  );
};

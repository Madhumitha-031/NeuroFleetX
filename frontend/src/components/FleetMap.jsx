import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const FleetSettings = ({ center }) => {
    const map = useMap();
    if (center) {
        map.setView(center);
    }
    return null;
};

const MapEvents = ({ onClick }) => {
    useMapEvents({
        click(e) {
            if (onClick) onClick(e.latlng);
        },
    });
    return null;
};

const FleetMap = ({ vehicles, center, onMapClick, pinnedLocation }) => {
    const mapCenter = center || [12.9716, 77.5946];

    const getMarkerIcon = (status) => {
        const color = status === 'IDLE' ? '#10b981' : status === 'IN_USE' ? '#0ea5e9' : '#f59e0b';
        return L.divIcon({
            html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px ${color}"></div>`,
            className: 'custom-marker',
            iconSize: [12, 12]
        });
    };

    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-border/50 shadow-2xl relative">
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FleetSettings center={center ? mapCenter : null} />
                <MapEvents onClick={onMapClick} />

                {pinnedLocation && (
                    <Marker
                        position={[pinnedLocation.lat, pinnedLocation.lng]}
                        icon={L.divIcon({
                            html: `<div style="color: #ef4444; filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.5))"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
                            className: 'pinned-marker',
                            iconSize: [24, 24],
                            iconAnchor: [12, 24]
                        })}
                    />
                )}

                {vehicles.map(vehicle => (
                    <React.Fragment key={vehicle.id}>
                        <Marker
                            position={[vehicle.latitude, vehicle.longitude]}
                            icon={getMarkerIcon(vehicle.status)}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2">
                                    <h4 className="font-black text-sm mb-1">{vehicle.model}</h4>
                                    <div className="text-[10px] uppercase font-bold text-muted mb-2">{vehicle.status}</div>
                                    <div className="flex flex-col gap-1 text-[10px]">
                                        <div className="flex justify-between">
                                            <span>Battery:</span>
                                            <span className="font-black text-primary">{Math.round(vehicle.batteryLevel)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Speed:</span>
                                            <span className="font-black text-primary">{Math.round(vehicle.speed)} km/h</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Driving Range Visualization (Radius based on battery/fuel) */}
                        <Circle
                            center={[vehicle.latitude, vehicle.longitude]}
                            radius={2000 * (vehicle.batteryLevel / 100)} // 2km radius if battery is 100%
                            pathOptions={{
                                color: vehicle.status === 'IDLE' ? '#10b981' : '#0ea5e9',
                                fillColor: vehicle.status === 'IDLE' ? '#10b981' : '#0ea5e9',
                                fillOpacity: 0.1,
                                weight: 1
                            }}
                        />
                    </React.Fragment>
                ))}
            </MapContainer>

            {/* Map Overlay for Statistics */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-border/50 flex flex-col gap-2 min-w-[200px]">
                <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-border pb-2">Fleet Deployment Status</div>
                <div className="flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Standby Units</span>
                    <span>{vehicles.filter(v => v.status === 'IDLE').length}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> Active Deployments</span>
                    <span>{vehicles.filter(v => v.status === 'IN_USE').length}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> In Maintenance</span>
                    <span>{vehicles.filter(v => v.status === 'MAINTENANCE').length}</span>
                </div>
            </div>
        </div>
    );
};

export default FleetMap;

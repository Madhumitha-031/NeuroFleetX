import React from 'react';
import { Battery, Fuel, MapPin, Activity, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

const VehicleCard = ({ vehicle }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'IDLE': return 'bg-green-500/20 text-green-500';
            case 'IN_USE': return 'bg-primary/20 text-primary';
            case 'MAINTENANCE': return 'bg-amber-500/20 text-amber-500';
            default: return 'bg-slate-500/20 text-slate-500';
        }
    };

    const getLevelColor = (level) => {
        if (level > 60) return 'bg-green-500';
        if (level > 20) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card glass-card p-5 flex flex-col gap-4 border-t-4"
            style={{ borderTopColor: vehicle.status === 'IDLE' ? '#10b981' : vehicle.status === 'IN_USE' ? '#0ea5e9' : '#f59e0b' }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-black text-lg">{vehicle.model}</h4>
                    <p className="text-[10px] text-muted font-mono uppercase tracking-widest">VIN: {vehicle.vin}</p>
                </div>
                <span className={`status-badge ${getStatusColor(vehicle.status)} text-[9px]`}>
                    {vehicle.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-muted font-bold">
                        <Battery size={14} className={getLevelColor(vehicle.batteryLevel).replace('bg-', 'text-')} />
                        Energy
                    </div>
                    <div className="w-full h-1.5 bg-slate-500/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getLevelColor(vehicle.batteryLevel)}`}
                            style={{ width: `${vehicle.batteryLevel}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black text-right">{Math.round(vehicle.batteryLevel)}%</span>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-muted font-bold">
                        <Fuel size={14} className={getLevelColor(vehicle.fuelLevel).replace('bg-', 'text-')} />
                        Fuel
                    </div>
                    <div className="w-full h-1.5 bg-slate-500/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getLevelColor(vehicle.fuelLevel)}`}
                            style={{ width: `${vehicle.fuelLevel}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black text-right">{Math.round(vehicle.fuelLevel)}%</span>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-border/30 pt-4 mt-auto">
                <div className="flex items-center gap-2 font-bold text-muted">
                    <MapPin size={14} className="text-primary" />
                    <span>{vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-primary">
                    <Gauge size={14} />
                    <span>{Math.round(vehicle.speed)} km/h</span>
                </div>
            </div>

            {vehicle.driver && (
                <div className="mt-2 p-2 bg-slate-500/5 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                        {vehicle.driver.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black">{vehicle.driver.fullName}</span>
                        <span className="text-[8px] text-muted uppercase">On Deployment</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default VehicleCard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Map as MapIcon, CheckCircle } from 'lucide-react';
import FleetMap from '../components/FleetMap';
import VehicleCard from '../components/VehicleCard';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';

const DriverDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [email] = useState(localStorage.getItem('userEmail') || '');

    const [availability, setAvailability] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [myVehicle, setMyVehicle] = useState(null);
    const [pinnedLocation, setPinnedLocation] = useState(null);

    const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '', vehicleModel: '', vehicleType: 'ECONOMY' });

    const fetchData = async () => {
        if (!email) return;
        const token = localStorage.getItem('token');
        try {
            const slotsRes = await axios.get(`http://localhost:9090/api/agent/availability?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailability(slotsRes.data);

            const apptRes = await axios.get(`http://localhost:9090/api/agent/appointments/agent?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(apptRes.data);

            const vRes = await axios.get(`http://localhost:9090/api/vehicles/driver/${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const vData = vRes.data;
            setMyVehicle(vData);
            if (vData && !pinnedLocation) {
                setPinnedLocation({ lat: vData.latitude, lng: vData.longitude });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [email]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:9090/api/agent/availability', { ...formData, email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Logistics slot opened!");
            setFormData({ date: '', startTime: '', endTime: '', vehicleModel: '', vehicleType: 'ECONOMY' });
            fetchData();
        } catch (err) {
            toast.error("Error adding slot: " + (err.response?.data || err.message));
            fetchData();
        }
    };

    const handleUpdateStatus = async (apptId, status) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:9090/api/agent/appointments/${apptId}/status?status=${status}&agentEmail=${email}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Deployment ${status.toLowerCase()}ed.`);
            fetchData();
        } catch (err) {
            toast.error("Failed to update status.");
        }
    };

    const handleUpdateLocation = async (lat, lng) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:9090/api/vehicles/location?email=${email}&lat=${lat}&lng=${lng}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Operational coordinates updated!");
            fetchData();
        } catch (err) {
            toast.error("Location link failed.");
        }
    };

    const bookedCount = availability.filter(s => s.status === 'BOOKED').length;
    const availableCount = availability.filter(s => s.status === 'AVAILABLE').length;

    const chartData = [
        { name: 'Active', count: bookedCount, color: '#10b981' },
        { name: 'On Standby', count: availableCount, color: '#0ea5e9' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="card shadowed">
                            <h3 className="mb-4">Deployment Load</h3>
                            <div style={{ height: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} style={{ fontSize: '0.8rem', fontWeight: 600 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="card shadowed">
                            <h3 className="mb-4">Open Logistics Slot</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                                <div className="flex gap-4">
                                    <input type="time" name="startTime" className="form-input" value={formData.startTime} onChange={handleChange} required />
                                    <input type="time" name="endTime" className="form-input" value={formData.endTime} onChange={handleChange} required />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Vehicle Model</label>
                                        <input type="text" name="vehicleModel" className="form-input" placeholder="e.g. Tesla Model 3" value={formData.vehicleModel} onChange={handleChange} required />
                                    </div>
                                    <div className="flex-1">
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Fleet Type</label>
                                        <select name="vehicleType" className="form-input" value={formData.vehicleType} onChange={handleChange} required>
                                            <option value="ECONOMY">Economy</option>
                                            <option value="SEDAN">Sedan</option>
                                            <option value="SUV">SUV</option>
                                            <option value="HEAVY">Heavy / Logistics</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="btn btn-primary" type="submit">Declare Availability</button>
                            </form>
                        </div>
                    </div>
                );
            case 'schedule':
                return (
                    <div className="card shadowed">
                        <h3 className="mb-6">Fleet Schedule</h3>
                        <div className="flex flex-col gap-4">
                            {appointments.length > 0 ? appointments.map(appt => (
                                <div key={appt.id} className="p-4 rounded-lg border border-slate-200 flex justify-between items-center bg-white">
                                    <div>
                                        <div className="font-bold">{appt.client.fullName || 'Customer Unit'} ({appt.client.email})</div>
                                        <div className="text-sm text-gray-500">{appt.availability.date} @ {appt.availability.startTime}</div>
                                    </div>
                                    {appt.status === 'PENDING' ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Deploy</button>
                                            <button onClick={() => handleUpdateStatus(appt.id, 'REJECTED')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Decline</button>
                                        </div>
                                    ) : (
                                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--primary-color)' }}>{appt.status}</span>
                                    )}
                                </div>
                            )) : (
                                <p className="text-center text-muted py-8">No active deployments scheduled.</p>
                            )}
                        </div>
                    </div>
                );
            case 'fleet':
                return (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="flex items-center gap-2 font-black"><MapIcon className="text-primary" /> My assigned fleet unit</h3>
                                <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Live Telemetry & Manual Override</p>
                            </div>
                            {pinnedLocation && (
                                <button
                                    onClick={() => handleUpdateLocation(pinnedLocation.lat, pinnedLocation.lng)}
                                    className="btn btn-primary flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
                                >
                                    <CheckCircle size={14} /> Confirm Pinned Location
                                </button>
                            )}
                        </div>

                        {myVehicle ? (
                            <>
                                <div className="text-[10px] font-black uppercase text-muted mb-2 tracking-widest bg-slate-100 p-2 rounded w-fit">
                                    Click on map below to pin your current base location
                                </div>
                                <FleetMap
                                    vehicles={[myVehicle]}
                                    center={pinnedLocation ? [pinnedLocation.lat, pinnedLocation.lng] : [myVehicle.latitude, myVehicle.longitude]}
                                    onMapClick={(latlng) => setPinnedLocation(latlng)}
                                    pinnedLocation={pinnedLocation}
                                />
                                <div className="max-w-md mt-6">
                                    <VehicleCard vehicle={myVehicle} />
                                </div>
                            </>
                        ) : (
                            <div className="card glass-card p-12 text-center">
                                <p className="text-muted font-bold uppercase tracking-widest text-sm">No vehicle assigned to your unit yet.</p>
                            </div>
                        )}
                    </div>
                );
            default: return <div className="card shadowed">Module coming soon...</div>;
        }
    };

    return (
        <DashboardLayout role="DRIVER" userEmail={email} activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default DriverDashboard;

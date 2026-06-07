import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Gauge, Battery, Fuel, Activity, Clock, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import FleetMap from '../components/FleetMap';
import VehicleCard from '../components/VehicleCard';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';

const CustomerDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const userEmail = localStorage.getItem('userEmail');

    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [driverSlots, setDriverSlots] = useState([]);
    const [myDeployments, setMyDeployments] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [activeVehicles, setActiveVehicles] = useState([]); // Vehicles for confirmed appts

    const [bookingSlot, setBookingSlot] = useState(null);
    const [bookingReason, setBookingReason] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [destination, setDestination] = useState({ lat: 12.9716, lng: 77.5946 });

    const fetchData = async () => {
        if (!userEmail) return;
        const token = localStorage.getItem('token');
        try {
            const driversRes = await axios.get('http://localhost:9090/api/auth/admin/drivers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDrivers(driversRes.data);

            const deployRes = await axios.get(`http://localhost:9090/api/agent/appointments/client?email=${userEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const deps = deployRes.data;
            setMyDeployments(deps);

            // Fetch vehicles for confirmed deployments
            const confirmedDeps = deps.filter(d => d.status === 'CONFIRMED');
            const vData = await Promise.all(confirmedDeps.map(async (d) => {
                try {
                    const vRes = await axios.get(`http://localhost:9090/api/vehicles/driver/${d.availability.agent.email}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    return vRes.data;
                } catch (e) { return null; }
            }));
            setActiveVehicles(vData.filter(v => v !== null));

            const docRes = await axios.get(`http://localhost:9090/api/documents/user/${userEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(docRes.data);
        } catch (err) {
            toast.error("Deployment Manifest Synchronization Failed");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userEmail]);

    const handleDriverSelect = async (driver) => {
        setSelectedDriver(driver);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`http://localhost:9090/api/agent/availability?email=${driver.email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDriverSlots(res.data);
        } catch (err) {
            toast.error("Could not load fleet availability.");
        }
    };

    const initiateDeployment = (slot) => {
        setBookingSlot(slot);
        setBookingReason('');
    };

    const confirmDeployment = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:9090/api/agent/book/${bookingSlot.id}`, {
                email: userEmail,
                reason: bookingReason,
                destinationLat: destination.lat,
                destinationLng: destination.lng
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Logistics Request Manifested!");
            setBookingSlot(null);
            fetchData();
            handleDriverSelect(selectedDriver);
        } catch (err) {
            toast.error("Request Failed: " + (err.response?.data || err.message));
        }
    };

    const LocationPicker = () => {
        useMapEvents({
            click(e) {
                setDestination(e.latlng);
            },
        });
        return destination ? <Marker position={destination} /> : null;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="flex flex-col gap-8">
                        <div className="card glass-card bg-gradient-premium flex justify-between items-center" style={{ color: 'white' }}>
                            <div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Fleet Command</h2>
                                <p style={{ opacity: 0.9 }}>You have <strong>{myDeployments.filter(b => b.status === 'CONFIRMED').length}</strong> active deployment cycles.</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('appointments')}
                                className="btn bg-white/20 hover:bg-white/30 text-white px-6 py-3 flex items-center gap-2 font-black uppercase tracking-widest text-xs backdrop-blur-md"
                            >
                                <MapPin size={16} /> Track My Unit
                            </button>
                        </div>

                        <div className="card shadowed">
                            <h3 className="mb-4">Request Deployment</h3>
                            <p className="mb-4 text-sm text-muted">Select a Driver Unit to manifest available slots.</p>
                            <div className="grid-responsive mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                {drivers.map(driver => (
                                    <div
                                        key={driver.id}
                                        onClick={() => handleDriverSelect(driver)}
                                        style={{
                                            padding: '1.25rem',
                                            borderRadius: '12px',
                                            border: selectedDriver?.id === driver.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                            background: selectedDriver?.id === driver.id ? 'var(--surface-hover)' : 'var(--surface-color)',
                                            cursor: 'pointer',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontWeight: '700' }}>{driver.fullName || 'Driver Unit'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{driver.specialization || 'Logistics'}</div>
                                    </div>
                                ))}
                            </div>

                            <AnimatePresence>
                                {selectedDriver && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <h4 className="mb-4">Available Logistics Windows</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {driverSlots.filter(s => s.status === 'AVAILABLE').length > 0 ? (
                                                driverSlots.filter(s => s.status === 'AVAILABLE').map(slot => (
                                                    <button key={slot.id} onClick={() => initiateDeployment(slot)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                                        {slot.date} | {slot.startTime} <span style={{ opacity: 0.7, marginLeft: '0.5rem' }}>({slot.vehicleModel} - {slot.vehicleType})</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted">No availability declared for this driver.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                );
            case 'appointments':
                return (
                    <div className="flex flex-col gap-6">
                        {activeVehicles.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card glass-card">
                                <h3 className="mb-4 flex items-center gap-2 font-black"><Activity className="text-primary" /> Live Unit Tracking</h3>
                                <FleetMap vehicles={activeVehicles} />
                            </motion.div>
                        )}

                        <div className="card glass-card">
                            <h3 className="mb-6 flex items-center gap-2 font-black"><Clock className="text-slate-500" /> Deployment History</h3>
                            <div className="flex flex-col gap-4">
                                {myDeployments.length > 0 ? myDeployments.map(appt => (
                                    <div key={appt.id} className="p-5 border border-border rounded-2xl flex justify-between items-center bg-slate-500/5 hover:bg-slate-500/10 transition-all">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-black text-lg">{appt.availability.date} <span className="text-primary ml-2 uppercase text-xs tracking-widest">{appt.availability.startTime}</span></div>
                                            <div className="text-xs text-muted font-bold uppercase tracking-tight">Operator: {appt.availability.agent.fullName || appt.availability.agent.email}</div>
                                            <div className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded w-fit mt-1">
                                                Fleet: {appt.availability.vehicleModel}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`status-badge ${appt.status === 'CONFIRMED' ? 'status-active' : appt.status === 'PENDING' ? 'status-pending' : 'status-rejected'}`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-muted py-12 uppercase tracking-widest text-sm font-bold">No deployment history found</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'documents':
            case 'profile':
                return <div className="card shadowed">Security protocols active... Module coming soon.</div>;
            default: return null;
        }
    };

    return (
        <DashboardLayout role="CUSTOMER" userEmail={userEmail} activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
            <AnimatePresence>
                {bookingSlot && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                        <div className="card" style={{ width: '440px', padding: '2.5rem' }}>
                            <h3 className="mb-2">Manifest Logistics</h3>
                            <p className="text-sm text-muted mb-6">Declare requirements and designate delivery zone.</p>

                            <div className="h-[240px] w-full rounded-xl overflow-hidden border border-border mb-4">
                                <FleetMap
                                    vehicles={[]}
                                    center={[destination.lat, destination.lng]}
                                    onMapClick={(latlng) => setDestination(latlng)}
                                    pinnedLocation={destination}
                                />
                            </div>
                            <div className="flex gap-2 mb-4 text-[10px] font-mono text-muted uppercase">
                                <span className="p-1 px-2 bg-slate-100 rounded">Lat: {destination.lat.toFixed(4)}</span>
                                <span className="p-1 px-2 bg-slate-100 rounded">Lng: {destination.lng.toFixed(4)}</span>
                            </div>

                            <textarea className="form-input mb-4" rows="3" placeholder="Specific fleet requirements or cargo details..." value={bookingReason} onChange={(e) => setBookingReason(e.target.value)} />
                            <div className="flex gap-4">
                                <button className="btn btn-secondary flex-1" onClick={() => setBookingSlot(null)}>Abort</button>
                                <button className="btn btn-primary flex-1" onClick={confirmDeployment}>Manifest</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default CustomerDashboard;

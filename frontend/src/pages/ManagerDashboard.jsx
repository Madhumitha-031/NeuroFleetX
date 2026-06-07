import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CheckCircle, LayoutDashboard, ClipboardList, UserCheck, Search, ShieldAlert, Map as MapIcon, Plus, Info } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import FleetMap from '../components/FleetMap';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [drivers, setDrivers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [stats, setStats] = useState({ drivers: 0, customers: 0, pendingAppts: 0, activeVehicles: 0 });
    const userEmail = localStorage.getItem('userEmail');

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const driversRes = await axios.get('http://localhost:9090/api/auth/admin/drivers', { headers });
            setDrivers(driversRes.data);

            const customersRes = await axios.get('http://localhost:9090/api/auth/admin/customers', { headers });
            setCustomers(customersRes.data);

            const apptsRes = await axios.get('http://localhost:9090/api/auth/admin/appointments', { headers });
            setAppointments(apptsRes.data);

            const pendingUsersRes = await axios.get('http://localhost:9090/api/auth/admin/pending-approval', { headers });
            setPendingUsers(pendingUsersRes.data);

            const vehiclesRes = await axios.get('http://localhost:9090/api/vehicles', { headers });
            setVehicles(vehiclesRes.data);

            setStats({
                drivers: driversRes.data.length,
                customers: customersRes.data.length,
                pendingAppts: apptsRes.data.filter(a => a.status === 'PENDING').length,
                activeVehicles: vehiclesRes.data.filter(v => v.status === 'IN_USE').length
            });
        } catch (err) {
            toast.error("Fleet Data Synchronization Failed: Check Backend Connection");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Auto refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const handleApproveUser = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:9090/api/auth/approve-user/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Operational Unit Activated");
            fetchData();
        } catch (err) {
            toast.error("Activation Protocols Failed");
        }
    };

    const handleUpdateApptStatus = async (id, status) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:9090/api/auth/admin/appointments/${id}/status?status=${status}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Logistics status updated to ${status}`);
            fetchData();
        } catch (err) {
            toast.error("Status Override Failed");
        }
    };

    const handleReassign = async (id, newDriverEmail) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:9090/api/auth/admin/appointments/${id}/reassign?newAgentEmail=${newDriverEmail}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Logistics Unit Reassigned Successfully");
            fetchData();
        } catch (err) {
            toast.error("Reassignment Failed: Check driver availability");
        }
    };

    const renderContent = () => {
        const containerVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        };

        switch (activeTab) {
            case 'dashboard':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card glass-card flex flex-col justify-center" style={{ borderLeft: '4px solid #10b981', padding: '1.5rem 2rem' }}>
                            <div className="flex items-center gap-3 mb-1">
                                <Users className="text-green-500" size={18} />
                                <span className="text-muted text-[10px] font-bold uppercase tracking-widest">Active Drivers</span>
                            </div>
                            <div className="text-4xl font-black">{stats.drivers}</div>
                        </div>
                        <div className="card glass-card flex flex-col justify-center" style={{ borderLeft: '4px solid #0ea5e9', padding: '1.5rem 2rem' }}>
                            <div className="flex items-center gap-3 mb-1">
                                <UserCheck className="text-primary" size={18} />
                                <span className="text-muted text-[10px] font-bold uppercase tracking-widest">Registered Customers</span>
                            </div>
                            <div className="text-4xl font-black">{stats.customers}</div>
                        </div>
                        <div className="card glass-card flex flex-col justify-center" style={{ borderLeft: '4px solid #f59e0b', padding: '1.5rem 2rem' }}>
                            <div className="flex items-center gap-3 mb-1">
                                <ShieldAlert className="text-amber-500" size={18} />
                                <span className="text-muted text-[10px] font-bold uppercase tracking-widest">Pending Logistics</span>
                            </div>
                            <div className="text-4xl font-black text-amber-500">{stats.pendingAppts}</div>
                        </div>

                        <div className="md:col-span-3 card glass-card mt-4 flex justify-between items-center">
                            <div>
                                <h3 className="mb-4 flex items-center gap-2"><LayoutDashboard size={20} /> Operational Overview</h3>
                                <p className="text-muted text-sm">Welcome to the Regional Logistics Command. From here, you can oversee deployments, manage active units, and override scheduling conflicts.</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('fleet')}
                                className="btn btn-primary px-6 py-3 flex items-center gap-2 font-black uppercase tracking-widest text-xs"
                            >
                                <MapIcon size={16} /> Open Fleet Map
                            </button>
                        </div>
                    </motion.div>
                );

            case 'requests':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="card glass-card overflow-hidden">
                        <h3 className="mb-6 flex items-center gap-2"><ClipboardList /> Logistics Requests Manifest</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr className="text-muted text-xs uppercase tracking-widest">
                                        <th className="px-4 pb-2">Unit ID</th>
                                        <th className="px-4 pb-2">Schedule</th>
                                        <th className="px-4 pb-2">Client / Operator</th>
                                        <th className="px-4 pb-2">Status</th>
                                        <th className="px-4 pb-2 text-right">Intervention</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map(appt => (
                                        <tr key={appt.id} className="bg-slate-50/10 hover:bg-slate-50/20 transition-all rounded-lg">
                                            <td className="px-4 py-4 font-mono text-sm">#{appt.id}</td>
                                            <td className="px-4 py-4">
                                                <div className="font-bold">{appt.availability.date}</div>
                                                <div className="text-xs text-muted">{appt.availability.startTime} - {appt.availability.endTime}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-bold">{appt.client.fullName || appt.client.email}</div>
                                                <div className="text-xs text-primary">{appt.availability.agent.fullName || appt.availability.agent.email}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`status-badge ${appt.status === 'CONFIRMED' ? 'status-active' : appt.status === 'PENDING' ? 'status-pending' : 'status-rejected'}`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    {appt.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => handleUpdateApptStatus(appt.id, 'CONFIRMED')} className="btn btn-primary px-3 py-1 text-xs">Authorize</button>
                                                            <button onClick={() => handleUpdateApptStatus(appt.id, 'REJECTED')} className="btn btn-secondary px-3 py-1 text-xs">Veto</button>
                                                        </>
                                                    )}
                                                    <select
                                                        className="form-input text-xs px-2 py-1 w-32"
                                                        value={appt.availability.agent.email}
                                                        onChange={(e) => handleReassign(appt.id, e.target.value)}
                                                    >
                                                        <option value={appt.availability.agent.email}>Reassign Operator...</option>
                                                        {drivers.filter(d => d.email !== appt.availability.agent.email).map(d => (
                                                            <option key={d.id} value={d.email}>{d.fullName || d.email}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );

            case 'drivers':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drivers.map(driver => (
                            <div key={driver.id} className="card glass-card hover:translate-y-[-4px] transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black">
                                        {driver.fullName?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <div className="font-black text-lg">{driver.fullName || 'Unit Driver'}</div>
                                        <div className="text-xs text-muted font-mono">{driver.email}</div>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-500/10 rounded-lg text-xs flex justify-between">
                                    <span className="text-muted uppercase font-bold tracking-tighter">Fleet Specialization</span>
                                    <span className="text-primary font-black uppercase">{driver.specialization || 'General Logistics'}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                );

            case 'customers':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customers.map(customer => (
                            <div key={customer.id} className="card glass-card hover:translate-y-[-4px] transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 font-black">
                                        {customer.fullName?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <div className="font-black text-lg">{customer.fullName || 'Customer Unit'}</div>
                                        <div className="text-xs text-muted font-mono">{customer.email}</div>
                                    </div>
                                </div>
                                <div className="status-badge status-active text-[10px] w-fit">Authorized Core User</div>
                            </div>
                        ))}
                    </motion.div>
                );

            case 'fleet':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="flex items-center gap-2 font-black"><MapIcon className="text-primary" /> Fleet Operations Center</h3>
                            <div className="flex gap-4">
                                <div className="p-3 bg-slate-500/5 rounded-xl flex items-center gap-2 border border-border/30">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{vehicles.length} Units Online</span>
                                </div>
                            </div>
                        </div>

                        <FleetMap vehicles={vehicles} />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                            {vehicles.map(v => (
                                <VehicleCard key={v.id} vehicle={v} />
                            ))}
                        </div>
                    </motion.div>
                );

            case 'queue':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="card glass-card">
                        <h3 className="mb-6 flex items-center gap-2 font-black"><CheckCircle className="text-green-500" /> Unit Activation Queue</h3>
                        <div className="flex flex-col gap-4">
                            {pendingUsers.length === 0 ? (
                                <p className="text-center py-12 text-muted uppercase tracking-widest text-sm font-bold">No units awaiting activation</p>
                            ) : (
                                pendingUsers.map(user => (
                                    <div key={user.id} className="p-5 border border-border rounded-2xl flex justify-between items-center bg-slate-500/5 hover:bg-slate-500/10 transition-all">
                                        <div>
                                            <div className="font-bold text-lg">{user.fullName || 'New Enrollee'}</div>
                                            <div className="text-sm text-muted">{user.email}</div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest mt-1 p-1 px-2 rounded w-fit ${user.role === 'DRIVER' ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-500'}`}>
                                                {user.role} UNIT
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleApproveUser(user.id)}
                                            className="btn btn-primary px-6 py-3 font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20"
                                        >
                                            Activate Unit
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                );

            default: return null;
        }
    };

    return (
        <DashboardLayout role="MANAGER" userEmail={userEmail} activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="flex flex-col gap-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-black mb-1">Logistics Command</h1>
                    <p className="text-muted text-sm font-medium tracking-tight">Regional management interface for NeuroFleetX operations.</p>
                </div>
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default ManagerDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, UserCheck, ShieldAlert, Activity, Trash2, CheckCircle, Search, Map as MapIcon, Database } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import FleetMap from '../components/FleetMap';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';

const SuperuserDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [managers, setManagers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const userEmail = localStorage.getItem('userEmail');

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const customersRes = await axios.get('http://localhost:9090/api/auth/admin/customers', { headers });
            setCustomers(customersRes.data);

            const driversRes = await axios.get('http://localhost:9090/api/auth/admin/drivers', { headers });
            setDrivers(driversRes.data);

            const managersRes = await axios.get('http://localhost:9090/api/auth/admin/managers', { headers });
            setManagers(managersRes.data);

            const apptsRes = await axios.get('http://localhost:9090/api/auth/admin/appointments', { headers });
            setAppointments(apptsRes.data);

            const vehiclesRes = await axios.get('http://localhost:9090/api/vehicles', { headers });
            setVehicles(vehiclesRes.data);

            // Fetch logs if endpoint exists, otherwise fallback to empty
            try {
                const logsRes = await axios.get('http://localhost:9090/api/logs/recent', { headers });
                setActivityLogs(logsRes.data);
            } catch (e) {
                setActivityLogs([]);
            }

        } catch (err) {
            toast.error("Fleet Data Synchronization Failed: Check Backend Connection");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const approveUser = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:9090/api/auth/approve-user/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Unit authorized for regional operation");
            fetchData();
        } catch (err) {
            toast.error("Authorization override failed");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("CRITICAL: Permanent deletion of operational unit. Proceed?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:9090/api/auth/admin/user/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Unit successfully decommissioned");
            fetchData();
        } catch (err) {
            toast.error("Decommissioning failed: Security constraint");
        }
    };

    const seedFleet = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:9090/api/vehicles/seed', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Ecosystem Fleet Seeding Initialized");
            fetchData();
        } catch (err) {
            toast.error("Seeding failed: Security constraint");
        }
    };

    const pieData = [
        { name: 'Managers', value: managers.length, color: '#0ea5e9' },
        { name: 'Operators', value: drivers.length, color: '#6366f1' },
        { name: 'Partners', value: customers.length, color: '#10b981' },
    ];

    const renderContent = () => {
        const containerVariants = {
            hidden: { opacity: 0, scale: 0.98 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
        };

        switch (activeTab) {
            case 'dashboard':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="card glass-card">
                                <h3 className="mb-6 flex items-center gap-2"><Activity size={20} className="text-primary" /> Ecosystem Distribution</h3>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card glass-card h-[400px] flex flex-col">
                                <h3 className="mb-6 flex items-center gap-2"><ShieldAlert size={20} className="text-amber-500" /> System Integrity Logs</h3>
                                <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                    {activityLogs.length === 0 ? (
                                        <p className="text-muted text-center mt-20 uppercase tracking-widest text-xs font-bold">No recent security events</p>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {activityLogs.map(log => (
                                                <div key={log.id} className="p-4 bg-slate-500/5 border border-border/50 rounded-xl text-xs flex justify-between items-center group hover:bg-slate-500/10 transition-all">
                                                    <div>
                                                        <div className="font-black uppercase tracking-tight text-primary mb-1">{log.action}</div>
                                                        <div className="text-muted font-mono">{log.email}</div>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card glass-card">
                            <h3 className="mb-6 flex items-center gap-2 font-black">Live Deployment Manifests</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-muted text-[10px] uppercase tracking-widest border-b border-border/50">
                                            <th className="p-4">Partner Entity</th>
                                            <th className="p-4">Assigned Operator</th>
                                            <th className="p-4">Deployment Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.length > 0 ? appointments.slice(0, 8).map(appt => (
                                            <tr key={appt.id} className="border-b border-border/20 hover:bg-slate-500/5 transition-all">
                                                <td className="p-4 font-bold text-sm">{appt.client.email}</td>
                                                <td className="p-4 text-sm font-medium">{appt.availability.agent.fullName || appt.availability.agent.email}</td>
                                                <td className="p-4">
                                                    <span className={`status-badge ${appt.status === 'CONFIRMED' ? 'status-active' : 'status-pending'}`}>{appt.status}</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="p-12 text-center text-muted font-bold uppercase tracking-widest text-xs">No active nodes detected</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'managers':
            case 'drivers':
            case 'customers':
                const currentData = activeTab === 'managers' ? managers : activeTab === 'drivers' ? drivers : customers;
                const filteredData = currentData.filter(u =>
                    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="card glass-card">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black capitalize">{activeTab} Directory</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    className="form-input pl-10 h-10 w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-muted text-[10px] uppercase tracking-widest border-b border-border/50">
                                        <th className="p-4">Identification</th>
                                        <th className="p-4">Unit Designation</th>
                                        <th className="p-4">Authorization Status</th>
                                        <th className="p-4 text-right">Operational Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map(user => (
                                        <tr key={user.id} className="border-b border-border/20 hover:bg-slate-500/5 transition-all">
                                            <td className="p-4">
                                                <div className="font-black text-sm">{user.email}</div>
                                                <div className="text-[10px] text-muted font-mono">ID: {user.id}</div>
                                            </td>
                                            <td className="p-4 text-sm font-bold text-primary">{user.fullName || 'Standard Unit'}</td>
                                            <td className="p-4">
                                                <span className={`status-badge ${user.approved ? 'status-active' : 'status-pending'}`}>
                                                    {user.approved ? "Authorized" : "Awaiting Activation"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {!user.approved && (
                                                        <button
                                                            className="btn btn-primary px-3 py-1 text-[10px] font-black uppercase"
                                                            onClick={() => approveUser(user.id)}
                                                        >
                                                            Authorize
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-secondary px-3 py-1 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/10"
                                                        onClick={() => deleteUser(user.id)}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );

            case 'fleet':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black flex items-center gap-2"><MapIcon className="text-primary" /> Global Fleet Nexus</h2>
                                <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Ecosystem-wide vehicle telemetry and tracking</p>
                            </div>
                            <button onClick={seedFleet} className="btn btn-secondary flex items-center gap-2 px-4 py-2 text-xs font-black uppercase">
                                <Database size={14} /> Seed Operational Units
                            </button>
                        </div>

                        <FleetMap vehicles={vehicles} />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {vehicles.map(v => (
                                <VehicleCard key={v.id} vehicle={v} />
                            ))}
                        </div>
                    </motion.div>
                );

            default: return null;
        }
    };

    return (
        <DashboardLayout role="SUPERUSER" userEmail={userEmail} activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="flex flex-col gap-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-black mb-1">Global Oversight</h1>
                    <p className="text-muted text-sm font-medium tracking-tight">Ecosystem-wide administrative controls and system integrity monitoring.</p>
                </div>
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default SuperuserDashboard;

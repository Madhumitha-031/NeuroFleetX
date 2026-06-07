import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    User,
    LogOut,
    Bell,
    Briefcase,
    Users,
    CheckCircle,
    Home,
    ClipboardList,
    Map
} from 'lucide-react';

import Logo from '../assets/logo.png';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            cursor: 'pointer',
            borderRadius: '12px',
            marginBottom: '0.5rem',
            transition: 'all 0.2s ease',
            backgroundColor: active ? 'var(--primary-color)' : 'transparent',
            color: active ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: active ? '700' : '500'
        }}
        className="sidebar-item"
    >
        <Icon size={20} />
        <span style={{ fontSize: '0.95rem' }}>{label}</span>
    </div>
);

const DashboardLayout = ({ role, children, activeTab, setActiveTab, userEmail }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef(null);

    const menus = {
        CUSTOMER: [
            { id: 'dashboard', label: 'Fleet Overview', icon: LayoutDashboard },
            { id: 'appointments', label: 'Deployment Logs', icon: Calendar },
            { id: 'documents', label: 'Service Manifests', icon: FileText },
            { id: 'profile', label: 'Unit Profile', icon: User },
        ],
        DRIVER: [
            { id: 'dashboard', label: 'Operator Portal', icon: LayoutDashboard },
            { id: 'schedule', label: 'Deployment Windows', icon: Calendar },
            { id: 'fleet', label: 'Live Tracking', icon: Map },
            { id: 'profile', label: 'Operator Settings', icon: User },
        ],
        MANAGER: [
            { id: 'dashboard', label: 'Management Hub', icon: LayoutDashboard },
            { id: 'requests', label: 'Logistics Requests', icon: ClipboardList },
            { id: 'fleet', label: 'Fleet Tracking', icon: Map },
            { id: 'drivers', label: 'Driver Units', icon: Users },
            { id: 'customers', label: 'Customer Units', icon: Users },
            { id: 'queue', label: 'Activation Queue', icon: CheckCircle },
            { id: 'profile', label: 'Management Profile', icon: User },
        ],
        SUPERUSER: [
            { id: 'dashboard', label: 'Platform Oversight', icon: LayoutDashboard },
            { id: 'fleet', label: 'Global Fleet', icon: Map },
            { id: 'managers', label: 'Regional Managers', icon: Users },
            { id: 'drivers', label: 'Fleet Operators', icon: Briefcase },
            { id: 'customers', label: 'Partner Accounts', icon: Users },
        ]
    };

    const currentMenu = menus[role] || menus.CUSTOMER;

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:9090/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:9090/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark as read");
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--background-color)', overflow: 'hidden' }}>
            <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                style={{
                    width: '300px',
                    background: 'var(--surface-color)',
                    borderRight: '1.5px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '2rem 1.25rem',
                    zIndex: 30
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '1rem', marginBottom: '3rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary-color)', letterSpacing: '-0.05em' }}>NeuroFleetX</span>
                </div>

                <div style={{ flex: 1 }}>
                    {currentMenu.map(item => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            onClick={() => setActiveTab(item.id)}
                        />
                    ))}
                </div>

                <div style={{ borderTop: '1.5px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <SidebarItem
                        icon={Home}
                        label="Home"
                        onClick={() => { window.location.href = '/'; }}
                    />
                    <SidebarItem
                        icon={LogOut}
                        label="Logout"
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/login';
                        }}
                    />
                </div>
            </motion.div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{
                    height: '80px',
                    background: 'var(--surface-color)',
                    borderBottom: '1.5px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 3rem',
                    zIndex: 25
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {currentMenu.find(m => m.id === activeTab)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ position: 'relative' }} ref={notifRef}>
                            <button
                                onClick={() => setShowNotifs(!showNotifs)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', color: 'var(--text-secondary)' }}
                            >
                                <Bell size={24} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: -5, right: -5,
                                        width: '18px', height: '18px',
                                        background: 'var(--error-color)', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '10px', fontWeight: '900'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifs && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="notification-dropdown"
                                    >
                                        <div className="notif-header">
                                            <span>Notifications</span>
                                        </div>
                                        <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No updates</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => markAsRead(n.id)}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{n.message}</div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem', background: 'var(--secondary-color)', borderRadius: '50px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{userEmail?.split('@')[0]}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: '700' }}>{role}</div>
                            </div>
                            <User size={24} color="var(--primary-color)" />
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

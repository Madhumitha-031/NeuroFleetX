import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NotificationPopup from './NotificationPopup';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const handleAuthChange = () => {
            setUserEmail(localStorage.getItem('userEmail'));
            setUserRole(localStorage.getItem('userRole'));
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    useEffect(() => {
        if (userEmail) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [userEmail]);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:9090/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const unread = res.data.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error("Error fetching notifications");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event('authChange'));
        window.location.href = '/login';
    };

    const getDashboardLink = () => {
        if (userRole === 'SUPERUSER') return '/superuser/dashboard';
        if (userRole === 'DRIVER') return '/driver/dashboard';
        if (userRole === 'CUSTOMER') return '/customer/dashboard';
        if (userRole === 'ADMIN') return '/admin/dashboard';
        return '/dashboard';
    };

    return (
        <nav className="navbar">
            <div className="container flex justify-between items-center">
                <Link to="/" className="nav-brand">NeuroFleetX</Link>

                <div className="nav-links">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="nav-link">Home</Link>
                        <a href="#features" className="nav-link">Features</a>
                        <Link to="/register" className="nav-link">Registration</Link>
                        <a href="#about" className="nav-link">About</a>
                        <a href="#contact" className="nav-link">Contact</a>
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', opacity: 0.5 }}></div>

                    <div className="flex items-center gap-6">
                        <ThemeToggle />

                        {userEmail ? (
                            <div className="flex items-center gap-6">
                                <Link to={getDashboardLink()} className="nav-link" style={{ color: 'var(--primary-color)', fontWeight: '800' }}>Dashboard</Link>

                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
                                    >
                                        🔔
                                        {unreadCount > 0 && (
                                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--error-color)', color: 'white', fontSize: '10px', padding: '2px 5px', borderRadius: '50%', fontWeight: '900', lineHeight: 1 }}>
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <NotificationPopup onClose={() => {
                                            setShowNotifications(false);
                                            fetchUnreadCount();
                                        }} />
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                        {userEmail.split('@')[0]}
                                    </span>
                                    <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary" style={{ padding: '0.65rem 2rem', borderRadius: '12px', fontSize: '0.9rem' }}>Member Access</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

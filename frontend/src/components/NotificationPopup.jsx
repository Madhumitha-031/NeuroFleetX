import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const NotificationPopup = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:9090/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:9090/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (err) {
            console.error("Failed to mark as read");
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:9090/api/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all as read");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="notification-dropdown"
            style={{ padding: '0.5rem' }}
        >
            <div className="notif-header">
                <h3>Notifications</h3>
                <div className="flex gap-4 items-center">
                    <button onClick={markAllRead} style={{ fontSize: '0.8rem', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--primary-color)' }}>Mark all read</button>
                    <button onClick={onClose} style={{ fontSize: '1.2rem', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
                </div>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                {loading ? (
                    <div className="text-center p-4">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center p-4 text-muted">No notifications yet</div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} className={`notif-item ${notif.read ? '' : 'unread'}`}>
                            {!notif.read && <div className="notif-dot"></div>}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{notif.title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{notif.message}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(notif.createdAt).toLocaleDateString()}</div>
                            </div>
                            {!notif.read && (
                                <button
                                    onClick={(e) => markAsRead(notif.id, e)}
                                    style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}
                                >✓</button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default NotificationPopup;

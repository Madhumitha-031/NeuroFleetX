import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [newEmail, setNewEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:9090/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setNewEmail(res.data.email);
        } catch (err) {
            toast.error("Failed to load profile.");
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:9090/api/auth/update-email', { newEmail }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Email updated! Please login again.");
            localStorage.clear();
            window.dispatchEvent(new Event('authChange'));
            navigate('/login');
        } catch (err) {
            toast.error("Failed to update email.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("ARE YOU SURE? This will permanently delete your NeuroFleetX account.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:9090/api/auth/account', {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Account deleted.");
            localStorage.clear();
            window.dispatchEvent(new Event('authChange'));
            navigate('/register');
        } catch (err) {
            toast.error("Failed to delete account.");
        }
    };

    if (!user) return <div className="container p-12">Loading...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container" style={{ padding: '4rem 1.5rem', maxWidth: '600px' }}>
            <div className="card shadowed">
                <h2 className="mb-6">Account Profile</h2>
                <div className="mb-6">
                    <label className="form-label text-muted">Service Role</label>
                    <div style={{ padding: '1rem', background: 'var(--secondary-color)', borderRadius: '8px', fontWeight: '800', color: 'var(--primary-color)' }}>
                        {user.role}
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdateEmail} className="mb-8">
                        <label className="form-label">Contact Email</label>
                        <div className="flex gap-2">
                            <input type="email" className="form-input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                            <button type="submit" className="btn btn-primary">Save</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <div className="mb-8">
                        <label className="form-label">Contact Email</label>
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                            <span>{user.email}</span>
                            <button className="btn-text text-primary font-bold" onClick={() => setIsEditing(true)}>Edit</button>
                        </div>
                    </div>
                )}

                <div className="danger-zone mt-8">
                    <h4 className="danger-zone-title">Danger Zone</h4>
                    <p className="text-sm text-muted mb-4">Deleting your account removes all fleet data.</p>
                    <button onClick={handleDeleteAccount} className="btn w-full btn-danger" style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}>Delete Account</button>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;

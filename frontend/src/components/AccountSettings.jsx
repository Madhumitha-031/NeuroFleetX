import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const AccountSettings = ({ userRole }) => {
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        specialization: ''
    });
    const [newEmail, setNewEmail] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:9090/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile({
                fullName: response.data.fullName || '',
                email: response.data.email,
                specialization: response.data.specialization || ''
            });
        } catch (error) {
            toast.error('Failed to load profile');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:9090/api/auth/update-profile',
                {
                    fullName: profile.fullName,
                    specialization: userRole === 'AGENT' ? profile.specialization : null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Fleet profile updated');
        } catch (error) {
            toast.error(error.response?.data || 'Failed to update profile');
        }
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        if (!newEmail) {
            toast.error('Please enter a new email');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:9090/api/auth/update-email',
                { newEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Email updated. Please log in again.');
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data || 'Failed to update email');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:9090/api/auth/account', {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Account deleted. Safely removed from fleet.');
            localStorage.clear();
            setTimeout(() => {
                window.location.href = '/register';
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data || 'Failed to delete account');
        }
    };

    return (
        <div className="account-settings-container">
            <motion.div
                className="card shadowed mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-6">
                    <h2>Account Settings</h2>
                    <p className="text-muted">Manage your Fleet profile and security</p>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="p-6 border rounded-xl">
                        <h4 className="mb-4">Fleet Identity</h4>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="grid gap-4">
                                <div>
                                    <label className="form-label">Full Operator Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={profile.fullName}
                                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Contact Email</label>
                                    <input type="email" className="form-input" value={profile.email} disabled />
                                </div>
                            </div>

                            {userRole === 'AGENT' && (
                                <div className="mt-4">
                                    <label className="form-label">Fleet Specialization</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={profile.specialization}
                                        onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                                        placeholder="e.g., Heavy Transport, Logistics"
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary mt-6">Save Identity</button>
                        </form>
                    </div>

                    <div className="p-6 border rounded-xl">
                        <h4 className="mb-4">Secure Sign-In</h4>
                        <form onSubmit={handleUpdateEmail}>
                            <label className="form-label">Rotate Primary Email</label>
                            <div className="flex gap-4">
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="New fleet email"
                                />
                                <button type="submit" className="btn btn-secondary">Update</button>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-red-100 bg-red-50 rounded-xl">
                        <h4 className="text-red-800 mb-2">Fleet Decommissioning</h4>
                        <p className="text-sm text-red-600 mb-4">Permanently remove your operator account. This cannot be reversed.</p>
                        {!showDeleteConfirm ? (
                            <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>Decommission Account</button>
                        ) : (
                            <div className="flex gap-4 items-center">
                                <button className="btn btn-primary bg-red-600 border-red-600" onClick={handleDeleteAccount}>Confirm Decommission</button>
                                <button onClick={() => setShowDeleteConfirm(false)} className="text-sm font-bold text-gray-500">Cancel</button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AccountSettings;

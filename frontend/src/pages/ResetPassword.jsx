import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`http://localhost:9090/api/auth/reset-password?token=${token}`, { newPassword: password });
            toast.success("Security credentials updated!");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error("Link expired or invalid.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '8rem 1rem' }}>
            <div className="card shadowed" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2 className="text-center mb-6">Reset Security</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="form-label">New Secure Password</label>
                        <input type="password" placeholder="••••••••" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div>
                        <label className="form-label">Confirm Password</label>
                        <input type="password" placeholder="••••••••" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;

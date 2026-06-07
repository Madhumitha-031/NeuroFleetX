import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`http://localhost:9090/api/auth/forgot-password?email=${email}`);
            toast.success("Recovery link sent to your email!");
            setEmail('');
        } catch (err) {
            toast.error("Error sending recovery link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '8rem 1rem' }}>
            <div className="card shadowed" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2 className="text-center mb-6">Recover Access</h2>
                <p className="text-sm text-muted mb-6 text-center">Enter your registered email to receive a password reset link.</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="form-label">Account Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="name@company.com" required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Recovery Link'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm">
                    Remembered? <a href="/login" className="text-primary font-bold">Back to Login</a>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;

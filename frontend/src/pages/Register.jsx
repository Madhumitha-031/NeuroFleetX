import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [activeTab, setActiveTab] = useState('CUSTOMER');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                role: activeTab
            };

            const response = await axios.post('http://localhost:9090/api/auth/register', payload);
            setMessage(response.data);
            setFormData({ email: '', password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data || "Registration failed. Please try again.");
        }
    };

    return (
        <div className="container" style={{ padding: '6rem 1rem' }}>
            <div className="card glass-card" style={{ maxWidth: '440px', margin: '0 auto', padding: '3rem' }}>
                <div className="text-center mb-8">
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Join the Fleet</h2>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Create your NeuroFleetX account</p>
                </div>

                <div className="flex mb-8" style={{ backgroundColor: 'var(--background-color)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                    {['CUSTOMER', 'DRIVER', 'MANAGER'].map((role) => (
                        <button
                            key={role}
                            className={`btn ${activeTab === role ? 'btn-primary' : ''}`}
                            style={{
                                flex: 1,
                                backgroundColor: activeTab === role ? 'var(--primary-color)' : 'transparent',
                                color: activeTab === role ? 'white' : 'var(--text-secondary)',
                                padding: '0.6rem',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                boxShadow: activeTab === role ? 'var(--shadow-md)' : 'none'
                            }}
                            onClick={() => setActiveTab(role)}
                        >
                            {role.charAt(0) + role.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {message && <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', border: '1px solid var(--success-color)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>{message}</div>}
                {error && <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', border: '1px solid var(--error-color)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="operator@neurofleetx.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Create Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '14px' }}>
                        Establish Identity
                    </button>
                </form>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Already part of the fleet? <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: 800, textDecoration: 'none' }}>Login instead</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

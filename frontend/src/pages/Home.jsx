import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Import Assets (Using placeholders or generated images later if needed)
import Logo from '../assets/logo.png';
import DownloadIcon from '../assets/download-policy.png';
import RenewalIcon from '../assets/renewal.png';
import ClaimIcon from '../assets/initiate-claim.png';
import TrackIcon from '../assets/track-claim.png';

const Home = () => {
    const navigate = useNavigate();

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
    };

    const handleDownloadPolicy = (e) => {
        e.preventDefault();
        alert("Policy download initiated (NeuroFleetX Mock)");
    };

    const quickActions = [
        { icon: DownloadIcon, label: 'Download Fleet Info', onClick: handleDownloadPolicy, link: '#' },
        { icon: RenewalIcon, label: 'Service Renewal', link: '/login' },
        { icon: ClaimIcon, label: 'Initiate Support', link: '/login' },
        { icon: TrackIcon, label: 'Track Fleet', link: '/login' },
    ];

    return (
        <div style={{ background: 'var(--secondary-color)', minHeight: '100vh', paddingBottom: '2rem' }}>
            <section className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img
                            src={Logo}
                            alt="NeuroFleetX"
                            style={{ height: '80px', marginBottom: '1rem', width: 'auto' }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <h1 className="text-gradient" style={{ fontSize: '4.5rem', fontWeight: '900', letterSpacing: '-0.05em' }}>NeuroFleetX</h1>
                    </div>

                    <h2 style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.75rem',
                        lineHeight: 1.4,
                        marginBottom: '3rem',
                        maxWidth: '800px',
                        margin: '0 auto 3rem'
                    }}>
                        Advanced AI-Driven Fleet Management & Protection
                    </h2>

                    <div style={{ marginBottom: '4rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        {localStorage.getItem('token') ? (
                            <button
                                onClick={() => {
                                    const role = localStorage.getItem('userRole');
                                    if (role === 'SUPERUSER') navigate('/superuser/dashboard');
                                    else if (role === 'DRIVER') navigate('/driver/dashboard');
                                    else if (role === 'MANAGER') navigate('/manager/dashboard');
                                    else navigate('/customer/dashboard');
                                }}
                                className="btn btn-primary"
                                style={{ padding: '1.1rem 2.5rem', fontSize: '1.2rem', fontWeight: '800', borderRadius: '16px' }}
                            >
                                Open Command Center ⚡
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn btn-primary"
                                    style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem', fontWeight: '800', borderRadius: '16px' }}
                                >
                                    Login to Fleet
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="btn btn-secondary"
                                    style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem', fontWeight: '800', borderRadius: '16px' }}
                                >
                                    Register Asset
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '2rem',
                        maxWidth: '1100px',
                        margin: '0 auto'
                    }}
                >
                    {quickActions.map((action, index) => (
                        <a key={index} href={action.link} onClick={action.onClick} className="quick-action-card">
                            <div className="icon-wrapper">
                                <img src={action.icon} alt={action.label} onError={(e) => e.target.src = 'https://via.placeholder.com/64'} />
                            </div>
                            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{action.label}</span>
                        </a>
                    ))}
                </motion.div>
            </section>

            <section id="features" style={{ background: 'var(--background-color)', padding: '6rem 0' }}>
                <div className="container">
                    <motion.div {...fadeIn} className="text-center mb-12">
                        <h2 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', fontWeight: '900' }}>Fleet Solutions</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Smarter protection for your mobile assets.</p>
                    </motion.div>

                    <div className="grid-responsive">
                        {['AI Monitoring', 'Real-time Tracking', 'Predictive Maintenance', 'Asset Protection'].map((item, idx) => (
                            <motion.div key={idx} {...fadeIn} transition={{ delay: idx * 0.1 }} className="product-card">
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                                    {['🤖', '📡', '🔧', '🛡️'][idx]}
                                </div>
                                <h3>{item}</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Advanced {item.toLowerCase()} system integrated with NeuroFleetX AI core.</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer style={{ background: '#020617', color: '#94a3b8', padding: '4rem 0 2rem', textAlign: 'center' }}>
                <div className="container">
                    <h3 style={{ color: 'white' }}>NeuroFleetX</h3>
                    <p>© 2026 NeuroFleetX AI. Future of Fleet Protection.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;

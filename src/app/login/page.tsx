'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, User, ArrowRight, Activity } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (!email || !password || (isRegister && !name)) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      // Successful simulated auth
      localStorage.setItem('nexus_auth', JSON.stringify({ email, name: name || 'Operator' }));
      router.push('/operations');
    }, 1200);
  };

  return (
    <div className="auth-container grid-bg">
      <div className="auth-glass-card glass-panel">
        <div className="brand-header">
          <div className="brand-logo">
            <Shield className="logo-icon animate-pulse-primary" />
          </div>
          <h2>NEXUSFLOW <span className="text-cyan">AI</span></h2>
          <p className="subtitle">VENUE COMMAND SYSTEM SECURE ACCESS</p>
        </div>

        {error && (
          <div className="auth-error-box font-mono animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group animate-slide-up">
              <label className="form-label">OPERATOR FULL NAME</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input auth-input"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">COMMAND SECURITY EMAIL</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                placeholder="operator@nexusflow.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input auth-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">AUTHORIZATION KEYPHRASE</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input auth-input"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
            {loading ? (
              <span className="loading-spinner">ESTABLISHING LINK...</span>
            ) : (
              <>
                <span>{isRegister ? 'REGISTER NEW OPERATOR' : 'INITIALIZE LINK'}</span>
                <ArrowRight className="btn-icon" />
              </>
            )}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? (
            <p>
              Already registered?{' '}
              <button onClick={() => { setIsRegister(false); setError(''); }} className="toggle-btn text-cyan">
                Link Existing Operator
              </button>
            </p>
          ) : (
            <p>
              New station crew?{' '}
              <button onClick={() => { setIsRegister(true); setError(''); }} className="toggle-btn text-purple">
                Create Operator Credentials
              </button>
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background-color: var(--bg-base);
          position: relative;
        }

        .auth-glass-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          background: rgba(18, 20, 36, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .brand-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand-logo {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }

        .logo-icon {
          width: 24px;
          height: 24px;
          color: var(--primary);
        }

        .brand-header h2 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 0.1em;
          color: white;
        }

        .brand-header .subtitle {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-dark);
          letter-spacing: 0.15em;
          margin-top: 6px;
        }

        .auth-error-box {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 11px;
          color: var(--color-critical);
          margin-bottom: 24px;
          text-align: center;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 9px;
          font-weight: 800;
          color: var(--text-dark);
          letter-spacing: 0.08em;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          width: 15px;
          height: 15px;
          color: var(--text-secondary);
        }

        .auth-input {
          width: 100%;
          padding-left: 38px;
          font-size: 13px;
          height: 42px;
        }

        .auth-submit-btn {
          width: 100%;
          height: 42px;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          margin-top: 10px;
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-icon {
          width: 14px;
          height: 14px;
        }

        .auth-toggle {
          margin-top: 24px;
          text-align: center;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .toggle-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          padding: 0;
          margin-left: 4px;
          text-decoration: underline;
        }

        .text-cyan { color: var(--primary); }
        .text-purple { color: var(--secondary); }
      `}</style>
    </div>
  );
}

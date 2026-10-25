import React, { useState } from 'react';
import API_BASE_URL from '../config/api';

interface RegisterProps {
  onLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({
  onLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role: 'User',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Registration failed');
        return;
      }

      setSuccess(
        'Account created successfully! You can now login.'
      );

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (error) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
<div
  style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#07111f',
    color: 'white',
    padding: '40px 20px',
    boxSizing: 'border-box',
    overflowY: 'auto',
  }}
>
      <div
        style={{
          width: '380px',
          padding: '40px',
          borderRadius: '16px',
          background: '#0d1b2a',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <div style={{ fontSize: '48px' }}>🚛</div>

          <h1>FleetDash</h1>

          <p style={{ opacity: 0.7 }}>
            Create your account
          </p>
        </div>

        <form onSubmit={handleRegister}>

          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
            style={inputStyle}
          />

          {error && (
            <p style={{ color: '#ff6b6b' }}>
              {error}
            </p>
          )}

         {success && (
  <p
    style={{
      textAlign: 'center',
      marginTop: '10px',
      marginBottom: '10px',
    }}
  >
    Already have an account?{' '}

    <button
      type="button"
      onClick={onLogin}
      style={{
        background: 'none',
        border: 'none',
        color: '#4f8cff',
        cursor: 'pointer',
      }}
    >
      Login
    </button>
  </p>
)}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              marginTop: '10px',
              border: 'none',
              borderRadius: '8px',
              background: '#4f8cff',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          Already have an account?{' '}

          <button
            type="button"
            onClick={onLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f8cff',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  marginTop: '8px',
  marginBottom: '18px',
  borderRadius: '8px',
  border: '1px solid #334155',
  background: '#111f30',
  color: 'white',
  boxSizing: 'border-box',
};

export default Register;
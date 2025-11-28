import React, { useState } from 'react';
import { User, Lock, Mail, Globe } from 'lucide-react';
import DogLogo from './DogLogo';
import { Language } from '../App';
import { translations } from './translations';
import './Auth.css';

interface SignupProps {
  onSignup: (username: string) => void;
  onLoginClick: () => void;
  lang: Language;
  toggleLanguage: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onLoginClick, lang, toggleLanguage }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const t = translations[lang].signup;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSignup(username);
    } else {
      onSignup('Guest');
    }
  };

  return (
    <div className="auth-container">

      {/* Language Toggle (Top Right) */}
      <div className="language-toggle">
        <button onClick={toggleLanguage} className="language-btn">
          <Globe className="w-4 h-4" />
          <span>{lang === 'en' ? 'TH' : 'EN'}</span>
        </button>
      </div>

      {/* Main Container - Unified Split Card */}
      <div className="auth-card">

        {/* Left Side: Branding (White) */}
        <div className="auth-brand">
          <div className="brand-texture"></div>
          <div className="brand-frame"></div>

          <div className="brand-logo">
            <DogLogo />
          </div>

          <div className="brand-title">
            <h1>ABDUL</h1>
            <div className="brand-divider"></div>
            <h2>DocGenV2</h2>
          </div>
        </div>

        {/* Right Side: Signup Form (Red) */}
        <div className="auth-form-section">

          <div className="auth-content">
            <div className="auth-header">
              <h2>{t.header}</h2>
              <p>{t.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Username */}
              <div className="input-group">
                <div className="input-icon">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input"
                  placeholder={t.userPlaceholder}
                  required
                />
              </div>

              {/* Email */}
              <div className="input-group">
                <div className="input-icon">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder={t.emailPlaceholder}
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <div className="input-icon">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder={t.passPlaceholder}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="input-group">
                <div className="input-icon">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input"
                  placeholder={t.confirmPlaceholder}
                  required
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn">
                {t.createBtn}
              </button>
            </form>

            {/* Footer */}
            <div className="auth-footer">
              <p>
                {t.hasAccount} <button onClick={onLoginClick}>{t.loginLink}</button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;

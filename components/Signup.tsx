
import React, { useState } from 'react';
import { User, Lock, Mail, Globe } from 'lucide-react';
import DogLogo from './DogLogo';
import { Language } from '../App';

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

  const t = {
    en: {
      header: "SIGN UP",
      subtitle: "Create your account to get started",
      userPlaceholder: "Username",
      emailPlaceholder: "Email Address",
      passPlaceholder: "Password",
      confirmPlaceholder: "Confirm Password",
      createBtn: "CREATE ACCOUNT",
      hasAccount: "Already have an account?",
      loginLink: "Login here"
    },
    th: {
      header: "ลงทะเบียน",
      subtitle: "สร้างบัญชีของคุณเพื่อเริ่มต้นใช้งาน",
      userPlaceholder: "ชื่อผู้ใช้",
      emailPlaceholder: "อีเมล",
      passPlaceholder: "รหัสผ่าน",
      confirmPlaceholder: "ยืนยันรหัสผ่าน",
      createBtn: "สร้างบัญชี",
      hasAccount: "มีบัญชีอยู่แล้ว?",
      loginLink: "เข้าสู่ระบบที่นี่"
    }
  }[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSignup(username);
    } else {
      onSignup('Guest');
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[#FDFBF7] p-4 font-sans overflow-x-hidden selection:bg-brand-red/20">

      {/* Language Toggle (Top Right) */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-brand-red font-bold shadow-md hover:bg-white transition-all transform hover:scale-105"
        >
          <Globe className="w-4 h-4" />
          <span className="font-display pt-0.5">{lang === 'en' ? 'TH' : 'EN'}</span>
        </button>
      </div>

      {/* Main Container - Unified Split Card */}
      {/* Main Container - Unified Split Card */}
      <div className="flex flex-col md:flex-row w-full max-w-[850px] bg-white rounded-[30px] shadow-2xl overflow-hidden min-h-[450px] animate-slide-up">

        {/* Left Side: Branding (White) */}
        <div className="w-full md:w-[45%] bg-white relative flex flex-col items-center justify-center p-6 shrink-0">

          {/* Texture Background */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#9E0A0E 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

          {/* Inner Red Border Frame */}
          <div className="absolute inset-4 border border-brand-red/30 rounded-[30px] pointer-events-none"></div>

          <div className="w-48 h-48 mb-6 relative drop-shadow-xl transform hover:scale-105 transition-transform duration-500">
            <DogLogo />
          </div>

          <div className="text-center z-10 relative">
            <h1 className="text-3xl font-display font-black text-brand-red tracking-wide mb-2 drop-shadow-sm">
              ABDUL
            </h1>
            <div className="h-1.5 w-16 bg-brand-red/20 mx-auto mb-4 rounded-full"></div>
            <h2 className="text-2xl font-display font-bold text-brand-red tracking-widest drop-shadow-sm">
              DocGenV2
            </h2>
          </div>
        </div>

        {/* Right Side: Signup Form (Red) */}
        <div className="w-full md:w-[55%] bg-[#9E0A0E] p-8 relative flex flex-col justify-center text-white">

          <div className="relative z-10 max-w-sm mx-auto w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-white mb-1 tracking-widest">{t.header}</h2>
              <p className="text-red-100 text-sm font-sans font-light tracking-wider opacity-90">
                {t.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Username */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all shadow-lg font-medium font-sans text-sm tracking-wide"
                  placeholder={t.userPlaceholder}
                  required
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all shadow-lg font-medium font-sans text-sm tracking-wide"
                  placeholder={t.emailPlaceholder}
                  required
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all shadow-lg font-medium font-sans text-sm tracking-wide"
                  placeholder={t.passPlaceholder}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all shadow-lg font-medium font-sans text-sm tracking-wide"
                  placeholder={t.confirmPlaceholder}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-white text-brand-red font-display font-bold text-base py-3 rounded-full shadow-lg hover:bg-gray-50 transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 mt-4 tracking-widest uppercase"
              >
                {t.createBtn}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center border-t border-white/10 pt-4">
              <p className="text-red-100/80 text-sm font-sans">
                {t.hasAccount} <button onClick={onLoginClick} className="font-bold text-white hover:underline decoration-2 underline-offset-4 ml-1 transition-all">{t.loginLink}</button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;


import React, { useState } from 'react';
import { User, Lock, Globe } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import DogLogo from './DogLogo';
import { Language } from '../App';

interface LoginProps {
  onLogin: (username: string) => void;
  onSignupClick: () => void;
  lang: Language;
  toggleLanguage: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignupClick, lang, toggleLanguage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const t = {
    en: {
      welcome: "WELCOME",
      subtitle: "Login in to your account to continue",
      userPlaceholder: "Username",
      passPlaceholder: "Password",
      forgotPass: "Forgot your password?",
      loginBtn: "LOG IN",
      noAccount: "Don't have an account?",
      signupLink: "Sign Up",
      orContinue: "Or continue with",
      googleLogin: "Sign in with Google"
    },
    th: {
      welcome: "ยินดีต้อนรับ",
      subtitle: "เข้าสู่ระบบบัญชีของคุณเพื่อดำเนินการต่อ",
      userPlaceholder: "ชื่อผู้ใช้",
      passPlaceholder: "รหัสผ่าน",
      forgotPass: "ลืมรหัสผ่านหรือไม่?",
      loginBtn: "เข้าสู่ระบบ",
      noAccount: "ยังไม่มีบัญชีใช่ไหม?",
      signupLink: "ลงทะเบียน",
      orContinue: "หรือดำเนินการต่อด้วย",
      googleLogin: "เข้าสู่ระบบด้วย Google"
    }
  }[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    } else {
      onLogin('Guest');
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info using the access token
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        onLogin(userInfo.data.name || userInfo.data.email || 'Google User');
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
    onError: () => console.log('Login Failed'),
  });

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

        {/* Right Side: Login Form (Red) */}
        <div className="w-full md:w-[55%] bg-[#9E0A0E] p-8 relative flex flex-col justify-center text-white">

          <div className="relative z-10 max-w-sm mx-auto w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-white mb-1 tracking-widest">{t.welcome}</h2>
              <p className="text-red-100 text-sm font-sans font-light tracking-wider opacity-90">
                {t.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username Input */}
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
                />
              </div>

              {/* Password Input */}
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
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <button type="button" className="text-red-100 hover:text-white text-xs transition-colors font-medium tracking-wide font-sans">
                  {t.forgotPass}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-white text-brand-red font-display font-bold text-base py-3 rounded-full shadow-lg hover:bg-gray-50 transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 mt-4 tracking-widest uppercase"
              >
                {t.loginBtn}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#9E0A0E] text-red-100">{t.orContinue}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => handleGoogleLogin()}
                  className="flex items-center gap-2 bg-white text-gray-700 font-sans font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 border border-transparent"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t.googleLogin}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center border-t border-white/10 pt-6">
              <p className="text-red-100/80 text-sm font-sans">
                {t.noAccount} <button onClick={onSignupClick} className="font-bold text-white hover:underline decoration-2 underline-offset-4 ml-1 transition-all">{t.signupLink}</button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

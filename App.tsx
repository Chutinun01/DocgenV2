
import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

type View = 'login' | 'signup' | 'dashboard';
export type Language = 'en' | 'th';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [username, setUsername] = useState('');
  const [lang, setLang] = useState<Language>('en');

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'th' : 'en');
  };

  const handleLogin = (user: string) => {
    setUsername(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentView('login');
    setUsername('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {currentView === 'dashboard' && (
        <Dashboard 
          username={username} 
          onLogout={handleLogout} 
          lang={lang}
          setLang={setLang}
        />
      )}
      
      {currentView === 'login' && (
        <Login 
          onLogin={handleLogin} 
          onSignupClick={() => setCurrentView('signup')} 
          lang={lang}
          toggleLanguage={toggleLanguage}
        />
      )}

      {currentView === 'signup' && (
        <Signup 
          onSignup={handleLogin} 
          onLoginClick={() => setCurrentView('login')} 
          lang={lang}
          toggleLanguage={toggleLanguage}
        />
      )}
    </div>
  );
}

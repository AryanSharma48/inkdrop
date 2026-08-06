import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ViewPaste from './pages/ViewPaste';
import Explore from './pages/Explore';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import { getUser, clearSession } from './utils/auth';
import type { User } from './utils/auth';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
    
    // Listen to storage changes to keep session in sync across tabs
    const handleStorageChange = () => {
      setUser(getUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleGithubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user&state=github`;
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&state=google`;
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gov-white overflow-x-hidden w-full">
        {/* Header */}
        <header className="bg-gov-yellow border-b-4 border-gov-black p-4 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:underline decoration-gov-black decoration-4 underline-offset-4 group">
              <img src="/logo.png" alt="InkDrop Logo" className="w-10 h-10 object-contain group-hover:-translate-y-1 transition-transform" />
              <span className="text-3xl font-black text-gov-black uppercase tracking-tighter">
                INKDROP
              </span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/" className="text-gov-black font-black uppercase text-lg hover:underline decoration-4 underline-offset-4">
                CREATE NEW
              </Link>
              <Link to="/explore" className="text-gov-black font-black uppercase text-lg hover:underline decoration-4 underline-offset-4">
                EXPLORE
              </Link>
              <Link to="/dashboard" className="text-gov-black font-black uppercase text-lg hover:underline decoration-4 underline-offset-4">
                MY PASTES
              </Link>
              
              {user ? (
                <>
                  <div className="flex items-center gap-2 border-2 border-gov-black px-2 py-1 bg-gov-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <img src={user.avatarUrl} alt={user.userName} className="w-6 h-6 border border-gov-black object-cover" />
                    <span className="font-bold text-xs uppercase text-gov-black truncate max-w-[80px]">
                      {user.userName}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gov-red text-gov-white font-black px-3 py-1 border-2 border-gov-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleGithubLogin}
                    className="bg-gov-black text-gov-white font-black px-3 py-1.5 border-2 border-gov-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all uppercase text-xs flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.72.37-1.07.6-1.25-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.84-2.34 4.68-4.57 4.93.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                    </svg>
                    GITHUB
                  </button>
                  <button
                    onClick={handleGoogleLogin}
                    className="bg-gov-white text-gov-black font-black px-3 py-1.5 border-2 border-gov-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase text-xs flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.987 0-.74-.078-1.303-.177-1.868H12.24z"/>
                    </svg>
                    GOOGLE
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/auth/callback" element={<AuthCallback onLogin={setUser} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/p/:id" element={<ViewPaste />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gov-black text-gov-white p-4 mt-8 border-t-4 border-gov-black shadow-[0_-4px_0_0_rgba(0,0,0,1)]">
          <div className="max-w-4xl mx-auto text-sm font-bold uppercase flex justify-between items-center">
            <span>INKDROP '{(new Date().getFullYear()) % 2000 }</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ViewPaste from './pages/ViewPaste';
import Explore from './pages/Explore';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import ErrorPage from './pages/ErrorPage';
import Login from './pages/Login';
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
                  <Link
                    to="/login"
                    className="bg-gov-black text-gov-white font-black px-4 py-1.5 border-2 border-gov-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all uppercase text-sm"
                  >
                    LOGIN
                  </Link>
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
            <Route path="/login" element={<Login />} />
            <Route path="/p/:id" element={<ViewPaste />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<ErrorPage />} />
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

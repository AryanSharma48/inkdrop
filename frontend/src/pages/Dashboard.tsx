import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuthHeaders, getToken, getUser } from '../utils/auth';

type UserPaste = {
  id: string;
  title?: string | null;
  language: string;
  isBurn: boolean | number;
  isProtected: boolean | number;
  expiresAt?: number | null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [pastes, setPastes] = useState<UserPaste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getUser();

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    const fetchMyPastes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/my-pastes`, {
          headers: {
            ...getAuthHeaders()
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error('Failed to load your pastes.');
        }

        const data = await response.json();
        setPastes(data.pastes || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPastes();
  }, [navigate]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this paste?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pastes/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete paste');
      }

      setPastes((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete paste');
    }
  };

  const formatExpires = (timestamp?: number | null) => {
    if (!timestamp) return 'NEVER EXPIRES';
    if (timestamp < Date.now()) return 'EXPIRED';
    const d = new Date(timestamp);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `EXPIRES: ${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  if (loading) return <div className="text-2xl font-black uppercase text-center mt-20 animate-pulse">LOADING YOUR DASHBOARD...</div>;
  if (error) return <div className="text-2xl font-black uppercase text-center mt-20 text-gov-red">ERROR: {error}</div>;
  
  if (!user) {
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

    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-4 border-gov-black bg-gov-yellow shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12">
        <h1 className="text-4xl font-black uppercase mb-4">ACCESS DENIED</h1>
        <p className="text-gov-black font-bold uppercase mb-6 max-w-md">
          Authentication is required to view your persistent paste dashboard and manage your account files.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm">
          <button
            onClick={handleGithubLogin}
            className="flex-1 bg-gov-black text-gov-white font-black px-6 py-3 border-4 border-gov-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all uppercase text-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.72.37-1.07.6-1.25-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.84-2.34 4.68-4.57 4.93.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
            GITHUB
          </button>
          <button
            onClick={handleGoogleLogin}
            className="flex-1 bg-gov-white text-gov-black font-black px-6 py-3 border-4 border-gov-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase text-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.987 0-.74-.078-1.303-.177-1.868H12.24z"/>
            </svg>
            GOOGLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="border-b-4 border-gov-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-black uppercase">MY DASHBOARD</h1>
          <p className="text-gov-black font-bold uppercase mt-2">Manage your uploaded pastes</p>
        </div>
        {user && (
          <div className="flex items-center gap-3 border-4 border-gov-black p-2 bg-gov-white">
            <img src={user.avatarUrl} alt={user.userName} className="w-10 h-10 border-2 border-gov-black object-cover" />
            <div className="font-black uppercase text-sm">{user.userName}</div>
          </div>
        )}
      </div>

      {pastes.length === 0 ? (
        <div className="text-xl font-bold uppercase text-center mt-10 border-4 border-gov-black p-8 bg-gov-white">
          No pastes created yet. Click "Create New" above to start dropping snippets!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastes.map((paste) => (
            <Link
              key={paste.id}
              to={`/p/${paste.id}`}
              className="block border-4 border-gov-black p-4 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-gov-white group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black uppercase truncate max-w-[70%] group-hover:underline">
                  {paste.title ? paste.title : `PASTE: ${paste.id}`}
                </h2>
                <div className="flex gap-2">
                  {paste.isProtected ? <span className="text-2xl" title="Password Required">🔒</span> : null}
                  {paste.isBurn ? <span className="text-2xl animate-pulse" title="Will burn on read">🔥</span> : null}
                  <button
                    onClick={(e) => handleDelete(paste.id, e)}
                    className="border-2 border-gov-black bg-gov-red text-gov-white px-2 py-0.5 font-bold uppercase text-xs hover:translate-y-0.5 hover:shadow-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ml-2"
                  >
                    DELETE
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm font-bold uppercase">
                <span className="bg-gov-black text-gov-white px-2 py-1">{paste.language || 'text'}</span>
                <span className="text-gov-black font-black">{formatExpires(paste.expiresAt)}</span>
              </div>
              {paste.isBurn ? (
                <div className="mt-4 text-xs font-bold text-gov-red uppercase bg-gov-red/10 border-2 border-gov-red p-2 inline-block">
                  ⚠️ WARNING: THIS PASTE WILL BURN UPON VIEWING
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

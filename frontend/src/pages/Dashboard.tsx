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
      navigate('/');
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

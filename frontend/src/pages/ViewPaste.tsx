import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getAuthHeaders, getUser } from '../utils/auth';

type PasteData = {
    id: string;
    userId?: string | null;
    title?: string | null;
    text: string;
    language?: string;
    visibility: string;
    isBurn?: boolean;
    expiresAt?: number;
    creatorName?: string | null;
};

export default function ViewPaste() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paste, setPaste] = useState<PasteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);

  const fetchPaste = async (pass?: string) => {
      try {
          setLoading(true);
          const headers: HeadersInit = {};
          if (pass) headers['x-paste-password'] = pass;

          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pastes/${id}`, { headers });
          if (!response.ok) {
              if (response.status === 404) throw new Error("Paste not found.");
              if (response.status === 410) throw new Error("This paste has expired.");
              if (response.status === 401) {
                  if (pass) setPasswordError("INCORRECT PASSWORD");
                  setIsLocked(true);
                  return;
              }
              throw new Error("Failed to load paste.");
          }
          const data = await response.json();
          setPaste(data);
          setIsLocked(false);
          setPasswordError(null);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchPaste();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this paste? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pastes/${id}`, {
            method: 'DELETE',
            headers: {
              ...getAuthHeaders()}
        });
        if (!response.ok) {
            throw new Error("Failed to delete paste.");
        }
        navigate('/');
    } catch (err: any) {
        alert(err.message);
        setIsDeleting(false);
    }
  };

  if (loading) {
      return <div className="text-2xl font-black uppercase text-center mt-20 animate-pulse">LOADING...</div>;
  }

  if (isLocked && !paste) {
      return (
          <div className="flex flex-col gap-4 max-w-md mx-auto mt-20 p-8 border-4 border-gov-black bg-gov-yellow shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h1 className="text-4xl font-black uppercase text-center mb-4">🔒 LOCKED</h1>
              {passwordError && <div className="bg-gov-red text-gov-white font-black uppercase text-center p-2 border-2 border-gov-black">{passwordError}</div>}
              <form onSubmit={(e) => { e.preventDefault(); fetchPaste(password); }} className="flex flex-col gap-4">
                  <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="ENTER PASSWORD..."
                      className="border-4 border-gov-black p-4 font-bold uppercase focus:outline-none"
                      required
                  />
                  <button type="submit" className="bg-gov-black text-gov-white font-black uppercase py-4 border-4 border-gov-black hover:bg-gov-white hover:text-gov-black transition-colors cursor-pointer">
                      Unlock
                  </button>
              </form>
          </div>
      );
  }

  if (error || !paste) {
      return (
          <div className="flex flex-col gap-4 text-center mt-20">
              <h1 className="text-4xl font-black uppercase text-gov-red">ERROR: {error}</h1>
              <Link to="/" className="text-gov-black font-bold uppercase hover:underline">
                &larr; Return Home
              </Link>
          </div>
      );
  }

  const formatExpires = (timestamp?: number) => {
      if (!timestamp) return 'NEVER';
      const d = new Date(timestamp);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-gov-black pb-4 gap-4 w-full min-w-0">
        <div className="min-w-0 w-full">
          <h1 
            onClick={() => setIsTitleExpanded(!isTitleExpanded)}
            title={isTitleExpanded ? "Click to collapse" : "Click to expand"}
            className={`text-3xl sm:text-4xl font-black uppercase cursor-pointer select-none ${
              isTitleExpanded ? "whitespace-normal break-all" : "truncate max-w-full"
            }`}
          >
            {paste.title ? paste.title : `PASTE: ${id}`}
          </h1>
          {paste.isBurn && (
              <div className="bg-gov-red text-gov-white font-black uppercase px-2 py-1 mt-2 inline-block border-2 border-gov-black animate-pulse text-xs sm:text-sm">
                🔥 WARNING: THIS PASTE HAS BURNED AND NO LONGER EXISTS 🔥
              </div>
          )}
          <p className="text-gov-black font-bold uppercase mt-2 text-xs sm:text-sm leading-relaxed">
              CREATED BY: {paste.creatorName || 'ANONYMOUS'} <br className="sm:hidden" />| LANGUAGE: {paste.language || 'text'} <br className="sm:hidden" />| EXPIRES: {formatExpires(paste.expiresAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            className="flex-1 sm:flex-initial bg-gov-purple text-gov-white font-bold px-4 py-2 uppercase border-2 border-gov-black hover:bg-gov-black text-center"
            onClick={() => navigator.clipboard.writeText(paste.text)}
          >
            Copy
          </button>
          <a 
            href={`${import.meta.env.VITE_API_URL}/api/raw/${id}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-initial bg-gov-white text-gov-black font-bold px-4 py-2 uppercase border-2 border-gov-black hover:bg-gov-yellow text-center"
          >
            Raw
          </a>
          {((getUser() && paste.userId === getUser()?.id) ||
            (JSON.parse(localStorage.getItem('guest_pastes') || '[]').includes(paste.id))) && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-initial bg-gov-red text-gov-white font-bold px-4 py-2 uppercase border-2 border-gov-black hover:bg-gov-black disabled:opacity-50 text-center"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="border-4 border-gov-black bg-gov-black overflow-x-auto mt-4 max-w-full">
        {/* We override the syntax highlighter pre styling to ensure brutalism */}
        <SyntaxHighlighter 
          language={paste.language || 'text'} 
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            borderRadius: '0px',
            backgroundColor: '#000000',
            fontSize: '16px'
          }}
        >
          {paste.text}
        </SyntaxHighlighter>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-gov-red font-black uppercase text-xl hover:underline decoration-4 underline-offset-4">
          &larr; Create New
        </Link>
      </div>
    </div>
  );
}

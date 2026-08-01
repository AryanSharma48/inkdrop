import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type PasteData = {
    id: string;
    text: string;
    language?: string;
    visibility: string;
    isBurn?: boolean;
    expiresAt?: number;
};

export default function ViewPaste() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paste, setPaste] = useState<PasteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPaste = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pastes/${id}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error("Paste not found.");
                if (response.status === 410) throw new Error("This paste has expired.");
                throw new Error("Failed to load paste.");
            }
            const data = await response.json();
            setPaste(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchPaste();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this paste? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pastes/${id}`, {
            method: 'DELETE'
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
      return <div className="text-2xl font-black uppercase text-center mt-20">LOADING...</div>;
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
      return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end border-b-4 border-gov-black pb-2">
        <div>
          <h1 className="text-4xl font-black uppercase">PASTE: {id}</h1>
          {paste.isBurn && (
              <div className="bg-gov-red text-gov-white font-black uppercase px-2 py-1 mt-2 inline-block border-2 border-gov-black animate-pulse">
                🔥 WARNING: THIS PASTE HAS BURNED AND NO LONGER EXISTS 🔥
              </div>
          )}
          <p className="text-gov-black font-bold uppercase mt-1">
              LANGUAGE: {paste.language || 'text'} | EXPIRES: {formatExpires(paste.expiresAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="bg-gov-purple text-gov-white font-bold px-4 py-2 uppercase border-2 border-gov-black hover:bg-gov-black"
            onClick={() => navigator.clipboard.writeText(paste.text)}
          >
            Copy
          </button>
          <a 
            href={`${import.meta.env.VITE_API_URL}/api/raw/${id}`}
            target="_blank"
            rel="noreferrer"
            className="bg-gov-white text-gov-black font-bold px-4 py-2 uppercase border-2 border-gov-black hover:bg-gov-yellow"
          >
            Raw
          </a>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-gov-red text-gov-white font-bold px-4 py-2 uppercase border-2 border-gov-black hover:bg-gov-black disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="border-4 border-gov-black bg-gov-black overflow-hidden mt-4">
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

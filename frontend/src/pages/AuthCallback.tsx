import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken, setUser } from '../utils/auth';
import type { User } from '../utils/auth';

interface AuthCallbackProps {
  onLogin: (user: User) => void;
}

export default function AuthCallback({ onLogin }: AuthCallbackProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code received.');
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    const exchangeCode = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Authentication failed');
        }

        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        
        // Sync any locally stored guest pastes to the user's account
        const guestPastes = JSON.parse(localStorage.getItem('guest_pastes') || '[]');
        if (guestPastes.length > 0) {
          try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/pastes/sync`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
              },
              body: JSON.stringify({ pasteIds: guestPastes })
            });
            localStorage.removeItem('guest_pastes');
          } catch (syncErr) {
            console.error('Failed to sync guest pastes:', syncErr);
          }
        }

        onLogin(data.user);
        
        // Redirect to homepage/dashboard
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication.');
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center py-12">
      <div className="bg-gov-white border-4 border-gov-black p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {error ? (
          <div>
            <h2 className="text-2xl font-black text-gov-red uppercase mb-4">ACCESS DENIED //</h2>
            <p className="font-bold text-gov-black mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gov-yellow border-2 border-gov-black text-gov-black font-black px-4 py-2 uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-black text-gov-black uppercase mb-4 animate-pulse">VERIFYING SECURE TOKEN...</h2>
            <div className="border-4 border-gov-black p-4 bg-gov-yellow flex items-center justify-center font-black text-xl uppercase">
              Connecting with GitHub...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

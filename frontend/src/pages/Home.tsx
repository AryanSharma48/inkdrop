import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, getUser } from '../utils/auth';

export default function Home() {
  const user = getUser();
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('text');
  const [visibility, setVisibility] = useState('public');
  const [expiration, setExpiration] = useState('never');
  const [customDateTime, setCustomDateTime] = useState('');
  const [isBurn, setIsBurn] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    let expiresIn: number | undefined = undefined;
    if (expiration === '1h') expiresIn = 3600;
    else if (expiration === '1d') expiresIn = 86400;
    else if (expiration === '1w') expiresIn = 604800;
    else if (expiration === 'custom') {
      if (customDateTime) {
        const diffInMs = new Date(customDateTime).getTime() - Date.now();
        if (diffInMs > 0) {
          expiresIn = Math.floor(diffInMs / 1000);
        } else {
          setError("Custom expiration time must be in the future.");
          setIsSubmitting(false);
          return;
        }
      } else {
        setError("Please select a custom expiration date and time.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pastes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          text: content,
          title: title || undefined,
          language,
          visibility,
          isBurn,
          password: password || undefined,
          expiresIn
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          navigate('/error?code=429&message=Too+Many+Requests');
          return;
        }
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create paste');
      }

      const data = await response.json() as { id: string };
      if (!getUser()) {
        const guestPastes = JSON.parse(localStorage.getItem('guest_pastes') || '[]');
        guestPastes.push(data.id);
        localStorage.setItem('guest_pastes', JSON.stringify(guestPastes));
      }
      
      navigate('/explore');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="flex flex-col gap-6 w-full flex-1">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center bg-gov-black px-2 py-1 w-full">
            <label htmlFor="paste-content" className="font-bold text-xl uppercase text-gov-white">
            Input Data
            </label>
            {error && <span className="text-gov-red font-bold uppercase text-sm">Error: {error}</span>}
        </div>
        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="PASTE TITLE (OPTIONAL)"
          className="w-full border-4 border-gov-black bg-gov-white text-gov-black p-4 font-black uppercase text-2xl focus:outline-none placeholder:text-gray-400"
          disabled={isSubmitting}
        />
        <textarea
          id="paste-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="ENTER TEXT OR CODE HERE..."
          className="w-full min-h-[400px] border-4 border-gov-black bg-gov-white text-gov-black p-4 font-mono focus:outline-none focus:bg-[#FFFDE7]"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="flex flex-col border-4 border-gov-black">
          <label className="font-bold uppercase bg-gov-black text-gov-white px-2 py-1 text-sm">Language</label>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 font-bold uppercase bg-gov-white text-gov-black focus:outline-none appearance-none"
            disabled={isSubmitting}
          >
            <option value="text">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        <div className="flex flex-col border-4 border-gov-black">
          <label className="font-bold uppercase bg-gov-black text-gov-white px-2 py-1 text-sm">Visibility</label>
          <select 
            value={visibility} 
            onChange={(e) => setVisibility(e.target.value)}
            className="p-2 font-bold uppercase bg-gov-white text-gov-black focus:outline-none appearance-none"
            disabled={isSubmitting}
          >
            <option value="public">Public</option>
            {user ? (
              <option value="unlisted">Unlisted</option>
            ) : (
              <option value="unlisted" disabled>Unlisted (Login required)</option>
            )}
          </select>
        </div>

        <div className={`flex flex-col border-4 border-gov-black ${expiration === 'custom' ? 'md:col-span-2' : ''}`}>
          <label className="font-bold uppercase bg-gov-black text-gov-white px-2 py-1 text-sm">Expiration</label>
          <div className="flex flex-col sm:flex-row bg-gov-white h-full">
            <select 
              value={expiration} 
              onChange={(e) => setExpiration(e.target.value)}
              className="p-2 font-bold uppercase bg-transparent text-gov-black focus:outline-none appearance-none flex-1"
              disabled={isSubmitting}
            >
              <option value="never">Never</option>
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="custom">Custom</option>
            </select>
            {expiration === 'custom' && (
              <div className="flex items-center border-t-4 sm:border-t-0 sm:border-l-4 border-gov-black bg-gov-white flex-1">
                <input 
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full p-2 font-bold bg-transparent text-gov-black focus:outline-none text-xs uppercase"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col border-4 border-gov-black">
          <label className="font-bold uppercase bg-gov-black text-gov-white px-2 py-1 text-sm">Burn On Read</label>
          <div className="flex items-center justify-center h-full bg-gov-white p-2">
            <input 
              type="checkbox" 
              checked={isBurn}
              onChange={(e) => setIsBurn(e.target.checked)}
              className="w-6 h-6 cursor-pointer accent-gov-red"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex flex-col border-4 border-gov-black">
          <label className="font-bold uppercase bg-gov-black text-gov-white px-2 py-1 text-sm">Password</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="OPTIONAL"
            className="p-2 font-bold uppercase bg-gov-white text-gov-black focus:outline-none placeholder:text-gray-400 placeholder:text-xs h-full"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="mt-4 bg-gov-red text-gov-white font-black text-2xl uppercase py-4 px-8 border-4 border-gov-black hover:bg-gov-black transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'PROCESSING...' : 'Submit Paste'}
      </button>
    </form>
  );
}

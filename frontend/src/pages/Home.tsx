import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('text');
  const [visibility, setVisibility] = useState('public');
  const [expiration, setExpiration] = useState('never');
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

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          language,
          visibility,
          expiresIn
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create paste');
      }

      const data = await response.json();
      navigate(`/p/${data.id}`);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
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
            <option value="unlisted">Unlisted</option>
          </select>
        </div>

        <div className="flex flex-col border-4 border-gov-black">
          <label className="font-bold uppercase bg-gov-black text-gov-white px-2 py-1 text-sm">Expiration</label>
          <select 
            value={expiration} 
            onChange={(e) => setExpiration(e.target.value)}
            className="p-2 font-bold uppercase bg-gov-white text-gov-black focus:outline-none appearance-none"
            disabled={isSubmitting}
          >
            <option value="never">Never</option>
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
          </select>
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

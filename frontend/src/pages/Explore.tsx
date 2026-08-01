import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type FeedPaste = {
    id: string;
    title?: string | null;
    language: string;
    isBurn: boolean | number;
    isProtected: boolean | number;
    expiresAt?: number | null;
};

export default function Explore() {
    const [pastes, setPastes] = useState<FeedPaste[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pastes`);
                if (!response.ok) {
                    throw new Error("Failed to fetch feed.");
                }
                const data = await response.json();
                setPastes(data.pastes || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    if (loading) return <div className="text-2xl font-black uppercase text-center mt-20 animate-pulse">LOADING PUBLIC FEED...</div>;
    if (error) return <div className="text-2xl font-black uppercase text-center mt-20 text-gov-red">ERROR: {error}</div>;

    const formatExpires = (timestamp?: number | null) => {
        if (!timestamp) return 'NEVER EXPIRES';
        if (timestamp < Date.now()) return 'EXPIRED';
        return `EXPIRES: ${new Date(timestamp).toLocaleString()}`;
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="border-b-4 border-gov-black pb-4">
                <h1 className="text-5xl font-black uppercase">PUBLIC FEED</h1>
                <p className="text-gov-black font-bold uppercase mt-2">EXPLORE THE LATEST PUBLIC DROPS</p>
            </div>

            {pastes.length === 0 ? (
                <div className="text-xl font-bold uppercase text-center mt-10 border-4 border-gov-black p-8 bg-gov-white">No public pastes found. Be the first!</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastes.map((paste) => (
                        <Link 
                            key={paste.id} 
                            to={`/p/${paste.id}`}
                            className="block border-4 border-gov-black p-4 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-gov-white group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-black uppercase truncate max-w-[70%] group-hover:underline">
                                    {paste.title ? paste.title : `PASTE: ${paste.id}`}
                                </h2>
                                <div className="flex gap-2">
                                    {paste.isProtected ? <span className="text-2xl" title="Password Required">🔒</span> : null}
                                    {paste.isBurn ? <span className="text-2xl animate-pulse" title="Will burn on read">🔥</span> : null}
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

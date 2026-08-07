import { useSearchParams, Link } from 'react-router-dom';

export default function ErrorPage() {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code') || '404';
    const message = searchParams.get('message') || 'PAGE NOT FOUND';

    // Provide specific styling/content based on the error code
    const isRateLimit = code === '429';

    return (
        <div className="flex-1 flex flex-col items-center justify-center w-full mt-10">
            <div className={`border-4 border-gov-black p-8 md:p-16 max-w-2xl w-full text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${isRateLimit ? 'bg-gov-yellow' : 'bg-gov-red text-gov-white'}`}>
                
                {isRateLimit ? (
                    <div className="text-6xl mb-4">⏳</div>
                ) : (
                    <div className="text-6xl mb-4">⚠️</div>
                )}
                
                <h1 className="text-8xl font-black uppercase tracking-tighter mb-4">
                    {code}
                </h1>
                
                <h2 className={`text-3xl font-black uppercase mb-8 border-b-4 pb-4 ${isRateLimit ? 'border-gov-black' : 'border-gov-white'}`}>
                    {message}
                </h2>

                {isRateLimit ? (
                    <p className="text-xl font-bold uppercase mb-10 text-gov-black">
                        YOU ARE DROPPING INK TOO FAST. PLEASE WAIT A MINUTE BEFORE TRYING AGAIN.
                    </p>
                ) : (
                    <p className="text-xl font-bold uppercase mb-10">
                        THE RESOURCE YOU ARE LOOKING FOR HAS BEEN REDACTED, DELETED, OR NEVER EXISTED.
                    </p>
                )}

                <Link 
                    to="/" 
                    className={`inline-block font-black uppercase px-8 py-4 text-xl border-4 transition-transform hover:-translate-y-1 hover:translate-x-1 ${
                        isRateLimit 
                        ? 'bg-gov-black text-gov-white border-gov-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none' 
                        : 'bg-gov-white text-gov-black border-gov-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none'
                    }`}
                >
                    RETURN TO BASE
                </Link>
            </div>
        </div>
    );
}

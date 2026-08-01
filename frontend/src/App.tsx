import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ViewPaste from './pages/ViewPaste';
import Explore from './pages/Explore';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gov-white">
        {/* Header */}
        <header className="bg-gov-yellow border-b-4 border-gov-black p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 hover:underline decoration-gov-black decoration-4 underline-offset-4 group">
              <img src="/logo.png" alt="InkDrop Logo" className="w-10 h-10 object-contain group-hover:-translate-y-1 transition-transform" />
              <span className="text-3xl font-black text-gov-black uppercase tracking-tighter">
                INKDROP
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/explore" className="text-gov-black font-black uppercase text-xl hover:underline decoration-4 underline-offset-4">EXPLORE</Link>
              <div className="text-gov-black font-bold uppercase text-sm border-2 border-gov-black px-2 py-1 bg-gov-white">
                Official Platform
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/p/:id" element={<ViewPaste />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gov-black text-gov-white p-4 mt-8">
          <div className="max-w-4xl mx-auto text-sm font-bold uppercase">
            INKDROP SYSTEM // {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

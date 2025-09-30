import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangleIcon, ArrowLeftIcon, RefreshIcon } from './Icons';

interface ThemeSelectorProps {
  onStartGame: (theme: string) => void;
  error: string | null;
}

const ALL_PRESET_THEMES = [
  'Ocean Life', 'British Birds', 'Farm Animals', 'Space Exploration',
  'Periodic Table Elements', 'Cooking Terms', 'Mythical Creatures', 'UK 60s Music Bands',
  'Types of Pasta', 'Capital Cities', 'British Wildflowers', 'Musical Instruments',
  'Weather Phenomena', 'In the Kitchen', 'Shapes', 'Colors', 'Fruits',
  'Vegetables', 'British Woodland Wildlife', 'African Animals', 'Famous Artists',
  'Constellations', 'Types of Cheese', 'Classic Cars'
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onStartGame, error }) => {
  const [customTheme, setCustomTheme] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [displayedThemes, setDisplayedThemes] = useState<string[]>([]);

  const shuffleAndSelectThemes = useCallback(() => {
    const shuffled = [...ALL_PRESET_THEMES].sort(() => 0.5 - Math.random());
    setDisplayedThemes(shuffled.slice(0, 8));
  }, []);

  useEffect(() => {
    shuffleAndSelectThemes();
  }, [shuffleAndSelectThemes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTheme.trim()) {
      onStartGame(customTheme.trim());
    }
  };

  if (showCustomInput) {
    return (
       <div className="flex flex-col items-center text-center p-4 animate-fade-in">
        <button 
          onClick={() => setShowCustomInput(false)} 
          className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors mb-6 self-start"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to presets
        </button>
        <h2 className="text-2xl font-semibold text-slate-100">Enter a Custom Theme</h2>
        <p className="text-slate-400 mt-2 mb-6">Let your imagination run wild! The AI will try its best.</p>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : 'scale-100'}`}>
            <input
                type="text"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="e.g., Famous Inventors"
                className="w-full px-5 py-4 text-lg text-white bg-slate-700/50 border-2 border-slate-600 rounded-full focus:ring-4 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none transition-shadow duration-300"
                autoFocus
            />
            </div>
            <button
            type="submit"
            disabled={!customTheme.trim()}
            className="mt-6 w-full px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-full hover:scale-105 transform transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-sky-500/50 disabled:bg-slate-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:scale-100"
            >
            Generate Puzzles
            </button>
        </form>
         {error && (
            <div className="mt-6 flex items-center gap-3 bg-red-900/50 text-red-300 px-4 py-3 rounded-lg">
            <AlertTriangleIcon className="h-6 w-6" />
            <span>{error}</span>
            </div>
        )}
         <style>{`
            @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center p-4 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-2xl font-semibold text-slate-100">Choose a Puzzle Theme</h2>
        <button onClick={shuffleAndSelectThemes} className="text-slate-400 hover:text-sky-400 transition-colors" aria-label="Refresh themes">
            <RefreshIcon className="h-6 w-6" />
        </button>
      </div>
      <p className="text-slate-400 mb-8">Select a preset theme or create your own.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mb-6">
        {displayedThemes.map(theme => (
          <button
            key={theme}
            onClick={() => onStartGame(theme)}
            className="px-4 py-3 text-base font-semibold text-sky-200 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-sky-500/20 hover:border-sky-500 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            {theme}
          </button>
        ))}
      </div>
      <button
          onClick={() => setShowCustomInput(true)}
          className="w-full max-w-md px-4 py-3 text-base font-semibold text-amber-200 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-amber-500/20 hover:border-amber-500 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      >
          Create Your Own...
      </button>

       {error && (
         <div className="mt-8 flex items-center gap-3 bg-red-900/50 text-red-300 px-4 py-3 rounded-lg">
           <AlertTriangleIcon className="h-6 w-6" />
           <span>{error}</span>
         </div>
       )}

       <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
       `}</style>
    </div>
  );
};

export default ThemeSelector;
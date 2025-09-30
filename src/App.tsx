import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GameState, Puzzle } from './types';
import { generatePuzzles } from './services/geminiService';
import ThemeSelector from './components/ThemeSelector';
import PuzzleBoard from './components/PuzzleBoard';
import GameOver from './components/GameOver';
import { LoaderIcon } from './components/Icons';
import { playGameOverSound } from './components/sounds';

interface LifetimeStats {
  totalScore: number;
  games: number;
  average: number;
}

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [missedPuzzles, setMissedPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>('');
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>({ totalScore: 0, games: 0, average: 0 });

  useEffect(() => {
    try {
      const storedStats = localStorage.getItem('wordPuzzleAiStats');
      if (storedStats) {
        setLifetimeStats(JSON.parse(storedStats));
      }
    } catch (e) {
      console.error("Failed to parse lifetime stats from localStorage", e);
      localStorage.removeItem('wordPuzzleAiStats');
    }
  }, []);
  
  useEffect(() => {
    if (gameState === GameState.Finished) {
      playGameOverSound();
      
      setLifetimeStats(prevStats => {
        const newTotalScore = prevStats.totalScore + score;
        const newGamesPlayed = prevStats.games + 1;
        const newAverage = Math.round(newTotalScore / newGamesPlayed);
        const newStats = {
          totalScore: newTotalScore,
          games: newGamesPlayed,
          average: newAverage,
        };
        localStorage.setItem('wordPuzzleAiStats', JSON.stringify(newStats));
        return newStats;
      });
    }
  }, [gameState, score]);


  const handleStartGame = useCallback(async (selectedTheme: string) => {
    setGameState(GameState.Loading);
    setTheme(selectedTheme);
    setError(null);
    try {
      const newPuzzles = await generatePuzzles(selectedTheme);
      if (newPuzzles.length === 0) {
        throw new Error("The AI couldn't generate puzzles for this theme. Please try another.");
      }
      setPuzzles(newPuzzles);
      setCurrentPuzzleIndex(0);
      setScore(0);
      setMissedPuzzles([]);
      setGameState(GameState.Playing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setGameState(GameState.Idle);
    }
  }, []);

  const handleCorrectGuess = useCallback((points: number) => {
    setScore(prev => prev + points);
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      setGameState(GameState.Finished);
    }
  }, [currentPuzzleIndex, puzzles.length]);

  const handleTimeUp = useCallback(() => {
    setMissedPuzzles(prev => [...prev, puzzles[currentPuzzleIndex]]);
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      setGameState(GameState.Finished);
    }
  }, [currentPuzzleIndex, puzzles]);

  const handleRestart = useCallback(() => {
    setGameState(GameState.Idle);
    setPuzzles([]);
    setMissedPuzzles([]);
    setCurrentPuzzleIndex(0);
    setScore(0);
    setError(null);
    setTheme('');
  }, []);

  const currentPuzzle = useMemo(() => puzzles[currentPuzzleIndex], [puzzles, currentPuzzleIndex]);
  const totalPuzzles = useMemo(() => puzzles.length, [puzzles]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.Idle:
        return <ThemeSelector onStartGame={handleStartGame} error={error} />;
      case GameState.Loading:
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <LoaderIcon className="h-12 w-12 animate-spin text-sky-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300">Generating your custom puzzle...</h2>
            <p className="text-slate-400">The AI is thinking hard!</p>
          </div>
        );
      case GameState.Playing:
        return (
          <PuzzleBoard
            puzzle={currentPuzzle}
            onCorrectGuess={handleCorrectGuess}
            onTimeUp={handleTimeUp}
            puzzleNumber={currentPuzzleIndex + 1}
            totalPuzzles={totalPuzzles}
            score={score}
            theme={theme}
          />
        );
      case GameState.Finished:
        return <GameOver score={score} onRestart={handleRestart} missedPuzzles={missedPuzzles} lifetimeStats={lifetimeStats} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
            Word Puzzle AI
          </h1>
          <p className="text-slate-400 mt-2">Unscramble the words, powered by Gemini</p>
        </header>
        <main className="bg-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 p-6 md:p-8 transition-all duration-500">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>Built with React, Tailwind CSS, and the Google Gemini API.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
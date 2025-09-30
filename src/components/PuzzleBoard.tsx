import React, { useState, useEffect, useRef } from 'react';
import { Puzzle } from '../types';
import { LightbulbIcon, ShuffleIcon } from './Icons';
import { playCorrectSound, playIncorrectSound } from './sounds';

interface PuzzleBoardProps {
  puzzle: Puzzle;
  onCorrectGuess: (points: number) => void;
  onTimeUp: () => void;
  puzzleNumber: number;
  totalPuzzles: number;
  score: number;
  theme: string;
}

const PUZZLE_TIME_SECONDS = 30;
const HINT_PENALTY = 3;
const SUPER_HINT_PENALTY = 5; // This is the total penalty for using both hints

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ puzzle, onCorrectGuess, onTimeUp, puzzleNumber, totalPuzzles, score, theme }) => {
  const [userInput, setUserInput] = useState('');
  const [displayWord, setDisplayWord] = useState(puzzle.jumbledWord);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'none'>('none');
  const [hintLevel, setHintLevel] = useState(0); // 0: none, 1: text, 2: letters
  const [timeLeft, setTimeLeft] = useState(PUZZLE_TIME_SECONDS);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerId = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Reset state for new puzzle
    setUserInput('');
    setFeedback('none');
    setHintLevel(0);
    setTimeLeft(PUZZLE_TIME_SECONDS);
    setPointsEarned(null);
    setDisplayWord(puzzle.jumbledWord);

    // This is the new, more robust focus logic.
    // We use a short timeout to ensure the focus command runs after the browser has
    // finished rendering and the element is truly ready to be focused.
    const focusTimeoutId = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50); // 50ms is imperceptible but gives the browser time to settle.

    // Set up timer
    timerId.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(timerId.current);
      clearTimeout(focusTimeoutId); // Important: clean up the timeout too!
    };
  }, [puzzle, onTimeUp]);

  const getFeedbackClasses = () => {
    if (feedback === 'correct') {
      return 'border-green-500 ring-4 ring-green-500/50';
    }
    if (feedback === 'incorrect') {
      return 'border-red-500 ring-4 ring-red-500/50 animate-shake';
    }
    return 'border-slate-600 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/50';
  };
  
  const normalizeString = (str: string) => str.replace(/\s/g, '').toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (normalizeString(userInput) === normalizeString(puzzle.solution)) {
      clearInterval(timerId.current);
      setFeedback('correct');
      playCorrectSound();
      
      let points = 10 + timeLeft; // Base score + time bonus
      if (hintLevel === 2) {
        points -= SUPER_HINT_PENALTY;
      } else if (hintLevel === 1) {
        points -= HINT_PENALTY;
      }

      const finalPoints = Math.max(0, points);
      setPointsEarned(finalPoints);

      setTimeout(() => {
        onCorrectGuess(finalPoints);
      }, 1200);
    } else {
      setFeedback('incorrect');
      playIncorrectSound();
      // On incorrect guess, clear only the part the user typed
      if (hintLevel === 2) {
        const prefix = puzzle.solution.substring(0, 3);
        setUserInput(prefix);
      } else {
        setUserInput('');
      }
      setTimeout(() => setFeedback('none'), 500);
    }
  };
  
  const handleHintClick = () => {
    const newHintLevel = Math.min(hintLevel + 1, 2);
    setHintLevel(newHintLevel);
  
    if (newHintLevel === 2) {
      const prefix = puzzle.solution.substring(0, 3);
      setUserInput(prefix);
      // We use a timeout to ensure the input is focused and the cursor is placed after the state update has rendered.
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.selectionStart = inputRef.current.selectionEnd = prefix.length;
        }
      }, 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (hintLevel === 2) {
      const prefix = puzzle.solution.substring(0, 3);
      // Ensure the user cannot delete the revealed prefix
      if (!value.toLowerCase().startsWith(prefix.toLowerCase())) {
        value = prefix;
      }
    }
    setUserInput(value);
  };
  
  const shuffleString = (str: string): string => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  const handleShuffle = () => {
    let newShuffledWord;
    // Prevent shuffling into the solution or the same word again
    do {
      newShuffledWord = shuffleString(displayWord);
    } while (
      (displayWord.length > 1 && newShuffledWord === displayWord) ||
      normalizeString(newShuffledWord) === normalizeString(puzzle.solution)
    );
    setDisplayWord(newShuffledWord);
  };

  const timerColorClass = timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-300';
  const wordCountText = puzzle.wordCount > 1 ? `${puzzle.wordCount} words` : `1 word`;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full grid grid-cols-3 items-center mb-2 text-slate-300">
        <div className="font-bold text-lg">Score: <span className="text-sky-400">{score}</span></div>
        <div className={`font-mono font-bold text-xl text-center ${timerColorClass}`}>{timeLeft}s</div>
        <div className="font-semibold text-lg text-right">{`Word ${puzzleNumber}/${totalPuzzles}`}</div>
      </div>
      
      <div className="w-full text-center mb-4">
        <p className="text-sm text-slate-400">Theme:</p>
        <h2 className="text-xl font-semibold text-sky-300">{theme}</h2>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-lg w-full mb-6 text-center">
        <p className="text-lg font-medium text-slate-300 mb-3">Unscramble the word ({wordCountText}):</p>
        <div className="flex items-center justify-center gap-4">
            <div className="text-4xl font-bold tracking-[0.2em] text-amber-300 uppercase">
            {displayWord.split('').map((char, index) => <span key={index} className="inline-block ">{char}</span>)}
            </div>
            <button onClick={handleShuffle} className="text-slate-400 hover:text-sky-400 transition-colors" aria-label="Shuffle letters">
                <ShuffleIcon className="h-7 w-7" />
            </button>
        </div>
      </div>
      
      <div className="relative w-full max-w-md">
         {pointsEarned !== null && (
            <div className="pointer-events-none absolute inset-x-0 -top-8 flex justify-center text-green-400 text-3xl font-bold animate-points-pop">
                +{pointsEarned}
            </div>
         )}
        <form onSubmit={handleSubmit}>
            <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={feedback === 'correct'}
            className={`w-full px-5 py-4 text-center text-lg text-white bg-slate-700/50 border-2 rounded-full outline-none transition-all duration-300 ${getFeedbackClasses()}`}
            placeholder="Your guess..."
            />
            <button
            type="submit"
            disabled={!userInput.trim() || feedback === 'correct'}
            className="mt-4 w-full px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-full hover:scale-105 transform transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-sky-500/50 disabled:bg-slate-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:scale-100"
            >
            Submit
            </button>
        </form>
      </div>
      
      <div className="mt-6 text-center">
        <button 
          onClick={handleHintClick}
          disabled={hintLevel >= 2}
          className="flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
        >
          <LightbulbIcon className="h-5 w-5" />
          <span>
            {hintLevel === 0 && 'Show Hint (-3 pts)'}
            {hintLevel === 1 && 'Reveal Letters (-5 pts total)'}
            {hintLevel === 2 && 'All Hints Used'}
          </span>
        </button>
        {hintLevel > 0 && (
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg text-slate-300 animate-fade-in">
            <p>{puzzle.hint}</p>
          </div>
        )}
      </div>

       <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        @keyframes points-pop {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
        }
        .animate-points-pop { animation: points-pop 1.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PuzzleBoard;
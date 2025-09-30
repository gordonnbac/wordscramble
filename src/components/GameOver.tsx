import React from 'react';
import { Puzzle } from '../types';
import { TrophyIcon } from './Icons';

interface LifetimeStats {
  average: number;
  games: number;
}
interface GameOverProps {
  score: number;
  onRestart: () => void;
  missedPuzzles: Puzzle[];
  lifetimeStats: LifetimeStats;
}

const getSkillLevel = (score: number) => {
  if (score > 150) {
    return { title: 'Genius', color: 'text-violet-400' };
  }
  if (score > 100) {
    return { title: 'Excellent', color: 'text-green-400' };
  }
  if (score > 50) {
    return { title: 'Good', color: 'text-sky-400' };
  }
  return { title: 'Keep Trying', color: 'text-amber-400' };
};

const GameOver: React.FC<GameOverProps> = ({ score, onRestart, missedPuzzles, lifetimeStats }) => {
  const currentSkill = getSkillLevel(score);
  const overallSkill = getSkillLevel(lifetimeStats.average);

  return (
    <div className="flex flex-col items-center text-center p-4 sm:p-8">
      <TrophyIcon className="h-20 w-20 text-amber-400 mb-4"/>
      <h2 className="text-3xl font-bold text-slate-100">Puzzle Complete!</h2>
      <p className="text-slate-300 mt-2 text-lg">Your final score is:</p>
      <p className="text-6xl font-bold text-sky-400 my-2">{score}</p>
      <p className={`text-2xl font-semibold ${currentSkill.color}`}>{currentSkill.title}</p>
      
      {lifetimeStats && lifetimeStats.games > 0 && (
        <div className="mt-8 w-full max-w-md bg-slate-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-300">Lifetime Stats</h3>
          <div className="flex justify-around mt-2 text-slate-400">
            <div>
              <p className="text-sm">Games Played</p>
              <p className="text-xl font-bold text-white">{lifetimeStats.games}</p>
            </div>
            <div>
              <p className="text-sm">Average Score</p>
              <p className="text-xl font-bold text-white">{lifetimeStats.average}</p>
            </div>
             <div>
              <p className="text-sm">Overall Skill</p>
              <p className={`text-xl font-bold ${overallSkill.color}`}>{overallSkill.title}</p>
            </div>
          </div>
        </div>
      )}

      {missedPuzzles.length > 0 && (
        <div className="mt-8 w-full max-w-md">
          <h3 className="text-xl font-semibold text-slate-300">Words you missed:</h3>
          <ul className="mt-3 space-y-2 text-slate-400">
            {missedPuzzles.map((puzzle) => (
              <li key={puzzle.solution} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center text-left">
                <div>
                    <p className="text-sm text-slate-500">Jumbled</p>
                    <p className="font-mono font-bold text-amber-300 uppercase tracking-wider">{puzzle.jumbledWord}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500 text-right">Solution</p>
                    <p className="font-mono font-semibold text-green-300 uppercase tracking-wider">{puzzle.solution}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onRestart}
        className="mt-8 w-full max-w-xs px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full hover:scale-105 transform transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50"
      >
        Play Again
      </button>
    </div>
  );
};

export default GameOver;
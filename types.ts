export enum GameState {
  Idle = 'idle',
  Loading = 'loading',
  Playing = 'playing',
  Finished = 'finished',
}

export interface Puzzle {
  jumbledWord: string;
  solution: string;
  hint: string;
  wordCount: number;
}
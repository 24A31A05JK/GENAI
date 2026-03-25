/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Trophy, RotateCcw, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track, Direction, Point, GameState } from './types';

const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Pulse',
    artist: 'Cyber Synth',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://picsum.photos/seed/neon1/400/400'
  },
  {
    id: '2',
    title: 'Digital Rain',
    artist: 'Matrix Flow',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://picsum.photos/seed/neon2/400/400'
  },
  {
    id: '3',
    title: 'Midnight Grid',
    artist: 'Retro Wave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://picsum.photos/seed/neon3/400/400'
  }
];

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 }
];
const INITIAL_DIRECTION: Direction = 'UP';

export default function App() {
  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Snake Game State ---
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: { x: 5, y: 5 },
    direction: INITIAL_DIRECTION,
    score: 0,
    isGameOver: false,
    isPaused: true
  });
  const [highScore, setHighScore] = useState(0);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  // --- Snake Game Logic ---
  const generateFood = useCallback((snake: Point[]): Point => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const onSnake = snake.some(p => p.x === newFood.x && p.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: generateFood(INITIAL_SNAKE),
      direction: INITIAL_DIRECTION,
      score: 0,
      isGameOver: false,
      isPaused: false
    });
  };

  const moveSnake = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    setGameState(prev => {
      const head = prev.snake[0];
      const newHead = { ...head };

      switch (prev.direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collisions
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prev.snake.some(p => p.x === newHead.x && p.y === newHead.y)
      ) {
        if (prev.score > highScore) setHighScore(prev.score);
        return { ...prev, isGameOver: true };
      }

      const newSnake = [newHead, ...prev.snake];
      let newScore = prev.score;
      let newFood = prev.food;

      // Check food
      if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
        newScore += 10;
        newFood = generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        score: newScore
      };
    });
  }, [gameState.isGameOver, gameState.isPaused, generateFood, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (gameState.direction !== 'DOWN') setGameState(s => ({ ...s, direction: 'UP' })); break;
        case 'ArrowDown': if (gameState.direction !== 'UP') setGameState(s => ({ ...s, direction: 'DOWN' })); break;
        case 'ArrowLeft': if (gameState.direction !== 'RIGHT') setGameState(s => ({ ...s, direction: 'LEFT' })); break;
        case 'ArrowRight': if (gameState.direction !== 'LEFT') setGameState(s => ({ ...s, direction: 'RIGHT' })); break;
        case ' ': setGameState(s => ({ ...s, isPaused: !s.isPaused })); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [moveSnake]);

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/10 backdrop-blur-md bg-black/20 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Music className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter italic">NEON RHYTHM</h1>
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">High Score</span>
            <span className="text-xl font-mono text-cyan-400">{highScore}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Current Score</span>
            <span className="text-xl font-mono text-purple-400">{gameState.score}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 items-center justify-center overflow-hidden">
        {/* Music Player Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-80 flex flex-col gap-6"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#111] rounded-2xl p-4 border border-white/5">
              <motion.img 
                key={currentTrack.cover}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={currentTrack.cover} 
                alt={currentTrack.title}
                className="w-full aspect-square object-cover rounded-xl mb-4 shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">{currentTrack.title}</h2>
                <p className="text-white/50 text-sm">{currentTrack.artist}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: isPlaying ? "100%" : "0%" }}
                    transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <button 
                    onClick={prevTrack} 
                    className="p-2 text-cyan-400 hover:text-cyan-300 transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                  >
                    <SkipBack size={24} fill="currentColor" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)]"
                  >
                    {isPlaying ? <Pause fill="black" size={28} /> : <Play fill="black" size={28} className="ml-1" />}
                  </button>
                  <button 
                    onClick={nextTrack} 
                    className="p-2 text-cyan-400 hover:text-cyan-300 transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                  >
                    <SkipForward size={24} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111] rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-bold">
              <Volume2 size={14} />
              <span>Playlist</span>
            </div>
            <div className="space-y-2">
              {TRACKS.map((track, idx) => (
                <button 
                  key={track.id}
                  onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${idx === currentTrackIndex ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/5'}`}
                >
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium leading-none">{track.title}</div>
                    <div className="text-[10px] opacity-50 mt-1">{track.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Game Center */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-cyan-500/10 rounded-3xl blur-3xl"></div>
            
            {/* Game Board */}
            <div 
              className="relative bg-[#0a0a0a] border-2 border-white/10 rounded-xl shadow-2xl overflow-hidden"
              style={{ 
                width: 'min(80vw, 500px)', 
                height: 'min(80vw, 500px)',
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
              }}
            >
              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 pointer-events-none opacity-5">
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white"></div>
                ))}
              </div>

              {/* Food */}
              <motion.div 
                layoutId="food"
                className="bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] z-10"
                style={{ 
                  gridColumnStart: gameState.food.x + 1,
                  gridRowStart: gameState.food.y + 1
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />

              {/* Snake */}
              {gameState.snake.map((segment, i) => (
                <div 
                  key={`${i}-${segment.x}-${segment.y}`}
                  className={`rounded-sm ${i === 0 ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20' : 'bg-cyan-600/80'}`}
                  style={{ 
                    gridColumnStart: segment.x + 1,
                    gridRowStart: segment.y + 1
                  }}
                />
              ))}

              {/* Overlays */}
              <AnimatePresence>
                {gameState.isGameOver && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-8 text-center"
                  >
                    <Trophy className="text-yellow-500 w-16 h-16 mb-4" />
                    <h2 className="text-4xl font-black italic tracking-tighter mb-2">GAME OVER</h2>
                    <p className="text-white/60 mb-8">You hit the wall of reality. Score: {gameState.score}</p>
                    <button 
                      onClick={resetGame}
                      className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-full hover:bg-cyan-400 transition-all flex items-center gap-2 group"
                    >
                      <RotateCcw className="group-hover:rotate-180 transition-transform duration-500" />
                      TRY AGAIN
                    </button>
                  </motion.div>
                )}

                {gameState.isPaused && !gameState.isGameOver && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-30"
                  >
                    <div className="bg-black/80 border border-white/10 p-6 rounded-2xl text-center">
                      <h2 className="text-2xl font-bold mb-4">READY?</h2>
                      <p className="text-white/40 text-sm mb-6">Use arrow keys to move<br/>Space to pause/resume</p>
                      <button 
                        onClick={() => setGameState(s => ({ ...s, isPaused: false }))}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-all"
                      >
                        START GAME
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Instructions / Stats Side */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden xl:flex w-80 flex-col gap-6"
        >
          <div className="bg-[#111] rounded-2xl p-6 border border-white/5 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">How to Play</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono">↑</div>
                <span className="text-sm text-white/70">Move Up</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono">↓</div>
                <span className="text-sm text-white/70">Move Down</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono">←</div>
                <span className="text-sm text-white/70">Move Left</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono">→</div>
                <span className="text-sm text-white/70">Move Right</span>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="px-3 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono">SPACE</div>
                  <span className="text-sm text-white/70">Pause / Resume</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={80} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Pro Tip</h3>
            <p className="text-sm text-white/80 leading-relaxed relative z-10">
              Listen to the rhythm. The snake moves at 150ms intervals. Sync your moves to the beat for maximum flow state.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onEnded={nextTrack}
      />

      {/* Footer / Mobile Controls */}
      <footer className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md lg:hidden">
        <div className="flex justify-around items-center">
          <button onClick={() => setGameState(s => ({ ...s, direction: 'LEFT' }))} className="p-4 bg-white/5 rounded-xl">←</button>
          <div className="flex flex-col gap-2">
            <button onClick={() => setGameState(s => ({ ...s, direction: 'UP' }))} className="p-4 bg-white/5 rounded-xl">↑</button>
            <button onClick={() => setGameState(s => ({ ...s, direction: 'DOWN' }))} className="p-4 bg-white/5 rounded-xl">↓</button>
          </div>
          <button onClick={() => setGameState(s => ({ ...s, direction: 'RIGHT' }))} className="p-4 bg-white/5 rounded-xl">→</button>
        </div>
      </footer>
    </div>
  );
}

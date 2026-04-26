import { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  let isOccupied = true;
  while (isOccupied) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    isOccupied = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
  }
  return newFood!;
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('UP');
  const [nextDirection, setNextDirection] = useState<Direction>('UP');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);

  const requestRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection('UP');
    setNextDirection('UP');
    setIsGameOver(false);
    setIsStarted(true);
    setScore(0);
    setFood(generateFood(INITIAL_SNAKE));
    lastUpdateRef.current = performance.now();
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key) && direction !== 'DOWN') {
        setNextDirection('UP');
      } else if (['ArrowDown', 's', 'S'].includes(e.key) && direction !== 'UP') {
        setNextDirection('DOWN');
      } else if (['ArrowLeft', 'a', 'A'].includes(e.key) && direction !== 'RIGHT') {
        setNextDirection('LEFT');
      } else if (['ArrowRight', 'd', 'D'].includes(e.key) && direction !== 'LEFT') {
        setNextDirection('RIGHT');
      } else if (e.key === ' ' && (!isStarted || isGameOver)) {
        resetGame();
      }
    },
    [direction, isStarted, isGameOver]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const gameLoop = useCallback(
    (time: number) => {
      if (!isStarted || isGameOver) return;

      const currentSpeed = Math.max(INITIAL_SPEED - Math.floor(score / 5) * 10, 50);

      if (time - lastUpdateRef.current > currentSpeed) {
        setSnake((prevSnake) => {
          const newSnake = [...prevSnake];
          const head = { ...newSnake[0] };
          
          setDirection(nextDirection);

          switch (nextDirection) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
          }

          // Check collisions
          if (
            head.x < 0 || head.x >= GRID_SIZE ||
            head.y < 0 || head.y >= GRID_SIZE ||
            newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
          ) {
            setIsGameOver(true);
            return prevSnake;
          }

          newSnake.unshift(head);

          // Check food
          if (head.x === food.x && head.y === food.y) {
            setScore((s) => s + 10);
            setFood(generateFood(newSnake));
          } else {
            newSnake.pop();
          }

          return newSnake;
        });

        lastUpdateRef.current = time;
      }
      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [isStarted, isGameOver, nextDirection, food, score]
  );

  useEffect(() => {
    if (isStarted && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isStarted, isGameOver, gameLoop]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid (Neon Style)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }

    // Draw Food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#d946ef'; // fuchsia-500
    ctx.fillStyle = '#f0abfc'; // fuchsia-300
    ctx.beginPath();
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Snake
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#22d3ee'; // cyan-400
    ctx.fillStyle = '#67e8f9'; // cyan-300
    snake.forEach((segment, index) => {
      if (index === 0) {
          ctx.fillStyle = '#cffafe'; // brighter head
      } else {
          ctx.fillStyle = '#22d3ee';
      }
      // slight padding so it looks like discrete blocks
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    
    ctx.shadowBlur = 0; // reset

  }, [snake, food]);

  return (
    <div className="flex flex-col items-center">
      {/* Score Header */}
      <div className="w-full max-w-[400px] flex justify-between items-center mb-4 px-4 py-2 bg-black/40 border border-cyan-500/30 rounded-lg shadow-[0_0_10px_rgba(34,211,238,0.1)]">
        <div className="text-cyan-400 font-mono text-sm uppercase tracking-widest">Score</div>
        <div className="text-fuchsia-400 font-mono text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">
          {score.toString().padStart(4, '0')}
        </div>
      </div>

      {/* Game Board */}
      <div className="relative p-1 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.2)] pb-2 flex-shrink-0 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black rounded-lg block max-w-full h-auto aspect-square"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        />

        {/* Overlays */}
        {(!isStarted || isGameOver) && (
          <div className="absolute inset-x-2 inset-y-2 bg-black/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-6 text-center border border-fuchsia-500/20 z-10 transition-all">
            {isGameOver && (
              <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-red-500 mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] tracking-tight">
                GAME OVER
              </h2>
            )}
            {!isGameOver && !isStarted && (
               <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                 NEON SNAKE
               </h2>
            )}
            
            <p className="text-cyan-300/80 mb-8 font-mono text-xs sm:text-sm uppercase tracking-widest">
              {isGameOver ? `Final Score: ${score}` : 'Use arrows or WASD to move'}
            </p>
            
            <button
              onClick={resetGame}
              className="bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest py-3 px-8 rounded-full hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] active:scale-95"
            >
              {isGameOver ? 'Play Again' : 'Start Engine'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

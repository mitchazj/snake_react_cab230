import React, { useState, useEffect, useMemo } from "react";

const FRAME_STEP = 100; // 100ms

const COLORS = {
  snake: "#08a3ef",
  food: "#efa8b1",
  background: (i) => (i % 2 ? "#f8f8f8" : "#fefefe"),
};

const DEFAULT_KEY_STATE = {
  leftKeyDown: 0,
  rightKeyDown: 1,
  upKeyDown: 0,
  downKeyDown: 0,
};

const SQUARE_SIZE_PX = 48;

const GAME_WIDTH = 11;
const GAME_HEIGHT = 11;

const toPx = (n) => `${n}px`;

const squares = [...new Array(GAME_WIDTH * GAME_HEIGHT)].map((x) => 0);

function useFrameTime() {
  const [frameTime, setFrameTime] = useState(null);
  useEffect(() => {
    let frameId;
    const frame = (time) => {
      setFrameTime(time);
      frameId = requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);
  return frameTime;
}

function useGameState(horizontalMovement, verticalMovement) {
  // Game loop
  const frameTime = useFrameTime();
  const [lastSnakeUpdate, setLastSnakeUpdate] = useState(0);

  // the location of the food
  const [food, setFood] = useState({ x: 0, y: 0 });

  // an array of { x, y } points
  const [snake, setSnake] = useState([
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 5, y: 3 },
    { x: 6, y: 3 },
  ]);

  // convert an index to an { x, y } snake point
  const toSnakePoint = (i) => ({
    x: i % GAME_WIDTH,
    y: Math.floor(i / GAME_WIDTH),
  });

  // add a point to the snake
  const makeSnakePoint = ({ x, y }) => {
    if (!isSnake({ x, y })) {
      setSnake((s) => [...s, { x, y }]);
    }
  };

  // returns true if the index i is a snake point
  const isSnake = ({ x, y }) => snake.findIndex((p) => p.x === x && p.y === y) !== -1;
  const isSnakeByIndex = (i) => isSnake(toSnakePoint(i));
  const isFoodByIndex = (i) => {
    const i_xy = toSnakePoint(i);
    return i_xy.x === food.x && i_xy.y === food.y;
  };

  const moveSnake = () => {
    if (horizontalMovement - verticalMovement != 0) {
      let { x, y } = snake[snake.length - 1];
      x += horizontalMovement;
      y += -verticalMovement;
      if (x >= GAME_WIDTH) x = 0;
      if (x < 0) x = GAME_WIDTH - 1;
      if (y >= GAME_HEIGHT) y = 0;
      if (y < 0) y = GAME_HEIGHT - 1;
      snake.push({ x, y });
      // check if it collided with the food
      if (x !== food.x || y !== food.y) {
        snake.shift();
      } else {
        // we collided! place new food
        setFood({
          x: Math.floor(Math.random() * GAME_WIDTH),
          y: Math.floor(Math.random() * GAME_HEIGHT),
        });
      }
      setSnake(snake);
    }
    setLastSnakeUpdate(performance.now());
  };

  useEffect(() => {
    if (frameTime - lastSnakeUpdate > FRAME_STEP) moveSnake();
  }, [frameTime, horizontalMovement, verticalMovement]);

  return {
    isSnake,
    isSnakeByIndex,
    isFoodByIndex,
  };
}

function useKeyboardMovement() {
  const [keyboardState, setKeyboardState] = useState(DEFAULT_KEY_STATE);

  const handleKeyEventWithValue = (e, val) => {
    switch (e.code) {
      case "ArrowUp":
        if (keyboardState.upKeyDown !== val)
          setKeyboardState((s) => ({
            leftKeyDown: 0,
            rightKeyDown: 0,
            upKeyDown: val,
            downKeyDown: 0,
          }));
        return;
      case "ArrowDown":
        if (keyboardState.downKeyDown !== val)
          setKeyboardState((s) => ({
            leftKeyDown: 0,
            rightKeyDown: 0,
            upKeyDown: 0,
            downKeyDown: val,
          }));
        return;
      case "ArrowLeft":
        if (keyboardState.leftKeyDown !== val)
          setKeyboardState((s) => ({
            leftKeyDown: val,
            rightKeyDown: 0,
            upKeyDown: 0,
            downKeyDown: 0,
          }));
        return;
      case "ArrowRight":
        if (keyboardState.rightKeyDown !== val)
          setKeyboardState((s) => ({
            leftKeyDown: 0,
            rightKeyDown: val,
            upKeyDown: 0,
            downKeyDown: 0,
          }));
        return;
      default:
        return;
    }
  };

  const onKeyDown = (e) => {
    handleKeyEventWithValue(e, 1);
  };

  const onKeyUp = (e) => {};

  const verticalMovement = keyboardState.upKeyDown - keyboardState.downKeyDown;
  const horizontalMovement = keyboardState.rightKeyDown - keyboardState.leftKeyDown;

  return {
    verticalMovement,
    horizontalMovement,
    onKeyDown,
    onKeyUp,
  };
}

function GameSquare({ game, index }) {
  const computedStyles = {
    display: "block",
    width: toPx(SQUARE_SIZE_PX),
    height: toPx(SQUARE_SIZE_PX),
    backgroundColor: game.isSnakeByIndex(index)
      ? COLORS.snake
      : game.isFoodByIndex(index)
      ? COLORS.food
      : COLORS.background(index),
  };
  return <div style={computedStyles} className="flex-none"></div>;
}

function GameBoard() {
  const { horizontalMovement, verticalMovement, onKeyDown, onKeyUp } = useKeyboardMovement();
  const gameState = useGameState(horizontalMovement, verticalMovement);

  return (
    <div
      tabIndex={0}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      className="flex flex-wrap outline-none"
      style={{ width: toPx(SQUARE_SIZE_PX * GAME_WIDTH) }}
    >
      {squares.map((_, i) => (
        <GameSquare game={gameState} index={i} key={i} />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="bg-gray-800 min-h-screen flex items-center justify-center">
      <GameBoard />
    </div>
  );
}

// facebook profile (primarily CSS)
// tinder swipe (mix of CSS and React)
// snake from scratch (hard yikes)

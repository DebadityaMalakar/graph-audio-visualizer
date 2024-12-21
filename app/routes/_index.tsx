import { MetaFunction } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import * as Tone from "tone";

export const meta: MetaFunction = () => {
  return [
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
    { title: "Home" },
  ];
};

export default function Index() {
  const [fxExpression, setFxExpression] = useState<string>("Math.sin(x)");
  const [lowerLimit, setLowerLimit] = useState<number>(-10);
  const [upperLimit, setUpperLimit] = useState<number>(10);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [synth, setSynth] = useState<Tone.Synth | null>(null);
  const [lastPosition, setLastPosition] = useState<number | null>(null);
  const audioRef = useRef<boolean>(false);

  useEffect(() => {
    // Check if dark mode is in localStorage and apply
    const darkModeSetting = localStorage.getItem("dark-mode");
    if (darkModeSetting) {
      setIsDarkMode(darkModeSetting === "true");
      if (darkModeSetting === "true") {
        document.documentElement.classList.add("dark");
      }
    } else {
      // Default to system dark mode if no setting is found
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    }

    // Initialize Tone.js Synth
    const toneSynth = new Tone.Synth().toDestination();
    setSynth(toneSynth);

    return () => {
      if (synth) {
        synth.dispose();
      }
    };
  }, []);

  const handleDarkModeToggle = () => {
    setIsDarkMode((prev) => {
      const newDarkMode = !prev;
      localStorage.setItem("dark-mode", newDarkMode.toString());
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newDarkMode;
    });
  };

  const evaluateFx = (x: number): number => {
    if (fxExpression.toLowerCase() === "collatz") {
      return x % 2 === 0 ? x / 2 : 3 * x + 1;
    }
    try {
      return eval(fxExpression.replace(/x/g, `(${x})`));
    } catch (error) {
      console.error("Invalid function expression:", error);
      return 0;
    }
  };

  const getScaleFactor = (value: number): number => {
    const absValue = Math.abs(value);
    if (absValue > 50000) return 1000;
    if (absValue > 5000) return 100;
    if (absValue > 500) return 10;
    return 1;
  };

  const generateGraph = () => {
    const canvas = document.getElementById("fx-graph") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get scale factor based on limits
    const scaleFactor = Math.max(
      getScaleFactor(lowerLimit),
      getScaleFactor(upperLimit)
    );

    const adjustedLowerLimit = lowerLimit / scaleFactor;
    const adjustedUpperLimit = upperLimit / scaleFactor;

    // Graph settings
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const padding = 40; // Padding for axis labels

    // Calculate the range of y values
    let minY = Infinity;
    let maxY = -Infinity;
    for (let x = adjustedLowerLimit; x <= adjustedUpperLimit; x += 0.1) {
      const y = evaluateFx(x * scaleFactor) / scaleFactor;
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    // Dynamically scale Y-axis
    const yScaleFactor = Math.max(1, Math.abs(maxY), Math.abs(minY));

    // Draw axes
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw graph
    ctx.beginPath();
    for (let x = adjustedLowerLimit; x <= adjustedUpperLimit; x += 0.1) {
      const y = evaluateFx(x * scaleFactor) / scaleFactor;
      const canvasX = centerX + (x * width) / (2 * adjustedUpperLimit);
      const canvasY = centerY - (y * height) / (2 * yScaleFactor);

      if (x === adjustedLowerLimit) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();
  };

  const playAudio = async () => {
    if (audioPlaying || !synth) return;
    
    try {
      // Ensure audio context is started
      await Tone.start();
      
      setAudioPlaying(true);
      audioRef.current = true;

      // Get scale factor for audio playback
      const scaleFactor = Math.max(
        getScaleFactor(lowerLimit),
        getScaleFactor(upperLimit)
      );

      const adjustedLowerLimit = lowerLimit / scaleFactor;
      const adjustedUpperLimit = upperLimit / scaleFactor;

      // Start from lastPosition if it exists, otherwise start from lower limit
      let startPosition = lastPosition !== null ? lastPosition : adjustedLowerLimit;
      
      // Ensure startPosition is within current bounds
      startPosition = Math.max(adjustedLowerLimit, Math.min(startPosition, adjustedUpperLimit));

      for (let x = startPosition; x <= adjustedUpperLimit && audioRef.current; x++) {
        const y = evaluateFx(x);
        synth.triggerAttackRelease((y % 20) + 60, "8n");
        setLastPosition(x); // Update last position as we play
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // If we reached the end, reset lastPosition
      if (!audioRef.current) {
        setLastPosition(startPosition);
      } else {
        setLastPosition(null); // Reset if we completed the sequence
      }
      
      setAudioPlaying(false);
      audioRef.current = false;
    } catch (error) {
      console.error("Error during audio playback:", error);
      setAudioPlaying(false);
      audioRef.current = false;
    }
  };

  const stopAudio = () => {
    audioRef.current = false;
    setAudioPlaying(false);
    if (synth) {
      synth.triggerRelease();
    }
    // Don't reset lastPosition here - keep it for resume functionality
  };

  const resetAudio = () => {
    stopAudio();
    setLastPosition(null); // Reset the last position
    setFxExpression("Math.sin(x)");
    setLowerLimit(-10);
    setUpperLimit(10);
    setTimeout(generateGraph, 0);
  };

  const handleFxExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExpression = e.target.value;
    setFxExpression(newExpression);

    if (newExpression.toLowerCase() === "collatz") {
      setLowerLimit(0);
      setUpperLimit(100);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-8 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className="absolute top-4 right-4">
        <button
          onClick={handleDarkModeToggle}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">F(x) Graph and Audio Visualizer</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          generateGraph();
        }}
        className="flex flex-col gap-4 w-full sm:w-full md:w-3/4 lg:w-1/2"
      >
        <div>
          <label htmlFor="fx-expression" className="block font-semibold mb-2">
            Enter f(x):
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Define a mathematical function of x (e.g., <code>x * x</code>, <code>3 * x + 1</code>, <code>Math.sin(x)</code>).
          </p>
          <input
            type="text"
            id="fx-expression"
            value={fxExpression}
            onChange={handleFxExpressionChange}
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <div>
            <label htmlFor="lower-limit" className="block font-semibold">Lower Limit:</label>
            <input
              type="number"
              id="lower-limit"
              value={lowerLimit}
              onChange={(e) => {
                setLowerLimit(Number(e.target.value));
              }}
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="upper-limit" className="block font-semibold">Upper Limit:</label>
            <input
              type="number"
              id="upper-limit"
              value={upperLimit}
              onChange={(e) => {
                setUpperLimit(Number(e.target.value));
              }}
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={generateGraph}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
        >
          Generate Graph
        </button>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={playAudio}
            disabled={audioPlaying}
            className="w-1/2 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none disabled:opacity-50"
          >
            Play Audio
          </button>
          <button
            type="button"
            onClick={stopAudio}
            disabled={!audioPlaying}
            className="w-1/2 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none disabled:opacity-50"
          >
            Stop Audio
          </button>
        </div>
      </form>

      <div className="mt-4 flex justify-center w-full sm:w-1/2 lg:w-3/4 xl:w-2/3">
        <button
          onClick={resetAudio}
          className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Reset
        </button>
      </div>

      <div className="mt-8 w-full sm:w-1/2 lg:w-3/4 xl:w-2/3">
        <canvas
          id="fx-graph"
          width={700}
          height={400}
          className="border dark:border-gray-700 rounded-lg shadow-lg mx-auto"
        />
      </div>
    </div>
  );
}
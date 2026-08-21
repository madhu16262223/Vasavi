import React, { useState, useEffect, useRef } from 'react';

/**
 * HeroFrameAnimation Component (Champagne Gold & Ivory Theme)
 * 
 * Clean 3D Visual Engine
 * - Zero edge cropping: 100% full view of the video including Vasavi logo text
 * - Cleaned of all watermarks across all 465 WebP frames
 * - Zero floating pills or extra overlays as requested by client
 * - Fast interactive mouse frame scrubbing
 */
export const HeroFrameAnimation = ({
  totalFrames = 444,
  fps = 24
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const framesCacheRef = useRef({});
  const animFrameIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const currentFrameRef = useRef(1);
  const lastMouseXRef = useRef(0);

  const getFrameUrl = (index) => {
    const padIndex = String(index).padStart(4, '0');
    return `/hero/frame-${padIndex}.webp`;
  };

  useEffect(() => {
    let isCancelled = false;
    framesCacheRef.current = {};

    const initialBatchSize = 30;
    let initialLoadedCount = 0;

    for (let i = 1; i <= initialBatchSize; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        if (isCancelled) return;
        framesCacheRef.current[i] = img;
        initialLoadedCount++;
        if (initialLoadedCount >= Math.min(10, initialBatchSize)) {
          setIsLoaded(true);
        }
      };
    }

    const loadRemainingFrames = async () => {
      for (let i = initialBatchSize + 1; i <= totalFrames; i++) {
        if (isCancelled) break;
        if (!framesCacheRef.current[i]) {
          const img = new Image();
          img.src = getFrameUrl(i);
          img.onload = () => {
            if (!isCancelled) {
              framesCacheRef.current[i] = img;
            }
          };
          if (i % 15 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 15));
          }
        }
      }
    };

    loadRemainingFrames();

    return () => {
      isCancelled = true;
    };
  }, [totalFrames]);

  const drawFrame = (frameNum) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cachedImg = framesCacheRef.current[frameNum];
    if (cachedImg && cachedImg.complete && cachedImg.naturalWidth !== 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cachedImg, 0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const frameInterval = 1000 / fps;

    const renderLoop = (timestamp) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);

        let nextFrame = currentFrameRef.current + 1;
        if (nextFrame > totalFrames) {
          nextFrame = 1;
        }
        currentFrameRef.current = nextFrame;
        setCurrentFrameIndex(nextFrame);
        drawFrame(nextFrame);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [fps, totalFrames]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetFrame = Math.max(1, Math.min(totalFrames, Math.floor(x * (totalFrames - 1)) + 1));
    currentFrameRef.current = targetFrame;
    setCurrentFrameIndex(targetFrame);
    drawFrame(targetFrame);
  };

  const currentPosterUrl = getFrameUrl(currentFrameIndex);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-black border-2 border-[#c99632]/40 shadow-2xl gold-glow cursor-default"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[#c99632]/10 via-transparent to-[#e8c7b5]/20 pointer-events-none z-10" />

      {/* Canvas Frame Renderer - interactive scrub & continuous playback */}
      <canvas
        ref={canvasRef}
        width={1080}
        height={608}
        className="w-full h-full object-cover object-center rounded-2xl sm:rounded-3xl bg-black pointer-events-none"
      />

      {/* Fallback Poster Image */}
      <img
        src={currentPosterUrl}
        alt="Vasavi Luxury Collection Showcase"
        className={`absolute inset-0 w-full h-full object-cover object-center rounded-2xl sm:rounded-3xl pointer-events-none transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none z-10 rounded-2xl sm:rounded-3xl" />
    </div>
  );
};

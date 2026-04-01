"use client";
import React, { useEffect, useRef, useState, FC, ReactElement } from "react";
import Link from "next/link";

const AnimatedBanner: FC = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    // Check if md breakpoint (min-width: 768px) is met
    const checkIsDesktop = (): void => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const totalFrames = 179;
    const frameBaseUrl = "/animated-banner/ezgif-frame-";
    const images: HTMLImageElement[] = [];

    // Preload frames
    for (let i = 1; i <= totalFrames; i++) {
      const img = new window.Image();
      const frameNumber = i.toString().padStart(3, "0");
      img.src = `${frameBaseUrl}${frameNumber}.jpg`;
      images.push(img);
    }

    let currentFrame = 0;
    let direction = 1;
    let animationFrameId: number;
    let lastTime = performance.now();
    // Maintain original fluid physics, 30fps is standard for sequences
    const fps = 30;
    const frameInterval = 1000 / fps;

    const drawFrame = (img: HTMLImageElement) => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const containerRatio = width / height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      // Cover logic equivalent to object-fit: cover
      if (containerRatio > imgRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (images[currentFrame] && images[currentFrame].complete) {
        drawFrame(images[currentFrame]);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const render = (time: DOMHighResTimeStamp) => {
      const deltaTime = time - lastTime;

      if (deltaTime >= frameInterval) {
        const currentImg = images[currentFrame];
        if (currentImg && currentImg.complete) {
          drawFrame(currentImg);
        }

        // Always update frame to keep time flow (ping-pong loop)
        currentFrame += direction;
        if (currentFrame >= totalFrames - 1) {
          currentFrame = totalFrames - 1;
          direction = -1; // reverse
        } else if (currentFrame <= 0) {
          currentFrame = 0;
          direction = 1; // forward
        }

        lastTime = time - (deltaTime % frameInterval);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Initial draw to prevent flicker while waiting for requestAnimationFrame loop
    if (images[0].complete) {
      drawFrame(images[0]);
    } else {
      images[0].onload = () => drawFrame(images[0]);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isDesktop]);

  return (
    <div
      ref={containerRef}
      className="call-to-action relative w-full h-[600px] md:max-h-500 flex items-baseline grid-cols-1 flex-col justify-start pt-32 md:justify-center md:pt-10 rounded-md p-10 overflow-hidden bg-[url(/banner-mobile.jpg)] bg-cover md:bg-none"
    >
      {/* Static Fallback for Desktop */}
      <div className="hidden md:block absolute inset-0 bg-[url(/BANNER-1.jpg)] bg-cover bg-center z-0" />

      {/* Canvas for Desktop Animated Banner */}
      {isDesktop && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 pointer-events-none"
        />
      )}

      {/* Overlay to ensure readability if required, preserving original styles */}
      <div className="relative z-20 flex flex-col items-baseline justify-start md:justify-center h-full max-h-500">
        <h1 className="font-italiana text-5xl py-4">Diseño funcional que emociona</h1>
        <Link href="/productos" className="bg-black text-white py-2 px-4 hover:opacity-80 transition-opacity">
          Ver más
        </Link>
      </div>
    </div>
  );
};

export default AnimatedBanner;

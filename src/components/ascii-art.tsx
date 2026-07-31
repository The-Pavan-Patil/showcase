"use client";

import { useEffect, useRef } from "react";

const STANDARD_CHARSET = " .,:;i1tfLCG08@";

type AsciiArtProps = {
  className?: string;
  resolution?: number;
  src: string;
};

/** Renders a local image as a responsive ASCII canvas. */
export function AsciiArt({
  className,
  resolution = 68,
  src,
}: AsciiArtProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = new window.Image();
    let animationFrame = 0;

    const render = () => {
      if (!image.complete || !image.naturalWidth) return;

      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      const context = canvas.getContext("2d");
      if (!context) return;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const columns = Math.max(30, Math.min(resolution, Math.floor(width / 4.8)));
      const rows = Math.max(16, Math.round((columns * height) / width / 1.85));
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = columns;
      sampleCanvas.height = rows;
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleContext) return;

      sampleContext.drawImage(image, 0, 0, columns, rows);
      const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
      const fontSize = height / rows;
      const cellWidth = width / columns;
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue("--foreground")
        .trim();

      context.fillStyle = color;
      context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context.textBaseline = "top";

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const offset = (row * columns + column) * 4;
          const brightness =
            0.2126 * pixels[offset] +
            0.7152 * pixels[offset + 1] +
            0.0722 * pixels[offset + 2];
          const characterIndex = Math.round(
            ((255 - brightness) / 255) * (STANDARD_CHARSET.length - 1),
          );
          const character = STANDARD_CHARSET[characterIndex];

          if (character !== " ") {
            context.fillText(character, column * cellWidth, row * fontSize);
          }
        }
      }
    };

    const scheduleRender = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(scheduleRender);
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(scheduleRender);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    image.addEventListener("load", scheduleRender);
    image.src = src;

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      image.removeEventListener("load", scheduleRender);
    };
  }, [resolution, src]);

  return <canvas aria-hidden="true" className={className} ref={canvasRef} />;
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  Crop,
  Maximize2,
  Move,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Sparkles,
  User,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface CirclePhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApplyCrop: (croppedDataUrl: string) => void;
}

const VIEWPORT_SIZE = 280; // Size of the interactive crop box in pixels
const OUTPUT_SIZE = 400; // Output square image size (400x400)

export const CirclePhotoCropModal: React.FC<CirclePhotoCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onApplyCrop,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');

  // Load image whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc || !isOpen) return;

    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      // Reset crop parameters for new image
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    img.onerror = () => {
      console.error('Failed to load image for cropping');
    };
    img.src = imageSrc;
  }, [imageSrc, isOpen]);

  // Render crop to preview and generate data URL
  const updateCropCanvas = useCallback(() => {
    const img = imgRef.current;
    if (!img || !imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Output dimension is 400x400 for crisp fidelity
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Background fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    ctx.save();
    // Center of canvas
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

    // Apply pan scaled from preview viewport to export size
    const scaleFactor = OUTPUT_SIZE / VIEWPORT_SIZE;
    ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate base scale to ensure image fills the square viewport without empty borders
    const isRotatedSideways = rotation % 180 !== 0;
    const effectiveW = isRotatedSideways ? img.naturalHeight : img.naturalWidth;
    const effectiveH = isRotatedSideways ? img.naturalWidth : img.naturalHeight;

    const baseScale = Math.max(OUTPUT_SIZE / effectiveW, OUTPUT_SIZE / effectiveH);
    const totalScale = baseScale * zoom;

    // Draw image centered
    ctx.drawImage(
      img,
      -(img.naturalWidth * totalScale) / 2,
      -(img.naturalHeight * totalScale) / 2,
      img.naturalWidth * totalScale,
      img.naturalHeight * totalScale
    );

    ctx.restore();

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setLivePreviewUrl(dataUrl);
    } catch (e) {
      console.warn('Canvas toDataURL error:', e);
    }
  }, [imageLoaded, zoom, pan, rotation]);

  // Update canvas on parameter change
  useEffect(() => {
    updateCropCanvas();
  }, [updateCropCanvas]);

  if (!isOpen) return null;

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPanRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: initialPanRef.current.x + dx,
      y: initialPanRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialPanRef.current = { ...pan };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    setPan({
      x: initialPanRef.current.x + dx,
      y: initialPanRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom inside viewport
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(3, Math.max(1, parseFloat((prev + delta).toFixed(2)))));
  };

  const handleRotateCw = () => {
    soundFX.playClick();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateCcw = () => {
    soundFX.playClick();
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleResetFraming = () => {
    soundFX.playClick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleConfirmCrop = () => {
    soundFX.playPass();
    if (livePreviewUrl) {
      onApplyCrop(livePreviewUrl);
    } else {
      updateCropCanvas();
      if (canvasRef.current) {
        onApplyCrop(canvasRef.current.toDataURL('image/jpeg', 0.9));
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-[#0B1E36] border border-sky-500/40 rounded-3xl w-full max-w-xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1A3F6D] bg-[#071930] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xs">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black font-display text-white flex items-center gap-2">
                <span>Crop Profile Picture</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-400/40 px-2 py-0.5 rounded-full">
                  Circle & Square
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Position and zoom your photo so it never stretches in circular avatars.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer"
            title="Cancel and close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Main Workspace: Interactive Viewport + Live Circle Previews */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Left: Interactive Drag-and-Zoom Viewport */}
            <div className="space-y-2 text-center">
              <div
                style={{ width: `${VIEWPORT_SIZE}px`, height: `${VIEWPORT_SIZE}px` }}
                className={`relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-sky-400/50 shadow-inner select-none ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
              >
                {/* Background Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(#38BDF8 1px, transparent 1px), radial-gradient(#38BDF8 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 8px 8px',
                  }}
                />

                {/* The Image Rendered with Interactive Transforms */}
                {imageLoaded && imgRef.current && (
                  <img
                    src={imageSrc}
                    alt="Crop workspace"
                    draggable={false}
                    className="absolute max-w-none pointer-events-none transition-transform duration-75"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: 'center center',
                      transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) rotate(${rotation}deg) scale(${
                        Math.max(
                          VIEWPORT_SIZE /
                            (rotation % 180 !== 0
                              ? imgRef.current.naturalHeight
                              : imgRef.current.naturalWidth),
                          VIEWPORT_SIZE /
                            (rotation % 180 !== 0
                              ? imgRef.current.naturalWidth
                              : imgRef.current.naturalHeight)
                        ) * zoom
                      })`,
                    }}
                  />
                )}

                {/* Circular Cutout Mask & Crosshair Guide */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE}`}
                >
                  <defs>
                    <mask id="circle-cutout-mask">
                      <rect width={VIEWPORT_SIZE} height={VIEWPORT_SIZE} fill="white" />
                      <circle cx={VIEWPORT_SIZE / 2} cy={VIEWPORT_SIZE / 2} r={VIEWPORT_SIZE / 2 - 16} fill="black" />
                    </mask>
                  </defs>

                  {/* Darkened overlay outside the circle */}
                  <rect
                    width={VIEWPORT_SIZE}
                    height={VIEWPORT_SIZE}
                    fill="rgba(6, 22, 43, 0.72)"
                    mask="url(#circle-cutout-mask)"
                  />

                  {/* High-visibility circular guide ring */}
                  <circle
                    cx={VIEWPORT_SIZE / 2}
                    cy={VIEWPORT_SIZE / 2}
                    r={VIEWPORT_SIZE / 2 - 16}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />

                  {/* Subtle Inner Crosshair */}
                  <line
                    x1={VIEWPORT_SIZE / 2 - 12}
                    y1={VIEWPORT_SIZE / 2}
                    x2={VIEWPORT_SIZE / 2 + 12}
                    y2={VIEWPORT_SIZE / 2}
                    stroke="#FBBF24"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                  <line
                    x1={VIEWPORT_SIZE / 2}
                    y1={VIEWPORT_SIZE / 2 - 12}
                    x2={VIEWPORT_SIZE / 2}
                    y2={VIEWPORT_SIZE / 2 + 12}
                    stroke="#FBBF24"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                </svg>

                {/* Drag hint badge */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-[10px] text-sky-200 border border-sky-500/30 backdrop-blur-xs flex items-center gap-1 font-semibold">
                    <Move className="w-2.5 h-2.5 text-amber-300" /> Drag to position image
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Scroll mouse wheel or use slider to zoom
              </span>
            </div>

            {/* Right: Live Preview Panel */}
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block mb-1">
                  Live Circular Avatars
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  See how your profile picture will appear across the LingoQuest island map and navigation bar:
                </p>
              </div>

              {/* Previews Row */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-around sm:justify-start gap-5">
                {/* Large Circle Profile Avatar (92px) */}
                <div className="text-center space-y-1">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-3 border-amber-400 shadow-lg bg-slate-900 mx-auto">
                    {livePreviewUrl ? (
                      <img
                        src={livePreviewUrl}
                        alt="Circle preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 block">
                    Profile Badge
                  </span>
                </div>

                {/* Small Header Pill Avatar (40px) */}
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-400 shadow-md bg-slate-900 mx-auto">
                    {livePreviewUrl ? (
                      <img
                        src={livePreviewUrl}
                        alt="Pill preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 block">
                    Top Pill
                  </span>
                </div>

                {/* Rounded Card Avatar (48px) */}
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/30 shadow-md bg-slate-900 mx-auto">
                    {livePreviewUrl ? (
                      <img
                        src={livePreviewUrl}
                        alt="Card preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 block">
                    Leaderboard
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1:1 Square geometry prevents stretching</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Circular bounds guarantee crisp face focus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel: Zoom, Rotate, Reset */}
          <div className="p-4 rounded-2xl bg-[#071930] border border-[#163B66] space-y-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-300 w-16 shrink-0 flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-sky-400" /> Zoom
              </span>

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(1, parseFloat((prev - 0.1).toFixed(2))))}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center transition cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, parseFloat((prev + 0.1).toFixed(2))))}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center transition cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-bold text-amber-300 w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Transform Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotateCcw}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 font-semibold transition cursor-pointer"
                  title="Rotate 90 degrees counter-clockwise"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rotate -90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleRotateCw}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 font-semibold transition cursor-pointer"
                  title="Rotate 90 degrees clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate +90°</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetFraming}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
                title="Reset zoom and center framing"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Framing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1A3F6D] bg-[#071930] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer font-display"
          >
            <Check className="w-4 h-4" />
            <span>Apply Crop & Save Picture</span>
          </button>
        </div>
      </div>
    </div>
  );
};

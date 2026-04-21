import { Typography } from "./ui/Typography";
import { useRef, useState } from "react";

export const PreviewCanvas = ({ image, fontName, coords, scaleRatio, onMap, onClear, sampleText, setSampleText, textColor, fontSize }: any) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="relative group overflow-hidden rounded-xl bg-brand-background border border-brand-gray-100 shadow-inner w-full h-full flex flex-col items-center justify-center p-8">
            {image ? (
                <div className="relative cursor-crosshair inline-block shadow-xl select-none">
                    <img
                        id="preview-image"
                        src={image}
                        alt="Certificate Preview"
                        className="max-w-full h-auto object-contain pointer-events-none"
                        style={{ maxHeight: '75vh' }}
                    />
                    <div 
                        className="absolute inset-0 z-10" 
                        onClick={(e) => {
                            if (!onMap) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            
                            const screenX = e.clientX - rect.left;
                            const screenY = e.clientY - rect.top;
                            
                            const img = e.currentTarget.previousElementSibling as HTMLImageElement;
                            const widthRatio = img.naturalWidth / rect.width;
                            const heightRatio = img.naturalHeight / rect.height;
                            
                            onMap(screenX, screenY, widthRatio, heightRatio);
                            
                            // Focus input after placing
                            setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                    />
                    {/* Visual Marker for Name */}
                    {coords.x > 0 && coords.y > 0 && (
                        <div
                            className="absolute flex flex-col items-center justify-center pointer-events-auto z-20 group/drag"
                            style={{ left: coords.x, top: coords.y, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="flex gap-1 items-end opacity-0 group-hover/drag:opacity-100 transition-opacity select-none">
                                <div 
                                    className="bg-brand-cyan text-white text-[10px] px-2 py-0.5 rounded-t cursor-move"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        setIsDragging(true);
                                    }}
                                    onPointerMove={(e) => {
                                        if (isDragging && onMap) {
                                            const img = document.getElementById('preview-image') as HTMLImageElement;
                                            if (img) {
                                                const imgRect = img.getBoundingClientRect();
                                                const screenX = e.clientX - imgRect.left;
                                                const screenY = e.clientY - imgRect.top;
                                                const widthRatio = img.naturalWidth / imgRect.width;
                                                const heightRatio = img.naturalHeight / imgRect.height;
                                                onMap(screenX, screenY, widthRatio, heightRatio);
                                            }
                                        }
                                    }}
                                    onPointerUp={(e) => {
                                        e.currentTarget.releasePointerCapture(e.pointerId);
                                        setIsDragging(false);
                                    }}
                                >
                                    ✥ Drag
                                </div>
                                <button 
                                    className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-t cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (onClear) onClear();
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={sampleText}
                                onChange={(e) => setSampleText?.(e.target.value)}
                                style={{ 
                                    fontFamily: fontName || 'auto',
                                    color: textColor,
                                    // Scale the font size relative to screen size so it visually matches what it will be on the PDF
                                    fontSize: `${fontSize / (scaleRatio || 1)}px`,
                                    background: 'transparent',
                                    border: '1px dashed rgba(41, 171, 226, 0.5)',
                                    outline: 'none',
                                    textAlign: 'center',
                                    pointerEvents: isDragging ? 'none' : 'auto'
                                }}
                                className="whitespace-nowrap transition-colors focus:border-brand-cyan hover:border-brand-cyan hover:bg-white/40 focus:bg-white/40 rounded px-2 min-w-10 placeholder:text-brand-gray-300"
                                placeholder="Type text..."
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-32 w-full h-full flex items-center justify-center text-center border-2 border-dashed border-brand-gray-100 rounded-xl bg-white/50">
                    <Typography variant="p" className="text-brand-gray-300">
                        Upload a design to start mapping the name position.
                    </Typography>
                </div>
            )}
        </div>
    );
};
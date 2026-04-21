'use client';
import { useState } from 'react';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { AssetDropzone } from '@/components/ui/AssetDropzone';
import { PreviewCanvas } from '@/components/PreviewCanvas';
import Image from 'next/image';

export default function CertGenerator() {
  const [baseImage, setBaseImage] = useState<string | null>(null); // For Preview
  const [imageBuffer, setImageBuffer] = useState<ArrayBuffer | null>(null); // For PDF Logic
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [fontName, setFontName] = useState<string>('');

  const [coords, setCoords] = useState({ x: 0, y: 0 }); // Screen position
  const [pdfCoords, setPdfCoords] = useState({ x: 0, y: 0 }); // Real PDF position
  const [scaleRatio, setScaleRatio] = useState(1);

  // Customization states
  const [sampleText, setSampleText] = useState('Sample Name');
  const [textColor, setTextColor] = useState('#3d3a8e');
  const [fontSize, setFontSize] = useState(96);

  const handleImageUpload = async (file: File) => {
    const buffer = await file.arrayBuffer();
    setImageBuffer(buffer);
    setBaseImage(URL.createObjectURL(file)); // Create a local URL for the canvas preview
  };

  const handleFontUpload = async (file: File) => {
    const buffer = await file.arrayBuffer();
    setFontBuffer(buffer);
    setFontName(file.name.split('.')[0]);

    // Register the font in the browser so the Preview Canvas can use it
    const font = new FontFace(file.name.split('.')[0], buffer);
    await font.load();
    document.fonts.add(font);
  };
  // This function is passed to the Canvas to handle the scaling math
  const handleMapPosition = (screenX: number, screenY: number, widthRatio: number, heightRatio: number) => {
    setCoords({ x: screenX, y: screenY });
    setScaleRatio(widthRatio);

    // Calculate actual position on the high-res asset
    // PDF-Lib uses (0,0) as BOTTOM-LEFT, so we invert the Y axis
    setPdfCoords({
      x: screenX * widthRatio,
      y: (screenY * heightRatio) // Logic to invert this happens in the generator
    });
  };

  const handleClearPosition = () => {
    setCoords({ x: 0, y: 0 });
    setPdfCoords({ x: 0, y: 0 });
  };

  return (
    <main className="min-h-screen bg-brand-background p-4 md:p-8">
      {/* Header Section */}
      <header className="w-full mx-auto mb-8 flex justify-between items-end">
        <div className="space-y-2">
          <Image src="/igcolouredlogo.png" alt="Logo" width={100} height={100} />
          <Typography variant="h1">Certificate Automator</Typography>
          <Typography variant="p">Upload assets, map coordinates, and batch export.</Typography>
        </div>
        <Button variant="outline">View Documentation</Button>
      </header>

      {/* Main App Grid */}
      <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray-100">
            <Typography variant="h2" className="mb-4 text-sm">1. Project Assets</Typography>
            <div className="space-y-3">
              <AssetDropzone
                label="Design (PNG)"
                isLoaded={!!baseImage}
                onFileSelect={handleImageUpload}
                accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
              />
              <AssetDropzone
                label="Font (TTF/OTF)"
                isLoaded={!!fontBuffer}
                onFileSelect={handleFontUpload}
                accept={{ 'font/ttf': ['.ttf'], 'font/otf': ['.otf'] }}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-brand-gray-100 space-y-4">
              <Typography variant="h2" className="text-sm">Styling Controls</Typography>
              <div>
                <Typography variant="label" className="text-[10px] text-brand-gray-500 block mb-1">Preview Text</Typography>
                <input type="text" value={sampleText} onChange={(e) => setSampleText(e.target.value)} className="w-full border border-brand-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-indigo" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Typography variant="label" className="text-[10px] text-brand-gray-500 block mb-1">Color</Typography>
                  <div className="flex items-center gap-2 border border-brand-gray-100 rounded-lg px-3 py-1.5 focus-within:border-brand-indigo">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent shrink-0" />
                    <span className="text-xs text-brand-gray-700 truncate">{textColor}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <Typography variant="label" className="text-[10px] text-brand-gray-500 block mb-1">Size (px)</Typography>
                  <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full border border-brand-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-indigo" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray-100">
            <Typography variant="h2" className="mb-4 text-sm">2. Data & Export</Typography>
            <Button className="w-full mb-4" variant="outline">Upload CSV</Button>
            <div className="mt-8 pt-6 border-t border-brand-gray-100">
              <Button className="w-full" variant="primary">Generate (50 per batch)</Button>
            </div>
          </div>
        </section>

        {/* Center: Preview Canvas */}
        <section className="lg:col-span-9 flex flex-col">
          <div className="flex justify-between items-center mb-4 px-2">
            <Typography variant="h2" className="text-sm uppercase tracking-widest text-brand-gray-500">
              Layout Designer
            </Typography>

            <div className="flex gap-4">
              <div className="bg-white px-3 py-1 rounded border border-brand-gray-100 text-[10px] text-brand-gray-500 font-mono">
                X: {Math.round(pdfCoords.x)}px
              </div>
              <div className="bg-white px-3 py-1 rounded border border-brand-gray-100 text-[10px] text-brand-gray-500 font-mono">
                Y: {Math.round(pdfCoords.y)}px
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-brand-gray-100 p-6 flex flex-col items-center justify-center min-h-[600px] overflow-auto">
            <PreviewCanvas
              image={baseImage}
              fontName={fontName}
              coords={coords}
              scaleRatio={scaleRatio}
              onMap={handleMapPosition}
              onClear={handleClearPosition}
              sampleText={sampleText}
              setSampleText={setSampleText}
              textColor={textColor}
              fontSize={fontSize}
            />
          </div>
        </section>

      </div>
    </main>
  );
}
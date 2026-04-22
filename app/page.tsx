'use client';
import { useState } from 'react';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { AssetDropzone } from '@/components/ui/AssetDropzone';
import { PreviewCanvas } from '@/components/PreviewCanvas';
import { DataImport } from '@/components/ui/DataImport';
import Image from 'next/image';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import JSZip from 'jszip';

export default function CertGenerator() {
  const [baseImage, setBaseImage] = useState<string | null>(null); // For Preview
  const [imageBuffer, setImageBuffer] = useState<ArrayBuffer | null>(null); // For PDF Logic
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [fontName, setFontName] = useState<string>('');

  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  };

  const handleGenerate = async () => {
    if (!imageBuffer || !fontBuffer || studentNames.length === 0 || pdfCoords.x === 0) return;
    setIsGenerating(true);

    try {
      const zip = new JSZip();
      const imageBytes = new Uint8Array(imageBuffer);
      const isPng = imageBytes[0] === 0x89 && imageBytes[1] === 0x50;

      for (const name of studentNames) {
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        let pdfImage;
        if (isPng) {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        }

        const customFont = await pdfDoc.embedFont(fontBuffer);
        const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);

        page.drawImage(pdfImage, {
          x: 0, y: 0,
          width: pdfImage.width,
          height: pdfImage.height,
        });

        const formattedName = name
          .split(' ')
          .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
          .join(' ');

        const actualX = pdfCoords.x;
        // Adjust for baseline vs vertical center offset. 
        // Screen uses translate(0%, -50%) centering the text vertically at the click Y.
        // PDF drawText y positions the BASELINE.
        const actualY = (pdfImage.height - pdfCoords.y) - (fontSize * 0.35);

        const startX = actualX; // Start from left precisely where clicked

        page.drawText(formattedName, {
          x: startX,
          y: actualY,
          size: fontSize,
          font: customFont,
          color: hexToRgb(textColor),
        });

        const pdfBytes = await pdfDoc.save();
        zip.file(`${name.replace(/[^a-zA-Z0-9 ]/g, '')}_Certificate.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'IGHub_Certificates.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert('Error generating certificates. See console.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="h-screen p-4 md:p-8 flex flex-col overflow-hidden">
      {/* Header Section */}
      <header className="mb-6 flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-white p-2 rounded-xl">
            <Image src="/igcolouredlogo.png" alt="IGHub Logo" width={150} height={75} className="object-contain" />
          </div>
          <div>
            <Typography variant="h2">Certificate Automator</Typography>
            <Typography variant="p" className="text-brand-gray-500 text-sm">Design and batch-generate certificates instantly.</Typography>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1600px] mx-auto flex-1 min-h-0 overflow-hidden">

        {/* Left Toolkit Sidebar - Scrollable */}
        <section className="w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 pb-8">
          <div className="bg-white p-6 rounded-2xl border border-brand-gray-300">
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

          <DataImport
            onDataLoaded={setStudentNames}
            count={studentNames.length}
          />

          <div className="bg-white p-6 rounded-2xl  border border-brand-gray-300">
            <Typography variant="h2" className="mb-4 text-sm">3. Export</Typography>
            <Button
              className="w-full"
              variant="primary"
              disabled={studentNames.length === 0 || !imageBuffer || !fontBuffer || pdfCoords.x === 0 || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? `Generating ${studentNames.length}...` : 'Generate Certificates'}
            </Button>

            <div className="mt-4 text-xs text-brand-gray-500 space-y-1 bg-brand-background p-3 rounded border border-brand-gray-100">
              <div className="font-semibold text-[10px] uppercase mb-2">Checklist to Generate:</div>
              <div className="flex items-center gap-2">{imageBuffer ? '✅' : '⬜'} Template Uploaded</div>
              <div className="flex items-center gap-2">{fontBuffer ? '✅' : '⬜'} Font Uploaded</div>
              <div className="flex items-center gap-2">{pdfCoords.x > 0 ? '✅' : '⬜'} Canvas Position Mapped</div>
              <div className="flex items-center gap-2">{studentNames.length > 0 ? `✅ ${studentNames.length} Names Loaded` : '⬜ CSV Names Loaded'}</div>
            </div>
          </div>
        </section>

        {/* Right Canvas Area - Fixed */}
        <section className="w-full lg:flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 px-2">
            {/* <Typography variant="h2" className="text-sm uppercase tracking-widest text-brand-gray-500">
              Layout Designer
            </Typography> */}

            <div className="flex gap-4">
              <div className="bg-white px-3 py-1 rounded border border-brand-gray-100 text-[10px] text-brand-gray-500 font-mono">
                X: {Math.round(pdfCoords.x)}px
              </div>
              <div className="bg-white px-3 py-1 rounded border border-brand-gray-100 text-[10px] text-brand-gray-500 font-mono">
                Y: {Math.round(pdfCoords.y)}px
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-brand-gray-300 p-6 flex flex-col items-center justify-center overflow-auto h-full">
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
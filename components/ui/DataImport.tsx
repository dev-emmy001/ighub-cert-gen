import { Typography } from './Typography';
import { Button } from './Button';
import Papa from 'papaparse';
import { useState, useEffect } from 'react';

interface DataImportProps {
    onDataLoaded: (names: string[]) => void;
    count: number;
}

export const DataImport = ({ onDataLoaded, count }: DataImportProps) => {
    const [importMode, setImportMode] = useState<'csv' | 'manual'>('csv');
    const [manualText, setManualText] = useState('');

    const [headers, setHeaders] = useState<string[]>([]);
    const [rawData, setRawData] = useState<string[][]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as string[][];
                if (data.length === 0) return;

                const numCols = data[0].length;

                if (numCols === 1) {
                    // Single column CSV. No dropdown needed.
                    let names = data.flat();

                    // If the first row is literally just a header title, skip it
                    const firstRow = String(names[0]).toLowerCase().trim();
                    if (['name', 'names', 'student', 'students', 'kid', 'kids'].includes(firstRow)) {
                        names = names.slice(1);
                    }

                    setHeaders([]); // Hide dropdown
                    setRawData([]); // Clear multi-column data state
                    onDataLoaded(names.filter(n => String(n).trim().length > 0));
                } else {
                    // Multi column CSV: User must pick the correct column
                    const extractedHeaders = data[0];
                    setHeaders(extractedHeaders);
                    setRawData(data.slice(1));

                    // Attempt to auto-select a plausible "name" column
                    const autoIndex = extractedHeaders.findIndex(f => f.toLowerCase().includes('name') || f.toLowerCase().includes('kid'));
                    setSelectedIndex(autoIndex !== -1 ? autoIndex : 0);
                }
            },
        });
    };

    // Sync extracted names up to page.tsx whenever a column changes (for Multi-Column logic)
    useEffect(() => {
        if (importMode !== 'csv') return;

        if (headers.length > 0 && rawData.length > 0) {
            const names = rawData
                .map(row => {
                    const val = row[selectedIndex];
                    return val ? String(val).trim() : '';
                })
                .filter(name => name.length > 0);

            onDataLoaded(names);
        } else if (rawData.length === 0 && headers.length > 0) {
            onDataLoaded([]);
        }
    }, [selectedIndex, headers, rawData, onDataLoaded, importMode]);

    const handleManualChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setManualText(text);
        const names = text.split(',').map(n => n.trim()).filter(n => n.length > 0);
        onDataLoaded(names);
    };

    return (
        <div className="bg-white p-6 rounded-2xl  border border-brand-gray-300 shrink-0">
            <div className="flex items-center justify-between mb-4">
                <Typography variant="h2" className="text-sm m-0">2. Recipient List</Typography>
                <div className="flex bg-brand-background rounded-lg border border-brand-gray-100 p-0.5 text-[10px]">
                    <button
                        onClick={() => {
                            setImportMode('csv');
                            // Trigger re-sync immediately
                            setSelectedIndex(selectedIndex);
                        }}
                        className={`px-2 py-1 rounded transition-colors duration-200 ${importMode === 'csv' ? 'bg-white shadow text-brand-indigo font-semibold' : 'text-brand-gray-500 hover:text-slate-800'}`}
                    >
                        CSV Upload
                    </button>
                    <button
                        onClick={() => {
                            setImportMode('manual');
                            const names = manualText.split(',').map(n => n.trim()).filter(n => n.length > 0);
                            onDataLoaded(names);
                        }}
                        className={`px-2 py-1 rounded transition-colors duration-200 ${importMode === 'manual' ? 'bg-white shadow text-brand-indigo font-semibold' : 'text-brand-gray-500 hover:text-slate-800'}`}
                    >
                        Type manually
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {importMode === 'csv' ? (
                    <>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <Button variant="secondary" className="w-full relative z-0">
                                {count > 0 ? 'Change CSV File' : 'Upload Names (CSV)'}
                            </Button>
                        </div>

                        {headers.length > 0 && (
                            <div className="space-y-2 pt-2">
                                <Typography variant="label" className="text-[10px] text-brand-gray-500 block">
                                    Select Name Column
                                </Typography>
                                <select
                                    value={selectedIndex}
                                    onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
                                    className="w-full border border-brand-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-indigo bg-transparent cursor-pointer"
                                >
                                    {headers.map((header, index) => (
                                        <option key={index} value={index}>{header}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {count > 0 && importMode === 'csv' && (
                            <div className="p-3 bg-brand-green/5 border border-brand-green/20 rounded-lg">
                                <Typography className="text-brand-green text-xs font-semibold">
                                    ✓ {count} names loaded from CSV
                                </Typography>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-2">
                        <textarea
                            value={manualText}
                            onChange={handleManualChange}
                            placeholder="e.g. John Doe, Jane Smith, Ayo Adebayo..."
                            className="w-full h-24 border border-brand-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo resize-none bg-brand-background/50"
                        />
                        {count > 0 && (
                            <div className="p-3 bg-brand-green/5 border border-brand-green/20 rounded-lg flex items-center justify-between">
                                <Typography className="text-brand-green text-[11px] font-semibold">
                                    ✓ {count} names generated
                                </Typography>
                                <Typography className="text-brand-gray-500 text-[10px]">
                                    (Comma separated)
                                </Typography>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
import { Typography } from './Typography';
import { Button } from './Button';
import Papa from 'papaparse';
import { useState, useEffect } from 'react';

interface DataImportProps {
    onDataLoaded: (names: string[]) => void;
    count: number;
}

export const DataImport = ({ onDataLoaded, count }: DataImportProps) => {
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
    }, [selectedIndex, headers, rawData, onDataLoaded]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray-100">
            <Typography variant="h2" className="mb-4 text-sm">2. Recipient List</Typography>

            <div className="space-y-4">
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

                {count > 0 && (
                    <div className="p-3 bg-brand-green/5 border border-brand-green/20 rounded-lg">
                        <Typography className="text-brand-green text-xs font-semibold">
                            ✓ {count} target names loaded
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    );
};
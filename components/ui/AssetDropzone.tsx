import { useDropzone } from 'react-dropzone';
import { Typography } from './Typography';

interface AssetDropzoneProps {
  onFileSelect: (file: File) => void;
  accept: Record<string, string[]>;
  label: string;
  icon?: string;
  isLoaded: boolean;
}

export const AssetDropzone = ({ onFileSelect, accept, label, isLoaded }: AssetDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onFileSelect(files[0]),
    accept,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative h-28 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
        ${isDragActive ? 'border-brand-indigo bg-brand-indigo-light' : 'border-brand-gray-300 bg-white'}
        ${isLoaded ? 'border-brand-green bg-brand-green/5' : 'hover:border-brand-indigo/50'}
      `}
    >
      <input {...getInputProps()} />
      {isLoaded ? (
        <Typography variant="label" className="text-brand-green">✓ {label} Loaded</Typography>
      ) : (
        <>
          <Typography variant="label" className="text-brand-gray-500">
            {isDragActive ? 'Drop it here' : `Upload ${label}`}
          </Typography>
          <Typography className="text-[10px] text-brand-gray-300 mt-1">
            {Object.values(accept).flat().join(', ')}
          </Typography>
        </>
      )}
    </div>
  );
};
export interface SortableFile {
  id: string;
  file: File;
}

export interface ToolControlsProps {
  files: SortableFile[];
  setFiles: (files: SortableFile[]) => void;
  processing: boolean;
  setProcessing: (v: boolean) => void;
  progress: number;
  setProgress: (v: number) => void;
  resultBlob: Blob | null;
  setResultBlob: (b: Blob | null) => void;
  resultFileName: string;
  setResultFileName: (s: string) => void;
  error: string | null;
  setError: (s: string | null) => void;
}

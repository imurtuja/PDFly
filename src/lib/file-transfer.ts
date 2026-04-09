/**
 * A simple singleton service to transfer File objects between pages 
 * during navigation. This prevents the need for re-uploading a file 
 * when moving from one tool to another (e.g., from Merge to Unlock).
 */
class FileTransferService {
  private pendingFiles: File[] | null = null;

  setPendingFiles(files: File[]) {
    this.pendingFiles = files;
  }

  peekPendingFiles(): File[] | null {
    return this.pendingFiles;
  }

  popPendingFiles(): File[] | null {
    const files = this.pendingFiles;
    this.pendingFiles = null;
    return files;
  }

  hasPendingFiles(): boolean {
    return this.pendingFiles !== null && this.pendingFiles.length > 0;
  }
}

export const fileTransfer = new FileTransferService();

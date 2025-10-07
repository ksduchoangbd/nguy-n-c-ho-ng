
export interface ImageFile {
  base64: string;
  mimeType: string;
}

export interface ArchitecturalImage extends ImageFile {
  description: string;
}

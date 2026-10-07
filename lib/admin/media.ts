/**
 * Browser-side media handling for the admin panel: images are resized and
 * compressed before upload, the hero poster can be taken from the video's
 * first frame, and files go to the storage paths of amplify/storage.
 */
import { getUrl, remove, uploadData } from 'aws-amplify/storage';
import './amplify';

export const MAX_IMAGE_SIDE = 2000;
export const IMAGE_QUALITY = 0.82;
export const VIDEO_WARN_SECONDS = 20;
export const VIDEO_WARN_BYTES = 20 * 1024 * 1024;

export type MediaFolder = 'hero' | 'gallery' | 'services';

type Encoded = { blob: Blob; contentType: 'image/webp' | 'image/jpeg'; ext: 'webp' | 'jpg' };

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** WebP when the browser can encode it, otherwise JPEG on a white background. */
async function encode(source: CanvasImageSource, width: number, height: number): Promise<Encoded> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');
  ctx.drawImage(source, 0, 0, width, height);
  const webp = await canvasToBlob(canvas, 'image/webp', IMAGE_QUALITY);
  if (webp && webp.type === 'image/webp') return { blob: webp, contentType: 'image/webp', ext: 'webp' };

  // Safari without WebP encoding: flatten transparency, then JPEG.
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  const jpeg = await canvasToBlob(canvas, 'image/jpeg', IMAGE_QUALITY);
  if (!jpeg) throw new Error('encode-failed');
  return { blob: jpeg, contentType: 'image/jpeg', ext: 'jpg' };
}

function fit(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

async function decode(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; done: () => void }> {
  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, done: () => bitmap.close() };
    } catch {
      // Fall back to <img> below (older Safari, some formats).
    }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  try {
    await img.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new Error('decode-failed');
  }
  return { source: img, width: img.naturalWidth, height: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
}

/** Longest side at most 2000 px, WebP (or JPEG) at quality 0.82. */
export async function compressImage(file: Blob): Promise<Encoded> {
  const image = await decode(file);
  try {
    const size = fit(image.width, image.height);
    return await encode(image.source, size.width, size.height);
  } finally {
    image.done();
  }
}

export type VideoInfo = { duration: number; width: number; height: number };

function loadVideo(file: Blob): Promise<{ video: HTMLVideoElement; url: string }> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;
  return new Promise((resolve, reject) => {
    video.onloadeddata = () => resolve({ video, url });
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('video-unreadable'));
    };
  });
}

export async function readVideoInfo(file: Blob): Promise<VideoInfo> {
  const { video, url } = await loadVideo(file);
  const info = { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
  URL.revokeObjectURL(url);
  return info;
}

/** The first frame of the video, as a compressed poster image. */
export async function posterFromVideo(file: Blob): Promise<Encoded> {
  const { video, url } = await loadVideo(file);
  try {
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error('video-unreadable'));
      video.currentTime = 0.001;
    });
    const size = fit(video.videoWidth, video.videoHeight);
    return await encode(video, size.width, size.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function newMediaKey(folder: MediaFolder, ext: string): string {
  return `media/${folder}/${crypto.randomUUID()}.${ext}`;
}

export async function uploadMedia(
  path: string,
  data: Blob,
  contentType: string,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  await uploadData({
    path,
    data,
    options: {
      contentType,
      onProgress: ({ transferredBytes, totalBytes }) => {
        if (onProgress && totalBytes) onProgress(transferredBytes / totalBytes);
      },
    },
  }).result;
}

/** Deletes a stored file; a failure is logged and left (an unreferenced file is never shown). */
export async function removeMedia(path: string | null | undefined): Promise<void> {
  if (!path) return;
  try {
    await remove({ path });
  } catch (error) {
    console.error('[admin] could not delete file', (error as Error).name);
  }
}

/** A short-lived signed URL for previews in the panel (works for hidden items too). */
export async function previewUrl(path: string): Promise<string> {
  const { url } = await getUrl({ path, options: { expiresIn: 3600 } });
  return url.toString();
}

export const formatMegabytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

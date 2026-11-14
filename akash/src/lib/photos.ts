// Real photos/videos the owner drops into /photos are discovered at BUILD time (esbuild define),
// so nothing 404s at runtime and it also works when dist/ is opened from disk.
declare const __PHOTOS__: string[];
export const PHOTOS: string[] = typeof __PHOTOS__ !== 'undefined' ? __PHOTOS__ : [];
export const hasPhoto = (p?: string) => !!p && PHOTOS.includes(p);

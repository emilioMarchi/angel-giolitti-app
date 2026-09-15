import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getR2Url(path: string | null | undefined): string {
  if (!path) return "";
  // Si ya es una URL absoluta (ej: de youtube, picsum o de algún CDN externo), la dejamos como está
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${cleanBase}/${cleanPath}`;
}

export function getEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // 1. YouTube share link: https://youtu.be/VIDEO_ID?si=...
  const shortMatch = trimmed.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // 2. YouTube watch / shorts / live / music: https://www.youtube.com/watch?v=VIDEO_ID...
  const watchMatch = trimmed.match(/(?:youtube\.com|music\.youtube\.com)\/(?:watch\?.*v=|shorts\/|live\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // 3. Vimeo link: https://vimeo.com/123456 -> https://player.vimeo.com/video/123456
  const vimeoMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return trimmed;
}

export function parseVideoUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(u => String(u).trim()).filter(Boolean);
      }
    } catch {
      // ignore
    }
  }

  return trimmed.split(/\r?\n/).map(u => u.trim()).filter(Boolean);
}


import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize2, AlertCircle } from "lucide-react";

interface UniversalMediaPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  className?: string;
}

export function detectMediaType(url: string): "youtube" | "vimeo" | "hls" | "video" | "audio" | "iframe" | "unknown" {
  if (!url || url === "#") return "unknown";
  const clean = url.trim().toLowerCase();

  // 1. YouTube
  if (clean.includes("youtube.com") || clean.includes("youtu.be")) {
    return "youtube";
  }

  // 2. Vimeo
  if (clean.includes("vimeo.com")) {
    return "vimeo";
  }

  // 3. HLS Stream (.m3u8) - Bunny CDN, Cloudflare Stream, AWS CloudFront, etc.
  if (clean.includes(".m3u8") || clean.includes("b-cdn.net") || clean.includes("mediadelivery.net")) {
    return "hls";
  }

  // 4. Direct Audio
  if (clean.endsWith(".mp3") || clean.endsWith(".wav") || clean.endsWith(".aac") || clean.endsWith(".m4a") || clean.includes("spotify.com") || clean.includes("soundcloud.com")) {
    return "audio";
  }

  // 5. Direct Video
  if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".ogg") || clean.endsWith(".mov")) {
    return "video";
  }

  return "unknown";
}

export function getYoutubeId(url: string): string {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}

export function getVimeoId(url: string): string {
  if (!url) return "";
  const regExp = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : "";
}

export default function UniversalMediaPlayer({
  url,
  title = "נגן מדיה",
  poster,
  className = "",
}: UniversalMediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hlsError, setHlsError] = useState<string | null>(null);
  const mediaType = detectMediaType(url);

  // Setup HLS.js for .m3u8 and Bunny stream links
  useEffect(() => {
    setHlsError(null);
    let hlsInstance: Hls | null = null;

    if (mediaType === "hls" && videoRef.current && url) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("HLS Network error encountered, attempting recovery:", data);
                hlsInstance?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("HLS Media error encountered, attempting recovery:", data);
                hlsInstance?.recoverMediaError();
                break;
              default:
                console.error("Fatal unrecoverable HLS error:", data);
                hlsInstance?.destroy();
                setHlsError("לא ניתן לטעון את שידור הווידאו (ודא שהקישור תקין וזמין לצפייה ציבורית)");
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native Safari/iOS HLS support
        video.src = url;
      } else {
        setHlsError("הדפדפן אינו תומך בניגון שידורי HLS.");
      }
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [url, mediaType]);

  if (!url || url === "#" || mediaType === "unknown") {
    return null;
  }

  // 1. YouTube Player
  if (mediaType === "youtube") {
    const ytId = getYoutubeId(url);
    if (!ytId) return null;
    return (
      <div className={`w-full aspect-video rounded-sm overflow-hidden bg-black relative shadow-lg border border-zinc-200 ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
          title={title}
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Vimeo Player
  if (mediaType === "vimeo") {
    const vimeoId = getVimeoId(url);
    if (!vimeoId) return null;
    return (
      <div className={`w-full aspect-video rounded-sm overflow-hidden bg-black relative shadow-lg border border-zinc-200 ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&title=0&byline=0&portrait=0`}
          title={title}
          className="w-full h-full border-0 absolute inset-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 3. HLS / Bunny.net / m3u8 Stream Video Player
  if (mediaType === "hls") {
    return (
      <div className={`w-full aspect-video rounded-sm overflow-hidden bg-black relative shadow-lg border border-zinc-200 flex flex-col justify-center items-center ${className}`}>
        {hlsError ? (
          <div className="p-6 text-center text-white space-y-2">
            <AlertCircle size={32} className="mx-auto text-amber-400" />
            <p className="text-sm font-medium">{hlsError}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-babun-accent hover:underline font-mono inline-block pt-2"
            >
              פתח קישור ישיר בנגן חיצוני ↗
            </a>
          </div>
        ) : (
          <video
            ref={videoRef}
            controls
            playsInline
            poster={poster}
            className="w-full h-full object-contain"
          />
        )}
      </div>
    );
  }

  // 4. Direct HTML5 Video (MP4, WebM, etc.)
  if (mediaType === "video") {
    return (
      <div className={`w-full aspect-video rounded-sm overflow-hidden bg-black relative shadow-lg border border-zinc-200 ${className}`}>
        <video
          controls
          playsInline
          poster={poster}
          className="w-full h-full object-contain"
        >
          <source src={url} />
          דפדפנך אינו תומך בניגון וידאו זה.
        </video>
      </div>
    );
  }

  // 5. Audio Player (MP3, Podcast Audio)
  if (mediaType === "audio") {
    return (
      <div className={`w-full bg-[#1e293b] text-white p-6 rounded-sm shadow-lg border border-slate-700/50 space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-babun-accent/20 flex items-center justify-center text-babun-accent">
              <Volume2 size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono">השמעת פודקאסט שמע</span>
              <h4 className="text-sm font-bold font-display text-white">{title}</h4>
            </div>
          </div>
        </div>
        <audio
          ref={audioRef}
          controls
          className="w-full h-10 accent-babun-accent"
          src={url}
        >
          דפדפנך אינו תומך בניגון אודיו זה.
        </audio>
      </div>
    );
  }

  return null;
}

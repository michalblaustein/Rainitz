import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize2, AlertCircle, RefreshCw } from "lucide-react";

interface UniversalMediaPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
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

export function getBunnyPoster(url: string): string {
  if (!url) return "";
  if (url.includes("b-cdn.net") && url.includes(".m3u8")) {
    return url.substring(0, url.lastIndexOf("/")) + "/thumbnail.jpg";
  }
  return "";
}

export default function UniversalMediaPlayer({
  url,
  title = "נגן מדיה",
  poster,
  autoPlay = false,
  className = "",
}: UniversalMediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hlsError, setHlsError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(autoPlay);
  const mediaType = detectMediaType(url);

  const effectivePoster = poster || getBunnyPoster(url);

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

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay || hasStarted) {
            video.play().catch((err) => {
              console.log("Autoplay was prevented by browser, waiting for user click:", err);
            });
          }
        });

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
        if (autoPlay || hasStarted) {
          video.play().catch(() => {});
        }
      } else {
        setHlsError("הדפדפן אינו תומך בניגון שידורי HLS.");
      }
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [url, mediaType, autoPlay, hasStarted]);

  if (!url || url === "#" || mediaType === "unknown") {
    return null;
  }

  // 1. YouTube Player
  if (mediaType === "youtube") {
    const ytId = getYoutubeId(url);
    if (!ytId) return null;
    return (
      <div className={`w-full aspect-video rounded-sm overflow-hidden bg-black relative shadow-xl border border-zinc-200 ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}&rel=0`}
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
      <div className={`w-full aspect-video rounded-sm overflow-hidden bg-black relative shadow-xl border border-zinc-200 ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoPlay ? 1 : 0}&title=0&byline=0&portrait=0`}
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
      <div className={`w-full aspect-video rounded-sm overflow-hidden bg-[#0a0f1d] relative shadow-2xl border border-slate-800 flex flex-col justify-center items-center group ${className}`}>
        {hlsError ? (
          <div className="p-6 text-center text-white space-y-3">
            <AlertCircle size={36} className="mx-auto text-amber-400" />
            <p className="text-sm font-medium">{hlsError}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setHlsError(null);
                  setHasStarted(true);
                }}
                className="bg-babun-accent text-babun-primary text-xs font-bold px-4 py-2 rounded-sm flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>נסה שוב</span>
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/80 hover:text-white underline font-mono"
              >
                פתח קישור ישיר ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              controls
              playsInline
              poster={effectivePoster}
              onPlay={() => {
                setIsPlaying(true);
                setHasStarted(true);
              }}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />
            
            {/* Big overlay Play Button when not started */}
            {!hasStarted && (
              <button
                onClick={() => {
                  setHasStarted(true);
                  if (videoRef.current) {
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 hover:bg-black/20 transition-all cursor-pointer group"
                aria-label="נגן וידאו"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-babun-accent text-babun-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <Play size={36} className="fill-current translate-x-[-2px]" />
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // 4. Direct HTML5 Video (MP4, WebM, etc.)
  if (mediaType === "video") {
    return (
      <div className={`w-full aspect-video rounded-sm overflow-hidden bg-black relative shadow-xl border border-zinc-200 ${className}`}>
        <video
          controls
          playsInline
          poster={effectivePoster}
          autoPlay={autoPlay}
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
      <div className={`w-full bg-[#1e293b] text-white p-6 md:p-8 rounded-sm shadow-xl border border-slate-700/60 space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-babun-accent/20 flex items-center justify-center text-babun-accent shrink-0">
              <Volume2 size={24} />
            </div>
            <div>
              <span className="text-[11px] text-babun-accent font-bold uppercase tracking-wider font-mono">האזנה לפודקאסט שמע</span>
              <h4 className="text-base md:text-lg font-bold font-display text-white mt-0.5">{title}</h4>
            </div>
          </div>
        </div>
        <audio
          ref={audioRef}
          controls
          autoPlay={autoPlay}
          className="w-full h-12 accent-babun-accent mt-2"
          src={url}
        >
          דפדפנך אינו תומך בניגון אודיו זה.
        </audio>
      </div>
    );
  }

  return null;
}

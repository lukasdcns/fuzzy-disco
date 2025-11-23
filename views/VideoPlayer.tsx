/**
 * VideoPlayer Component
 * A reusable HTML5 video player component with custom controls
 */
import { useRef, useState, useEffect } from "react";
import type { XtreamConfig } from "../types/xtream.types";

export interface VideoPlayerProps {
  /**
   * The streaming URL to play
   */
  streamUrl: string;
  /**
   * Title of the video (for display)
   */
  title?: string;
  /**
   * Optional poster image URL
   */
  poster?: string;
  /**
   * Callback when playback starts
   */
  onPlay?: () => void;
  /**
   * Callback when playback pauses
   */
  onPause?: () => void;
  /**
   * Callback when playback ends
   */
  onEnded?: () => void;
}

/**
 * VideoPlayer component with HTML5 video controls
 *
 * @param props - VideoPlayer component props
 * @returns JSX element containing the video player
 */
export function VideoPlayer({
  streamUrl,
  title,
  poster,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = (): void => {
      setCurrentTime(video.currentTime);
    };

    const updateDuration = (): void => {
      setDuration(video.duration);
    };

    const handlePlay = (): void => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = (): void => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = (): void => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onPlay, onPause, onEnded]);

  const togglePlayPause = (): void => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const toggleFullscreen = (): void => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="relative">
        <video
          ref={videoRef}
          src={streamUrl}
          poster={poster}
          className="w-full h-auto"
          playsInline
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-4 transition-opacity opacity-0 hover:opacity-100"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg
                className="w-12 h-12 text-gray-900"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="w-12 h-12 text-gray-900"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="bg-gray-900 px-4 py-3 space-y-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <span className="text-white text-sm w-16">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-white text-sm w-16 text-right">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-blue-400 transition-colors"
            aria-label="Fullscreen"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

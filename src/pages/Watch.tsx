import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import Hls from 'hls.js';
import { useLanguage, lockMessages } from '../store/language';
import { useDramaDetail, useVideoPlayer } from '../hooks/useDramas';

const Watch = () => {
  const { id: code } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [showLockPopup, setShowLockPopup] = useState(false);
  const { lang } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const { drama, loading: dramaLoading } = useDramaDetail(code);
  const { videoData, loading: videoLoading } = useVideoPlayer(code, currentEpisode);

  // Setup HLS player
  useEffect(() => {
    if (!videoRef.current || !videoData?.video?.video_720) return;

    const video = videoRef.current;
    const originalUrl = videoData.video.video_720;
    const videoUrl = `/video?url=${encodeURIComponent(originalUrl.replace('https://', ''))}`;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoData]);

  const handleEpisodeChange = (ep: number) => {
    if (ep >= 30) {
      setShowLockPopup(true);
      return;
    }
    setCurrentEpisode(ep);
  };

  const handlePrevious = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    }
  };

  const handleNext = () => {
    if (drama && currentEpisode < drama.episodes) {
      const nextEp = currentEpisode + 1;
      if (nextEp >= 30) {
        setShowLockPopup(true);
        return;
      }
      setCurrentEpisode(nextEp);
    }
  };

  const handleVideoEnded = () => {
    if (drama && currentEpisode < drama.episodes) {
      const nextEp = currentEpisode + 1;
      if (nextEp >= 30) {
        setShowLockPopup(true);
        return;
      }
      setCurrentEpisode(nextEp);
    }
  };

  if (dramaLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Drama not found</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-zinc-300 hover:text-white">
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black aspect-[9/16]">
          {videoLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
              <p className="text-sm text-white ml-3">Loading episode {currentEpisode}...</p>
            </div>
          ) : videoData?.video ? (
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              onEnded={handleVideoEnded}
              playsInline
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-zinc-400">Video not available</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Episode Info */}
          <div>
            <h2 className="text-lg font-bold mb-2">{drama.name}</h2>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-zinc-400">
                Episode {currentEpisode} of {drama.episodes}
              </span>
            </div>
            {drama.summary && (
              <p className="text-sm text-zinc-300 line-clamp-3">
                {drama.summary}
              </p>
            )}
          </div>

          {/* Episode Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentEpisode === 1}
              className="flex-1 bg-zinc-800 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentEpisode === drama.episodes}
              className="flex-1 btn-primary py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Episode List */}
          <div>
            <h3 className="font-semibold mb-3">All Episodes</h3>
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {Array.from({ length: drama.episodes }, (_, i) => i + 1).map((ep) => (
                <button
                  key={ep}
                  onClick={() => handleEpisodeChange(ep)}
                  className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                    currentEpisode === ep
                      ? 'bg-red-500 text-white scale-105'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lock Popup */}
        {showLockPopup && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-xl p-6 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-red-500" />
              </div>
              <p className="text-white mb-6 whitespace-pre-line">
                {lockMessages[lang] || lockMessages.en}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLockPopup(false)}
                  className="flex-1 bg-zinc-800 text-white py-3 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                >
                  OK
                </button>
                <a
                  href="https://t.me/sapitokenbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-primary py-3 rounded-lg font-medium text-center"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;

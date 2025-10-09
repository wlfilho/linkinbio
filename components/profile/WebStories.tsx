"use client";

import { useState, useEffect } from "react";
import { Story } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface WebStoriesProps {
  userId: string;
}

export default function WebStories({ userId }: WebStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  // Evitar erro de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get session ID for tracking views
  const getSessionId = () => {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem("story_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("story_session_id", sessionId);
    }
    return sessionId;
  };

  // Load stories
  useEffect(() => {
    if (mounted) {
      loadStories();
      loadViewedStories();
    }
  }, [userId, mounted]);

  const loadStories = async () => {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("order", { ascending: true });

    if (data && !error) {
      setStories(data);
    }
  };

  const loadViewedStories = async () => {
    const sessionId = getSessionId();
    const { data, error } = await supabase
      .from("story_views")
      .select("story_id")
      .eq("viewer_session", sessionId);

    if (data && !error) {
      setViewedStories(new Set(data.map((v) => v.story_id)));
    }
  };

  const markStoryAsViewed = async (storyId: string) => {
    const sessionId = getSessionId();
    
    // Insert view record
    await supabase
      .from("story_views")
      .insert({ story_id: storyId, viewer_session: sessionId })
      .select();

    // Increment views count
    await supabase.rpc("increment_story_views", { story_id: storyId });

    // Update local state
    setViewedStories((prev) => new Set([...prev, storyId]));
  };

  const incrementStoryClicks = async (storyId: string) => {
    await supabase.rpc("increment_story_clicks", { story_id: storyId });
  };

  // Progress bar animation
  useEffect(() => {
    if (selectedStoryIndex === null || isPaused) return;

    const currentStory = stories[selectedStoryIndex];
    if (!currentStory) return;

    const duration = currentStory.duration * 1000; // Convert to ms
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [selectedStoryIndex, isPaused, stories]);

  const openStory = (index: number) => {
    setSelectedStoryIndex(index);
    setProgress(0);
    const story = stories[index];
    if (story && !viewedStories.has(story.id)) {
      markStoryAsViewed(story.id);
    }
  };

  const closeStory = () => {
    setSelectedStoryIndex(null);
    setProgress(0);
    setIsPaused(false);
  };

  const goToNextStory = () => {
    if (selectedStoryIndex === null) return;
    if (selectedStoryIndex < stories.length - 1) {
      openStory(selectedStoryIndex + 1);
    } else {
      closeStory();
    }
  };

  const goToPreviousStory = () => {
    if (selectedStoryIndex === null) return;
    if (selectedStoryIndex > 0) {
      openStory(selectedStoryIndex - 1);
    }
  };

  const handleStoryClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      goToPreviousStory();
    } else if (x > (width * 2) / 3) {
      goToNextStory();
    }
  };

  const handleLinkClick = async () => {
    if (selectedStoryIndex === null) return;
    const story = stories[selectedStoryIndex];
    if (story?.link_url) {
      await incrementStoryClicks(story.id);
      window.open(story.link_url, "_blank");
    }
  };

  // Não renderizar até estar montado (evita hidratação)
  if (!mounted) return null;

  if (stories.length === 0) return null;

  const currentStory = selectedStoryIndex !== null ? stories[selectedStoryIndex] : null;

  return (
    <>
      {/* Stories Thumbnails */}
      <div className="mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story, index) => {
            const isViewed = viewedStories.has(story.id);
            return (
              <button
                key={story.id}
                onClick={() => openStory(index)}
                className="flex-shrink-0 focus:outline-none group"
              >
                <div
                  className={`
                    w-16 h-16 rounded-full p-[2px] transition-all duration-200
                    ${
                      isViewed
                        ? "bg-gray-300"
                        : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                    }
                    group-hover:scale-105
                  `}
                >
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    {story.image_url ? (
                      <img
                        src={story.image_url}
                        alt={story.title || "Story"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                        <span className="text-xl">📸</span>
                      </div>
                    )}
                  </div>
                </div>
                {story.title && (
                  <p className="text-xs text-gray-600 mt-1 text-center truncate w-16 font-body">
                    {story.title}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Story Modal */}
      {currentStory && selectedStoryIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width:
                      index < selectedStoryIndex
                        ? "100%"
                        : index === selectedStoryIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={closeStory}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons (Desktop) */}
          {selectedStoryIndex > 0 && (
            <button
              onClick={goToPreviousStory}
              className="absolute left-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors hidden md:flex"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {selectedStoryIndex < stories.length - 1 && (
            <button
              onClick={goToNextStory}
              className="absolute right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors hidden md:flex"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Story Content */}
          <div
            className="relative w-full h-full max-w-md max-h-[80vh] md:max-h-[90vh] flex items-center justify-center cursor-pointer"
            onClick={handleStoryClick}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {currentStory.image_url && (
              <img
                src={currentStory.image_url}
                alt={currentStory.title || "Story"}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
            {currentStory.video_url && (
              <video
                src={currentStory.video_url}
                className="max-w-full max-h-full object-contain rounded-lg"
                autoPlay
                loop
                muted
                playsInline
              />
            )}

            {/* Story Title & Link */}
            {(currentStory.title || currentStory.link_url) && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                {currentStory.title && (
                  <p className="text-white font-semibold font-heading mb-2">{currentStory.title}</p>
                )}
                {currentStory.link_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLinkClick();
                    }}
                    className="flex items-center gap-2 text-white text-sm hover:text-cyan-300 transition-colors font-body"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver mais
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}


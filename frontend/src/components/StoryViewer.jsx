import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

const StoryViewer = ({ stories, onClose, user, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const currentStory = stories[currentIndex];
  const isOwnStory = user && currentStory.user._id === user._id;

  useEffect(() => {
    if (!currentStory) return;

    setIsLiked(currentStory.likes?.some(like => like._id === user?._id) || false);
    setLikesCount(currentStory.likes?.length || 0);

    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const updateProgress = () => {
      if (isPaused) return;
      currentStep++;
      setProgress((currentStep / steps) * 100);
      if (currentStep >= steps) {
        nextStory();
      }
    };

    timerRef.current = setInterval(updateProgress, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, stories, isPaused]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleDoubleTap = async (e) => {
    e.stopPropagation();
    if (isOwnStory) return; // Can't like own story

    try {
      const response = await api.post(`/stories/like/${currentStory._id}`);
      setIsLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (err) {
      console.error('Failed to like story:', err);
    }
  };

  const handleTap = () => {
    setIsPaused(!isPaused);
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative w-full h-full max-w-lg max-h-screen" onClick={(e) => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-gray-600 rounded">
              <div
                className="h-full bg-white rounded transition-all duration-50"
                style={{ width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        <div className="bg-black h-full flex flex-col items-center justify-center rounded-lg">
          <img
            src={currentStory.image}
            alt="story"
            className="max-h-full max-w-full object-contain"
            onClick={handleTap}
            onDoubleClick={handleDoubleTap}
          />
          <button className="absolute top-2 right-2 text-white text-2xl font-bold" onClick={onClose}>&times;</button>

          {/* Like button */}
          {!isOwnStory && (
            <button
              onClick={handleDoubleTap}
              className={`absolute bottom-4 left-4 p-3 rounded-full ${isLiked ? 'bg-red-500' : 'bg-black bg-opacity-50'}`}
            >
              <i className={`ri-heart-${isLiked ? 'fill' : 'line'} text-white text-xl`}></i>
            </button>
          )}

          {isOwnStory && (
            <>
              <button
                className="absolute top-2 left-2 text-white text-xl bg-black bg-opacity-50 rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this story?')) {
                    onDelete(currentStory._id);
                  }
                }}
              >
                <i className="ri-delete-bin-line"></i>
              </button>
              <div className="absolute bottom-4 left-4 flex gap-4">
                <button
                  className="text-white bg-black bg-opacity-50 rounded px-2 py-1 flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowViewers(!showViewers);
                    setShowLikes(false);
                  }}
                >
                  <i className="ri-eye-line"></i>
                  <span>{currentStory.viewers ? currentStory.viewers.length : 0}</span>
                </button>
                <button
                  className="text-white bg-black bg-opacity-50 rounded px-2 py-1 flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLikes(!showLikes);
                    setShowViewers(false);
                  }}
                >
                  <i className="ri-heart-line"></i>
                  <span>{likesCount}</span>
                </button>
              </div>
            </>
          )}
        </div>
        {showViewers && isOwnStory && (
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 text-white p-4 max-h-48 overflow-y-auto rounded-t-lg">
            <h3 className="text-lg font-semibold mb-2">Viewed by</h3>
            {currentStory.viewers && currentStory.viewers.length > 0 ? (
              currentStory.viewers.map((viewer, index) => (
                <div key={index} className="flex items-center gap-2 py-1">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-sm">
                    {viewer.username.charAt(0).toUpperCase()}
                  </div>
                  <span>{viewer.username}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No views yet</p>
            )}
          </div>
        )}
        {/* Likes list */}
        {showLikes && isOwnStory && (
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 text-white p-4 max-h-48 overflow-y-auto rounded-t-lg">
            <h3 className="text-lg font-semibold mb-2">Liked by</h3>
            {currentStory.likes && currentStory.likes.length > 0 ? (
              currentStory.likes.map((liker, index) => (
                <div key={index} className="flex items-center gap-2 py-1">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-sm">
                    {liker.username.charAt(0).toUpperCase()}
                  </div>
                  <span>{liker.username}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No likes yet</p>
            )}
          </div>
        )}      </div>
    </div>
  );
};

export default StoryViewer;

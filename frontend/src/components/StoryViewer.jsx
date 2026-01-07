import React, { useState, useEffect, useRef } from 'react';

const StoryViewer = ({ stories, onClose, user, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const currentStory = stories[currentIndex];
  const isOwnStory = user && currentStory.user._id === user._id;

  useEffect(() => {
    if (!currentStory) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const updateProgress = () => {
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
  }, [currentIndex, stories]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleTap = (e) => {
    const { clientX } = e;
    const screenWidth = window.innerWidth;
    if (clientX < screenWidth / 2) {
      prevStory();
    } else {
      nextStory();
    }
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
          <img src={currentStory.image} alt="story" className="max-h-full max-w-full object-contain" onClick={handleTap} />
          <button className="absolute top-2 right-2 text-white text-2xl font-bold" onClick={onClose}>&times;</button>
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
              <button
                className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 rounded px-2 py-1 flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewers(!showViewers);
                }}
              >
                <i className="ri-eye-line"></i>
                <span>{currentStory.viewers ? currentStory.viewers.length : 0}</span>
              </button>
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
      </div>
    </div>
  );
};

export default StoryViewer;

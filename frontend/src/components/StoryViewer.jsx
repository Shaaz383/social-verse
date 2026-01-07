import React from 'react';

const StoryViewer = ({ story, onClose }) => {
  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative w-full h-full max-w-lg max-h-screen" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black h-full flex flex-col items-center justify-center rounded-lg">
          <img src={story.image} alt="story" className="max-h-full max-w-full object-contain" />
          <button className="absolute top-2 right-2 text-white text-2xl font-bold" onClick={onClose}>&times;</button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;

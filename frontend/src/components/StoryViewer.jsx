import React, { useState } from 'react';

const StoryViewer = ({ story, onClose, user, onDelete }) => {
  const [showViewers, setShowViewers] = useState(false);

  if (!story) return null;

  const isOwnStory = user && story.user._id === user._id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative w-full h-full max-w-lg max-h-screen" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black h-full flex flex-col items-center justify-center rounded-lg">
          <img src={story.image} alt="story" className="max-h-full max-w-full object-contain" />
          <button className="absolute top-2 right-2 text-white text-2xl font-bold" onClick={onClose}>&times;</button>
          {isOwnStory && (
            <>
              <button
                className="absolute top-2 left-2 text-white text-xl bg-black bg-opacity-50 rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this story?')) {
                    onDelete(story._id);
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
                <span>{story.viewers ? story.viewers.length : 0}</span>
              </button>
            </>
          )}
        </div>
        {showViewers && isOwnStory && (
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 text-white p-4 max-h-48 overflow-y-auto rounded-t-lg">
            <h3 className="text-lg font-semibold mb-2">Viewed by</h3>
            {story.viewers && story.viewers.length > 0 ? (
              story.viewers.map((viewer, index) => (
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

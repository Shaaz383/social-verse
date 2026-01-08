import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const UploadStory = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleUpload = async () => {
        if (!image) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            await api.post('/stories/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/feed');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
            <div className="w-full px-4 max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-center mb-8">Create New Story</h1>
                <div
                    className={`mt-5 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {preview ? (
                        <div className="space-y-4">
                            <img src={preview} alt="preview" className="w-full max-h-64 object-cover rounded" />
                            <button
                                onClick={() => {
                                    setImage(null);
                                    setPreview(null);
                                }}
                                className="text-red-500 hover:text-red-400"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-4xl text-gray-400">
                                <i className="ri-image-line"></i>
                            </div>
                            <p className="text-lg">Drag and drop your image here</p>
                            <p className="text-sm text-gray-400">or</p>
                            <label className="inline-block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <span className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer">
                                    Choose from device
                                </span>
                            </label>
                        </div>
                    )}
                </div>
                {image && (
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className={`w-full py-3 rounded mt-6 font-semibold ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                        {loading ? "Uploading..." : "Add Story"}
                    </button>
                )}
            </div>
            <Navbar />
        </div>
    );
};

export default UploadStory;

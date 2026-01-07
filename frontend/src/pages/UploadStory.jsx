import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const UploadStory = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!image) return;

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
        }
    };

    return (
        <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
            <div className="w-full px-4">
                <h1 className="text-2xl">Upload Story</h1>
                <div className="mt-5">
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {preview && <img src={preview} alt="preview" className="mt-5 w-1/2" />}
                    <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded mt-5">
                        Upload
                    </button>
                </div>
            </div>
            <Navbar />
        </div>
    );
};

export default UploadStory;

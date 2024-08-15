import React, { useState } from 'react';
import axios, { AxiosProgressEvent } from 'axios';
import Sidebar from './Sidebar';
const VideoUpload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [video, setVideo] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [step, setStep] = useState(1);

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setVideo(file);
            setVideoUrl(URL.createObjectURL(file));
            setStep(2);
        }
    };

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setThumbnail(file);
            setThumbnailUrl(URL.createObjectURL(file));
        }
    };

    const handleNext = () => {
        setStep(3);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !description || !video || !thumbnail) {
            alert('All fields are required');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('video', video);
        formData.append('thumbnail', thumbnail);

        try {
            setIsUploading(true);
            setUploadProgress(0);
            axios.defaults.withCredentials = true;
            await axios.post('http://localhost:7000/api/v1/videos/publish', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    const { loaded, total } = progressEvent;
                    if (total) {
                        const percentCompleted = Math.round((loaded * 100) / total);
                        setUploadProgress(percentCompleted);
                    }
                },
            });

            alert('Video uploaded successfully!');
            // Reset fields after successful upload
            setTitle('');
            setDescription('');
            setVideo(null);
            setThumbnail(null);
            setVideoUrl(null);
            setThumbnailUrl(null);
            setStep(1);
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <Sidebar />
        <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-gray-950 rounded-lg shadow-lg">
            {step === 1 && (
                <div className="text-center">
                    <label htmlFor="video-upload" className="cursor-pointer block p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <input 
                            type="file" 
                            id="video-upload" 
                            className="hidden"
                            accept="video/*"
                            onChange={handleVideoSelect} 
                        />
                        <p className="text-gray-600 dark:text-gray-400">Click to upload a video</p>
                    </label>
                </div>
            )}

            {step === 2 && videoUrl && (
                <div className="space-y-4">
                    <div className="aspect-w-16 aspect-h-9">
                        <video src={videoUrl} controls className="w-full rounded-lg" />
                    </div>
                    <label htmlFor="thumbnail-upload" className="block text-center cursor-pointer p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <input 
                            type="file" 
                            id="thumbnail-upload" 
                            className="hidden"
                            accept="image/*"
                            onChange={handleThumbnailSelect} 
                        />
                        <p className="text-gray-600 dark:text-gray-400">Click to upload a thumbnail</p>
                    </label>
                    {thumbnailUrl && (
                        <div className="aspect-w-16 aspect-h-9">
                            <img src={thumbnailUrl} alt="Thumbnail Preview" className="w-full rounded-lg" />
                        </div>
                    )}
                    <button
                        onClick={handleNext}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none transition duration-150 ease-in-out"
                    >
                        Next
                    </button>
                </div>
            )}

            {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                            Title
                        </label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                            Description
                        </label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                            Category
                        </label>
                        <select 
                            className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="Education">Education</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Music">Music</option>
                            <option value="Gaming">Gaming</option>
                            <option value="News">News</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                            Tags
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g. tutorial, funny, music"
                            className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {uploadProgress > 0 && (
                        <div className="my-4">
                            <p className="text-gray-600 dark:text-gray-300">Upload Progress: {uploadProgress}%</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <div className="bg-blue-600 h-2" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}
                    {isUploading && (
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none transition duration-150 ease-in-out"
                        disabled={isUploading}
                    >
                        Upload Video
                    </button>
                </form>
            )}
        </div>
        </>
    );
};

export default VideoUpload;

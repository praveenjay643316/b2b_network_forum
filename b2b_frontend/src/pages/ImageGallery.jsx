import React, { useEffect, useState, useRef } from 'react'
import PageHeader from '../components/utils/PageHeader'
import SummaryApi from '../common/Summaryapi';
import Axios from '../utils/axios';
import ConfirmBox from '../components/design/ConfirmBox';
import { toast } from 'react-toastify';

const ImageGallery = () => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const fileInputRef = useRef();
    const [showConfirmBox, setShowConfirmBox] = useState(false);
    const [targetImageId, setTargetImageId] = useState(null);


    // Fetch images from backend
    const getImages = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.get_images, // You'll need to add this to your SummaryApi
            });

            if (response.data && Array.isArray(response.data.data)) {
                const imageData = response.data.data;
                setImages(imageData);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle file selection
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter(file => 
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
        );

        if (validFiles.length !== files.length) {
            alert('Some files were skipped. Only image files under 5MB are allowed.');
        }

        setSelectedFiles(validFiles);

        // Create preview URLs
        const urls = validFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    // Upload images to backend
    const uploadImages = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select images to upload');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            
            selectedFiles.forEach((file, index) => {
                formData.append(`images`, file);
            });

            const response = await Axios({
                ...SummaryApi.upload_images, // You'll need to add this to your SummaryApi
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('Images uploaded successfully!');
                setSelectedFiles([]);
                setPreviewUrls([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                getImages(); // Refresh the gallery
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            toast.error('Error uploading images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Delete image
    const deleteImage = async (imageId) => {
        try {
            const response = await Axios({
                ...SummaryApi.delete_image,
                data: { imageId }
            });

            if (response.data.success) {
                toast.success("Image deleted successfully");
                getImages(); // Refresh the gallery
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            alert('Error deleting image. Please try again.');
        }
    };

    const handleDeleteClick = (imageId) => {
            setTargetImageId(imageId);
            setShowConfirmBox(true);
        };



    // Clear selection
    const clearSelection = () => {
        setSelectedFiles([]);
        setPreviewUrls([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        getImages();
    }, []);

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    return (
        <div>
            <PageHeader title="Image Gallery" />
            
            {/* Upload Section */}
            <div className="bg-white border p-4 dark:bg-darkinfo text-gray-900 dark:text-white rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-3">Upload Images</h3>
                
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        
                        <button
                            onClick={uploadImages}
                            disabled={uploading || selectedFiles.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                        
                        {selectedFiles.length > 0 && (
                            <button
                                onClick={clearSelection}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    
                    {selectedFiles.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedFiles.length} file(s) selected
                        </div>
                    )}
                </div>

                {/* Preview selected images */}
                {previewUrls.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-md font-medium mb-2">Preview:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-24 object-cover rounded border"
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                        {selectedFiles[index].name.length > 10 
                                            ? selectedFiles[index].name.substring(0, 10) + '...' 
                                            : selectedFiles[index].name
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Gallery Section */}
            <div className="bg-white border p-4 dark:bg-darkinfo text-gray-900 dark:text-white rounded-lg overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Gallery ({images.length} images)</h3>
                    <button
                        onClick={getImages}
                        disabled={loading}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div>Loading images...</div>
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex justify-center items-center h-32 text-gray-500">
                        <div>No images found. Upload some images to get started!</div>
                    </div>
                ) : (
                    <div className="overflow-y-auto h-full">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {images.map((image) => (
                                <div key={image._id || image.id} className="relative group">
                                    <div className="aspect-square overflow-hidden rounded-lg border">
                                        <img
                                            src={`https://growsooninfotech.com/webhook/api/${image.url}`}
                                            alt={image.name || image.filename || 'Gallery image'}
                                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    
                                    {/* Image overlay with info and actions */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                            <button
                                                onClick={() => window.open(`https://growsooninfotech.com/webhook/api/${image.url}` || image.path, '_blank')}
                                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(image.id)}
                                                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Image info */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="text-white text-xs">
                                            <div className="font-medium truncate">
                                                {image.name || image.filename || 'Untitled'}
                                            </div>
                                            {image.createdAt && (
                                                <div className="text-gray-300">
                                                    {new Date(image.createdAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {showConfirmBox && (
  <ConfirmBox
    close={() => setShowConfirmBox(false)}
    cancel={() => setShowConfirmBox(false)}
    confirm={() => {
      deleteImage(targetImageId);
      setShowConfirmBox(false);
    }}
  />
)}

        </div>
    )
}

export default ImageGallery
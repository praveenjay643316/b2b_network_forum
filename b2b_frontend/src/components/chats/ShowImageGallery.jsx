import React, { useEffect, useState } from "react";
import SummaryApi from "../../common/Summaryapi";
import Axios from "../../utils/axios";
import { MdClose } from "react-icons/md";

const ShowImageGallery = ({ setShowImageGallery, setShowAttachment,sendImage }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedImageUrls, setSelectedImageUrls] = useState([]);

  const handleImageSelect = (imageUrl) => {
    setSelectedImageUrls((prevSelected) => {
      if (prevSelected.includes(imageUrl)) {
        return prevSelected.filter((url) => url !== imageUrl); // deselect
      } else {
        return [...prevSelected, imageUrl]; // select
      }
    });
  };


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

  useEffect(() => {
    getImages();
  }, []);

  useEffect(() => {
    console.log("Selected URLs:", selectedImageUrls);
  }, [selectedImageUrls]);


  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);
  return (
    <section className="fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-60 z-50 flex items-center justify-center">
      {/* Gallery Section */}
      <div className="bg-white border p-4 dark:bg-darkinfo text-gray-900 dark:text-white rounded-lg overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Gallery ({images.length} images)
          </h3>
          <div className="flex gap-3">
            <button
              onClick={getImages}
              disabled={loading}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button onClick={() => { setShowImageGallery(false); setShowAttachment(false); }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400">
              <MdClose size={20} />
            </button>
          </div>
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
                      src={`https://growsooninfotech.com/webhook/api${image.url}`}
                      alt={image.name || image.filename || "Gallery image"}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Image overlay with info and actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-2 items-center">
                      <button
                        onClick={() =>
                          window.open(
                            `https://growsooninfotech.com/webhook/api${image.url}` || image.path,
                            "_blank"
                          )
                        }
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          handleImageSelect(`https://growsooninfotech.com/webhook/api${image.url}`)
                        }
                        className={`px-2 py-1 text-white rounded text-xs ${selectedImageUrls.includes(
                          `https://growsooninfotech.com/webhook/api${image.url}`
                        )
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 hover:bg-gray-700"
                          }`}
                      >
                        {selectedImageUrls.includes(
                          `https://growsooninfotech.com/webhook/api${image.url}`
                        )
                          ? "Selected"
                          : "Select"}
                      </button>
                    </div>

                  </div>

                  {/* Image info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="text-white text-xs">
                      <div className="font-medium truncate">
                        {image.name || image.filename || "Untitled"}
                      </div>
                      {image.realtime && (
                        <div className="text-gray-300">
                          {new Date(image.realtime).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
              onClick={()=>{sendImage(selectedImageUrls);setShowImageGallery(false);}}
                type="submit"
                disabled={selectedImageUrls.length === 0}

                className="px-6 py-2 bg-primary text-white hover:text-black hover:dark:text-white rounded border border-primary hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShowImageGallery;

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import api from "../utils/axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for the Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to handle map clicks
const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [position, setPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);

  const categories = ["general", "public-service", "security", "enviromental", "social"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 13);
          }
        },
        (error) => {
          setError("Could not get your current location. Please try again.");
          console.error(error);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const clearLocation = () => {
    setPosition(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      
      if (image) {
        formData.append("image", image);
      }
      
      if (position) {
        formData.append("latitude", position[0]);
        formData.append("longitude", position[1]);
      }

      await api.post("/post/create", formData);
      
      // Reset form after successful submission
      setTitle("");
      setContent("");
      setCategory("general");
      clearImage();
      clearLocation();
      
      // Close the modal
      document.getElementById("my_modal_3").close();
      
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.response?.data?.message || "Error creating post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <button 
              type="button" 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("my_modal_3").close()}
            >
              ✕
            </button>
            
            <h3 className="font-bold text-lg mb-4">Create New Post</h3>
            
            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title" 
                className="input input-bordered w-full" 
                required
              />
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Content</span>
              </label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter post content" 
                className="textarea textarea-bordered h-24 w-full" 
                required
              />
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Category</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Image (optional)</span>
              </label>
              <div className="flex flex-col gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-input file-input-bordered w-full" 
                />
                {imagePreview && (
                  <div className="relative mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-h-40 object-contain rounded-lg"
                    />
                    <button 
                      type="button"
                      onClick={clearImage}
                      className="btn btn-circle btn-sm btn-error absolute top-2 right-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Location (optional)</span>
              </label>
              <div className="h-64 w-full rounded-lg overflow-hidden mb-2">
                <MapContainer 
                  center={[51.505, -0.09]} 
                  zoom={13} 
                  style={{ height: "100%", width: "100%" }}
                  whenCreated={(map) => (mapRef.current = map)}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <div className="flex gap-2 justify-start">
                <button 
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn btn-outline btn-sm"
                >
                  Use Current Location
                </button>
                <button 
                  type="button"
                  onClick={clearLocation}
                  className="btn btn-outline btn-error btn-sm"
                  disabled={!position}
                >
                  Clear Location
                </button>
              </div>
              {position && (
                <p className="text-sm mt-1">
                  Selected location: {position[0].toFixed(4)}, {position[1].toFixed(4)}
                </p>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                type="button"
                className="btn btn-outline"
                onClick={() => document.getElementById("my_modal_3").close()}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !title || !content}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Creating Post...
                  </>
                ) : (
                  "Create Post"
                )}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};
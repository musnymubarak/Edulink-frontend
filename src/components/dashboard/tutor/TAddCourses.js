import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Footer from "../Footer";
import { FiPlus, FiUpload, FiSave } from "react-icons/fi";
import "../../css/tutor/TAddCourses.css";

export default function TAddCourses() {
  const navigate = useNavigate();

  // Retrieve stored form data or initialize default values
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("courseFormData");
    const selectedSection = localStorage.getItem("selectedSection");
    
    return savedData
      ? JSON.parse(savedData)
      : {
          courseName: "",
          category: "",
          courseDescription: "",
          whatYouWillLearn: "",
          thumbnail: "",
          tag: "",
          instructions: "",
          status: "Draft",
          courseContent: selectedSection ? [JSON.parse(selectedSection)] : [],
        };
  });

  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("courseFormData", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const uploadThumbnail = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "edulink_uploads");
    data.append("cloud_name", "dhgyagjqw");
    data.append("folder", "course_thumbnails");

    setUploading(true);

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dhgyagjqw/image/upload", {
        method: "POST",
        body: data,
      });

      const uploadedImage = await res.json();
      setFormData((prevFormData) => ({
        ...prevFormData,
        thumbnail: uploadedImage.url,
      }));
      setMessage({ type: "success", text: "Thumbnail uploaded successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload thumbnail." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Authentication token is missing. Please log in." });
        return;
      }

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));
      const userId = payload.id;

      const response = await axios.post(
        "https://edulink-backend-o9jo.onrender.com/api/v1/courses/add",
        { ...formData, tutor: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        setMessage({ type: "success", text: "Course added successfully!" });
        localStorage.removeItem("courseFormData");
        localStorage.removeItem("selectedSection"); 
        setFormData({
          courseName: "",
          category: "",
          courseDescription: "",
          whatYouWillLearn: "",
          thumbnail: "",
          tag: "",
          instructions: "",
          status: "Draft",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "An error occurred." });
    }
  };

  const handleRedirect = () => {
    navigate("/dashboard/tutor/add-section");
  };

  return (
    <div className="flex min-h-screen pb-20 pt-20 bg-gray-100">
      <Header/>
      <div className="fixed top-0 left-0 w-64 h-screen bg-richblue-800 border-r border-richblack-700">
        <Sidebar />
      </div>

      <div className="ml-64 p-8 w-[calc(100%-16rem)]">
        <h1 className="tutor-add-course-title">Add New Course</h1>

        {message && (
          <div className={`message-container ${message.type === "success" ? "message-success" : "message-error"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-container max-w-4xl mx-auto">
          <div className="form-group">
            <label className="form-label">Course Name</label>
            <input 
              type="text" 
              name="courseName" 
              value={formData.courseName} 
              onChange={handleChange} 
              required 
              className="form-input"
              placeholder="Enter course name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select a category</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="personal">Personal Development</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              name="courseDescription" 
              value={formData.courseDescription} 
              onChange={handleChange} 
              className="form-textarea"
              placeholder="Enter course description"
            />
          </div>

          <div className="form-group">
            <label className="form-label">What You Will Learn</label>
            <textarea 
              name="whatYouWillLearn" 
              value={formData.whatYouWillLearn} 
              onChange={handleChange} 
              className="form-textarea"
              placeholder="Enter learning outcomes"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Thumbnail</label>
            <div className="thumbnail-upload" onClick={() => document.getElementById('thumbnail').click()}>
              {formData.thumbnail ? (
                <img 
                  src={formData.thumbnail} 
                  alt="Thumbnail Preview" 
                  className="thumbnail-preview" 
                />
              ) : (
                <>
                  <FiUpload className="upload-icon" />
                  <p className="upload-text">Click to upload thumbnail</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              id="thumbnail"
              accept="image/*" 
              onChange={uploadThumbnail} 
              className="form-input"
              style={{ display: 'none' }}
            />
            {uploading && <p className="upload-status">Uploading...</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input 
              type="text" 
              name="tag" 
              value={formData.tag} 
              onChange={handleChange} 
              required 
              className="form-input"
              placeholder="e.g., web development, javascript, react"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructions</label>
            <textarea 
              name="instructions" 
              value={formData.instructions} 
              onChange={handleChange} 
              className="form-textarea"
              placeholder="Enter course instructions"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              className="form-select"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <div className="button-container">
            <button 
              onClick={handleRedirect} 
              className="add-sections-button"
              type="button"
            >
              <FiPlus />
              Add Sections
            </button>

            <button 
              type="submit" 
              className="submit-button"
            >
              <FiSave />
              Create Course
            </button>
          </div>
        </form>
      </div>
      <Footer/>
    </div>
  );
}

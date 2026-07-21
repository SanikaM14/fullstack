import React, { useCallback, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiUpload, FiClock, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

import { useMascot } from './Mascot/MascotProvider';

const UploadBox = ({ onMemoryAdded }) => {
  const { triggerState } = useMascot();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; 

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user-info', {
        withCredentials: true
      });
      
      if (response.data) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('User not authenticated:', error);
      setIsAuthenticated(false);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      setUploadStatus({ type: 'error', message: `${file.name} is not an image file. Only images are supported.` });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadStatus({ type: 'error', message: `${file.name} is too large. Maximum size is 10MB.` });
      return false;
    }
    return true;
  }, [MAX_FILE_SIZE]);

  const createPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = useCallback(async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    setUploadedFileName(file.name);
    
    triggerState('uploading');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8080/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, 
        timeout: 30000, 
      });

      triggerState('uploadSuccess');
      onMemoryAdded(response.data);
      setUploadStatus({ type: 'success', message: `✨ ${file.name} analyzed successfully!` });
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setPreviewImage(null);
        setUploadedFileName(null);
        setUploadStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      let errorMessage = 'Upload failed. ';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentication required. Redirecting to login...';
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          errorMessage += error.response.data?.message || 'Server error occurred.';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.request) {
        errorMessage += 'Could not connect to server. Make sure the backend is running.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      triggerState('error', { text: "Oops... couldn't upload that." });
      setUploadStatus({ type: 'error', message: errorMessage });
      setIsUploading(false);
      setUploadProgress(0);
      setPreviewImage(null);
      setUploadedFileName(null);
      
      setTimeout(() => {
        setUploadStatus(null);
      }, 5000);
    }
  }, [onMemoryAdded, triggerState]);

  const handleFiles = useCallback(async (files) => {
    if (files.length === 0) return;

    if (!isAuthenticated) {
      setUploadStatus({ 
        type: 'error', 
        message: 'You need to be logged in to upload memories. Redirecting to login...' 
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setUploadStatus({ type: 'error', message: 'No image files found. Please select image files only.' });
      return;
    }

    if (imageFiles.length > 1) {
      setUploadStatus({ type: 'info', message: `Processing ${imageFiles.length} images...` });
    }

    for (const file of imageFiles) {
      if (validateFile(file)) {
        createPreview(file);
        await uploadFile(file);
      }
    }
  }, [isAuthenticated, validateFile, uploadFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="upload-section">
      <div
        className={`upload-box ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''} ${previewImage ? 'has-preview' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          {previewImage && !isUploading ? (
            <div className="preview-container">
              <img src={previewImage} alt="Preview" className="preview-image" />
              <div className="preview-overlay">
                <span className="preview-filename">{uploadedFileName}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="upload-icon">
                {isUploading ? <FiClock /> : <FiUpload />}
              </div>
              <h3>
                {isUploading 
                  ? 'Analyzing your memory...' 
                  : isDragging 
                    ? 'Drop it like it\'s hot!' 
                    : isAuthenticated
                      ? 'Drop your memories here'
                      : 'Please login to upload memories'}
              </h3>
              <p>
                {isUploading 
                  ? 'Extracting colors, finding year, and discovering mood...' 
                  : isAuthenticated
                    ? 'Upload photos to analyze colors, extract years, and generate flashbacks'
                    : 'You need to be logged in to upload memories'}
              </p>
              
              {!isAuthenticated && (
                <button 
                  className="login-btn"
                  onClick={() => window.location.reload()}
                >
                  Login
                </button>
              )}
            </>
          )}
          
          {isAuthenticated && !isUploading && (
            <>
              <label htmlFor="file-upload" className="upload-btn">
                {previewImage ? 'Choose Another File' : 'Choose Files'}
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <p className="upload-hint">Supports JPG, PNG, GIF, WEBP • Max 10MB per file</p>
            </>
          )}

          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {uploadProgress < 50 ? 'Uploading...' : uploadProgress < 90 ? 'Processing...' : 'Almost done...'} {uploadProgress}%
              </span>
            </div>
          )}

          {uploadStatus && (
            <div className={`upload-status ${uploadStatus.type}`}>
              <span className="status-icon">
                {uploadStatus.type === 'success' ? <FiCheck /> : uploadStatus.type === 'error' ? <FiAlertCircle /> : <FiInfo />}
              </span>
              <span className="status-message">{uploadStatus.message}</span>
            </div>
          )}
        </div>
        
        <div className="upload-effects">
          <div className="effect-pulse"></div>
          <div className="effect-pulse delay-1"></div>
          <div className="effect-pulse delay-2"></div>
        </div>
      </div>
    </div>
  );
};

export default UploadBox;
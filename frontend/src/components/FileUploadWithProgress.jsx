import React, { useState, useRef } from 'react';
import { uploadFileToStorage, formatFileSize, validateFile } from '../config/storageUtils';
import './FileUploadWithProgress.css';

/**
 * FileUploadWithProgress Component
 * Advanced file upload component with:
 * - Unlimited file size support
 * - Progress tracking
 * - Resumable uploads
 * - Multiple file support
 * - Preview for images/videos
 */

const FileUploadWithProgress = ({ 
  onUploadComplete, 
  onUploadError,
  accept = '*',
  multiple = false,
  folder = 'uploads',
  showPreview = true,
  maxFiles = 10
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (!multiple && selectedFiles.length > 1) {
      alert('Please select only one file');
      return;
    }

    if (selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add preview URLs for images and videos
    const filesWithPreview = selectedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') || file.type.startsWith('video/') 
        ? URL.createObjectURL(file) 
        : null,
      status: 'ready', // ready, uploading, completed, error
      progress: 0,
      url: null,
      error: null
    }));

    setFiles(filesWithPreview);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading' } : f
        ));

        try {
          // Upload file with progress tracking
          const url = await uploadFileToStorage(
            fileData.file,
            (progressPercent) => {
              setProgress(prev => ({
                ...prev,
                [fileData.id]: progressPercent
              }));
            },
            folder
          );

          // Update file status to completed
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'completed', url, progress: 100 } 
              : f
          ));

          uploadedUrls.push({
            originalName: fileData.file.name,
            url,
            type: fileData.file.type,
            size: fileData.file.size
          });

        } catch (error) {
          console.error(`Error uploading ${fileData.file.name}:`, error);
          
          // Update file status to error
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'error', error: error.message } 
              : f
          ));

          if (onUploadError) {
            onUploadError(error, fileData.file.name);
          }
        }
      }

      if (onUploadComplete && uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls);
      }

    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
    
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const clearAll = () => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    setProgress({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return '📄';
      case 'uploading':
        return '⏳';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return '#888';
      case 'uploading':
        return '#2196F3';
      case 'completed':
        return '#4CAF50';
      case 'error':
        return '#f44336';
      default:
        return '#888';
    }
  };

  return (
    <div className="file-upload-with-progress">
      <div className="upload-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload-input"
        />
        
        <label htmlFor="file-upload-input" className="select-files-btn">
          📁 Select Files
        </label>

        {files.length > 0 && (
          <div className="control-buttons">
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="upload-btn"
            >
              {uploading ? '⏳ Uploading...' : '🚀 Upload'}
            </button>
            
            <button
              onClick={clearAll}
              disabled={uploading}
              className="clear-btn"
            >
              🗑️ Clear All
            </button>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="files-list">
          <h4>Selected Files ({files.length})</h4>
          
          {files.map(fileData => (
            <div key={fileData.id} className="file-item">
              <div className="file-info">
                <span className="status-icon">{getStatusIcon(fileData.status)}</span>
                
                {showPreview && fileData.preview && (
                  <div className="file-preview">
                    {fileData.file.type.startsWith('image/') ? (
                      <img src={fileData.preview} alt="Preview" />
                    ) : fileData.file.type.startsWith('video/') ? (
                      <video src={fileData.preview} controls />
                    ) : null}
                  </div>
                )}
                
                <div className="file-details">
                  <div className="file-name">{fileData.file.name}</div>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(fileData.file.size)}</span>
                    <span className="file-type">{fileData.file.type || 'unknown'}</span>
                  </div>
                  
                  {fileData.status === 'error' && (
                    <div className="error-message">
                      ❌ {fileData.error}
                    </div>
                  )}
                  
                  {fileData.status === 'completed' && fileData.url && (
                    <div className="success-message">
                      ✅ Uploaded successfully
                      <a href={fileData.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </div>
                  )}
                </div>

                {fileData.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="remove-file-btn"
                    disabled={uploading}
                  >
                    ✕
                  </button>
                )}
              </div>

              {fileData.status === 'uploading' && (
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progress[fileData.id] || 0}%`,
                      backgroundColor: getStatusColor(fileData.status)
                    }}
                  />
                  <span className="progress-text">
                    {(progress[fileData.id] || 0).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="upload-info">
        <p>✨ <strong>Unlimited file size support</strong> - Upload files of any size</p>
        <p>📦 Supported formats: Images, Videos, Audio, Documents, Archives, and more</p>
        <p>⚡ Resumable uploads with real-time progress tracking</p>
      </div>
    </div>
  );
};

export default FileUploadWithProgress;

import React, { useRef } from 'react';
import { FiUpload } from 'react-icons/fi';

/**
 * Reusable image uploader component with drag & drop and validation support.
 *
 * @param {string} id - The ID for the file input.
 * @param {string} image - Base64 preview data URL or external URL of the current image.
 * @param {function} onImageChange - Callback triggered when a new valid image is loaded, receives the base64 string.
 * @param {string} error - Validation error message to display under the uploader.
 * @param {boolean} required - Whether the uploader requires a file selection.
 * @param {number} maxSizeMB - Max file size in megabytes (default 5).
 */
export default function ImageUploader({
  id = 'image-uploader',
  image,
  onImageChange,
  error,
  required = false,
  maxSizeMB = 5
}) {
  const fileReaderRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Harap gunakan format PNG, JPG, atau JPEG.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Ukuran file maksimal adalah ${maxSizeMB}MB.`);
      return;
    }

    // Clean up previous reader if active
    if (fileReaderRef.current && fileReaderRef.current.readyState === 1) {
      fileReaderRef.current.abort();
    }

    const reader = new FileReader();
    fileReaderRef.current = reader;
    reader.onloadend = () => {
      if (onImageChange) {
        onImageChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="modal-form-group">
      <label className="modal-form-label">
        Foto Kondisi Aset {required && <span className="req-star">*</span>}
      </label>
      <div 
        className={`modal-upload-box-wrapper ${error ? 'upload-error' : ''}`}
        id={`${id}-container`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={id}
          className="hidden-file-input"
          onChange={handleFileChange}
          accept="image/*"
          required={required && !image}
        />
        <label htmlFor={id} className="modal-upload-label-area">
          {image ? (
            <img 
              src={image} 
              alt="Preview" 
              className="upload-preview-thumbnail-img" 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&fit=crop';
              }}
            />
          ) : (
            <>
              <FiUpload size={36} color="#94a3b8" />
              <span className="upload-main-prompt">Klik untuk upload foto atau drag and drop</span>
              <span className="upload-sub-prompt">PNG, JPG, JPEG (Max. {maxSizeMB}MB)</span>
            </>
          )}
        </label>
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

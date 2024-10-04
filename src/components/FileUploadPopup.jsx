import React from 'react';

const FileUploadPopup = ({ file, onClose, onSend }) => {
    return (
        <div className="file-upload-popup">
            <div className="file-info">
                <p><strong>File Name:</strong> {file.fileName}</p>
                <p><strong>File Type:</strong> {file.fileType}</p>
                <p><strong>File Size:</strong> {file.fileSize}</p>
            </div>
            <div className="file-actions">
                <button onClick={onSend}>Send</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default FileUploadPopup;

import React from 'react';

const FilePreview = ({ fileName, fileType, fileSize, fileURL }) => {
    return (
        <div className="file-preview">
            <div className="file-info">
                <p>{fileName}</p>
                <p>{fileSize}, {fileType}</p>
            </div>
            <div className="file-actions">
                <a href={fileURL} target="_blank" rel="noopener noreferrer">Open</a>
                <a href={fileURL} download>Save as...</a>
            </div>
        </div>
    );
};

export default FilePreview;

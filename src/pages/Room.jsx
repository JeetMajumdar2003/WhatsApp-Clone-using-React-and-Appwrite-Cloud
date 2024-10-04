import React, { useState, useEffect, useRef } from 'react';
import { databases, storage, DATABASE_ID, COLLECTION_ID_MESSAGES, BUCKET_ID } from '../appwriteConfig';
import { ID, Query } from 'appwrite';
import { Smile, Send, Paperclip, Mic } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
// import FilePreview from '../components/FilePreview';
// import FileUploadPopup from '../components/FileUploadPopup';

const Room = () => {
    const [messages, setMessages] = useState([]);
    // const [file, setFile] = useState(null);
    const [messageBody, setMessageBody] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    // const [showFileUploadPopup, setShowFileUploadPopup] = useState(false);
    const [onlineUsers] = useState(['Alice', 'Bob', 'Charlie']); // Simulated online users
    const messagesEndRef = useRef(null);
    // const fileInputRef = useRef(null);

    useEffect(() => {
        getMessages();
        document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
    }, [isDarkMode]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleTyping = (e) => {
        setMessageBody(e.target.value);
        setIsTyping(e.target.value.length > 0);
    };

    const handleEmojiClick = (emojiObject) => {
        setMessageBody((prevMsg) => prevMsg + emojiObject.emoji);
    };

    // Close emoji picker when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEmojiPicker && !event.target.closest('.emoji-picker-container') && !event.target.closest('.action-button')) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // const handleFileChange = (e) => {
    //     const selectedFile = e.target.files[0];
    //     if (selectedFile) {
    //         const fileDetails = {
    //             fileName: selectedFile.name,
    //             fileType: selectedFile.type,
    //             fileSize: `${(selectedFile.size / 1024).toFixed(2)} KB`,
    //         };
    //         setFile(fileDetails);
    //         setShowFileUploadPopup(true);
    //     }
    // };

    // const handleFileUpload = async () => {
    //     if (file) {
    //         try {
    //             const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
    //             const fileUrl = storage.getFileView(BUCKET_ID, response.$id);

    //             setFile({
    //                 ...file,
    //                 fileId: response.$id,
    //                 fileURL: fileUrl,
    //             });

    //             setMessageBody((prevMsg) => prevMsg + `[File: ${file.fileName}]`);
    //             setShowFileUploadPopup(false);
    //         } catch (error) {
    //             console.error('Error uploading file:', error);
    //         }
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!messageBody.trim()) return;

        setIsTyping(false);

        let payload = {
            body: messageBody,
            username: 'CurrentUser', // Replace with actual user management
        };

        // if (file) {
        //     payload = {
        //         ...payload,
        //         fileId: file.fileId,
        //         fileName: file.fileName,
        //         fileType: file.fileType,
        //         fileSize: file.fileSize,
        //         fileURL: file.fileURL,
        //     };
        // }

        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_MESSAGES,
                ID.unique(),
                payload
            );
            setMessages((prevMessages) => [...prevMessages, response]);
            // Reset file state after sending the message
            // setFile(null);
            setMessageBody('');
        } catch (error) {
            console.error('Error creating message:', error);
        }
    };

    const getMessages = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_MESSAGES,
                [Query.orderDesc('$createdAt'), Query.limit(50)]
            );
            setMessages(response.documents.reverse());
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    return (
        <>
            <div className="theme-toggle">
                <label>
                    <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={handleThemeToggle}
                    />
                    <span className="slider"></span>
                    <button onClick={handleThemeToggle}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                </label>
            </div>
            <main className="container">
                <div className="room--container">
                    <div className="online-users">
                        <h3>Online Users</h3>
                        {onlineUsers.map((user, index) => (
                            <div key={index} className="online-user">
                                <span className="online-indicator"></span>
                                {user}
                            </div>
                        ))}
                    </div>
                    <div className="messages-container">
                        {messages.map((message) => (
                            <div key={message.$id} className={`message--wrapper ${message.username === 'CurrentUser' ? 'current-user' : ''}`}>
                                <div className="message--header">
                                    <h3>{message.username}</h3>
                                    <small className="message-timestamp">
                                        {new Date(message.$createdAt).toLocaleString()}
                                    </small>
                                </div>
                                <div className="message--body">
                                    <p>{message.body}</p>
                                    {/* {message.fileId && (
                                        <FilePreview
                                            fileName={message.fileName}
                                            fileType={message.fileType}
                                            fileSize={message.fileSize}
                                            fileURL={message.fileURL}
                                        />
                                    )} */}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {isTyping && <div className="typing-indicator">Someone is typing...</div>}

                    <form id="message--form" onSubmit={handleSubmit}>
                        <div className="message-input-container">
                            <div className="message-actions">
                                <button type="button" className="action-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    <Smile />
                                </button>
                                {showEmojiPicker && (
                                    <div className="emoji-picker-container">
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>
                                )}
                                <button type="button" className="action-button" onClick={() => fileInputRef.current.click()}>
                                    <Paperclip />
                                </button>
                                {/* <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                /> */}
                            </div>
                            <textarea
                                name="message"
                                placeholder="Type your message here..."
                                onChange={handleTyping}
                                value={messageBody}
                            />
                            <div className="message-actions">
                                <button type="button" className="action-button">
                                    <Mic />
                                </button>
                                <button type="submit" className="action-button" disabled={!messageBody.trim()}>
                                    <Send />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            {/* {showFileUploadPopup && (
                <FileUploadPopup
                    file={file}
                    onClose={() => setShowFileUploadPopup(false)}
                    onConfirm={handleFileUpload}
                />
            )} */}
        </>
    );
};

export default Room;

import React, { useState, useEffect, useRef } from 'react';
import client, { databases, DATABASE_ID, COLLECTION_ID_MESSAGES } from '../appwriteConfig';
import { ID, Query } from 'appwrite';
import { Smile, Send, Trash2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const Room = () => {
    const [messages, setMessages] = useState([]);
    const [messageBody, setMessageBody] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [onlineUsers] = useState(['Alice', 'Bob', 'Charlie']); // Simulated online users
    const messagesEndRef = useRef(null);

    // Fetch messages and set theme on component mount and theme change
    useEffect(() => {
        getMessages();
        document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
    }, [isDarkMode]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Subscribe to real-time updates for messages
    useEffect(() => {
        // Fetch initial messages
        getMessages();

        // Log initial state
        console.log('Subscribing to real-time updates for messages');

        // Subscribe to real-time updates
        const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`, response => {
            // Log the response for debugging
            console.log('Real-time update received:', response);

            // Check if the response contains the expected events
            if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                console.log('A MESSAGE WAS CREATED');
                console.log('New message payload:', response.payload);

                // Update the messages state with the new message
                setMessages((prevMessages) => [...prevMessages, response.payload]);
            }
            else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
                console.log('A MESSAGE WAS DELETED');
                console.log('Deleted message ID:', response.payload.$id);

                // Update the messages state by removing the deleted message
                setMessages((prevMessages) => prevMessages.filter((msg) => msg.$id !== response.payload.$id));
            }
            else {
                // Log unexpected events for further investigation
                console.log('Unexpected event type:', response.events);
            }
        }, error => {
            // Log the error for debugging
            console.error('Subscription error:', error);
        });

        // Cleanup subscription on component unmount
        return () => {
            console.log('Unsubscribing from real-time updates for messages');
            unsubscribe();
        };
    }, []);

    // Scroll to the bottom of the messages container
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Toggle between dark and light mode
    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
        console.log('Theme toggled:', isDarkMode ? 'Light Mode' : 'Dark Mode');
    };

    // Handle emoji click and append to message body
    const handleEmojiClick = (emojiObject) => {
        setMessageBody((prevMsg) => prevMsg + emojiObject.emoji);
        console.log('Emoji clicked:', emojiObject.emoji);
    };

    // Close emoji picker when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEmojiPicker && !event.target.closest('.emoji-picker-container') && !event.target.closest('.action-button')) {
                setShowEmojiPicker(false);
                console.log('Clicked outside emoji picker');
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

    // Handle message submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!messageBody.trim()) return;

        const payload = {
            body: messageBody,
            username: 'CurrentUser', // replace with actual user management
        };

        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_MESSAGES,
                ID.unique(),
                payload
            );
            // setMessages((prevMessages) => [...prevMessages, response]);
            setMessageBody('');
            console.log('Message send:', response);
        } catch (error) {
            console.error('Error creating message:', error);
        }
    };

    // Handle message deletion
    const deleteMessage = async (messageId) => {
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, messageId);
            // setMessages((prevMessages) => prevMessages.filter((msg) => msg.$id !== messageId));
            console.log('Message deleted:', messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    // Fetch messages from the database
    const getMessages = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_MESSAGES,
                [
                    // Query.orderDesc('$createdAt'),
                    Query.limit(50)
                ]
            );
            setMessages(response.documents);
            console.log('Messages fetched:', response.documents);
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
                    {/* <button onClick={handleThemeToggle}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button> */}
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
                                    <h3>{message?.username}</h3>
                                    <small className="message-timestamp">
                                        {new Date(message.$createdAt).toLocaleString()}
                                        <button type="button" className="action-button" onClick={() => { deleteMessage(message.$id) }}>
                                            <Trash2 />
                                        </button>
                                    </small>
                                </div>
                                <div className="message--body">
                                    <p>{message.body}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

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
                            </div>
                            <textarea
                                required
                                maxLength="1000"
                                name="message"
                                placeholder="Type your message here..."
                                onChange={(e) => setMessageBody(e.target.value)}
                                value={messageBody}
                            />
                            <div className="message-actions">
                                <button type="submit" className="action-button" disabled={!messageBody.trim()}>
                                    <Send />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
};

export default Room;

import { useState, useEffect, useRef } from 'react';
import client, { databases, DATABASE_ID, COLLECTION_ID_MESSAGES, COLLECTION_ID_CONVERSATIONS, COLLECTION_ID_USERS } from '../appwriteConfig';
import { ID, Query, Role, Permission } from 'appwrite';
import { Smile, Send, Trash2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../utils/AuthContext';
import { useParams } from 'react-router-dom';

const Room = () => {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState([]);
    const [messageBody, setMessageBody] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [conversation, setConversation] = useState(null);
    const messagesEndRef = useRef(null);

    const { user } = useAuth()

    // Set theme
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Fetch conversation details
    useEffect(() => {
        getConversationDetails();
    }, [conversationId]);

    const getConversationDetails = async () => {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_ID_CONVERSATIONS,
                conversationId
            );
            const otherUserId = response.participants.find(p => p !== user.$id);
            if (otherUserId) {
                const userDoc = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTION_ID_USERS,
                    otherUserId
                );
                setConversation({ ...response, otherUsername: userDoc.username });
            }
        } catch (error) {
            console.error('Error fetching conversation details:', error);
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Subscribe to real-time updates for messages
    useEffect(() => {
        // Fetch initial messages
        getMessages();

        // Subscribe to real-time updates
        const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`, response => {
            // Filter by conversationId
            if (response.payload.conversation_id !== conversationId) return;

            // Check if the response contains the expected events
            if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                // Update the messages state with the new message
                setMessages((prevMessages) => [...prevMessages, response.payload]);
            }
            else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
                // Update the messages state by removing the deleted message
                setMessages((prevMessages) => prevMessages.filter((msg) => msg.$id !== response.payload.$id));
            }
        }, error => {
            console.error('Subscription error:', error);
        });

        // Cleanup subscription on component unmount
        return () => {
            unsubscribe();
        };
    }, [conversationId]);

    // Scroll to the bottom of the messages container
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Toggle between dark and light mode
    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Handle emoji click and append to message body
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

    // Handle message submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!messageBody.trim()) return;

        const payload = {
            user_id: user.$id,
            username: user.name,
            body: messageBody,
            conversation_id: conversationId,
        };

        const permissions = [
            Permission.write(Role.user(user.$id)),
        ]

        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_MESSAGES,
                ID.unique(),
                payload,
                permissions
            );

            // Update conversation with last message
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID_CONVERSATIONS,
                conversationId,
                {
                    last_message_body: messageBody.slice(0, 255),
                    last_message_at: new Date().toISOString()
                }
            );

            setMessageBody('');
        } catch (error) {
            console.error('Error creating message:', error);
        }
    };

    // Handle message deletion
    const deleteMessage = async (messageId) => {
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, messageId);
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
                    Query.equal('conversation_id', conversationId),
                    Query.orderAsc('$createdAt'),
                    Query.limit(100)
                ]
            );
            setMessages(response.documents);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Handle keydown event in the textarea
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <>
            <div className="absolute top-4 right-4 z-50 md:top-4 md:right-4">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={handleThemeToggle}
                        className="hidden"
                    />
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative ${isDarkMode ? 'bg-[#009688]' : 'bg-gray-300'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center absolute top-1 left-1 ${isDarkMode ? 'translate-x-6' : ''}`}>
                            <span className="text-[10px] leading-none">{isDarkMode ? '🌙' : '☀️'}</span>
                        </div>
                    </div>
                </label>
            </div>
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1e1e1e] relative">
                {conversation && (
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#262626] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#009688] flex items-center justify-center text-white font-bold">
                                {conversation.otherUsername?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{conversation.otherUsername}</h3>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* <div className="online-users">
                        <h3>Online Users</h3>
                    </div> */}
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-1 scrollbar-hide">
                        {messages.map((message) => (
                            <div key={message.$id} className={`group max-w-[80%] md:max-w-[60%] min-w-[100px] rounded-lg p-1 shadow-sm relative mb-1 ${message.username === user.name ? 'bg-[#d9fdd3] dark:bg-[#005c4b] self-end rounded-tr-none' : 'bg-white dark:bg-[#202c33] self-start rounded-tl-none'}`}>
                                <div className="px-2 pt-1 pb-5">
                                    <p className="text-[14.2px] text-[#111b21] dark:text-[#e9edef] m-0 leading-[19px] break-words whitespace-pre-wrap">
                                        {message.body}
                                    </p>
                                </div>
                                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                    {message.$permissions?.includes(`delete(\"user:${user.$id}\")`) && (
                                        <button 
                                            type="button" 
                                            className="text-[#8696a0] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 mr-1" 
                                            onClick={() => deleteMessage(message.$id)}
                                            title="Delete message"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <span className="text-[11px] text-[#667781] dark:text-[#8696a0] min-w-fit">
                                        {new Date(message.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {message.username === user.name && (
                                        <span className="text-[#53bdeb]">
                                            <svg viewBox="0 0 16 15" width="16" height="15" className="block">
                                                <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-7.655a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-7.655a.365.365 0 0 0-.063-.51z"></path>
                                            </svg>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form id="message--form" onSubmit={handleSubmit} className="flex items-center p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-[#e0e0e0] dark:border-[#2a3942]">
                        <div className="flex items-center gap-2 w-full">
                            <div className="relative">
                                <button type="button" className="text-[#54656f] dark:text-[#8696a0] p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    <Smile size={24} />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-14 left-0 z-50 emoji-picker-container shadow-xl rounded-lg overflow-hidden">
                                        <EmojiPicker onEmojiClick={handleEmojiClick} theme={isDarkMode ? 'dark' : 'light'} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg flex items-center px-4 py-2">
                                <textarea
                                    required
                                    maxLength="1000"
                                    name="message"
                                    placeholder="Type a message"
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    value={messageBody}
                                    onKeyDown={handleKeyDown}
                                    className="w-full border-none bg-transparent resize-none max-h-[100px] text-[15px] text-[#111b21] dark:text-[#d1d7db] focus:outline-none scrollbar-hide placeholder:text-[#54656f] dark:placeholder:text-[#8696a0] py-1"
                                    rows={1}
                                    style={{ minHeight: '24px' }}
                                />
                            </div>

                            <button type="submit" className="text-[#54656f] dark:text-[#8696a0] p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!messageBody.trim()}>
                                <Send size={24} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Room;


import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_CONVERSATIONS, COLLECTION_ID_USERS } from '../appwriteConfig';
import { useAuth } from '../utils/AuthContext';
import { Query, ID } from 'appwrite';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const isChatOpen = location.pathname.includes('/chat/');

    useEffect(() => {
        if (user) {
            getConversations();
        }
    }, [user]);

    const getConversations = async () => {
        try {
            // Query conversations where the current user is a participant
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_CONVERSATIONS,
                [
                    Query.equal('participants', user.$id) 
                ]
            );
            
            const convs = await Promise.all(response.documents.map(async (conv) => {
                const otherUserId = conv.participants.find(p => p !== user.$id);
                let otherUsername = 'User';
                
                if (otherUserId) {
                    try {
                        const userDoc = await databases.getDocument(
                            DATABASE_ID,
                            COLLECTION_ID_USERS,
                            otherUserId
                        );
                        otherUsername = userDoc.username;
                    } catch (err) {
                        console.log('User not found', err);
                    }
                }
                
                return { 
                    ...conv, 
                    otherUsername 
                };
            }));

            setConversations(convs);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_USERS,
                [
                    Query.search('username', searchTerm)
                ]
            );
            setSearchResults(response.documents);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const startChat = async (otherUserId) => {
        // Check if conversation already exists in the loaded list
        const existingConversation = conversations.find(c => c.participants.includes(otherUserId));
        
        if (existingConversation) {
            navigate(`/chat/${existingConversation.$id}`);
            setSearchResults([]);
            setSearchTerm('');
            return;
        }

        try {
            // Check if conversation exists in the database (server-side check)
            const existingChats = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_CONVERSATIONS,
                [
                    Query.equal('participants', user.$id),
                    Query.equal('participants', otherUserId)
                ]
            );

            if (existingChats.documents.length > 0) {
                navigate(`/chat/${existingChats.documents[0].$id}`);
                setSearchResults([]);
                setSearchTerm('');
                return;
            }

            // Create new conversation
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_CONVERSATIONS,
                ID.unique(),
                {
                    participants: [user.$id, otherUserId],
                    last_message_at: new Date().toISOString()
                }
            );
            navigate(`/chat/${response.$id}`);
            setSearchResults([]);
            setSearchTerm('');
            getConversations();
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
             {/* Sidebar */}
            <aside className={`w-full md:w-[350px] lg:w-[400px] bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-700 flex flex-col ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
                <Header />
                
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if(e.target.value === '') setSearchResults([]);
                            }}
                            className="flex-1 p-2 bg-gray-100 dark:bg-[#262626] text-gray-900 dark:text-white rounded border border-gray-300 dark:border-[#333] focus:outline-none focus:border-[#009688]"
                        />
                        <button type="submit" className="px-4 py-2 bg-[#009688] text-white rounded hover:bg-[#00796b]">Search</button>
                    </form>
                </div>

                {/* List Area */}
                <div className="flex-1 overflow-y-auto">
                    {searchResults.length > 0 ? (
                        <div className="space-y-1">
                            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Search Results</h3>
                            {searchResults.map(u => (
                                <div key={u.$id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#262626] cursor-pointer border-b border-gray-100 dark:border-gray-800" onClick={() => startChat(u.$id)}>
                                    <div className="text-gray-900 dark:text-white font-medium">{u.username}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {loading ? (
                                <p className="p-4 text-gray-400">Loading chats...</p>
                            ) : (
                                <>
                                    {conversations.map(chat => (
                                        <Link to={`/chat/${chat.$id}`} key={chat.$id} className={`block p-4 hover:bg-gray-50 dark:hover:bg-[#262626] border-b border-gray-100 dark:border-gray-800 transition-colors ${location.pathname === `/chat/${chat.$id}` ? 'bg-gray-100 dark:bg-[#262626]' : ''}`}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <div className="font-medium text-gray-900 dark:text-white">{chat.otherUsername || 'Chat'}</div>
                                                <div className="text-xs text-gray-500">{chat.last_message_at ? new Date(chat.last_message_at).toLocaleDateString() : ''}</div>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.last_message_body || "No messages yet"}</div>
                                        </Link>
                                    ))}
                                    {conversations.length === 0 && <p className="p-4 text-gray-500">No chats yet. Search for users to start chatting.</p>}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={`flex-1 flex flex-col ${!isChatOpen ? 'hidden md:flex' : 'flex'} bg-[#e5ddd5] dark:bg-[#0b141a] relative`}>
                {isChatOpen ? (
                    <Outlet />
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-500 dark:text-gray-400 bg-[#f0f2f5] dark:bg-[#222]">
                        <div className="text-center">
                            <h2 className="text-3xl font-light mb-4 text-gray-700 dark:text-gray-200">WhatsApp Clone</h2>
                            <p className="text-sm">Select a chat to start messaging</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;

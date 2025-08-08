import React, { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import Axios from "../../utils/axios";
import SummaryApi, { baseUrl } from "../../common/Summaryapi";
import userImage from "../../assets/images/icons/user.png";
import ChatField from "./ChatField";
import ChatMessages from "./ChatMessages"; // Import the new component
import notiLogo from "../../assets/images/logo/noti_logo.png";
import { toast } from "react-toastify";

const ChatLay = () => {
    const [activeUserId, setActiveUserId] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [lastMessagesMap, setLastMessagesMap] = useState({});
    const [shouldScroll, setShouldScroll] = useState(false);
    const [users, setUsers] = useState([]);
    const eventSourceRef = useRef(null);
    const [lastTimestamp, setLastTimestamp] = useState(0);
    const [pusher, setPusher] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState("disconnected");

    // Add ref to track current active user for Pusher callbacks
    const activeUserRef = useRef(null);
    const usersRef = useRef([]);

    // Update refs when state changes
    useEffect(() => {
        activeUserRef.current = users.find((user) => user.id === activeUserId);
    }, [activeUserId, users]);

    useEffect(() => {
        usersRef.current = users;
    }, [users]);

    // Initialize Pusher ONCE - remove dependency array
    useEffect(() => {
        console.log("Initializing Pusher connection...");

        const pusherInstance = new Pusher("eb66e29c078e486151c2", {
            cluster: "ap2",
            encrypted: true,
            authEndpoint: "/pusher/auth",
        });

        // Connection status tracking
        pusherInstance.connection.bind("connected", () => {
            console.log("Pusher connected");
            setConnectionStatus("connected");
        });

        pusherInstance.connection.bind("disconnected", () => {
            console.log("Pusher disconnected");
            setConnectionStatus("disconnected");
        });

        pusherInstance.connection.bind("error", (error) => {
            console.error("Pusher connection error:", error);
            setConnectionStatus("error");
        });

        // Subscribe to the channel
        const channel = pusherInstance.subscribe("whatsapp-channel");

        // Listen for message-sent events (outgoing messages)
        channel.bind("message-sent", (data) => {
            console.log("New message sent via Pusher:", data);

            const currentActiveUser = activeUserRef.current;

            // Create the new message object
            const newMsg = {
                id: data.db_id || Date.now(),
                from: "me",
                text: data.message,
                timestamp: data.timestamp,
                messageType: "reply",
                admin: data.support_phone,
                client: data.number,
            };

            // Always update last messages map
            setLastMessagesMap((prev) => ({
                ...prev,
                [data.number]: {
                    text: data.message,
                    timestamp: data.timestamp,
                },
            }));

            // Add to current chat if it's for the active user
            if (currentActiveUser && data.number === currentActiveUser.clientId) {
                console.log("Adding sent message to current chat:", newMsg);
                setMessages((prevMessages) => {
                    // Check if message already exists to avoid duplicates
                    const exists = prevMessages.some(
                        (msg) =>
                            msg.id === data.db_id ||
                            (msg.text === data.message &&
                                Math.abs(msg.timestamp - data.timestamp) < 2)
                    );
                    if (!exists) {
                        return [...prevMessages, newMsg];
                    }
                    return prevMessages;
                });
                setShouldScroll(true);
            } else {
                console.log("Message not for current active user:", {
                    messageNumber: data.messageNumber,
                    activeUserClientId: currentActiveUser?.clientId,
                });
                showNotification(getUserNameByNumber(data.messageNumber), data.message);
            }
        });

        // Listen for message-received events (incoming messages)
        channel.bind("message-received", (data) => {
            console.log("New message received via Pusher:", data);

            const currentActiveUser = activeUserRef.current;

            const newMsg = {
                id: data.db_id || Date.now(),
                from: "user",
                text: data.message,
                timestamp: data.timestamp,
                messageType: "incoming",
                admin: data.support_phone,
                client: data.number,
            };

            // Always update last messages map
            setLastMessagesMap((prev) => ({
                ...prev,
                [data.number]: {
                    text: data.message,
                    timestamp: data.timestamp,
                },
            }));

            // Add to current chat if it's for the active user
            if (currentActiveUser && data.number === currentActiveUser.clientId) {
                setMessages((prevMessages) => {
                    const exists = prevMessages.some(
                        (msg) =>
                            msg.id === data.db_id ||
                            (msg.text === data.message &&
                                Math.abs(msg.timestamp - data.timestamp) < 2)
                    );
                    if (!exists) {
                        return [...prevMessages, newMsg];
                    }
                    return prevMessages;
                });
                setShouldScroll(true);
            }
        });

        setPusher(pusherInstance);

        // Cleanup on component unmount only
        return () => {
            console.log("Cleaning up Pusher connection...");
            if (pusherInstance) {
                pusherInstance.unsubscribe("whatsapp-channel");
                pusherInstance.disconnect();
            }
        };
    }, []); // Empty dependency array - initialize only once
    
    function getUserNameByNumber(number) {
        const user = users.find((user) => user.clientId === number);
        return user ? user?.name : "Unknown User";
    }

    const currentNotificationRef = useRef(null);
    const messageQueueRef = useRef([]);

    const showNotification = (title, message) => {
        if (Notification.permission === "granted" && document.hidden) {
            // Add new message to queue
            messageQueueRef.current.push({ title, message });

            // If there's an existing notification, close it
            if (currentNotificationRef.current) {
                currentNotificationRef.current.close();
            }

            // Create notification body based on message count
            let notificationBody;
            if (messageQueueRef.current.length === 1) {
                const msg = messageQueueRef.current[0].message;
                notificationBody = msg.length > 50 ? msg.substring(0, 50) + "..." : msg;
            } else {
                const latestMsg =
                    messageQueueRef.current[messageQueueRef.current.length - 1].message;
                const truncatedMsg =
                    latestMsg.length > 30
                        ? latestMsg.substring(0, 30) + "..."
                        : latestMsg;
                notificationBody = `${truncatedMsg} (+${messageQueueRef.current.length - 1
                    } more messages)`;
            }

            // Create new notification
            currentNotificationRef.current = new Notification(title, {
                body: notificationBody,
                icon: notiLogo,
                badge: notiLogo,
                tag: "whatsapp-message",
            });

            // Clear queue when notification is clicked
            currentNotificationRef.current.onclick = () => {
                messageQueueRef.current = [];
                currentNotificationRef.current = null;
                window.focus(); // Bring tab to focus
            };

            // Clear reference when notification is closed
            currentNotificationRef.current.onclose = () => {
                currentNotificationRef.current = null;
            };
        }
    };

    // Clear message queue when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                messageQueueRef.current = [];
                if (currentNotificationRef.current) {
                    currentNotificationRef.current.close();
                    currentNotificationRef.current = null;
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup on unmount
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (currentNotificationRef.current) {
                currentNotificationRef.current.close();
            }
        };
    }, []);

    // Request notification permission on component mount
    useEffect(() => {
        if (Notification.permission === "default") {
            Notification.requestPermission().then((permission) => {
                console.log("Notification permission:", permission);
            });
        }
    }, []);

    // Cleanup SSE connection
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "instant",
        });
    };

    useEffect(() => {
        if (shouldScroll || loading === false) {
            setTimeout(() => {
                scrollToBottom(false);
                setShouldScroll(false);
            }, 100);
        }
    }, [messages, shouldScroll, loading]);

    const handleUserSelect = (userId) => {
        console.log("Selecting user:", userId);
        setActiveUserId(userId);
        setSidebarOpen(false);

        if (userId) {
            const user = users.find((u) => u.id === userId);
            if (user) {
                getMessages(user.clientId);
            }
        }
    };

    const getUsers = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.get_users,
            });

            if (response.data && Array.isArray(response.data.data)) {
                const user = response.data.data;
                const mappedUsers = user.map((user, index) => ({
                    id: index + 1,
                    clientId: user.phone,
                    name: user.name,
                    role: user.status,
                    avatar: userImage,
                    admin: user.admin,
                }));

                setUsers(mappedUsers);

                if (mappedUsers.length > 0) {
                    setActiveUserId(mappedUsers[0].id);
                    getMessages(mappedUsers[0].clientId);
                }
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const getMessages = async (clientId = "919500971102") => {
        try {
            console.log("Loading messages for client:", clientId);
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.get_messages,
                params: {
                    client: clientId,
                },
            });

            if (response.data.success) {
                const transformedMessages = response.data.data.map((msg) => {
                    const isFromAdmin =
                        msg.message_type === "welcome" || msg.admin === msg.client;

                    return {
                        id: msg.id,
                        from: isFromAdmin ? "me" : "user",
                        text: msg.message,
                        timestamp: msg.timestamp,
                        messageType: msg.message_type,
                        admin: msg.admin,
                        client: msg.client,
                    };
                });

                if (transformedMessages.length > 0) {
                    const last = transformedMessages[transformedMessages.length - 1];
                    setLastMessagesMap((prev) => ({
                        ...prev,
                        [clientId]: {
                            text: last.text,
                            timestamp: last.timestamp,
                        },
                    }));

                    const lastMsg = response.data.data[response.data.data.length - 1];
                    setLastTimestamp(lastMsg.realtime || lastMsg.timestamp);
                }

                setMessages(transformedMessages);
                if (transformedMessages.length > 0) {
                    setShouldScroll(true);
                }
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUsers();
        getMessages();
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const currentActiveUser = users.find((user) => user.id === activeUserId);
        if (!currentActiveUser) {
            console.error("No active user found");
            return;
        }

        console.log(
            "Sending message:",
            newMessage,
            "to:",
            currentActiveUser.clientId
        );

        try {
            const formData = new FormData();
            formData.append("number", currentActiveUser.clientId);
            formData.append("message", newMessage);

            const response = await Axios({
                ...SummaryApi.send_message,
                data: formData,
            });

            console.log("Send message response:", response.data);

            if (response.data.status === "success") {
                setNewMessage("");
                // Message will be added via Pusher event
                console.log("Message sent successfully, waiting for Pusher event...");
            } else {
                console.error("Message send failed:", response.data);
                // Fallback: add message locally
                const newMsg = {
                    id: Date.now().toString(),
                    from: "me",
                    text: newMessage,
                    timestamp: Math.floor(Date.now() / 1000),
                    messageType: "reply",
                };
                setMessages((prev) => [...prev, newMsg]);
                setShouldScroll(true);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error sending message:", error);

            // Fallback: add message locally if API fails
            const newMsg = {
                id: Date.now().toString(),
                from: "me",
                text: newMessage,
                timestamp: Math.floor(Date.now() / 1000),
                messageType: "reply",
            };
            setMessages((prev) => [...prev, newMsg]);
            setShouldScroll(true);
            setNewMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const activeUser = users.find((user) => user.id === activeUserId);

    const sendTemplete = async (template, lang) => {
        try {
            const formData = new FormData();
            formData.append("number", activeUser.clientId);
            formData.append("template", template);
            formData.append("lang", lang);

            const response = await Axios({
                ...SummaryApi.send_template,
                data: formData,
            });
            console.log(response.data);

            if (response.data.status === "success") {
                console.log(`Sent to ${activeUser.name}:`, response.data);
                toast.success(`Template sent to ${activeUser.name}`, {
                    autoClose: 2000,
                });
                setLoading(false);
            } else {
                console.warn(`Failed to send to ${activeUser.name}:`, response.data);
                toast.error(`Failed to send to ${activeUser.name}`, {
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("❌ Error while sending message:", error);
            toast.error("Error while sending messages", { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const sendImage = async (files) => {
        try {
            const formData = new FormData();
            formData.append("number", activeUser.clientId);
            if (Array.isArray(files)) {
                files.forEach((file, index) => {
                    formData.append("files[]", file); // Important: use "files[]" to denote an array
                });
            } else {
                formData.append("files[]", files); // fallback for single file
            }
            formData.append("type", "image");

            const response = await Axios({
                ...SummaryApi.send_image,
                data: formData,
            });
            console.log(response.data);

            if (response.data.status === "success") {
                console.log(`Images to ${activeUser.name}:`, response.data);
                toast.success(`Images sent to ${activeUser.name}`, { autoClose: 2000 });
                setLoading(false);
            } else {
                console.warn(`Failed to send to ${activeUser.name}:`, response.data);
                toast.error(`Failed to send to ${activeUser.name}`, {
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("❌ Error while sending message:", error);
            toast.error("Error while sending messages", { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-white border dark:bg-darkinfo text-gray-900 dark:text-white rounded-lg overflow-hidden h-[calc(100vh-200px)]">
                <div className="flex h-full relative">
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <div
                        className={`
                            absolute lg:relative z-40 lg:z-0
                            w-80 lg:w-[30%] h-full
                            bg-white dark:bg-[#1e1f2d] border-r border-gray-200 dark:border-gray-700
                            transform transition-transform duration-300 ease-in-out
                            ${sidebarOpen
                                ? "translate-x-0"
                                : "-translate-x-full lg:translate-x-0"
                            }
                        `}
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4 lg:hidden">
                                <h2 className="text-lg font-semibold">Chats</h2>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative">
                                    <img
                                        src={userImage}
                                        alt="user"
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <span
                                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-darkinfo ${connectionStatus === "connected"
                                                ? "bg-green-500"
                                                : connectionStatus === "error"
                                                    ? "bg-red-500"
                                                    : "bg-yellow-500"
                                            }`}
                                    ></span>
                                </div>
                                <div>
                                    <h6 className="text-sm font-semibold">Growsoon Infotech</h6>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                        Real-time: {connectionStatus}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-darkinfo focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search contacts..."
                                />
                            </div>

                            <div className="space-y-2">
                                {users.map((user) => {
                                    const lastMessage =
                                        lastMessagesMap[user.clientId]?.text ||
                                        "Click to load messages";
                                    const lastTime = lastMessagesMap[user.clientId]?.timestamp
                                        ? new Date(
                                            lastMessagesMap[user.clientId].timestamp * 1000
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })
                                        : "";

                                    return (
                                        <button
                                            key={user.id + "user"}
                                            onClick={() => handleUserSelect(user.id)}
                                            className={`w-full p-1 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#2c2e42] rounded-lg transition-colors text-left ${activeUserId === user.id
                                                    ? "bg-blue-50 dark:bg-[#2d3969] border border-blue-200 dark:border-blue-700"
                                                    : ""
                                                }`}
                                        >
                                            <img
                                                src={user.avatar}
                                                className="w-12 h-12 rounded-full object-cover"
                                                alt={user.name}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h6 className="text-sm font-medium truncate">
                                                    {user.name}
                                                </h6>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {lastMessage}
                                                </p>
                                                <p className="text-xs text-gray-400">{lastTime}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col h-full w-full">
                        {activeUser ? (
                            <>
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f2d]">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSidebarOpen(true)}
                                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                        >
                                            ☰
                                        </button>
                                        <img
                                            src={activeUser.avatar}
                                            alt={activeUser.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <h6 className="text-sm font-semibold">
                                                {activeUser.name}
                                            </h6>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {activeUser.role}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-2 h-2 rounded-full ${connectionStatus === "connected"
                                                    ? "bg-green-500"
                                                    : connectionStatus === "error"
                                                        ? "bg-red-500"
                                                        : "bg-yellow-500"
                                                }`}
                                            title={`Connection: ${connectionStatus}`}
                                        ></div>
                                        <button
                                            onClick={() => getMessages(activeUser.clientId)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                            title="Refresh messages"
                                        >
                                            🔄
                                        </button>
                                    </div>
                                </div>

                                {/* Use the ChatMessages component */}
                                <ChatMessages 
                                    messages={messages}
                                    loading={loading}
                                    messagesEndRef={messagesEndRef}
                                />

                                <ChatField
                                    handleSendMessage={handleSendMessage}
                                    newMessage={newMessage}
                                    setNewMessage={setNewMessage}
                                    handleKeyPress={handleKeyPress}
                                    sendTemplate={sendTemplete}
                                    sendImage={sendImage}
                                />
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#2b2b3d]">
                                <div className="text-center">
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="lg:hidden mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Open Chats
                                    </button>
                                    <div className="text-6xl mb-4">💬</div>
                                    <h3 className="text-lg font-medium mb-2">Welcome to Chat</h3>
                                    <p className="text-gray-500 dark:text-gray-300">
                                        Select a conversation to start messaging
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatLay;
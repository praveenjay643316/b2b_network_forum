// ChatMessages.js
import React from "react";

const ChatMessages = ({ messages, loading, messagesEndRef }) => {
    // Helper function to format dates like WhatsApp
    const formatDateSeparator = (timestamp) => {
        const messageDate = new Date(timestamp * 1000);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time to compare only dates
        const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (messageDateOnly.getTime() === todayOnly.getTime()) {
            return "Today";
        } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
            return "Yesterday";
        } else {
            // Format as "25th July 2025"
            const day = messageDate.getDate();
            const month = messageDate.toLocaleString('default', { month: 'long' });
            const year = messageDate.getFullYear();
            
            // Add ordinal suffix to day
            const getOrdinalSuffix = (day) => {
                if (day > 3 && day < 21) return 'th';
                switch (day % 10) {
                    case 1: return 'st';
                    case 2: return 'nd';
                    case 3: return 'rd';
                    default: return 'th';
                }
            };
            
            return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
        }
    };

    // Helper function to check if two timestamps are on different days
    const isDifferentDay = (timestamp1, timestamp2) => {
        const date1 = new Date(timestamp1 * 1000);
        const date2 = new Date(timestamp2 * 1000);
        
        return date1.getDate() !== date2.getDate() || 
               date1.getMonth() !== date2.getMonth() || 
               date1.getFullYear() !== date2.getFullYear();
    };

    return (
        <div className="flex-1 scrollbar-none overflow-y-auto p-4 space-y-4 bg-gray-100 dark:bg-[#2b2b3d]">
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <div className="text-gray-500">Loading messages...</div>
                </div>
            ) : messages.length > 0 ? (
                messages.map((msg, index) => {
                    // Check if we need to show a date separator
                    const showDateSeparator = index === 0 || 
                        isDifferentDay(messages[index - 1].timestamp, msg.timestamp);

                    return (
                        <div key={msg.id + index + "message" || index}>
                            {/* Date Separator */}
                            {showDateSeparator && (
                                <div className="flex justify-center my-4">
                                    <div className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                                        {formatDateSeparator(msg.timestamp)}
                                    </div>
                                </div>
                            )}
                            
                            {/* Message */}
                            <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                                <div className="flex flex-col max-w-xs lg:max-w-md">
                                    <div
                                        className={`${msg.text.endsWith(".jpg") || msg.text.endsWith(".mp3")
                                            ? "px-1 rounded py-1"
                                            : "px-4 rounded-2xl py-2"
                                        } text-sm ${msg.from === "me"
                                            ? "bg-white text-gray-800 rounded-br-md"
                                            : "bg-blue-500 dark:bg-[#3a3b4d] text-white dark:text-gray-200 border dark:border-gray-600 rounded-bl-md"
                                        }`}
                                    >
                                        {msg.text.endsWith(".jpg") ? (
                                            <img
                                                src={msg.text}
                                                alt="Uploaded"
                                                className="w-48 object-cover rounded"
                                            />
                                        ) : msg.text.endsWith(".mp3") ? (
                                            <audio controls className="max-w-80">
                                                <source src={msg.text} type="audio/mp3" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        ) : (
                                            <p>{msg.text}</p>
                                        )}
                                    </div>

                                    <div
                                        className={`text-xs text-gray-400 mt-1 ${msg.from === "me" ? "text-left" : "text-right"}`}
                                    >
                                        {new Date(msg.timestamp * 1000).toLocaleTimeString(
                                            [],
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            }
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="flex justify-center items-center h-full">
                    <div className="text-gray-500">No messages yet</div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
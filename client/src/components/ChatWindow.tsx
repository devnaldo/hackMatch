import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Loader2 } from 'lucide-react';
import { Message } from '../types';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../utils/socket';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';
import api from '../api';

interface ChatWindowProps {
  teamId: string;
  teamName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ teamId, teamName }) => {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  const socket = token ? getSocket(token) : null;

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch chat history and configure sockets
  useEffect(() => {
    if (!socket || !user) return;

    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/messages/${teamId}`);
        setMessages(response.data.data);
      } catch (error) {
        console.error('Failed to fetch chat logs:', error);
      } finally {
        setLoading(false);
        // Timeout to allow DOM layout before scrolling
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchChatHistory();

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Join room
    socket.emit('join_team', { teamId });

    // Listeners
    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 50);
    });

    socket.on('typing_indicator', ({ userId, userName, isTyping }: any) => {
      if (userId !== user._id) {
        setTypingUser(isTyping ? userName : null);
      }
    });

    // Cleanup on unmount or teamId change
    return () => {
      socket.emit('leave_team', { teamId });
      socket.off('receive_message');
      socket.off('typing_indicator');
    };
  }, [teamId, socket, user]);

  // Scroll on messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. Handle text changes and typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket) return;

    // Send typing event
    socket.emit('user_typing', { teamId, isTyping: true });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to clear typing state after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('user_typing', { teamId, isTyping: false });
    }, 2000);
  };

  // 3. Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    // Emit send event
    socket.emit('send_message', {
      teamId,
      content: inputText.trim()
    });

    // Reset typing immediately on submit
    socket.emit('user_typing', { teamId, isTyping: false });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setInputText('');
  };

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-[550px] bg-cream/40 rounded-2xl overflow-hidden border border-beige shadow-sm">
      {/* Title Header */}
      <div className="bg-cream px-5 py-4 border-b border-beige flex justify-between items-center shrink-0">
        <div className="text-left">
          <h3 className="font-bold text-brown text-xs uppercase tracking-wider leading-tight">Team Room Chat</h3>
          <p className="text-xs text-slate-500 font-semibold">{teamName}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-sage font-bold">
          <span className="w-2 h-2 bg-sage rounded-full animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream/20 select-text">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
            <Loader2 className="animate-spin text-brown" size={24} />
            <p className="text-xs">Loading chat logs...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs italic">
            No messages yet. Send a greeting to your team!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId?._id === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Sender Avatar */}
                <img
                  src={getAvatarUrlWithFallback(msg.senderId?.profilePicture, msg.senderId?.name)}
                  alt={msg.senderId?.name}
                  className="w-7 h-7 rounded-full border border-beige shrink-0 mt-0.5"
                />

                {/* Message bubble */}
                <div className={`max-w-[70%] text-left`}>
                  {!isMe && (
                    <span className="text-[9px] font-bold text-slate-400 ml-1 block mb-0.5">
                      {msg.senderId?.name}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs ${
                      isMe
                        ? 'bg-brown text-white rounded-tr-none'
                        : 'bg-cream text-brown border border-beige rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 ml-1 mt-1 block">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUser && (
        <div className="bg-cream text-left px-5 py-1 text-[10px] text-slate-400 italic font-medium shrink-0 animate-pulse border-t border-beige">
          {typingUser} is typing...
        </div>
      )}

      {/* Input container */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-cream border-t border-beige flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="flex-1 bg-cream border border-beige rounded-xl px-4 py-2 text-xs text-brown focus:outline-none focus:ring-1 focus:ring-brown placeholder-slate-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-brown text-white rounded-xl hover:bg-primary-hover disabled:opacity-40 disabled:hover:bg-primary transition-all shrink-0 flex items-center justify-center border border-brown"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

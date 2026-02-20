import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Wifi, WifiOff } from 'lucide-react';
import { useParams } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';

const ChatSidebar = () => {
  const { appointmentId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { messages, isConnected, connect, disconnect, sendMessage, loadHistory } = useChatStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (appointmentId) {
      loadHistory(appointmentId);
      connect(appointmentId);
    }
    return () => disconnect();
  }, [appointmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const isOwnMessage = (msg) => {
    if (user && msg.senderId) return msg.senderId === user.id;
    if (user) return msg.sender === user.role;
    return msg.sender === 'patient';
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Consultation Chat</h3>
          <p className="text-sm text-navy-300">Secure messaging</p>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <><Wifi className="w-4 h-4 text-green-400" /><span className="text-xs text-green-400">Live</span></>
          ) : (
            <><WifiOff className="w-4 h-4 text-red-400" /><span className="text-xs text-red-400">Offline</span></>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'system' ? 'justify-center' : isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'system' ? (
              <p className="text-xs text-navy-400 italic bg-navy-50 px-3 py-1 rounded-full">{message.text}</p>
            ) : (
              <div className={`max-w-[70%] ${isOwnMessage(message)
                  ? 'bg-teal-600 text-white'
                  : 'bg-navy-100 text-navy-900'
                } px-4 py-3 rounded-2xl`}>
                {!isOwnMessage(message) && message.senderName && (
                  <p className="text-xs font-semibold mb-1 opacity-70">{message.senderName}</p>
                )}
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${isOwnMessage(message) ? 'text-teal-100' : 'text-navy-500'
                  }`}>
                  {message.time}
                </p>
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-navy-100 p-4">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 hover:bg-navy-100 rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5 text-navy-600" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border-2 border-navy-200 rounded-lg focus:border-teal-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="p-2 bg-teal-600 hover:bg-teal-700 disabled:bg-navy-200 text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSidebar;

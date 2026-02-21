import { create } from 'zustand';
import { chatAPI } from '../api/api';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8001';

const useChatStore = create((set, get) => ({
    messages: [],
    isConnected: false,
    ws: null,
    error: null,

    /**
     * Load chat history from REST API.
     */
    loadHistory: async (appointmentId) => {
        try {
            const response = await chatAPI.getMessages(appointmentId);
            set({
                messages: response.data.map(msg => ({
                    id: msg.id,
                    sender: msg.sender_role,
                    senderName: msg.sender_name,
                    senderId: msg.sender,
                    text: msg.message,
                    time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }))
            });
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    },

    /**
     * Connect to WebSocket chat room.
     */
    connect: (appointmentId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const existingWs = get().ws;
        if (existingWs) {
            existingWs.close();
        }

        const ws = new WebSocket(`${WS_URL}/ws/chat/${appointmentId}?token=${token}`);

        ws.onopen = () => {
            set({ isConnected: true, error: null });
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'chat') {
                const newMessage = {
                    id: Date.now(),
                    sender: data.sender_role,
                    senderName: data.sender,
                    senderId: data.sender_id,
                    text: data.message,
                    time: data.timestamp,
                };
                set((state) => ({
                    messages: [...state.messages, newMessage],
                }));
            } else if (data.type === 'system') {
                const systemMsg = {
                    id: Date.now(),
                    sender: 'system',
                    text: data.message,
                    time: data.timestamp,
                };
                set((state) => ({
                    messages: [...state.messages, systemMsg],
                }));
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            set({ error: 'Chat connection failed', isConnected: false });
        };

        ws.onclose = () => {
            set({ isConnected: false });
        };

        set({ ws });
    },

    /**
     * Send a chat message.
     */
    sendMessage: (message) => {
        const ws = get().ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ message }));
        }
    },

    /**
     * Disconnect from chat.
     */
    disconnect: () => {
        const ws = get().ws;
        if (ws) ws.close();
        set({ ws: null, isConnected: false, messages: [] });
    },
}));

export default useChatStore;

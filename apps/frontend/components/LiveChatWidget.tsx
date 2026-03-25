"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; sender: string; message: string; timestamp?: string }[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !socket) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
      
      newSocket.on('receiveMessage', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      newSocket.on('system', (msg) => {
        setMessages((prev) => [...prev, { ...msg, sender: 'System' }]);
      });

      newSocket.on('connect_error', (err) => {
        console.error('[LiveChatWidget Socket Error]:', err.message);
      });

      setSocket(newSocket);
    }
    
    // Cleanup on unmount or close
    return () => {
      // Intentionally keeping socket alive when closed in a real app, 
      // but for this demo, keeping it alive is fine. 
      // we'll actually let it persist if created.
    };
  }, [isOpen, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    
    socket.emit('sendMessage', { sender: 'Guest', message: input });
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 h-96 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-violet-600 p-4 text-white font-bold flex justify-between items-center shadow-md">
              <span>Live Comms</span>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300">
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-4">
                  Connecting to the matrix... Say hello!
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.sender === 'Guest' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-gray-500 mb-1">{m.sender}</span>
                    <div className={`px-3 py-2 rounded-xl text-sm max-w-[80%] ${m.sender === 'Guest' ? 'bg-violet-600 text-white rounded-br-none' : m.sender === 'System' ? 'bg-white/5 text-gray-400 italic rounded-bl-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                      {m.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="p-3 bg-white/5 border-t border-white/10 flex">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Transmit message..."
                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none px-2"
              />
              <button type="submit" className="text-violet-400 font-bold hover:text-violet-300 px-2 transition-colors">
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-violet-600 hover:bg-violet-500 rounded-full shadow-lg flex items-center justify-center text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </motion.button>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { messagesApi, ContactMessage } from '../../../utils/api';
import { useAuth } from '../../../components/AuthProvider';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp?: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inquiries' | 'livechat'>('inquiries');

  // Inquiries State
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);
  const [inquirySearch, setInquirySearch] = useState('');
  const [filterRead, setFilterRead] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactMessage | null>(null);

  // Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Fetch Inquiries
  const fetchInquiries = async () => {
    try {
      setIsLoadingInquiries(true);
      const data = await messagesApi.getMessages();
      setInquiries(data);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Socket Connection for Live Chat Tab
  useEffect(() => {
    if (activeTab === 'livechat' && !socket) {
      setSocketStatus('connecting');
      const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
      const newSocket = io(socketUrl, {
        withCredentials: true,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      newSocket.on('connect', () => {
        setSocketStatus('connected');
      });

      newSocket.on('disconnect', () => {
        setSocketStatus('disconnected');
      });

      newSocket.on('connect_error', () => {
        setSocketStatus('disconnected');
      });

      newSocket.on('receiveMessage', (msg: ChatMessage) => {
        setChatMessages(prev => [...prev, msg]);
      });

      newSocket.on('system', (msg: any) => {
        setChatMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'System Alert',
          message: msg.message || 'Connected to live gateway.',
          timestamp: new Date().toISOString(),
        }]);
      });

      setSocket(newSocket);
    }

    return () => {
      // Don't immediately kill socket on tab switch to avoid thrashing
    };
  }, [activeTab, socket]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    const senderName = user?.name ? `${user.name} (${user.role?.type || 'User'})` : 'Admin Console';
    socket.emit('sendMessage', { sender: senderName, message: chatInput.trim() });
    setChatInput('');
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      const updated = await messagesApi.markAsRead(id, !currentRead);
      setInquiries(prev => prev.map(m => m.id === id ? updated : m));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(updated);
      }
    } catch (err) {
      alert('Failed to update message status.');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await messagesApi.deleteMessage(id);
      setInquiries(prev => prev.filter(m => m.id !== id));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      alert('Failed to delete message.');
    }
  };

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(msg => {
      const matchesSearch =
        msg.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        msg.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        msg.message.toLowerCase().includes(inquirySearch.toLowerCase());

      const matchesFilter =
        filterRead === 'ALL'
          ? true
          : filterRead === 'UNREAD'
          ? !msg.isRead
          : msg.isRead;

      return matchesSearch && matchesFilter;
    });
  }, [inquiries, inquirySearch, filterRead]);

  const unreadCount = useMemo(() => {
    return inquiries.filter(m => !m.isRead).length;
  }, [inquiries]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen text-gray-100">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-400">Communication & Inquiries</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-pink-400">
            Messages & Gateway
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl">
            Inspect incoming visitor inquiries from the public contact engine and interact with live clients over WebSockets.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'inquiries'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Contact Inquiries</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('livechat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'livechat'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Live WebSocket Chat</span>
            <span className={`w-2 h-2 rounded-full ${socketStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
          </button>
        </div>
      </div>

      {/* TAB 1: INQUIRIES INBOX */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          {/* Metrics & Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <p className="text-xs uppercase font-semibold text-gray-400">Total Inquiries</p>
              <p className="text-2xl font-black text-white mt-1">{inquiries.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <p className="text-xs uppercase font-semibold text-pink-400">Unread & Attention Required</p>
              <p className="text-2xl font-black text-pink-300 mt-1">{unreadCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <p className="text-xs uppercase font-semibold text-emerald-400">Processed & Read</p>
              <p className="text-2xl font-black text-emerald-300 mt-1">{inquiries.length - unreadCount}</p>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                placeholder="Search sender, email, or message keyword..."
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>

            <div className="flex rounded-xl bg-black/50 p-1 border border-white/10 text-xs">
              {(['ALL', 'UNREAD', 'READ'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterRead(f)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filterRead === f ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'ALL' ? 'All Messages' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Inquiries Table / Cards */}
          {isLoadingInquiries ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading incoming transmissions...</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">No inquiries found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                {inquirySearch || filterRead !== 'ALL'
                  ? 'No messages match your search criteria.'
                  : 'Your inbox is clear. Messages submitted through the contact page will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInquiries.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${
                    !item.isRead
                      ? 'bg-gradient-to-r from-violet-950/20 via-black/40 to-black/60 border-violet-500/30 hover:border-violet-500/50'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                  }`}
                  onClick={() => setSelectedInquiry(item)}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                      !item.isRead
                        ? 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 text-white'
                        : 'bg-white/10 text-gray-300'
                    }`}>
                      {getInitials(item.name)}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{item.name}</span>
                        <span className="text-xs text-gray-400 font-mono">({item.email})</span>
                        {!item.isRead && (
                          <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-1 max-w-2xl">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto text-xs">
                    <span className="text-gray-500 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRead(item.id, item.isRead);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title={item.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {item.isRead ? 'Mark Unread' : 'Mark Read'}
                    </button>

                    <a
                      href={`mailto:${item.email}?subject=${encodeURIComponent('Regarding your inquiry on Portfolio Showcase')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-colors flex items-center gap-1"
                    >
                      Reply
                    </a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInquiry(item.id);
                      }}
                      className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Inquiry"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Inquiry Detail Modal */}
          <AnimatePresence>
            {selectedInquiry && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-xl bg-[#141418] border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                        {getInitials(selectedInquiry.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{selectedInquiry.name}</h3>
                        <a href={`mailto:${selectedInquiry.email}`} className="text-xs text-violet-400 hover:underline">
                          {selectedInquiry.email}
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      Message Content (Received {new Date(selectedInquiry.createdAt).toLocaleString()})
                    </span>
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/5 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                    <button
                      onClick={() => handleToggleRead(selectedInquiry.id, selectedInquiry.isRead)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
                    >
                      {selectedInquiry.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                        className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                      >
                        Delete
                      </button>
                      <a
                        href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent('Re: Inquiry from Portfolio Showcase')}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold"
                      >
                        Send Email Reply
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 2: LIVE WEBSOCKET CHAT CONSOLE */}
      {activeTab === 'livechat' && (
        <div className="space-y-6">
          {/* Gateway Status Header */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${
                socketStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : socketStatus === 'connecting' ? 'bg-amber-400 animate-ping' : 'bg-red-500'
              }`} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  Live WebSocket Stream ({socketStatus.toUpperCase()})
                </p>
                <p className="text-[11px] text-gray-400">
                  Direct Socket.io gateway connection to backend chat service.
                </p>
              </div>
            </div>

            <button
              onClick={() => setChatMessages([])}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              Clear Feed
            </button>
          </div>

          {/* Chat Window Frame */}
          <div className="rounded-3xl bg-black/60 border border-white/10 overflow-hidden flex flex-col h-[520px] shadow-2xl">
            {/* Stream Messages Container */}
            <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-400">Live Gateway Ready</p>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Send a broadcast message below to test live transmission across connected clients.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, i) => {
                  const isMe = msg.sender.includes(user?.name || '') || msg.sender.includes('Admin');
                  return (
                    <div
                      key={msg.id || i}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-gray-500 px-1 mb-1">
                        {msg.sender} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Just now'}
                      </span>
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-tr-none shadow-md shadow-violet-900/20'
                            : 'bg-white/10 text-gray-200 border border-white/10 rounded-tl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message to broadcast across live clients..."
                className="flex-1 px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || socketStatus !== 'connected'}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>Broadcast</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


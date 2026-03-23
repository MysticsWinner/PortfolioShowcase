"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'messages'>('projects');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!rawUser || !token || JSON.parse(rawUser).role?.type !== 'ADMIN') {
      router.push('/');
      return;
    }

    // Mocking fetch flow since we don't have secure backend generic routes tied yet, 
    // but the UI is fully structurally compliant for the API tie-ins.
    setTimeout(() => {
      setData(activeTab === 'projects' ? [
        { id: '1', title: 'Portfolio Rewrite', status: 'PUBLISHED', vis: 'PUBLIC' },
        { id: '2', title: 'Payment Gateway', status: 'DRAFT', vis: 'PRIVATE' },
      ] : [
        { id: '1', name: 'John Doe', email: 'john@example.com', msg: 'Love the new site layout!' },
        { id: '2', name: 'Alice', email: 'alice@corp.com', msg: 'Are you open for contract work?' },
      ]);
      setLoading(false);
    }, 500);
  }, [router, activeTab]);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-tight">
          Content Matrix (CMS)
        </h1>
        <p className="text-gray-400 mt-2">Create, Update, and Delete system content architectures.</p>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => { setLoading(true); setActiveTab('projects'); }}
          className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'projects' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Manage Projects
        </button>
        <button 
          onClick={() => { setLoading(true); setActiveTab('messages'); }}
          className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'messages' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Incoming Intel (Contact)
        </button>
      </div>

      {loading ? (
        <div className="text-white">Decrypting Data...</div>
      ) : (
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-white/5 border-b border-white/10">
              {activeTab === 'projects' ? (
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Message Snapshot</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {activeTab === 'projects' ? (
                    <>
                      <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded border bg-emerald-900/30 text-emerald-300 border-emerald-500/20">{item.status}</span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-white">{item.name} <br/><span className="text-xs text-gray-500">{item.email}</span></td>
                      <td className="px-6 py-4 truncate max-w-sm">{item.msg}</td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded mr-2 transition-colors">Edit</button>
                    <button className="text-xs px-3 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}

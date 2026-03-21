"use client";

import React, { useEffect, useState } from "react";
import { adminApi } from "../../../utils/api";
import { motion } from "framer-motion";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("You do not have administrative privileges.");
      } else {
        setError("Failed to load user matrix.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await adminApi.toggleUserStatus(userId);
      fetchUsers();
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  const handleToggleRole = async (userId: string) => {
    try {
      await adminApi.toggleUserRole(userId);
      fetchUsers();
    } catch (err) {
      alert("Failed to toggle role.");
    }
  };

  if (loading) return <div className="text-white p-8">Initializing Admin Matrix...</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">System Matrix</h1>
          <p className="text-gray-400 mt-2">Manage user lifecycles and strictly enforce platform role architectures.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full relative overflow-x-auto rounded-xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl"
      >
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-gray-400">
            <tr>
              <th className="px-6 py-4">Identity</th>
              <th className="px-6 py-4">Account Creation</th>
              <th className="px-6 py-4">Network Status</th>
              <th className="px-6 py-4">Security Role</th>
              <th className="px-6 py-4 text-right">Overrides</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <div className="text-[10px] text-gray-600 truncate max-w-[120px]" title={user.id}>{user.id}</div>
                </td>
                <td className="px-6 py-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {user.isActive ? 'ACTIVE' : 'SUSPENDED'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.role?.type === 'ADMIN' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                    {user.role?.type || 'UNKNOWN'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleToggleStatus(user.id)}
                    className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleToggleRole(user.id)}
                    className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Toggle Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreatePortfolioForm from '../../../../components/CreatePortfolioForm';
import { portfolioApi } from '../../../../utils/api';

const MOCK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

export default function NewPortfolioPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (title: string, data: string) => {
    setIsSubmitting(true);
    try {
      await portfolioApi.createPortfolio(MOCK_USER_ID, title, data);
      router.push('/dashboard/portfolios');
    } catch (error) {
      console.error("Failed to create portfolio", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-6 lg:p-12 relative w-full">
      <div className="w-full relative z-10">
        <button 
          onClick={() => router.back()}
          className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors mx-auto max-w-xl w-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Portfolios
        </button>

        <CreatePortfolioForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
}

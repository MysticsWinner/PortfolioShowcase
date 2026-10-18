"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Fire and forget anonymous analytics beacon on route change
    let visitorId = localStorage.getItem('v_id');
    if (!visitorId) {
      visitorId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('v_id', visitorId);
    }

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
    try {
      fetch(`${apiBase}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'page_view',
          path: pathname,
          visitorId,
        }),
      }).catch(() => { /* Silent fail for tracking */ });
    } catch {
      // Ignore
    }
  }, [pathname]);

  return null; // This is a headless component tracking routes.
}

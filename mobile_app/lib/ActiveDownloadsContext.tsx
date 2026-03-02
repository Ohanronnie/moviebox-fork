'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

export interface ActiveDownloadItem {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  totalBytes?: number;
}

type ActiveDownloadsContextValue = {
  activeDownloads: ActiveDownloadItem[];
  addActive: (id: string, title: string, subtitle: string, totalBytes?: number) => void;
  updateProgress: (id: string, progress: number) => void;
  removeActive: (id: string) => void;
};

const ActiveDownloadsContext = createContext<ActiveDownloadsContextValue | null>(null);

export function ActiveDownloadsProvider({ children }: { children: React.ReactNode }) {
  const [activeDownloads, setActiveDownloads] = useState<ActiveDownloadItem[]>([]);

  const addActive = useCallback(
    (id: string, title: string, subtitle: string, totalBytes?: number) => {
      setActiveDownloads((prev) => {
        if (prev.some((d) => d.id === id)) {
          return prev.map((d) =>
            d.id === id ? { ...d, title, subtitle, totalBytes, progress: 0 } : d
          );
        }
        return [...prev, { id, title, subtitle, progress: 0, totalBytes }];
      });
    },
    []
  );

  const updateProgress = useCallback((id: string, progress: number) => {
    setActiveDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, progress } : d))
    );
  }, []);

  const removeActive = useCallback((id: string) => {
    setActiveDownloads((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return (
    <ActiveDownloadsContext.Provider
      value={{ activeDownloads, addActive, updateProgress, removeActive }}
    >
      {children}
    </ActiveDownloadsContext.Provider>
  );
}

export function useActiveDownloads(): ActiveDownloadsContextValue {
  const ctx = useContext(ActiveDownloadsContext);
  if (!ctx) throw new Error('useActiveDownloads must be used within ActiveDownloadsProvider');
  return ctx;
}

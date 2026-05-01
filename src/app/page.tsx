"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Link as LinkIcon, 
  Calendar, 
  Cpu, 
  Github, 
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsScraping(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      } else {
        setError(data.error || 'Failed to scrape');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <main className="min-h-screen mesh-gradient flex flex-col items-center justify-start p-6 md:p-12">
      {/* Navbar */}
      <nav className="w-full max-w-6xl flex justify-between items-center mb-16">
        <div className="flex items-center gap-2">
          <div className="p-2 glass rounded-xl neo-glow">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            TwitScrapX PRO
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/sechan9999/TwitScrapX" target="_blank" className="p-2 hover:text-primary transition-colors">
            <Github className="w-6 h-6" />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          ARCHIVE THE <span className="text-primary">TRUTH</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Intelligent web content extraction and historical archiving tool. 
          Enter any URL to automatically generate structured reports.
        </p>
      </motion.div>

      {/* Search Container */}
      <div className="w-full max-w-3xl mb-16">
        <form onSubmit={handleScrape} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative glass rounded-2xl p-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 gap-3">
              <LinkIcon className="w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Paste URL here (e.g., https://x.com/DrTaraO)" 
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 py-3"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={isScraping}
              className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  SCRAPING...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  SCRAPE
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex justify-center gap-6 mt-6 text-sm text-gray-500">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> X Support</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Historical Filters</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> DOCX Export</span>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-5xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="text-primary" /> Extraction Results
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors">
                <Download className="w-4 h-4" /> Download DOCX
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, idx) => (
                <motion.div 
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass p-6 rounded-2xl hover:border-primary/50 transition-colors group cursor-default"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary rounded-md border border-primary/20">
                      {result.type}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {result.date}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    {result.text}
                  </p>
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isScraping && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 opacity-20">
          <div className="p-8 glass rounded-full mb-4">
            <Search className="w-12 h-12" />
          </div>
          <p>Awaiting URL for extraction...</p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-12 text-gray-600 text-sm">
        © 2026 TwitScrapX Intelligence Systems. All rights reserved.
      </footer>
    </main>
  );
}

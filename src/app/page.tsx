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
  FileText,
  Database,
  History,
  TrendingUp,
  Clock,
  Save
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [history, setHistory] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
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
        // Automatically simulate saving to DB
        simulateSaveToDB(data.results, url);
      } else {
        setError(data.error || 'Failed to scrape');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsScraping(false);
    }
  };

  const simulateSaveToDB = (data: any[], sourceUrl: string) => {
    setIsSaving(true);
    setTimeout(() => {
      const newEntry = {
        id: Date.now(),
        url: sourceUrl,
        count: data.length,
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory(prev => [newEntry, ...prev]);
      setIsSaving(false);
    }, 1500);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 242, 255);
    doc.text('TwitScrapX Extraction Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Source: ${url}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 35);
    
    // Table
    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Type', 'Content']],
      body: results.map(r => [r.date, r.type, r.text]),
      headStyles: { fillStyle: 'f', fillColor: [112, 0, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    doc.save(`TwitScrapX_Report_${Date.now()}.pdf`);
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

      {/* Main Layout Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: History & Status */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" /> Live DB Status
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", isSaving ? "bg-accent" : "bg-green-500")}></div>
              <span className="text-sm font-medium">{isSaving ? 'Syncing Data...' : 'Database Online'}</span>
            </div>
            <p className="text-[10px] text-gray-600">Connected to Vercel Global Edge Network</p>
          </div>

          <div className="glass p-6 rounded-2xl overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> Scraping History
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <p className="text-xs text-gray-600 italic">No recent activity</p>
              ) : (
                history.map(item => (
                  <div key={item.id} className="border-l-2 border-primary/30 pl-3 py-1 hover:border-primary transition-colors">
                    <p className="text-[10px] text-primary font-bold">{item.timestamp}</p>
                    <p className="text-xs text-gray-300 truncate w-full">{item.url}</p>
                    <p className="text-[10px] text-gray-500">{item.count} items extracted</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Section: Search & Results */}
        <div className="lg:col-span-3 space-y-8">
          {/* Search Area */}
          <div className="w-full">
            <form onSubmit={handleScrape} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass rounded-2xl p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <LinkIcon className="w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Enter URL to scrape..." 
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
                  {isScraping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {isScraping ? 'SCRAPING...' : 'SCRAPE'}
                </button>
              </div>
            </form>
          </div>

          {/* Results Area */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-primary w-6 h-6" /> Extraction Feed
                  </h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={generatePDF}
                      className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-all border border-primary/20 text-primary text-sm font-bold"
                    >
                      <Download className="w-4 h-4" /> DOWNLOAD PDF
                    </button>
                    {isSaving && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg text-accent text-xs font-bold animate-pulse">
                        <Save className="w-3 h-3" /> SAVING TO DB...
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((result, idx) => (
                    <motion.div 
                      key={result.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass p-5 rounded-xl border border-white/5 hover:border-primary/30 transition-all"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{result.type}</span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {result.date}</span>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-3">{result.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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

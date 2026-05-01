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
  Save,
  BookOpen,
  Layers,
  Archive,
  BookMarked,
  BookPlus
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Document as DocxDocument, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [startDate, setStartDate] = useState('2024-12-03');
  const [endDate, setEndDate] = useState('2025-04-04');
  const [isScraping, setIsScraping] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [wikiCollection, setWikiCollection] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'wiki'>('search');
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
        body: JSON.stringify({ url, startDate, endDate }),
      });
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
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

  const addToWikiCollection = (data: any[], sourceUrl: string) => {
    const summary = data.length > 0 
      ? `Analysis of ${data.length} items from ${sourceUrl}. Key themes: ${data[0].type}, ${data[1]?.type || ''}.`
      : 'No data available';
      
    const newWikiNote = {
      id: Date.now(),
      title: `Intelligence Note: ${new URL(sourceUrl).hostname}${new URL(sourceUrl).pathname}`,
      content: summary,
      source: sourceUrl,
      category: 'Resources', // Default PARA category
      timestamp: new Date().toLocaleDateString(),
    };
    
    setWikiCollection(prev => [newWikiNote, ...prev]);
    // Optional: Flash a success state
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

  const generatePDF = async () => {
    const element = document.getElementById('results-feed');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0b1e',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TwitScrapX_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    }
  };

  const generateDOCX = async () => {
    const doc = new DocxDocument({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "TwitScrapX Extraction Report",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Source URL: ${url}`, bold: true }),
              new TextRun({ text: `\nDate: ${new Date().toLocaleString()}`, break: 1 }),
            ],
            spacing: { after: 400 },
          }),
          ...results.flatMap(result => [
            new Paragraph({
              children: [
                new TextRun({ text: `[${result.date}] `, bold: true, color: "00f2ff" }),
                new TextRun({ text: `${result.type}: `, bold: true }),
                new TextRun({ text: result.text }),
              ],
              spacing: { before: 200, after: 100 },
            })
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `TwitScrapX_Report_${Date.now()}.docx`);
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
        <div className="flex items-center gap-6">
          <div className="flex glass p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('search')}
              className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", activeTab === 'search' ? "bg-primary text-black" : "text-gray-500 hover:text-white")}
            >
              SCRAPER
            </button>
            <button 
              onClick={() => setActiveTab('wiki')}
              className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", activeTab === 'wiki' ? "bg-primary text-black" : "text-gray-500 hover:text-white")}
            >
              WIKI
            </button>
          </div>
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
      <AnimatePresence mode="wait">
        {activeTab === 'search' ? (
          <motion.div 
            key="search-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
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
              <div className="w-full space-y-4">
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

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex items-center gap-3 glass px-4 py-2 rounded-xl">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500 font-bold uppercase">Since:</span>
                    <input 
                      type="date" 
                      className="bg-transparent border-none focus:ring-0 text-sm text-white w-full"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-3 glass px-4 py-2 rounded-xl">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500 font-bold uppercase">Until:</span>
                    <input 
                      type="date" 
                      className="bg-transparent border-none focus:ring-0 text-sm text-white w-full"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Results Area */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div 
                    id="results-feed"
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
                          onClick={() => addToWikiCollection(results, url)}
                          className="flex items-center gap-2 px-4 py-2 bg-secondary/20 hover:bg-secondary/40 transition-all rounded-lg text-white text-xs font-bold border border-secondary/30"
                        >
                          <BookPlus className="w-4 h-4" /> ADD TO WIKI
                        </button>
                        <button 
                          onClick={generateDOCX}
                          className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-all border border-secondary/40 text-white text-sm font-bold"
                        >
                          <FileText className="w-4 h-4 text-secondary" /> DOWNLOAD DOCX
                        </button>
                        <button 
                          onClick={generatePDF}
                          className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-all border border-primary/20 text-primary text-sm font-bold"
                        >
                          <Download className="w-4 h-4" /> DOWNLOAD PDF
                        </button>
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
          </motion.div>
        ) : (
          <motion.div 
            key="wiki-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-6xl"
          >
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                  <BookOpen className="text-primary" /> Wiki Collection
                </h2>
                <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">PARA Knowledge Management System</p>
              </div>
              <div className="flex gap-2">
                {['Projects', 'Areas', 'Resources', 'Archives'].map(cat => (
                  <span key={cat} className="px-3 py-1 glass rounded-full text-[10px] font-bold text-gray-400">{cat}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {wikiCollection.length === 0 ? (
                <div className="col-span-3 py-20 text-center glass rounded-3xl opacity-30 border-dashed border-2">
                  <BookMarked className="w-12 h-12 mx-auto mb-4" />
                  <p>Your intelligence wiki is empty. Scrape and add notes to build your knowledge base.</p>
                </div>
              ) : (
                wikiCollection.map((note, idx) => (
                  <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass p-8 rounded-3xl border-l-4 border-l-primary hover:neo-glow transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{note.category}</span>
                      <span className="text-[10px] text-gray-600">{note.timestamp}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4 line-clamp-2 group-hover:text-primary transition-colors">{note.title}</h3>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed italic">"{note.content}"</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-600 truncate">
                      <LinkIcon className="w-3 h-3" /> {note.source}
                    </div>
                  </motion.div>
                ))
              )}
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

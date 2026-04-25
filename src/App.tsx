/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  FileSearch, 
  Layers, 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  History,
  TrendingUp,
  Award,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Builder from './components/Builder';
import Audit from './components/Audit';
import Comparison from './components/Comparison';

export type View = 'dashboard' | 'builder' | 'audit' | 'comparison';

export interface SavedResume {
  id: string;
  name: string;
  date: string;
  data: any;
  audit?: any;
}

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('resumes');
    if (saved) {
      setSavedResumes(JSON.parse(saved));
    }
  }, []);

  const saveResume = (resume: SavedResume) => {
    const newResumes = [resume, ...savedResumes];
    setSavedResumes(newResumes);
    localStorage.setItem('resumes', JSON.stringify(newResumes));
  };

  const deleteResume = (id: string) => {
    const newResumes = savedResumes.filter(r => r.id !== id);
    setSavedResumes(newResumes);
    localStorage.setItem('resumes', JSON.stringify(newResumes));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder', label: 'AI Builder', icon: Plus },
    { id: 'audit', label: 'Resume Audit', icon: FileSearch },
    { id: 'comparison', label: 'Comparison', icon: Layers },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-200">
            <Sparkles size={22} fill="currentColor" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-slate-800"
            >
              Resumatic AI
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                activeView === item.id 
                  ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className={activeView === item.id ? 'text-indigo-600' : 'group-hover:text-indigo-400'} />
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
              {activeView === item.id && isSidebarOpen && (
                <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {menuItems.find(m => m.id === activeView)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
              <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-indigo-600">
                JD
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeView === 'dashboard' && (
                <Dashboard 
                  resumes={savedResumes} 
                  onDelete={deleteResume} 
                  onView={setActiveView}
                />
              )}
              {activeView === 'builder' && (
                <Builder onSave={saveResume} />
              )}
              {activeView === 'audit' && (
                <Audit onSaveAudit={(id, audit) => {
                  const newResumes = savedResumes.map(r => r.id === id ? { ...r, audit } : r);
                  setSavedResumes(newResumes);
                  localStorage.setItem('resumes', JSON.stringify(newResumes));
                }} resumes={savedResumes} />
              )}
              {activeView === 'comparison' && (
                <Comparison resumes={savedResumes} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

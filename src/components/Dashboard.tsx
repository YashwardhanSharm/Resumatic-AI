import { motion } from 'motion/react';
import { Plus, Trash2, FileText, ChevronRight, TrendingUp, Search } from 'lucide-react';
import { SavedResume, View } from '../App';

interface DashboardProps {
  resumes: SavedResume[];
  onDelete: (id: string) => void;
  onView: (view: View) => void;
}

export default function Dashboard({ resumes, onDelete, onView }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Resumes</p>
            <h3 className="text-3xl font-bold text-slate-800">{resumes.length}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <FileText size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg. Score</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {resumes.filter(r => r.audit).length > 0 
                ? Math.round(resumes.reduce((acc, r) => acc + (r.audit?.score || 0), 0) / resumes.filter(r => r.audit).length) 
                : 'N/A'}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Audit Coverage</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {resumes.length > 0 ? Math.round((resumes.filter(r => r.audit).length / resumes.length) * 100) : 0}%
            </h3>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
            <Search size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Resume Library</h2>
          <button 
            onClick={() => onView('builder')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={18} />
            Create New
          </button>
        </div>

        {resumes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <FileText size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">No resumes yet</h3>
              <p className="text-sm text-slate-500 max-w-xs">Start by building your first AI-driven resume or auditing an existing one.</p>
            </div>
            <button 
              onClick={() => onView('builder')}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-sm"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <motion.div 
                key={resume.id}
                layoutId={resume.id}
                className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onDelete(resume.id)}
                    className="p-1.5 bg-slate-100 text-slate-400 rounded hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{resume.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Uploaded {resume.date}</p>
                  </div>

                  {resume.audit ? (
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-500">Score</span>
                          <span className={resume.audit.score >= 80 ? 'text-emerald-600' : resume.audit.score >= 60 ? 'text-amber-600' : 'text-rose-600'}>{resume.audit.score}%</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${resume.audit.score}%` }}
                            className={`h-full ${resume.audit.score >= 80 ? 'bg-emerald-500' : resume.audit.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          />
                       </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onView('audit')}
                      className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 flex items-center gap-1 w-fit"
                    >
                      Audit Required <ChevronRight size={10} />
                    </button>
                  )}

                  <div className="pt-3 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {resume.data?.skills?.length || 0} Skills Detected
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

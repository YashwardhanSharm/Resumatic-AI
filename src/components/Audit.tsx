import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileSearch, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  PieChart, 
  ShieldCheck,
  Target,
  Zap
} from 'lucide-react';
import { auditResume, ResumeAudit } from '../services/geminiService';
import { SavedResume } from '../App';

interface AuditProps {
  resumes: SavedResume[];
  onSaveAudit: (id: string, audit: ResumeAudit) => void;
}

export default function Audit({ resumes, onSaveAudit }: AuditProps) {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<ResumeAudit | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'select' | 'paste' | 'image'>('select');

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      let text = '';
      let imageData: { data: string, mimeType: string } | undefined;

      if (uploadMode === 'select') {
        const resume = resumes.find(r => r.id === selectedResumeId);
        if (resume) {
          text = JSON.stringify(resume.data);
        }
      } else if (uploadMode === 'paste') {
        text = pastedText;
      } else if (uploadMode === 'image' && imageFile) {
        const base64 = await toBase64(imageFile);
        imageData = { data: base64, mimeType: imageFile.type };
      }

      const result = await auditResume(text, imageData);
      setAuditResult(result);
      
      if (uploadMode === 'select' && selectedResumeId) {
        onSaveAudit(selectedResumeId, result);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to audit resume.");
    } finally {
      setIsAuditing(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Advanced Audit</h2>
        <p className="text-sm text-slate-500">Precise analysis of your resume performance across key industry metrics.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex p-1 bg-slate-50 rounded-lg">
           {(['select', 'paste', 'image'] as const).map((mode) => (
             <button
              key={mode}
              onClick={() => setUploadMode(mode)}
              className={`flex-1 py-2 px-4 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                uploadMode === mode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'
              }`}
             >
               {mode === 'select' ? 'Existing' : mode === 'paste' ? 'Text' : 'Scanned'}
             </button>
           ))}
        </div>

        {uploadMode === 'select' && (
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 uppercase font-bold px-1">Library Reference</label>
            <select 
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 border-none outline-none text-sm font-semibold text-slate-700"
            >
              <option value="">Select current version...</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}

        {uploadMode === 'paste' && (
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 uppercase font-bold px-1">Raw Content Input</label>
            <textarea 
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste CV text here..."
              className="w-full h-32 p-3 rounded-lg bg-slate-50 border-none outline-none resize-none text-xs leading-relaxed font-medium"
            />
          </div>
        )}

        {uploadMode === 'image' && (
          <div className="space-y-2">
             <label className="text-[10px] text-slate-400 uppercase font-bold px-1">Visual Scan</label>
            <div className="relative group border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
              <input 
                type="file" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
              <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-700">{imageFile ? imageFile.name : 'Click to upload JPG/PNG'}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Max 10MB SCANNED COPY</p>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleAudit}
          disabled={isAuditing || (uploadMode === 'select' && !selectedResumeId) || (uploadMode === 'paste' && !pastedText) || (uploadMode === 'image' && !imageFile)}
          className="w-full py-3 bg-indigo-600 text-white rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm shadow-indigo-200"
        >
          {isAuditing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Running Analysis...</span>
            </>
          ) : (
            <>
              <Zap size={18} />
              <span>Engage AI Audit</span>
            </>
          )}
        </button>
      </div>

      {auditResult && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Score Board */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="md:col-span-1 bg-white border border-slate-200 p-8 rounded-xl flex flex-col items-center text-center space-y-4 shadow-sm">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * auditResult.score) / 100}
                      className="text-indigo-600 transition-all duration-1000" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-800">{auditResult.score}</div>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Overall Score</h4>
             </div>
             <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { name: 'Keyword Density', val: auditResult.stats.keywordDensity, color: 'text-indigo-600', dot: 'bg-indigo-500' },
                  { name: 'ATS Readability', val: auditResult.stats.readabilityScore, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                  { name: 'Impact Strength', val: auditResult.stats.impactScore, color: 'text-slate-800', dot: 'bg-slate-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${stat.dot}`} />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.name}</p>
                    </div>
                    <div>
                      <h4 className={`text-2xl font-black ${stat.color}`}>{stat.val}%</h4>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-tight">What's Working</h4>
                </div>
                <ul className="space-y-3">
                  {auditResult.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
             </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Needs Improvement</h4>
                </div>
                <ul className="space-y-3">
                  {auditResult.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                      <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                      {w}
                    </li>
                  ))}
                </ul>
             </div>
          </div>

          <div className="bg-indigo-900 rounded-xl p-8 text-white shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-indigo-800 pb-4">
              <h3 className="text-lg font-bold text-indigo-50 tracking-tight">AI Strategy Recommendations</h3>
              <Zap size={20} className="text-indigo-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditResult.tips.map((tip, i) => (
                <div key={i} className="bg-indigo-800/30 border border-indigo-700/50 p-5 rounded-lg flex items-start gap-4 hover:bg-indigo-800/50 transition-colors">
                   <div className="text-[10px] font-black text-indigo-400 bg-indigo-950 px-2 py-1 rounded">TIP {i + 1}</div>
                   <p className="text-[13px] text-indigo-100 leading-relaxed font-light">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

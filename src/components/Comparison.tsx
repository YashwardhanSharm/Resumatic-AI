import { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Loader2, Trophy, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { compareResumes } from '../services/geminiService';
import { SavedResume } from '../App';

interface ComparisonProps {
  resumes: SavedResume[];
}

export default function Comparison({ resumes }: ComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length !== 2) return;
    setIsComparing(true);
    try {
      const selectedResumes = selectedIds.map(id => {
        const r = resumes.find(res => res.id === id);
        return JSON.stringify(r?.data);
      });
      const comparisonResult = await compareResumes(selectedResumes);
      setResult(comparisonResult);
    } catch (error) {
      console.error(error);
      alert("Failed to compare resumes.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Head-to-Head Analysis</h2>
        <p className="text-sm text-slate-500">Benchmark multiple versions of your profile to find the most effective version.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => handleToggle(r.id)}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between text-left ${
                selectedIds.includes(r.id) 
                  ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div>
                <p className={`text-sm font-bold ${selectedIds.includes(r.id) ? 'text-indigo-900' : 'text-slate-800'}`}>{r.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{r.date}</p>
              </div>
              {selectedIds.includes(r.id) && (
                <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                  {selectedIds.indexOf(r.id) + 1}
                </div>
              )}
            </button>
          ))}
        </div>

        {resumes.length < 2 && (
          <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-3 text-slate-400 border border-slate-100">
            <Info size={16} />
            <p className="text-xs font-bold uppercase tracking-wider">Add at least 2 resumes to unlock comparison</p>
          </div>
        )}

        <button 
          onClick={handleCompare}
          disabled={isComparing || selectedIds.length !== 2}
          className="w-full py-3 bg-indigo-600 text-white rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm shadow-indigo-100"
        >
          {isComparing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Calibrating Comparison...</span>
            </>
          ) : (
            <>
              <Layers size={18} />
              <span>Compare Selections ({selectedIds.length}/2)</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Winner Section */}
          <div className="bg-indigo-600 p-8 rounded-xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 opacity-10">
              <Trophy size={300} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                     <Trophy size={20} className="text-white" />
                   </div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-200">Recommended Version</h3>
                </div>
                <h4 className="text-3xl font-black tracking-tight">{resumes.find(r => r.id === selectedIds[result.winner_index])?.name}</h4>
              </div>
              <div className="max-w-md bg-indigo-500/30 border border-indigo-400/30 p-4 rounded-xl backdrop-blur-md">
                <p className="text-sm font-medium leading-relaxed italic text-indigo-50">
                  "This version exhibits superior alignment with industry standard clarity and high-impact metrics."
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Head-to-Head Comparison</h3>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Metrics Analysis</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4 font-bold">Performance Metric</th>
                  <th className={`px-6 py-4 font-bold ${result.winner_index === 0 ? 'bg-indigo-50/30 text-indigo-600' : ''}`}>
                    {resumes.find(r => r.id === selectedIds[0])?.name}
                  </th>
                  <th className={`px-6 py-4 font-bold ${result.winner_index === 1 ? 'bg-indigo-50/30 text-indigo-600' : ''}`}>
                    {resumes.find(r => r.id === selectedIds[1])?.name}
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium">
                {result.metrics.map((m: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{m.name}</td>
                    <td className={`px-6 py-4 ${result.winner_index === 0 ? 'bg-indigo-50/10' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{m.scores[0]}%</span>
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${m.scores[0] > m.scores[1] ? 'bg-indigo-500' : 'bg-slate-300'}`} 
                            style={{ width: `${m.scores[0]}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${result.winner_index === 1 ? 'bg-indigo-50/10' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{m.scores[1]}%</span>
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${m.scores[1] > m.scores[0] ? 'bg-indigo-500' : 'bg-slate-300'}`} 
                            style={{ width: `${m.scores[1]}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
               <Layers size={20} className="text-slate-400" />
               <h3 className="text-lg font-bold">Reviewer's Deep Dive</h3>
             </div>
             <p className="text-sm text-slate-400 leading-relaxed font-light whitespace-pre-wrap">{result.comparison}</p>
             <div className="pt-4">
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-lg flex items-center gap-3">
                   <TrendingUp size={18} className="text-indigo-400" />
                   <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
                     Strategy: Consolidate {result.metrics[0].name.toLowerCase()} for maximum alignment.
                   </p>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

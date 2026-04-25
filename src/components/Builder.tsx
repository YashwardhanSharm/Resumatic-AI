import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Save, Loader2, Plus, X, GraduationCap, Briefcase, User, Info } from 'lucide-react';
import { generateResumeFromDetails, ResumeData } from '../services/geminiService';
import { SavedResume } from '../App';

interface BuilderProps {
  onSave: (resume: SavedResume) => void;
}

export default function Builder({ onSave }: BuilderProps) {
  const [details, setDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<ResumeData | null>(null);
  const [resumeName, setResumeName] = useState('');

  const handleGenerate = async () => {
    if (!details.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateResumeFromDetails(details);
      setGeneratedData(data);
      setResumeName(data.personalInfo.fullName + " - AI Generated");
    } catch (error) {
      console.error(error);
      alert("Failed to generate resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedData) return;
    const newResume: SavedResume = {
      id: Math.random().toString(36).substr(2, 9),
      name: resumeName || 'New Resume',
      date: new Date().toLocaleDateString(),
      data: generatedData
    };
    onSave(newResume);
    setGeneratedData(null);
    setDetails('');
    alert("Resume saved to dashboard!");
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 pb-20">
      <div className={`flex-1 space-y-8 ${generatedData ? 'hidden md:block md:w-1/3' : 'w-full'}`}>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">AI Resume Builder</h2>
          <p className="text-sm text-slate-500">Provide your history and we'll engineer a high-impact CV.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-xl p-6 text-white shadow-xl space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold mb-2 block">Tell us everything</label>
              <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. My name is Alex, I'm a Senior Frontend Engineer with 5 years of experience at Meta..."
                className="w-full h-48 p-4 bg-slate-800 border-none rounded-lg text-xs text-slate-200 resize-none outline-none focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-indigo-600/20 border border-indigo-500/30 rounded p-3">
              <p className="text-[11px] text-indigo-300 mb-1 font-bold">AI Optimization Active</p>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">Describe achievements with numbers for a +12% score boost.</p>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !details.trim()}
            className="w-full py-3 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-indigo-600" />
                <span>Engineering...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Sparkles size={18} className="text-indigo-600" />
                <span>Generate Resume</span>
              </div>
            )}
          </button>
        </motion.div>
      </div>

      {generatedData && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 md:w-2/3 space-y-6"
        >
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <input 
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              className="text-sm font-bold text-slate-800 bg-transparent border-none outline-none"
             />
             <div className="flex gap-2">
               <button 
                 onClick={() => setGeneratedData(null)}
                 className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600"
               >
                 Cancel
               </button>
               <button 
                onClick={handleSave}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-md font-bold text-[11px] flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
               >
                 <Save size={14} />
                 Save Draft
               </button>
             </div>
          </div>

          {/* Resume Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-2xl space-y-10 font-sans">
            <div className="border-b border-slate-100 pb-8 text-center space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">{generatedData.personalInfo.fullName}</h1>
              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
                <span>{generatedData.personalInfo.email}</span>
                <span>•</span>
                <span>{generatedData.personalInfo.phone}</span>
                <span>•</span>
                <span>{generatedData.personalInfo.location}</span>
              </div>
            </div>

            <div className="space-y-3">
               <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">Professional Summary</h3>
               <p className="text-sm leading-relaxed text-slate-600 font-medium">{generatedData.summary}</p>
            </div>

            <div className="space-y-8">
               <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">Professional Experience</h3>
               <div className="space-y-8">
                  {generatedData.experience.map((exp, i) => (
                    <div key={i} className="group relative pl-6 border-l border-slate-100 hover:border-indigo-600 transition-colors">
                      <div className="absolute w-2 h-2 rounded-full bg-white border border-slate-200 -left-[4.5px] top-1.5 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all" />
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <h4 className="font-bold text-slate-800">{exp.position}</h4>
                          <p className="text-indigo-600 text-[11px] font-bold">{exp.company}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{exp.startDate} – {exp.endDate}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-50">
               <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">Education</h3>
                  <div className="space-y-4">
                    {generatedData.education.map((edu, i) => (
                      <div key={i}>
                        <h4 className="text-sm font-bold text-slate-800">{edu.degree}</h4>
                        <p className="text-xs text-slate-500 font-medium">{edu.school}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">{edu.startDate} – {edu.endDate}</p>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">Skills & Toolset</h3>
                  <div className="flex flex-wrap gap-2">
                    {generatedData.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                        {skill}
                      </span>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

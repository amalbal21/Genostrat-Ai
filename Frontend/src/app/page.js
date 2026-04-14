'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dna,
  Upload,
  Activity,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  BrainCircuit,
  Database,
  Terminal,
  X,
  Zap,
  FlaskConical,
  BarChart3,
  Lock,
} from 'lucide-react';
import DNA from '@/components/DNA';
import InteractiveBg from '@/components/InteractiveBg';
import TeamSection from '@/components/TeamSection';

// ─── Animation Variants ───────────────────────────────────────────────────────
// Expo-out easing: fast initial movement → silky deceleration to rest
const EXPO_OUT = [0.16, 1, 0.3, 1];
const EASE_OUT = [0.25, 0.46, 0.45, 0.94];

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EXPO_OUT } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88, y: 12 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.8, ease: EXPO_OUT },
  },
};

// Spring config used for hover/tap states
const SPRING = { type: 'spring', stiffness: 320, damping: 24, mass: 0.8 };
const SPRING_SOFT = { type: 'spring', stiffness: 220, damping: 22, mass: 1 };

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label }) {
  return (
    <motion.div
      variants={fadeUp}
      className="stat-shimmer text-center py-5 px-4 rounded-2xl"
      style={{
        background: 'rgba(37,99,235,0.04)',
        border: '1px solid rgba(37,99,235,0.1)',
      }}
    >
      {/* Value — heavy display weight */}
      <div
        className="text-gradient mb-1"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {/* Label — Roboto Mono micro */}
      <div className="type-mono" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </motion.div>
  );
}

// ─── Pharma Feature Card ─────────────────────────────────────────────────────────────
function PharmaFeatureCard({ icon: Icon, title, text }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(79,142,247,0.12)', borderColor: 'rgba(79,142,247,0.22)' }}
      className="glass-card-subtle p-5 rounded-[1.2rem] transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-xl" style={{ background: 'rgba(79,142,247,0.1)' }}>
          <Icon className="w-5 h-5" style={{ color: 'var(--blue)' }} />
        </div>
        <h3 className="type-heading" style={{ fontSize: '1rem', color: '#080c14' }}>{title}</h3>
      </div>
      <p className="type-body pb-1" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        {text}
      </p>
    </motion.div>
  );
}

// ─── Explainable AI Modal ────────────────────────────────────────────────────────
function PredictiveXAIModal({ xaiData, onClose }) {
  if (!xaiData) return null;
  const isResistant = xaiData.type === 'resistant';

  // Use actual attribution values from backend
  const attributions = xaiData.attribution || {};
  const layer1Features = Object.entries(attributions)
    .map(([name, weight]) => ({
      name,
      weight: parseFloat(weight),
      pos: parseFloat(weight) > 0
    }))
    .sort((a,b) => Math.abs(b.weight) - Math.abs(a.weight));

  const counterfactuals = xaiData.counterfactuals || [];
  const narrativeText = xaiData.narrative || "Narrative not generated.";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={SPRING}
        className="glass-card overflow-hidden flex flex-col w-full max-w-2xl max-h-[90vh] shadow-2xl relative"
        style={{ background: 'rgba(255,255,255,0.98)', borderColor: 'rgba(37,99,235,0.2)' }}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 transition-colors z-20">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 overflow-y-auto">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5" style={{ color: 'var(--blue)' }} />
            <h2 className="type-heading" style={{ fontSize: '1.4rem' }}>GenoStrat XAI Report</h2>
          </div>
          <p className="type-mono mb-8" style={{ color: 'var(--text-muted)' }}>
            Patient ID: {xaiData.id} · <span style={{ color: isResistant ? 'var(--red)' : 'var(--green)' }}>{isResistant ? 'Resistant' : 'Sensitive'}</span>
          </p>

          <div className="mb-8">
            <h3 className="type-heading mb-3 flex items-center gap-2" style={{ fontSize: '1rem' }}>
              <span className="w-5 h-5 rounded flex items-center justify-center type-mono text-xs bg-blue-100 text-blue-700">L1</span>
              The Attribution Engine (SHAP)
            </h3>
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {layer1Features.length > 0 ? layer1Features.map((f, i) => {
                const barWidth = Math.min(Math.abs(f.weight) * 200, 100); 
                return (
                <div key={i}>
                  <div className="flex justify-between type-mono text-xs text-slate-500 mb-1.5">
                    <span>{f.name}</span>
                    <span style={{ color: f.pos ? 'var(--green)' : 'var(--red)' }}>{f.pos ? '+' : ''}{f.weight.toFixed(4)}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${barWidth}%` }} transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                      className="h-full rounded-full" style={{ background: f.pos ? 'var(--green)' : 'var(--red)' }}
                    />
                  </div>
                </div>
              )}) : <div className="text-sm text-slate-500">No attribution data available.</div>}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="type-heading mb-3 flex items-center gap-2" style={{ fontSize: '1rem' }}>
              <span className="w-5 h-5 rounded flex items-center justify-center type-mono text-xs bg-purple-100 text-purple-700">L2</span>
              Counterfactual Generator (DiCE)
            </h3>
            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50">
              <ul className="list-disc pl-5 type-body text-sm text-slate-700 leading-relaxed">
                {counterfactuals.length > 0 ? counterfactuals.map((cf, idx) => (
                  <li key={idx}><strong>Tipping Point:</strong> {cf}</li>
                )) : <li>No counterfactual data available.</li>}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="type-heading mb-3 flex items-center gap-2" style={{ fontSize: '1rem' }}>
              <span className="w-5 h-5 rounded flex items-center justify-center type-mono text-xs bg-emerald-100 text-emerald-700">L3</span>
              Narrative Synthesizer
            </h3>
            <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/50">
              <p className="type-body text-sm text-slate-700 leading-relaxed">
                {narrativeText}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GenericModal({ title, onClose }) {
  if (!title) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={SPRING}
        className="glass-card overflow-hidden flex flex-col w-full max-w-lg shadow-2xl relative p-8"
        style={{ background: 'rgba(255,255,255,0.98)' }}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6" style={{ color: 'var(--blue)' }} />
          <h2 className="type-heading" style={{ fontSize: '1.4rem' }}>{title}</h2>
        </div>
        <p className="type-body text-slate-600 mb-6 leading-relaxed">
          Welcome to the {title} module. This enterprise view is currently synchronizing with multi-institutional secure datastores. Advanced cross-cohort insights will be populated dynamically upon completion of the compute cycle.
        </p>
        <div className="flex justify-end pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button onClick={onClose} className="btn-primary px-5 py-2 text-sm" style={{ borderRadius: '0.5rem' }}>Acknowledge</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Mono Label ───────────────────────────────────────────────────────────────
function MonoLabel({ children }) {
  return (
    <span className="type-mono" style={{ color: 'var(--text-muted)' }}>{children}</span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [view, setView] = useState('landing');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedXAI, setSelectedXAI] = useState(null);

  // ── Export Logic ───────────────────────────────────────────────────────────
  const handleExportReport = () => {
    if (!prediction) return;
    let csvContent = "Patient_COSMIC_ID,Predicted_Class,XAI_Summary\n";

    prediction.sensitive.forEach(pt => {
      const reason = pt.narrative ? pt.narrative.replace(/"/g, '""') : "No summary provided";
      csvContent += `${pt.id},High-Responder (Trial Go),"${reason}"\n`;
    });
    prediction.resistant.forEach(pt => {
      const reason = pt.narrative ? pt.narrative.replace(/"/g, '""') : "No summary provided";
      csvContent += `${pt.id},Resistant (Trial No-Go),"${reason}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "genostrat_cohort_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── File Upload Logic ──────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
        const firstParts = lines[0].split(',').map(p => p.trim());
        const isDataset = firstParts.includes('COSMIC_ID') || firstParts.includes('ID') || firstParts.includes('Label');

        if (isDataset && lines.length > 1) {
          setFileData({ type: 'batch', rowCount: lines.length - 1 });
          alert(`Success: Dataset loaded with ${lines.length - 1} subjects. Ready for cohort stratification.`);
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        alert("Error parsing file. Please use a CSV dataset format with a COSMIC_ID or ID column.");
      }
    };
    reader.readAsText(file);
  };

  // ── Predict Logic ──────────────────────────────────────────────────────────
  const handlePredict = async () => {
    if (!fileData || !selectedFile) {
      alert('Please upload genomic data first.');
      return;
    }
    setLoading(true);
    try {
      const text = await selectedFile.text();
      const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const idColIndex = headers.findIndex(h => h.includes('COSMIC_ID') || h.includes('ID') || h.includes('Label'));
      
      if (idColIndex === -1) {
        throw new Error("Could not find a valid ID column in CSV.");
      }

      let sensitive = [];
      let resistant = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        const id = parts[idColIndex];
        const expression_dict = {};
        for (let j = 0; j < headers.length; j++) {
          if (j !== idColIndex && headers[j]) {
            expression_dict[headers[j]] = !isNaN(parseFloat(parts[j])) ? parseFloat(parts[j]) : 0;
          }
        }

        const res = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression_dict })
        });
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error(`Error for ID ${id}:`, err);
          continue; // Skip failed records
        }

        const data = await res.json();
        
        const ptData = {
          id,
          confidence: data.confidence,
          attribution: data.clearbox_layer_1_attribution,
          counterfactuals: data.clearbox_layer_2_counterfactuals,
          narrative: data.clearbox_layer_3_narrative
        };

        if (data.prediction === 'Sensitive') {
          sensitive.push(ptData);
        } else {
          resistant.push(ptData);
        }
      }

      setPrediction({
        type: 'batch',
        sensitive,
        resistant
      });
    } catch (err) {
      alert(`Error: ${err.message}. Make sure the backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ color: 'var(--text-primary)', background: '#ffffff' }}>
      <DNA />
      <InteractiveBg />

      {/* ══════════════════════════════════════════════════════════
          NAVIGATION
      ══════════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 w-full z-50"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(28px) saturate(150%)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center h-14">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: EXPO_OUT }}
            onClick={() => setView('landing')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <motion.div
              whileHover={{ scale: 1.1, boxShadow: '0 0 24px rgba(79,142,247,0.5)', transition: SPRING }}
              whileTap={{ scale: 0.93, transition: SPRING }}
              className="p-1.5 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.12)',
              }}
            >
              <Dna style={{ width: 17, height: 17, color: 'var(--blue)' }} />
            </motion.div>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: '1rem',
                letterSpacing: '-0.04em',
                color: '#080c14',
              }}
            >
              Geno<span className="text-gradient">strat</span>{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.82em' }}>AI</span>
            </span>
          </motion.div>

          {/* Right side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: EXPO_OUT, delay: 0.1 }}
            className="flex items-center gap-5"
          >
            <div className="hidden md:flex items-center gap-5" style={{ color: 'var(--text-secondary)' }}>
              {['Cohort Analytics', 'Genomic Pipelines', 'R&D Case Studies'].map(item => (
                <button
                  key={item}
                  onClick={() => setActiveModal(item)}
                  className="hover:text-black transition-colors duration-200 type-mono"
                  style={{ textTransform: 'none', letterSpacing: '-0.005em', fontSize: '0.78rem' }}
                >
                  {item}
                </button>
              ))}
            </div>

            {view === 'landing' ? (
              <motion.button
                id="nav-portal-btn"
                onClick={() => setView('dashboard')}
                whileHover={{ scale: 1.05, transition: SPRING }}
                whileTap={{ scale: 0.96, transition: SPRING }}
                className="btn-primary px-4 py-2 text-xs"
                style={{ borderRadius: '0.55rem' }}
              >
                Enterprise Portal
              </motion.button>
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full nav-pill">
                <div className="status-dot" style={{ background: 'var(--green)', boxShadow: '0 0 6px rgba(52,211,153,0.5)' }} />
                <span className="type-mono" style={{ color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: '0.005em', fontSize: '0.73rem' }}>
                  Biotech Admin
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════ */}
      <main className="relative z-10 pt-24 md:pt-32 px-6 md:px-10 pb-28">
        <AnimatePresence mode="wait">

          {/* ── LANDING ──────────────────────────────────────────── */}
          {view === 'landing' && (
            <motion.div
              key="landing"
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)', transition: { duration: 0.35, ease: EASE_OUT } }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid lg:grid-cols-2 gap-20 items-center">

                {/* Left */}
                <div>
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.65, ease: EXPO_OUT }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-9 badge-blue"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.35, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    >
                      <Activity className="w-3 h-3" style={{ color: 'var(--blue)' }} />
                    </motion.span>
                    <span className="type-mono" style={{ color: 'var(--blue-bright)', textTransform: 'none', letterSpacing: '0.03em', fontSize: '0.7rem' }}>
                      AI-Driven Trial Stratification · R&amp;D Platform
                    </span>
                  </motion.div>

                  {/* Hero headline — maximum weight on desktop */}
                  <motion.h1 variants={fadeUp} className="type-display mb-7">
                    De-risking the<br />
                    $2.6B <span className="text-gradient">Pipeline</span><br />
                    <span
                      style={{
                        color: 'var(--text-muted)',
                        fontFamily: "'Roboto Mono', monospace",
                        fontWeight: 300,
                        fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      via In-Silico Screening.
                    </span>
                  </motion.h1>

                  {/* Subtext */}
                  <motion.p
                    variants={fadeUp}
                    className="type-body max-w-md mb-10"
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                  >
                    Reduce Phase II/III timelines by up to 40% and prevent millions in R&amp;D waste. Our 1D CNN identifies high-responders instantly, saving ~₹30L per avoided 'No-Go' participant.
                  </motion.p>

                  {/* CTAs */}
                  <motion.div variants={fadeUp} className="flex flex-wrap gap-3.5 mb-16">
                    <motion.button
                      id="launch-predictor-btn"
                      onClick={() => setView('dashboard')}
                      whileHover={{ scale: 1.04, transition: SPRING }}
                      whileTap={{ scale: 0.97, transition: SPRING }}
                      className="btn-primary flex items-center gap-2.5 px-7 py-3.5 text-sm"
                    >
                      Run Trial Simulation
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => setActiveModal('View Biotech Case Studies')}
                      whileHover={{ scale: 1.03, transition: SPRING }}
                      whileTap={{ scale: 0.97, transition: SPRING }}
                      className="btn-secondary flex items-center gap-2.5 px-7 py-3.5 text-sm"
                    >
                      View Biotech Case Studies
                    </motion.button>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    variants={stagger}
                    className="grid grid-cols-3 gap-4 pt-8"
                    style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                  >
                    <StatCard value="₹30L" label="Saved per 'No-Go'" />
                    <StatCard value="89%" label="Waste Prevented" />
                    <StatCard value="40%" label="Time Reduction" />
                  </motion.div>
                </div>

                {/* Right — Value Propositions */}
                <motion.div variants={stagger} className="relative hidden lg:grid grid-cols-2 gap-4 auto-rows-max pt-6">
                  {/* Ambient glow */}
                  <div className="absolute -inset-20 rounded-full pointer-events-none" style={{
                    background: 'radial-gradient(ellipse, rgba(79,142,247,0.1) 0%, transparent 68%)',
                  }} />

                  <PharmaFeatureCard
                    icon={Zap}
                    title="Acceleration"
                    text="Reduce Phase II/III timelines by up to 40% by identifying high-responders instantly via In-Silico screening."
                  />
                  <PharmaFeatureCard
                    icon={BarChart3}
                    title="Financial Impact"
                    text="Prevent millions in R&D waste. Our model identifies the 89% of resistant patients before they enter the trial, saving ~₹3,000,000 per avoided 'No-Go' participant."
                  />
                  <PharmaFeatureCard
                    icon={ShieldCheck}
                    title="Safety & Ethics"
                    text="Eliminate unnecessary toxicity. Ensure that experimental compounds are only administered to patients with the genomic profile to benefit, protecting human lives from futile side effects."
                  />
                  <PharmaFeatureCard
                    icon={FlaskConical}
                    title="Asset Salvage"
                    text="Save potential blockbusters from trial failure. GenoStrat can 'rescue' drugs that failed 'all-comer' trials by uncovering the specific sub-populations where the drug actually works."
                  />
                </motion.div>

              </div>
            </motion.div>
          )}


          {/* ── DASHBOARD ────────────────────────────────────────── */}
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={stagger}
              initial="hidden"
              animate="show"
              className="max-w-6xl mx-auto"
            >
              {/* Header */}
              <motion.div variants={fadeUp} className="flex items-start justify-between mb-12 flex-wrap gap-6">
                <div>
                  <MonoLabel>Cohort Optimization Dashboard</MonoLabel>
                  <h1 className="type-title mt-2 mb-3">
                    Trial Phase II <span className="text-gradient">Simulation</span>
                  </h1>
                  <p className="type-body" style={{ color: 'var(--text-secondary)' }}>
                    Screening cohort for{' '}
                    <span style={{ color: '#080c14', fontWeight: 600 }}>Ulixertinib</span>{' '}
                    responsiveness to boost trial success probability.
                  </p>
                </div>
                <motion.button
                  onClick={handleExportReport}
                  whileHover={{ scale: 1.04, transition: SPRING }}
                  whileTap={{ scale: 0.97, transition: SPRING }}
                  className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  <Database className="w-4 h-4" />
                  Export Report
                </motion.button>
              </motion.div>

              {/* Grid */}
              <div className="grid lg:grid-cols-3 gap-6">

                {/* Left — Upload + Result */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Upload Zone */}
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ boxShadow: '0 0 44px rgba(79,142,247,0.14)', transition: { duration: 0.5 } }}
                    className="glass-card relative overflow-hidden cursor-pointer"
                    style={{
                      borderStyle: 'dashed',
                      borderWidth: '2px',
                      borderColor: fileData ? 'rgba(22,163,74,0.25)' : 'rgba(37,99,235,0.18)',
                      transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
                    }}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handleFileUpload}
                      accept=".csv,.json"
                    />

                    <div className="flex flex-col items-center justify-center text-center p-12">
                      {/* Icon with breathing glow */}
                      <div className="relative mb-7">
                        <motion.div
                          animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.5, 0.25] }}
                          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: fileData ? 'rgba(22,163,74,0.07)' : 'rgba(37,99,235,0.06)',
                            filter: 'blur(14px)',
                          }}
                        />
                        <motion.div
                          whileHover={{ scale: 1.08, rotate: 4, transition: SPRING }}
                          className="relative p-6 rounded-2xl"
                          style={{
                            background: fileData ? 'rgba(22,163,74,0.05)' : 'rgba(37,99,235,0.05)',
                            border: `1px solid ${fileData ? 'rgba(22,163,74,0.15)' : 'rgba(37,99,235,0.15)'}`,
                          }}
                        >
                          <Upload
                            className="w-9 h-9"
                            style={{ color: fileData ? 'var(--green)' : 'var(--blue)' }}
                          />
                        </motion.div>
                      </div>

                      <h3 className="type-heading mb-2.5" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}>
                        {fileData ? '✓ Cohort Data Loaded' : 'Upload Multi-Omic Cohort Data'}
                      </h3>
                      <p className="type-body max-w-xs mb-8" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {fileData
                          ? `Ready to run in-silico screening on trial candidates.`
                          : 'Drop a .CSV or .JSON of trial candidates for stratification.'}
                      </p>

                      <motion.button
                        id="start-prediction-btn"
                        onClick={(e) => { e.stopPropagation(); handlePredict(); }}
                        disabled={loading || !fileData}
                        whileHover={!loading && fileData ? { scale: 1.05, transition: SPRING } : {}}
                        whileTap={!loading && fileData ? { scale: 0.97, transition: SPRING } : {}}
                        className="btn-primary relative z-20 px-10 py-3.5 text-sm disabled:opacity-35 disabled:cursor-not-allowed"
                        style={{
                          borderRadius: '0.7rem',
                          ...(loading ? { background: 'rgba(79,142,247,0.5)', cursor: 'wait' } : {}),
                        }}
                      >
                        {loading ? (
                          <span className="flex items-center gap-3">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Screening Candidates…
                          </span>
                        ) : 'Screen Cohort'}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Prediction Result */}
                  <AnimatePresence>
                    {prediction && (
                      <motion.div
                        key="result-batch"
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18, filter: 'blur(3px)' }}
                        transition={{ duration: 0.7, ease: EXPO_OUT }}
                        className="glass-card p-8 relative overflow-hidden shadow-lg"
                        style={{ borderColor: 'rgba(37,99,235,0.2)' }}
                      >
                        <h4 className="type-heading mb-6" style={{ fontSize: '1.2rem' }}>Cohort Stratification Results</h4>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Sensitive List */}
                          <div className="p-5 rounded-2xl" style={{ background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.15)' }}>
                            <div className="flex items-center gap-2 mb-4">
                              <BrainCircuit className="w-5 h-5" style={{ color: 'var(--green)' }} />
                              <span className="type-heading text-lg" style={{ color: 'var(--green)' }}>High-Responders (Trial Go)</span>
                              <span className="ml-auto type-mono text-sm" style={{ color: 'var(--text-muted)' }}>{prediction.sensitive.length} pts</span>
                            </div>
                            <div className="max-h-48 overflow-y-auto pr-2 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                              {prediction.sensitive.length > 0 ? prediction.sensitive.map((pt, idx) => (
                                <motion.button
                                  key={idx}
                                  onClick={() => setSelectedXAI({ id: pt.id, type: 'sensitive', ...pt })}
                                  whileHover={{ scale: 1.03, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="type-mono text-sm py-1.5 px-3 rounded-lg w-full text-left transition-colors"
                                  style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(22,163,74,0.1)', cursor: 'pointer' }}
                                >
                                  ID: {pt.id} <span className="float-right text-[10px] text-green-600 opacity-60 pt-0.5">{pt.confidence} ↱</span>
                                </motion.button>
                              )) : <div className="text-sm" style={{ color: 'var(--text-muted)' }}>None found.</div>}
                            </div>
                          </div>

                          {/* Resistant List */}
                          <div className="p-5 rounded-2xl" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)' }}>
                            <div className="flex items-center gap-2 mb-4">
                              <BrainCircuit className="w-5 h-5" style={{ color: 'var(--red)' }} />
                              <span className="type-heading text-lg" style={{ color: 'var(--red)' }}>Resistant (Trial No-Go)</span>
                              <span className="ml-auto type-mono text-sm" style={{ color: 'var(--text-muted)' }}>{prediction.resistant.length} pts</span>
                            </div>
                            <div className="max-h-48 overflow-y-auto pr-2 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                              {prediction.resistant.length > 0 ? prediction.resistant.map((pt, idx) => (
                                <motion.button
                                  key={idx}
                                  onClick={() => setSelectedXAI({ id: pt.id, type: 'resistant', ...pt })}
                                  whileHover={{ scale: 1.03, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="type-mono text-sm py-1.5 px-3 rounded-lg w-full text-left transition-colors"
                                  style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(220,38,38,0.1)', cursor: 'pointer' }}
                                >
                                  ID: {pt.id} <span className="float-right text-[10px] text-red-600 opacity-60 pt-0.5">{pt.confidence} ↱</span>
                                </motion.button>
                              )) : <div className="text-sm" style={{ color: 'var(--text-muted)' }}>None found.</div>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right — Insights sidebar */}
                <div className="space-y-5">

                  {/* Model Specs */}
                  <motion.div variants={fadeUp} className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Terminal className="w-3.5 h-3.5" style={{ color: 'var(--blue)' }} />
                      <MonoLabel>Model Specs</MonoLabel>
                    </div>
                    <div className="space-y-0">
                      {[
                        { label: 'Architecture', value: '1D CNN' },
                        { label: 'Regularization', value: 'Dropout 0.2' },
                        { label: 'Dataset', value: 'GDSC v8.4' },
                        { label: 'Task', value: 'Binary Class.' },
                        { label: 'Features', value: 'SelectKBest 900' },
                      ].map(({ label, value }) => (
                        <div key={label} className="data-row flex justify-between items-center py-3">
                          <span className="type-mono" style={{ color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: '0.01em', fontSize: '0.75rem' }}>
                            {label}
                          </span>
                          <span
                            className="type-mono px-2.5 py-1 rounded-md"
                            style={{
                              background: 'rgba(79,142,247,0.06)',
                              color: 'var(--text-primary)',
                              textTransform: 'none',
                              letterSpacing: '0.01em',
                              fontSize: '0.72rem',
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Deprecated Roadmap Section Component removed per design update */}

                  {/* Live Status */}
                  <motion.div variants={fadeUp} className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="status-dot"
                        style={{ background: 'var(--green)', boxShadow: '0 0 7px rgba(52,211,153,0.5)' }}
                      />
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                      }}>
                        Backend Connected
                      </span>
                    </div>
                    <div className="type-mono" style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: '0.01em', fontSize: '0.7rem' }}>
                      FastAPI · localhost:8000 · Model v1.0
                    </div>
                  </motion.div>

                  {/* Savings Impact Module */}
                  <motion.div variants={fadeUp} className="glass-card p-6" style={{ background: 'rgba(22,163,74,0.05)', borderColor: 'rgba(22,163,74,0.15)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5" style={{ color: 'var(--green)' }} />
                      <span className="type-heading text-sm" style={{ color: 'var(--green)' }}>Projected ROI Savings</span>
                    </div>
                    <div className="type-mono font-bold tracking-tighter leading-none pt-2 pb-1" style={{ color: 'var(--green)', fontSize: '2.5rem' }}>
                      ₹{prediction && prediction.resistant ? (prediction.resistant.length * 3000000).toLocaleString('en-IN') : '0'}
                    </div>
                    <div className="type-mono mt-4" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                      {prediction && prediction.resistant ? `Saved by averting trial resources for ${prediction.resistant.length} non-responding subjects.` : 'Awaiting cohort screening to calculate prevented waste.'}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Team Section Component conditionally rendered directly below the main layout block for dashboard */}
      {view === 'dashboard' && <TeamSection />}

      {/* Modals */}
      <AnimatePresence>
        {activeModal && <GenericModal title={activeModal} onClose={() => setActiveModal(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedXAI && <PredictiveXAIModal xaiData={selectedXAI} onClose={() => setSelectedXAI(null)} />}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          FLOATING CHAT BOT
      ══════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-8 right-8 z-[100]" style={{ isolation: 'isolate' }}>
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              id="chatbot-window"
              initial={{ opacity: 0, scale: 0.82, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.82, y: 18 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card mb-4 overflow-hidden flex flex-col shadow-2xl"
              style={{ width: 360, height: 480, borderColor: 'rgba(37,99,235,0.15)' }}
            >
              {/* Header */}
              <div
                className="px-4 py-3.5 flex justify-between items-center"
                style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dim))' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <BrainCircuit className="w-4 h-4 text-white" />
                  </div>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#fff',
                    letterSpacing: '-0.02em',
                  }}>
                    GenoBot AI
                  </span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ background: 'rgba(248,249,255,0.95)' }}>
                {[
                  { from: 'bot', text: 'Welcome to GenoStrat Enterprise. I am specialized in high-throughput genomic pipeline operations. How can I assist your trial stratification?' },
                  { from: 'user', text: 'What is our expected latency for an 800-patient cohort simulation?' },
                  { from: 'bot', text: 'Executing 1D CNN Inference on 800 subjects via the SelectKBest vectorizer requires approximately 1.4 seconds of compute overhead. Regulatory tracking is automatically logged.' },
                  { from: 'user', text: 'Can this mitigate FDA Phase III failure risks?' },
                  { from: 'bot', text: 'Absolutely. By identifying resistant baseline biomarker signatures early, you eliminate up to 89% of potential non-responders, significantly de-risking Phase III endpoint misses.' },
                ].map((msg, i) => (
                  <div
                    key={i}
                    className="text-sm p-3.5 rounded-2xl max-w-[88%] leading-relaxed"
                    style={msg.from === 'bot'
                      ? { background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '1rem 1rem 1rem 0.25rem', color: 'var(--text-primary)' }
                      : { background: 'linear-gradient(135deg, var(--blue), var(--blue-dim))', marginLeft: 'auto', color: '#fff', borderRadius: '1rem 1rem 0.25rem 1rem' }
                    }
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3" style={{ background: 'rgba(248,249,255,0.98)', borderTop: '1px solid rgba(37,99,235,0.08)' }}>
                <div className="flex gap-2">
                  <input
                    id="chat-input"
                    type="text"
                    placeholder="Ask about model architecture…"
                    className="input-dark flex-1 px-4 py-2.5 text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1, boxShadow: '0 0 16px rgba(79,142,247,0.4)', transition: SPRING }}
                    whileTap={{ scale: 0.93, transition: SPRING }}
                    className="p-2.5 rounded-xl"
                    style={{ background: 'var(--blue)', boxShadow: '0 0 10px rgba(79,142,247,0.25)' }}
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <motion.button
          id="chat-fab"
          onClick={() => setIsChatOpen(!isChatOpen)}
          whileHover={{ scale: 1.14, boxShadow: '0 0 36px rgba(79,142,247,0.58)', transition: SPRING }}
          whileTap={{ scale: 0.9, transition: SPRING }}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, var(--blue), var(--blue-dim))',
            boxShadow: '0 0 20px rgba(79,142,247,0.35)',
          }}
        >
          <AnimatePresence mode="wait">
            {isChatOpen
              ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X className="w-5 h-5" /></motion.div>
              : <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><MessageSquare className="w-5 h-5" /></motion.div>
            }
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer
        className="relative z-10 px-6 md:px-10 py-7"
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5" style={{ opacity: 0.4 }}>
            <Dna className="w-3.5 h-3.5" style={{ color: 'var(--blue)' }} />
            <span className="type-mono" style={{ color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 0, fontSize: '0.72rem' }}>
              © 2026 Geno strat AI · Pharmacogenomics MVM
            </span>
          </div>
          <div className="flex gap-5">
            {['Research Paper', 'GDSC Repository', 'Clinical Support', 'Privacy Policy'].map(link => (
              <button
                key={link}
                className="hover:text-white transition-colors duration-200 type-mono"
                style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: '0.005em', fontSize: '0.7rem' }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

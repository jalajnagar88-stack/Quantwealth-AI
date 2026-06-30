import React, { useState, useEffect } from 'react';
import { 
  FileText, Zap, CheckCircle2, AlertCircle, 
  Download, ArrowRight, ArrowLeft, RefreshCw,
  Package, Settings, Rocket, FileEdit, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './HacdIssuance.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://hacd-production.up.railway.app';

// Asset types
const ASSET_TYPES = [
  { value: 'FT', label: 'Fungible Token (FT)', desc: 'Standard token like ERC-20' },
  { value: 'NFT', label: 'Non-Fungible Token (NFT)', desc: 'Unique digital assets' },
  { value: 'SFT', label: 'Semi-Fungible Token (SFT)', desc: 'Batched unique items' },
  { value: 'HYBRID', label: 'Hybrid (FT + NFT)', desc: 'Combined structure' },
];

// Categories
const CATEGORIES = [
  'meme', 'ai_agent', 'art', 'rwa', 'stable_asset', 'game', 'community', 'utility', 'other'
];

// Phase models
const PHASE_MODELS = [
  { value: 'public', label: 'Public Sale' },
  { value: 'allowlist', label: 'Allowlist Only' },
  { value: 'designated_first', label: 'Designated First Phase' },
  { value: 'custom', label: 'Custom Model' },
];

// Removal effects
const REMOVAL_EFFECTS = [
  { value: 'burn', label: 'Burn Asset' },
  { value: 'disable', label: 'Disable Asset' },
  { value: 'no_effect', label: 'No Effect' },
  { value: 'unknown', label: 'Unknown' },
];

export default function HacdIssuance() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [specs, setSpecs] = useState([]);
  const [currentSpec, setCurrentSpec] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState({});
  const [error, setError] = useState('');
  const [scoreResult, setScoreResult] = useState(null);
  const [roastResult, setRoastResult] = useState(null);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    project: {
      name: '',
      ticker: '',
      category: 'utility',
      description: '',
      website: '',
      x: '',
      contact: '',
    },
    asset: {
      type: 'FT',
      total_supply: 1000000,
      decimals: 18,
      unit_name: 'tokens',
      utility_summary: '',
    },
    stack: {
      total_hacd_lots: 100,
      hacd_per_lot: 1,
      units_per_hacd_lot: 10000,
      stack_cost_hac_per_hacd: 50,
      network_fee_required: true,
      designated_address_required: false,
      designated_address: '',
      first_phase_hacd_lots: 20,
      public_phase_hacd_lots: 80,
      removal_effect: 'burn',
    },
    launch: {
      target_date_utc: '',
      launchpad_url: 'https://hacd.it/launchpad',
      phase_model: 'public',
      min_hacd_per_participant: 1,
      max_hacd_per_participant: null,
      status: 'draft',
    },
    copy: {
      headline: '',
      subheadline: '',
      short_description: '',
      risk_disclosure: '',
    },
  });

  const getToken = () => localStorage.getItem('token');

  const apiFetch = async (path, opts = {}) => {
    const res = await fetch(`${API_URL}/api/hacd-issuance${path}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      ...opts,
    });
    return res.json();
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const fetchSpecs = async () => {
    const data = await apiFetch('/list');
    if (data.success) setSpecs(data.data);
  };

  const createSpec = async () => {
    setLoading(true);
    setError('');
    const data = await apiFetch('/create', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    setLoading(false);
    if (data.success) {
      setCurrentSpec(data.data);
      setSuccess('Launch spec created successfully!');
      fetchSpecs();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(data.message || 'Failed to create launch spec');
    }
  };

  const updateSpec = async () => {
    if (!currentSpec) return;
    setLoading(true);
    const data = await apiFetch(`/${currentSpec._id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
    setLoading(false);
    if (data.success) {
      setCurrentSpec(data.data);
      setSuccess('Launch spec updated!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(data.message || 'Failed to update');
    }
  };

  const generateAllDocs = async () => {
    if (!currentSpec) return;
    setGenerating(true);
    setError('');
    const data = await apiFetch(`/${currentSpec._id}/generate-all`, { method: 'POST' });
    setGenerating(false);
    if (data.success) {
      setGeneratedDocs(data.data.generated_docs);
      setSuccess('All 8 documents generated!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(data.message || 'Generation failed');
    }
  };

  const validateSpec = async () => {
    if (!currentSpec) return;
    setLoading(true);
    const data = await apiFetch(`/${currentSpec._id}/validate`, { method: 'POST' });
    setLoading(false);
    if (data.success) {
      setValidationResult(data.data);
    } else {
      setError(data.message || 'Validation failed');
    }
  };

  const exportSpec = async () => {
    if (!currentSpec) return;
    const res = await fetch(`${API_URL}/api/hacd-issuance/${currentSpec._id}/export`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSpec.project.ticker}_launch_spec.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const expandIntake = async (answers) => {
    setLoading(true);
    setError('');
    const data = await apiFetch('/expand-intake', {
      method: 'POST',
      body: JSON.stringify(answers),
    });
    setLoading(false);
    if (data.success) {
      setFormData(data.data);
      setSuccess('Intake form expanded from Google Form answers!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(data.message || 'Intake expansion failed');
    }
  };

  const scoreProject = async () => {
    if (!currentSpec) return;
    setLoading(true);
    setError('');
    const data = await apiFetch(`/${currentSpec._id}/score`, { method: 'POST' });
    setLoading(false);
    if (data.success) {
      setScoreResult(data.data);
    } else {
      setError(data.message || 'Scoring failed');
    }
  };

  const roastSpec = async () => {
    if (!currentSpec) return;
    setLoading(true);
    setError('');
    const data = await apiFetch(`/${currentSpec._id}/roast`, { method: 'POST' });
    setLoading(false);
    if (data.success) {
      setRoastResult(data.data);
    } else {
      setError(data.message || 'Roast mode failed');
    }
  };

  const handleNext = async () => {
    if (step === 5) {
      if (currentSpec) {
        await updateSpec();
      } else {
        await createSpec();
      }
    }
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // Calculate derived values
  const calculatedSupply = formData.stack.total_hacd_lots * formData.stack.units_per_hacd_lot;
  const formationCost = formData.stack.total_hacd_lots * formData.stack.stack_cost_hac_per_hacd;
  const phaseSum = formData.stack.first_phase_hacd_lots + formData.stack.public_phase_hacd_lots;

  return (
    <div className="hacd-issuance">
      <div className="hi-header">
        <div className="hi-title">
          <Zap size={32} />
          <div>
            <h1>HACD Stack Token Issuance</h1>
            <p>Generate your complete launch package for HACD Incubator Cohort 2</p>
          </div>
        </div>
        <div className="hi-actions">
          <button className="hi-btn hi-btn-primary" onClick={() => setStep(1)}>
            <FileText size={16} /> New Project
          </button>
        </div>
      </div>

      {success && (
        <div className="hi-alert hi-alert-success">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {error && (
        <div className="hi-alert hi-alert-error">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Step indicator */}
      <div className="hi-steps">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} className={`hi-step ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
            <div className="hi-step-number">{s}</div>
            <div className="hi-step-label">
              {s === 1 && 'Project Info'}
              {s === 2 && 'Asset Config'}
              {s === 3 && 'Stack Config'}
              {s === 4 && 'Launch Settings'}
              {s === 5 && 'Copy & Review'}
              {s === 6 && 'Generate & Validate'}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Project Info */}
      {step === 1 && (
        <div className="hi-section">
          <h2><Package size={20} /> Project Information</h2>
          <div className="hi-form-grid">
            <div className="hi-form-group">
              <label>Project Name *</label>
              <input
                type="text"
                value={formData.project.name}
                onChange={(e) => updateField('project', 'name', e.target.value)}
                placeholder="e.g., StackFire"
              />
            </div>
            <div className="hi-form-group">
              <label>Ticker Symbol *</label>
              <input
                type="text"
                value={formData.project.ticker}
                onChange={(e) => updateField('project', 'ticker', e.target.value.toUpperCase())}
                placeholder="e.g., SFR"
                maxLength={6}
              />
            </div>
            <div className="hi-form-group">
              <label>Category *</label>
              <select
                value={formData.project.category}
                onChange={(e) => updateField('project', 'category', e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="hi-form-group">
              <label>Contact Email *</label>
              <input
                type="email"
                value={formData.project.contact}
                onChange={(e) => updateField('project', 'contact', e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="hi-form-group hi-full">
              <label>Description *</label>
              <textarea
                value={formData.project.description}
                onChange={(e) => updateField('project', 'description', e.target.value)}
                placeholder="Describe your project in 2-3 sentences..."
                rows={3}
              />
            </div>
            <div className="hi-form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.project.website}
                onChange={(e) => updateField('project', 'website', e.target.value)}
                placeholder="https://yourproject.com"
              />
            </div>
            <div className="hi-form-group">
              <label>X (Twitter)</label>
              <input
                type="text"
                value={formData.project.x}
                onChange={(e) => updateField('project', 'x', e.target.value)}
                placeholder="@yourproject"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Asset Config */}
      {step === 2 && (
        <div className="hi-section">
          <h2><Settings size={20} /> Asset Configuration</h2>
          <div className="hi-form-grid">
            <div className="hi-form-group">
              <label>Asset Type *</label>
              <select
                value={formData.asset.type}
                onChange={(e) => updateField('asset', 'type', e.target.value)}
              >
                {ASSET_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
                ))}
              </select>
            </div>
            <div className="hi-form-group">
              <label>Total Supply *</label>
              <input
                type="number"
                value={formData.asset.total_supply}
                onChange={(e) => updateField('asset', 'total_supply', parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div className="hi-form-group">
              <label>Decimals *</label>
              <input
                type="number"
                value={formData.asset.decimals}
                onChange={(e) => updateField('asset', 'decimals', parseInt(e.target.value) || 0)}
                min={0}
                max={18}
              />
            </div>
            <div className="hi-form-group">
              <label>Unit Name *</label>
              <input
                type="text"
                value={formData.asset.unit_name}
                onChange={(e) => updateField('asset', 'unit_name', e.target.value)}
                placeholder="e.g., tokens"
              />
            </div>
            <div className="hi-form-group hi-full">
              <label>Utility Summary *</label>
              <textarea
                value={formData.asset.utility_summary}
                onChange={(e) => updateField('asset', 'utility_summary', e.target.value)}
                placeholder="What does this token do at launch?"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Stack Config */}
      {step === 3 && (
        <div className="hi-section">
          <h2><Package size={20} /> Stack Configuration</h2>
          <div className="hi-math-preview">
            <div className="hi-math-item">
              <span className="hi-math-label">Calculated Supply:</span>
              <span className="hi-math-value">{calculatedSupply.toLocaleString()}</span>
              {calculatedSupply !== formData.asset.total_supply && (
                <span className="hi-math-warning">⚠️ Mismatch with asset supply ({formData.asset.total_supply.toLocaleString()})</span>
              )}
            </div>
            <div className="hi-math-item">
              <span className="hi-math-label">Formation Cost:</span>
              <span className="hi-math-value">{formationCost.toLocaleString()} HAC</span>
            </div>
            <div className="hi-math-item">
              <span className="hi-math-label">Phase Sum:</span>
              <span className="hi-math-value">{phaseSum}</span>
              {phaseSum !== formData.stack.total_hacd_lots && (
                <span className="hi-math-warning">⚠️ Mismatch with total lots ({formData.stack.total_hacd_lots})</span>
              )}
            </div>
          </div>
          <div className="hi-form-grid">
            <div className="hi-form-group">
              <label>Total HACD Lots *</label>
              <input
                type="number"
                value={formData.stack.total_hacd_lots}
                onChange={(e) => updateField('stack', 'total_hacd_lots', parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div className="hi-form-group">
              <label>HACD per Lot *</label>
              <input
                type="number"
                value={formData.stack.hacd_per_lot}
                onChange={(e) => updateField('stack', 'hacd_per_lot', parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div className="hi-form-group">
              <label>Units per HACD Lot *</label>
              <input
                type="number"
                value={formData.stack.units_per_hacd_lot}
                onChange={(e) => updateField('stack', 'units_per_hacd_lot', parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div className="hi-form-group">
              <label>Stack Cost (HAC per HACD) *</label>
              <input
                type="number"
                value={formData.stack.stack_cost_hac_per_hacd}
                onChange={(e) => updateField('stack', 'stack_cost_hac_per_hacd', parseFloat(e.target.value) || 0)}
                min={0}
                step={0.1}
              />
              <small className="hi-hint">Benchmark: 10-50 (low), 50-100 (mid), 100-500 (premium)</small>
            </div>
            <div className="hi-form-group">
              <label>First Phase Lots *</label>
              <input
                type="number"
                value={formData.stack.first_phase_hacd_lots}
                onChange={(e) => updateField('stack', 'first_phase_hacd_lots', parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="hi-form-group">
              <label>Public Phase Lots *</label>
              <input
                type="number"
                value={formData.stack.public_phase_hacd_lots}
                onChange={(e) => updateField('stack', 'public_phase_hacd_lots', parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="hi-form-group">
              <label>Removal Effect *</label>
              <select
                value={formData.stack.removal_effect}
                onChange={(e) => updateField('stack', 'removal_effect', e.target.value)}
              >
                {REMOVAL_EFFECTS.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div className="hi-form-group">
              <label>Designated Address</label>
              <input
                type="text"
                value={formData.stack.designated_address}
                onChange={(e) => updateField('stack', 'designated_address', e.target.value)}
                placeholder="HAC address (if required)"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Launch Settings */}
      {step === 4 && (
        <div className="hi-section">
          <h2><Rocket size={20} /> Launch Settings</h2>
          <div className="hi-form-grid">
            <div className="hi-form-group">
              <label>Target Date (UTC) *</label>
              <input
                type="date"
                value={formData.launch.target_date_utc}
                onChange={(e) => updateField('launch', 'target_date_utc', e.target.value)}
              />
            </div>
            <div className="hi-form-group">
              <label>Phase Model *</label>
              <select
                value={formData.launch.phase_model}
                onChange={(e) => updateField('launch', 'phase_model', e.target.value)}
              >
                {PHASE_MODELS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="hi-form-group">
              <label>Min HACD per Participant *</label>
              <input
                type="number"
                value={formData.launch.min_hacd_per_participant}
                onChange={(e) => updateField('launch', 'min_hacd_per_participant', parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div className="hi-form-group">
              <label>Max HACD per Participant</label>
              <input
                type="number"
                value={formData.launch.max_hacd_per_participant || ''}
                onChange={(e) => updateField('launch', 'max_hacd_per_participant', e.target.value ? parseInt(e.target.value) : null)}
                min={1}
                placeholder="No limit"
              />
            </div>
            <div className="hi-form-group hi-full">
              <label>Launchpad URL</label>
              <input
                type="url"
                value={formData.launch.launchpad_url}
                onChange={(e) => updateField('launch', 'launchpad_url', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Copy & Review */}
      {step === 5 && (
        <div className="hi-section">
          <h2><FileEdit size={20} /> Copy & Marketing</h2>
          <div className="hi-form-grid">
            <div className="hi-form-group hi-full">
              <label>Headline *</label>
              <input
                type="text"
                value={formData.copy.headline}
                onChange={(e) => updateField('copy', 'headline', e.target.value)}
                placeholder="Catchy headline for Launchpad"
              />
            </div>
            <div className="hi-form-group hi-full">
              <label>Subheadline *</label>
              <input
                type="text"
                value={formData.copy.subheadline}
                onChange={(e) => updateField('copy', 'subheadline', e.target.value)}
                placeholder="Supporting headline"
              />
            </div>
            <div className="hi-form-group hi-full">
              <label>Short Description *</label>
              <textarea
                value={formData.copy.short_description}
                onChange={(e) => updateField('copy', 'short_description', e.target.value)}
                placeholder="2-3 sentence description"
                rows={3}
              />
            </div>
            <div className="hi-form-group hi-full">
              <label>Risk Disclosure *</label>
              <textarea
                value={formData.copy.risk_disclosure}
                onChange={(e) => updateField('copy', 'risk_disclosure', e.target.value)}
                placeholder="Must include risk, loss, or volatility language"
                rows={4}
              />
              <small className="hi-hint">⚠️ No price guarantees, investment advice, or risk-free claims</small>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Generate & Validate */}
      {step === 6 && (
        <div className="hi-section">
          <h2><Shield size={20} /> Generate & Validate</h2>
          
          {!currentSpec && (
            <div className="hi-empty">
              <p>Save your spec first to generate documents</p>
              <button className="hi-btn hi-btn-primary" onClick={createSpec} disabled={loading}>
                {loading ? 'Saving...' : 'Save & Generate'}
              </button>
            </div>
          )}

          {currentSpec && (
            <div className="hi-generation">
              <div className="hi-gen-actions">
                <button 
                  className="hi-btn hi-btn-primary" 
                  onClick={generateAllDocs}
                  disabled={generating}
                >
                  {generating ? <><RefreshCw className="spin" size={16} /> Generating...</> : <><Zap size={16} /> Generate All 8 Documents</>}
                </button>
                <button className="hi-btn" onClick={validateSpec} disabled={loading}>
                  <Shield size={16} /> Validate
                </button>
                <button className="hi-btn" onClick={scoreProject} disabled={loading}>
                  <CheckCircle2 size={16} /> Score Project
                </button>
                <button className="hi-btn" onClick={roastSpec} disabled={loading}>
                  <AlertCircle size={16} /> Roast Mode
                </button>
                <button className="hi-btn" onClick={exportSpec}>
                  <Download size={16} /> Export JSON
                </button>
              </div>

              {validationResult && (
                <div className={`hi-validation ${validationResult.passed ? 'passed' : 'failed'}`}>
                  <h3>
                    {validationResult.passed ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {validationResult.passed ? 'Validation Passed' : 'Validation Failed'}
                  </h3>
                  {validationResult.errors.length > 0 && (
                    <div className="hi-errors">
                      <h4>Errors:</h4>
                      {validationResult.errors.map((err, i) => (
                        <div key={i} className="hi-error-item">❌ {err}</div>
                      ))}
                    </div>
                  )}
                  {validationResult.warnings.length > 0 && (
                    <div className="hi-warnings">
                      <h4>Warnings:</h4>
                      {validationResult.warnings.map((warn, i) => (
                        <div key={i} className="hi-warning-item">⚠️ {warn}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {Object.keys(generatedDocs).length > 0 && (
                <div className="hi-docs-list">
                  <h3>Generated Documents</h3>
                  {Object.entries(generatedDocs).map(([key, content]) => (
                    <div key={key} className="hi-doc-item">
                      <span className="hi-doc-name">{key.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="hi-doc-status">✓ Generated</span>
                    </div>
                  ))}
                </div>
              )}

              {scoreResult && (
                <div className="hi-validation passed">
                  <h3><CheckCircle2 size={20} /> Project Score: {scoreResult.overall_score}/10</h3>
                  <div className="hi-errors">
                    <h4>Criteria Scores:</h4>
                    {Object.entries(scoreResult.criteria).map(([key, value]) => (
                      <div key={key} className="hi-error-item">
                        <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {value.score}/10 — {value.reasoning}
                      </div>
                    ))}
                  </div>
                  <div className="hi-warnings">
                    <h4>Recommendations:</h4>
                    {scoreResult.recommendations.map((rec, i) => (
                      <div key={i} className="hi-warning-item">💡 {rec}</div>
                    ))}
                  </div>
                </div>
              )}

              {roastResult && (
                <div className={`hi-validation ${roastResult.overall_grade === 'A' || roastResult.overall_grade === 'B' ? 'passed' : 'failed'}`}>
                  <h3><AlertCircle size={20} /> Roast Mode — Grade: {roastResult.overall_grade}</h3>
                  <p>{roastResult.summary}</p>
                  <div className="hi-errors">
                    <h4>Issues Found:</h4>
                    {roastResult.issues.map((issue, i) => (
                      <div key={i} className="hi-error-item">
                        <strong>[{issue.severity.toUpperCase()}] {issue.category}:</strong> {issue.issue}
                        <br />
                        <span style={{ marginLeft: '20px' }}>Fix: {issue.fix}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="hi-nav">
        <button className="hi-btn" onClick={handleBack} disabled={step === 1}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="hi-btn hi-btn-primary" onClick={handleNext} disabled={loading}>
          {step === 5 ? 'Save & Continue' : step === 6 ? 'Finish' : 'Next'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

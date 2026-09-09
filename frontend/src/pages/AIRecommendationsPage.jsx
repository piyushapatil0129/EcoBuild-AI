import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import AIInsightCard from '../components/recommendations/AIInsightCard';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import {
  Sparkles,
  Sliders,
  ArrowLeft,
  Filter,
  ShieldCheck,
  Zap,
  Flame,
  Droplets
} from 'lucide-react';

export default function AIRecommendationsPage() {
  const { designId } = useParams();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analysisService.getRecommendations(designId);
        setRecommendations(data);
      } catch (err) {
        setError(err.userMessage || 'Failed to generate recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [designId]);

  if (loading) {
    return <LoadingState message="Synthesizing AI engineering recommendations..." className="py-20" />;
  }

  if (error) {
    return <ErrorState message={error} className="my-12" />;
  }

  const categories = ['All', 'Energy & Renewables', 'Building Envelope', 'Water Management', 'Materials & Embodied Carbon', 'Passive Design'];

  const filteredRecs = selectedCategory === 'All'
    ? recommendations
    : recommendations.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-forest-600" />
              Automated Diagnostic
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AI Engineering Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Targeted passive and active design interventions prioritized by lifecycle impact
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/optimize?designId=${designId}`}>
            <Button variant="primary" size="md" icon={Sliders}>
              Apply in Optimizer
            </Button>
          </Link>
        </div>
      </div>

      {/* DEDICATED AI INSIGHTS PANEL (Prompt #14) */}
      <AIInsightCard insights={recommendations.slice(0, 3)} />

      {/* CATEGORY FILTERS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-forest-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* RECOMMENDATIONS LIST */}
      <div className="space-y-4">
        {filteredRecs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No specific recommendations found in this category.
          </div>
        ) : (
          filteredRecs.map((rec, idx) => (
            <RecommendationCard key={rec.id || idx} rec={rec} />
          ))
        )}
      </div>
    </div>
  );
}

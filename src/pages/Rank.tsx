import { TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/language';

interface Drama {
  id: number;
  code: number;
  name: string;
  cover: string;
  episodes: number;
  summary?: string;
  hotScore?: string;
}

interface RankSection {
  title: string;
  items: Drama[];
}

const Rank = () => {
  const [sections, setSections] = useState<RankSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetchRanked = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/feed/ranked?lang=${lang}`);
        const data = await response.json();
        setSections(data.data || []);
      } catch (error) {
        console.error('Failed to fetch ranked:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanked();
  }, [lang]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center gap-2">
        <TrendingUp size={20} className="text-red-500" />
        <h1 className="text-xl font-bold">Ranking</h1>
      </div>

      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          <h2 className="font-semibold text-lg">{section.title}</h2>
          <div className="space-y-3">
            {section.items.map((drama, index) => (
              <Link key={drama.code} to={`/watch/${drama.code}`} className="block">
                <div className="card p-3 hover:bg-zinc-800 transition-colors">
                  <div className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-20 rounded-lg overflow-hidden bg-zinc-900">
                        <img src={drama.cover} alt={drama.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{drama.name}</h3>
                      {drama.summary && <p className="text-xs text-muted mb-2 line-clamp-2">{drama.summary}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted">
                        {drama.hotScore && <span>🔥 {drama.hotScore}</span>}
                        <span>{drama.episodes} ep</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Rank;

import { Crown } from 'lucide-react';
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
}

interface Section {
  title: string;
  items: Drama[];
}

const Category = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetchVip = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/feed?type=vip&lang=${lang}`);
        const data = await response.json();
        const items = data.data || [];
        // Handle both flat array and nested format
        if (items[0]?.items) {
          setSections(items);
        } else {
          setSections([{ title: 'VIP', items }]);
        }
      } catch (error) {
        console.error('Failed to fetch VIP:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVip();
  }, [lang]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentSection = sections[activeTab];

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center gap-2">
        <Crown size={20} className="text-red-500" />
        <h1 className="text-xl font-bold">VIP</h1>
      </div>

      {/* Tabs */}
      {sections.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === index
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      )}

      {/* Drama Grid */}
      {currentSection && (
        <div className="grid grid-cols-3 gap-3">
          {currentSection.items.map((drama) => (
            <Link key={drama.code} to={`/watch/${drama.code}`} className="block">
              <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                <img src={drama.cover} alt={drama.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-sm font-medium line-clamp-2 mb-1">{drama.name}</h3>
              <p className="text-xs text-zinc-400">{drama.episodes} episodes</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;

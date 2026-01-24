import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useLanguage } from '../store/language';
import type { Drama } from '../hooks/useDramas';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchDramas = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}`);
        const data = await response.json();
        setResults(data.data || []);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchDramas, 300);
    return () => clearTimeout(debounce);
  }, [query, lang]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 pt-2">
      <div className="max-w-md mx-auto px-4">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-zinc-950 pb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dramas..."
              className="w-full bg-zinc-900 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3 text-zinc-300">
              {results.length} results for "{query}"
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {results.map((drama) => (
                <Link key={drama.id} to={`/watch/${drama.code}`} className="block">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <img 
                      src={drama.cover} 
                      alt={drama.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-sm font-medium mt-2 line-clamp-2">
                    {drama.name}
                  </h3>
                  {drama.episodes > 0 && (
                    <p className="text-xs text-zinc-400">{drama.episodes} episodes</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-16 text-muted">
            <SearchIcon size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No results for "{query}"</p>
            <p className="text-xs mt-1">Try different keywords</p>
          </div>
        )}

        {/* Empty State */}
        {!query && (
          <div className="text-center py-16 text-muted">
            <SearchIcon size={40} className="mx-auto mb-3 opacity-50" />
            <h3 className="font-semibold mb-1">Search Dramas</h3>
            <p className="text-sm">Type to search your favorite dramas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

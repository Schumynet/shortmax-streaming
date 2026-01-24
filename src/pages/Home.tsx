import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useDramas, useHomeDramas } from '../hooks/useDramas';

const Home = () => {
  const { dramas: featured, loading: featuredLoading } = useDramas();
  const { dramas: home, loading: homeLoading } = useHomeDramas(1);

  if (featuredLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 pt-2">
      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* Featured Drama */}
        {featured[0] && (
          <Link to={`/watch/${featured[0].code}`} className="block">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
              <img 
                src={featured[0].cover} 
                alt={featured[0].name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded mb-2">
                  Featured
                </div>
                <h1 className="text-xl font-bold mb-2 line-clamp-2">
                  {featured[0].name}
                </h1>
                {featured[0].summary && (
                  <p className="text-sm text-zinc-300 mb-3 line-clamp-2">
                    {featured[0].summary}
                  </p>
                )}
                <div className="btn-primary inline-flex items-center gap-2">
                  <Play size={16} />
                  Watch Now
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* For You Section */}
        {featured.length > 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">For You</h2>
            <div className="grid grid-cols-3 gap-3">
              {featured.slice(1, 7).map((drama) => (
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
                  <p className="text-xs text-zinc-400">{drama.episodes} episodes</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Home Content */}
        {!homeLoading && home.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Trending Now</h2>
            <div className="grid grid-cols-3 gap-3">
              {home.map((drama) => (
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
                  <p className="text-xs text-zinc-400">{drama.episodes} episodes</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

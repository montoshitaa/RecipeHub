// @ts-nocheck — Phase 1 stub; re-implemented with axios in Phase 2
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiFetch } from '../api/client';
import { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';

export const Home: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      // API call with params for category and difficulty
      let path = '/api/recipes';
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (difficulty !== 'All') params.append('difficulty', difficulty);
      
      const queryString = params.toString();
      if (queryString) {
        path += `?${queryString}`;
      }

      const data = await apiFetch(path, { method: "GET" });
      setRecipes(data || []);
    } catch (err: any) {
      console.error("Home feed fetch error: ", err);
      setError("Unable to retrieve catalog. Please verify your connection or use Offline sandbox Mode.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when category or difficulty changes
  useEffect(() => {
    fetchRecipes();
  }, [category, difficulty]);

  // Client-side text search (title or tags)
  const filteredRecipes = recipes.filter((recipe) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase().trim();
    const matchesTitle = recipe.title.toLowerCase().includes(query);
    const matchesTags = recipe.tags?.some((t) => t.toLowerCase().includes(query)) || false;
    return matchesTitle || matchesTags;
  });

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setDifficulty('All');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Title / Hero block */}
      <div className="border border-border-custom bg-surface p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="space-y-3 relative z-10">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-text-custom">
            Recipe Catalog
          </h1>
          <p className="text-[15px] text-text-muted max-w-xl font-sans leading-relaxed">
            Explore carefully structured cookbook catalogs written and reviewed by culinary experts. Flat edges, high fidelity, infinite flavor.
          </p>
        </div>
        <div className="text-right font-mono text-[11px] text-text-muted select-none border border-border-custom px-4 py-2.5 bg-[#fcfcfc] relative z-10 shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
          CATALOG TOTAL: <br className="hidden md:block"/> <span className="font-bold text-accent md:text-xl text-base">{recipes.length}</span> RECIPES
        </div>
      </div>

      {/* Filter Horizontal Bar */}
      <div className="border border-border-custom bg-surface p-5 flex flex-col lg:flex-row gap-5">
        {/* Search Input */}
        <div className="flex-grow">
          <label className="block text-[11px] font-mono uppercase tracking-widest text-text-custom mb-2 font-bold">
            Search by title or tag...
          </label>
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-text-muted/60 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g., pancakes, chocolate, vegan, snack..."
              className="w-full bg-[#fcfcfc] border border-border-custom py-3 pl-10 pr-4 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white text-sm transition-all"
              id="search-input"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="w-full lg:w-56 mt-1 lg:mt-0">
          <label className="block text-[11px] font-mono uppercase tracking-widest text-text-custom mb-2 font-bold">
            Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-[46px] bg-[#fcfcfc] border border-border-custom px-4 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white text-sm cursor-pointer appearance-none transition-all"
            >
              <option value="All">All Categories</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
              <option value="Other">Other</option>
            </select>
            <div className="absolute right-4 top-[50%] -translate-y-[50%] pointer-events-none text-text-muted/60">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Difficulty Dropdown */}
        <div className="w-full lg:w-48 mt-1 lg:mt-0">
          <label className="block text-[11px] font-mono uppercase tracking-widest text-text-custom mb-2 font-bold">
            Difficulty
          </label>
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full h-[46px] bg-[#fcfcfc] border border-border-custom px-4 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white text-sm cursor-pointer appearance-none transition-all"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <div className="absolute right-4 top-[50%] -translate-y-[50%] pointer-events-none text-text-muted/60">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {error && !loading && (
        <div className="bg-red-50 border border-danger text-danger p-5 font-mono text-sm">
          <p className="font-bold uppercase tracking-wider mb-2">Error Connecting Server</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        /* Loading Skeleton states as requested: "skeleton grid (3 gray placeholder cards)" */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="border border-border-custom bg-surface animate-pulse" id={`skeleton-card-${num}`}>
              <div className="w-full aspect-[16/9] bg-neutral-200 border-b border-border-custom"></div>
              <div className="p-4 space-y-3">
                <div className="h-3 w-1/3 bg-neutral-200 font-mono"></div>
                <div className="h-5 w-4/5 bg-neutral-200"></div>
                <div className="h-3 w-1/2 bg-neutral-200"></div>
                <div className="border-t border-border-custom pt-3 flex justify-between">
                  <div className="h-3 w-1/4 bg-neutral-200"></div>
                  <div className="h-3 w-1/5 bg-neutral-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      ) : (
        /* Empty states as requested: No recipes found message and clear button */
        <div className="border border-border-custom bg-surface p-12 text-center" id="empty-recipe-search">
          <p className="font-serif text-xl font-bold mb-2">No recipes found.</p>
          <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
            No recipes in our active catalog matched your currently selected text search keywords or dropdown parameters.
          </p>
          <button
            onClick={handleClearFilters}
            className="btn-primary bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider px-6 py-2.5 transition-colors cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </div>
  );
};

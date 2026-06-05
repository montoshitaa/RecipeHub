// @ts-nocheck — Phase 1 stub; re-implemented with axios in Phase 2
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiFetch } from '../api/client';
import { Recipe } from '../types';
import { RecipeForm } from '../components/RecipeForm';
import { useAuth } from '../context/AuthContext';

export const EditRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      try {
        const data = await apiFetch(`/api/recipes/${id}`, { method: "GET" });
        setRecipe(data);

        // Security authorization check: ensure the recipe author is indeed the current user
        if (user && data.authorId !== user._id) {
          console.warn("Unauthorized attempt to edit recipe. Current user ID:", user._id, "Author ID:", data.authorId);
          navigate('/unauthorized');
        }
      } catch (err: any) {
        console.error("Failed to load recipe for editing", err);
        setError(err?.message || "Failed to retrieve recipe details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user, navigate]);

  const handleFormSubmit = async (formData: Omit<Recipe, '_id' | 'authorId' | 'createdAt'>) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/recipes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      // Redirect back to the recipe details screen
      navigate(`/recipes/${id}`);
    } catch (err: any) {
      console.error('Failed to update recipe:', err);
      throw err; // bubble up to RecipeForm for rendering
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse" id="edit-recipe-loader">
        <div className="border border-border-custom bg-surface p-6 sm:p-8 space-y-4">
          <div className="h-10 bg-neutral-200 w-1/3"></div>
          <div className="h-4 bg-neutral-200 w-2/3"></div>
        </div>
        <div className="border border-border-custom bg-surface p-8 sm:p-10 space-y-8">
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 w-32"></div>
            <div className="h-12 bg-neutral-200 w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 w-32"></div>
            <div className="h-24 bg-neutral-200 w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 w-32"></div>
              <div className="h-12 bg-neutral-200 w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 w-32"></div>
              <div className="h-12 bg-neutral-200 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="border border-border-custom bg-surface p-8 max-w-xl mx-auto my-12 text-center" id="edit-recipe-error">
        <p className="font-serif text-2xl font-bold text-text-cancel mb-2 text-text-custom">Retrieval Failed</p>
        <p className="text-sm text-text-muted mb-6">{error || "This recipe details could not be retrieved."}</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary bg-text-custom text-white font-mono text-xs uppercase tracking-wider px-6 py-2.5 cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Return to feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id={`edit-recipe-page-${recipe._id}`}>
      <div className="border border-border-custom bg-surface p-6 sm:p-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-text-custom mb-1">
          Edit Recipe Details
        </h1>
        <p className="text-sm text-text-muted">
          Modify instruction steps, ingredient counts, or descriptions. Rest assured that author credentials and creation history will be preserved.
        </p>
      </div>

      <RecipeForm
        initialData={recipe}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

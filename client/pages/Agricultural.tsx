import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import OLXStyleHeader from "../components/OLXStyleHeader";
import CategoryBar from "../components/CategoryBar";
import BottomNavigation from "../components/BottomNavigation";
import StaticFooter from "../components/StaticFooter";

interface MiniSubcategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  count?: number;
}

interface Subcategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export default function Agricultural() {
  const navigate = useNavigate();
  const [miniSubcategories, setMiniSubcategories] = useState<MiniSubcategory[]>(
    [],
  );
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // First try to fetch the agricultural category with subcategories
      const catResponse = await fetch(
        "/api/categories/agricultural?withSub=true",
      );

      if (catResponse.ok) {
        const catData = await catResponse.json();
        if (catData.success && catData.data) {
          const category = Array.isArray(catData.data)
            ? catData.data[0]
            : catData.data;

          // If category has embedded subcategories, use the first one
          if (
            category.subcategories &&
            Array.isArray(category.subcategories) &&
            category.subcategories.length > 0
          ) {
            const firstSubcategory = category.subcategories[0];
            setSubcategories(category.subcategories);

            // Now fetch mini-subcategories for the first subcategory
            if (firstSubcategory._id || firstSubcategory.id) {
              const subId = firstSubcategory._id || firstSubcategory.id;
              await fetchMiniSubcategoriesForSubcategory(subId);
            }
          }
        }
      }

      // If we couldn't fetch mini-subcategories, use fallback
      if (miniSubcategories.length === 0 && !useFallback) {
        setUseFallback(true);
        setMiniSubcategories(getFallbackMiniSubcategories());
      }
    } catch (error) {
      console.error("Error fetching agricultural data:", error);
      setUseFallback(true);
      setMiniSubcategories(getFallbackMiniSubcategories());
    } finally {
      setLoading(false);
    }
  };

  const fetchMiniSubcategoriesForSubcategory = async (
    subcategoryId: string,
  ) => {
    try {
      const response = await fetch(
        `/api/mini-subcategories/${subcategoryId}/with-counts`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setMiniSubcategories(data.data);
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching mini-subcategories:", error);
    }
  };

  /**
   * Fallback mini-subcategories for agricultural page
   */
  const getFallbackMiniSubcategories = (): MiniSubcategory[] => [
    {
      id: "agricultural-land",
      name: "Agricultural Land",
      slug: "agricultural-land",
      description: "Vacant agricultural land for cultivation",
      count: 0,
    },
    {
      id: "farmhouse-with-land",
      name: "Farmhouse with Land",
      slug: "farmhouse-with-land",
      description: "Farmhouses with surrounding agricultural land",
      count: 0,
    },
    {
      id: "orchard-plantation",
      name: "Orchard/Plantation",
      slug: "orchard-plantation",
      description: "Fruit orchards and tree plantations",
      count: 0,
    },
    {
      id: "dairy-farm",
      name: "Dairy Farm",
      slug: "dairy-farm",
      description: "Dairy farming properties with facilities",
      count: 0,
    },
    {
      id: "poultry-farm",
      name: "Poultry Farm",
      slug: "poultry-farm",
      description: "Poultry farming properties and units",
      count: 0,
    },
    {
      id: "fish-prawn-farm",
      name: "Fish/Prawn Farm",
      slug: "fish-prawn-farm",
      description: "Aquaculture and fish farming properties",
      count: 0,
    },
    {
      id: "polyhouse-greenhouse",
      name: "Polyhouse/Greenhouse",
      slug: "polyhouse-greenhouse",
      description: "Protected cultivation structures",
      count: 0,
    },
    {
      id: "pasture-grazing-land",
      name: "Pasture/Grazing Land",
      slug: "pasture-grazing-land",
      description: "Land for cattle grazing and pasturing",
      count: 0,
    },
  ];

  const handleMiniClick = (mini: MiniSubcategory) => {
    navigate(`/listings?category=agricultural&miniSubcategory=${mini.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <OLXStyleHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading agricultural properties...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <OLXStyleHeader />

      <main className="pb-16">
        <CategoryBar />

        <div className="px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Agricultural Properties
            </h1>
            <p className="text-gray-600">
              Find agricultural lands, farms, and farming properties in Rohtak
            </p>
          </div>

          {/* Mini-subcategories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {miniSubcategories.map((mini) => (
              <button
                key={mini._id || mini.slug}
                onClick={() => handleMiniClick(mini)}
                className="mini-subcat-card bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-all shadow-sm hover:shadow-md cursor-pointer"
                data-testid="mini-subcat-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {mini.name}
                    </h3>
                    {mini.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {mini.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>

                {/* Property count badge */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-medium">
                    {mini.count ?? 0}{" "}
                    {(mini.count ?? 0) === 1 ? "property" : "properties"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {miniSubcategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No agricultural properties available yet
              </p>
            </div>
          )}

          {/* Note about auto-categorization */}
          {miniSubcategories.length > 0 && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 <strong>Auto-Updated Listings:</strong> New agricultural
                properties are automatically displayed here after admin
                approval.
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
      <StaticFooter />
    </div>
  );
}

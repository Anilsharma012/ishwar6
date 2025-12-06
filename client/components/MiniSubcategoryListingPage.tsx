import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, ChevronRight } from "lucide-react";

interface MiniSubcategoryWithCount {
  _id?: string;
  subcategoryId?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  count: number;
  active?: boolean;
  isActive?: boolean;
}

interface MiniSubcategoryListingPageProps {
  subcategoryId: string;
  subcategoryName: string;
  categorySlug: string;
}

export default function MiniSubcategoryListingPage({
  subcategoryId,
  subcategoryName,
  categorySlug,
}: MiniSubcategoryListingPageProps) {
  const navigate = useNavigate();
  const [miniSubcategories, setMiniSubcategories] = useState<
    MiniSubcategoryWithCount[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMiniSubcategories = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `/api/admin/mini-subcategories/${subcategoryId}/with-counts`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch mini-subcategories");
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setMiniSubcategories(data.data);
        } else {
          setError("No mini-subcategories found");
        }
      } catch (err) {
        console.error("Error fetching mini-subcategories:", err);
        setError("Failed to load mini-subcategories");
      } finally {
        setLoading(false);
      }
    };

    if (subcategoryId) {
      fetchMiniSubcategories();
    }
  }, [subcategoryId]);

  const handleMiniClick = (miniSlug: string) => {
    navigate(
      `/listings?category=${categorySlug}&miniSubcategory=${miniSlug}`,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error && miniSubcategories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {subcategoryName}
        </h2>
        <p className="text-gray-600">
          Browse properties by type within {subcategoryName}
        </p>
      </div>

      {miniSubcategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {miniSubcategories.map((mini) => (
            <Card
              key={mini._id}
              className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
              onClick={() => handleMiniClick(mini.slug)}
            >
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {mini.name}
                      </h3>
                      {mini.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {mini.description}
                        </p>
                      )}
                    </div>
                    {mini.icon && (
                      <div className="text-2xl ml-2">{mini.icon}</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <Badge variant="secondary" className="text-base">
                    {mini.count} {mini.count === 1 ? "property" : "properties"}
                  </Badge>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No mini-subcategories available yet.</p>
        </div>
      )}
    </div>
  );
}

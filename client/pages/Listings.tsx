import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Filter,
  Grid,
  List,
  MapPin,
  Heart,
  Phone,
  X,
  ZoomIn,
} from "lucide-react";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import CategoryBar from "../components/CategoryBar";
import StaticFooter from "../components/StaticFooter";
import ImageModal from "../components/ImageModal";
import Watermark from "../components/Watermark";
import { Button } from "../components/ui/button";
import { Property } from "@shared/types";

interface FilterState {
  priceType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  minArea: string;
  maxArea: string;
  sector: string;
  mohalla: string;
  sortBy: string;
}

const initialFilters: FilterState = {
  priceType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  minArea: "",
  maxArea: "",
  sector: "",
  mohalla: "",
  sortBy: "date_desc",
};

const rohtakSectors = [
  "Sector 1",
  "Sector 2",
  "Sector 3",
  "Sector 4",
  "Sector 5",
  "Sector 6",
  "Sector 7",
  "Sector 8",
  "Sector 9",
  "Sector 10",
];

const mohallas = [
  "Prem Nagar",
  "Shastri Nagar",
  "DLF Colony",
  "Model Town",
  "Subhash Nagar",
  "Civil Lines",
  "Ram Nagar",
  "Industrial Area",
];

export default function Listings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedPropertyForZoom, setSelectedPropertyForZoom] =
    useState<Property | null>(null);

  const category = searchParams.get("category") || "";
  const miniSubcategory = searchParams.get("miniSubcategory") || "";
  const subcategory = searchParams.get("subcategory") || "";

  const getInitialFilters = (): FilterState => {
    return {
      priceType: searchParams.get("priceType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      bathrooms: searchParams.get("bathrooms") || "",
      minArea: searchParams.get("minArea") || "",
      maxArea: searchParams.get("maxArea") || "",
      sector: searchParams.get("sector") || "",
      mohalla: searchParams.get("mohalla") || "",
      sortBy: searchParams.get("sortBy") || "date_desc",
    };
  };

  const [filters, setFilters] = useState<FilterState>(getInitialFilters());

  useEffect(() => {
    fetchProperties();
  }, [category, miniSubcategory, subcategory, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      let url = "/api/properties?status=active";

      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      if (subcategory) {
        url += `&subcategory=${encodeURIComponent(subcategory)}`;
      }
      if (miniSubcategory) {
        url += `&miniSubcategory=${encodeURIComponent(miniSubcategory)}`;
      }

      if (filters.minPrice) {
        url += `&minPrice=${filters.minPrice}`;
      }
      if (filters.maxPrice) {
        url += `&maxPrice=${filters.maxPrice}`;
      }
      if (filters.bedrooms) {
        url += `&bedrooms=${filters.bedrooms}`;
      }
      if (filters.bathrooms) {
        url += `&bathrooms=${filters.bathrooms}`;
      }
      if (filters.minArea) {
        url += `&minArea=${filters.minArea}`;
      }
      if (filters.maxArea) {
        url += `&maxArea=${filters.maxArea}`;
      }
      if (filters.sector) {
        url += `&sector=${encodeURIComponent(filters.sector)}`;
      }
      if (filters.mohalla) {
        url += `&mohalla=${encodeURIComponent(filters.mohalla)}`;
      }

      url += `&sort=${filters.sortBy}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProperties(Array.isArray(data.data) ? data.data : []);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleFavoriteToggle = (propertyId: string) => {
    console.log("Toggle favorite for:", propertyId);
  };

  const handleContactClick = (property: Property) => {
    if (property.sellerPhone) {
      window.location.href = `tel:${property.sellerPhone}`;
    }
  };

  const handleImageZoom = (property: Property) => {
    setSelectedPropertyForZoom(property);
    setImageModalOpen(true);
  };

  const getCategoryName = (): string => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getMiniSubcategoryName = (): string => {
    return miniSubcategory
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPageTitle = (): string => {
    const parts = [];
    if (miniSubcategory) parts.push(getMiniSubcategoryName());
    if (subcategory) {
      parts.push(subcategory.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
    }
    if (category) parts.push(getCategoryName());
    return parts.length > 0 ? parts.join(" - ") : "Listings";
  };

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid URL</h1>
        <p className="text-gray-600 mb-4">Please provide a category parameter</p>
        <Button onClick={() => navigate("/")} className="bg-[#C70000] hover:bg-[#A60000]">
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-600">
                {properties.length} properties found
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Type
                  </label>
                  <select
                    value={filters.priceType}
                    onChange={(e) => handleFilterChange("priceType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All</option>
                    <option value="price">Price</option>
                    <option value="pricePerSqft">Price per Sq.ft</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                {/* Bedrooms Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>

                {/* Bathrooms Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange("bathrooms", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3+</option>
                  </select>
                </div>

                {/* Area Filter */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input
                    type="number"
                    placeholder="Min Area (Sq.ft)"
                    value={filters.minArea}
                    onChange={(e) => handleFilterChange("minArea", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max Area (Sq.ft)"
                    value={filters.maxArea}
                    onChange={(e) => handleFilterChange("maxArea", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                {/* Location Filters */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector
                  </label>
                  <select
                    value={filters.sector}
                    onChange={(e) => handleFilterChange("sector", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Sectors</option>
                    {rohtakSectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mohalla
                  </label>
                  <select
                    value={filters.mohalla}
                    onChange={(e) => handleFilterChange("mohalla", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Mohallas</option>
                    {mohallas.map((mohalla) => (
                      <option key={mohalla} value={mohalla}>
                        {mohalla}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}

            {/* Properties List */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                  >
                    <Filter className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm">Filters</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg ${
                      viewMode === "list" ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg ${
                      viewMode === "grid" ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C70000]"></div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Properties Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your filters or explore other categories
                  </p>
                  <Button onClick={() => navigate("/")} className="bg-[#C70000] hover:bg-[#A60000]">
                    Back to Home
                  </Button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-4"
                  }
                >
                  {properties.map((property) => (
                    <div
                      key={property._id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handlePropertyClick(property._id)}
                    >
                      {/* Image Section */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden group">
                        {property.images && property.images.length > 0 ? (
                          <>
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageZoom(property);
                              }}
                              className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                            >
                              <ZoomIn className="w-4 h-4 text-gray-700" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <MapPin className="w-8 h-8 text-gray-500" />
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(property._id);
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                        >
                          <Heart className="w-4 h-4 text-gray-700" />
                        </button>

                        {property.isPremium && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                            Premium
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                          {property.title}
                        </h3>

                        <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>

                        {property.price && (
                          <p className="text-lg font-bold text-[#C70000] mb-2">
                            ₹{property.price.toLocaleString()}
                          </p>
                        )}

                        {property.area && (
                          <p className="text-sm text-gray-600 mb-3">
                            {property.area} Sq.ft
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactClick(property);
                            }}
                            className="flex-1 bg-[#C70000] hover:bg-[#A60000] text-white text-sm"
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Image Zoom Modal */}
      {selectedPropertyForZoom && (
        <ImageModal
          isOpen={imageModalOpen}
          onClose={() => {
            setImageModalOpen(false);
            setSelectedPropertyForZoom(null);
          }}
          images={selectedPropertyForZoom.images || []}
          title={selectedPropertyForZoom.title}
        />
      )}

      <CategoryBar />
      <BottomNavigation />
      <StaticFooter />
    </div>
  );
}

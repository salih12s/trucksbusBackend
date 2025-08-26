import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoryService, Category, VehicleType, Brand, Model, Variant } from '../../services/categoryService';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

const CategoryPage: React.FC = () => {
  const { id: categoryId, vehicleTypeId, brandId, modelId } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<'categories' | 'vehicleTypes' | 'brands' | 'models' | 'variants'>('categories');

  // Kategoriye göre resim mapping'i
  const getCategoryImage = (categoryName: string) => {
    const imageMap: { [key: string]: string } = {
      'Çekici': '/CategoryImage/cekici.png',
      'Dorse': '/CategoryImage/Dorse.png',
      'Kamyon & Kamyonet': '/CategoryImage/KamyonKamyonet.png',
      'Karoser & Üst Yapı': '/CategoryImage/karoser-ust-yapi.png',
      'Minibüs & Midibüs': '/CategoryImage/minibus-midibus.png',
      'Otobüs': '/CategoryImage/otobus.png',
      'Oto Kurtarıcı & Taşıyıcı': '/CategoryImage/oto-kurtarici-tasiyici.png',
      'Römork': '/CategoryImage/romork.png'
    };
    return imageMap[categoryName] || '/TruckBus.png';
  };

  // Model resmini al
  const getModelImage = (modelName: string) => {
    // Model adı düzenleme map'i - Tüm varyasyonları kapsayacak şekilde mevcut dosyalara yönlendir
    const modelImageMap: { [key: string]: string } = {
      // Scania varyasyonları - mevcut dosya: Scania.png
      'Scanıa': '/ModelImage/Scania.png',
      'Scania': '/ModelImage/Scania.png',
      'SCANIA': '/ModelImage/Scania.png',
      'scania': '/ModelImage/Scania.png',
      
      // Irizar varyasyonları - mevcut dosya yoksa fallback
      'Irızar': '/TruckBus.png',
      'Irizar': '/TruckBus.png',
      'IRIZAR': '/TruckBus.png',
      'irizar': '/TruckBus.png',
      
      // Türkkar varyasyonları - mevcut dosya: Turkkar.png
      'Türkkar': '/ModelImage/Turkkar.png',
      'Turkkar': '/ModelImage/Turkkar.png',
      'TÜRKKAR': '/ModelImage/Turkkar.png',
      'turkkar': '/ModelImage/Turkkar.png',
      
      // Avia varyasyonları - mevcut dosya: Avia.png
      'Avıa': '/ModelImage/Avia.png',
      'Avia': '/ModelImage/Avia.png',
      'AVIA': '/ModelImage/Avia.png',
      'avia': '/ModelImage/Avia.png',
      
      // Musatti varyasyonları - mevcut dosya: Musatti.png
      'MUSATTİ': '/ModelImage/Musatti.png',
      'MUSATTI': '/ModelImage/Musatti.png',
      'Musatti': '/ModelImage/Musatti.png',
      'musatti': '/ModelImage/Musatti.png',
      'Mussatti': '/ModelImage/Musatti.png',
      'MUSSATTI': '/ModelImage/Musatti.png',
      
      // Kuruyük varyasyonları
      'Kuruyük': '/ModelImage/kuruyuk.png',
      'Kuruyuk': '/ModelImage/kuruyuk.png',
      'KURUYÜK': '/ModelImage/kuruyuk.png',
      'kuruyuk': '/ModelImage/kuruyuk.png',
      
      // Özel dorseler
      'Özel Amaçlı dorseler': '/ModelImage/ozel-amacli-dorseler.png',
      'Özel Amaçlı Römorklar': '/ModelImage/Özel Amaçlı Römorklar.png'
    };
    
    console.log(`🔍 Model resmi aranan: "${modelName}"`);
    
    // Önce tam eşleşme ara
    if (modelImageMap[modelName]) {
      console.log(`✅ Tam eşleşme bulundu: ${modelImageMap[modelName]}`);
      return modelImageMap[modelName];
    }
    
    // Case insensitive arama
    const lowerName = modelName.toLowerCase();
    for (const [key, value] of Object.entries(modelImageMap)) {
      if (key.toLowerCase() === lowerName) {
        console.log(`✅ Case insensitive eşleşme: ${value}`);
        return value;
      }
    }
    
    // Kısmi eşleşme ara (içerme)
    for (const [key, value] of Object.entries(modelImageMap)) {
      if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
        console.log(`✅ Kısmi eşleşme: ${value}`);
        return value;
      }
    }
    
    // Son çare: fallback
    console.log(`⚠️ Eşleşme bulunamadı, fallback kullanılıyor: /TruckBus.png`);
    return `/TruckBus.png`;
  };

  useEffect(() => {
    if (!categoryId) {
      fetchCategories();
      setCurrentLevel('categories');
    } else if (!vehicleTypeId) {
      fetchVehicleTypes(categoryId);
      setCurrentLevel('vehicleTypes');
    } else if (!brandId) {
      fetchBrands(vehicleTypeId);
      setCurrentLevel('brands');
    } else if (!modelId) {
      fetchModels(brandId);
      setCurrentLevel('models');
    } else {
      fetchVariants(modelId);
      setCurrentLevel('variants');
    }
  }, [categoryId, vehicleTypeId, brandId, modelId]);

  const fetchCategories = async () => {
    try {
      console.log('📋 CategoryPage: Fetching categories...');
      setLoading(true);
      setError(null);
      
      const data = await categoryService.getCategories();
      console.log('📋 CategoryPage: Categories loaded:', data.length);
      setCategories(data);
    } catch (err: any) {
      console.error('❌ CategoryPage: Failed to load categories:', err);
      setError(err.message || 'Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleTypes = async (catId: string) => {
    try {
      console.log('🚗 CategoryPage: Fetching vehicle types for category:', catId);
      setLoading(true);
      setError(null);
      
      const data = await categoryService.getVehicleTypesByCategory(catId);
      console.log('🚗 CategoryPage: Vehicle types loaded:', data.length);
      setVehicleTypes(data);
    } catch (err: any) {
      console.error('❌ CategoryPage: Failed to load vehicle types:', err);
      setError(err.message || 'Araç tipleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async (vtId: string) => {
    try {
      console.log('🏷️ CategoryPage: Fetching brands for vehicle type:', vtId);
      setLoading(true);
      setError(null);
      
      const data = await categoryService.getBrandsByVehicleType(vtId);
      console.log('🏷️ CategoryPage: Brands loaded:', data.length);
      setBrands(data);
    } catch (err: any) {
      console.error('❌ CategoryPage: Failed to load brands:', err);
      setError(err.message || 'Markalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (brId: string) => {
    try {
      console.log('🚙 CategoryPage: Fetching models for brand:', brId);
      setLoading(true);
      setError(null);
      
      const data = await categoryService.getModelsByBrand(brId);
      console.log('🚙 CategoryPage: Models loaded:', data.length);
      setModels(data);
    } catch (err: any) {
      console.error('❌ CategoryPage: Failed to load models:', err);
      setError(err.message || 'Modeller yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async (mdId: string) => {
    try {
      console.log('⚙️ CategoryPage: Fetching variants for model:', mdId);
      setLoading(true);
      setError(null);
      
      const data = await categoryService.getVariantsByModel(mdId);
      console.log('⚙️ CategoryPage: Variants loaded:', data.length);
      setVariants(data);
    } catch (err: any) {
      console.error('❌ CategoryPage: Failed to load variants:', err);
      setError(err.message || 'Varyantlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/category/${category.id}`);
  };

  const handleVehicleTypeClick = (vehicleType: VehicleType) => {
    navigate(`/category/${categoryId}/vehicle-type/${vehicleType.id}`);
  };

  const handleBrandClick = (brand: Brand) => {
    navigate(`/category/${categoryId}/vehicle-type/${vehicleTypeId}/brand/${brand.id}`);
  };

  const handleModelClick = (model: Model) => {
    navigate(`/category/${categoryId}/vehicle-type/${vehicleTypeId}/brand/${brandId}/model/${model.id}`);
  };

  const handleVariantClick = async (variant: Variant) => {
    // Burada ilan sayfasına yönlendirilecek - şimdilik alert
    await confirm({
      title: 'Bilgilendirme',
      description: `${variant.name} için ilan sayfası açılacak`,
      severity: 'info',
      confirmText: 'Tamam',
      cancelText: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Hata: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2">
            <li>
              <button 
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800"
              >
                Ana Sayfa
              </button>
            </li>
            {categoryId && (
              <>
                <span className="mx-2">/</span>
                <li>
                  <button 
                    onClick={() => navigate(`/category/${categoryId}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Kategori
                  </button>
                </li>
              </>
            )}
            {vehicleTypeId && (
              <>
                <span className="mx-2">/</span>
                <li>
                  <button 
                    onClick={() => navigate(`/category/${categoryId}/vehicle-type/${vehicleTypeId}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Araç Tipi
                  </button>
                </li>
              </>
            )}
            {brandId && (
              <>
                <span className="mx-2">/</span>
                <li>
                  <button 
                    onClick={() => navigate(`/category/${categoryId}/vehicle-type/${vehicleTypeId}/brand/${brandId}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Marka
                  </button>
                </li>
              </>
            )}
            {modelId && (
              <>
                <span className="mx-2">/</span>
                <li className="text-gray-500">Model</li>
              </>
            )}
          </ol>
        </nav>

        {/* Kategoriler */}
        {currentLevel === 'categories' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Kategoriler</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={getCategoryImage(category.name)}
                      alt={category.name}
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/TruckBus.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      {category.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Araç Tipleri */}
        {currentLevel === 'vehicleTypes' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Araç Tipleri</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicleTypes.map((vehicleType) => (
                <div
                  key={vehicleType.id}
                  onClick={() => handleVehicleTypeClick(vehicleType)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={vehicleType.image_url || getModelImage(vehicleType.name)}
                      alt={vehicleType.name}
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/ModelImage/DigerMarkalar.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      {vehicleType.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Markalar */}
        {currentLevel === 'brands' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Markalar</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  onClick={() => handleBrandClick(brand)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {brand.image_url ? (
                      <img
                        src={brand.image_url}
                        alt={brand.name}
                        className="w-24 h-24 object-contain"
                        onError={(e) => {
                          // Resim yüklenemezse text placeholder göster
                          const target = e.currentTarget;
                          const parent = target.parentElement!;
                          parent.innerHTML = `
                            <div class="text-center p-4">
                              <div class="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2">
                                <span class="text-white text-xl font-bold">
                                  ${brand.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div class="text-sm font-medium text-gray-600">
                                ${brand.name}
                              </div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      // Database'de image_url yoksa direkt text placeholder
                      <div className="text-center p-4">
                        <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2">
                          <span className="text-white text-xl font-bold">
                            {brand.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          {brand.name}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      {brand.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modeller */}
        {currentLevel === 'models' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Modeller</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {models.map((model) => (
                <div
                  key={model.id}
                  onClick={() => handleModelClick(model)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {/* Resim yerine sadece model adı */}
                    <div className="text-center p-4">
                      <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white text-xl font-bold">
                          {model.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {model.name}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      {model.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Varyantlar */}
        {currentLevel === 'variants' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Varyantlar</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  onClick={() => handleVariantClick(variant)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {/* Varyantlar için farklı renk placeholder */}
                    <div className="text-center p-4">
                      <div className="w-16 h-16 mx-auto bg-purple-500 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white text-xl font-bold">
                          {variant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {variant.name}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      {variant.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

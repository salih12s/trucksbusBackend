import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UserHeader from '../../components/layout/UserHeader';
import api from '../../services/api';

interface Variant {
  id: string;
  name: string;
  model_id: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: Variant[];
  count: number;
}

interface Model {
  id: string;
  name: string;
  brand_id: string;
}

interface Brand {
  id: string;
  name: string;
  image_url?: string;
}

const VariantSelection: React.FC = () => {
  const navigate = useNavigate();
  const { modelId } = useParams<{ modelId: string }>();
  const location = useLocation();
  const model = location.state?.model as Model;
  const brand = location.state?.brand as Brand;
  
  const [variants, setVariants] = useState<Variant[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (modelId) {
      fetchVariants();
    }
  }, [modelId]);

  useEffect(() => {
    const filtered = variants.filter(variant =>
      variant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVariants(filtered);
  }, [searchTerm, variants]);

  const fetchVariants = async () => {
    if (!modelId) return;
    
    try {
      setError(null);
      console.log('🔍 Fetching variants for model_id:', modelId);
      const encodedModelId = encodeURIComponent(modelId);
      console.log('🔗 Encoded model_id:', encodedModelId);
      
      const response = await api.get(`/categories/variants?model_id=${encodedModelId}`);
      const data = response.data;
      
      console.log('Variants API Response:', data);
      
      // Backend direkt array dönüyor
      if (Array.isArray(data)) {
        setVariants(data);
        setFilteredVariants(data);
      } else if (data.success && data.data) {
        setVariants(data.data);
        setFilteredVariants(data.data);
      } else {
        throw new Error('Veri formatı hatalı');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant: Variant) => {
    const vehicleType = location.state?.vehicleType;
    
    console.log('🚛 VariantSelect Debug:', {
      modelName: model?.name,
      variantName: variant.name,
      vehicleTypeName: vehicleType?.name,
      variantId: variant.id,
      brandName: brand?.name
    });
    
    // Debug bilgisi ekleyelim
    console.log('🔍 Variant Selection Debug:', {
      variantName: variant.name,
      modelName: model?.name,
      brandName: brand?.name,
      vehicleTypeName: vehicleType?.name,
      variantId: variant.id,
      locationState: location.state
    });

    // ÖZEL KAROSER & ÜSTYAPI DEBUG
    if (vehicleType?.name?.toLowerCase().includes('karoser') || 
        vehicleType?.name?.toLowerCase().includes('üstyapı') ||
        vehicleType?.name?.toLowerCase().includes('ustyapi')) {
      console.log('🏗️ KAROSER & ÜSTYAPI DETECTED!!!', {
        vehicleTypeName: vehicleType.name,
        vehicleTypeNameLower: vehicleType.name?.toLowerCase(),
        brandName: brand?.name,
        modelName: model?.name,
        variantName: variant.name,
        exactMatch1: vehicleType?.name === 'Karoser & Üst Yapı',
        exactMatch2: vehicleType?.name === 'Karoser & Üstyapı'
      });
    }
    
    // Havuzlu Lowbed kontrolü - sadece gerçek lowbed'ler için, Hardox/Hafriyat/Kaya hariç
    const isHavuzluLowbed = (variant.name.toLowerCase().includes('havuzlu') ||
                           (vehicleType?.name?.toLowerCase().includes('dorse') && 
                            variant.name.toLowerCase().includes('havuz'))) &&
                           !variant.name.toLowerCase().includes('hardox') && // Hardox olanları hariç tut
                           !variant.name.toLowerCase().includes('hafriyat') && // Hafriyat olanları hariç tut
                           !variant.name.toLowerCase().includes('kaya'); // Kaya olanları hariç tut
    
    // Öndekirmalı Lowbed kontrolü - daha kapsamlı
    const isOndekirmalıLowbed = variant.name.toLowerCase().includes('öndekirmalı') ||
                               variant.name.toLowerCase().includes('ondekirmalı') ||
                               variant.name.toLowerCase().includes('önde kirmalı') ||
                               variant.name.toLowerCase().includes('ondekirma') ||
                               (variant.name.toLowerCase().includes('önde') && variant.name.toLowerCase().includes('kırmalı')) ||
                               (vehicleType?.name?.toLowerCase().includes('dorse') && 
                                variant.name.toLowerCase().includes('önde'));
    
    console.log('🏊 Lowbed Variant Kontrol Debug:', {
      variantName: variant.name,
      variantNameLower: variant.name.toLowerCase(),
      vehicleTypeName: vehicleType?.name,
      isHavuzluLowbed: isHavuzluLowbed,
      isOndekirmalıLowbed: isOndekirmalıLowbed,
      containsHavuzlu: variant.name.toLowerCase().includes('havuzlu'),
      containsÖndekirmalı: variant.name.toLowerCase().includes('öndekirmalı'),
      containsLowbed: variant.name.toLowerCase().includes('lowbed')
    });
    
    if (isHavuzluLowbed) {
      console.log('🏊 Havuzlu Lowbed YÖNLENDİRME - Route:', `/create-ad/dorse/lowbed/havuzlu/${variant.id}`);
      
      navigate(`/create-ad/dorse/lowbed/havuzlu/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
      return;
    }
    
    if (isOndekirmalıLowbed) {
      console.log('🚧 Öndekirmalı Lowbed YÖNLENDİRME - Route:', `/create-ad/dorse/lowbed/ondekirmalı/${variant.id}`);
      
      navigate(`/create-ad/dorse/lowbed/ondekirmalı/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
      return;
    }

    // Kuruyük kontrolleri - SADECE brand="Kuru Yük" olanlar için
    const lowerVariantName = variant.name.toLowerCase();
    const isKuruyuk = brand?.name === 'Kuru Yük' && 
                      (lowerVariantName.includes('kuruyük') || lowerVariantName.includes('kuruyuk') || 
                       lowerVariantName.includes('kapaklı') || lowerVariantName.includes('kapaksız') ||
                       lowerVariantName.includes('platform') || lowerVariantName.includes('kaya'));
    
    console.log('🚛 Kuruyük Variant Debug:', {
      variantName: variant.name,
      lowerVariantName,
      isKuruyuk,
      vehicleTypeName: vehicleType?.name,
      containsKaya: lowerVariantName.includes('kaya') || lowerVariantName.includes('kaya tip'),
      containsKapaksız: lowerVariantName.includes('kapaksız'),
      containsPlatform: lowerVariantName.includes('platform'),
      containsKapaklı: lowerVariantName.includes('kapaklı')
    });

    if (isKuruyuk) {
      // Kaya tipi kontrolü - "kaya tip" de dahil
      if (lowerVariantName.includes('kaya tip') || lowerVariantName.includes('kaya')) {
        console.log('🗻 Kapaklı(Kaya Tipi) Kuruyük YÖNLENDİRME');
        navigate(`/create-ad/dorse/kuruyuk/kapakli-kaya-tipi/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
      
      // Kapaksız/Platform kontrolü
      if (lowerVariantName.includes('kapaksız') || lowerVariantName.includes('platform')) {
        console.log('🏗️ Kapaksız(Platform) Kuruyük YÖNLENDİRME');
        navigate(`/create-ad/dorse/kuruyuk/kapaksiz-platform/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
      
      // Genel Kapaklı (default)
      console.log('📦 Kapaklı Kuruyük YÖNLENDİRME (default)');
      navigate(`/create-ad/dorse/kuruyuk/kapakli/${variant.id}`, {
        state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
      });
      return;
    }

    // Tenteli kontrolleri
    const lowerVariantName2 = variant.name.toLowerCase();
      const isTenteli = lowerVariantName2.includes('tenteli') || 
                      lowerVariantName2.includes('pilot') || 
                      lowerVariantName2.includes('midilli') ||
                      lowerVariantName2.includes('yarı midilli') ||
                      lowerVariantName2.includes('yari midilli');

    // Tanker kontrolleri (sadece genel tanker, tanker şasi değil ve konteyner şasi grubu değilse ve Tarım Römorkları değilse)
    const isTanker = lowerVariantName2.includes('tanker') && 
                     !lowerVariantName2.includes('şasi') &&
                     brand?.name !== 'Konteyner Taşıyıcı & Şasi Gr.' &&
                     brand?.name !== 'Tarım Römorkları' &&
                     model?.name !== 'Tarım Römorkları';
    
    // Tekstil kontrolleri
    const isTekstil = lowerVariantName2.includes('tekstil');
    
    // Silobas kontrolleri
    const isSilobas = lowerVariantName2.includes('silobas') || lowerVariantName2.includes('silo');
    
    // Konteyner Taşıyıcı & Şasi Grubu kontrolleri - ÖNCE brand/model kontrolü yap
    const isKonteynerTasiyiciSasiGrubu = (brand?.name === 'Konteyner Taşıyıcı & Şasi Gr.' || 
                                          model?.name === 'Konteyner Taşıyıcı & Şasi Gr.') &&
                                         (lowerVariantName2 === 'damper şasi' ||
                                          lowerVariantName2 === 'kılçık şasi' ||
                                          lowerVariantName2 === 'platform şasi' ||
                                          lowerVariantName2.includes('römork konvantörü') ||
                                          lowerVariantName2 === 'tanker şasi' ||
                                          lowerVariantName2 === 'uzayabilir şasi' ||
                                          (lowerVariantName2.includes('konteyner') && lowerVariantName2.includes('şasi')));
    
    console.log('🏕️ Tenteli Variant Debug:', {
      variantName: variant.name,
      lowerVariantName: lowerVariantName2,
      isTenteli,
      isTanker,
      isTekstil,
      isSilobas,
      isKonteynerTasiyiciSasiGrubu,
      vehicleTypeName: vehicleType?.name,
      brandName: brand?.name,
      modelName: model?.name,
      containsPilot: lowerVariantName2.includes('pilot'),
      containsMidilli: lowerVariantName2.includes('midilli'),
      containsYariMidilli: lowerVariantName2.includes('yarı') || lowerVariantName2.includes('yari')
    });

    // Konteyner Taşıyıcı & Şasi Grubu kontrollerini önce yap
    if (isKonteynerTasiyiciSasiGrubu) {
      console.log('📦 Konteyner Taşıyıcı & Şasi Grubu YÖNLENDİRME');
      
      // Her şasi türü için ayrı kontrol ve yönlendirme
      if (lowerVariantName2.includes('damper') && lowerVariantName2.includes('şasi')) {
        console.log('� Damper Şasi YÖNLENDİRME');
        navigate(`/create-ad/dorse/damper-sasi/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
      
      if (lowerVariantName2.includes('kılçık') && lowerVariantName2.includes('şasi')) {
        console.log('🐟 Kılçık Şasi YÖNLENDİRME');
        navigate(`/create-ad/dorse/kilcik-sasi/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
      
      if (lowerVariantName2.includes('platform') && lowerVariantName2.includes('şasi')) {
        console.log('�️ Platform Şasi YÖNLENDİRME');
        navigate(`/create-ad/dorse/platform-sasi/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
      
      if (lowerVariantName2.includes('römork') && lowerVariantName2.includes('konvantör')) {
        console.log('� Römork Konvantörü YÖNLENDİRME');
        navigate(`/create-ad/dorse/romork-konvantoru/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
      
      if (lowerVariantName2.includes('tanker') && lowerVariantName2.includes('şasi')) {
        console.log('⛽ Tanker Şasi YÖNLENDİRME');
        navigate(`/create-ad/dorse/tanker-sasi/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
      
      if (lowerVariantName2.includes('uzayabilir') && lowerVariantName2.includes('şasi')) {
        console.log('📏 Uzayabilir Şasi YÖNLENDİRME');
        navigate(`/create-ad/dorse/uzayabilir-sasi/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
    }

    if (isTanker) {
      console.log('� Tanker YÖNLENDİRME');
      navigate(`/create-ad/dorse/tanker/${variant.id}`, {
        state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
      });
      return;
    }

    if (isTekstil) {
      console.log('🧵 Tekstil YÖNLENDİRME');
      navigate(`/create-ad/dorse/tekstil/${variant.id}`, {
        state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
      });
      return;
    }

    if (isSilobas) {
      console.log('🏛️ Silobas YÖNLENDİRME');
      navigate(`/create-ad/dorse/silobas/${variant.id}`, {
        state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
      });
      return;
    }

    // Özel Amaçlı Dorseler kontrolleri
    const isOzelAmacliDorseler = brand?.name === 'Özel Amaçlı Dorseler' || 
                                 model?.name === 'Özel Amaçlı Dorseler' ||
                                 lowerVariantName2.includes('hidrolik üst yapı') ||
                                 lowerVariantName2.includes('mobil platform') ||
                                 lowerVariantName2.includes('oto taşıyıcı');

    if (isOzelAmacliDorseler) {
      console.log('🎯 Özel Amaçlı Dorseler YÖNLENDİRME');
      navigate(`/create-ad/dorse/ozel-amacli-dorseler/${variant.id}`, {
        state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
      });
      return;
    }

    if (isTenteli) {
      // Yarı Midilli kontrolü önce (daha spesifik)
      if (lowerVariantName2.includes('yarı midilli') || lowerVariantName2.includes('yari midilli')) {
        console.log('🏕️ Yarı Midilli Tenteli YÖNLENDİRME');
        navigate(`/create-ad/dorse/tenteli/yari-midilli/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
      
      // Pilot kontrolü
      if (lowerVariantName2.includes('pilot')) {
        console.log('🏕️ Pilot Tenteli YÖNLENDİRME');
        navigate(`/create-ad/dorse/tenteli/pilot/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
        });
        return;
      }
      
      // Midilli kontrolü (default)
      console.log('🏕️ Midilli Tenteli YÖNLENDİRME (default)');
      navigate(`/create-ad/dorse/tenteli/midilli/${variant.id}`, {
        state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
      });
      return;
    }
    
    // Frigofirik kontrolleri
    const isFrigofirik = lowerVariantName2.includes('frigofirik') || lowerVariantName2.includes('frigo');
    
    if (isFrigofirik) {
      console.log('❄️ Frigofirik Dorse YÖNLENDİRME');
      navigate(`/create-ad/dorse/frigofirik/${variant.id}`, {
        state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant }}
      });
      return;
    }
    
    // Damperli Dorse için özel yönlendirme - SADECE Dorse kategorisi için (Karoser DEĞİL)
    const isDamperliDorse = !isKonteynerTasiyiciSasiGrubu && 
                           vehicleType?.name?.toLowerCase().includes('dorse') &&
                           !vehicleType?.name?.toLowerCase().includes('karoser') && // Karoser'ı hariç tut
                           (model?.name === 'Damperli' || 
                           variant.name.toLowerCase().includes('damperli') ||
                           brand?.name?.toLowerCase().includes('damper') ||
                           // Damperli alt türleri için özel kontrol
                           variant.name.toLowerCase().includes('hafriyat') ||
                           variant.name.toLowerCase().includes('havuz') ||
                           variant.name.toLowerCase().includes('hardox') ||
                           variant.name.toLowerCase().includes('kaya') ||
                           variant.name.toLowerCase().includes('kapaklı') ||
                           // URL'de damperli varsa
                           window.location.href.includes('damperli'));
    
    console.log('🚛 Damperli Dorse Kontrol Debug:', {
      vehicleTypeName: vehicleType?.name,
      isDorse: vehicleType?.name?.toLowerCase().includes('dorse'),
      isKaroser: vehicleType?.name?.toLowerCase().includes('karoser'),
      modelName: model?.name,
      variantName: variant.name,
      variantLower: variant.name.toLowerCase(),
      hasHafriyat: variant.name.toLowerCase().includes('hafriyat'),
      hasDamperli: variant.name.toLowerCase().includes('damperli'),
      isDamperliDorse,
      isKonteynerTasiyiciSasiGrubu
    });

    if (isDamperliDorse) {
      let variantType = '';
      
      // Variant ismine göre tip belirleme - EN SPESİFİK OLANLARI ÖNCE KOY
      const variantNameLower = variant.name.toLowerCase();
      
      console.log('🔍 Variant Tip Belirleme Debug:', {
        variantName: variant.name,
        variantNameLower,
        hasHafriyat: variantNameLower.includes('hafriyat'),
        hasHavuz: variantNameLower.includes('havuz'),
        hasHardox: variantNameLower.includes('hardox'),
        hasKaya: variantNameLower.includes('kaya'),
        hasKapak: variantNameLower.includes('kapak')
      });
      
      // EN SPESİFİK kontrollerden başla
      if (variantNameLower.includes('hafriyat') || variantNameLower === 'hafriyat tipi') {
        variantType = 'hafriyat-tipi';
        console.log('✅ Hafriyat Tipi belirlendi');
      } else if (variantNameLower.includes('havuz') || variantNameLower.includes('hardox') || 
                 variantNameLower === 'havuz (hardox) tipi') {
        variantType = 'havuz-hardox-tipi';
        console.log('✅ Havuz Hardox Tipi belirlendi');
      } else if (variantNameLower.includes('kaya') || variantNameLower === 'kaya tipi') {
        variantType = 'kaya-tipi';
        console.log('✅ Kaya Tipi belirlendi');
      } else if (variantNameLower.includes('kapaklı') || variantNameLower.includes('kapakli') || 
          variantNameLower.includes('kapak') || variantNameLower === 'kapaklı tip') {
        variantType = 'kapakli-tip';
        console.log('✅ Kapaklı Tip belirlendi');
      } else {
        // Variant ID'sine göre de kontrol edelim
        if (variant.id === 'cme6bt060000f40qa8syjxrwu') {
          variantType = 'kapakli-tip'; // İlk variant Kapaklı Tip olsun
        } else {
          variantType = 'kapakli-tip'; // Default
        }
      }
      
      console.log('🚛 Damperli Dorse yönlendirme:', variantType);
      
      navigate(`/create-ad/dorse/damperli/${variantType}/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          variantType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
      return;
    }
    
    // Vehicle type'a göre doğru form sayfasına yönlendir
    console.log('🔍 ROUTING LOGIC TEST:', {
      vehicleTypeName: vehicleType?.name,
      match1: vehicleType?.name === 'Karoser & Üst Yapı',
      match2: vehicleType?.name === 'Karoser & Üstyapı', 
      match3: vehicleType?.name?.toLowerCase().includes('karoser'),
      lowerCase: vehicleType?.name?.toLowerCase(),
      variantName: variant.name,
      modelName: model?.name,
      brandName: brand?.name
    });

    // ⚠️ KAROSER & ÜSTYAPI KONTROLÜ - isDamperliDorse'dan ÖNCE yapılmalı
    if (vehicleType?.name === 'Karoser & Üst Yapı' || 
        vehicleType?.name === 'Karoser & Üstyapı' ||
        vehicleType?.name?.toLowerCase().includes('karoser')) {
      console.log('🏗️ Karoser & Üst Yapı kategorisine yönlendiriliyor', {
        vehicleTypeName: vehicleType.name,
        brandName: brand?.name
      });
      
      // Damperli grup kontrolü
      if (brand?.name === 'Damperli Grup' || brand?.name === 'Damperli' || model?.name?.includes('Damperli')) {
        const lowerVariantName = variant.name.toLowerCase();
        
        // Ahşap Kasa kontrolü
        if (lowerVariantName.includes('ahşap') || lowerVariantName.includes('ahsap')) {
          console.log('🪵 Ahşap Kasa YÖNLENDİRME');
          navigate(`/create-ad/karoser-ustyapi/damperli-ahsap-kasa/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Hafriyat Tipi kontrolü
        if (lowerVariantName.includes('hafriyat')) {
          console.log('🏗️ Hafriyat Tipi YÖNLENDİRME');
          navigate(`/create-ad/karoser-ustyapi/damperli-hafriyat-tipi/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Havuz (Hardox) Tipi kontrolü
        if (lowerVariantName.includes('havuz') || lowerVariantName.includes('hardox')) {
          console.log('🚰 Havuz (Hardox) Tipi YÖNLENDİRME');
          navigate(`/create-ad/karoser-ustyapi/damperli-havuz-hardox-tipi/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Kaya Tipi kontrolü
        if (lowerVariantName.includes('kaya')) {
          console.log('🪨 Kaya Tipi YÖNLENDİRME');
          navigate(`/create-ad/karoser-ustyapi/damperli-kaya-tipi/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Genel Damperli (default kaya tipi)
        console.log('🚛 Genel Damperli YÖNLENDİRME (default kaya tipi)');
        navigate(`/create-ad/karoser-ustyapi/damperli-kaya-tipi/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
        });
        return;
      }

      // Sabit Kabin grup kontrolü
      if (brand?.name === 'Sabit Kabin' || brand?.name?.includes('Sabit') || model?.name?.includes('Sabit Kabin')) {
        const lowerVariantName = variant.name.toLowerCase();
        
        // Açık Kasa kontrolü
        if (lowerVariantName.includes('açık') || lowerVariantName.includes('acik')) {
          console.log('📦 Sabit Kabin Açık Kasa YÖNLENDİRME');
          navigate(`/create-ad/karoser-ustyapi/sabit-kabin-acik-kasa/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Kapalı Kasa kontrolü
        if (lowerVariantName.includes('kapalı') || lowerVariantName.includes('kapali')) {
          console.log('📦 Sabit Kabin Kapalı Kasa YÖNLENDİRME');
          navigate(`/create-ad/karoser-ustyapi/sabit-kabin-kapali-kasa/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Özel Kasa kontrolü
        if (lowerVariantName.includes('özel') || lowerVariantName.includes('ozel')) {
          console.log('📦 Sabit Kabin Özel Kasa YÖNLENDİRME');
          navigate(`/create-ad/karoser-ustyapi/sabit-kabin-ozel-kasa/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Genel Sabit Kabin (default açık kasa)
        console.log('📦 Genel Sabit Kabin YÖNLENDİRME (default açık kasa)');
        navigate(`/create-ad/karoser-ustyapi/sabit-kabin-acik-kasa/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
        });
        return;
      }

      // Eğer Karoser kategorisindeyse ama özel grup bulunamazsa, genel yönlendirme
      console.log('🏗️ Karoser & Üstyapı genel yönlendirme');
      navigate(`/create-ad/karoser-ustyapi/damperli-kaya-tipi/${variant.id}`, {
        state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
      });
      return;
    }

    // Oto Kurtarıcı & Taşıyıcı routing
    if (vehicleType?.name === 'Oto Kurtarıcı & Taşıyıcı' || 
        vehicleType?.name?.toLowerCase().includes('oto kurtarıcı') ||
        vehicleType?.name?.toLowerCase().includes('taşıyıcı')) {
      console.log('🚛 Oto Kurtarıcı & Taşıyıcı kategorisine yönlendiriliyor', {
        vehicleTypeName: vehicleType.name,
        brandName: brand?.name,
        variantName: variant.name
      });
      
      // Çoklu Araç kontrolü
      if (variant.name?.toLowerCase().includes('çoklu') || 
          variant.name?.toLowerCase().includes('multi')) {
        console.log('🚗 Çoklu Araç YÖNLENDİRME');
        navigate(`/create-ad/oto-kurtarici-tasiyici/coklu-arac/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
        });
        return;
      }
      
      // Tekli Araç kontrolü (default)
      console.log('🚗 Tekli Araç YÖNLENDİRME');
      navigate(`/create-ad/oto-kurtarici-tasiyici/tekli-arac/${variant.id}`, {
        state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
      });
      return;
    }
    
    // Diğer vehicle type kontrolleri
    if (vehicleType?.name === 'Minibüs & Midibüs') {
      navigate(`/create-ad/minibus/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    } else if (vehicleType?.name === 'Kamyon & Kamyonet') {
      navigate(`/create-ad/kamyon/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    } else if (vehicleType?.name === 'Otobüs') {
      navigate(`/create-ad/otobus/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    } else if (vehicleType?.name === 'Çekici') {
      navigate(`/create-ad/cekici/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    } else if (vehicleType?.name === 'Römork') {
      // Kamyon Römorkları kontrolü
      if (brand?.name === 'Kamyon Römorkları' || model?.name === 'Kamyon Römorkları' ||
          variant.name.toLowerCase().includes('kamyon römork')) {
        console.log('🚛 Kamyon Römorkları YÖNLENDİRME');
        navigate(`/create-ad/romork/kamyon-romorklari/${variant.id}`, {
          state: { 
            variant,
            model,
            brand,
            vehicleType,
            selection: {
              vehicleType,
              brand,
              model,
              variant
            }
          }
        });
        return;
      }

      // Tarım Römorku kontrolü
      if (brand?.name === 'Tarım Römorkları' || model?.name === 'Tarım Römorkları') {
        // Açık Kasa kontrolü
        if (variant.name.toLowerCase().includes('açık kasa')) {
          console.log('🌾 Açık Kasa Tarım Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tarim-romork-acik-kasa/${variant.id}`, {
            state: { 
              variant,
              model,
              brand,
              vehicleType,
              selection: {
                vehicleType,
                brand,
                model,
                variant
              }
            }
          });
          return;
        }

        // Kapalı Kasa kontrolü
        if (variant.name.toLowerCase().includes('kapalı kasa')) {
          console.log('🌾 Kapalı Kasa Tarım Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tarim-romork-kapali-kasa/${variant.id}`, {
            state: { 
              variant,
              model,
              brand,
              vehicleType,
              selection: {
                vehicleType,
                brand,
                model,
                variant
              }
            }
          });
          return;
        }

        // Sulama kontrolü
        if (variant.name.toLowerCase().includes('sulama')) {
          console.log('🌾 Sulama Tarım Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tarim-romork-sulama/${variant.id}`, {
            state: { 
              variant,
              model,
              brand,
              vehicleType,
              selection: {
                vehicleType,
                brand,
                model,
                variant
              }
            }
          });
          return;
        }

        // Tanker kontrolü (Tarım Tanker)
        if (variant.name.toLowerCase().includes('tanker')) {
          console.log('🌾 Tanker Tarım Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tarim-romork-tanker/${variant.id}`, {
            state: { 
              variant,
              model,
              brand,
              vehicleType,
              selection: {
                vehicleType,
                brand,
                model,
                variant
              }
            }
          });
          return;
        }

        // Genel Tarım Römorku (default açık kasa)
        console.log('🌾 Genel Tarım Römorku YÖNLENDİRME (default açık kasa)');
        navigate(`/create-ad/romork/tarim-romork-acik-kasa/${variant.id}`, {
          state: { 
            variant,
            model,
            brand,
            vehicleType,
            selection: {
              vehicleType,
              brand,
              model,
              variant
            }
          }
        });
        return;
      }

      // Taşıma Römorkları kontrolü
      if (brand?.name === 'Taşıma Römorkları' || model?.name === 'Taşıma Römorkları') {
        const lowerVariantName = variant.name.toLowerCase();
        
        // Boru Römorku kontrolü
        if (lowerVariantName.includes('boru')) {
          console.log('🚰 Boru Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tasima-romorklari-boru/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Frigo Römorku kontrolü
        if (lowerVariantName.includes('frigo')) {
          console.log('❄️ Frigo Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tasima-romorklari-frigo/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Hayvan Römorku kontrolü
        if (lowerVariantName.includes('hayvan')) {
          console.log('🐄 Hayvan Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tasima-romorklari-hayvan/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Platform Römorku kontrolü
        if (lowerVariantName.includes('platform')) {
          console.log('📋 Platform Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tasima-romorklari-platform/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Seyehat Römorku kontrolü
        if (lowerVariantName.includes('seyehat')) {
          console.log('🏕️ Seyehat Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tasima-romorklari-seyehat/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Tüp Damacana Römorku kontrolü
        if (lowerVariantName.includes('tüp') || lowerVariantName.includes('damacana')) {
          console.log('🔥 Tüp Damacana Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tasima-romorklari-tup-damacana/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Vasıta Römorku kontrolü
        if (lowerVariantName.includes('vasıta')) {
          console.log('🚗 Vasıta Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tasima-romorklari-vasita/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Yük Römorku kontrolü
        if (lowerVariantName.includes('yük')) {
          console.log('📦 Yük Römorku YÖNLENDİRME');
          navigate(`/create-ad/romork/tasima-romorklari-yuk/${variant.id}`, {
            state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
          });
          return;
        }

        // Genel Taşıma Römorku (default platform)
        console.log('🚛 Genel Taşıma Römorku YÖNLENDİRME (default platform)');
        navigate(`/create-ad/romork/tasima-romorklari-platform/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
        });
        return;
      }

      // Özel Amaçlı Römork kontrolü
      if (brand?.name === 'Özel Amaçlı Römorklar' || model?.name === 'Özel Amaçlı Römorklar' ||
          variant.name.toLowerCase().includes('özel amaçlı')) {
        console.log('🎯 Özel Amaçlı Römork YÖNLENDİRME');
        navigate(`/create-ad/romork/ozel-amacli-romork/${variant.id}`, {
          state: { variant, model, brand, vehicleType, selection: { vehicleType, brand, model, variant } }
        });
        return;
      }
      
      // Genel Römork (default kamyon römorku)
      navigate(`/create-ad/romork/kamyon-romorklari/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    } else {
      // Diğer kategoriler için genel form (henüz oluşturulmamış)
      navigate('/create-listing', {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <UserHeader />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh'
        }}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <UserHeader />

      <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
        {/* Title */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            mb: 1
          }}
        >
          {model?.name || 'Varyant Seçimi'}
        </Typography>

        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          {brand?.name} - Toplam {filteredVariants.length} varyant mevcut
        </Typography>

        {/* Search Bar */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="Varyant ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{
              width: '100%',
              maxWidth: 500,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8f9fa',
                border: 'none !important',
                outline: 'none !important',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '& fieldset': {
                  border: 'none !important',
                  borderColor: 'transparent !important',
                },
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '& fieldset': {
                    border: 'none !important',
                    borderColor: 'transparent !important',
                  },
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  '& fieldset': {
                    border: 'none !important',
                    borderColor: 'transparent !important',
                  },
                },
                '&.Mui-focused fieldset': {
                  border: 'none !important',
                  borderColor: 'transparent !important',
                },
                '& input': {
                  padding: '14px 16px',
                  fontSize: '16px',
                  outline: 'none !important',
                  border: 'none !important',
                  '&:focus': {
                    outline: 'none !important',
                    border: 'none !important',
                    boxShadow: 'none !important',
                  },
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666', ml: 1 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Variants Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
          }}
        >
          {filteredVariants.map((variant) => (
            <Card
              key={variant.id}
              onClick={() => handleVariantSelect(variant)}
              sx={{
                cursor: 'pointer',
                height: 120,
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  border: '2px solid #1976d2',
                },
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: '#333',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {variant.name}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* No Results */}
        {filteredVariants.length === 0 && !loading && !error && (
          <Box textAlign="center" sx={{ mt: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aradığınız kriterlere uygun varyant bulunamadı
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleVariantSelect({ 
                id: 'custom', 
                name: 'Diğer/Belirtilmemiş',
                model_id: modelId || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })}
              sx={{ mt: 2 }}
            >
              Diğer/Belirtilmemiş Seçeneği ile Devam Et
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default VariantSelection;

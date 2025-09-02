import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Alert,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useAuth } from '../../context/AuthContext';

// ---------- helpers ----------
const tl = (n: number) => `${n.toLocaleString("tr-TR")} TL`;

type DurationKey = "1w" | "1a" | "3a";
type DopingId =
  | "ust"
  | "anasayfa"
  | "kategori"
  | "guncelle"
  | "acil"
  | "detayli";

type PriceMap = Partial<Record<DurationKey, number>>;

interface DopingOption {
  id: DopingId;
  title: string;
  desc: string;
  prices: PriceMap; // duration -> price
  defaultDuration: DurationKey;
  badge?: "Popüler" | "Yeni";
  howPreview?: string; // kısa açıklama
}

const OPTIONS: DopingOption[] = [
  {
    id: "ust",
    title: "Üst Sıradayım",
    desc:
      "İlanınız arama sonuçlarında gelişmiş sıralama seçildiğinde üst sıralarda yer alır.",
    prices: { "1w": 3359, "1a": 5999, "3a": 15999 },
    defaultDuration: "1w",
    badge: "Popüler",
    howPreview: "Arama sonuçlarında listenin en üst bloklarında yer alır.",
  },
  {
    id: "anasayfa",
    title: "Anasayfa Vitrini",
    desc: "İlanınız sahibinden ana sayfa vitrin alanında görüntülenir.",
    prices: { "1w": 5679, "1a": 9999, "3a": 24999 },
    defaultDuration: "1w",
    howPreview: "Ana sayfa vitrin slider ve kart alanlarında görünür.",
  },
  {
    id: "kategori",
    title: "Kategori Vitrini",
    desc:
      "Seçtiğiniz kategori ve alt kategorilerde vitrin alanında yer alırsınız.",
    prices: { "1w": 1719, "1a": 2999, "3a": 7999 },
    defaultDuration: "1w",
  },
  {
    id: "guncelle",
    title: "Güncelleme Dopingi",
    desc: "İlan tarihi yenilenir, tekrar üst sıralara taşınır.",
    prices: { "1a": 449 },
    defaultDuration: "1a",
  },
  {
    id: "acil",
    title: "Acil Acil",
    desc:
      "Ana sayfanın sol menüsündeki ‘Acil Acil’ kategorisinde yer alırsınız.",
    prices: { "1w": 1349, "1a": 2299, "3a": 5999 },
    defaultDuration: "1w",
  },
  {
    id: "detayli",
    title: "Detaylı Arama Vitrini",
    desc:
      "Detaylı arama yapan kullanıcılara sonuçlarda ek vitrin alanlarında çıkarsınız.",
    prices: { "1w": 679, "1a": 1199, "3a": 2999 },
    defaultDuration: "1w",
  },
];

type SelectionState = Partial<
  Record<
    DopingId,
    {
      selected: boolean;
      duration: DurationKey;
    }
  >
>;

function durationLabel(d: DurationKey) {
  if (d === "1w") return "1 Hafta";
  if (d === "1a") return "1 Ay"; 
  if (d === "3a") return "3 Ay";
  return "1 Adet";
}

// ---------- component ----------
const DopingPage: React.FC = () => {
  const { updateUser, user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [sel, setSel] = useState<SelectionState>(() =>
    Object.fromEntries(
      OPTIONS.map((o) => [
        o.id,
        { selected: false, duration: o.defaultDuration },
      ])
    )
  );

  const [showNoDopingWarn, setShowNoDopingWarn] = useState(false);
  const [showHow, setShowHow] = useState<null | DopingOption>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // payment form
  const [cardName, setCardName] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [acceptContracts, setAcceptContracts] = useState(false);
  const [want3d, setWant3d] = useState(true);
  const [saveMasterpass, setSaveMasterpass] = useState(false);

  const chosen = useMemo(
    () =>
      OPTIONS.filter((o) => sel[o.id]?.selected).map((o) => ({
        opt: o,
        duration: sel[o.id]!.duration,
        price: o.prices[sel[o.id]!.duration] ?? 0,
      })),
    [sel]
  );

  const total = useMemo(
    () => chosen.reduce((sum, x) => sum + (x.price ?? 0), 0),
    [chosen]
  );

  const canProceed = chosen.length > 0;

  const onToggle = (id: DopingId, checked: boolean) => {
    setSel((s) => ({ ...s, [id]: { ...(s[id] || {}), selected: checked, duration: s[id]?.duration || "1w" } }));
  };

  const onChangeDuration = (id: DopingId, e: SelectChangeEvent) => {
    const value = e.target.value as DurationKey;
    setSel((s) => ({ ...s, [id]: { ...(s[id] || {}), duration: value, selected: s[id]?.selected ?? true } }));
  };

  const handleContinue = () => {
    if (!canProceed) {
      setShowNoDopingWarn(true);
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveItem = (id: DopingId) => {
    setSel((s) => ({ ...s, [id]: { ...(s[id] || {}), selected: false } }));
  };

  const cardValid =
    cardName.trim().length > 2 &&
    cardNo.replace(/\s/g, "").length >= 16 &&
    /^\d{2}$/.test(expMonth) &&
    /^\d{2}$/.test(expYear) &&
    (cvv.length === 3 || cvv.length === 4);

  const canPay = acceptContracts && cardValid && want3d; // 3D'yi örnek akışta şart koştuk

  const handlePay = () => {
    // Doping durumunu aktif yap ve 6 ay sonra için bitiş tarihi belirle
    const dopingExpiresAt = new Date();
    dopingExpiresAt.setMonth(dopingExpiresAt.getMonth() + 6);
    
    // AuthContext'i güncelle
    updateUser({
      doping_status: 'ACTIVE',
      doping_expires_at: dopingExpiresAt
    });
    
    // Profile sayfası için localStorage'a kullanıcı ID'si ile kaydet
    if (user?.id) {
      localStorage.setItem(`local_doping_status_${user.id}`, 'ACTIVE');
      localStorage.setItem(`local_doping_expires_at_${user.id}`, dopingExpiresAt.toISOString());
    }
    
    setSuccessModalOpen(true);
  };

  // -------------- UI --------------
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ 
          mb: 4, 
          p: 2, 
          backgroundColor: 'grey.50', 
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}
      >
        {step === 2 ? (
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => setStep(1)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Geri Dön
          </Button>
        ) : (
          <Box />
        )}
        <Chip
          color="primary"
          label={step === 1 ? "1. Adım — Doping Seçenekleri" : "2. Adım — Ürün Detay & Ödeme"}
          variant="filled"
          sx={{ 
            fontWeight: 600,
            fontSize: '0.9rem',
            px: 2
          }}
        />
        <Box />
      </Stack>

      {step === 1 && (
        <>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
              Doping Seçenekleri
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Doping alarak ilanınızı öne çıkarabilir ve benzer ilanlardan ayrışabilirsiniz.
            </Typography>
            
            {/* 6 Ay Ücretsiz Banner */}
            <Alert 
              severity="success" 
              sx={{ 
                maxWidth: 400,
                mx: 'auto',
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontWeight: 600
                }
              }}
            >
              🎉 Tüm doping paketleri 6 ay boyunca ücretsiz!
            </Alert>
          </Box>

          <Grid container spacing={3}>
            {OPTIONS.map((o) => {
              const item = sel[o.id]!;
              const durations = Object.keys(o.prices) as DurationKey[];
              const isSelected = !!item.selected;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={o.id}>
                  <Card 
                    variant="outlined" 
                    sx={{
                      height: '100%',
                      border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#1976d2',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => onToggle(o.id, e.target.checked)}
                          sx={{ 
                            mb: 1,
                            '& .MuiSvgIcon-root': { 
                              fontSize: 24 
                            } 
                          }}
                        />
                        
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ fontSize: '0.95rem' }}>
                            {o.title}
                          </Typography>
                          {o.badge && (
                            <Chip 
                              size="small" 
                              label={o.badge} 
                              color="primary"
                              variant="filled"
                              sx={{ 
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          )}
                          <Tooltip title="Nasıl görünür?" placement="top">
                            <IconButton 
                              size="small" 
                              onClick={() => setShowHow(o)}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' },
                                p: 0.5
                              }}
                            >
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 2, lineHeight: 1.4, fontSize: '0.8rem', minHeight: 40 }}
                        >
                          {o.desc}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 'auto' }}>
                        <FormControl fullWidth sx={{ mb: 2 }} size="small">
                          <InputLabel>Süre</InputLabel>
                          <Select
                            label="Süre"
                            value={item.duration}
                            onChange={(e) => onChangeDuration(o.id, e)}
                            disabled={!item.selected}
                            sx={{ borderRadius: 1 }}
                          >
                            {durations.map((d) => (
                              <MenuItem key={d} value={d}>
                                {durationLabel(d)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <Box sx={{ textAlign: 'center' }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            sx={{ 
                              textDecoration: 'line-through',
                              color: 'text.disabled',
                              fontSize: '0.9rem'
                            }}
                          >
                            {tl(o.prices[item.duration] ?? 0)}
                          </Typography>
                          <Chip 
                            label="ÜCRETSİZ" 
                            color="success"
                            variant="filled"
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              mt: 0.5
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Card sx={{ mt: 4 }} variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <ShoppingCartCheckoutIcon color="primary" />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Sepet Özeti
                </Typography>
              </Stack>
              
              <Divider sx={{ mb: 3 }} />

              {chosen.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Henüz ürün seçmediniz.
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                    Yukarıdaki seçeneklerden birini işaretleyerek başlayın.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {chosen.map(({ opt, duration, price }) => (
                    <Box
                      key={opt.id}
                      sx={{
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={2}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {opt.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {durationLabel(duration)}
                          </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                textDecoration: 'line-through',
                                color: 'text.disabled'
                              }}
                            >
                              {tl(price)}
                            </Typography>
                            <Chip 
                              label="ÜCRETSİZ" 
                              color="success"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveItem(opt.id)}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { 
                                color: 'error.main',
                                backgroundColor: 'rgba(211, 47, 47, 0.04)'
                              }
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box 
                    sx={{
                      p: 2,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderRadius: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={600}>
                        Toplam Tutar
                      </Typography>
                      <Box>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            textDecoration: 'line-through',
                            opacity: 0.8
                          }}
                        >
                          {tl(total)}
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          ÜCRETSİZ! 🎉
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", p: 3, pt: 0 }}>
              <Button 
                size="large" 
                variant="contained" 
                onClick={handleContinue}
                sx={{
                  minWidth: 150,
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Devam Et
              </Button>
            </CardActions>
          </Card>
        </>
      )}

      {step === 2 && (
        <>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
              Ürün Detay ve Ödeme
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Seçimlerinizi kontrol edin ve ödeme bilgilerinizi girin
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'text.primary' }}>
                    📋 Sipariş Özeti
                  </Typography>
                  
                  {chosen.length === 0 ? (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      Sepet boş. Geri dönüp seçenek ekleyin.
                    </Alert>
                  ) : (
                    <Stack spacing={2}>
                      {chosen.map(({ opt, duration, price }) => (
                        <Box
                          key={opt.id}
                          sx={{
                            p: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            backgroundColor: '#fafafa'
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {opt.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {durationLabel(duration)}
                              </Typography>
                            </Box>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography 
                                  variant="body2"
                                  sx={{ 
                                    textDecoration: 'line-through',
                                    color: 'text.disabled'
                                  }}
                                >
                                  {tl(price)}
                                </Typography>
                                <Chip 
                                  label="ÜCRETSİZ" 
                                  color="success"
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              </Box>
                              <IconButton 
                                size="small" 
                                onClick={() => handleRemoveItem(opt.id)}
                                sx={{ 
                                  color: 'text.secondary',
                                  '&:hover': { 
                                    color: 'error.main',
                                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box 
                        sx={{
                          p: 2,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          borderRadius: 2,
                          textAlign: 'center'
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" fontWeight={600}>
                            Toplam Tutar
                          </Typography>
                          <Box>
                            <Typography 
                              variant="body1"
                              sx={{ 
                                textDecoration: 'line-through',
                                opacity: 0.8
                              }}
                            >
                              {tl(total)}
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                              ÜCRETSİZ! 🎉
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <CreditCardIcon color="primary" />
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      Kart ile Ödeme (Güvenlik Amaçlı)
                    </Typography>
                  </Stack>

                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    Bu işlem tamamen ücretsizdir. Şimdilik kart bilgisi gerekmemektedir.
                    Sadece form tamamlanması yeterlidir.
                  </Alert>

                  <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    ⚠️ Not: Kart bilgileri henüz zorunlu değildir. İlerleyen dönemlerde ücretli hale geçebilir.
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Kart üzerindeki ad soyad"
                        fullWidth
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Kart numarası"
                        fullWidth
                        placeholder="1234 5678 9012 3456"
                        value={cardNo}
                        onChange={(e) =>
                          setCardNo(
                            e.target.value
                              .replace(/[^\d]/g, "")
                              .replace(/(.{4})/g, "$1 ")
                              .trim()
                          )
                        }
                        inputProps={{ maxLength: 19 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Ay"
                        placeholder="MM"
                        value={expMonth}
                        onChange={(e) =>
                          setExpMonth(e.target.value.replace(/[^\d]/g, "").slice(0, 2))
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Yıl"
                        placeholder="YY"
                        value={expYear}
                        onChange={(e) =>
                          setExpYear(e.target.value.replace(/[^\d]/g, "").slice(0, 2))
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="CVV"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/[^\d]/g, "").slice(0, 4))
                        }
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />
                  <FormControlLabel
                    control={
                      <Checkbox checked={want3d} onChange={(e) => setWant3d(e.target.checked)} />
                    }
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LockIcon fontSize="small" />
                        <span>3D Secure ile ödeme yapmak istiyorum.</span>
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={saveMasterpass}
                        onChange={(e) => setSaveMasterpass(e.target.checked)}
                      />
                    }
                    label={
                      <>
                        Kart bilgilerimin Mastercard altyapısında kaydedilmesini ve{" "}
                        <Link href="#" underline="hover">
                          Masterpass Kullanım Koşulları
                        </Link>
                        ’nı kabul ediyorum.
                      </>
                    }
                  />

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Sözleşmeler
                  </Typography>
                  <Alert icon={<InfoOutlinedIcon />} severity="info" sx={{ mb: 1 }}>
                    Hizmet Alan, Mesafeli Sözleşmeler Yönetmeliği uyarınca cayma hakkı süresi
                    sona ermeden önce kendi onayı ile hizmetin ifasına başlanan hizmet sözleşmelerinde
                    cayma hakkını kullanamayacaktır.
                  </Alert>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={acceptContracts}
                        onChange={(e) => setAcceptContracts(e.target.checked)}
                      />
                    }
                    label={
                      <>
                        <strong>Ön Bilgilendirme Formunu ve Mesafeli Sözleşmeyi</strong> kabul ediyorum.
                      </>
                    }
                  />

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                    <Typography variant="h6">Toplam tutar</Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {tl(total)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                    <Button
                      size="large"
                      variant="contained"
                      startIcon={<CheckCircleOutlineIcon />}
                      disabled={!acceptContracts || chosen.length === 0}
                      onClick={handlePay}
                      fullWidth
                      sx={{
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1.5,
                        background: 'linear-gradient(45deg, #4CAF50, #81C784)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #388E3C, #66BB6A)'
                        }
                      }}
                    >
                      🚀 Dopinge Başla
                    </Button>
                  </Stack>

                  {!want3d && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      3D Secure kapalı. Güvenlik için 3D Secure önerilir.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Dopingsiz uyarı */}
      <Dialog 
        open={showNoDopingWarn} 
        onClose={() => setShowNoDopingWarn(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            ℹ️ Bilgilendirme
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            Doping alarak ilanınızı ön plana çıkarabilir ve benzer ilanlardan ayrıştırabilirsiniz.
            İlan girişlerinize <strong>dopingsiz</strong> olarak devam etmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowNoDopingWarn(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowNoDopingWarn(false);
              setStep(2);
            }}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Devam Et
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nasıl görünür? */}
      <Dialog 
        open={!!showHow} 
        onClose={() => setShowHow(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            👁️ Nasıl Görünür?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {showHow ? (
            <>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                {showHow.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                {showHow.howPreview || showHow.desc}
              </Typography>
              <Alert 
                sx={{ borderRadius: 2 }} 
                icon={<CheckCircleOutlineIcon />}
                severity="success"
              >
                Örnek görsel/konum: ilgili vitrin alanlarında "Doping" rozetiyle vurgulanır.
              </Alert>
            </>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowHow(null)}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Anladım
          </Button>
        </DialogActions>
      </Dialog>      {/* Nasıl görünür? */}
      <Dialog open={!!showHow} onClose={() => setShowHow(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Nasıl Görünür?</DialogTitle>
        <DialogContent>
          {showHow ? (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {showHow.title}
              </Typography>
              <Typography color="text.secondary">{showHow.howPreview || showHow.desc}</Typography>
              <Alert sx={{ mt: 2 }} icon={<CheckCircleOutlineIcon />}>
                Örnek görsel/konum: ilgili vitrin alanlarında “Doping” rozetiyle vurgulanır.
              </Alert>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHow(null)}>Tamam</Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <Dialog
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center'
          }
        }}
      >
        <DialogContent sx={{ py: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" sx={{ fontSize: '4rem', mb: 1 }}>
              🎉
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              Tebrikler!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Doping paketleriniz ücretsiz olarak aktifleştirildi!
            </Typography>
            
            {chosen.length > 0 && (
              <Box sx={{ 
                bg: 'rgba(255,255,255,0.1)', 
                borderRadius: 2, 
                p: 2, 
                mb: 3 
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Aktifleştirilen Paketler:
                </Typography>
                {chosen.map((c, idx) => (
                  <Typography key={idx} variant="body2" sx={{ opacity: 0.9 }}>
                    • {c.opt.title} - {durationLabel(c.dur)}
                  </Typography>
                ))}
              </Box>
            )}
            
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              ✨ İlanlarınızda artık doping rozetleri görünecek!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              🚀 İlanlarınız öne çıkarılmaya başlandı!
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => {
              setSuccessModalOpen(false);
              // Profile sayfasına yönlendir
              window.location.href = '/profile';
            }}
            variant="contained"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            Profilime Git 🎯
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DopingPage;

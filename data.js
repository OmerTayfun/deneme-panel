/* ============================================================
   GRC Suite — data.js
   Standart tanımları, kontrol setleri ve sabit listeler
   ============================================================ */

const STANDARDS = {
  iso27001: {
    id: "iso27001",
    code: "ISO/IEC 27001:2022",
    name: "ISO 27001",
    subtitle: "Bilgi Güvenliği Yönetim Sistemi",
    short: "BGYS"
  },
  iso27701: {
    id: "iso27701",
    code: "ISO/IEC 27701:2019",
    name: "ISO 27701",
    subtitle: "Kişisel Veri / Gizlilik Yönetimi (PIMS)",
    short: "KVYS"
  },
  iso42001: {
    id: "iso42001",
    code: "ISO/IEC 42001:2023",
    name: "ISO 42001",
    subtitle: "Yapay Zekâ Yönetim Sistemi",
    short: "YZYS"
  }
};

/* ---------- ISO/IEC 27001:2022 — Ek A (93 kontrol) ---------- */
const CONTROLS_ISO27001 = [
  // A.5 Organizasyonel kontroller
  { id: "A.5.1",  theme: "Organizasyonel", title: "Bilgi güvenliği politikaları" },
  { id: "A.5.2",  theme: "Organizasyonel", title: "Bilgi güvenliği rol ve sorumlulukları" },
  { id: "A.5.3",  theme: "Organizasyonel", title: "Görevler ayrılığı" },
  { id: "A.5.4",  theme: "Organizasyonel", title: "Yönetim sorumlulukları" },
  { id: "A.5.5",  theme: "Organizasyonel", title: "Otoritelerle iletişim" },
  { id: "A.5.6",  theme: "Organizasyonel", title: "Özel ilgi gruplarıyla iletişim" },
  { id: "A.5.7",  theme: "Organizasyonel", title: "Tehdit istihbaratı" },
  { id: "A.5.8",  theme: "Organizasyonel", title: "Proje yönetiminde bilgi güvenliği" },
  { id: "A.5.9",  theme: "Organizasyonel", title: "Bilgi ve diğer ilişkili varlıkların envanteri" },
  { id: "A.5.10", theme: "Organizasyonel", title: "Bilgi ve ilişkili varlıkların kabul edilebilir kullanımı" },
  { id: "A.5.11", theme: "Organizasyonel", title: "Varlıkların iadesi" },
  { id: "A.5.12", theme: "Organizasyonel", title: "Bilginin sınıflandırılması" },
  { id: "A.5.13", theme: "Organizasyonel", title: "Bilginin etiketlenmesi" },
  { id: "A.5.14", theme: "Organizasyonel", title: "Bilgi transferi" },
  { id: "A.5.15", theme: "Organizasyonel", title: "Erişim kontrolü" },
  { id: "A.5.16", theme: "Organizasyonel", title: "Kimlik yönetimi" },
  { id: "A.5.17", theme: "Organizasyonel", title: "Kimlik doğrulama bilgisi" },
  { id: "A.5.18", theme: "Organizasyonel", title: "Erişim hakları" },
  { id: "A.5.19", theme: "Organizasyonel", title: "Tedarikçi ilişkilerinde bilgi güvenliği" },
  { id: "A.5.20", theme: "Organizasyonel", title: "Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması" },
  { id: "A.5.21", theme: "Organizasyonel", title: "BİT tedarik zincirinde bilgi güvenliğinin yönetimi" },
  { id: "A.5.22", theme: "Organizasyonel", title: "Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi" },
  { id: "A.5.23", theme: "Organizasyonel", title: "Bulut hizmetleri kullanımında bilgi güvenliği" },
  { id: "A.5.24", theme: "Organizasyonel", title: "Bilgi güvenliği ihlal olayı yönetimi: planlama ve hazırlık" },
  { id: "A.5.25", theme: "Organizasyonel", title: "Bilgi güvenliği olaylarının değerlendirilmesi ve karara bağlanması" },
  { id: "A.5.26", theme: "Organizasyonel", title: "Bilgi güvenliği ihlal olaylarına müdahale" },
  { id: "A.5.27", theme: "Organizasyonel", title: "Bilgi güvenliği ihlal olaylarından öğrenme" },
  { id: "A.5.28", theme: "Organizasyonel", title: "Kanıt toplama" },
  { id: "A.5.29", theme: "Organizasyonel", title: "Kesinti sırasında bilgi güvenliği" },
  { id: "A.5.30", theme: "Organizasyonel", title: "İş sürekliliği için BİT hazırlığı" },
  { id: "A.5.31", theme: "Organizasyonel", title: "Yasal, düzenleyici ve sözleşmeden doğan gereksinimler" },
  { id: "A.5.32", theme: "Organizasyonel", title: "Fikri mülkiyet hakları" },
  { id: "A.5.33", theme: "Organizasyonel", title: "Kayıtların korunması" },
  { id: "A.5.34", theme: "Organizasyonel", title: "Kişisel verilerin gizliliği ve korunması" },
  { id: "A.5.35", theme: "Organizasyonel", title: "Bilgi güvenliğinin bağımsız gözden geçirilmesi" },
  { id: "A.5.36", theme: "Organizasyonel", title: "Politika, kural ve standartlara uyum" },
  { id: "A.5.37", theme: "Organizasyonel", title: "Dokümante edilmiş işletim prosedürleri" },
  // A.6 İnsan kontrolleri
  { id: "A.6.1",  theme: "İnsan", title: "Tarama (özgeçmiş doğrulama)" },
  { id: "A.6.2",  theme: "İnsan", title: "İstihdam şart ve koşulları" },
  { id: "A.6.3",  theme: "İnsan", title: "Bilgi güvenliği farkındalığı, eğitim ve öğretim" },
  { id: "A.6.4",  theme: "İnsan", title: "Disiplin süreci" },
  { id: "A.6.5",  theme: "İnsan", title: "İstihdam sonlandıktan veya değiştikten sonraki sorumluluklar" },
  { id: "A.6.6",  theme: "İnsan", title: "Gizlilik veya ifşa etmeme anlaşmaları" },
  { id: "A.6.7",  theme: "İnsan", title: "Uzaktan çalışma" },
  { id: "A.6.8",  theme: "İnsan", title: "Bilgi güvenliği olaylarının raporlanması" },
  // A.7 Fiziksel kontroller
  { id: "A.7.1",  theme: "Fiziksel", title: "Fiziksel güvenlik çevre sınırları" },
  { id: "A.7.2",  theme: "Fiziksel", title: "Fiziksel giriş" },
  { id: "A.7.3",  theme: "Fiziksel", title: "Ofis, oda ve tesislerin güvenliği" },
  { id: "A.7.4",  theme: "Fiziksel", title: "Fiziksel güvenlik izleme" },
  { id: "A.7.5",  theme: "Fiziksel", title: "Fiziksel ve çevresel tehditlere karşı koruma" },
  { id: "A.7.6",  theme: "Fiziksel", title: "Güvenli alanlarda çalışma" },
  { id: "A.7.7",  theme: "Fiziksel", title: "Temiz masa ve temiz ekran" },
  { id: "A.7.8",  theme: "Fiziksel", title: "Ekipman yerleşimi ve koruma" },
  { id: "A.7.9",  theme: "Fiziksel", title: "Tesis dışındaki varlıkların güvenliği" },
  { id: "A.7.10", theme: "Fiziksel", title: "Depolama ortamı" },
  { id: "A.7.11", theme: "Fiziksel", title: "Destek hizmetleri (elektrik, iklimlendirme vb.)" },
  { id: "A.7.12", theme: "Fiziksel", title: "Kablolama güvenliği" },
  { id: "A.7.13", theme: "Fiziksel", title: "Ekipman bakımı" },
  { id: "A.7.14", theme: "Fiziksel", title: "Ekipmanın güvenli elden çıkarılması veya yeniden kullanımı" },
  // A.8 Teknolojik kontroller
  { id: "A.8.1",  theme: "Teknolojik", title: "Kullanıcı uç nokta cihazları" },
  { id: "A.8.2",  theme: "Teknolojik", title: "Ayrıcalıklı erişim hakları" },
  { id: "A.8.3",  theme: "Teknolojik", title: "Bilgiye erişim kısıtlaması" },
  { id: "A.8.4",  theme: "Teknolojik", title: "Kaynak koduna erişim" },
  { id: "A.8.5",  theme: "Teknolojik", title: "Güvenli kimlik doğrulama" },
  { id: "A.8.6",  theme: "Teknolojik", title: "Kapasite yönetimi" },
  { id: "A.8.7",  theme: "Teknolojik", title: "Kötü amaçlı yazılıma karşı koruma" },
  { id: "A.8.8",  theme: "Teknolojik", title: "Teknik açıklıkların yönetimi" },
  { id: "A.8.9",  theme: "Teknolojik", title: "Konfigürasyon yönetimi" },
  { id: "A.8.10", theme: "Teknolojik", title: "Bilginin silinmesi" },
  { id: "A.8.11", theme: "Teknolojik", title: "Veri maskeleme" },
  { id: "A.8.12", theme: "Teknolojik", title: "Veri sızıntısı önleme" },
  { id: "A.8.13", theme: "Teknolojik", title: "Bilgi yedekleme" },
  { id: "A.8.14", theme: "Teknolojik", title: "Bilgi işleme tesislerinin yedekliliği" },
  { id: "A.8.15", theme: "Teknolojik", title: "Kayıt tutma (loglama)" },
  { id: "A.8.16", theme: "Teknolojik", title: "İzleme faaliyetleri" },
  { id: "A.8.17", theme: "Teknolojik", title: "Saat senkronizasyonu" },
  { id: "A.8.18", theme: "Teknolojik", title: "Ayrıcalıklı yardımcı programların kullanımı" },
  { id: "A.8.19", theme: "Teknolojik", title: "İşletimsel sistemlere yazılım kurulumu" },
  { id: "A.8.20", theme: "Teknolojik", title: "Ağ güvenliği" },
  { id: "A.8.21", theme: "Teknolojik", title: "Ağ hizmetlerinin güvenliği" },
  { id: "A.8.22", theme: "Teknolojik", title: "Ağların ayrıştırılması" },
  { id: "A.8.23", theme: "Teknolojik", title: "Web filtreleme" },
  { id: "A.8.24", theme: "Teknolojik", title: "Kriptografi kullanımı" },
  { id: "A.8.25", theme: "Teknolojik", title: "Güvenli geliştirme yaşam döngüsü" },
  { id: "A.8.26", theme: "Teknolojik", title: "Uygulama güvenliği gereksinimleri" },
  { id: "A.8.27", theme: "Teknolojik", title: "Güvenli sistem mimarisi ve mühendislik ilkeleri" },
  { id: "A.8.28", theme: "Teknolojik", title: "Güvenli kodlama" },
  { id: "A.8.29", theme: "Teknolojik", title: "Geliştirme ve kabulde güvenlik testleri" },
  { id: "A.8.30", theme: "Teknolojik", title: "Dış kaynaklı geliştirme" },
  { id: "A.8.31", theme: "Teknolojik", title: "Geliştirme, test ve üretim ortamlarının ayrılması" },
  { id: "A.8.32", theme: "Teknolojik", title: "Değişiklik yönetimi" },
  { id: "A.8.33", theme: "Teknolojik", title: "Test bilgisi" },
  { id: "A.8.34", theme: "Teknolojik", title: "Denetim testleri sırasında bilgi sistemlerinin korunması" }
];

/* ---------- ISO/IEC 27701:2019 — Ek A (Veri Sorumlusu, 31 kontrol) ----------
   Not: Ek B (Veri İşleyici) kontrolleri sonraki sürümde eklenecektir. */
const CONTROLS_ISO27701 = [
  { id: "A.7.2.1",  theme: "Toplama ve İşleme Koşulları", title: "Amacın belirlenmesi ve dokümante edilmesi" },
  { id: "A.7.2.2",  theme: "Toplama ve İşleme Koşulları", title: "Yasal dayanağın belirlenmesi" },
  { id: "A.7.2.3",  theme: "Toplama ve İşleme Koşulları", title: "Rızanın ne zaman ve nasıl alınacağının belirlenmesi" },
  { id: "A.7.2.4",  theme: "Toplama ve İşleme Koşulları", title: "Rızanın alınması ve kayıt altına alınması" },
  { id: "A.7.2.5",  theme: "Toplama ve İşleme Koşulları", title: "Gizlilik (mahremiyet) etki değerlendirmesi" },
  { id: "A.7.2.6",  theme: "Toplama ve İşleme Koşulları", title: "KKV işleyicilerle yapılan sözleşmeler" },
  { id: "A.7.2.7",  theme: "Toplama ve İşleme Koşulları", title: "Müşterek KKV sorumlusu" },
  { id: "A.7.2.8",  theme: "Toplama ve İşleme Koşulları", title: "KKV işleme ile ilgili kayıtlar" },
  { id: "A.7.3.1",  theme: "İlgili Kişilere Karşı Yükümlülükler", title: "Yükümlülüklerin belirlenmesi ve yerine getirilmesi" },
  { id: "A.7.3.2",  theme: "İlgili Kişilere Karşı Yükümlülükler", title: "İlgili kişilere sağlanacak bilgilerin belirlenmesi" },
  { id: "A.7.3.3",  theme: "İlgili Kişilere Karşı Yükümlülükler", title: "İlgili kişilere bilgi sağlanması" },
  { id: "A.7.3.4",  theme: "İlgili Kişilere Karşı Yükümlülükler", title: "Rızayı değiştirme veya geri çekme mekanizması" },
  { id: "A.7.3.5",  theme: "İlgili Kişilere Karşı Yükümlülükler", title: "İşlemeye itiraz mekanizması" },
  { id: "A.7.3.6",  theme: "İlgili Kişilere Karşı Yükümlülükler", title: "Erişim, düzeltme ve/veya silme" },
  { id: "A.7.3.7",  theme: "İlgili Kişilere Karşı Yükümlülükler", title: "Üçüncü tarafların bilgilendirilmesi yükümlülüğü" },
  { id: "A.7.3.8",  theme: "İlgili Kişilere Karşı Yükümlülükler", title: "İşlenen KKV'nin bir kopyasının sağlanması" },
  { id: "A.7.3.9",  theme: "İlgili Kişilere Karşı Yükümlülükler", title: "Taleplerin ele alınması" },
  { id: "A.7.3.10", theme: "İlgili Kişilere Karşı Yükümlülükler", title: "Otomatik karar verme" },
  { id: "A.7.4.1",  theme: "Tasarımda ve Varsayılan Gizlilik", title: "Toplamanın sınırlandırılması" },
  { id: "A.7.4.2",  theme: "Tasarımda ve Varsayılan Gizlilik", title: "İşlemenin sınırlandırılması" },
  { id: "A.7.4.3",  theme: "Tasarımda ve Varsayılan Gizlilik", title: "Doğruluk ve kalite" },
  { id: "A.7.4.4",  theme: "Tasarımda ve Varsayılan Gizlilik", title: "KKV minimizasyonu hedefleri" },
  { id: "A.7.4.5",  theme: "Tasarımda ve Varsayılan Gizlilik", title: "İşleme sonunda anonimleştirme ve silme" },
  { id: "A.7.4.6",  theme: "Tasarımda ve Varsayılan Gizlilik", title: "Geçici dosyalar" },
  { id: "A.7.4.7",  theme: "Tasarımda ve Varsayılan Gizlilik", title: "Saklama (muhafaza) süreleri" },
  { id: "A.7.4.8",  theme: "Tasarımda ve Varsayılan Gizlilik", title: "İmha" },
  { id: "A.7.4.9",  theme: "Tasarımda ve Varsayılan Gizlilik", title: "KKV iletim kontrolleri" },
  { id: "A.7.5.1",  theme: "Paylaşım, Aktarım ve Açıklama", title: "Yargı bölgeleri arası aktarım dayanağının belirlenmesi" },
  { id: "A.7.5.2",  theme: "Paylaşım, Aktarım ve Açıklama", title: "Aktarım yapılabilecek ülke ve uluslararası kuruluşlar" },
  { id: "A.7.5.3",  theme: "Paylaşım, Aktarım ve Açıklama", title: "KKV aktarım kayıtları" },
  { id: "A.7.5.4",  theme: "Paylaşım, Aktarım ve Açıklama", title: "Üçüncü taraflara KKV açıklama kayıtları" }
];

/* ---------- ISO/IEC 42001:2023 — Ek A (38 kontrol) ---------- */
const CONTROLS_ISO42001 = [
  { id: "A.2.2",   theme: "YZ Politikaları", title: "Yapay zekâ politikası" },
  { id: "A.2.3",   theme: "YZ Politikaları", title: "Diğer kurumsal politikalarla uyum" },
  { id: "A.2.4",   theme: "YZ Politikaları", title: "YZ politikasının gözden geçirilmesi" },
  { id: "A.3.2",   theme: "İç Organizasyon", title: "YZ rol ve sorumlulukları" },
  { id: "A.3.3",   theme: "İç Organizasyon", title: "Endişelerin raporlanması" },
  { id: "A.4.2",   theme: "YZ Sistemleri için Kaynaklar", title: "Kaynak dokümantasyonu" },
  { id: "A.4.3",   theme: "YZ Sistemleri için Kaynaklar", title: "Veri kaynakları" },
  { id: "A.4.4",   theme: "YZ Sistemleri için Kaynaklar", title: "Araç (tooling) kaynakları" },
  { id: "A.4.5",   theme: "YZ Sistemleri için Kaynaklar", title: "Sistem ve hesaplama kaynakları" },
  { id: "A.4.6",   theme: "YZ Sistemleri için Kaynaklar", title: "İnsan kaynakları" },
  { id: "A.5.2",   theme: "YZ Etki Değerlendirmesi", title: "YZ sistemi etki değerlendirme süreci" },
  { id: "A.5.3",   theme: "YZ Etki Değerlendirmesi", title: "Etki değerlendirmelerinin dokümantasyonu" },
  { id: "A.5.4",   theme: "YZ Etki Değerlendirmesi", title: "Birey ve gruplar üzerindeki etkilerin değerlendirilmesi" },
  { id: "A.5.5",   theme: "YZ Etki Değerlendirmesi", title: "Toplumsal etkilerin değerlendirilmesi" },
  { id: "A.6.1.2", theme: "YZ Sistemi Yaşam Döngüsü", title: "Sorumlu geliştirme hedefleri" },
  { id: "A.6.1.3", theme: "YZ Sistemi Yaşam Döngüsü", title: "Sorumlu tasarım ve geliştirme süreçleri" },
  { id: "A.6.2.2", theme: "YZ Sistemi Yaşam Döngüsü", title: "YZ sistemi gereksinimleri ve şartnamesi" },
  { id: "A.6.2.3", theme: "YZ Sistemi Yaşam Döngüsü", title: "Tasarım ve geliştirme dokümantasyonu" },
  { id: "A.6.2.4", theme: "YZ Sistemi Yaşam Döngüsü", title: "Doğrulama ve geçerleme" },
  { id: "A.6.2.5", theme: "YZ Sistemi Yaşam Döngüsü", title: "Devreye alma (deployment)" },
  { id: "A.6.2.6", theme: "YZ Sistemi Yaşam Döngüsü", title: "İşletim ve izleme" },
  { id: "A.6.2.7", theme: "YZ Sistemi Yaşam Döngüsü", title: "Teknik dokümantasyon" },
  { id: "A.6.2.8", theme: "YZ Sistemi Yaşam Döngüsü", title: "Olay günlüklerinin kaydı" },
  { id: "A.7.2",   theme: "YZ Sistemleri için Veri", title: "Geliştirme ve iyileştirme için veri" },
  { id: "A.7.3",   theme: "YZ Sistemleri için Veri", title: "Verinin edinilmesi" },
  { id: "A.7.4",   theme: "YZ Sistemleri için Veri", title: "Veri kalitesi" },
  { id: "A.7.5",   theme: "YZ Sistemleri için Veri", title: "Veri kökeni (provenance)" },
  { id: "A.7.6",   theme: "YZ Sistemleri için Veri", title: "Veri hazırlama" },
  { id: "A.8.2",   theme: "İlgili Taraflar için Bilgi", title: "Kullanıcılar için sistem dokümantasyonu ve bilgi" },
  { id: "A.8.3",   theme: "İlgili Taraflar için Bilgi", title: "Dış raporlama" },
  { id: "A.8.4",   theme: "İlgili Taraflar için Bilgi", title: "Olayların iletişimi" },
  { id: "A.8.5",   theme: "İlgili Taraflar için Bilgi", title: "İlgili taraflar için bilgi" },
  { id: "A.9.2",   theme: "YZ Sistemlerinin Kullanımı", title: "Sorumlu kullanım süreçleri" },
  { id: "A.9.3",   theme: "YZ Sistemlerinin Kullanımı", title: "Sorumlu kullanım hedefleri" },
  { id: "A.9.4",   theme: "YZ Sistemlerinin Kullanımı", title: "Amaçlanan kullanım" },
  { id: "A.10.2",  theme: "Üçüncü Taraf ve Müşteri İlişkileri", title: "Sorumlulukların tahsisi" },
  { id: "A.10.3",  theme: "Üçüncü Taraf ve Müşteri İlişkileri", title: "Tedarikçiler" },
  { id: "A.10.4",  theme: "Üçüncü Taraf ve Müşteri İlişkileri", title: "Müşteriler" }
];

const CONTROL_SETS = {
  iso27001: CONTROLS_ISO27001,
  iso27701: CONTROLS_ISO27701,
  iso42001: CONTROLS_ISO42001
};

/* ---------- Sabit listeler ---------- */

const SOA_STATUSES = [
  { id: "uygulanmadi", label: "Uygulanmadı",  color: "bad" },
  { id: "planlandi",   label: "Planlandı",    color: "info" },
  { id: "kismen",      label: "Kısmen",       color: "warn" },
  { id: "uygulandi",   label: "Uygulandı",    color: "ok" }
];

const ASSET_TYPES = ["Bilgi", "Yazılım", "Donanım", "Hizmet", "İnsan", "Tesis", "Bulut Hizmeti"];
const CLASSIFICATIONS = ["Genel", "Dahili", "Gizli", "Çok Gizli"];

const RISK_TREATMENTS = ["Azalt", "Kabul Et", "Devret", "Kaçın"];
const RISK_STATUSES = ["Açık", "İşlem Görüyor", "Kapatıldı", "Kabul Edildi"];

const FINDING_TYPES = ["Majör Uygunsuzluk", "Minör Uygunsuzluk", "Gözlem", "İyileştirme Fırsatı"];
const AUDIT_STATUSES = ["Planlandı", "Devam Ediyor", "Tamamlandı"];

const ACTION_STATUSES = ["Açık", "Devam Ediyor", "Doğrulama Bekliyor", "Kapatıldı"];
const ACTION_SOURCES = ["İç Denetim", "Risk Değerlendirme", "YGG", "Olay", "Diğer"];

const DOC_TYPES = ["Politika", "Prosedür", "Talimat", "Form", "Plan", "Rapor", "Kayıt"];
const DOC_STATUSES = ["Taslak", "Onayda", "Yayında", "Revizyonda", "Arşiv"];

const KPI_DIRECTIONS = [
  { id: "up",   label: "Yüksek olması iyi" },
  { id: "down", label: "Düşük olması iyi" }
];

/* ---------- Örnek (demo) veri ---------- */
const SEED_DATA = {
  assets: [
    { id: "AST-001", name: "Müşteri Veritabanı", type: "Bilgi", owner: "BT Müdürü", c: 5, i: 5, a: 4, classification: "Çok Gizli", notes: "KVKK kapsamında kişisel veri içerir" },
    { id: "AST-002", name: "ERP Uygulaması", type: "Yazılım", owner: "BT Müdürü", c: 4, i: 5, a: 5, classification: "Gizli", notes: "" },
    { id: "AST-003", name: "Dosya Sunucusu", type: "Donanım", owner: "Sistem Yöneticisi", c: 4, i: 4, a: 4, classification: "Gizli", notes: "" },
    { id: "AST-004", name: "E-posta Hizmeti (M365)", type: "Bulut Hizmeti", owner: "BT Müdürü", c: 4, i: 3, a: 4, classification: "Dahili", notes: "" },
    { id: "AST-005", name: "İK Özlük Dosyaları", type: "Bilgi", owner: "İK Müdürü", c: 5, i: 4, a: 2, classification: "Çok Gizli", notes: "Özel nitelikli kişisel veri" }
  ],
  risks: [
    { id: "RSK-001", title: "Fidye yazılımı ile veri şifrelenmesi", assetId: "AST-003", threat: "Kötü amaçlı yazılım", likelihood: 3, impact: 5, controls: ["A.8.7", "A.8.13"], treatment: "Azalt", status: "İşlem Görüyor", owner: "BT Müdürü" },
    { id: "RSK-002", title: "Yetkisiz erişim ile kişisel veri sızıntısı", assetId: "AST-001", threat: "İç tehdit / zayıf erişim kontrolü", likelihood: 3, impact: 5, controls: ["A.5.15", "A.8.2", "A.8.12"], treatment: "Azalt", status: "Açık", owner: "Bilgi Güvenliği Sorumlusu" },
    { id: "RSK-003", title: "Bulut hizmeti kesintisi", assetId: "AST-004", threat: "Hizmet sağlayıcı kaynaklı kesinti", likelihood: 2, impact: 3, controls: ["A.5.23", "A.5.30"], treatment: "Kabul Et", status: "Kabul Edildi", owner: "BT Müdürü" },
    { id: "RSK-004", title: "Eski çalışan erişimlerinin kapatılmaması", assetId: "AST-002", threat: "Süreç eksikliği", likelihood: 4, impact: 4, controls: ["A.5.18", "A.6.5"], treatment: "Azalt", status: "Açık", owner: "İK Müdürü" }
  ],
  audits: [
    { id: "AUD-001", title: "2026 1. Dönem BGYS İç Denetimi", standard: "iso27001", date: "2026-04-15", auditor: "Ö. T. Deveçeker", scope: "A.5, A.6 ve A.8 kontrol temaları, BT ve İK süreçleri", status: "Tamamlandı" },
    { id: "AUD-002", title: "2026 KVYS (PIMS) Ara Denetimi", standard: "iso27701", date: "2026-09-10", auditor: "Atanmadı", scope: "Veri sorumlusu yükümlülükleri (A.7.3)", status: "Planlandı" }
  ],
  findings: [
    { id: "FND-001", auditId: "AUD-001", type: "Minör Uygunsuzluk", clause: "A.6.5", description: "İşten ayrılan 2 personelin ERP erişimlerinin 30 gün boyunca kapatılmadığı tespit edildi.", status: "Açık", actionId: "ACT-001" },
    { id: "FND-002", auditId: "AUD-001", type: "Gözlem", clause: "A.8.13", description: "Yedekleme geri dönüş testlerinin kayıtları düzenli tutulmuyor.", status: "Açık", actionId: "" }
  ],
  actions: [
    { id: "ACT-001", source: "İç Denetim", title: "İşten çıkış sürecine erişim kapatma adımı eklenmesi", owner: "İK Müdürü", due: "2026-06-30", status: "Devam Ediyor", rootCause: "İşten çıkış kontrol listesinde BT bildirimi adımı yok.", activity: "Çıkış formu revize edildi, BT onay adımı eklendi. Deneme çalıştırması yapılacak." },
    { id: "ACT-002", source: "Risk Değerlendirme", title: "Ayrıcalıklı hesaplar için MFA zorunluluğu", owner: "Sistem Yöneticisi", due: "2026-07-15", status: "Açık", rootCause: "", activity: "" }
  ],
  documents: [
    { id: "DOC-001", code: "POL-BG-001", title: "Bilgi Güvenliği Politikası", type: "Politika", version: "3.0", status: "Yayında", owner: "Bilgi Güvenliği Sorumlusu", date: "2026-01-10" },
    { id: "DOC-002", code: "PRO-BG-004", title: "Erişim Kontrolü Prosedürü", type: "Prosedür", version: "2.1", status: "Revizyonda", owner: "BT Müdürü", date: "2025-11-02" },
    { id: "DOC-003", code: "PLN-BG-002", title: "İç Denetim Planı 2026", type: "Plan", version: "1.0", status: "Yayında", owner: "Bilgi Güvenliği Sorumlusu", date: "2026-01-20" },
    { id: "DOC-004", code: "POL-KV-001", title: "Kişisel Veri Saklama ve İmha Politikası", type: "Politika", version: "1.2", status: "Onayda", owner: "KVKK Sorumlusu", date: "2026-05-05" }
  ],
  kpis: [
    { id: "KPI-001", name: "Farkındalık eğitimi tamamlama oranı", unit: "%", target: 95, direction: "up", values: [ { period: "2026-Q1", value: 78 }, { period: "2026-Q2", value: 88 } ] },
    { id: "KPI-002", name: "Kritik açıklıkların ort. kapatma süresi", unit: "gün", target: 15, direction: "down", values: [ { period: "2026-Q1", value: 28 }, { period: "2026-Q2", value: 19 } ] },
    { id: "KPI-003", name: "Zamanında kapatılan DÖF oranı", unit: "%", target: 90, direction: "up", values: [ { period: "2026-Q1", value: 60 }, { period: "2026-Q2", value: 75 } ] }
  ],
  soaSeed: {
    iso27001: {
      "A.5.1": { applicable: true, status: "uygulandi", justification: "Politika yayında (POL-BG-001)" },
      "A.5.9": { applicable: true, status: "kismen", justification: "Varlık envanteri oluşturuldu, periyodik güncelleme süreci eksik" },
      "A.5.15": { applicable: true, status: "kismen", justification: "" },
      "A.6.3": { applicable: true, status: "planlandi", justification: "2026 eğitim planına alındı" },
      "A.6.5": { applicable: true, status: "uygulanmadi", justification: "İç denetim bulgusu mevcut (FND-001)" },
      "A.8.7": { applicable: true, status: "uygulandi", justification: "Merkezi EDR kullanılıyor" },
      "A.8.13": { applicable: true, status: "kismen", justification: "Yedekleme var, geri dönüş testleri düzensiz" },
      "A.8.4": { applicable: false, status: "uygulanmadi", justification: "Kurum içi yazılım geliştirme yapılmıyor" }
    },
    iso27701: {
      "A.7.2.1": { applicable: true, status: "uygulandi", justification: "VERBİS kaydı ve envanter mevcut" },
      "A.7.3.9": { applicable: true, status: "kismen", justification: "Başvuru formu var, SLA takibi eksik" },
      "A.7.4.7": { applicable: true, status: "planlandi", justification: "Saklama-imha politikası onay sürecinde (DOC-004)" }
    },
    iso42001: {
      "A.2.2": { applicable: true, status: "planlandi", justification: "YZ politikası taslak aşamasında" }
    }
  }
};

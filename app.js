// İstanbul Bölge Varsayılan Koordinatları
const DISTRICT_COORDS = {
  "Kadıköy": [40.9902, 29.0292],
  "Moda": [40.9840, 29.0270],
  "Karaköy": [41.0232, 28.9774],
  "Beyoğlu": [41.0335, 28.9778],
  "Beşiktaş": [41.0428, 29.0077],
  "Nişantaşı": [41.0515, 28.9922],
  "Balat": [41.0315, 28.9482],
  "Üsküdar": [41.0267, 29.0153],
  "Fatih": [41.0182, 28.9500],
  "Bebek": [41.0772, 29.0435],
  "Arnavutköy": [41.0673, 29.0438],
  "Sarıyer": [41.1664, 29.0502]
};

// Başlangıç için örnek popüler mekanlar
const DEFAULT_PLACES = [
  {
    id: "p1",
    name: "Çiya Sofrası",
    district: "Kadıköy",
    category: "Yemek",
    score: 9.5,
    addedBy: "Fırat",
    favorite: "Perde Pilavı, Kebaplar, Yöresel Ot Yemekleri",
    notes: "Anadolu mutfağının zirvesi. Rezervasyonsuz giderseniz biraz bekleyebilirsiniz ama değer.",
    lat: 40.9898,
    lng: 29.0255,
    createdAt: Date.now() - 500000
  },
  {
    id: "p2",
    name: "Montag Coffee",
    district: "Kadıköy",
    category: "Cafe",
    score: 9.0,
    addedBy: "Zeliha",
    favorite: "Filter Coffee (Etiyopya) & Flat White",
    notes: "Terasından Kadıköy çarşısını izleyip nitelikli kahve yudumlamak için ideal.",
    lat: 40.9912,
    lng: 29.0268,
    createdAt: Date.now() - 400000
  },
  {
    id: "p3",
    name: "Moda Çikolatacısı",
    district: "Moda",
    category: "Tatlı",
    score: 9.2,
    addedBy: "Zeliha",
    favorite: "Sıcak Çikolatalı Çilekli Kup",
    notes: "Akşamları önünde kuyruk olur, Moda sahil yürüyüşü öncesi harika durak.",
    lat: 40.9845,
    lng: 29.0285,
    createdAt: Date.now() - 300000
  },
  {
    id: "p4",
    name: "Basta! Street Food Bar",
    district: "Moda",
    category: "Sokak Lezzeti",
    score: 9.4,
    addedBy: "Fırat",
    favorite: "Kuzu Dürüm & Sütlaç",
    notes: "Şef dokunuşlu gurme dürümler, hızlı ve inanılmaz lezzetli.",
    lat: 40.9860,
    lng: 29.0260,
    createdAt: Date.now() - 200000
  },
  {
    id: "p5",
    name: "Karabatak Karaköy",
    district: "Karaköy",
    category: "Cafe",
    score: 8.8,
    addedBy: "Zeliha",
    favorite: "Cortado & Cheesecake",
    notes: "Karaköy'ün nostaljik sokak atmosferini yaşatan en ikonik kahvecilerden.",
    lat: 41.0250,
    lng: 28.9790,
    createdAt: Date.now() - 100000
  },
  {
    id: "p6",
    name: "Karaköy Güllüoğlu",
    district: "Karaköy",
    category: "Tatlı",
    score: 9.7,
    addedBy: "Fırat",
    favorite: "Fıstıklı Nadir Dolama & Havuç Dilimi",
    notes: "Taze ve sıcak servis. Yanına kaymak ve süt veya çay vazgeçilmez.",
    lat: 41.0238,
    lng: 28.9785,
    createdAt: Date.now() - 50000
  },
  {
    id: "p7",
    name: "Akali Beşiktaş",
    district: "Beşiktaş",
    category: "Yemek",
    score: 9.3,
    addedBy: "Fırat",
    favorite: "Double Cheese & Trüflü Patates",
    notes: "İstanbul'un en iyi gurme burgercilerinden biri. Sosları efsane.",
    lat: 41.0440,
    lng: 29.0030,
    createdAt: Date.now() - 25000
  }
];

// Uygulama Durumu (State)
let places = [];
let map = null;
let currentTileLayer = null;
let currentMapStyle = "voyager";
let markersLayer = null;
let routePolyline = null;
let currentTab = 'places'; // 'places' veya 'route'

// Harita Katman Stilleri (Retina Modern, Google Sokak, Google Uydu, Gece Haritası)
const MAP_TILE_STYLES = {
  voyager: {
    name: "Modern Harita",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &bull; CARTO",
    maxZoom: 20
  },
  google: {
    name: "Google Sokak Haritası",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=tr",
    attribution: "&copy; Google Haritalar",
    maxZoom: 20
  },
  satellite: {
    name: "Google Uydu & Sokak",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=tr",
    attribution: "&copy; Google Uydu",
    maxZoom: 20
  },
  dark: {
    name: "Karanlık Harita",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &bull; CARTO",
    maxZoom: 20
  }
};

// Kullanıcı Rozeti Oluşturucu (Fırat & Zeliha)
function getUserBadgeHtml(addedBy, compact = false) {
  const user = addedBy === "Zeliha" ? "Zeliha" : "Fırat";
  if (user === "Zeliha") {
    if (compact) {
      return `<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"><span class="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">Z</span><span>Zeliha</span></span>`;
    }
    return `
      <span class="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/70 flex items-center gap-1">
        <span class="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">Z</span>
        <span>Zeliha</span>
      </span>
    `;
  }
  if (compact) {
    return `<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"><span class="w-3.5 h-3.5 rounded-full bg-sky-600 text-white text-[9px] font-black flex items-center justify-center">F</span><span>Fırat</span></span>`;
  }
  return `
    <span class="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/70 flex items-center gap-1">
      <span class="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">F</span>
      <span>Fırat</span>
    </span>
  `;
}

// Modal İçinde Kullanıcı Seçimi (Fırat / Zeliha)
window.selectPlaceUser = function(userName) {
  const user = userName === "Zeliha" ? "Zeliha" : "Fırat";
  const input = document.getElementById("modalPlaceUser");
  if (input) input.value = user;
  localStorage.setItem("gezi_last_user", user);

  const firatBtn = document.getElementById("selectUserFiratBtn");
  const zelihaBtn = document.getElementById("selectUserZelihaBtn");
  const checkFirat = document.getElementById("checkUserFirat");
  const checkZeliha = document.getElementById("checkUserZeliha");

  if (firatBtn && zelihaBtn && checkFirat && checkZeliha) {
    if (user === "Fırat") {
      firatBtn.className = "p-2.5 rounded-2xl border-2 border-sky-500 bg-sky-500/10 flex items-center justify-between transition group cursor-pointer shadow-sm";
      checkFirat.className = "w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow-xs";
      zelihaBtn.className = "p-2.5 rounded-2xl border-2 theme-border theme-bg-surface hover:border-rose-400 flex items-center justify-between transition group cursor-pointer opacity-75 hover:opacity-100";
      checkZeliha.className = "w-5 h-5 rounded-full border theme-border text-transparent flex items-center justify-center text-xs font-bold";
    } else {
      zelihaBtn.className = "p-2.5 rounded-2xl border-2 border-rose-500 bg-rose-500/10 flex items-center justify-between transition group cursor-pointer shadow-sm";
      checkZeliha.className = "w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-xs";
      firatBtn.className = "p-2.5 rounded-2xl border-2 theme-border theme-bg-surface hover:border-sky-400 flex items-center justify-between transition group cursor-pointer opacity-75 hover:opacity-100";
      checkFirat.className = "w-5 h-5 rounded-full border theme-border text-transparent flex items-center justify-center text-xs font-bold";
    }
  }
};

// Kullanıcıya Göre Hızlı Filtreleme (Tümü / Fırat / Zeliha)
window.setUserFilter = function(userVal) {
  const input = document.getElementById("userFilter");
  if (input) input.value = userVal;

  const pillAll = document.getElementById("userPillAll");
  const pillFirat = document.getElementById("userPillFirat");
  const pillZeliha = document.getElementById("userPillZeliha");

  const activeClass = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-extrabold transition theme-bg-card theme-text-main shadow-sm flex items-center justify-center gap-1.5";
  const inactiveClass = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold theme-text-muted hover:theme-text-main transition flex items-center justify-center gap-1.5";

  if (pillAll) pillAll.className = userVal === "all" ? activeClass : inactiveClass;
  if (pillFirat) pillFirat.className = userVal === "Fırat" ? activeClass : inactiveClass;
  if (pillZeliha) pillZeliha.className = userVal === "Zeliha" ? activeClass : inactiveClass;

  const note = document.getElementById("activeMapFilterNote");
  if (note) {
    if (userVal === "Fırat") note.innerText = "Fırat'ın Eklediği Mekanlar";
    else if (userVal === "Zeliha") note.innerText = "Zeliha'nın Eklediği Mekanlar";
    else note.innerText = "Tüm Mekanlar";
  }

  renderPlaces();
};

// Gidilecek Yerler için Kullanıcı Hızlı Filtreleme
window.setSightsUserFilter = function(userVal) {
  const input = document.getElementById("sightsUserFilter");
  if (input) input.value = userVal;

  const pillAll = document.getElementById("sightsUserPillAll");
  const pillFirat = document.getElementById("sightsUserPillFirat");
  const pillZeliha = document.getElementById("sightsUserPillZeliha");

  const activeClass = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-extrabold transition theme-bg-card theme-text-main shadow-sm flex items-center justify-center gap-1.5";
  const inactiveClass = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold theme-text-muted hover:theme-text-main transition flex items-center justify-center gap-1.5";

  if (pillAll) pillAll.className = userVal === "all" ? activeClass : inactiveClass;
  if (pillFirat) pillFirat.className = userVal === "Fırat" ? activeClass : inactiveClass;
  if (pillZeliha) pillZeliha.className = userVal === "Zeliha" ? activeClass : inactiveClass;

  renderPlaces();
};

// Ziyaret Edildi / Gidilecek Durumunu Değiştir
window.togglePlaceVisited = function(id) {
  const p = places.find(x => x.id === id);
  if (!p) return;
  if (p.status === 'visited') {
    p.status = 'to_visit';
    showToast(`"${p.name}" tekrar Gidilecek Yerler listesine alındı! 📌`);
  } else {
    p.status = 'visited';
    showToast(`Tebrikler! "${p.name}" ziyaret edildi olarak işaretlendi! 🎉`);
  }
  savePlaces();
  renderPlaces();
};

// Başlatma
document.addEventListener("DOMContentLoaded", async () => {
  initIcons();
  initTheme();
  initGooglePlacesApi();
  initMap();
  setupEventListeners();
  await loadPlaces();
  renderDistrictDropdowns();
  renderPlaces();
  updateStats();
});

function initIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// -------------------------------------------------------------
// TEMA YÖNETİMİ (Zümrüt Yeşil & Mavi, Okyanus & Nane, Gece Modu)
// -------------------------------------------------------------
const THEMES = {
  emerald: {
    name: 'Zümrüt & Mavi',
    shortName: 'Zümrüt',
    color: '#059669',
    icon: 'palette'
  },
  ocean: {
    name: 'Okyanus & Nane',
    shortName: 'Okyanus',
    color: '#0284c7',
    icon: 'waves'
  },
  dark: {
    name: 'Gece Modu',
    shortName: 'Gece',
    color: '#0f172a',
    icon: 'moon'
  }
};

window.toggleThemeDropdown = function(event) {
  if (event) {
    event.stopPropagation();
  }
  const dropdown = document.getElementById("themeDropdown");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
};

window.toggleDarkMode = function(event) {
  if (event) {
    event.stopPropagation();
  }
  const current = localStorage.getItem("gezi_theme") || "emerald";
  if (current === "dark") {
    window.setAppTheme("emerald");
  } else {
    window.setAppTheme("dark");
  }
};

function initTheme() {
  const savedTheme = localStorage.getItem("gezi_theme") || "emerald";
  window.setAppTheme(savedTheme, false);

  // Dışarı tıklandığında tema menüsünü kapat
  document.addEventListener("click", (e) => {
    const toggleBtn = document.getElementById("themeToggleBtn");
    const dropdown = document.getElementById("themeDropdown");
    if (dropdown && !dropdown.classList.contains("hidden")) {
      if (toggleBtn && (toggleBtn === e.target || toggleBtn.contains(e.target))) {
        return;
      }
      if (dropdown.contains(e.target)) {
        return;
      }
      dropdown.classList.add("hidden");
    }
  });
}

window.setAppTheme = function(themeName, notify = true) {
  if (!THEMES[themeName]) themeName = 'emerald';
  const theme = THEMES[themeName];

  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('gezi_theme', themeName);

  // Meta theme-color güncelle (Mobil tarayıcı adres çubuğu için)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.color);
  }

  // Header display güncelle
  const nameDisplay = document.getElementById("themeNameDisplay");
  if (nameDisplay) nameDisplay.innerText = theme.shortName;

  // İkonları Lucide SVG uyumlu güvenli güncelle
  const iconContainer = document.getElementById("themeIconContainer");
  if (iconContainer) {
    let iconColor = "text-emerald-500";
    if (themeName === 'ocean') iconColor = "text-sky-500";
    else if (themeName === 'dark') iconColor = "text-amber-400";
    iconContainer.innerHTML = `<i data-lucide="${theme.icon}" class="w-4 h-4 ${iconColor}"></i>`;
  }

  const darkIconContainer = document.getElementById("quickDarkIconContainer");
  if (darkIconContainer) {
    if (themeName === 'dark') {
      darkIconContainer.innerHTML = `<i data-lucide="sun" class="w-4 h-4 text-amber-400"></i>`;
    } else {
      darkIconContainer.innerHTML = `<i data-lucide="moon" class="w-4 h-4 text-slate-700"></i>`;
    }
  }

  // Dropdown'ı kapat
  const dropdown = document.getElementById("themeDropdown");
  if (dropdown) dropdown.classList.add("hidden");

  // Harita stilini gece/gündüz temasıyla uyumlu güncelle
  if (map && currentMapStyle !== "satellite") {
    if (themeName === "dark" && currentMapStyle !== "dark") {
      window.setMapTileStyle("dark", false);
    } else if (themeName !== "dark" && currentMapStyle === "dark") {
      const savedMapStyle = localStorage.getItem("gezi_map_style") || "voyager";
      window.setMapTileStyle(savedMapStyle === "dark" ? "voyager" : savedMapStyle, false);
    }
  }

  initIcons();

  if (map) {
    map.invalidateSize();
  }

  if (notify) {
    showToast(`${theme.name} teması seçildi! ✨`);
  }
};

// -------------------------------------------------------------
// ÇOK KATMANLI KALICI HAFIZA MOTORU (Disk JSON + IndexedDB + LocalStorage)
// Mekanların silinmesini, tarayıcı önbellek temizliğini ve 5MB sınırını engeller
// -------------------------------------------------------------
const DB_NAME = "IstanbulGeziDB";
const DB_VERSION = 1;
const STORE_NAME = "places_store";

function openDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => {
        console.warn("IndexedDB açılamadı:", e);
        resolve(null);
      };
    } catch (err) {
      console.warn("IndexedDB istisnası:", err);
      resolve(null);
    }
  });
}

async function idbSaveAllPlaces(placesArray) {
  if (!Array.isArray(placesArray)) return false;
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      placesArray.forEach(p => store.put(p));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn("IndexedDB kaydetme hatası:", err);
    return false;
  }
}

async function idbLoadAllPlaces() {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn("IndexedDB okuma hatası:", err);
    return null;
  }
}

// Silinen mekanların ID listesini kalıcı tut (Silinenlerin tekrar hortlamasını engeller)
function getDeletedPlaceIds() {
  try {
    const raw = localStorage.getItem("gezi_deleted_ids");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (_) {}
  return new Set();
}

function markPlaceDeleted(id) {
  const set = getDeletedPlaceIds();
  set.add(id);
  try {
    localStorage.setItem("gezi_deleted_ids", JSON.stringify([...set]));
  } catch (_) {}
}

// Tarayıcıdan kalıcı saklama izni iste (Otomatik önbellek temizliğini ve silinmeyi önler)
async function requestPersistentStorage() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log("Kalıcı depolama koruması:", isPersisted ? "Aktif (Kalıcı)" : "Varsayılan");
    }
  } catch (e) {
    console.warn("Kalıcı depolama isteği yapılamadı:", e);
  }
}

// -------------------------------------------------------------
// YEREL PYTHON SUNUCUSU / DİSK BAĞLANTISI (places_data.json)
// -------------------------------------------------------------
const SERVER_URLS = [
  (window.location.protocol.startsWith('http') ? '/api/places' : 'http://127.0.0.1:5000/api/places'),
  'http://localhost:5000/api/places'
];

function updateStorageBanner(serverOnline = false) {
  const banner = document.getElementById("storageBanner");
  const bannerText = document.getElementById("storageBannerText");
  if (!banner || !bannerText) return;

  if (serverOnline) {
    banner.className = "bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200/60 dark:border-emerald-800/60 px-4 py-2 text-xs transition";
    bannerText.innerHTML = `💾 <strong>Kalıcı Disk Depolama Aktif:</strong> Mekanlarınız bilgisayarınızda <code class="bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded font-mono text-[11px]">places_data.json</code> dosyasına ve IndexedDB veritabanına doğrudan kaydediliyor.`;
  } else {
    banner.className = "bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200/60 dark:border-amber-800/60 px-4 py-2 text-xs transition";
    bannerText.innerHTML = `⚡ <strong>Tarayıcı Depolaması Aktif:</strong> Mekanlarınız tarayıcınızda korunuyor. Doğrudan sabit diske (<code class="bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded font-mono text-[11px]">places_data.json</code>) kaydetmek için klasördeki <strong class="text-amber-800 dark:text-amber-200">GeziRehberi.bat</strong> dosyasına çift tıklayarak başlatabilirsiniz.`;
  }
}

async function fetchPlacesFromServer() {
  for (const url of SERVER_URLS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          updateStorageBanner(true);
          return data;
        }
      }
    } catch (_) {}
  }
  updateStorageBanner(false);
  return null;
}

let pendingSyncPlaces = null;
let isSyncingToServer = false;

async function syncPlacesToServer(placesArray) {
  if (!Array.isArray(placesArray) || placesArray.length === 0) return false;
  pendingSyncPlaces = placesArray;
  if (isSyncingToServer) return true;
  isSyncingToServer = true;

  while (pendingSyncPlaces) {
    const toSend = pendingSyncPlaces;
    pendingSyncPlaces = null;
    let success = false;

    for (const url of SERVER_URLS) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(toSend),
          signal: controller.signal
        });
        clearTimeout(timer);
        if (res.ok) {
          updateStorageBanner(true);
          success = true;
          break;
        }
      } catch (_) {}
    }

    if (!success) {
      updateStorageBanner(false);
      break;
    }
  }

  isSyncingToServer = false;
  return true;
}

let isStorageLoaded = false;

// Kalıcı Hafızadan Yükleme İşlemi (Çoklu Güvenlik Korumalı)
async function loadPlaces() {
  await requestPersistentStorage();

  // 1. Önce sunucudan (places_data.json) oku
  const serverPlaces = await fetchPlacesFromServer();

  // 2. IndexedDB kalıcı veritabanından oku
  const idbPlaces = await idbLoadAllPlaces();

  const deletedIds = getDeletedPlaceIds();

  // 3. Yerel depolamayı (localStorage & backup & session) oku
  let localData = null;
  try {
    const raw = localStorage.getItem("istanbul_gezi_places");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) localData = parsed;
    }
  } catch (_) {}

  if (!localData) {
    try {
      const backupRaw = localStorage.getItem("istanbul_gezi_places_backup");
      if (backupRaw) {
        const parsedBackup = JSON.parse(backupRaw);
        if (Array.isArray(parsedBackup)) localData = parsedBackup;
      }
    } catch (_) {}
  }

  if (!localData) {
    try {
      const sessRaw = sessionStorage.getItem("istanbul_gezi_places_session");
      if (sessRaw) {
        const parsedSess = JSON.parse(sessRaw);
        if (Array.isArray(parsedSess)) localData = parsedSess;
      }
    } catch (_) {}
  }

  // En güvenilir ana kaynağı belirle
  let resolved = null;
  if (serverPlaces && Array.isArray(serverPlaces) && serverPlaces.length > 0) {
    resolved = [...serverPlaces];
    console.log("Mekanlar sabit diskteki places_data.json dosyasından yüklendi! 💾", resolved.length);
  } else if (idbPlaces && Array.isArray(idbPlaces) && idbPlaces.length > 0) {
    resolved = [...idbPlaces];
    console.log("Mekanlar IndexedDB veritabanından yüklendi! 🚀", resolved.length);
  } else if (localData && Array.isArray(localData) && localData.length > 0) {
    resolved = [...localData];
    console.log("Mekanlar localStorage hafızasından yüklendi! 📦", resolved.length);
  }

  // Akıllı Birleştirme: Ek mekanları asla kaybetmeden birleştir, ANCAK silinmiş olanları ASLA ekleme!
  if (resolved && Array.isArray(resolved)) {
    const existingIds = new Set(resolved.map(p => p.id));
    const allCandidates = [...(serverPlaces || []), ...(idbPlaces || []), ...(localData || [])];
    allCandidates.forEach(cand => {
      if (cand && cand.id && !existingIds.has(cand.id) && !deletedIds.has(cand.id)) {
        resolved.push(cand);
        existingIds.add(cand.id);
      }
    });
  }

  // Silinen mekanları resolved listesinden de kesinlikle filtrele
  if (resolved && Array.isArray(resolved)) {
    resolved = resolved.filter(p => p && p.id && !deletedIds.has(p.id));
  }

  // İlk ziyaret kontrolü:
  // Kullanıcı daha önce siteyi açmışsa, boş liste olsa bile (tüm mekanları bilerek sildiyse)
  // varsayılan mekanları ZORLA geri getirme!
  const wasInitialized = localStorage.getItem("gezi_initialized") === "true";

  if (!wasInitialized && (!resolved || resolved.length === 0)) {
    // Sadece siteyi hayatında ilk defa açan kullanıcıya (silinmemiş olan) başlangıç mekanlarını ata
    resolved = DEFAULT_PLACES.filter(dp => !deletedIds.has(dp.id));
  } else if (!resolved) {
    resolved = [];
  }

  try {
    localStorage.setItem("gezi_initialized", "true");
  } catch (_) {}

  // Fırat ve Zeliha kullanıcı rozetlerini güvenceye al
  const defaultUserMap = {};
  DEFAULT_PLACES.forEach(dp => { defaultUserMap[dp.id] = dp.addedBy; });
  places = resolved.map(p => ({
    ...p,
    addedBy: p.addedBy || defaultUserMap[p.id] || "Fırat"
  }));

  isStorageLoaded = true;

  // Tüm katmanları senkronize et
  savePlaces();
}

function savePlaces() {
  if (!isStorageLoaded) return;

  updateStats();
  renderDistrictDropdowns();

  // 1. Sabit diske (places_data.json) yaz
  syncPlacesToServer(places);

  // 2. IndexedDB kalıcı veritabanına yaz (boş liste olsa bile silinmiş durum kalıcı işlensin)
  idbSaveAllPlaces(places);

  // 3. localStorage ve güvenlik yedek anahtarına yaz
  try {
    const dataStr = JSON.stringify(places);
    localStorage.setItem("istanbul_gezi_places", dataStr);
    localStorage.setItem("istanbul_gezi_places_backup", dataStr);
  } catch (e) {
    console.warn("localStorage kotası aşıldı, hafifletilmiş yedekleme yapılıyor:", e);
    try {
      const lightPlaces = places.map(p => {
        if (p.image && p.image.length > 40000) {
          const { image, ...rest } = p;
          return { ...rest, hasImage: true };
        }
        return p;
      });
      const lightStr = JSON.stringify(lightPlaces);
      localStorage.setItem("istanbul_gezi_places", lightStr);
      localStorage.setItem("istanbul_gezi_places_backup", lightStr);
    } catch (_) {}
  }

  try {
    sessionStorage.setItem("istanbul_gezi_places_session", JSON.stringify(places));
  } catch (_) {}
}

// Harita Başlatma
function initMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // İstanbul merkezli başlat
  map = L.map("map", {
    center: [41.0082, 28.9784],
    zoom: 12,
    zoomControl: true
  });

  // Başlangıç harita katmanı (Karanlık moddaysa dark, değilse kaydedilen stil veya voyager)
  const activeTheme = localStorage.getItem("gezi_theme") || "emerald";
  const savedStyle = localStorage.getItem("gezi_map_style") || "voyager";
  const initialStyle = activeTheme === "dark" && savedStyle !== "satellite" ? "dark" : savedStyle;

  window.setMapTileStyle(initialStyle, false);

  markersLayer = L.layerGroup().addTo(map);

  // Render tamamlandığında Leaflet harita boyutunu tazele
  setTimeout(() => {
    map.invalidateSize();
  }, 200);

  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });

  updateMapMarkers(places);
}

// Harita Katman Stili Değiştirici (Modern / Sokak / Uydu / Karanlık)
window.setMapTileStyle = function(styleKey, notify = true) {
  if (!MAP_TILE_STYLES[styleKey]) styleKey = "voyager";
  currentMapStyle = styleKey;
  if (styleKey !== "dark") {
    localStorage.setItem("gezi_map_style", styleKey);
  }

  if (map) {
    if (currentTileLayer) {
      map.removeLayer(currentTileLayer);
    }
    const cfg = MAP_TILE_STYLES[styleKey];
    currentTileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom
    }).addTo(map);
  }

  // Buton aktiflik görünümlerini güncelle
  const btnIds = {
    voyager: "mapStyleVoyager",
    google: "mapStyleGoogle",
    satellite: "mapStyleSatellite",
    dark: "mapStyleDark"
  };

  Object.entries(btnIds).forEach(([key, id]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    if (key === styleKey) {
      btn.className = "px-2.5 py-1 rounded-lg transition bg-emerald-600 text-white shadow-xs flex items-center gap-1";
    } else {
      btn.className = "px-2.5 py-1 rounded-lg transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1";
    }
  });

  if (notify) {
    showToast(`${MAP_TILE_STYLES[styleKey].name} görünümü aktif! 🗺️`);
  }
};

// Haritayı Tam Ekran Yap / Küçült
window.toggleMapFullscreen = function() {
  const wrapper = document.getElementById("mapCardWrapper");
  const btn = document.getElementById("fullscreenMapBtn");
  if (!wrapper) return;

  const isFull = wrapper.classList.toggle("map-fullscreen-active");
  if (btn) {
    btn.innerHTML = isFull
      ? `<i data-lucide="minimize-2" class="w-3.5 h-3.5 text-emerald-600"></i>`
      : `<i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>`;
  }
  initIcons();
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 200);
};

// Harita Pinleri Güncelleme (Modern Kapsül Pinler + Kullanıcı Rozeti)
function updateMapMarkers(placesToShow) {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  if (!placesToShow || placesToShow.length === 0) return;

  const latlngs = [];

  placesToShow.forEach((place) => {
    if (!place.lat || !place.lng) return;

    const latlng = [place.lat, place.lng];
    latlngs.push(latlng);

    // Kategori ikonu
    let catIcon = "🍽️";
    if (place.category === 'Gezilecek Yer') catIcon = "🏛️";
    else if (place.category === 'Cafe') catIcon = "☕";
    else if (place.category === 'Tatlı') catIcon = "🍰";
    else if (place.category === 'Sokak Lezzeti') catIcon = "🌯";
    else if (place.category === 'Meyhane / Bar') catIcon = "🍸";

    // Puan rengi
    let bgGradient = "linear-gradient(135deg, #059669 0%, #0d9488 100%)";
    if (place.score < 7.5) bgGradient = "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)";
    else if (place.score < 9.0) bgGradient = "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)";

    // Kullanıcı baş harfi rozeti (F / Z)
    const userInitial = place.addedBy === "Zeliha" ? "Z" : "F";
    const userDotColor = place.addedBy === "Zeliha" ? "#f43f5e" : "#0284c7";

    const customIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div class="map-pin-capsule" style="background: ${bgGradient};">
          <span style="font-size: 12px; line-height: 1;">${catIcon}</span>
          <span>${Number(place.score).toFixed(1)}</span>
          <span style="background: ${userDotColor}; width: 15px; height: 15px; border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; border: 1.5px solid #fff; margin-left: 1px;">${userInitial}</span>
        </div>
      `,
      iconSize: [74, 34],
      iconAnchor: [37, 34],
      popupAnchor: [0, -34]
    });

    const marker = L.marker(latlng, { icon: customIcon });

    const popupImg = place.image ? `<img src="${place.image}" alt="${escapeHtml(place.name)}" class="w-full h-28 object-cover rounded-xl mb-2" />` : '';
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

    const popupHtml = `
      <div class="p-3 min-w-[225px] max-w-[260px] theme-bg-card theme-text-main">
        ${popupImg}
        <div class="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
          <div class="flex items-center gap-1">
            <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200/50">📍 ${escapeHtml(place.district)}</span>
            ${getUserBadgeHtml(place.addedBy, true)}
          </div>
          <span class="text-[11px] font-black text-white bg-emerald-600 px-2 py-0.5 rounded-lg shadow-xs">★ ${Number(place.score).toFixed(1)}</span>
        </div>
        <h4 class="font-extrabold theme-text-main text-sm mb-0.5 leading-snug">${escapeHtml(place.name)}</h4>
        <p class="text-[11px] theme-text-muted mb-2">${catIcon} ${escapeHtml(place.category)}</p>
        ${place.favorite ? `<p class="text-[11px] theme-text-main theme-bg-surface p-2 rounded-xl mb-2.5 border theme-border font-medium"><strong>🌟 Favori:</strong> ${escapeHtml(place.favorite)}</p>` : ''}
        <div class="grid grid-cols-2 gap-1.5">
          <button onclick="window.focusPlaceCard('${place.id}')" class="text-center text-[11px] py-1.5 theme-bg-surface hover:opacity-85 theme-text-main font-bold rounded-xl transition border theme-border">
            Detayları Gör
          </button>
          <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="text-center text-[11px] py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1" style="color: #fff !important; text-decoration: none;">
            <span>Yol Tarifi</span>
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    markersLayer.addLayer(marker);
  });

  if (latlngs.length > 0) {
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
  }
}

// İstatistikleri güncelleme
function updateStats() {
  const foodPlaces = places.filter(p => p.category !== 'Gezilecek Yer');
  const sightsPlaces = places.filter(p => p.category === 'Gezilecek Yer' || p.status === 'to_visit');

  const badge = document.getElementById("placesCountBadge");
  if (badge) badge.innerText = foodPlaces.length;

  const sightsBadge = document.getElementById("sightsCountBadgeDesktop");
  if (sightsBadge) sightsBadge.innerText = sightsPlaces.length;
  
  const mBadge = document.getElementById("mobileCountDisplay");
  if (mBadge) mBadge.innerText = `${places.length} Mekan & Yer`;

  // Mekanlar sekmesi Fırat / Zeliha sayıları
  const foodFiratCount = foodPlaces.filter(p => (p.addedBy || "Fırat") === "Fırat").length;
  const foodZelihaCount = foodPlaces.filter(p => p.addedBy === "Zeliha").length;

  const pillFirat = document.getElementById("userPillFirat");
  if (pillFirat) {
    pillFirat.innerHTML = `<span class="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-black flex items-center justify-center">F</span><span>Fırat (${foodFiratCount})</span>`;
  }
  const pillZeliha = document.getElementById("userPillZeliha");
  if (pillZeliha) {
    pillZeliha.innerHTML = `<span class="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">Z</span><span>Zeliha (${foodZelihaCount})</span>`;
  }

  // Gidilecek Yerler sekmesi Fırat / Zeliha sayıları
  const sightsFiratCount = sightsPlaces.filter(p => (p.addedBy || "Fırat") === "Fırat").length;
  const sightsZelihaCount = sightsPlaces.filter(p => p.addedBy === "Zeliha").length;

  const sPillFirat = document.getElementById("sightsUserPillFirat");
  if (sPillFirat) {
    sPillFirat.innerHTML = `<span class="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-black flex items-center justify-center">F</span><span>Fırat (${sightsFiratCount})</span>`;
  }
  const sPillZeliha = document.getElementById("sightsUserPillZeliha");
  if (sPillZeliha) {
    sPillZeliha.innerHTML = `<span class="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">Z</span><span>Zeliha (${sightsZelihaCount})</span>`;
  }

  const avgDisplay = document.getElementById("avgScoreDisplay");
  if (avgDisplay) {
    if (places.length === 0) {
      avgDisplay.innerHTML = `<i data-lucide="star" class="w-3.5 h-3.5 fill-amber-500 text-amber-500"></i> - / 10`;
    } else {
      const sum = places.reduce((acc, p) => acc + Number(p.score || 0), 0);
      const avg = (sum / places.length).toFixed(1);
      avgDisplay.innerHTML = `<i data-lucide="star" class="w-3.5 h-3.5 fill-amber-500 text-amber-500"></i> ${avg} / 10`;
    }
  }
  initIcons();
}

// Filtreler: Gurme / Lezzet Mekanları (Yemek, Cafe, Tatlı vb.)
function getFilteredFoodPlaces() {
  const searchInput = document.getElementById("searchInput");
  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const districtSelect = document.getElementById("districtFilter");
  const district = districtSelect ? districtSelect.value : "all";
  const categorySelect = document.getElementById("categoryFilter");
  const category = categorySelect ? categorySelect.value : "all";
  const sortSelect = document.getElementById("sortFilter");
  const sort = sortSelect ? sortSelect.value : "score-desc";
  const userFilterEl = document.getElementById("userFilter");
  const userFilter = userFilterEl ? userFilterEl.value : "all";

  // Gezilecek yerler harici tüm gurme mekanları filtrele
  let filtered = places.filter(p => {
    // Kategori filtrelemesi: Eğer kullanıcı özellikle 'Gezilecek Yer' seçmediyse gurme mekanlar görünür
    if (category === 'all') {
      if (p.category === 'Gezilecek Yer') return false;
    } else if (p.category !== category) {
      return false;
    }

    const placeUser = p.addedBy === "Zeliha" ? "Zeliha" : "Fırat";
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search) ||
      (p.favorite && p.favorite.toLowerCase().includes(search)) ||
      (p.notes && p.notes.toLowerCase().includes(search)) ||
      p.district.toLowerCase().includes(search) ||
      placeUser.toLowerCase().includes(search);
      
    const matchesDistrict = (district === 'all') || (p.district.toLowerCase() === district.toLowerCase());
    const matchesUser = (userFilter === 'all') || (placeUser === userFilter);

    return matchesSearch && matchesDistrict && matchesUser;
  });

  // Sıralama
  filtered.sort((a, b) => {
    if (sort === "score-desc") return b.score - a.score;
    if (sort === "score-asc") return a.score - b.score;
    if (sort === "name-asc") return a.name.localeCompare(b.name, 'tr');
    if (sort === "date-desc") return (b.createdAt || 0) - (a.createdAt || 0);
    return 0;
  });

  return filtered;
}

// Filtreler: Gidilecek & Gezilecek Yerler (Tarihi Yer, Müze, Manzara, Gitmek İstenen Yerler)
function getFilteredSightsPlaces() {
  const searchInput = document.getElementById("sightsSearchInput");
  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const districtSelect = document.getElementById("sightsDistrictFilter");
  const district = districtSelect ? districtSelect.value : "all";
  const sortSelect = document.getElementById("sightsSortFilter");
  const sort = sortSelect ? sortSelect.value : "score-desc";
  const userFilterEl = document.getElementById("sightsUserFilter");
  const userFilter = userFilterEl ? userFilterEl.value : "all";

  // Gezilecek Yer kategorisindeki veya to_visit statüsündeki mekanlar
  let filtered = places.filter(p => {
    const isSight = p.category === 'Gezilecek Yer' || p.status === 'to_visit';
    if (!isSight) return false;

    const placeUser = p.addedBy === "Zeliha" ? "Zeliha" : "Fırat";
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search) ||
      (p.favorite && p.favorite.toLowerCase().includes(search)) ||
      (p.notes && p.notes.toLowerCase().includes(search)) ||
      p.district.toLowerCase().includes(search) ||
      placeUser.toLowerCase().includes(search);
      
    const matchesDistrict = (district === 'all') || (p.district.toLowerCase() === district.toLowerCase());
    const matchesUser = (userFilter === 'all') || (placeUser === userFilter);

    return matchesSearch && matchesDistrict && matchesUser;
  });

  // Sıralama
  filtered.sort((a, b) => {
    if (sort === "score-desc") return b.score - a.score;
    if (sort === "score-asc") return a.score - b.score;
    if (sort === "name-asc") return a.name.localeCompare(b.name, 'tr');
    if (sort === "date-desc") return (b.createdAt || 0) - (a.createdAt || 0);
    return 0;
  });

  return filtered;
}

// Aktif sekmeye göre filtrelenmiş mekanlar
function getFilteredPlaces() {
  if (currentTab === 'sights') {
    return getFilteredSightsPlaces();
  }
  return getFilteredFoodPlaces();
}

// Mekan Kartı HTML Üretici
function createPlaceCard(place) {
  const card = document.createElement("div");
  card.id = `card-${place.id}`;
  card.className = "theme-bg-card rounded-3xl border theme-border p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5";

  const isSight = place.category === 'Gezilecek Yer' || place.status === 'to_visit';

  // Kategoriye göre ikon/etiket
  let catBadgeColor = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80";
  let catIcon = "🍽️";
  if (place.category === 'Gezilecek Yer') { 
    catBadgeColor = "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80"; 
    catIcon = "🏛️"; 
  } else if (place.category === 'Cafe') { 
    catBadgeColor = "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/80"; 
    catIcon = "☕"; 
  } else if (place.category === 'Tatlı') { 
    catBadgeColor = "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80"; 
    catIcon = "🍰"; 
  } else if (place.category === 'Sokak Lezzeti') { 
    catBadgeColor = "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80"; 
    catIcon = "🌯"; 
  } else if (place.category === 'Meyhane / Bar') { 
    catBadgeColor = "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80"; 
    catIcon = "🍸"; 
  }

  // Ziyaret Durumu Rozeti
  let statusBadgeHtml = "";
  if (isSight) {
    if (place.status === 'visited') {
      statusBadgeHtml = `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">✓ Gidildi</span>`;
    } else {
      statusBadgeHtml = `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">📌 Gidilecek</span>`;
    }
  }

  // Skor rozeti (Mavi & Yeşil Paleti)
  let scoreBadgeColor = "bg-emerald-600 text-white shadow-emerald-500/25";
  if (place.score < 7.5) scoreBadgeColor = "bg-rose-500 text-white shadow-rose-500/25";
  else if (place.score < 9.0) scoreBadgeColor = "bg-sky-600 text-white shadow-sky-500/25";

  // Google Maps Yol Tarifi linki
  const gmapsUrl = place.lat && place.lng 
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}` 
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.district + ' İstanbul')}`;

  // Mekan Fotoğrafı HTML (Varsa şık kapak banner'ı)
  const imageHtml = place.image ? `
    <div class="relative w-full h-36 rounded-2xl overflow-hidden mb-3 border theme-border shadow-inner group-hover:scale-[1.01] transition duration-300">
      <img src="${place.image}" alt="${escapeHtml(place.name)}" class="w-full h-full object-cover" loading="lazy" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
    </div>
  ` : '';

  // Ziyaret toggle butonu (Gidilecek yerler için)
  const visitedActionBtn = isSight ? `
    <button onclick="window.togglePlaceVisited('${place.id}')" class="text-xs ${place.status === 'visited' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/50 dark:border-emerald-800/50' : 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200/50 dark:border-sky-800/50'} hover:opacity-85 font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition border" title="Ziyaret durumunu değiştir">
      <i data-lucide="${place.status === 'visited' ? 'check-circle-2' : 'check'}" class="w-3.5 h-3.5"></i>
      <span>${place.status === 'visited' ? 'Gittim ✓' : 'Gittim'}</span>
    </button>
  ` : '';

  card.innerHTML = `
    <div>
      ${imageHtml}
      <div class="flex items-start justify-between gap-3 mb-2.5">
        <div class="space-y-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${catBadgeColor} flex items-center gap-1">
              <span>${catIcon}</span>
              <span>${escapeHtml(place.category)}</span>
            </span>
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-lg theme-bg-surface theme-text-muted border theme-border">
              📍 ${escapeHtml(place.district)}
            </span>
            ${getUserBadgeHtml(place.addedBy)}
            ${statusBadgeHtml}
          </div>
          <h3 class="text-base font-extrabold theme-text-main group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition leading-snug">${escapeHtml(place.name)}</h3>
        </div>
        
        <div class="flex flex-col items-end shrink-0">
          <div class="px-2.5 py-1 rounded-xl text-xs font-black shadow-md flex items-center gap-1 ${scoreBadgeColor}">
            <i data-lucide="star" class="w-3 h-3 fill-white"></i>
            <span>${Number(place.score).toFixed(1)}</span>
          </div>
        </div>
      </div>

      ${place.favorite ? `
        <div class="mt-2.5 text-xs theme-bg-surface border theme-border p-2.5 rounded-xl">
          <div class="flex items-center gap-1 text-[11px] font-bold ${isSight ? 'text-sky-600 dark:text-sky-400' : 'text-emerald-600 dark:text-emerald-400'} mb-0.5">
            <i data-lucide="sparkles" class="w-3 h-3 ${isSight ? 'text-sky-500' : 'text-emerald-500'}"></i>
            <span>${isSight ? 'Önemli Nokta / İpucu:' : 'Favori / Meşhur:'}</span>
          </div>
          <span class="theme-text-main font-medium">${escapeHtml(place.favorite)}</span>
        </div>
      ` : ''}

      ${place.notes ? `
        <p class="mt-2.5 text-xs theme-text-muted italic line-clamp-2 theme-bg-surface/60 p-2 rounded-xl border theme-border">
          "${escapeHtml(place.notes)}"
        </p>
      ` : ''}
    </div>

    <div class="mt-4 pt-3 border-t theme-border flex items-center justify-between text-xs gap-1 flex-wrap">
      <div class="flex items-center gap-1.5 flex-wrap">
        <button onclick="window.zoomToPlace('${place.id}')" class="text-emerald-600 dark:text-emerald-400 hover:opacity-85 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-xl transition border border-emerald-200/50 dark:border-emerald-800/50">
          <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
          <span>Haritada</span>
        </button>
        <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="theme-text-muted hover:theme-text-main font-semibold flex items-center gap-1 theme-bg-surface hover:opacity-85 px-2.5 py-1.5 rounded-xl transition border theme-border" title="Google Haritalar ile Yol Tarifi Al">
          <i data-lucide="navigation" class="w-3.5 h-3.5 text-sky-500"></i>
          <span class="hidden sm:inline">Git</span>
        </a>
        ${visitedActionBtn}
      </div>
      
      <div class="flex items-center gap-1 ml-auto">
        <button onclick="window.editPlace('${place.id}')" class="p-2 theme-text-muted hover:theme-text-main hover:theme-bg-surface rounded-xl transition" title="Düzenle">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="window.deletePlace('${place.id}')" class="p-2 theme-text-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition" title="Sil">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;

  return card;
}

// Mekanları Ekrana Basma (Gurme Mekanlar & Gidilecek Yerler Bağımsız Listelenir)
function renderPlaces() {
  // 1. LEZZET & GURME MEKANLARI LİSTESİ
  const foodPlacesContainer = document.getElementById("foodPlacesContainer");
  const foodPlacesList = document.getElementById("foodPlacesList");
  const foodsCountBadge = document.getElementById("foodsCountBadge");
  const emptyState = document.getElementById("emptyState");
  const placesCountBadge = document.getElementById("placesCountBadge");

  const foodPlaces = getFilteredFoodPlaces();

  if (foodsCountBadge) foodsCountBadge.innerText = `${foodPlaces.length} Mekan`;
  if (placesCountBadge) placesCountBadge.innerText = foodPlaces.length;

  if (foodPlacesList) {
    if (foodPlaces.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      if (foodPlacesContainer) foodPlacesContainer.classList.add("hidden");
      foodPlacesList.innerHTML = "";
    } else {
      if (emptyState) emptyState.classList.add("hidden");
      if (foodPlacesContainer) foodPlacesContainer.classList.remove("hidden");
      foodPlacesList.innerHTML = "";
      foodPlaces.forEach(place => {
        foodPlacesList.appendChild(createPlaceCard(place));
      });
    }
  }

  // 2. GİDİLECEK & GEZİLECEK YERLER LİSTESİ (AYRI TAB & AYRI LİSTE)
  const sightsDedicatedContainer = document.getElementById("sightsDedicatedContainer");
  const sightsDedicatedList = document.getElementById("sightsDedicatedList");
  const sightsDedicatedCountBadge = document.getElementById("sightsDedicatedCountBadge");
  const sightsEmptyState = document.getElementById("sightsEmptyState");
  const sightsCountBadgeDesktop = document.getElementById("sightsCountBadgeDesktop");

  const sights = getFilteredSightsPlaces();

  if (sightsDedicatedCountBadge) sightsDedicatedCountBadge.innerText = `${sights.length} Yer`;
  if (sightsCountBadgeDesktop) sightsCountBadgeDesktop.innerText = sights.length;

  if (sightsDedicatedList) {
    if (sights.length === 0) {
      if (sightsEmptyState) sightsEmptyState.classList.remove("hidden");
      if (sightsDedicatedContainer) sightsDedicatedContainer.classList.add("hidden");
      sightsDedicatedList.innerHTML = "";
    } else {
      if (sightsEmptyState) sightsEmptyState.classList.add("hidden");
      if (sightsDedicatedContainer) sightsDedicatedContainer.classList.remove("hidden");
      sightsDedicatedList.innerHTML = "";
      sights.forEach(place => {
        sightsDedicatedList.appendChild(createPlaceCard(place));
      });
    }
  }

  // 3. Harita Pinlerini Aktif Görünüme Göre Güncelle
  if (currentTab === 'sights') {
    updateMapMarkers(sights);
  } else if (currentTab === 'places') {
    updateMapMarkers(foodPlaces);
  } else {
    updateMapMarkers(places);
  }

  initIcons();
}

// İlçe Seçenekleri Doldur (Mekanlar, Gidilecek Yerler ve Rota İçin)
function renderDistrictDropdowns() {
  const districtFilter = document.getElementById("districtFilter");
  const sightsDistrictFilter = document.getElementById("sightsDistrictFilter");
  const routeDistrict = document.getElementById("routeDistrictSelect");

  const uniqueDistricts = [...new Set(places.map(p => p.district))].filter(Boolean).sort((a,b) => a.localeCompare(b, 'tr'));

  // Lezzet mekanları filtre select
  if (districtFilter) {
    const currentVal = districtFilter.value;
    districtFilter.innerHTML = '<option value="all">📍 Tüm Bölgeler</option>';
    uniqueDistricts.forEach(d => {
      const count = places.filter(p => p.district === d && p.category !== 'Gezilecek Yer').length;
      if (count > 0) {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = `${d} (${count})`;
        districtFilter.appendChild(opt);
      }
    });
    if (uniqueDistricts.includes(currentVal)) {
      districtFilter.value = currentVal;
    }
  }

  // Gidilecek Yerler filtre select
  if (sightsDistrictFilter) {
    const currentSightsVal = sightsDistrictFilter.value;
    sightsDistrictFilter.innerHTML = '<option value="all">📍 Tüm Bölgeler</option>';
    uniqueDistricts.forEach(d => {
      const count = places.filter(p => p.district === d && (p.category === 'Gezilecek Yer' || p.status === 'to_visit')).length;
      if (count > 0) {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = `${d} (${count})`;
        sightsDistrictFilter.appendChild(opt);
      }
    });
    if (uniqueDistricts.includes(currentSightsVal)) {
      sightsDistrictFilter.value = currentSightsVal;
    }
  }

  // Rota ilçe select
  if (routeDistrict) {
    const currentRouteVal = routeDistrict.value;
    routeDistrict.innerHTML = '<option value="all">🌐 Tüm İstanbul (Semt Bağımsız Rota)</option>';
    if (uniqueDistricts.length === 0) {
      routeDistrict.innerHTML += '<option value="">Henüz mekan yok</option>';
    } else {
      uniqueDistricts.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = `📍 ${d} (${places.filter(p => p.district === d).length} Mekan)`;
        routeDistrict.appendChild(opt);
      });
      if (currentRouteVal && (currentRouteVal === 'all' || uniqueDistricts.includes(currentRouteVal))) {
        routeDistrict.value = currentRouteVal;
      } else if (uniqueDistricts.includes("Kadıköy")) {
        routeDistrict.value = "Kadıköy";
      }
    }
  }

  // Özel mekan seçici listesini güncelle
  renderCustomPlacesPicker();
}

// ROTA SİHİRBAZI OLUŞTURUCU (Otomatik Mod)
function generateRoute() {
  const district = document.getElementById("routeDistrictSelect").value;
  const stopCount = parseInt(document.getElementById("routeStopCount").value, 10) || 3;

  // Seçilen bölgedeki mekanları al veya semt bağımsız Tüm İstanbul'u kullan
  let pool = (district === 'all') 
    ? [...places] 
    : places.filter(p => p.district.toLowerCase() === district.toLowerCase());

  if (pool.length === 0) {
    showToast(`Seçilen kriterde mekan bulunamadı!`, "error");
    return;
  }

  // Akıllı Gezi & Lezzet Sıralaması:
  // Durak 1: Gezilecek Yer (varsa) veya Popüler Yemek
  // Durak 2: Öğle/Akşam Yemeği veya Sokak Lezzeti
  // Durak 3: Nitelikli Kahve / Cafe
  // Durak 4: Tatlıcı
  // Durak 5: Akşam kapanışı / Manzara / Bar

  let route = [];

  const sightPlaces = pool.filter(p => p.category === 'Gezilecek Yer').sort((a,b) => b.score - a.score);
  const foodPlaces = pool.filter(p => p.category === 'Yemek' || p.category === 'Sokak Lezzeti').sort((a,b) => b.score - a.score);
  const cafePlaces = pool.filter(p => p.category === 'Cafe').sort((a,b) => b.score - a.score);
  const dessertPlaces = pool.filter(p => p.category === 'Tatlı').sort((a,b) => b.score - a.score);
  const otherPlaces = pool.filter(p => p.category === 'Meyhane / Bar').sort((a,b) => b.score - a.score);

  // 1. Durak (Gezilecek Yer veya Başlangıç Yemeği)
  if (sightPlaces.length > 0) {
    route.push({ place: sightPlaces[0], role: "1. Durak: Gezi & Keşif Noktası 🏛️" });
  } else if (foodPlaces.length > 0) {
    route.push({ place: foodPlaces[0], role: "1. Durak: Başlangıç Lezzeti 🍽️" });
  } else {
    route.push({ place: pool[0], role: "1. Durak: İlk Durak 📍" });
  }

  // 2. Durak (Yemek veya Cafe)
  const remainingFoods = foodPlaces.filter(f => !route.some(r => r.place.id === f.id));
  if (remainingFoods.length > 0) {
    route.push({ place: remainingFoods[0], role: "2. Durak: Öğle / Akşam Yemeği 🍽️" });
  } else {
    const nextBest = pool.filter(p => !route.some(r => r.place.id === p.id)).sort((a,b) => b.score - a.score)[0];
    if (nextBest && route.length < stopCount) {
      route.push({ place: nextBest, role: "2. Durak: Mola & Tadım 😋" });
    }
  }

  // 3. Durak (Kahve / Cafe)
  if (route.length < stopCount) {
    const remainingCafes = cafePlaces.filter(c => !route.some(r => r.place.id === c.id));
    if (remainingCafes.length > 0) {
      route.push({ place: remainingCafes[0], role: "3. Durak: Kahve & Sohbet Molası ☕" });
    } else {
      const nextBest = pool.filter(p => !route.some(r => r.place.id === p.id)).sort((a,b) => b.score - a.score)[0];
      if (nextBest) route.push({ place: nextBest, role: "3. Durak: Dinlenme Durağı ✨" });
    }
  }

  // 4. Durak (Tatlı veya Gezilecek İkinci Yer)
  if (route.length < stopCount) {
    const remainingDesserts = dessertPlaces.filter(d => !route.some(r => r.place.id === d.id));
    const remainingSights = sightPlaces.filter(s => !route.some(r => r.place.id === s.id));
    
    if (remainingDesserts.length > 0) {
      route.push({ place: remainingDesserts[0], role: "4. Durak: Tatlı Şöleni 🍰" });
    } else if (remainingSights.length > 0) {
      route.push({ place: remainingSights[0], role: "4. Durak: İkinci Gezi Noktası 🏛️" });
    } else {
      const nextBest = pool.filter(p => !route.some(r => r.place.id === p.id)).sort((a,b) => b.score - a.score)[0];
      if (nextBest) route.push({ place: nextBest, role: "4. Durak: Lezzet Durağı 🌟" });
    }
  }

  // 5. Durak (Akşam Kapanışı)
  if (route.length < stopCount) {
    const nextBest = pool.filter(p => !route.some(r => r.place.id === p.id)).sort((a,b) => b.score - a.score)[0];
    if (nextBest) {
      route.push({ place: nextBest, role: "5. Durak: Günün Kapanışı 🍸" });
    }
  }

  const titlePrefix = (district === 'all') ? "İstanbul Geneli" : district;
  renderRouteResult(titlePrefix, route);
}

function renderRouteResult(district, route) {
  const container = document.getElementById("routeTimeline");
  const resultWrapper = document.getElementById("routeResultContainer");
  const title = document.getElementById("routeTitle");

  title.innerHTML = `<i data-lucide="footprints" class="w-5 h-5 text-emerald-600 dark:text-emerald-400"></i> ${district} Gezi & Lezzet Rotası (${route.length} Durak)`;

  container.innerHTML = "";
  resultWrapper.classList.remove("hidden");

  // Haritada rotayı çiz
  if (routePolyline) {
    map.removeLayer(routePolyline);
  }

  const routeCoords = [];

  route.forEach((item, index) => {
    const place = item.place;
    if (place.lat && place.lng) {
      routeCoords.push([place.lat, place.lng]);
    }

    const step = document.createElement("div");
    step.className = "relative pl-10 group";

    const gmapsUrl = place.lat && place.lng 
      ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}` 
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.district + ' İstanbul')}`;

    step.innerHTML = `
      <div class="absolute left-3 -translate-x-1/2 w-7 h-7 rounded-full theme-gradient-btn text-white font-extrabold text-xs flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-md">
        ${index + 1}
      </div>
      <div class="theme-bg-card rounded-3xl p-4 border theme-border shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="route-step-role text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800">${item.role}</span>
            ${getUserBadgeHtml(place.addedBy, true)}
          </div>
          <span class="route-step-score text-xs font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-xl shadow-xs">★ ${place.score}</span>
        </div>
        <h4 class="text-base font-extrabold theme-text-main">${escapeHtml(place.name)}</h4>
        <p class="text-xs theme-text-muted mb-2">🏷️ ${escapeHtml(place.category)} • 📍 ${escapeHtml(place.district)}</p>
        ${place.favorite ? `
          <div class="text-xs theme-bg-surface p-2.5 rounded-xl theme-text-main mb-2 border theme-border">
            <span class="font-bold text-emerald-600 dark:text-emerald-400">🌟 Ne Yenmeli:</span> ${escapeHtml(place.favorite)}
          </div>
        ` : ''}
        ${place.notes ? `<p class="text-xs theme-text-muted italic mb-2">"${escapeHtml(place.notes)}"</p>` : ''}
        <div class="mt-2 pt-2.5 border-t theme-border flex items-center justify-between">
          <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="text-xs theme-text-muted hover:theme-text-main font-bold flex items-center gap-1 theme-bg-surface px-2.5 py-1.5 rounded-xl transition border theme-border">
            <i data-lucide="navigation" class="w-3.5 h-3.5 text-sky-500"></i> Yol Tarifi
          </a>
          <button onclick="window.zoomToPlace('${place.id}')" class="text-xs text-emerald-600 dark:text-emerald-400 hover:opacity-85 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-xl transition border border-emerald-200/50 dark:border-emerald-800/50">
            <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> Haritada Gör
          </button>
        </div>
      </div>
    `;

    container.appendChild(step);
  });

  // Haritaya rota çizgisi ekle (Modern Zümrüt Yeşili Çizgi)
  if (routeCoords.length > 1) {
    routePolyline = L.polyline(routeCoords, {
      color: '#059669',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.9
    }).addTo(map);

    map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
  } else if (routeCoords.length === 1) {
    map.setView(routeCoords[0], 15);
  }

  // Haritadaki pinleri sadece bu rotaya göre filtrele
  updateMapMarkers(route.map(r => r.place));
  document.getElementById("activeMapFilterNote").innerText = `${district} Rotası (${route.length} Durak)`;

  initIcons();
  showToast(`${district} için lezzet rotanız oluşturuldu! 🎉`);
}

// -------------------------------------------------------------
// ÖZEL MEKAN SEÇİCİ & SEMT BAĞIMSIZ ROTA MOTORU
// -------------------------------------------------------------
let selectedCustomPlaceIds = new Set();

function renderCustomPlacesPicker() {
  const container = document.getElementById("customPlacesPickerList");
  if (!container) return;

  container.innerHTML = "";
  if (places.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 p-3 text-center">Kayıtlı mekan bulunmuyor.</p>`;
    return;
  }

  places.forEach(p => {
    const isChecked = selectedCustomPlaceIds.has(p.id);
    const row = document.createElement("label");
    row.className = `p-2.5 flex items-center justify-between cursor-pointer rounded-xl transition ${isChecked ? 'bg-emerald-500/15 border border-emerald-500/40 font-bold' : 'hover:theme-bg-surface border border-transparent'}`;
    
    let icon = "🍽️";
    if (p.category === 'Gezilecek Yer') icon = "🏛️";
    else if (p.category === 'Cafe') icon = "☕";
    else if (p.category === 'Tatlı') icon = "🍰";

    const addedByUser = p.addedBy === "Zeliha" ? "Zeliha" : "Fırat";

    row.innerHTML = `
      <div class="flex items-center gap-2.5 overflow-hidden">
        <input type="checkbox" value="${p.id}" ${isChecked ? 'checked' : ''} class="w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0" />
        <span class="text-sm shrink-0">${icon}</span>
        <div class="truncate">
          <span class="text-xs theme-text-main block truncate">${escapeHtml(p.name)}</span>
          <span class="text-[10px] theme-text-muted block">${escapeHtml(p.district)} • ★ ${Number(p.score).toFixed(1)} • 👤 ${addedByUser}</span>
        </div>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-md ${isChecked ? 'bg-emerald-600 text-white' : 'theme-bg-surface theme-text-muted border theme-border'} shrink-0 font-bold">
        ${isChecked ? 'Seçildi' : 'Ekle'}
      </span>
    `;

    const checkbox = row.querySelector("input");
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) selectedCustomPlaceIds.add(p.id);
      else selectedCustomPlaceIds.delete(p.id);
      updateSelectedPlacesCount();
      renderCustomPlacesPicker();
    });

    container.appendChild(row);
  });

  updateSelectedPlacesCount();
}

function updateSelectedPlacesCount() {
  const counter = document.getElementById("selectedPlacesCounter");
  if (counter) {
    counter.innerText = `${selectedCustomPlaceIds.size} mekan seçildi`;
  }
}

function generateCustomRoute() {
  if (selectedCustomPlaceIds.size < 2) {
    showToast("Lütfen en az 2 mekan seçin!", "error");
    return;
  }

  const selectedPlaces = places.filter(p => selectedCustomPlaceIds.has(p.id));
  
  // Seçilen mekanları akıllı mantıkla sırala:
  // Önce Gezilecek Yerler -> Yemek -> Cafe -> Tatlı -> Bar
  const categoryOrder = {
    "Gezilecek Yer": 1,
    "Yemek": 2,
    "Sokak Lezzeti": 2,
    "Cafe": 3,
    "Tatlı": 4,
    "Meyhane / Bar": 5
  };

  selectedPlaces.sort((a, b) => {
    const orderA = categoryOrder[a.category] || 3;
    const orderB = categoryOrder[b.category] || 3;
    return orderA - orderB;
  });

  const route = selectedPlaces.map((p, idx) => {
    let role = `${idx + 1}. Durak: ${p.category} Durağı`;
    if (p.category === 'Gezilecek Yer') role = `${idx + 1}. Durak: Gezi & Keşif 🏛️`;
    else if (p.category === 'Yemek' || p.category === 'Sokak Lezzeti') role = `${idx + 1}. Durak: Lezzet Molası 🍽️`;
    else if (p.category === 'Cafe') role = `${idx + 1}. Durak: Kahve Durağı ☕`;
    else if (p.category === 'Tatlı') role = `${idx + 1}. Durak: Tatlı Şöleni 🍰`;

    return {
      place: p,
      role: role
    };
  });

  renderRouteResult("Özel Seçim", route);
}

// Global Etkileşimler
window.zoomToPlace = function(id) {
  const place = places.find(p => p.id === id);
  if (!place || !place.lat || !place.lng) return;

  map.flyTo([place.lat, place.lng], 16, { duration: 1.2 });
  
  // Varsa popup aç
  markersLayer.eachLayer(layer => {
    if (layer.getLatLng && layer.getLatLng().lat === place.lat && layer.getLatLng().lng === place.lng) {
      layer.openPopup();
    }
  });
};

window.focusPlaceCard = function(id) {
  const place = places.find(p => p.id === id);
  if (place && (place.category === 'Gezilecek Yer' || place.status === 'to_visit')) {
    switchTab('sights');
  } else {
    switchTab('places');
  }
  setTimeout(() => {
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add("ring-2", "ring-emerald-500");
      setTimeout(() => card.classList.remove("ring-2", "ring-emerald-500"), 2000);
    }
  }, 120);
};

window.deletePlace = function(id) {
  const p = places.find(x => x.id === id);
  if (!p) return;
  if (confirm(`"${p.name}" mekanını silmek istediğinize emin misiniz?`)) {
    markPlaceDeleted(id);
    places = places.filter(x => x.id !== id);
    savePlaces();
    renderPlaces();
    showToast("Mekan başarıyla silindi.");
  }
};

window.editPlace = function(id) {
  const p = places.find(x => x.id === id);
  if (!p) return;

  document.getElementById("placeId").value = p.id;
  document.getElementById("modalTitle").innerHTML = `<i data-lucide="edit" class="w-5 h-5 text-emerald-600"></i><span>Mekanı Düzenle</span>`;
  window.selectPlaceUser(p.addedBy || "Fırat");
  document.getElementById("modalPlaceName").value = p.name;
  document.getElementById("modalPlaceDistrict").value = p.district;
  document.getElementById("modalPlaceCategory").value = p.category;
  document.getElementById("modalPlaceScore").value = p.score;
  document.getElementById("ratingDisplayValue").innerText = Number(p.score).toFixed(1);
  document.getElementById("modalPlaceFavorite").value = p.favorite || "";
  document.getElementById("modalPlaceNotes").value = p.notes || "";
  document.getElementById("modalPlaceLat").value = p.lat || "";
  document.getElementById("modalPlaceLng").value = p.lng || "";

  // Fotoğraf yükleme alanını doldur
  const imgDataInput = document.getElementById("modalPlaceImageData");
  const imgPreviewContainer = document.getElementById("imagePreviewContainer");
  const imgPreview = document.getElementById("imagePreview");
  if (imgDataInput && imgPreviewContainer && imgPreview) {
    if (p.image) {
      imgDataInput.value = p.image;
      imgPreview.src = p.image;
      imgPreviewContainer.classList.remove("hidden");
    } else {
      imgDataInput.value = "";
      imgPreview.src = "";
      imgPreviewContainer.classList.add("hidden");
    }
  }

  openModal();
};

function switchTab(tab) {
  currentTab = tab;
  
  // Elementler
  const tabPlacesBtn = document.getElementById("tabPlaces");
  const tabSightsBtn = document.getElementById("tabSights");
  const tabRouteBtn = document.getElementById("tabRoute");

  const viewPlaces = document.getElementById("viewPlaces");
  const viewSights = document.getElementById("viewSights");
  const viewRoute = document.getElementById("viewRoute");

  const leftCol = document.getElementById("leftColumnContainer");
  const rightCol = document.getElementById("rightMapContainer");

  // Mobil Segment Butonları
  const mTabPlaces = document.getElementById("mobileTabPlaces");
  const mTabSights = document.getElementById("mobileTabSights");
  const mTabMap = document.getElementById("mobileTabMap");
  const mTabRoute = document.getElementById("mobileTabRoute");

  // Alt Bar Butonları
  const bNavPlaces = document.getElementById("bottomNavPlaces");
  const bNavSights = document.getElementById("bottomNavSights");
  const bNavMap = document.getElementById("bottomNavMap");
  const bNavRoute = document.getElementById("bottomNavRoute");

  const isMobile = window.innerWidth < 1024;

  const resetStyles = () => {
    // Masaüstü sekmeler
    const desktopInactive = "px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold theme-text-muted hover:theme-text-main transition flex items-center gap-1.5";
    if (tabPlacesBtn) tabPlacesBtn.className = desktopInactive;
    if (tabSightsBtn) tabSightsBtn.className = desktopInactive;
    if (tabRouteBtn) tabRouteBtn.className = desktopInactive;

    // Mobil segment butonları
    const mobileInactive = "py-2 text-xs font-semibold rounded-lg transition theme-text-muted hover:theme-text-main flex items-center justify-center gap-1";
    if (mTabPlaces) mTabPlaces.className = mobileInactive;
    if (mTabSights) mTabSights.className = mobileInactive;
    if (mTabMap) mTabMap.className = mobileInactive;
    if (mTabRoute) mTabRoute.className = mobileInactive;
    
    // Alt bar butonları
    const bottomInactive = "flex flex-col items-center gap-0.5 theme-text-muted font-semibold text-[10px]";
    if (bNavPlaces) bNavPlaces.className = bottomInactive;
    if (bNavSights) bNavSights.className = bottomInactive;
    if (bNavMap) bNavMap.className = bottomInactive;
    if (bNavRoute) bNavRoute.className = bottomInactive;
  };

  resetStyles();

  const desktopActive = "px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition theme-bg-card theme-text-main shadow-sm flex items-center gap-1.5";
  const mobileActive = "py-2 text-xs font-bold rounded-lg transition text-slate-900 dark:text-white theme-bg-card shadow-sm flex items-center justify-center gap-1";

  if (tab === 'places') {
    if (tabPlacesBtn) tabPlacesBtn.className = desktopActive;
    if (mTabPlaces) mTabPlaces.className = mobileActive;
    if (bNavPlaces) bNavPlaces.className = "flex flex-col items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]";

    if (viewPlaces) viewPlaces.classList.remove("hidden");
    if (viewSights) viewSights.classList.add("hidden");
    if (viewRoute) viewRoute.classList.add("hidden");

    if (leftCol) leftCol.classList.remove("hidden");
    if (rightCol) {
      if (isMobile) rightCol.classList.add("hidden");
      else rightCol.classList.remove("hidden");
    }

    if (routePolyline) {
      map.removeLayer(routePolyline);
      routePolyline = null;
    }
    updateMapMarkers(getFilteredFoodPlaces());
    const note = document.getElementById("activeMapFilterNote");
    if (note) note.innerText = "Lezzet Mekanları";
  } else if (tab === 'sights') {
    if (tabSightsBtn) tabSightsBtn.className = desktopActive;
    if (mTabSights) mTabSights.className = mobileActive;
    if (bNavSights) bNavSights.className = "flex flex-col items-center gap-0.5 text-sky-600 dark:text-sky-400 font-bold text-[10px]";

    if (viewPlaces) viewPlaces.classList.add("hidden");
    if (viewSights) viewSights.classList.remove("hidden");
    if (viewRoute) viewRoute.classList.add("hidden");

    if (leftCol) leftCol.classList.remove("hidden");
    if (rightCol) {
      if (isMobile) rightCol.classList.add("hidden");
      else rightCol.classList.remove("hidden");
    }

    if (routePolyline) {
      map.removeLayer(routePolyline);
      routePolyline = null;
    }
    updateMapMarkers(getFilteredSightsPlaces());
    const note = document.getElementById("activeMapFilterNote");
    if (note) note.innerText = "Gidilecek Yerler";
  } else if (tab === 'map') {
    // Sadece mobilde harita tam ekran görünümü
    if (leftCol && isMobile) leftCol.classList.add("hidden");
    if (rightCol) {
      rightCol.classList.remove("hidden");
      rightCol.style.display = "flex";
    }

    if (mTabMap) mTabMap.className = "py-2 text-xs font-bold rounded-lg transition theme-bg-card text-indigo-600 dark:text-indigo-400 shadow-sm flex items-center justify-center gap-1";
    if (bNavMap) bNavMap.className = "flex flex-col items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]";

    const refreshMap = () => {
      if (map) {
        map.invalidateSize();
        const filtered = getFilteredPlaces();
        if (filtered.length > 0) {
          const latlngs = filtered.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng]);
          if (latlngs.length > 0) {
            map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 14 });
          }
        } else {
          map.setView([41.0082, 28.9784], 12);
        }
      }
    };

    refreshMap();
    setTimeout(refreshMap, 150);
    setTimeout(refreshMap, 350);
  } else if (tab === 'route') {
    if (tabRouteBtn) tabRouteBtn.className = desktopActive;
    if (mTabRoute) mTabRoute.className = "py-2 text-xs font-bold rounded-lg transition theme-bg-card text-teal-600 dark:text-teal-400 shadow-sm flex items-center justify-center gap-1";
    if (bNavRoute) bNavRoute.className = "flex flex-col items-center gap-0.5 text-teal-600 dark:text-teal-400 font-bold text-[10px]";

    if (viewRoute) viewRoute.classList.remove("hidden");
    if (viewPlaces) viewPlaces.classList.add("hidden");
    if (viewSights) viewSights.classList.add("hidden");

    if (leftCol) leftCol.classList.remove("hidden");
    if (rightCol) {
      if (isMobile) rightCol.classList.add("hidden");
      else rightCol.classList.remove("hidden");
    }
  }

  initIcons();
}

// Event Listeners
function setupEventListeners() {
  // Masaüstü Sekmeler
  const tabPlaces = document.getElementById("tabPlaces");
  if (tabPlaces) tabPlaces.addEventListener("click", () => switchTab('places'));
  const tabSights = document.getElementById("tabSights");
  if (tabSights) tabSights.addEventListener("click", () => switchTab('sights'));
  const tabRoute = document.getElementById("tabRoute");
  if (tabRoute) tabRoute.addEventListener("click", () => switchTab('route'));

  // Mobil Segment Butonları
  const mTabPlaces = document.getElementById("mobileTabPlaces");
  if (mTabPlaces) mTabPlaces.addEventListener("click", () => switchTab('places'));
  const mTabSights = document.getElementById("mobileTabSights");
  if (mTabSights) mTabSights.addEventListener("click", () => switchTab('sights'));
  const mTabMap = document.getElementById("mobileTabMap");
  if (mTabMap) mTabMap.addEventListener("click", () => switchTab('map'));
  const mTabRoute = document.getElementById("mobileTabRoute");
  if (mTabRoute) mTabRoute.addEventListener("click", () => switchTab('route'));

  // Mobil Alt Bar Butonları
  const bNavPlaces = document.getElementById("bottomNavPlaces");
  if (bNavPlaces) bNavPlaces.addEventListener("click", () => switchTab('places'));
  const bNavSights = document.getElementById("bottomNavSights");
  if (bNavSights) bNavSights.addEventListener("click", () => switchTab('sights'));
  const bNavAdd = document.getElementById("bottomNavAdd");
  if (bNavAdd) bNavAdd.addEventListener("click", () => {
    openNewPlaceModalDirect(currentTab === 'sights' ? 'Gezilecek Yer' : 'Yemek');
  });
  const bNavMap = document.getElementById("bottomNavMap");
  if (bNavMap) bNavMap.addEventListener("click", () => switchTab('map'));
  const bNavRoute = document.getElementById("bottomNavRoute");
  if (bNavRoute) bNavRoute.addEventListener("click", () => switchTab('route'));

  // Mekanlar Arama ve Temizleme
  const clearPlacesBtn = document.getElementById("clearPlacesSearchBtn");
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      if (clearPlacesBtn) {
        if (e.target.value.length > 0) clearPlacesBtn.classList.remove("hidden");
        else clearPlacesBtn.classList.add("hidden");
      }
      renderPlaces();
    });
    if (clearPlacesBtn) {
      clearPlacesBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearPlacesBtn.classList.add("hidden");
        renderPlaces();
        searchInput.focus();
      });
    }
  }

  // Gidilecek Yerler Arama ve Temizleme
  const clearSightsBtn = document.getElementById("clearSightsSearchBtn");
  const sightsSearchInput = document.getElementById("sightsSearchInput");
  if (sightsSearchInput) {
    sightsSearchInput.addEventListener("input", (e) => {
      if (clearSightsBtn) {
        if (e.target.value.length > 0) clearSightsBtn.classList.remove("hidden");
        else clearSightsBtn.classList.add("hidden");
      }
      renderPlaces();
    });
    if (clearSightsBtn) {
      clearSightsBtn.addEventListener("click", () => {
        sightsSearchInput.value = "";
        clearSightsBtn.classList.add("hidden");
        renderPlaces();
        sightsSearchInput.focus();
      });
    }
  }

  // Filtreler (Mekanlar)
  const dFilter = document.getElementById("districtFilter");
  if (dFilter) dFilter.addEventListener("change", renderPlaces);
  const cFilter = document.getElementById("categoryFilter");
  if (cFilter) cFilter.addEventListener("change", renderPlaces);
  const sFilter = document.getElementById("sortFilter");
  if (sFilter) sFilter.addEventListener("change", renderPlaces);

  // Filtreler (Gidilecek Yerler)
  const sdFilter = document.getElementById("sightsDistrictFilter");
  if (sdFilter) sdFilter.addEventListener("change", renderPlaces);
  const ssFilter = document.getElementById("sightsSortFilter");
  if (ssFilter) ssFilter.addEventListener("change", renderPlaces);

  const genRouteBtn = document.getElementById("generateRouteBtn");
  if (genRouteBtn) genRouteBtn.addEventListener("click", generateRoute);

  // Rota Modu Değiştirme (Otomatik vs Özel Mekan Seçimi)
  const modeAutoBtn = document.getElementById("routeModeAuto");
  const modeCustomBtn = document.getElementById("routeModeCustom");
  const autoPanel = document.getElementById("routeAutoPanel");
  const customPanel = document.getElementById("routeCustomPanel");

  if (modeAutoBtn && modeCustomBtn && autoPanel && customPanel) {
    modeAutoBtn.addEventListener("click", () => {
      modeAutoBtn.className = "flex-1 py-2 rounded-xl text-xs font-bold transition theme-bg-card theme-text-main shadow-sm flex items-center justify-center gap-1.5";
      modeCustomBtn.className = "flex-1 py-2 rounded-xl text-xs font-semibold theme-text-muted hover:theme-text-main transition flex items-center justify-center gap-1.5";
      autoPanel.classList.remove("hidden");
      customPanel.classList.add("hidden");
    });

    modeCustomBtn.addEventListener("click", () => {
      modeCustomBtn.className = "flex-1 py-2 rounded-xl text-xs font-bold transition theme-bg-card theme-text-main shadow-sm flex items-center justify-center gap-1.5";
      modeAutoBtn.className = "flex-1 py-2 rounded-xl text-xs font-semibold theme-text-muted hover:theme-text-main transition flex items-center justify-center gap-1.5";
      customPanel.classList.remove("hidden");
      autoPanel.classList.add("hidden");
      renderCustomPlacesPicker();
    });
  }

  // Özel Rota Butonları
  const generateCustomBtn = document.getElementById("generateCustomRouteBtn");
  if (generateCustomBtn) generateCustomBtn.addEventListener("click", generateCustomRoute);

  const clearCustomBtn = document.getElementById("clearCustomSelectionBtn");
  if (clearCustomBtn) clearCustomBtn.addEventListener("click", () => {
    selectedCustomPlaceIds.clear();
    renderCustomPlacesPicker();
    showToast("Seçimler temizlendi.");
  });

  // Puan slider senkronizasyonu
  const scoreSlider = document.getElementById("modalPlaceScore");
  const scoreDisplay = document.getElementById("ratingDisplayValue");
  if (scoreSlider && scoreDisplay) {
    scoreSlider.addEventListener("input", (e) => {
      scoreDisplay.innerText = Number(e.target.value).toFixed(1);
    });
  }

  // Modal Aç/Kapa
  const openPlaceBtn = document.getElementById("openNewPlaceModal");
  if (openPlaceBtn) openPlaceBtn.addEventListener("click", () => openNewPlaceModalDirect(currentTab === 'sights' ? 'Gezilecek Yer' : 'Yemek'));

  const closeBtn = document.getElementById("closeModalBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  const cancelBtn = document.getElementById("cancelModalBtn");
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // Google Maps ve Hızlı Arama
  setupQuickSearch();

  // Fotoğraf Yükleme ve Önizleme
  setupImageUpload();

  // Form submit
  const placeForm = document.getElementById("placeForm");
  if (placeForm) {
    placeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      savePlaceFromModal();
    });
  }

  // Haritayı ortala
  const recenterBtn = document.getElementById("recenterMapBtn");
  if (recenterBtn) {
    recenterBtn.addEventListener("click", () => {
      const filtered = getFilteredPlaces();
      updateMapMarkers(filtered);
    });
  }

  // Dışa / İçe aktar
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) exportBtn.addEventListener("click", exportData);
  const importTrigger = document.getElementById("importBtnTrigger");
  const importInput = document.getElementById("importInput");
  if (importTrigger && importInput) {
    importTrigger.addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", importData);
  }

  // Rotayı kopyala
  const copyBtn = document.getElementById("copyRouteBtn");
  if (copyBtn) copyBtn.addEventListener("click", copyRouteToClipboard);
}

function openNewPlaceModalDirect(initialCategory) {
  const form = document.getElementById("placeForm");
  if (form) form.reset();
  
  const idInput = document.getElementById("placeId");
  if (idInput) idInput.value = "";
  
  const targetCategory = initialCategory || (currentTab === 'sights' ? 'Gezilecek Yer' : 'Yemek');

  const title = document.getElementById("modalTitle");
  if (title) {
    if (targetCategory === "Gezilecek Yer") {
      title.innerHTML = `<i data-lucide="landmark" class="w-5 h-5 text-sky-500"></i><span>Yeni Gidilecek Yer Ekle</span>`;
    } else {
      title.innerHTML = `<i data-lucide="plus-circle" class="w-5 h-5 text-emerald-600"></i><span>Yeni Mekan Ekle</span>`;
    }
  }

  // Son seçilen kullanıcıyı (Fırat veya Zeliha) yükle
  const lastUser = localStorage.getItem("gezi_last_user") || "Fırat";
  window.selectPlaceUser(lastUser);

  const catInput = document.getElementById("modalPlaceCategory");
  if (catInput) {
    catInput.value = targetCategory;
  }
  
  const displayVal = document.getElementById("ratingDisplayValue");
  if (displayVal) displayVal.innerText = "9.0";
  
  const scoreInput = document.getElementById("modalPlaceScore");
  if (scoreInput) scoreInput.value = "9";
  
  const quickInput = document.getElementById("quickSearchInput");
  if (quickInput) quickInput.value = "";
  
  const dropdown = document.getElementById("searchResultsDropdown");
  if (dropdown) dropdown.classList.add("hidden");

  // Fotoğraf alanını sıfırla
  const imgData = document.getElementById("modalPlaceImageData");
  if (imgData) imgData.value = "";
  const imgPreviewContainer = document.getElementById("imagePreviewContainer");
  if (imgPreviewContainer) imgPreviewContainer.classList.add("hidden");
  const imgPreview = document.getElementById("imagePreview");
  if (imgPreview) imgPreview.src = "";
  const imgFile = document.getElementById("modalPlaceImageInput");
  if (imgFile) imgFile.value = "";

  openModal();
}

function openModal() {
  document.getElementById("placeModal").classList.remove("hidden");
  initIcons();
}

function closeModal() {
  document.getElementById("placeModal").classList.add("hidden");
}

function savePlaceFromModal() {
  const id = document.getElementById("placeId").value;
  const userEl = document.getElementById("modalPlaceUser");
  const addedBy = userEl && userEl.value === "Zeliha" ? "Zeliha" : "Fırat";
  const name = document.getElementById("modalPlaceName").value.trim();
  const district = document.getElementById("modalPlaceDistrict").value.trim();
  const category = document.getElementById("modalPlaceCategory").value;
  const score = parseFloat(document.getElementById("modalPlaceScore").value);
  const favorite = document.getElementById("modalPlaceFavorite").value.trim();
  const notes = document.getElementById("modalPlaceNotes").value.trim();
  const image = document.getElementById("modalPlaceImageData") ? document.getElementById("modalPlaceImageData").value : "";
  
  let lat = parseFloat(document.getElementById("modalPlaceLat").value);
  let lng = parseFloat(document.getElementById("modalPlaceLng").value);

  // Koordinat girilmemişse ilçeye göre hafif rastgele kaydırarak ata
  if (isNaN(lat) || isNaN(lng)) {
    const baseCoords = DISTRICT_COORDS[district] || [41.0082, 28.9784];
    // Aynı noktada üst üste binmesin diye minik jitter (sapma) ekle
    lat = baseCoords[0] + (Math.random() - 0.5) * 0.005;
    lng = baseCoords[1] + (Math.random() - 0.5) * 0.005;
  }

  if (id) {
    // Güncelleme
    const index = places.findIndex(p => p.id === id);
    if (index !== -1) {
      places[index] = { ...places[index], name, district, category, score, addedBy, favorite, notes, image, lat, lng };
      showToast(`"${name}" (${addedBy}) güncellendi. ✅`);
    }
  } else {
    // Yeni ekleme
    const newPlace = {
      id: "p_" + Date.now(),
      name,
      district,
      category,
      score,
      addedBy,
      favorite,
      notes,
      image,
      lat,
      lng,
      createdAt: Date.now()
    };
    places.unshift(newPlace);
    showToast(`"${name}" ${addedBy} tarafından eklendi! ✨`);
  }

  savePlaces();
  closeModal();
  renderPlaces();
}

// JSON Dışa Aktarma
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(places, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `istanbul_gezi_rehberi_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Yedek dosyası indirildi! 📂");
}

// JSON İçe Aktarma
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (Array.isArray(imported)) {
        places = imported;
        savePlaces();
        renderPlaces();
        showToast("Veriler başarıyla yüklendi! 🚀");
      } else {
        showToast("Geçersiz dosya formatı!", "error");
      }
    } catch (err) {
      showToast("Dosya okunurken hata oluştu!", "error");
    }
  };
  reader.readAsText(file);
}

// Rota Kopyalama
function copyRouteToClipboard() {
  const district = document.getElementById("routeDistrictSelect").value;
  const steps = document.querySelectorAll("#routeTimeline > div");
  if (!steps.length) return;

  const titlePrefix = district === "all" ? "İstanbul" : district;
  let text = `🗺️ Günün ${titlePrefix} Gurme & Gezi Rotası:\n\n`;
  steps.forEach((step, idx) => {
    const nameEl = step.querySelector("h4");
    const roleEl = step.querySelector(".route-step-role");
    const scoreEl = step.querySelector(".route-step-score");
    const name = nameEl ? nameEl.innerText : "";
    const role = roleEl ? roleEl.innerText : `${idx + 1}. Durak`;
    const score = scoreEl ? scoreEl.innerText : "";
    text += `${idx + 1}. [${role}] ${name} (${score})\n`;
  });
  text += `\n✨ Fırat & Zeliha İstanbul Gezi Rehberi ile planlandı.`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("Rota panoya kopyalandı! Arkadaşlarınızla paylaşabilirsiniz.");
  });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMessage");
  toastMsg.innerText = msg;
  toast.classList.remove("opacity-0", "pointer-events-none");
  toast.classList.add("opacity-100");

  setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0", "pointer-events-none");
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// -------------------------------------------------------------
// GOOGLE MAPS API, CANLI ARAMA & HARİTADAN KONUM SEÇME MOTORU
// -------------------------------------------------------------
const BUILTIN_GOOGLE_API_KEY = "AIzaSyA1cqQ_QOf_8s6e5Z2jS5HG8l--gQMBBF0";

function getGoogleApiKey() {
  const custom = localStorage.getItem("google_maps_api_key");
  if (custom && custom.trim().length > 0) return custom.trim();
  return BUILTIN_GOOGLE_API_KEY;
}

let searchDebounceTimeout = null;

// Google Maps API Başlatıcı & Durum Kontrolü
function initGooglePlacesApi() {
  const key = getGoogleApiKey();
  if (key) {
    updateGoogleApiStatusBadge(true);
  } else {
    updateGoogleApiStatusBadge(false);
  }
}

function updateGoogleApiStatusBadge(isActive) {
  const text = document.getElementById("googleApiStatusText");
  const badge = document.getElementById("googleApiStatusBadge");
  if (text && badge) {
    if (isActive) {
      text.innerText = "Google API 🟢";
      badge.className = "text-[10px] theme-bg-card font-extrabold px-2 py-0.5 rounded-full border border-emerald-500 text-emerald-600 shadow-xs flex items-center gap-1 cursor-pointer";
    } else {
      text.innerText = "Google API";
      badge.className = "text-[10px] theme-bg-card font-bold px-2 py-0.5 rounded-full border theme-border hover:border-emerald-500 transition shadow-xs flex items-center gap-1 text-slate-700 dark:text-slate-300 cursor-pointer";
    }
  }
}

// Google API Modal Fonksiyonları
window.openGoogleApiModal = function() {
  const modal = document.getElementById("googleApiModal");
  const input = document.getElementById("googleApiKeyInput");
  const removeBtn = document.getElementById("removeGoogleApiKeyBtn");
  const key = localStorage.getItem("google_maps_api_key") || BUILTIN_GOOGLE_API_KEY;

  if (input) input.value = key;
  if (removeBtn) {
    if (localStorage.getItem("google_maps_api_key")) removeBtn.classList.remove("hidden");
    else removeBtn.classList.add("hidden");
  }
  if (modal) modal.classList.remove("hidden");
};

window.closeGoogleApiModal = function() {
  const modal = document.getElementById("googleApiModal");
  if (modal) modal.classList.add("hidden");
};

window.saveGoogleApiKey = function() {
  const input = document.getElementById("googleApiKeyInput");
  const key = (input ? input.value : "").trim();
  if (key) {
    localStorage.setItem("google_maps_api_key", key);
    updateGoogleApiStatusBadge(true);
    showToast("Google Maps API güncellendi! Canlı arama hazır. 🚀");
  } else {
    localStorage.removeItem("google_maps_api_key");
    updateGoogleApiStatusBadge(Boolean(BUILTIN_GOOGLE_API_KEY));
    showToast("Özel API anahtarı temizlendi, varsayılan anahtar devrede.");
  }
  window.closeGoogleApiModal();
};

window.removeGoogleApiKey = function() {
  localStorage.removeItem("google_maps_api_key");
  const input = document.getElementById("googleApiKeyInput");
  if (input) input.value = BUILTIN_GOOGLE_API_KEY;
  updateGoogleApiStatusBadge(Boolean(BUILTIN_GOOGLE_API_KEY));
  window.closeGoogleApiModal();
  showToast("Özel anahtar kaldırıldı, sistem anahtarı devrede.");
};

// Haritadan Tıkla & Konum Seç
window.startPickOnMap = function() {
  const modal = document.getElementById("placeModal");
  if (modal) modal.classList.add("hidden");

  const dropdown = document.getElementById("searchResultsDropdown");
  if (dropdown) dropdown.classList.add("hidden");

  const banner = document.getElementById("mapPickBanner");
  if (banner) banner.classList.remove("hidden");

  switchTab('map');

  if (!map) return;

  const onMapClick = (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // En yakın semti bul
    let closest = "Kadıköy";
    let minDist = Infinity;
    for (const [distName, coords] of Object.entries(DISTRICT_COORDS)) {
      const d = Math.hypot(coords[0] - lat, coords[1] - lng);
      if (d < minDist) {
        minDist = d;
        closest = distName;
      }
    }

    document.getElementById("modalPlaceLat").value = lat.toFixed(5);
    document.getElementById("modalPlaceLng").value = lng.toFixed(5);
    document.getElementById("modalPlaceDistrict").value = closest;

    if (banner) banner.classList.add("hidden");
    if (modal) modal.classList.remove("hidden");

    showToast(`Konum haritadan seçildi: ${closest} 📍`);
  };

  map.once('click', onMapClick);
  window._currentMapPickHandler = onMapClick;
};

window.cancelPickOnMap = function() {
  const banner = document.getElementById("mapPickBanner");
  if (banner) banner.classList.add("hidden");

  const modal = document.getElementById("placeModal");
  if (modal) modal.classList.remove("hidden");

  if (map && window._currentMapPickHandler) {
    map.off('click', window._currentMapPickHandler);
    window._currentMapPickHandler = null;
  }
};

// Canlı Arama Input ve Etkileşim
function setupQuickSearch() {
  const quickInput = document.getElementById("quickSearchInput");
  const dropdown = document.getElementById("searchResultsDropdown");
  const spinner = document.getElementById("searchSpinner");
  const clearBtn = document.getElementById("clearSearchBtn");
  const directLink = document.getElementById("directGoogleSearchLink");

  if (!quickInput) return;

  // Temizleme butonu
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      quickInput.value = "";
      clearBtn.classList.add("hidden");
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      if (directLink) directLink.href = "https://maps.google.com";
      quickInput.focus();
    });
  }

  // Yazarken anında arama
  quickInput.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    
    if (clearBtn) {
      if (val.length > 0) clearBtn.classList.remove("hidden");
      else clearBtn.classList.add("hidden");
    }

    if (directLink) {
      directLink.href = val.length > 0
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val + ' İstanbul')}`
        : "https://maps.google.com";
    }

    if (!val) {
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      return;
    }

    // Google Maps linki veya kopyalanmış adres mi?
    if (val.includes("google.com/maps") || val.includes("maps.app.goo.gl") || val.includes("goo.gl/maps") || (val.includes("·") && val.includes("★"))) {
      handleGoogleMapsLink(val);
      return;
    }

    clearTimeout(searchDebounceTimeout);
    if (val.length < 2) {
      dropdown.classList.add("hidden");
      return;
    }

    spinner.classList.remove("hidden");
    searchDebounceTimeout = setTimeout(() => {
      fetchPlaceSuggestions(val);
    }, 250);
  });

  // Dışarı tıklandığında dropdown kapat
  document.addEventListener("click", (e) => {
    if (!quickInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
}

// Google Maps URL ve Kopyalanmış Metin Çözücü
async function handleGoogleMapsLink(inputStr) {
  const spinner = document.getElementById("searchSpinner");
  if (spinner) spinner.classList.remove("hidden");

  try {
    let placeName = "";
    let lat = null;
    let lng = null;
    const apiKey = getGoogleApiKey();

    // 0. maps.app.goo.gl veya goo.gl/maps kısa link çözücü
    if (inputStr.includes("maps.app.goo.gl") || inputStr.includes("goo.gl/maps")) {
      const urlMatch = inputStr.match(/https?:\/\/[^\s]+/);
      const shortUrl = urlMatch ? urlMatch[0] : inputStr.trim();
      
      try {
        const unshortenRes = await fetch(`https://unshorten.me/json/${encodeURIComponent(shortUrl)}`);
        const unshortenData = await unshortenRes.json();
        if (unshortenData && unshortenData.resolved_url) {
          inputStr = unshortenData.resolved_url;
        }
      } catch (err) {
        console.warn("Kısa link unshorten hatası:", err);
      }
    }

    // 1. Standart URL formatı: /place/Mekan+Adı/@40.98,29.02 veya ?q=Mekan+Adı
    const placeMatch = inputStr.match(/\/place\/([^\/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    }

    if (!placeName) {
      const qMatch = inputStr.match(/[?&]q=([^&]+)/);
      if (qMatch && qMatch[1]) {
        const decodedQ = decodeURIComponent(qMatch[1].replace(/\+/g, " "));
        if (!decodedQ.match(/^-?\d+\.\d+,-?\d+\.\d+$/)) {
          placeName = decodedQ;
        }
      }
    }

    // Koordinat bulma: @40.9860,29.0260 veya ?q=40.9860,29.0260
    const coordMatch = inputStr.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || inputStr.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    }

    // 2. Kopyalanmış metin formatı (Google Maps uygulamasından kopyalanan mekan kartı)
    if (!placeName && !inputStr.startsWith("http")) {
      const lines = inputStr.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        placeName = lines[0];
      }
    }

    // 3. Eğer isim var ama koordinat yoksa Google Places API (New) ile konum bul
    if (placeName && (!lat || !lng) && apiKey) {
      try {
        const searchRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating"
          },
          body: JSON.stringify({
            textQuery: placeName + " İstanbul",
            languageCode: "tr"
          })
        });
        const searchData = await searchRes.json();
        if (searchData.places && searchData.places.length > 0) {
          const first = searchData.places[0];
          if (first.displayName && first.displayName.text) {
            placeName = first.displayName.text;
          }
          if (first.location) {
            lat = first.location.latitude;
            lng = first.location.longitude;
          }
        }
      } catch (err) {
        console.warn("Places text search hatası:", err);
      }
    }

    if (placeName) {
      document.getElementById("modalPlaceName").value = placeName;
      autoDetectCategoryAndDistrict(placeName, lat, lng);
      showToast(`"${placeName}" Google Maps'ten başarıyla aktarıldı! ✨`);
    } else {
      showToast("Link tespit edildi, detaylar arama çubuğuna aktarılıyor...", "info");
    }

    if (lat && lng) {
      document.getElementById("modalPlaceLat").value = lat.toFixed(5);
      document.getElementById("modalPlaceLng").value = lng.toFixed(5);
    }
  } catch (err) {
    console.error("Link parsing error:", err);
  } finally {
    if (spinner) spinner.classList.add("hidden");
  }
}

// Doğrudan aranan ismi forma aktar
window.applyDirectPlaceName = function(name) {
  document.getElementById("modalPlaceName").value = name;
  autoDetectCategoryAndDistrict(name);
  const dropdown = document.getElementById("searchResultsDropdown");
  if (dropdown) dropdown.classList.add("hidden");
  showToast(`"${name}" mekan adı olarak aktarıldı! ✨`);
  const distInput = document.getElementById("modalPlaceDistrict");
  if (distInput) distInput.focus();
};

// Google Maps Tarzı Canlı Arama Motoru (Hibrit: Google Places API (New) + Photon POI + Akıllı Kartlar)
async function fetchPlaceSuggestions(query) {
  const dropdown = document.getElementById("searchResultsDropdown");
  const spinner = document.getElementById("searchSpinner");
  const apiKey = getGoogleApiKey();

  let results = [];

  // A. Google Places API (New) - Canlı ve Otomatik Autocomplete
  if (apiKey) {
    try {
      const gRes = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey
        },
        body: JSON.stringify({
          input: query,
          languageCode: "tr",
          regionCode: "tr",
          locationBias: {
            rectangle: {
              low: { latitude: 40.7, longitude: 28.0 },
              high: { latitude: 41.6, longitude: 29.9 }
            }
          }
        })
      });
      const gData = await gRes.json();
      if (gData.suggestions && gData.suggestions.length > 0) {
        results = gData.suggestions
          .filter(s => s.placePrediction)
          .map(s => {
            const pred = s.placePrediction;
            return {
              name: pred.structuredFormat ? pred.structuredFormat.mainText.text : pred.text.text,
              district: pred.structuredFormat && pred.structuredFormat.secondaryText ? pred.structuredFormat.secondaryText.text : "",
              subtitle: pred.text ? pred.text.text : "",
              category: "Google Maps Mekanı",
              placeId: pred.placeId,
              isGoogle: true
            };
          });
      }
    } catch (e) {
      console.warn("Google Places New autocomplete error:", e);
    }
  }

  // B. Photon İstanbul API (POIs odaklı fallback filtreleme)
  if (results.length === 0) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=28.0,40.7,29.9,41.6&limit=12`;
      const res = await fetch(photonUrl);
      const data = await res.json();

      if (data && data.features && data.features.length > 0) {
        // Alakasız konut sokaklarını filtrele (kullanıcı cadde/sokak yazmadıysa)
        const isStreetQuery = query.toLowerCase().includes("cad") || query.toLowerCase().includes("sok");
        
        const filteredFeatures = data.features.filter(f => {
          const val = f.properties && (f.properties.osm_value || f.properties.osm_key || "");
          if (!isStreetQuery && (val === "residential" || val === "tertiary" || val === "service")) {
            return false;
          }
          return true;
        });

        const targetFeatures = filteredFeatures.length > 0 ? filteredFeatures : data.features.slice(0, 5);

        results = targetFeatures.map(f => {
          const p = f.properties || {};
          const coords = f.geometry && f.geometry.coordinates ? f.geometry.coordinates : [28.9784, 41.0082];
          const name = p.name || query;
          const district = p.district || p.locality || p.city || p.suburb || p.county || "İstanbul";
          const street = p.street ? `${p.street}` : "";
          const category = p.osm_value || p.osm_key || "";
          return {
            name: name,
            district: district,
            subtitle: [street, district, "İstanbul"].filter(Boolean).join(", "),
            category: category,
            lat: coords[1],
            lng: coords[0]
          };
        });
      }
    } catch (err) {
      console.warn("Photon search fallback:", err);
    }
  }

  if (spinner) spinner.classList.add("hidden");

  dropdown.innerHTML = "";

  // -------------------------------------------------------------------
  // HER ARAMADA EN ÜSTTE 3 AKILLI GOOGLE MAPS AKSİYON KARTI
  // -------------------------------------------------------------------
  const topActions = document.createElement("div");
  topActions.className = "p-2 bg-emerald-500/10 border-b theme-border space-y-1";

  // 1. Doğrudan bu isimle forma aktar
  const directBtn = document.createElement("button");
  directBtn.type = "button";
  directBtn.className = "w-full text-left p-2 rounded-xl theme-bg-card hover:bg-emerald-50 dark:hover:bg-slate-700/80 transition flex items-center justify-between border theme-border group";
  directBtn.innerHTML = `
    <div class="flex items-center gap-2 overflow-hidden">
      <span class="p-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs shrink-0">✨</span>
      <div class="truncate">
        <span class="text-xs font-extrabold theme-text-main group-hover:text-emerald-600 block truncate">"${escapeHtml(query)}" olarak kullan</span>
        <span class="text-[10px] theme-text-muted block">Mekan adını forma tek tıkla aktar</span>
      </div>
    </div>
    <span class="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">Formu Doldur</span>
  `;
  directBtn.addEventListener("click", () => window.applyDirectPlaceName(query));
  topActions.appendChild(directBtn);

  // 2. Google Maps'te Aç
  const gmapsLink = document.createElement("a");
  gmapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ' İstanbul')}`;
  gmapsLink.target = "_blank";
  gmapsLink.rel = "noopener noreferrer";
  gmapsLink.className = "w-full text-left p-2 rounded-xl theme-bg-card hover:bg-sky-50 dark:hover:bg-slate-700/80 transition flex items-center justify-between border theme-border group block";
  gmapsLink.innerHTML = `
    <div class="flex items-center gap-2 overflow-hidden">
      <span class="p-1 rounded-lg bg-sky-100 text-sky-700 text-xs shrink-0">🗺️</span>
      <div class="truncate">
        <span class="text-xs font-bold theme-text-main group-hover:text-sky-600 block truncate">Google Haritalar'da "${escapeHtml(query)}" Aç</span>
        <span class="text-[10px] theme-text-muted block">Google Maps uygulamasında veya webde gör ↗</span>
      </div>
    </div>
    <span class="text-[10px] font-bold text-sky-600 bg-sky-500/10 px-2 py-0.5 rounded-md shrink-0">Maps'te Bul</span>
  `;
  topActions.appendChild(gmapsLink);

  dropdown.appendChild(topActions);

  // B. Bulunan Mekan Sonuçları
  if (results.length > 0) {
    const listHeader = document.createElement("div");
    listHeader.className = "px-3 py-1.5 text-[10px] font-extrabold theme-text-muted uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50";
    listHeader.innerText = "Önerilen Mekanlar";
    dropdown.appendChild(listHeader);

    results.forEach(item => {
      const row = document.createElement("div");
      row.className = "p-2.5 hover:bg-emerald-50/60 dark:hover:bg-slate-700/60 cursor-pointer transition flex items-center justify-between text-left group";
      
      let icon = "🍽️";
      const catLower = (item.category + " " + item.name).toLowerCase();
      if (catLower.includes("cafe") || catLower.includes("kahve") || catLower.includes("coffee")) icon = "☕";
      else if (catLower.includes("tatlı") || catLower.includes("baklava") || catLower.includes("fırın")) icon = "🍰";
      else if (catLower.includes("bar") || catLower.includes("pub") || catLower.includes("meyhane")) icon = "🍸";
      else if (catLower.includes("kebap") || catLower.includes("döner") || catLower.includes("dürüm") || catLower.includes("burger")) icon = "🥩";
      else if (catLower.includes("kule") || catLower.includes("cami") || catLower.includes("müze") || catLower.includes("saray") || catLower.includes("park") || catLower.includes("sahil")) icon = "🏛️";

      row.innerHTML = `
        <div class="flex items-start gap-2.5 overflow-hidden">
          <span class="text-sm p-1.5 rounded-xl theme-bg-surface shrink-0">${icon}</span>
          <div class="overflow-hidden">
            <div class="text-xs font-bold theme-text-main group-hover:text-emerald-600 transition truncate">${escapeHtml(item.name)}</div>
            <div class="text-[10px] theme-text-muted truncate mt-0.5">${escapeHtml(item.subtitle)}</div>
          </div>
        </div>
        <button type="button" class="text-xs bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white px-2 py-1 rounded-lg font-bold transition shrink-0 ml-2">
          Seç
        </button>
      `;

      row.addEventListener("click", () => {
        applySelectedPlace(item);
        dropdown.classList.add("hidden");
      });

      dropdown.appendChild(row);
    });
  }

  // C. Alt Kısım: Haritadan Seç & API Ayarı Butonu
  const bottomBar = document.createElement("div");
  bottomBar.className = "p-2 bg-slate-50 dark:bg-slate-800/80 border-t theme-border flex items-center justify-between text-[11px]";
  bottomBar.innerHTML = `
    <button type="button" onclick="window.startPickOnMap()" class="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
      <span>📍 Haritada Yere Tıkla & Seç</span>
    </button>
    <button type="button" onclick="window.openGoogleApiModal()" class="text-slate-500 hover:theme-text-main font-semibold flex items-center gap-1">
      <span>⚙️ Google API</span>
    </button>
  `;
  dropdown.appendChild(bottomBar);

  dropdown.classList.remove("hidden");
}

// Seçilen mekanı form alanlarına doldur
async function applySelectedPlace(info) {
  document.getElementById("modalPlaceName").value = info.name;
  
  let lat = info.lat;
  let lng = info.lng;
  const apiKey = getGoogleApiKey();

  // Eğer Google Places ID varsa resmi koordinatları ve adresi çek
  if (info.placeId && (!lat || !lng) && apiKey) {
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(info.placeId)}`, {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "displayName,formattedAddress,location"
        }
      });
      const data = await res.json();
      if (data && data.location) {
        lat = data.location.latitude;
        lng = data.location.longitude;
      }
      if (data && data.displayName && data.displayName.text) {
        document.getElementById("modalPlaceName").value = data.displayName.text;
      }
    } catch (err) {
      console.warn("Place details getirme hatası:", err);
    }
  }

  if (lat && lng) {
    document.getElementById("modalPlaceLat").value = Number(lat).toFixed(5);
    document.getElementById("modalPlaceLng").value = Number(lng).toFixed(5);
    autoDetectCategoryAndDistrict(info.name, lat, lng);
  } else {
    autoDetectCategoryAndDistrict(info.name);
  }

  document.getElementById("quickSearchInput").value = info.name;
  const clearBtn = document.getElementById("clearSearchBtn");
  if (clearBtn) clearBtn.classList.remove("hidden");

  showToast(`"${info.name}" forma aktarıldı! ✅`);
}

function autoDetectCategoryAndDistrict(name, lat, lng) {
  // 1. Koordinat ile en yakın bilinen semti bul
  if (lat && lng) {
    let closest = "Kadıköy";
    let minDist = Infinity;
    for (const [distName, coords] of Object.entries(DISTRICT_COORDS)) {
      const d = Math.hypot(coords[0] - lat, coords[1] - lng);
      if (d < minDist) {
        minDist = d;
        closest = distName;
      }
    }
    document.getElementById("modalPlaceDistrict").value = closest;
  } else {
    // İsim içinde ilçe geçiyor mu kontrol et
    const nameLower = name.toLowerCase();
    for (const dist of Object.keys(DISTRICT_COORDS)) {
      if (nameLower.includes(dist.toLowerCase())) {
        document.getElementById("modalPlaceDistrict").value = dist;
        break;
      }
    }
  }

  // 2. Kategori tahmini
  const nameLower = name.toLowerCase();
  if (nameLower.includes("kule") || nameLower.includes("cami") || nameLower.includes("saray") || nameLower.includes("müze") || nameLower.includes("sahil") || nameLower.includes("park") || nameLower.includes("meydan") || nameLower.includes("ada") || nameLower.includes("iskele") || nameLower.includes("hisar") || nameLower.includes("tarihi") || nameLower.includes("manzara")) {
    document.getElementById("modalPlaceCategory").value = "Gezilecek Yer";
  } else if (nameLower.includes("cafe") || nameLower.includes("kahve") || nameLower.includes("coffee") || nameLower.includes("espresso") || nameLower.includes("çay")) {
    document.getElementById("modalPlaceCategory").value = "Cafe";
  } else if (nameLower.includes("tatlı") || nameLower.includes("çikolata") || nameLower.includes("baklava") || nameLower.includes("pasta") || nameLower.includes("pastane") || nameLower.includes("fırın") || nameLower.includes("muhallebi")) {
    document.getElementById("modalPlaceCategory").value = "Tatlı";
  } else if (nameLower.includes("dürüm") || nameLower.includes("burger") || nameLower.includes("döner") || nameLower.includes("kokoreç") || nameLower.includes("midye") || nameLower.includes("sokak") || nameLower.includes("lahmacun") || nameLower.includes("pide")) {
    document.getElementById("modalPlaceCategory").value = "Sokak Lezzeti";
  } else if (nameLower.includes("bar") || nameLower.includes("pub") || nameLower.includes("meyhane") || nameLower.includes("bira") || nameLower.includes("şarap")) {
    document.getElementById("modalPlaceCategory").value = "Meyhane / Bar";
  } else {
    document.getElementById("modalPlaceCategory").value = "Yemek";
  }
}

// -------------------------------------------------------------
// FOTOĞRAF YÜKLEME & OTOMATİK BOYUTLANDIRMA (Canvas Optimizer)
// -------------------------------------------------------------
function setupImageUpload() {
  const fileInput = document.getElementById("modalPlaceImageInput");
  const dataInput = document.getElementById("modalPlaceImageData");
  const preview = document.getElementById("imagePreview");
  const container = document.getElementById("imagePreviewContainer");
  const removeBtn = document.getElementById("removeImageBtn");

  if (!fileInput) return;

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Fotoğrafı tarayıcıda Canvas ile optimize et (Hafıza dostu ~640px, yüksek verimli JPEG)
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Maksimum 640px genişlik / yükseklik oranla (Kalıcı hafıza için ideal boyut)
        let width = img.width;
        let height = img.height;
        const maxDimension = 640;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Kaliteli, hafif ve hızlı açılan JPEG Base64 al
        const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.65);

        dataInput.value = optimizedDataUrl;
        preview.src = optimizedDataUrl;
        container.classList.remove("hidden");
        initIcons();
        showToast("Fotoğraf optimize edildi ve kalıcı kaydedildi! 📸");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      fileInput.value = "";
      dataInput.value = "";
      preview.src = "";
      container.classList.add("hidden");
      showToast("Fotoğraf kaldırıldı.");
    });
  }
}


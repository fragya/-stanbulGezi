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
    favorite: "Double Cheese & Trüflü Patates",
    notes: "İstanbul'un en iyi gurme burgercilerinden biri. Sosları efsane.",
    lat: 41.0440,
    lng: 29.0030,
    createdAt: Date.now()
  }
];

// Uygulama Durumu (State)
let places = [];
let map = null;
let markersLayer = null;
let routePolyline = null;
let currentTab = 'places'; // 'places' veya 'route'

// Başlatma
document.addEventListener("DOMContentLoaded", () => {
  initIcons();
  loadPlaces();
  initMap();
  setupEventListeners();
  renderDistrictDropdowns();
  renderPlaces();
  updateStats();
});

function initIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// LocalStorage işlemleri
function loadPlaces() {
  const saved = localStorage.getItem("istanbul_gezi_places");
  if (saved) {
    try {
      places = JSON.parse(saved);
    } catch (e) {
      places = [...DEFAULT_PLACES];
    }
  } else {
    places = [...DEFAULT_PLACES];
    savePlaces();
  }
}

function savePlaces() {
  localStorage.setItem("istanbul_gezi_places", JSON.stringify(places));
  updateStats();
  renderDistrictDropdowns();
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

  // Esri World Street Map (Sıfır API anahtarı, hiçbir engel/filtre yok, file:/// uyumlu ve detaylı Türkiye/İstanbul haritası)
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: 'Tiles &copy; Esri &mdash; Kaynak: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    maxZoom: 19
  }).addTo(map);

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

// Harita Pinleri Güncelleme
function updateMapMarkers(placesToShow) {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  if (!placesToShow || placesToShow.length === 0) return;

  const latlngs = [];

  placesToShow.forEach((place) => {
    if (!place.lat || !place.lng) return;

    const latlng = [place.lat, place.lng];
    latlngs.push(latlng);

    // Skor rengi
    let colorClass = "bg-rose-500";
    if (place.score >= 9.0) colorClass = "bg-emerald-600";
    else if (place.score >= 7.5) colorClass = "bg-amber-500";

    const customIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div class="${colorClass} text-white font-bold text-xs rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition duration-150">
          ${Number(place.score).toFixed(1)}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker(latlng, { icon: customIcon });

    const popupHtml = `
      <div class="p-2 min-w-[200px]">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">${escapeHtml(place.district)}</span>
          <span class="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">★ ${Number(place.score).toFixed(1)}/10</span>
        </div>
        <h4 class="font-bold text-slate-900 text-sm mb-1">${escapeHtml(place.name)}</h4>
        <p class="text-xs text-slate-500 mb-2">🏷️ ${escapeHtml(place.category)}</p>
        ${place.favorite ? `<p class="text-xs text-slate-700 bg-slate-50 p-1.5 rounded mb-2"><strong>Favori:</strong> ${escapeHtml(place.favorite)}</p>` : ''}
        <button onclick="window.focusPlaceCard('${place.id}')" class="w-full text-center text-xs py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition">
          Detayları Gör
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml);
    markersLayer.addLayer(marker);
  });

  if (latlngs.length > 0) {
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

// İstatistikleri güncelleme
function updateStats() {
  const badge = document.getElementById("placesCountBadge");
  if (badge) badge.innerText = places.length;
  
  const mBadge = document.getElementById("mobileCountDisplay");
  if (mBadge) mBadge.innerText = `${places.length} Mekan`;

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

// Filtreler & Mekan Listesi
function getFilteredPlaces() {
  const search = document.getElementById("searchInput").value.toLowerCase().trim();
  const district = document.getElementById("districtFilter").value;
  const category = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("sortFilter").value;

  let filtered = places.filter(p => {
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search) ||
      (p.favorite && p.favorite.toLowerCase().includes(search)) ||
      (p.notes && p.notes.toLowerCase().includes(search)) ||
      p.district.toLowerCase().includes(search);
      
    const matchesDistrict = (district === 'all') || (p.district.toLowerCase() === district.toLowerCase());
    const matchesCategory = (category === 'all') || (p.category === category);

    return matchesSearch && matchesDistrict && matchesCategory;
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

function renderPlaces() {
  const container = document.getElementById("placesList");
  const emptyState = document.getElementById("emptyState");
  const filtered = getFilteredPlaces();

  container.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filtered.forEach(place => {
    const card = document.createElement("div");
    card.id = `card-${place.id}`;
    card.className = "bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5";

    // Kategoriye göre ikon/etiket
    let catBadgeColor = "bg-rose-50 text-rose-700 border-rose-200/80";
    let catIcon = "🍽️";
    if (place.category === 'Cafe') { catBadgeColor = "bg-amber-50 text-amber-700 border-amber-200/80"; catIcon = "☕"; }
    else if (place.category === 'Tatlı') { catBadgeColor = "bg-purple-50 text-purple-700 border-purple-200/80"; catIcon = "🍰"; }
    else if (place.category === 'Sokak Lezzeti') { catBadgeColor = "bg-orange-50 text-orange-700 border-orange-200/80"; catIcon = "🌯"; }
    else if (place.category === 'Meyhane / Bar') { catBadgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200/80"; catIcon = "🍸"; }

    // Skor rozeti
    let scoreBadgeColor = "bg-emerald-500 text-white shadow-emerald-500/25";
    if (place.score < 7.5) scoreBadgeColor = "bg-rose-500 text-white shadow-rose-500/25";
    else if (place.score < 9.0) scoreBadgeColor = "bg-amber-500 text-white shadow-amber-500/25";

    // Google Maps Yol Tarifi linki
    const gmapsUrl = place.lat && place.lng 
      ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}` 
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.district + ' İstanbul')}`;

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-3 mb-2.5">
          <div class="space-y-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${catBadgeColor} flex items-center gap-1">
                <span>${catIcon}</span>
                <span>${escapeHtml(place.category)}</span>
              </span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                📍 ${escapeHtml(place.district)}
              </span>
            </div>
            <h3 class="text-base font-extrabold text-slate-900 group-hover:text-rose-600 transition leading-snug">${escapeHtml(place.name)}</h3>
          </div>
          
          <div class="flex flex-col items-end shrink-0">
            <div class="px-2.5 py-1 rounded-xl text-xs font-black shadow-md flex items-center gap-1 ${scoreBadgeColor}">
              <i data-lucide="star" class="w-3 h-3 fill-white"></i>
              <span>${Number(place.score).toFixed(1)}</span>
            </div>
          </div>
        </div>

        ${place.favorite ? `
          <div class="mt-2.5 text-xs bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-100 p-2.5 rounded-xl">
            <div class="flex items-center gap-1 text-[11px] font-bold text-amber-800 mb-0.5">
              <i data-lucide="sparkles" class="w-3 h-3 text-amber-500"></i>
              <span>Favori Lezzet:</span>
            </div>
            <span class="text-slate-700 font-medium">${escapeHtml(place.favorite)}</span>
          </div>
        ` : ''}

        ${place.notes ? `
          <p class="mt-2.5 text-xs text-slate-500 italic line-clamp-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
            "${escapeHtml(place.notes)}"
          </p>
        ` : ''}
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <button onclick="window.zoomToPlace('${place.id}')" class="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1.5 rounded-xl transition">
            <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
            <span>Haritada</span>
          </button>
          <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 bg-slate-100 hover:bg-slate-200/70 px-2.5 py-1.5 rounded-xl transition" title="Google Haritalar ile Yol Tarifi Al">
            <i data-lucide="navigation" class="w-3.5 h-3.5 text-blue-500"></i>
            <span class="hidden sm:inline">Git</span>
          </a>
        </div>
        
        <div class="flex items-center gap-1">
          <button onclick="window.editPlace('${place.id}')" class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition" title="Düzenle">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="window.deletePlace('${place.id}')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Sil">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  updateMapMarkers(filtered);
  initIcons();
}

// İlçe Seçenekleri Doldur
function renderDistrictDropdowns() {
  const districtFilter = document.getElementById("districtFilter");
  const routeDistrict = document.getElementById("routeDistrictSelect");

  const uniqueDistricts = [...new Set(places.map(p => p.district))].sort();

  // Filtre select
  const currentVal = districtFilter.value;
  districtFilter.innerHTML = '<option value="all">Tüm Bölgeler</option>';
  uniqueDistricts.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = `${d} (${places.filter(p => p.district === d).length})`;
    districtFilter.appendChild(opt);
  });
  if (uniqueDistricts.includes(currentVal)) {
    districtFilter.value = currentVal;
  }

  // Rota ilçe select
  routeDistrict.innerHTML = '';
  if (uniqueDistricts.length === 0) {
    routeDistrict.innerHTML = '<option value="">Henüz mekan yok</option>';
  } else {
    uniqueDistricts.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = `${d} (${places.filter(p => p.district === d).length} Mekan)`;
      routeDistrict.appendChild(opt);
    });
    // Kadıköy varsa varsayılan yap
    if (uniqueDistricts.includes("Kadıköy")) {
      routeDistrict.value = "Kadıköy";
    }
  }
}

// ROTA SİHİRBAZI OLUŞTURUCU
function generateRoute() {
  const district = document.getElementById("routeDistrictSelect").value;
  const stopCount = parseInt(document.getElementById("routeStopCount").value, 10) || 3;

  if (!district) {
    showToast("Lütfen bir bölge seçin!", "error");
    return;
  }

  // Seçilen bölgedeki mekanları al
  let districtPlaces = places.filter(p => p.district.toLowerCase() === district.toLowerCase());

  if (districtPlaces.length === 0) {
    showToast(`${district} bölgesinde kayıtlı mekan yok!`, "error");
    return;
  }

  // Akıllı sıralama:
  // Durak 1: Yemek veya Sokak Lezzeti (veya en yüksek puanlı mekan)
  // Durak 2: Cafe / Kahve
  // Durak 3: Tatlı veya Cafe
  // Durak 4: Bar veya alternatif mekan

  let route = [];
  let pool = [...districtPlaces];

  // Kategorilere göre grupla
  const foodPlaces = pool.filter(p => p.category === 'Yemek' || p.category === 'Sokak Lezzeti').sort((a,b) => b.score - a.score);
  const cafePlaces = pool.filter(p => p.category === 'Cafe').sort((a,b) => b.score - a.score);
  const dessertPlaces = pool.filter(p => p.category === 'Tatlı').sort((a,b) => b.score - a.score);
  const otherPlaces = pool.filter(p => p.category === 'Meyhane / Bar').sort((a,b) => b.score - a.score);

  // 1. Durak (Yemek)
  if (foodPlaces.length > 0) {
    route.push({ place: foodPlaces[0], role: "1. Durak: Öğle / Akşam Yemeği 🍽️" });
  } else if (pool.length > 0) {
    route.push({ place: pool[0], role: "1. Durak: Başlangıç Lezzeti 📍" });
  }

  // 2. Durak (Kahve & Dinlenme)
  const remainingCafes = cafePlaces.filter(c => !route.some(r => r.place.id === c.id));
  if (remainingCafes.length > 0) {
    route.push({ place: remainingCafes[0], role: "2. Durak: Kahve Molası ☕" });
  } else {
    const nextBest = pool.filter(p => !route.some(r => r.place.id === p.id)).sort((a,b) => b.score - a.score)[0];
    if (nextBest && route.length < stopCount) {
      route.push({ place: nextBest, role: "2. Durak: Keyif Molası ☕" });
    }
  }

  // 3. Durak (Tatlı veya Özel Kapanış)
  if (stopCount >= 3) {
    const remainingDesserts = dessertPlaces.filter(d => !route.some(r => r.place.id === d.id));
    if (remainingDesserts.length > 0) {
      route.push({ place: remainingDesserts[0], role: "3. Durak: Tatlı Şöleni 🍰" });
    } else {
      const nextBest = pool.filter(p => !route.some(r => r.place.id === p.id)).sort((a,b) => b.score - a.score)[0];
      if (nextBest) {
        route.push({ place: nextBest, role: "3. Durak: Günün Kapanışı ✨" });
      }
    }
  }

  // 4. Durak (Opsiyonel kokteyl veya ekstra mekan)
  if (stopCount >= 4) {
    const nextBest = pool.filter(p => !route.some(r => r.place.id === p.id)).sort((a,b) => b.score - a.score)[0];
    if (nextBest) {
      route.push({ place: nextBest, role: "4. Durak: Akşam Kapanışı / İçecek 🍸" });
    }
  }

  if (route.length === 0) {
    showToast("Bu bölgede yeterli mekan bulunamadı.", "error");
    return;
  }

  renderRouteResult(district, route);
}

function renderRouteResult(district, route) {
  const container = document.getElementById("routeTimeline");
  const resultWrapper = document.getElementById("routeResultContainer");
  const title = document.getElementById("routeTitle");

  title.innerHTML = `<i data-lucide="footprints" class="w-5 h-5 text-rose-500"></i> ${district} Gurme Gezi Rotası (${route.length} Durak)`;

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
      <div class="absolute left-3 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-extrabold text-xs flex items-center justify-center ring-4 ring-white shadow-md">
        ${index + 1}
      </div>
      <div class="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-100">${item.role}</span>
          <span class="text-xs font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-xl shadow-xs">★ ${place.score}</span>
        </div>
        <h4 class="text-base font-extrabold text-slate-900">${escapeHtml(place.name)}</h4>
        <p class="text-xs text-slate-500 mb-2">🏷️ ${escapeHtml(place.category)} • 📍 ${escapeHtml(place.district)}</p>
        ${place.favorite ? `
          <div class="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-700 mb-2 border border-slate-100">
            <span class="font-bold text-amber-700">🌟 Ne Yenmeli:</span> ${escapeHtml(place.favorite)}
          </div>
        ` : ''}
        ${place.notes ? `<p class="text-xs text-slate-500 italic mb-2">"${escapeHtml(place.notes)}"</p>` : ''}
        <div class="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl transition">
            <i data-lucide="navigation" class="w-3.5 h-3.5 text-blue-500"></i> Yol Tarifi
          </a>
          <button onclick="window.zoomToPlace('${place.id}')" class="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2.5 py-1.5 rounded-xl transition">
            <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> Haritada Gör
          </button>
        </div>
      </div>
    `;

    container.appendChild(step);
  });

  // Haritaya rota çizgisi ekle
  if (routeCoords.length > 1) {
    routePolyline = L.polyline(routeCoords, {
      color: '#f43f5e',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.8
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
  // Mekanlar sekmesine geç
  switchTab('places');
  setTimeout(() => {
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add("ring-2", "ring-rose-500");
      setTimeout(() => card.classList.remove("ring-2", "ring-rose-500"), 2000);
    }
  }, 100);
};

window.deletePlace = function(id) {
  const p = places.find(x => x.id === id);
  if (!p) return;
  if (confirm(`"${p.name}" mekanını silmek istediğinize emin misiniz?`)) {
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
  document.getElementById("modalTitle").innerHTML = `<i data-lucide="edit" class="w-5 h-5 text-rose-500"></i><span>Mekanı Düzenle</span>`;
  document.getElementById("modalPlaceName").value = p.name;
  document.getElementById("modalPlaceDistrict").value = p.district;
  document.getElementById("modalPlaceCategory").value = p.category;
  document.getElementById("modalPlaceScore").value = p.score;
  document.getElementById("ratingDisplayValue").innerText = Number(p.score).toFixed(1);
  document.getElementById("modalPlaceFavorite").value = p.favorite || "";
  document.getElementById("modalPlaceNotes").value = p.notes || "";
  document.getElementById("modalPlaceLat").value = p.lat || "";
  document.getElementById("modalPlaceLng").value = p.lng || "";

  openModal();
};

function switchTab(tab) {
  currentTab = tab;
  
  // Elementler
  const tabPlacesBtn = document.getElementById("tabPlaces");
  const tabRouteBtn = document.getElementById("tabRoute");
  const viewPlaces = document.getElementById("viewPlaces");
  const viewRoute = document.getElementById("viewRoute");
  const leftCol = document.getElementById("leftColumnContainer");
  const rightCol = document.getElementById("rightMapContainer");

  // Mobil Segment Butonları
  const mTabPlaces = document.getElementById("mobileTabPlaces");
  const mTabMap = document.getElementById("mobileTabMap");
  const mTabRoute = document.getElementById("mobileTabRoute");

  // Alt Bar Butonları
  const bNavPlaces = document.getElementById("bottomNavPlaces");
  const bNavMap = document.getElementById("bottomNavMap");
  const bNavRoute = document.getElementById("bottomNavRoute");

  const isMobile = window.innerWidth < 1024;

  const resetStyles = () => {
    if (mTabPlaces) mTabPlaces.className = "py-2 text-xs font-bold rounded-lg transition text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5";
    if (mTabMap) mTabMap.className = "py-2 text-xs font-bold rounded-lg transition text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5";
    if (mTabRoute) mTabRoute.className = "py-2 text-xs font-bold rounded-lg transition text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5";
    
    if (bNavPlaces) bNavPlaces.className = "flex flex-col items-center gap-1 text-slate-400 font-semibold text-[10px]";
    if (bNavMap) bNavMap.className = "flex flex-col items-center gap-1 text-slate-400 font-semibold text-[10px]";
    if (bNavRoute) bNavRoute.className = "flex flex-col items-center gap-1 text-slate-400 font-semibold text-[10px]";
  };

  resetStyles();

  if (tab === 'places') {
    if (tabPlacesBtn) tabPlacesBtn.className = "px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition bg-white text-slate-900 shadow-sm flex items-center gap-2";
    if (tabRouteBtn) tabRouteBtn.className = "px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-2";
    
    viewPlaces.classList.remove("hidden");
    viewRoute.classList.add("hidden");

    if (leftCol) leftCol.classList.remove("hidden");
    if (rightCol) {
      if (isMobile) rightCol.classList.add("hidden");
      else rightCol.classList.remove("hidden");
    }

    if (mTabPlaces) mTabPlaces.className = "py-2 text-xs font-bold rounded-lg transition text-slate-900 bg-white shadow-sm flex items-center justify-center gap-1.5";
    if (bNavPlaces) bNavPlaces.className = "flex flex-col items-center gap-1 text-rose-500 font-bold text-[10px]";

    if (routePolyline) {
      map.removeLayer(routePolyline);
      routePolyline = null;
    }
    updateMapMarkers(getFilteredPlaces());
    document.getElementById("activeMapFilterNote").innerText = "Tüm Mekanlar";
  } else if (tab === 'map') {
    // Sadece mobilde tam ekran harita
    if (leftCol && isMobile) leftCol.classList.add("hidden");
    if (rightCol) {
      rightCol.classList.remove("hidden");
      rightCol.classList.remove("lg:flex"); // zorla göster
      rightCol.classList.add("flex");
    }

    if (mTabMap) mTabMap.className = "py-2 text-xs font-bold rounded-lg transition text-blue-600 bg-white shadow-sm flex items-center justify-center gap-1.5";
    if (bNavMap) bNavMap.className = "flex flex-col items-center gap-1 text-blue-500 font-bold text-[10px]";

    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        const filtered = getFilteredPlaces();
        if (filtered.length > 0) {
          const latlngs = filtered.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng]);
          if (latlngs.length > 0) map.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] });
        }
      }
    }, 200);
  } else if (tab === 'route') {
    if (tabRouteBtn) tabRouteBtn.className = "px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition bg-white text-slate-900 shadow-sm flex items-center gap-2";
    if (tabPlacesBtn) tabPlacesBtn.className = "px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-2";
    
    viewRoute.classList.remove("hidden");
    viewPlaces.classList.add("hidden");

    if (leftCol) leftCol.classList.remove("hidden");
    if (rightCol) {
      if (isMobile) rightCol.classList.add("hidden");
      else rightCol.classList.remove("hidden");
    }

    if (mTabRoute) mTabRoute.className = "py-2 text-xs font-bold rounded-lg transition text-amber-700 bg-white shadow-sm flex items-center justify-center gap-1.5";
    if (bNavRoute) bNavRoute.className = "flex flex-col items-center gap-1 text-amber-500 font-bold text-[10px]";
  }
  initIcons();
}

// Event Listeners
function setupEventListeners() {
  // Masaüstü Sekmeler
  const tabPlaces = document.getElementById("tabPlaces");
  if (tabPlaces) tabPlaces.addEventListener("click", () => switchTab('places'));
  const tabRoute = document.getElementById("tabRoute");
  if (tabRoute) tabRoute.addEventListener("click", () => switchTab('route'));

  // Mobil Segment Butonları
  const mTabPlaces = document.getElementById("mobileTabPlaces");
  if (mTabPlaces) mTabPlaces.addEventListener("click", () => switchTab('places'));
  const mTabMap = document.getElementById("mobileTabMap");
  if (mTabMap) mTabMap.addEventListener("click", () => switchTab('map'));
  const mTabRoute = document.getElementById("mobileTabRoute");
  if (mTabRoute) mTabRoute.addEventListener("click", () => switchTab('route'));

  // Mobil Alt Bar Butonları
  const bNavPlaces = document.getElementById("bottomNavPlaces");
  if (bNavPlaces) bNavPlaces.addEventListener("click", () => switchTab('places'));
  const bNavMap = document.getElementById("bottomNavMap");
  if (bNavMap) bNavMap.addEventListener("click", () => switchTab('map'));
  const bNavAdd = document.getElementById("bottomNavAdd");
  if (bNavAdd) bNavAdd.addEventListener("click", () => {
    openNewPlaceModalDirect();
  });
  const bNavRoute = document.getElementById("bottomNavRoute");
  if (bNavRoute) bNavRoute.addEventListener("click", () => switchTab('route'));

  // Arama Temizle Butonu
  const clearPlacesBtn = document.getElementById("clearPlacesSearchBtn");
  const searchInput = document.getElementById("searchInput");
  if (searchInput && clearPlacesBtn) {
    searchInput.addEventListener("input", (e) => {
      if (e.target.value.length > 0) clearPlacesBtn.classList.remove("hidden");
      else clearPlacesBtn.classList.add("hidden");
      renderPlaces();
    });
    clearPlacesBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearPlacesBtn.classList.add("hidden");
      renderPlaces();
      searchInput.focus();
    });
  }

  document.getElementById("districtFilter").addEventListener("change", renderPlaces);
  document.getElementById("categoryFilter").addEventListener("change", renderPlaces);
  document.getElementById("sortFilter").addEventListener("change", renderPlaces);

  document.getElementById("generateRouteBtn").addEventListener("click", generateRoute);

  // Puan slider senkronizasyonu
  const scoreSlider = document.getElementById("modalPlaceScore");
  const scoreDisplay = document.getElementById("ratingDisplayValue");
  scoreSlider.addEventListener("input", (e) => {
    scoreDisplay.innerText = Number(e.target.value).toFixed(1);
  });

  // Modal Aç/Kapa
  const openPlaceBtn = document.getElementById("openNewPlaceModal");
  if (openPlaceBtn) openPlaceBtn.addEventListener("click", openNewPlaceModalDirect);

  document.getElementById("closeModalBtn").addEventListener("click", closeModal);
  document.getElementById("cancelModalBtn").addEventListener("click", closeModal);

  // Google Maps ve Hızlı Arama
  setupQuickSearch();

  // Form submit
  document.getElementById("placeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    savePlaceFromModal();
  });

  // Haritayı ortala
  document.getElementById("recenterMapBtn").addEventListener("click", () => {
    const filtered = getFilteredPlaces();
    updateMapMarkers(filtered);
  });

  // Dışa / İçe aktar
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("importBtnTrigger").addEventListener("click", () => {
    document.getElementById("importInput").click();
  });
  document.getElementById("importInput").addEventListener("change", importData);

  // Rotayı kopyala
  document.getElementById("copyRouteBtn").addEventListener("click", copyRouteToClipboard);
}

function openNewPlaceModalDirect() {
  const form = document.getElementById("placeForm");
  if (form) form.reset();
  
  const idInput = document.getElementById("placeId");
  if (idInput) idInput.value = "";
  
  const title = document.getElementById("modalTitle");
  if (title) title.innerHTML = `<i data-lucide="plus-circle" class="w-5 h-5 text-rose-500"></i><span>Yeni Mekan Ekle</span>`;
  
  const displayVal = document.getElementById("ratingDisplayValue");
  if (displayVal) displayVal.innerText = "9.0";
  
  const scoreInput = document.getElementById("modalPlaceScore");
  if (scoreInput) scoreInput.value = "9";
  
  const quickInput = document.getElementById("quickSearchInput");
  if (quickInput) quickInput.value = "";
  
  const dropdown = document.getElementById("searchResultsDropdown");
  if (dropdown) dropdown.classList.add("hidden");

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
  const name = document.getElementById("modalPlaceName").value.trim();
  const district = document.getElementById("modalPlaceDistrict").value.trim();
  const category = document.getElementById("modalPlaceCategory").value;
  const score = parseFloat(document.getElementById("modalPlaceScore").value);
  const favorite = document.getElementById("modalPlaceFavorite").value.trim();
  const notes = document.getElementById("modalPlaceNotes").value.trim();
  
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
      places[index] = { ...places[index], name, district, category, score, favorite, notes, lat, lng };
      showToast("Mekan bilgileri güncellendi.");
    }
  } else {
    // Yeni ekleme
    const newPlace = {
      id: "p_" + Date.now(),
      name,
      district,
      category,
      score,
      favorite,
      notes,
      lat,
      lng,
      createdAt: Date.now()
    };
    places.unshift(newPlace);
    showToast("Yeni mekan listenize eklendi! ✨");
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

  let text = `🗺️ Günün ${district} Gurme Rotası:\n\n`;
  steps.forEach((step, idx) => {
    const name = step.querySelector("h4").innerText;
    const role = step.querySelector(".text-rose-600").innerText;
    const score = step.querySelector(".text-amber-700").innerText;
    text += `${idx + 1}. [${role}] ${name} (${score})\n`;
  });
  text += `\n✨ İstanbul Gezi Rehberi ile planlandı.`;

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
// GOOGLE MAPS TARZI CANLI MEKAN ARAMA & LİNK SİSTEMİ
// -------------------------------------------------------------
let searchDebounceTimeout = null;

function setupQuickSearch() {
  const quickInput = document.getElementById("quickSearchInput");
  const dropdown = document.getElementById("searchResultsDropdown");
  const spinner = document.getElementById("searchSpinner");
  const clearBtn = document.getElementById("clearSearchBtn");

  if (!quickInput) return;

  // Temizleme butonu
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      quickInput.value = "";
      clearBtn.classList.add("hidden");
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
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

    if (!val) {
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      return;
    }

    // 1. Google Maps linki mi?
    if (val.includes("google.com/maps") || val.includes("maps.app.goo.gl") || val.includes("goo.gl/maps")) {
      handleGoogleMapsLink(val);
      return;
    }

    // 2. Normal mekan adı araması
    clearTimeout(searchDebounceTimeout);
    if (val.length < 2) {
      dropdown.classList.add("hidden");
      return;
    }

    spinner.classList.remove("hidden");
    searchDebounceTimeout = setTimeout(() => {
      fetchPlaceSuggestions(val);
    }, 300);
  });

  // Dışarı tıklandığında dropdown kapat
  document.addEventListener("click", (e) => {
    if (!quickInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
}

// Google Maps URL çözümleyici
function handleGoogleMapsLink(url) {
  const spinner = document.getElementById("searchSpinner");
  spinner.classList.remove("hidden");

  try {
    let placeName = "";
    let lat = null;
    let lng = null;

    // Örn: https://www.google.com/maps/place/Basta!+Street+Food+Bar/@40.9860,29.0260,17z/...
    const placeMatch = url.match(/\/place\/([^\/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    }

    // Koordinat bulma: @40.9860,29.0260 veya ?q=40.9860,29.0260
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    }

    if (placeName) {
      document.getElementById("modalPlaceName").value = placeName;
      autoDetectCategoryAndDistrict(placeName, lat, lng);
      showToast(`"${placeName}" linkten başarıyla okundu! ✨`);
    } else {
      showToast("Link tespit edildi, koordinat ve detaylar aktarılıyor...", "info");
    }

    if (lat && lng) {
      document.getElementById("modalPlaceLat").value = lat.toFixed(5);
      document.getElementById("modalPlaceLng").value = lng.toFixed(5);
    }
  } catch (err) {
    console.error("Link parsing error:", err);
  } finally {
    spinner.classList.add("hidden");
  }
}

// Google Maps Tarzı Canlı Arama Motoru (Photon + Nominatim Hibrit)
async function fetchPlaceSuggestions(query) {
  const dropdown = document.getElementById("searchResultsDropdown");
  const spinner = document.getElementById("searchSpinner");

  let results = [];

  try {
    // 1. Photon API (Mekan ve restoran aramalarında son derece hızlı ve esnektir)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=41.0082&lon=28.9784&limit=7`;
    const res = await fetch(photonUrl);
    const data = await res.json();

    if (data && data.features && data.features.length > 0) {
      results = data.features.map(f => {
        const p = f.properties || {};
        const coords = f.geometry && f.geometry.coordinates ? f.geometry.coordinates : [28.9784, 41.0082];
        const name = p.name || query;
        const district = p.district || p.suburb || p.city || p.locality || p.county || "İstanbul";
        const street = p.street ? `${p.street}` : "";
        const category = p.osm_value || p.osm_key || "";
        return {
          name: name,
          district: district,
          subtitle: [street, district, p.state || "İstanbul"].filter(Boolean).join(", "),
          category: category,
          lat: coords[1],
          lng: coords[0]
        };
      });
    }
  } catch (err) {
    console.warn("Photon search fallback:", err);
  }

  // Eğer Photon az sonuç verdiyse veya hata aldıysa Nominatim ile tamamla
  if (results.length === 0) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' İstanbul')}&format=json&addressdetails=1&limit=5&accept-language=tr`;
      const nomRes = await fetch(nomUrl);
      const nomData = await nomRes.json();
      if (nomData && nomData.length > 0) {
        results = nomData.map(item => {
          const addr = item.address || {};
          const district = addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.county || "İstanbul";
          const mainName = item.name || item.display_name.split(",")[0];
          return {
            name: mainName,
            district: district,
            subtitle: item.display_name.split(",").slice(1, 4).join(",").trim(),
            category: item.type || item.category || "",
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });
      }
    } catch (e) {
      console.error("Nominatim search error:", e);
    }
  }

  spinner.classList.add("hidden");

  if (results.length === 0) {
    dropdown.innerHTML = `
      <div class="p-3 text-center">
        <p class="text-xs font-semibold text-slate-700">Mekan bulunamadı</p>
        <p class="text-[11px] text-slate-400 mt-0.5">"${escapeHtml(query)}" adını doğrudan form alanına yazabilirsiniz.</p>
      </div>`;
    dropdown.classList.remove("hidden");
    return;
  }

  // Google Maps stili zengin liste görünümü
  dropdown.innerHTML = "";
  results.forEach(item => {
    const row = document.createElement("div");
    row.className = "p-3 hover:bg-rose-50/70 cursor-pointer transition flex items-center justify-between text-left group";
    
    // Kategoriye uygun ikon seçimi
    let icon = "🍽️";
    const catLower = (item.category + " " + item.name).toLowerCase();
    if (catLower.includes("cafe") || catLower.includes("kahve") || catLower.includes("coffee")) icon = "☕";
    else if (catLower.includes("tatlı") || catLower.includes("baklava") || catLower.includes("fırın")) icon = "🍰";
    else if (catLower.includes("bar") || catLower.includes("pub")) icon = "🍸";
    else if (catLower.includes("kebap") || catLower.includes("döner") || catLower.includes("dürüm")) icon = "🥩";

    row.innerHTML = `
      <div class="flex items-start gap-2.5 overflow-hidden">
        <span class="text-base p-1.5 bg-slate-100 rounded-lg group-hover:bg-white transition shrink-0">${icon}</span>
        <div class="overflow-hidden">
          <div class="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition truncate">${escapeHtml(item.name)}</div>
          <div class="text-[11px] text-slate-500 truncate mt-0.5">${escapeHtml(item.subtitle)}</div>
        </div>
      </div>
      <button type="button" class="text-xs bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white px-2.5 py-1 rounded-lg font-semibold transition shrink-0 ml-2">
        Seç
      </button>
    `;

    row.addEventListener("click", () => {
      applySelectedPlace(item);
      dropdown.classList.add("hidden");
    });

    dropdown.appendChild(row);
  });

  dropdown.classList.remove("hidden");
}

// Seçilen mekanı form alanlarına doldur
function applySelectedPlace(info) {
  document.getElementById("modalPlaceName").value = info.name;
  
  if (info.lat && info.lng) {
    document.getElementById("modalPlaceLat").value = Number(info.lat).toFixed(5);
    document.getElementById("modalPlaceLng").value = Number(info.lng).toFixed(5);
  }

  // İlçe tahmini (İstanbul ilçe listesinden eşleştir)
  let detectedDistrict = "Kadıköy";
  const haystack = (info.district + " " + info.subtitle).toLowerCase();
  for (const known of Object.keys(DISTRICT_COORDS)) {
    if (haystack.includes(known.toLowerCase())) {
      detectedDistrict = known;
      break;
    }
  }
  document.getElementById("modalPlaceDistrict").value = detectedDistrict;

  // Kategori tahmini
  const nameLower = (info.name + " " + (info.category || "")).toLowerCase();
  
  if (nameLower.includes("cafe") || nameLower.includes("kahve") || nameLower.includes("coffee") || nameLower.includes("çay")) {
    document.getElementById("modalPlaceCategory").value = "Cafe";
  } else if (nameLower.includes("tatlı") || nameLower.includes("çikolata") || nameLower.includes("baklava") || nameLower.includes("pasta") || nameLower.includes("fırın") || nameLower.includes("muhallebi")) {
    document.getElementById("modalPlaceCategory").value = "Tatlı";
  } else if (nameLower.includes("dürüm") || nameLower.includes("burger") || nameLower.includes("döner") || nameLower.includes("kokoreç") || nameLower.includes("midye") || nameLower.includes("sokak")) {
    document.getElementById("modalPlaceCategory").value = "Sokak Lezzeti";
  } else if (nameLower.includes("bar") || nameLower.includes("pub") || nameLower.includes("meyhane") || nameLower.includes("bira")) {
    document.getElementById("modalPlaceCategory").value = "Meyhane / Bar";
  } else {
    document.getElementById("modalPlaceCategory").value = "Yemek";
  }

  document.getElementById("quickSearchInput").value = info.name;
  const clearBtn = document.getElementById("clearSearchBtn");
  if (clearBtn) clearBtn.classList.remove("hidden");

  showToast(`"${info.name}" bilgileri ve konumu aktarıldı! ✅`);
}

function autoDetectCategoryAndDistrict(name, lat, lng) {
  // Koordinat ile en yakın bilinen semti bul
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
  }

  const nameLower = name.toLowerCase();
  if (nameLower.includes("cafe") || nameLower.includes("kahve") || nameLower.includes("coffee")) {
    document.getElementById("modalPlaceCategory").value = "Cafe";
  } else if (nameLower.includes("tatlı") || nameLower.includes("çikolata") || nameLower.includes("baklava") || nameLower.includes("pastane")) {
    document.getElementById("modalPlaceCategory").value = "Tatlı";
  } else if (nameLower.includes("dürüm") || nameLower.includes("burger") || nameLower.includes("döner")) {
    document.getElementById("modalPlaceCategory").value = "Sokak Lezzeti";
  } else if (nameLower.includes("bar") || nameLower.includes("pub") || nameLower.includes("meyhane")) {
    document.getElementById("modalPlaceCategory").value = "Meyhane / Bar";
  }
}


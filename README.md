# 🗺️ İstanbul Gezi & Gurme Rehberi

Gezdiğiniz mekanları ve tarihi/turistik yerleri puanlayabileceğiniz, **Fırat & Zeliha** kullanıcılarına göre etiketleyebileceğiniz, **Gezilecek Yerler** ve **Lezzet Mekanları** olarak ayrı bölmelerde listeleyip tek tıkla rotalar çıkarabileceğiniz interaktif rehberiniz.

---

### 🚀 Nasıl Çalıştırılır? (Kalıcı Hafıza İçin)

1. **Önerilen (Tek Tıkla Başlatma - Kalıcı Disk Kaydı):**
   - Klasördeki **`GeziRehberi.bat`** dosyasına çift tıklayın.
   - Uygulama otomatik olarak açılır ve eklediğiniz tüm mekanlar doğrudan bilgisayarınızdaki **`places_data.json`** dosyasına kaydedilir.
   - Tarayıcınızı kapatsanız veya geçmişi temizleseniz dahi eklediğiniz hiçbir mekan **asla silinmez**!

2. **Alternatif Doğrudan Açılış:**
   - İsterseniz doğrudan **`index.html`** dosyasına çift tıklayarak da açabilirsiniz. Çok katmanlı IndexedDB ve LocalStorage koruması aktiftir.

---

### ✨ Öne Çıkan Özellikler

1. **🏛️ Ayrı Gezilecek Yerler & Manzaralar Kutucuğu:**
   - Tarihi yapılar, müzeler, seyir terasları ve sahiller ayrı bir vitrinde listelenir.
   - Restoranlar, kafeler, tatlıcılar ve sokak lezzetleri ise ayrı bir Lezzet Mekanları vitrininde yer alır.

2. **👥 Fırat & Zeliha Kullanıcı Seçimi:**
   - Mekan eklerken kimin önerdiğini (Fırat veya Zeliha) seçebilirsiniz.
   - Tek tıkla "Sadece Fırat'ın Ekledikleri" veya "Sadece Zeliha'nın Ekledikleri" olarak filtreleyebilirsiniz.

3. **💾 Asla Silinmeyen Çok Katmanlı Hafıza:**
   - **Tier 1 (Disk):** `places_data.json` sabit disk dosyası (GeziRehberi.bat ile).
   - **Tier 2 (IndexedDB):** Tarayıcı içi yüksek kapasiteli NoSQL veritabanı.
   - **Tier 3 (LocalStorage & Yedek Anahtarı):** Çift anahtarlı tarayıcı hafızası.
   - **Tier 4 (JSON Dışa / İçe Aktar):** İstenildiğinde tek tıkla dosya olarak yedekleme.

4. **🗺️ Modern Harita Deneyimi:**
   - Modern Retina Harita, Google Sokak Haritası, Google Uydu ve Gece Haritası olmak üzere 4 farklı harita katmanı.
   - Mekanlara tıklandığında harita o noktaya odaklanır ve Google Maps yol tarifi linki sunar.

5. **✨ Günün Gezi & Lezzet Rotası Sihirbazı:**
   - İster otomatik semt rotası (Kadıköy, Moda, Karaköy vb.), ister farklı semtlerden mekanları kendiniz seçerek günün rotasını oluşturabilirsiniz.
   - Rotayı tek tıkla panoya kopyalayıp paylaşabilirsiniz.


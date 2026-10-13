#!/usr/bin/env python3
"""
İstanbul Gezi & Gurme Rehberi - Yerel Sunucu ve Kalıcı JSON Depolama
Mekanları doğrudan sabit diskteki 'places_data.json' dosyasına kaydeder.
Tarayıcı kapansa veya önbellek temizlense bile verileriniz asla silinmez!
"""

import os
import sys
import json
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PORT = 5000
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "places_data.json")

class GeziRehberiHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # CORS ve önbellek engelleme başlıkları
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/places":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, "r", encoding="utf-8") as f:
                        data = f.read()
                    self.wfile.write(data.encode("utf-8"))
                    return
                except Exception as e:
                    print("places_data.json okuma hatası:", e)
            
            # Dosya yoksa boş liste dön
            self.wfile.write(b"[]")
            return

        elif parsed.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            res = {
                "status": "online",
                "dataFile": DATA_FILE,
                "exists": os.path.exists(DATA_FILE)
            }
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # Statik dosyaları sun (index.html, app.js vb.)
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/places":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                places_json = json.loads(post_data.decode("utf-8"))
                if isinstance(places_json, list):
                    # Diske güvenli ve formatlı JSON olarak yaz
                    with open(DATA_FILE, "w", encoding="utf-8") as f:
                        json.dump(places_json, f, ensure_ascii=False, indent=2)
                    
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    resp = {"success": True, "count": len(places_json), "message": "Diske kaydedildi"}
                    self.wfile.write(json.dumps(resp).encode("utf-8"))
                    print(f"[{len(places_json)} Mekan] -> places_data.json dosyasına başarıyla kaydedildi.")
                    return
            except Exception as e:
                print("JSON kaydetme hatası:", e)
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        self.send_response(404)
        self.end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ("127.0.0.1", PORT)
    try:
        httpd = HTTPServer(server_address, GeziRehberiHandler)
    except OSError:
        # 5000 portu meşgulse 5050'yi dene
        server_address = ("127.0.0.1", 5050)
        httpd = HTTPServer(server_address, GeziRehberiHandler)

    url = f"http://localhost:{server_address[1]}"
    print("=" * 60)
    print(f"  İstanbul Gezi & Gurme Rehberi Başlatıldı!")
    print(f"  Adres: {url}")
    print(f"  Veri Dosyası: {DATA_FILE}")
    print("=" * 60)
    print("Tarayıcınız otomatik açılıyor... (Durdurmak için Ctrl+C)")

    # Tarayıcıyı otomatik aç
    webbrowser.open(url)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nSunucu kapatıldı.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()

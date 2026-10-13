@echo off
chcp 65001 > nul
title Istanbul Gezi ve Gurme Rehberi
cd /d "%~dp0"

echo ======================================================================
echo           ISTANBUL GEZI VE GURME REHBERI BASLATILIYOR...
echo ======================================================================
echo.
echo  * Mekanlariniz kalici olarak 'places_data.json' dosyasina kaydedilir.
echo  * Tarayici kapansa bile verileriniz asla silinmez.
echo  * Tarayiciniz acilmazsa su adresi acin: http://localhost:5000
echo.
echo ======================================================================

python server.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [UYARI] Python bulunamadi veya bir hata olustu.
    echo index.html dogrudan tarayicida aciliyor...
    start index.html
    pause
)

$lines = [System.IO.File]::ReadAllLines("struktur.html", [System.Text.Encoding]::UTF8)
Write-Host "--- BARIS 1-20 ---"
for ($i = 0; $i -lt 20; $i++) { Write-Host $lines[$i] }
Write-Host ""
Write-Host "--- BARIS AKHIR (10 baris terakhir) ---"
$total = $lines.Length
for ($i = $total - 10; $i -lt $total; $i++) { Write-Host $lines[$i] }
Write-Host ""
Write-Host "Total baris: $total"

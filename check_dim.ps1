Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\User\Desktop\DoReady\DoReady\do-ready\public\LogoPrincipal.png"
$img = [System.Drawing.Image]::FromFile($imgPath)
Write-Host "Width: $($img.Width), Height: $($img.Height)"
$img.Dispose()

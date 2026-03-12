Add-Type -AssemblyName System.Drawing

function Resize-ImageY {
    param (
        [string]$Path,
        [float]$ScaleY = 0.8
    )
    
    if (-not (Test-Path $Path)) {
        Write-Host "File not found: $Path"
        return
    }

    $img = [System.Drawing.Image]::FromFile($Path)
    $originalWidth = $img.Width
    $originalHeight = $img.Height
    
    # Calculate new height while keeping original canvas
    $newHeight = [int]($originalHeight * $ScaleY)
    $offsetY = [int](($originalHeight - $newHeight) / 2)

    # Create a new bitmap with the same original dimensions (keeps the canvas square/proportional)
    $bmp = New-Object System.Drawing.Bitmap($originalWidth, $originalHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Draw the original image into the new bitmap, scaled in Y but centered
    $destRect = New-Object System.Drawing.Rectangle(0, $offsetY, $originalWidth, $newHeight)
    $graphics.DrawImage($img, $destRect)
    
    $img.Dispose()
    $graphics.Dispose()

    # Save the new image, overwriting the old one
    # Note: We save as PNG
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    
    Write-Host "Resized $Path : Vertical scale $ScaleY"
}

$publicDir = "c:\Users\User\Desktop\DoReady\DoReady\do-ready\public"
Resize-ImageY -Path "$publicDir\LogoPrincipal.png"
Resize-ImageY -Path "$publicDir\icon.png"
Resize-ImageY -Path "$publicDir\icon-512.png"

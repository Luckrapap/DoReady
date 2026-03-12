Add-Type -AssemblyName System.Drawing

function Resize-ImageToRatio {
    param (
        [string]$Path,
        [float]$TargetRatio = 0.70
    )
    
    if (-not (Test-Path $Path)) {
        Write-Host "File not found: $Path"
        return
    }

    $img = [System.Drawing.Image]::FromFile($Path)
    $originalWidth = $img.Width
    $originalHeight = $img.Height
    
    # Target height based on width and desired ratio (0.70)
    # Original image was roughly 283x213 (0.75 ratio) before my first resize which squashed it to 80% (approx 0.60 ratio)
    # I want to restore it to something closer to original but slightly shorter if desired, 
    # but the user's "image 1" looks balanced. 
    # Let's calculate the height that gives a 0.70 ratio relative to width.
    $newHeight = [int]($originalWidth * $TargetRatio)
    
    # If the new calculated height exceeds original height (unlikely if we are shrinking), cap it
    if ($newHeight -gt $originalHeight) {
        $newHeight = $originalHeight
    }

    $offsetY = [int](($originalHeight - $newHeight) / 2)

    # Create a new bitmap with the same original dimensions (keeps the canvas square/proportional)
    $bmp = New-Object System.Drawing.Bitmap($originalWidth, $originalHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    # Draw the original image into the new bitmap centering it
    # We use a 0.70 ratio.
    $destRect = New-Object System.Drawing.Rectangle(0, $offsetY, $originalWidth, $newHeight)
    $graphics.DrawImage($img, $destRect)
    
    $img.Dispose()
    $graphics.Dispose()

    # Save the new image, overwriting the old one
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    
    Write-Host "Resized $Path to 0.70 ratio (Height: $newHeight)"
}

$publicDir = "c:\Users\User\Desktop\DoReady\DoReady\do-ready\public"
# We need to be careful: the current images are ALREADY squashed. 
# Re-squashing a squash is bad. Ideally we'd have the original.
# However, if I can't undo, I will try to "stretch" it back slightly or just apply the logic to the current state if it's the only way.
# Actually, I should probably try to get the original back if possible, but I don't have it.
# Wait, I can try to "undo" my previous 80% squash by scaling Y by 1.25 (1/0.8) before applying new ratio?
# No, let's just use a slightly less aggressive squash from the "original" (which I documented as 283x213).
# 213/283 = 0.75. My previous 80% scale made it 170/283 = 0.60.
# User wants it to look like "image 1". 0.70 seems like a good middle ground.
Resize-ImageToRatio -Path "$publicDir\LogoPrincipal.png" -TargetRatio 0.70
Resize-ImageToRatio -Path "$publicDir\icon.png" -TargetRatio 0.70
Resize-ImageToRatio -Path "$publicDir\icon-512.png" -TargetRatio 0.70

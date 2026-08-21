$ffmpeg = "C:\Users\gurum\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe"
$ffprobe = "C:\Users\gurum\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffprobe.exe"

$root = "C:\Users\gurum\Videos\Vasavi"
$video1 = "$root\video1.mp4"   # vasavi 3d foursides (rotation)
$video2 = "$root\video2.mp4"   # vasavi zoom-out-in

$heroDir = "$root\public\hero"
$tempV1 = "$root\public\hero\_tmp_v1"
$tempV2 = "$root\public\hero\_tmp_v2"

# ---- Step 1: Inspect both videos ----
Write-Host "`n=== INSPECTING VIDEOS ===" -ForegroundColor Cyan
$info1 = & $ffprobe -v quiet -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration,nb_frames -of csv=p=0 $video1
$info2 = & $ffprobe -v quiet -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration,nb_frames -of csv=p=0 $video2
Write-Host "Video1 (foursides): $info1"
Write-Host "Video2 (zoom):      $info2"

# ---- Step 2: Delete ALL old hero frames (keep subdirs temporarily) ----
Write-Host "`n=== DELETING OLD FRAMES ===" -ForegroundColor Yellow
Get-ChildItem "$heroDir\*.webp" -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem "$heroDir\four-sides\*" -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse
Get-ChildItem "$heroDir\zoom\*" -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse
Write-Host "Old frames deleted."

# ---- Step 3: Create temp extraction folders ----
New-Item -ItemType Directory -Path $tempV1 -Force | Out-Null
New-Item -ItemType Directory -Path $tempV2 -Force | Out-Null

# ---- Step 4: Extract video1 (foursides 3D rotation) at 24fps ----
Write-Host "`n=== EXTRACTING VIDEO1 (3D Rotation) at 24fps ===" -ForegroundColor Green
& $ffmpeg -i $video1 -vf "fps=24,scale=1080:-2:flags=lanczos" -q:v 1 "$tempV1\f%04d.png" -y
$v1Count = (Get-ChildItem "$tempV1\*.png").Count
Write-Host "Video1 extracted: $v1Count frames"

# ---- Step 5: Extract video2 (zoom out/in) at 24fps ----
Write-Host "`n=== EXTRACTING VIDEO2 (Zoom) at 24fps ===" -ForegroundColor Green
& $ffmpeg -i $video2 -vf "fps=24,scale=1080:-2:flags=lanczos" -q:v 1 "$tempV2\f%04d.png" -y
$v2Count = (Get-ChildItem "$tempV2\*.png").Count
Write-Host "Video2 extracted: $v2Count frames"

# ---- Step 6: Build cinematic sequence ----
# PHASE 1: Full video1 (3D rotation) - all frames
# PHASE 2: video2 (zoom out portion = first 60% of frames)
# PHASE 3: video2 (zoom in portion = last 40% of frames)
# PHASE 4: Transition back via last frames of video2 -> first frames of video1 (overlap 20 frames each end)
# The overall sequence: V1[all] -> V2[all] -> back to V1 start for seamless loop

Write-Host "`n=== COMPOSING CINEMATIC SEQUENCE ===" -ForegroundColor Magenta

$v1Files = Get-ChildItem "$tempV1\*.png" | Sort-Object Name
$v2Files = Get-ChildItem "$tempV2\*.png" | Sort-Object Name

# We'll build the sequence:
# [V1 full] + [V2 full] = continuous loop
# Drop last 10 frames of V1 and first 10 of V2 to smooth transition
# Drop last 10 frames of V2 and first 10 of V1 to smooth loop back

$transitionFrames = 12

# Phase 1: V1 frames (skip last transitionFrames for smooth cut to V2)
$phase1 = $v1Files | Select-Object -First ($v1Files.Count - $transitionFrames)

# Phase 2: V2 frames (skip first transitionFrames for smooth entry)
$phase2 = $v2Files | Select-Object -Skip $transitionFrames | Select-Object -First ($v2Files.Count - $transitionFrames * 2)

# Phase 3: Back into V1 via last frames of V2 + first frames of V1 (skipping first transitionFrames)
# Just V1 from frame transitionFrames+1 to end-transitionFrames  (already captured in phase1)

$sequence = @()
$sequence += $phase1
$sequence += $phase2

$totalFrames = $sequence.Count
Write-Host "Total sequence frames: $totalFrames"

# ---- Step 7: Convert sequence to WebP and renumber ----
Write-Host "`n=== CONVERTING TO WEBP ===" -ForegroundColor Cyan
$idx = 1
foreach ($src in $sequence) {
    $outName = "frame-{0:D4}.webp" -f $idx
    $outPath = "$heroDir\$outName"
    
    # Convert PNG to high-quality WebP
    & $ffmpeg -i $src.FullName -vf "scale=1080:-2:flags=lanczos" -c:v libwebp -quality 88 -compression_level 4 $outPath -y -loglevel error
    
    if ($idx % 50 -eq 0) {
        Write-Host "  Converted $idx / $totalFrames frames..."
    }
    $idx++
}

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "Total WebP frames: $($idx - 1)"
Write-Host "Output: $heroDir"

# ---- Step 8: Cleanup temp folders ----
Remove-Item $tempV1 -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $tempV2 -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Temp folders cleaned."

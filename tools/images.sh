#!/bin/sh
# Makes the responsive photo set: AVIF + WebP at 640, 1280 and 1920 wide.
# Run from the project root; output goes to ./assets/img unless a third
# argument names another folder. Commit the output, so the site stays no-build.
# Needs ffmpeg (with SVT-AV1) and cwebp, both from Homebrew.
#
#   sh images.sh <source.jpg> <name> [out-dir]
#   sh ~/.claude/skills/atelier/tools/images.sh ~/Downloads/wok.jpg kitchen
#     ->  assets/img/kitchen-{640,1280,1920}.{avif,webp}
set -e
src="$1"; name="$2"; out="${3:-assets/img}"
[ -f "$src" ] && [ -n "$name" ] || { echo "usage: sh images.sh <source.jpg> <name> [out-dir]"; exit 1; }
mkdir -p "$out"
for w in 640 1280 1920; do
  ffmpeg -hide_banner -loglevel error -y -i "$src" -vf "scale=$w:-2" \
    -frames:v 1 -c:v libsvtav1 -svtav1-params loglevel=0 -crf 40 -pix_fmt yuv420p "$out/$name-$w.avif" 2>/dev/null
  cwebp -quiet -q 72 -resize "$w" 0 "$src" -o "$out/$name-$w.webp"
done
ls -l "$out/$name"-* | awk '{print $5, $9}'

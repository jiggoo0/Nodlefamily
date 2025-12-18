#!/usr/bin/env bash
# scripts/project-summary.sh
# สร้างไฟล์ PROJECT_SUMMARY.md โดยตรง (ไม่แสดงผลบน terminal)
# สแกนทุกไฟล์ในโครงสร้าง และแสดง 60 บรรทัดแรกของแต่ละไฟล์
# รองรับไฟล์ text ทุกชนิด และข้าม binary อัตโนมัติ

set -e
shopt -s nullglob

PROJECT_NAME="$(basename "$(pwd)")"
DATE_GEN="$(date '+%Y-%m-%d %H:%M:%S')"
OUTPUT_FILE="PROJECT_SUMMARY.md"

# โฟลเดอร์ที่ไม่ต้องสแกน
IGNORE_DIRS="node_modules|.git|.next|dist|build"

# สร้างไฟล์ใหม่ (overwrite)
cat > "$OUTPUT_FILE" <<EOF
# 📦 Project Summary: ${PROJECT_NAME}

> Generated on: ${DATE_GEN}

## 🗂 โครงสร้างโปรเจกต์

\`\`\`text
$(tree -a -I "$IGNORE_DIRS")
\`\`\`

## 📄 File Scan (แสดง 60 บรรทัดแรกของทุกไฟล์)
EOF

echo >> "$OUTPUT_FILE"

# สแกนไฟล์ทั้งหมด (ยกเว้น ignore dirs)
find . \
  -type d -regex ".*/\($IGNORE_DIRS\)" -prune -o \
  -type f -print |
sort |
while read -r file; do
  # ข้ามไฟล์ summary เอง
  [ "$file" = "./$OUTPUT_FILE" ] && continue

  REL_PATH="${file#./}"
  EXT="${REL_PATH##*.}"

  echo "### 📄 \`${REL_PATH}\`" >> "$OUTPUT_FILE"
  echo >> "$OUTPUT_FILE"

  # ตรวจว่าเป็น text file หรือไม่
  if grep -Iq . "$file"; then
    # ระบุ language hint สำหรับ markdown
    case "$EXT" in
      html) LANG="html" ;;
      css)  LANG="css" ;;
      js)   LANG="javascript" ;;
      json) LANG="json" ;;
      md)   LANG="markdown" ;;
      sh)   LANG="bash" ;;
      *)    LANG="" ;;
    esac

    echo "\`\`\`${LANG}" >> "$OUTPUT_FILE"
    sed -n '1,60p' "$file" >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
  else
    echo "_[binary file – ไม่แสดงเนื้อหา]_" >> "$OUTPUT_FILE"
  fi

  echo >> "$OUTPUT_FILE"
done

cat >> "$OUTPUT_FILE" <<EOF
---
_Generated automatically by project-summary.sh_
EOF
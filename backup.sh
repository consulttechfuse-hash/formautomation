#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p /home/joey/backup_$TIMESTAMP
cp -r app components lib types public hooks /home/joey/backup_$TIMESTAMP/ 2>/dev/null
cp package.json package-lock.json .env.local next.config.js tsconfig.json /home/joey/backup_$TIMESTAMP/ 2>/dev/null
echo "✅ Backup complete: /home/joey/backup_$TIMESTAMP"

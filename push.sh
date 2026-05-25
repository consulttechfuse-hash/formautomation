#!/bin/bash
cd /home/joey/techfuse-doccontrol
git add .
git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
git push
echo "✅ Pushed to GitHub"

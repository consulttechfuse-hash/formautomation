#!/bin/bash
cd /home/joey/techfuse-doccontrol
while true; do
  git add .
  if ! git diff --cached --quiet; then
    git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
    git push
    echo "✅ Auto-synced at $(date)"
  fi
  sleep 300  # Wait 5 minutes
done

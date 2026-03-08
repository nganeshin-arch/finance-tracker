@echo off
cd frontend
call npm run test:e2e -- key-metric-highlighting.spec.ts --project=chromium
cd ..

$ErrorActionPreference = "SilentlyContinue"
Remove-Item vercel.json
New-Item -ItemType Directory -Force -Path api
Move-Item backend/server.js api/index.js -Force
Move-Item backend/data api/data -Force
Move-Item frontend/* . -Force
Move-Item frontend/.* . -Force
Remove-Item -Recurse -Force frontend
Remove-Item -Recurse -Force backend
Remove-Item restructure.js

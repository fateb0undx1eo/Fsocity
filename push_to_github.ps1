$ErrorActionPreference = "Stop"
$repo = "c:\Users\SMART\Downloads\iot-dashboard"

Set-Location $repo

# Init repo
git init
git remote add origin "https://github.com/fateb0undx1eo/Fsocity.git"

# Stage all (respecting .gitignore)
git add .

# Commit
git commit -m "feat: complete fsociety IoT dashboard

- Landing page with pricing, features, about, contact pages
- Shared PublicNav component across all public pages
- Uniform pricing cards with equal heights
- Clean FeaturesPage 3-col grid
- New ContactPage
- Admin dashboard overhaul: 5-tab sidebar, delete users, broadcast
- Backend: DELETE /api/admin/user/:id, POST /api/admin/broadcast
- Email alert service via Nodemailer with anti-spam cooldown
- Machine dashboard with real-time sensor telemetry"

# Push
git push -u origin main

Write-Host "PUSH_SUCCESS"

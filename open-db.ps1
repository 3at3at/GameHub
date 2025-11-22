# Quick database access script
# Usage: .\open-db.ps1

Write-Host "Connecting to GameHubDb..." -ForegroundColor Green
sqlcmd -S "(localdb)\mssqllocaldb" -d "GameHubDb"


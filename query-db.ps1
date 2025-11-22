# Database Query Helper Script
# Usage: .\query-db.ps1

param(
    [string]$Query = "SELECT TOP 10 * FROM Shops"
)

$server = "(localdb)\mssqllocaldb"
$database = "GameHubDb"

Write-Host "`n=== GameHub Database Query ===" -ForegroundColor Cyan
Write-Host "Server: $server" -ForegroundColor Gray
Write-Host "Database: $database`n" -ForegroundColor Gray

# Run query with formatted output
sqlcmd -S $server -d $database -Q $Query -W -s "," -h -1

Write-Host "`n=== Query Complete ===`n" -ForegroundColor Cyan


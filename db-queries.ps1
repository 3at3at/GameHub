# Common Database Queries for GameHub
# Usage examples:
#   .\db-queries.ps1 -Query "shops"
#   .\db-queries.ps1 -Query "tournaments"
#   .\db-queries.ps1 -Query "users"

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("shops", "tournaments", "users", "reservations", "stations", "custom")]
    [string]$Query = "shops",
    
    [Parameter(Mandatory=$false)]
    [string]$CustomQuery = ""
)

$server = "(localdb)\mssqllocaldb"
$database = "GameHubDb"

$queries = @{
    "shops" = "SELECT Id, Name, City, Country, PhoneNumber, Email, HourlyRate, IsActive FROM Shops"
    "tournaments" = "SELECT Id, Title, GameName, StartDate, EndDate, PrizePool, MaxParticipants, CurrentParticipants FROM Tournaments"
    "users" = "SELECT Id, UserName, Email, PhoneNumber, CreatedAt FROM AspNetUsers"
    "reservations" = "SELECT Id, ShopId, UserId, StartTime, EndTime, Status FROM Reservations"
    "stations" = "SELECT Id, ShopId, StationNumber, IsAvailable FROM GamingStations"
}

if ($Query -eq "custom" -and $CustomQuery) {
    $sqlQuery = $CustomQuery
} elseif ($Query -eq "custom") {
    Write-Host "Error: Custom query requires -CustomQuery parameter" -ForegroundColor Red
    exit 1
} else {
    $sqlQuery = $queries[$Query]
}

Write-Host "`n=== Querying: $Query ===" -ForegroundColor Cyan
sqlcmd -S $server -d $database -Q $sqlQuery -W -h -1
Write-Host "`n"


try {
    Write-Host "Testing Contact Info API..." -ForegroundColor Green
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/contact-info" -Method GET
    Write-Host "Contact Info Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 3
    Write-Host "`nAPI Test Successful!" -ForegroundColor Green
} catch {
    Write-Host "Error testing API: $($_.Exception.Message)" -ForegroundColor Red
}
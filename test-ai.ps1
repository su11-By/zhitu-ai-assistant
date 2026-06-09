$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer sk-565a2a7246574104be61a3148938d8f7"
}

$body = @{
    model = "deepseek-v4-pro"
    messages = @(@{role = "user"; content = "Hello"})
    stream = $false
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3005/ai/chat/completions" -Method POST -Body $body -Headers $headers -UseBasicParsing
Write-Output $response.Content
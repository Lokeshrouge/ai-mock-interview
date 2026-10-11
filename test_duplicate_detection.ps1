# Test Question Duplicate Detection
Write-Host "Testing Question Duplicate Detection" -ForegroundColor Cyan

$previous = @()

for ($i = 1; $i -le 5; $i++) {
    Write-Host "`nGenerating Question $i..." -ForegroundColor Yellow
    
    $body = @{
        job_role = "Software Developer"
        interview_type = "TECHNICAL"
        difficulty = "MEDIUM"
        question_number = $i
        total_questions = 10
        candidate_skills = @("JavaScript", "React", "Node.js")
        previous_questions = $previous
    } | ConvertTo-Json -Depth 5
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/questions/generate-adaptive" -Method POST -Body $body -ContentType "application/json"
        
        Write-Host "Q$i`: " -NoNewline -ForegroundColor Green
        Write-Host $response.question -ForegroundColor White
        Write-Host "Topic: $($response.topic)" -ForegroundColor Gray
        
        # Add to previous questions
        $previous += $response.question
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========== Summary ===========" -ForegroundColor Cyan
Write-Host "Total Questions Generated: $($previous.Count)" -ForegroundColor White

# Check for duplicates
$duplicates = $previous | Group-Object | Where-Object { $_.Count -gt 1 }
if ($duplicates) {
    Write-Host "DUPLICATES FOUND:" -ForegroundColor Red
    $duplicates | ForEach-Object {
        Write-Host "  - $($_.Name) (appears $($_.Count) times)" -ForegroundColor Red
    }
} else {
    Write-Host "All questions are unique!" -ForegroundColor Green
}

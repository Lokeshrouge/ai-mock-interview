# Test validation and evaluation scoring
Write-Host "`n========== AI MOCK INTERVIEW VALIDATION TESTS ==========`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8000"

# Test payload template
function Test-Answer {
    param(
        [string]$TestName,
        [string]$Answer,
        [int]$ExpectedMaxScore = 100
    )
    
    Write-Host "`nTest: $TestName" -ForegroundColor Yellow
    Write-Host "Answer: '$Answer'" -ForegroundColor Gray
    
    $body = @{
        question = "What is the purpose of an index in a database?"
        question_type = "technical"
        difficulty = "medium"
        student_answer = $Answer
        expected_key_points = @("performance", "lookup", "query optimization")
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/evaluation/evaluate" -Method POST -Body $body -ContentType "application/json"
        
        Write-Host "Overall Score: $($response.overall_score)" -ForegroundColor $(if ($response.overall_score -le $ExpectedMaxScore) { "Green" } else { "Red" })
        Write-Host "Breakdown:" -ForegroundColor White
        Write-Host "  - Accuracy: $($response.breakdown.technical_accuracy)" -ForegroundColor White
        Write-Host "  - Completeness: $($response.breakdown.completeness)" -ForegroundColor White
        Write-Host "  - Clarity: $($response.breakdown.clarity)" -ForegroundColor White
        Write-Host "  - Relevance: $($response.breakdown.relevance)" -ForegroundColor White
        Write-Host "Feedback: $($response.detailed_feedback)" -ForegroundColor Gray
        
        if ($response.overall_score -le $ExpectedMaxScore) {
            Write-Host "✓ PASS" -ForegroundColor Green
        } else {
            Write-Host "✗ FAIL (Score $($response.overall_score) exceeds expected max $ExpectedMaxScore)" -ForegroundColor Red
        }
        
        return $response
    }
    catch {
        Write-Host "✗ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test A: Keyboard mash gibberish
Test-Answer -TestName "A. Keyboard Mash asdfghjkl" `
    -Answer "asdfghjkl qwertyuiop zxcvbnm" `
    -ExpectedMaxScore 0

# Test B: Empty answer
Test-Answer -TestName "B. Empty String" `
    -Answer "" `
    -ExpectedMaxScore 0

# Test C: Whitespace only
Test-Answer -TestName "C. Whitespace Only" `
    -Answer "   " `
    -ExpectedMaxScore 0

# Test D: Repeated characters
Test-Answer -TestName "D. Repeated Characters" `
    -Answer "aaaaaaaaaa bbbbbbbb ccccccccc" `
    -ExpectedMaxScore 0

# Test E: Brief but relevant
Test-Answer -TestName "E. Brief Relevant Answer" `
    -Answer "An index helps the database find rows faster, but it requires storage and can slow down writes." `
    -ExpectedMaxScore 70

# Test F: Detailed and comprehensive
Test-Answer -TestName "F. Comprehensive Answer" `
    -Answer "A database index is a data structure that helps locate records efficiently without scanning every row. Indexes can improve query performance significantly but add storage overhead and slow down write operations. The choice of index depends on query patterns and the database engine being used." `
    -ExpectedMaxScore 90

# Test G: Too short
Test-Answer -TestName "G. Too Short 3 chars" `
    -Answer "Yes" `
    -ExpectedMaxScore 10

# Test H: Random numbers
Test-Answer -TestName "H. Random Numbers" `
    -Answer "123456789 987654321 111222333" `
    -ExpectedMaxScore 10

# Test I: Test spam
Test-Answer -TestName "I. Test Spam" `
    -Answer "test test test" `
    -ExpectedMaxScore 15

Write-Host "`n========== TEST SUITE COMPLETE ==========`n" -ForegroundColor Cyan

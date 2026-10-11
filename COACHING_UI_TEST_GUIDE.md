# Coaching UI - Visual Testing Guide

**Purpose**: Quick reference for manually testing the new coaching UI feature.

---

## 🚀 Quick Test (5 minutes)

### Prerequisites
- ✅ All 3 services running:
  - Backend: http://localhost:3001
  - Frontend: http://localhost:3000
  - AI Service: http://localhost:8000
- ✅ Test account: test2@example.com / Test123456

### Test Steps

#### 1. Complete a New Interview (3 min)
```
1. Go to http://localhost:3000
2. Login: test2@example.com / Test123456
3. Start new interview:
   - Job Role: "Full Stack Developer"
   - Type: Technical
   - Difficulty: Medium
   - Number of Questions: 3
4. Answer questions:
   - Q1: Detailed answer (2-3 sentences)
   - Q2: Brief answer (1 sentence)
   - Q3: Empty or very short
5. Complete interview
6. View Report
```

#### 2. Test Coaching UI (2 min)
```
1. On report page, click Question 1 to expand
2. Scroll down past feedback section
3. Look for green button: "💡 How You Should Answer This"
4. Click the green button to expand
5. Verify you see these 5 sections:
   ✓ 1. IDEAL ANSWER (green badge)
   ✓ 2. WHY THIS IS BETTER (teal badge)
   ✓ 3. ANSWER STRUCTURE (cyan badge)
   ✓ 4. KEY POINTS TO INCLUDE (indigo badge)
   ✓ 5. WHAT TO STUDY NEXT (rose badge)
6. Click button again to collapse
7. Repeat for Questions 2 and 3
```

---

## Expected Results

### With API Key (OpenAI/Anthropic)
**Coaching Button**: ✅ Visible  
**All 5 Sections**: ✅ Populated with content  
**Model Answer**: ✅ Full paragraph(s)  
**Key Concepts**: ✅ 3-5 bullet points  
**Study Recommendations**: ✅ 2-4 specific topics  

### Without API Key (Heuristic Mode)
**Coaching Button**: ❌ NOT visible (all fields empty)  
**Behavior**: No error, just not shown  
**Fallback**: Standard feedback still works  

---

## Visual Checklist

### ✅ Button Appearance
- [ ] Green/emerald background
- [ ] Sparkles icon (✨) on left
- [ ] "💡 How You Should Answer This" text
- [ ] Chevron icon (up/down) on right
- [ ] Hover effect (slightly darker green)

### ✅ Expanded Panel
- [ ] Gradient background (emerald → teal → cyan)
- [ ] All 5 sections visible (if data present)
- [ ] Numbered badges (1-5) with colors
- [ ] Text is readable and well-spaced
- [ ] "Try Again" button is disabled/grayed

### ✅ Each Section
- [ ] **Ideal Answer**: White box with full answer text
- [ ] **Why Better**: Paragraph with explanation
- [ ] **Answer Structure**: Italicized framework name
- [ ] **Key Points**: Bullet list with dots
- [ ] **Study Next**: Bullet list with book icons

### ✅ Interactions
- [ ] Click button → Panel expands smoothly
- [ ] Click button again → Panel collapses
- [ ] Can expand coaching for multiple questions
- [ ] No page jump or layout shift

### ✅ Dark Mode (if applicable)
- [ ] Colors adjust properly
- [ ] Text remains readable
- [ ] Borders and shadows visible

---

## Testing Scenarios

### Scenario 1: Full Coaching Data
**Setup**: Complete interview with API key configured  
**Expected**:
- All 5 sections show content
- Model answer is detailed (3-5 sentences)
- Key concepts list has 3-5 items
- Study recommendations has 2-4 items

**Verify**:
```sql
-- Check database
cd backend
sqlite3 mock_interview.db "
  SELECT 
    score,
    LENGTH(model_answer) as model_answer_length,
    key_concepts,
    study_recommendations
  FROM evaluations 
  ORDER BY evaluated_at DESC 
  LIMIT 3;
"
```

### Scenario 2: Partial Coaching Data
**Setup**: Some fields populated, others empty  
**Expected**:
- Coaching button still shows
- Only populated sections render
- No blank/empty sections
- No console errors

### Scenario 3: No Coaching Data (Heuristic)
**Setup**: No API key, heuristic evaluation only  
**Expected**:
- Coaching button DOES NOT appear
- Standard feedback still shows
- No error messages

---

## Browser Testing

Test in each browser and check:
- [ ] Chrome (Windows)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if Mac available)

### Mobile Responsive
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad)

**Check**:
- Button is full width on mobile
- Panel content doesn't overflow
- Text size is readable
- Icons scale properly

---

## Debugging Tips

### Problem: Coaching button doesn't appear
**Check**:
1. Open browser DevTools → Console (F12)
2. Look for errors
3. Check Network tab for `/api/v1/interviews/{id}/report` response
4. Verify `evaluation` object has `modelAnswer`, `whyBetter`, etc.

**If all fields are null/empty**:
→ Expected in heuristic mode (no API key)
→ Add API key to enable LLM evaluation

### Problem: Button appears but panel is empty
**Check**:
1. Inspect the evaluation object in DevTools
2. Verify at least one coaching field has content
3. Check for TypeScript errors in console

### Problem: Styling looks wrong
**Check**:
1. Tailwind CSS is loading (check network tab)
2. Dark mode toggle (if enabled)
3. Browser zoom level (should be 100%)

### Problem: Click doesn't expand
**Check**:
1. Browser console for JavaScript errors
2. `expandedCoachingIndex` state is updating (React DevTools)
3. Try different question (not just Q1)

---

## Success Criteria

### ✅ Feature Works If:
1. Coaching button appears for questions with coaching data
2. All 5 sections display when expanded (with data)
3. Expand/collapse animation is smooth
4. No console errors
5. Works in light and dark mode
6. Mobile responsive (button fits screen)
7. Try Again button is disabled

### ❌ Feature Broken If:
1. Button appears but panel is blank
2. Console shows errors
3. Clicking button does nothing
4. Layout breaks on mobile
5. Text is unreadable (low contrast)
6. Page crashes when expanding

---

## Performance Check

### Load Time
**Acceptable**: Report page loads in < 2 seconds  
**If Slow**: Check network tab for slow API calls

### Animation Smoothness
**Acceptable**: Expand/collapse transition is fluid  
**If Janky**: Check for layout reflows (too many re-renders)

---

## Rollback Plan

### If Feature is Broken
1. **Revert the frontend file**:
   ```powershell
   cd "c:\Users\ravil\OneDrive\Desktop\Ai Mock Interview"
   git checkout HEAD -- frontend/src/app/interview/[id]/report/page.tsx
   ```

2. **Frontend will auto-reload** (Next.js hot reload)

3. **Report to developer**:
   - Browser console errors
   - Screenshot of broken UI
   - API response from `/report` endpoint

---

## Post-Testing Actions

### If Coaching Works ✅
1. **Document in changelog**
2. **Update user documentation**
3. **Consider adding onboarding tooltip**: "New! See how you should answer"
4. **Plan Try Again feature** for Priority 7

### If Coaching Has Issues ⚠️
1. **Log specific issues** (button, sections, data, styling)
2. **Create bug report** with screenshots
3. **Test in different environments** (different browsers, different data)
4. **Check backend logs** for evaluation errors

---

## Sample Test Data

### Good Test Questions
1. "Explain the difference between REST and GraphQL"
   - Should generate detailed coaching
   - Framework: Comparison structure
   - Key concepts: REST, GraphQL, advantages

2. "Describe your experience with Agile methodology"
   - Should use STAR framework
   - Key concepts: Scrum, sprints, retrospectives

3. "How do you handle merge conflicts in Git?"
   - Should be technical and step-by-step
   - Key concepts: git merge, git rebase, conflict resolution

---

## Next Steps After Testing

### Phase 1: Basic Verification ✅
- [ ] Visual UI works
- [ ] Data flows correctly
- [ ] No console errors

### Phase 2: Content Quality (Requires API Key)
- [ ] Model answers are accurate
- [ ] "Why better" explanations make sense
- [ ] Study recommendations are relevant
- [ ] Frameworks are appropriate for question type

### Phase 3: User Experience
- [ ] Students find coaching helpful
- [ ] Expand/collapse behavior is intuitive
- [ ] Mobile experience is smooth

---

**Test Duration**: 5-10 minutes  
**Blocker Issues**: None expected  
**Nice-to-Have**: API key to test full LLM coaching

*Last Updated: 2026-10-10*

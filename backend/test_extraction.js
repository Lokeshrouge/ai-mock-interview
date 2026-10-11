// Quick test script to verify PDF extraction works
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function testExtraction() {
  try {
    // Test with first uploaded PDF
    const pdfPath = path.join(__dirname, 'uploads', 'resumes', 'fa0e0bb1-2986-4c4a-80db-5f8c1eff9101.pdf');
    
    console.log('Testing PDF extraction...');
    console.log('File:', pdfPath);
    console.log('---');
    
    // Read the PDF file
    const buffer = fs.readFileSync(pdfPath);
    console.log('Buffer size:', buffer.length, 'bytes');
    
    // Extract text using pdf-parse
    const data = await pdf(buffer);
    
    console.log('---');
    console.log('Pages:', data.numpages);
    console.log('Text length:', data.text.length, 'characters');
    console.log('Word count:', data.text.split(/\s+/).length);
    console.log('---');
    console.log('First 500 characters of extracted text:');
    console.log(data.text.substring(0, 500));
    console.log('---');
    
    // Check if it looks like binary garbage
    if (data.text.includes('%PDF') || data.text.includes('PK\x03\x04')) {
      console.error('❌ FAIL: Extracted text contains binary data!');
    } else {
      console.log('✅ PASS: Extracted text looks readable!');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

testExtraction();

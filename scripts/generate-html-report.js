#!/usr/bin/env node

/**
 * Generate HTML Test Report from Vitest JSON output
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const jsonReportPath = join(process.cwd(), 'test-results.json')
const htmlReportPath = join(process.cwd(), 'test-results.html')

if (!existsSync(jsonReportPath)) {
  console.error('Error: test-results.json not found. Run tests first with JSON reporter.')
  process.exit(1)
}

const testResults = JSON.parse(readFileSync(jsonReportPath, 'utf-8'))

const totalTests = testResults.numTotalTests || 0
const passedTests = testResults.numPassedTests || 0
const failedTests = testResults.numFailedTests || 0
const skippedTests = testResults.numPendingTests || 0
const duration = testResults.testResults?.[0]?.perfStats?.runtime || 0

const timestamp = new Date().toISOString()
const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0.00'

// Generate test details
let testDetailsHtml = ''
if (testResults.testResults && testResults.testResults.length > 0) {
  testResults.testResults.forEach(fileResult => {
    const fileName = fileResult.name || 'Unknown'
    const fileStatus = fileResult.status || 'unknown'
    const statusClass = fileStatus === 'passed' ? 'success' : fileStatus === 'failed' ? 'danger' : 'warning'
    
    testDetailsHtml += `
      <div class="test-file">
        <h3>
          <span class="badge badge-${statusClass}">${fileStatus}</span>
          ${fileName}
        </h3>
    `
    
    if (fileResult.assertionResults && fileResult.assertionResults.length > 0) {
      testDetailsHtml += '<ul class="test-list">'
      fileResult.assertionResults.forEach(test => {
        const testStatus = test.status || 'unknown'
        const testStatusClass = testStatus === 'passed' ? 'success' : testStatus === 'failed' ? 'danger' : 'warning'
        const icon = testStatus === 'passed' ? '✓' : testStatus === 'failed' ? '✗' : '○'
        
        testDetailsHtml += `
          <li class="test-item test-${testStatusClass}">
            <span class="test-icon">${icon}</span>
            <span class="test-name">${test.title || test.fullName || 'Unnamed test'}</span>
            <span class="test-duration">${test.duration || 0}ms</span>
          </li>
        `
        
        if (test.failureMessages && test.failureMessages.length > 0) {
          testDetailsHtml += `
            <div class="error-message">
              <pre>${test.failureMessages.join('\n')}</pre>
            </div>
          `
        }
      })
      testDetailsHtml += '</ul>'
    }
    
    testDetailsHtml += '</div>'
  })
}

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Results - Tredgate Loan</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    
    .header .timestamp {
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .summary-card .value {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .summary-card .label {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .summary-card.total .value { color: #667eea; }
    .summary-card.passed .value { color: #48bb78; }
    .summary-card.failed .value { color: #f56565; }
    .summary-card.skipped .value { color: #ed8936; }
    .summary-card.rate .value { font-size: 2rem; }
    
    .test-file {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    
    .test-file h3 {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .badge-success {
      background-color: #c6f6d5;
      color: #22543d;
    }
    
    .badge-danger {
      background-color: #fed7d7;
      color: #742a2a;
    }
    
    .badge-warning {
      background-color: #feebc8;
      color: #7c2d12;
    }
    
    .test-list {
      list-style: none;
    }
    
    .test-item {
      padding: 10px;
      margin-bottom: 5px;
      border-left: 3px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #f7fafc;
    }
    
    .test-item.test-success {
      border-left-color: #48bb78;
    }
    
    .test-item.test-danger {
      border-left-color: #f56565;
      background-color: #fff5f5;
    }
    
    .test-icon {
      font-weight: bold;
      font-size: 1.2rem;
    }
    
    .test-name {
      flex: 1;
    }
    
    .test-duration {
      color: #666;
      font-size: 0.85rem;
    }
    
    .error-message {
      background-color: #fff5f5;
      border: 1px solid #feb2b2;
      border-radius: 4px;
      padding: 15px;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    
    .error-message pre {
      color: #c53030;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      color: #666;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Test Results</h1>
      <p class="timestamp">Generated: ${timestamp}</p>
    </div>
    
    <div class="summary">
      <div class="summary-card total">
        <div class="value">${totalTests}</div>
        <div class="label">Total Tests</div>
      </div>
      <div class="summary-card passed">
        <div class="value">${passedTests}</div>
        <div class="label">Passed</div>
      </div>
      <div class="summary-card failed">
        <div class="value">${failedTests}</div>
        <div class="label">Failed</div>
      </div>
      <div class="summary-card skipped">
        <div class="value">${skippedTests}</div>
        <div class="label">Skipped</div>
      </div>
      <div class="summary-card rate">
        <div class="value">${passRate}%</div>
        <div class="label">Pass Rate</div>
      </div>
    </div>
    
    <div class="test-details">
      ${testDetailsHtml || '<p>No test details available.</p>'}
    </div>
    
    <div class="footer">
      <p>Tredgate Loan - Test Suite Report</p>
    </div>
  </div>
</body>
</html>
`

writeFileSync(htmlReportPath, htmlTemplate)
console.log(`✅ HTML report generated: ${htmlReportPath}`)

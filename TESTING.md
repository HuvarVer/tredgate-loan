# Testing Guide

This document describes the testing setup and practices for the Tredgate Loan application.

## Overview

The project uses [Vitest](https://vitest.dev/) as the testing framework, which provides:
- Fast unit testing with native ES modules support
- Vue component testing with @vue/test-utils
- Built-in coverage reporting
- HTML test reports for CI/CD integration

## Test Structure

### Test Files Location

All test files are located in the `tests/` directory:

```
tests/
├── loanService.test.ts      # Service layer tests
├── LoanForm.test.ts          # LoanForm component tests
├── LoanList.test.ts          # LoanList component tests
├── LoanSummary.test.ts       # LoanSummary component tests
└── App.test.ts               # Main App component tests
```

### Test Coverage

The test suite covers all major functionalities:

#### Service Layer (`loanService.test.ts`)
- **getLoans()** - Loading loans from localStorage
- **saveLoans()** - Persisting loans to localStorage
- **createLoanApplication()** - Creating new loan applications with validation
- **updateLoanStatus()** - Updating loan status (approve/reject)
- **calculateMonthlyPayment()** - Monthly payment calculation
- **autoDecideLoan()** - Automatic loan approval/rejection logic

#### LoanForm Component (`LoanForm.test.ts`)
- Form rendering and input fields
- Form validation (required fields, numeric constraints)
- Successful loan creation
- Error handling and display
- Form reset after submission
- Event emission

#### LoanList Component (`LoanList.test.ts`)
- Empty state display
- Table rendering with all columns
- Data formatting (currency, percentages, dates)
- Status badge display
- Action buttons for pending loans
- Event emission for approve/reject/auto-decide actions

#### LoanSummary Component (`LoanSummary.test.ts`)
- Statistics calculation (total, pending, approved, rejected)
- Total approved amount calculation
- Currency formatting
- Reactive updates when loans change

#### App Component (`App.test.ts`)
- Component integration
- Data flow between components
- Event handling (approve, reject, auto-decide)
- Initial data loading
- State synchronization

## Running Tests

### Run All Tests

```bash
npm test
```

This runs all tests once and displays results in the console.

### Watch Mode

For development, run tests in watch mode to automatically re-run tests when files change:

```bash
npm run test:watch
```

### Coverage Report

Generate a test coverage report:

```bash
npm run test:coverage
```

This creates:
- Console output with coverage summary
- HTML coverage report in `coverage/` directory
- JSON coverage data for CI tools

### HTML Test Report

Generate a comprehensive HTML test report:

```bash
npm run test:report
```

This creates:
- `test-results.json` - Raw test results in JSON format
- `test-results.html` - Beautiful HTML report with test details

The HTML report includes:
- Summary statistics (total, passed, failed, skipped tests)
- Pass rate percentage
- Detailed test results for each file
- Visual indicators for test status
- Execution time for each test

## Test Best Practices

### 1. Isolation

Tests are isolated and don't depend on each other:
- Each test has its own setup using `beforeEach`
- localStorage is mocked and cleared between tests
- No shared state between tests

### 2. Descriptive Names

Test names clearly describe what is being tested:

```typescript
it('shows error when submitting empty applicant name', async () => {
  // Test implementation
})
```

### 3. Arrange-Act-Assert Pattern

Tests follow the AAA pattern:

```typescript
it('creates a new loan with valid data', async () => {
  // Arrange
  const wrapper = mount(LoanForm)
  
  // Act
  await wrapper.find('#applicantName').setValue('Jane Smith')
  await wrapper.find('#amount').setValue(50000)
  await wrapper.find('form').trigger('submit.prevent')
  
  // Assert
  const loans = loanService.getLoans()
  expect(loans[0]?.applicantName).toBe('Jane Smith')
})
```

### 4. Mocking

External dependencies are mocked appropriately:
- localStorage is mocked globally for all tests
- Service functions can be mocked when testing components

### 5. Component Testing

Vue components are tested using @vue/test-utils:
- Mounting components with props
- Simulating user interactions
- Verifying rendered output
- Testing event emissions

## Continuous Integration

Tests are automatically run in GitHub Actions on:
- Pull requests to the main branch
- Pushes to the main branch

The CI workflow:
1. Sets up Node.js environment
2. Installs dependencies
3. Runs linter
4. Runs all tests
5. Generates HTML test report
6. Uploads test report as artifact
7. Builds the application

## Writing New Tests

When adding new features, follow these steps:

### 1. Create Test File

Create a new test file in the `tests/` directory:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import YourComponent from '../src/components/YourComponent.vue'

describe('YourComponent', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should do something', () => {
    // Test implementation
  })
})
```

### 2. Test Core Functionality

Ensure you test:
- Happy path scenarios
- Edge cases
- Error handling
- User interactions
- Data validation

### 3. Run Tests

```bash
npm test
```

### 4. Check Coverage

```bash
npm run test:coverage
```

Aim for high coverage but focus on meaningful tests rather than 100% coverage.

## Debugging Tests

### Run a Single Test File

```bash
npx vitest run tests/LoanForm.test.ts
```

### Run a Single Test

Use `.only` to run a specific test:

```typescript
it.only('should do something specific', () => {
  // This test will run alone
})
```

### Skip a Test

Use `.skip` to temporarily disable a test:

```typescript
it.skip('should be fixed later', () => {
  // This test will be skipped
})
```

### View Test Details

Add `--reporter=verbose` for more detailed output:

```bash
npx vitest run --reporter=verbose
```

## Common Testing Patterns

### Testing Form Submission

```typescript
it('submits form with valid data', async () => {
  const wrapper = mount(MyForm)
  
  await wrapper.find('#name').setValue('John')
  await wrapper.find('#email').setValue('john@example.com')
  await wrapper.find('form').trigger('submit.prevent')
  
  expect(wrapper.emitted('submit')).toBeTruthy()
})
```

### Testing Props

```typescript
it('displays data from props', () => {
  const wrapper = mount(MyComponent, {
    props: { title: 'Test Title' }
  })
  
  expect(wrapper.text()).toContain('Test Title')
})
```

### Testing Events

```typescript
it('emits event when button clicked', async () => {
  const wrapper = mount(MyComponent)
  
  await wrapper.find('button').trigger('click')
  
  expect(wrapper.emitted('buttonClick')).toBeTruthy()
  expect(wrapper.emitted('buttonClick')?.[0]).toEqual(['expected-value'])
})
```

### Testing Computed Properties

```typescript
it('calculates total correctly', () => {
  const wrapper = mount(MyComponent, {
    props: { items: [{ price: 10 }, { price: 20 }] }
  })
  
  expect(wrapper.vm.total).toBe(30)
})
```

## Troubleshooting

### Tests Failing Locally But Passing in CI

- Ensure you have the latest dependencies: `npm install`
- Clear any caches: `npm run test -- --clearCache`
- Check for timezone or locale-specific issues

### Flaky Tests

- Ensure proper use of `await` for async operations
- Use `flushPromises()` when testing Vue reactivity
- Avoid relying on timing-based assertions

### Mock Not Working

- Verify mock is set up before importing the module
- Use `vi.clearAllMocks()` in `beforeEach`
- Check if mock is properly scoped

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils Documentation](https://test-utils.vuejs.org/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Summary

The testing setup provides:
- ✅ Comprehensive test coverage for all features
- ✅ Fast test execution with Vitest
- ✅ HTML reports for easy result visualization
- ✅ CI/CD integration with GitHub Actions
- ✅ Isolated tests with proper mocking
- ✅ Clear and maintainable test code

For questions or issues, refer to the [Vitest documentation](https://vitest.dev/) or create an issue in the repository.

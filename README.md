# Tredgate Loan

A simple loan application management demo built with Vue 3, TypeScript, and Vite.

## Overview

Tredgate Loan is a frontend-only demo application used for training on GitHub Copilot features. It demonstrates a small, realistic frontend project without any backend server or external database.

## Features

- Create loan applications with applicant name, amount, term, and interest rate
- View all loan applications in a table
- Approve or reject loan applications manually
- Auto-decide loans based on simple business rules:
  - Approved if amount ≤ $100,000 AND term ≤ 60 months
  - Rejected otherwise
- Calculate monthly payments
- View summary statistics

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **ESLint** - Code linting

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:report       # Generate HTML test report
```

For detailed testing information, see [TESTING.md](TESTING.md).

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── assets/           # Global CSS styles
├── components/       # Vue components
│   ├── LoanForm.vue     # Form to create new loans
│   ├── LoanList.vue     # Table of loan applications
│   └── LoanSummary.vue  # Statistics display
├── services/         # Business logic
│   └── loanService.ts   # Loan operations
├── types/            # TypeScript definitions
│   └── loan.ts          # Loan domain types
├── App.vue           # Main application component
└── main.ts           # Application entry point
tests/
└── loanService.test.ts  # Unit tests
```

## Data Persistence

All data is stored in the browser's localStorage under the key `tredgate_loans`. No backend server or external database is used.

## License

MIT

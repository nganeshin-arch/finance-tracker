# Contributing to Personal Finance Tracker

Thank you for your interest in contributing to the Personal Finance Tracker! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept responsibility for mistakes

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
```bash
# Click "Fork" on GitHub
```

2. **Clone your fork**
```bash
git clone https://github.com/YOUR_USERNAME/personal-finance-tracker.git
cd personal-finance-tracker
```

3. **Add upstream remote**
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/personal-finance-tracker.git
```

4. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

5. **Setup database**
```bash
# Create database
createdb finance_tracker

# Run migrations
cd backend
npm run migrate
```

6. **Configure environment**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your settings

# Frontend
cd ../frontend
cp .env.example .env
```

7. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Development Workflow

### Creating a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes
- `chore/` - Maintenance tasks

Examples:
- `feature/add-budget-tracking`
- `fix/dashboard-calculation-error`
- `docs/update-api-documentation`

### Making Changes

1. **Write code** following our coding standards
2. **Test your changes** thoroughly
3. **Update documentation** if needed
4. **Commit your changes** with clear messages

### Keeping Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Resolve conflicts if any
# Then continue
git rebase --continue
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

**Good**:
```typescript
interface Transaction {
  id: number;
  amount: number;
  date: Date;
}

function calculateTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}
```

**Bad**:
```typescript
function calc(data: any): any {
  return data.reduce((a: any, b: any) => a + b.amt, 0);
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

**Good**:
```typescript
interface TransactionFormProps {
  onSubmit: (data: TransactionDTO) => void;
  initialData?: Transaction;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData
}) => {
  // Component logic
};
```

### Backend Code

- Follow RESTful API conventions
- Use proper HTTP status codes
- Implement error handling
- Validate all inputs
- Use repository pattern for database access

**Good**:
```typescript
export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const transaction = await transactionService.create(data);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};
```

### Code Formatting

- Use Prettier for formatting (if configured)
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in objects/arrays

### File Organization

```
backend/src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── services/       # Business logic
├── repositories/   # Database access
├── types/          # TypeScript types
├── middleware/     # Express middleware
├── routes/         # API routes
└── utils/          # Utility functions

frontend/src/
├── components/     # React components
├── pages/          # Page components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── services/       # API services
├── types/          # TypeScript types
├── utils/          # Utility functions
└── theme/          # Theme configuration
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

### Examples

```
feat(transactions): add filtering by category

Implement category filter in transaction list component.
Add API endpoint to support category filtering.

Closes #123
```

```
fix(dashboard): correct net balance calculation

Net balance was not accounting for negative expenses.
Updated calculation logic in dashboard service.

Fixes #456
```

### Commit Best Practices

- Write clear, concise commit messages
- Use present tense ("add feature" not "added feature")
- Reference issue numbers when applicable
- Keep commits focused on single changes
- Commit often with logical chunks

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Branch is up to date with main

### Creating a Pull Request

1. **Push your branch**
```bash
git push origin feature/your-feature-name
```

2. **Open Pull Request on GitHub**
- Go to your fork on GitHub
- Click "New Pull Request"
- Select your feature branch
- Fill out the PR template

### PR Title Format

```
[Type] Brief description
```

Examples:
- `[Feature] Add budget tracking functionality`
- `[Fix] Resolve dashboard calculation error`
- `[Docs] Update API documentation`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of changes
- Another change

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

### After Merge

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## Testing

### Running Tests

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Writing Tests

- Write tests for new features
- Update tests for modified features
- Aim for good test coverage
- Test edge cases and error conditions

### Manual Testing

Use the testing checklist in `docs/TESTING_CHECKLIST.md`

---

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex logic
- Explain non-obvious decisions

```typescript
/**
 * Calculates the net balance for a given period
 * @param transactions - Array of transactions
 * @param startDate - Period start date
 * @param endDate - Period end date
 * @returns Net balance (income - expenses)
 */
export function calculateNetBalance(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): number {
  // Implementation
}
```

### API Documentation

- Update `docs/API.md` for API changes
- Include request/response examples
- Document error responses

### README Updates

- Update README.md for new features
- Add setup instructions for new dependencies
- Update troubleshooting section

---

## Questions?

- Open an issue for questions
- Join our discussions
- Contact maintainers

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉

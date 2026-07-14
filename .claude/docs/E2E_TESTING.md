# Playwright E2E Testing Best Practices

## Page Object Model Pattern

```typescript
// test/page-objects/login.page.ts
import { Locator, Page } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.getByTestId('username-input');
        this.passwordInput = page.getByTestId('password-input');
        this.submitButton = page.getByRole('button', { name: /login/i });
        this.errorMessage = page.getByRole('alert');
    }

    async goto() {
        await this.page.goto('/auth/login');
    }

    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async expectErrorMessage(message: string) {
        await expect(this.errorMessage).toContainText(message);
    }
}
```

## Custom Test Fixtures

```typescript
// test/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';

type AuthFixtures = {
    loginPage: LoginPage;
    login: (username: string, password: string) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
    login: async ({ page }, use) => {
        const loginFn = async (username: string, password: string) => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();
            await loginPage.login(username, password);
            await page.waitForURL('/dashboard');
        };
        await use(loginFn);
    },
});

export { expect } from '@playwright/test';
```

## Test Structure

```typescript
// test/tests/auth/login.spec.ts
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Login Page', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    test('should display login form', async ({ loginPage }) => {
        await expect(loginPage.usernameInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ loginPage }) => {
        await loginPage.login('invalid', 'wrong');
        await loginPage.expectErrorMessage('Invalid credentials');
    });

    test('should redirect to dashboard on success', async ({ page, login }) => {
        await login('admin@example.com', 'Password123!');
        await expect(page).toHaveURL('/dashboard');
    });
});
```

## Best Practices

1. **Use Page Objects**: Encapsulate page interactions in reusable classes
2. **Use Test Fixtures**: Share setup/teardown logic across tests
3. **Use data-testid**: Prefer `getByTestId` for stable selectors
4. **Use semantic queries**: `getByRole`, `getByLabel`, `getByText` when appropriate
5. **Avoid sleep**: Use `waitFor*` methods instead of fixed timeouts
6. **Isolate tests**: Each test should be independent
7. **Clean up state**: Reset database/cookies between tests

---

**Related Documentation**:

- [Frontend Development Guidelines](../skills/best-practices.md)
- [React Best Practices](./REACT_BEST_PRACTICES.md)

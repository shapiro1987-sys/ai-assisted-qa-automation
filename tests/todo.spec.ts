import { test, expect, type Page } from '@playwright/test';

const TODO_MVC_URL = 'https://demo.playwright.dev/todomvc/';

async function openTodoApp(page: Page) {
  await page.goto(TODO_MVC_URL);
}

async function addTodo(page: Page, text: string) {
  const input = page.getByPlaceholder('What needs to be done?');
  await input.click();
  await input.fill(text);
  await input.press('Enter');
}

function todoItem(page: Page, title: string) {
  return page.getByTestId('todo-item').filter({
    has: page.getByTestId('todo-title').getByText(title, { exact: true }),
  });
}

function todoTitle(page: Page, title: string) {
  return page.getByTestId('todo-title').getByText(title, { exact: true });
}

test.describe('TodoMVC - Positive flows', () => {
  test('TC-001 — New todo item appears in the list after submission', async ({ page }) => {
    await openTodoApp(page);

    await addTodo(page, 'Buy milk');

    await expect(todoTitle(page, 'Buy milk')).toBeVisible();
    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  });

  test('TC-002 — Todo item is marked completed after toggling its checkbox', async ({ page }) => {
    await openTodoApp(page);
    await addTodo(page, 'Walk the dog');

    await todoItem(page, 'Walk the dog').getByRole('checkbox', { name: 'Toggle Todo' }).click();

    await expect(todoItem(page, 'Walk the dog')).toHaveClass(/completed/);
    await expect(page.getByTestId('todo-count')).toHaveText('0 items left');
  });

  test('TC-003 — Todo item is removed from the list after deletion', async ({ page }) => {
    await openTodoApp(page);
    await addTodo(page, 'Read a book');

    const item = todoItem(page, 'Read a book');
    await item.hover();
    await item.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByTestId('todo-item')).toHaveCount(0);
  });

  test('TC-004 — Multiple todo items can be added sequentially', async ({ page }) => {
    await openTodoApp(page);

    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Read a book');

    await expect(page.getByTestId('todo-title')).toHaveText([
      'Buy milk',
      'Walk the dog',
      'Read a book',
    ]);
    await expect(page.getByTestId('todo-count')).toHaveText('3 items left');
  });
});

test.describe('TodoMVC - Negative flows', () => {
  test('TC-005 — Empty input does not create a todo item', async ({ page }) => {
    await openTodoApp(page);

    const input = page.getByPlaceholder('What needs to be done?');
    await input.click();
    await input.press('Enter');

    await expect(page.getByTestId('todo-item')).toHaveCount(0);
  });

  test('TC-006 — Whitespace-only input does not create a todo item', async ({ page }) => {
    await openTodoApp(page);

    const input = page.getByPlaceholder('What needs to be done?');
    await input.click();
    await input.fill('   ');
    await input.press('Enter');

    await expect(page.getByTestId('todo-item')).toHaveCount(0);
  });

  test('TC-007 — Delete control is not actionable without hovering the item', async ({ page }) => {
    await openTodoApp(page);
    await addTodo(page, 'Buy milk');

    const item = todoItem(page, 'Buy milk');
    const deleteButton = item.getByRole('button', { name: 'Delete' });

    await expect(deleteButton).toBeHidden();
    await expect(todoTitle(page, 'Buy milk')).toBeVisible();
  });
});

test.describe('TodoMVC - Edge cases', () => {
  test('TC-008 — Duplicate todo text can be added as separate items', async ({ page }) => {
    await openTodoApp(page);
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Buy milk');

    await expect(todoTitle(page, 'Buy milk')).toHaveCount(2);
    await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
  });

  test('TC-009 — Todo text with special characters is preserved', async ({ page }) => {
    await openTodoApp(page);
    const todoText = 'Buy milk & eggs @ 5pm!';

    await addTodo(page, todoText);

    await expect(todoTitle(page, todoText)).toBeVisible();
  });

  test('TC-010 — Long todo text is accepted and displayed', async ({ page }) => {
    await openTodoApp(page);
    const longTodo =
      'Plan quarterly roadmap review with design, engineering, and product teams to align on priorities, milestones, deliverables, and success metrics for the upcoming release cycle and beyond';

    await addTodo(page, longTodo);

    await expect(todoTitle(page, longTodo)).toBeVisible();
    await expect(page.getByTestId('todo-item')).toHaveCount(1);
    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  });

  test('TC-011 — Completing one item leaves other items active', async ({ page }) => {
    await openTodoApp(page);
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');

    await todoItem(page, 'Buy milk').getByRole('checkbox', { name: 'Toggle Todo' }).click();

    await expect(todoItem(page, 'Buy milk')).toHaveClass(/completed/);
    await expect(todoItem(page, 'Walk the dog')).not.toHaveClass(/completed/);
    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  });

  test('TC-012 — Deleting one item preserves remaining items', async ({ page }) => {
    await openTodoApp(page);
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Read a book');

    const item = todoItem(page, 'Walk the dog');
    await item.hover();
    await item.getByRole('button', { name: 'Delete' }).click();

    await expect(todoTitle(page, 'Buy milk')).toBeVisible();
    await expect(todoTitle(page, 'Read a book')).toBeVisible();
    await expect(todoTitle(page, 'Walk the dog')).toHaveCount(0);
    await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
  });

  test('TC-013 — Completed item can be toggled back to active', async ({ page }) => {
    await openTodoApp(page);
    await addTodo(page, 'Walk the dog');

    const checkbox = todoItem(page, 'Walk the dog').getByRole('checkbox', { name: 'Toggle Todo' });
    await checkbox.click();
    await expect(todoItem(page, 'Walk the dog')).toHaveClass(/completed/);

    await checkbox.click();

    await expect(todoItem(page, 'Walk the dog')).not.toHaveClass(/completed/);
    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  });
});

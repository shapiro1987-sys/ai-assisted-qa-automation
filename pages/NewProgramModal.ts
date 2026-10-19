import type { Locator, Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly programName: Locator;
  readonly description: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.programName = this.dialog.getByLabel('Program Name');
    this.description = this.dialog.getByLabel('Description');
    this.createButton = this.dialog.getByRole('button', { name: 'Create', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
  }

  async fillProgramName(name: string) {
    await this.programName.fill(name);
  }

  async fillDescription(description: string) {
    await this.description.fill(description);
  }

  async fill(name: string, description = '') {
    await this.fillProgramName(name);
    if (description) {
      await this.fillDescription(description);
    }
  }

  async submit() {
    await this.createButton.click();
  }

  async doubleSubmit() {
    await this.createButton.dblclick();
  }

  validationMessage(text: string | RegExp) {
    return this.dialog.getByText(text);
  }
}

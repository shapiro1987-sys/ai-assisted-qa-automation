import type { Locator, Page } from '@playwright/test';

export class EditProgramModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly programName: Locator;
  readonly description: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Edit Program' });
    this.heading = this.dialog.getByRole('heading', { name: 'Edit Program', level: 2 });
    this.programName = this.dialog.getByLabel('Program Name');
    this.description = this.dialog.getByLabel('Description');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
  }

  async fillProgramName(name: string) {
    await this.programName.fill(name);
  }

  async fillDescription(description: string) {
    await this.description.fill(description);
  }

  async fill(name: string, description?: string) {
    await this.fillProgramName(name);
    if (description !== undefined) {
      await this.fillDescription(description);
    }
  }

  async submit() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  validationMessage(text: string | RegExp) {
    return this.dialog.getByText(text);
  }
}

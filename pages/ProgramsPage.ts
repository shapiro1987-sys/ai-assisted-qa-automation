import type { Locator, Page } from '@playwright/test';
import { EditProgramModal } from './EditProgramModal';
import { NewProgramModal } from './NewProgramModal';

const programsUrl = `${(process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio').replace(/\/$/, '')}/programs`;

export class ProgramsPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly newProgramButton: Locator;
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Programs', level: 2 });
    this.subtitle = page.getByText('Manage academic programs and semesters');
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
  }

  async goto() {
    await this.page.goto(programsUrl, { waitUntil: 'domcontentloaded' });
  }

  async openNewProgramForm() {
    await this.newProgramButton.click();
  }

  async createProgram(name: string, description = '') {
    await this.openNewProgramForm();
    await this.newProgramModal.fill(name, description);
    await this.newProgramModal.submit();
  }

  async openEditProgram(name: string) {
    await this.programInList(name).click();
  }

  async saveEditedProgram(name: string, description?: string) {
    await this.editProgramModal.fill(name, description);
    await this.editProgramModal.submit();
  }

  programInList(name: string) {
    return this.page.getByRole('button', { name: `Edit ${name}`, exact: true });
  }

  programDescription(description: string) {
    return this.page.getByText(description, { exact: true });
  }

  deleteButton(name: string) {
    return this.page.getByRole('button', { name: `Delete ${name}`, exact: true });
  }

  async deleteProgram(name: string, action: 'accept' | 'dismiss' = 'accept'): Promise<string> {
    let message = '';
    this.page.once('dialog', async (dialog) => {
      message = dialog.message();
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
    await this.deleteButton(name).click();
    return message;
  }
}

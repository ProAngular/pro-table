import { Clipboard } from '@angular/cdk/clipboard';

import { isNonEmptyString } from './type-checks';

export function copyToClipboard(
  content: string,
  clipboard: Clipboard,
): boolean {
  if (!isNonEmptyString(content)) {
    throw new Error('Failed to copy empty string to the clipboard!');
  }

  const success: boolean = clipboard.copy(content);
  return success;
}

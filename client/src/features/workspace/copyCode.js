// Copies text and tells the user how it went (notify = notistack's enqueueSnackbar).
export async function copyCode(text, notify) {
  try {
    await navigator.clipboard.writeText(text);
    notify('Code copied', { variant: 'success' });
  } catch {
    notify('Could not copy code', { variant: 'error' });
  }
}

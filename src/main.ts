// Keyboard shortcuts for mini-textarea

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('textarea');

    if (!textarea) {
        console.error('Textarea element not found');
        return;
    }

    // Add keyboard shortcut event listener
    textarea.addEventListener('keydown', (event) => {
        // Check for Ctrl+Shift+K or Cmd+Shift+K (Mac)
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'K') {
            event.preventDefault(); // Prevent default browser behavior
            deleteLine(textarea);
        }
    });
});

/**
 * Deletes the current line where the cursor is positioned
 */
function deleteLine(textarea: HTMLTextAreaElement): void {
    const text = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Find the start of the current line
    let lineStart = selectionStart;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
        lineStart--;
    }

    // Find the end of the current line
    let lineEnd = selectionEnd;
    while (lineEnd < text.length && text[lineEnd] !== '\n') {
        lineEnd++;
    }

    // If we're not at the end of the text, include the newline character in the deletion
    if (lineEnd < text.length) {
        lineEnd++;
    }

    // Delete the line
    const newText = text.substring(0, lineStart) + text.substring(lineEnd);
    textarea.value = newText;

    // Set cursor position to the start of the line that was below the deleted line
    textarea.selectionStart = lineStart;
    textarea.selectionEnd = lineStart;

    // Trigger input event to ensure any listeners are notified of the change
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

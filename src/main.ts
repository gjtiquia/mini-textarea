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

        // Check for Ctrl+C or Cmd+C with no selection
        if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
            if (textarea.selectionStart === textarea.selectionEnd) {
                event.preventDefault(); // Prevent default copy behavior
                copyLine(textarea);
            }
            // If text is selected, let the default copy behavior work
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

/**
 * Copies the current line to clipboard when no text is selected
 */
function copyLine(textarea: HTMLTextAreaElement): void {
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Find the start of the current line
    let lineStart = cursorPos;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
        lineStart--;
    }

    // Find the end of the current line
    let lineEnd = cursorPos;
    while (lineEnd < text.length && text[lineEnd] !== '\n') {
        lineEnd++;
    }

    // Extract the line content
    const lineContent = text.substring(lineStart, lineEnd);

    // Copy to clipboard using the Clipboard API without visual feedback
    navigator.clipboard.writeText(lineContent)
        .catch(err => {
            console.error('Failed to copy line: ', err);
        });
}

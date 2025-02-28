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

        // Check for Ctrl+X or Cmd+X with no selection
        if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
            if (textarea.selectionStart === textarea.selectionEnd) {
                event.preventDefault(); // Prevent default cut behavior
                cutLine(textarea);
            }
            // If text is selected, let the default cut behavior work
        }
    });
});

/**
 * Deletes the current line where the cursor is positioned
 */
function deleteLine(textarea: HTMLTextAreaElement): void {
    const text = textarea.value;
    const selectionStart = textarea.selectionStart;

    // Find line boundaries
    const { start: lineStart, end: lineEnd } = findLineBoundaries(text, selectionStart);

    // If we're not at the end of the text, include the newline character in the deletion
    let adjustedLineEnd = lineEnd;
    if (lineEnd < text.length) {
        adjustedLineEnd++;
    }

    // Delete the line
    const newText = text.substring(0, lineStart) + text.substring(adjustedLineEnd);
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

    // Find line boundaries
    const { start: lineStart, end: lineEnd } = findLineBoundaries(text, cursorPos);

    // Extract the line content
    const lineContent = text.substring(lineStart, lineEnd);

    // Copy to clipboard using the Clipboard API without visual feedback
    navigator.clipboard.writeText(lineContent)
        .catch(err => {
            console.error('Failed to copy line: ', err);
        });
}

/**
 * Cuts the current line where the cursor is positioned
 * Combines copying and deleting efficiently
 */
function cutLine(textarea: HTMLTextAreaElement): void {
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Find line boundaries
    const { start: lineStart, end: lineEnd } = findLineBoundaries(text, cursorPos);

    // Extract the line content for copying
    const lineContent = text.substring(lineStart, lineEnd);

    // Copy to clipboard
    navigator.clipboard.writeText(lineContent)
        .then(() => {
            // If we're not at the end of the text, include the newline character in the deletion
            let adjustedLineEnd = lineEnd;
            if (lineEnd < text.length) {
                adjustedLineEnd++;
            }

            // Delete the line
            const newText = text.substring(0, lineStart) + text.substring(adjustedLineEnd);
            textarea.value = newText;

            // Set cursor position to the start of the line that was below the deleted line
            textarea.selectionStart = lineStart;
            textarea.selectionEnd = lineStart;

            // Trigger input event to ensure any listeners are notified of the change
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        })
        .catch(err => {
            console.error('Failed to cut line: ', err);
        });
}

/**
 * Finds the boundaries of the current line
 * @returns An object containing the start and end positions of the current line
 */
function findLineBoundaries(text: string, cursorPos: number): { start: number, end: number } {
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

    return { start: lineStart, end: lineEnd };
}
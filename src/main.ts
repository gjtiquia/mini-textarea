// Keyboard shortcuts for mini-textarea
import { registerServiceWorker, setupOfflineListener } from './register-sw';

// Register service worker
registerServiceWorker();

// Set up offline status indicator
function setupOfflineStatus() {
    setupOfflineListener((isOnline) => {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) {
            // Create status element if it doesn't exist
            const statusDiv = document.createElement('div');
            statusDiv.id = 'connection-status';
            statusDiv.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-md text-white transition-opacity';
            document.body.appendChild(statusDiv);
        }

        const statusDiv = document.getElementById('connection-status')!;

        if (!isOnline) {
            statusDiv.textContent = 'Offline';
            statusDiv.classList.add('bg-red-500');
            statusDiv.classList.remove('opacity-0');
        } else {
            statusDiv.textContent = 'Online';
            statusDiv.classList.add('bg-green-500');

            // Hide the online indicator after 3 seconds
            setTimeout(() => {
                statusDiv.classList.add('opacity-0');
            }, 3000);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('textarea');

    if (!textarea) {
        console.error('Textarea element not found');
        return;
    }

    // Initialize offline status indicator
    setupOfflineStatus();

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

        // Check for Alt+Up/Down to move line
        if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            event.preventDefault(); // Prevent default behavior
            moveCurrentLine(textarea, event.key === 'ArrowUp' ? 'up' : 'down');
        }
    });

    // Initialize keyboard shortcuts tooltip
    initShortcutsTooltip();
});

/**
 * Initializes the keyboard shortcuts tooltip
 */
function initShortcutsTooltip(): void {
    const tooltipElement = document.getElementById('shortcuts-tooltip');
    if (tooltipElement) {
        // Define keyboard shortcuts here for easy editing
        const shortcuts = [
            'Ctrl+Shift+K: Delete line',
            'Ctrl+C (no selection): Copy line',
            'Ctrl+X (no selection): Cut line',
            'Alt+↑/↓: Move line up/down'
        ];

        // Set the tooltip content
        tooltipElement.title = 'Keyboard Shortcuts:\n' + shortcuts.join('\n');
    }
}

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
 * Move the current line up or down
 */
function moveCurrentLine(textarea: HTMLTextAreaElement, direction: 'up' | 'down'): void {
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Find current line boundaries
    const currentLine = findLineBoundaries(text, cursorPos);

    // Calculate the relative cursor position within the current line
    const relativePos = cursorPos - currentLine.start;

    // Split text into lines
    const lines = text.split('\n');

    // Find the line index based on line boundaries
    let lineIndex = 0;
    let charCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length;
        if (charCount <= currentLine.start && currentLine.start <= charCount + lineLength) {
            lineIndex = i;
            break;
        }
        charCount += lineLength + 1; // +1 for the newline character
    }

    // Check if we can move in the desired direction
    if ((direction === 'up' && lineIndex === 0) ||
        (direction === 'down' && lineIndex === lines.length - 1)) {
        return; // Cannot move further in this direction
    }

    // Determine the target line index
    const targetIndex = direction === 'up' ? lineIndex - 1 : lineIndex + 1;

    // Swap the lines
    const temp = lines[lineIndex];
    lines[lineIndex] = lines[targetIndex];
    lines[targetIndex] = temp;

    // Rejoin the text
    const newText = lines.join('\n');
    textarea.value = newText;

    // Calculate new cursor position
    let newCursorPos = 0;

    // Count characters up to the target line
    for (let i = 0; i < targetIndex; i++) {
        newCursorPos += lines[i].length + 1; // +1 for newline
    }

    // Add the relative position within the line
    newCursorPos += Math.min(relativePos, lines[targetIndex].length);

    // Update cursor position
    textarea.selectionStart = newCursorPos;
    textarea.selectionEnd = newCursorPos;

    // Trigger input event
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
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
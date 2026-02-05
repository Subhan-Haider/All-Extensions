# Notes for Certification

## Test Accounts
No user accounts or login are required to use this extension. All features are available immediately upon installation.

## Testing Instructions
To fully test the extension's functionality, please follow these steps:

1.  **Navigate to a Test Site:**
    *   Go to a typing test website such as `typing.com`, `monkeytype.com`, or use any standard text input field (e.g., Google Docs, Notepad).
    
2.  **Core Typing Feature:**
    *   Open the extension popup ("GhostType AI").
    *   Enter any text into the "Typing Content" text area (e.g., "Hello world").
    *   Click the **"Start Typing"** button.
    *   Immediately click inside the target input field on the webpage.
    *   Observe the extension typing the text character-by-character with realistic human timing.

3.  **"Magic Flow" & Collection (Hidden/Contextual Feature):**
    *   On a typing test page (like `monkeytype.com`), click the **"Magic Flow"** (or "Collect") button in the extension popup.
    *   The extension will automatically detect and "scrape" the text to be typed from the page and populate it into the extension's text area.
    *   Click **"Start Typing"** to type this collected text back into the page.
    
4.  **AI Smart Fix (External Service):**
    *   If you paste broken text (e.g., "H e l l o w o r l d") into the extension, click the **"AI Fix"** button.
    *   This feature connects to external AI services (OpenRouter, HuggingFace, etc.) to normalize the text. It uses a tiered fallback system to ensure functionality without requiring user API keys.

## Dependencies & Permissions
*   **External Calls:** The extension makes fetch requests to `openrouter.ai`, `textsynth.com`, and `huggingface.co` only when the "AI Fix" or "Humanize" features are explicitly used by the user.
*   **Permissions:** `scripting` and `activeTab` are used solely to inject the typing simulation script into the user's active tab when they click "Start".
*   **Device Simulation:** The "Device Type" setting (Computer vs. Phone) subtly alters the typing rhythm and speed profile to mimic different input devices.

## Conditional/Locked Features
There are no locked features. "Magic Flow" is conditional on the extension successfully detecting text on the current webpage (it looks for common typing test text containers).

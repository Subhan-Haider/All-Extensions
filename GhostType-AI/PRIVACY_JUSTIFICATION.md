# GhostType AI - Privacy & Policy Justifications

## Single Purpose Description
The single purpose of GhostType AI is to simulate natural human typing patterns on web pages. It provides a text extraction tool ("Magic Flow") to capture content from a page and a typing engine that inputs that content into text fields with realistic delays, typos, and corrections, assisting users with data entry, testing, and accessibility needs.

---

## Permission Justifications

### `scripting`
**Justification:** The extension requires the `scripting` permission to inject the typing simulation engine (JavaScript functions) into the active web page where the user wants to type. This allows the extension to interact with the DOM elements (input fields) and dispatch keyboard events to simulate typing.

### `activeTab`
**Justification:** The `activeTab` permission is used to grant the extension temporary access to the current tab only when the user invokes the extension (clicks the popup or a button). This allows the extension to read the text content for "Magic Flow" collection and to execute the typing script on that specific page without requiring broad `host_permissions` for every website.

### `storage`
**Justification:** The `storage` permission is used to save the user's localized preferences, such as Words Per Minute (WPM), Accuracy settings, saved Presets, and Theme preference (Light/Dark mode). No personal data is stored; only configuration settings are saved locally to improve user experience.

### Host Permission Justification
**Justification:** The extension requests limited host permissions for specific AI API domains (`https://openrouter.ai/*`, `https://api.textsynth.com/*`, `https://api-inference.huggingface.co/*`). These are strictly required for the optional "AI Smart Fix" and "humanization" features, where the extension sends the text snippet to these services to repair broken formatting or grammar. No user browsing history or other data is accessed or sent to these hosts.

---

## Remote Code
**Are you using remote code?**
**No, I am not using Remote code.**
(The AI API calls are standard `fetch` requests to REST endpoints, not "Remote Code" execution. The logic is contained within the extension.)

---

## Data Usage Declarations

**Checked Options (What data do you collect?):**
*   **Website content:** (Yes, for the "Magic Flow" feature which extracts text from the page to be re-typed. This data is processed locally and ephemeral.)
*   **User activity:** (Technically yes, as we simulate keystrokes, but we do not *collect* or *log* user keystrokes. We *generate* them. However, for transparency, you might need to check "User activity" if they consider interacting with the page as such. Usually, if you **do not send this data to a server**, you might not need to declare "collection" depending on strictness. But since we use AI APIs for the text content, "Website Content" is the most accurate.)

**Certifications:**
*   [x] I do not sell or transfer user data to third parties, outside of the approved use cases.
*   [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
*   [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

---

## Privacy Policy URL
(You need to host this file somewhere, typically GitHub Pages. I will create a `PRIVACY_POLICY.md` for you to host.)
https://subhan-haider.github.io/GhostType-AI/PRIVACY_POLICY.html
(Note: You will need to enable GitHub Pages for your repo and ensure this file exists. I will generate the content for you now.)

# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you find a vulnerability in ClipTrack, please follow these steps:

1.  **Do not** open a public issue on GitHub.
2.  Email us privately at [security@example.com](mailto:security@example.com) (replace with actual email if available, or just instruct to open a draft PR).
    *   *Alternative*: Open a specifically labeled Issue asking for a private channel if email is not preferred.
3.  Provide detailed steps to reproduce the vulnerability.
4.  We will respond within 48 hours.

### Privacy & Data Security

ClipTrack is designed with privacy as the core principle:
*   **Local Storage**: All clipboard data is stored in `chrome.storage.local`. It is **never** sent to any external server by the extension itself.
*   **No Analytics**: We do not track your clicks, keystrokes, or clipboard content unless you explicitly use the "Export" feature to download it yourself.
*   **Permissions**: We request `clipboardRead` and `clipboardWrite` solely to function as a history manager. `activeTab` is used to detect context (source URL) for copied items. `downloads` is used for exporting your data.

Thank you for helping keep ClipTrack secure!

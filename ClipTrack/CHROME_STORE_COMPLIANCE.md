# Chrome Web Store Compliance: ClipTrack - Clipboard History Manager

## 1. Single Purpose
**Description:**
Advanced clipboard history manager with favorites, tags, export, statistics, and more!

*Justification:*
The single purpose of **ClipTrack - Clipboard History Manager** is to advanced clipboard history manager with favorites, tags, export, statistics, and more! directly within the browser. All features and permissions are strictly scoped to support this purpose.

---

## 2. Permissions

### storage
Required to persist user preferences (like theme, options) and extension state locally. No data is sent to external servers.

### clipboardRead
Required to access the clipboard history only when the user requests to manage or paste snippets.

### clipboardWrite
Required to copy processed text or results back to the user's clipboard.

### activeTab
Required to access the content of the *current* tab only when the user explicitly clicks the extension icon.

### downloads
Required to save generated files (reports, images, backups) to the user's local disk.


### Host Permission Justification
No host permissions required.

---

## 3. Remote Code
- [x] **No, I am not using Remote code.**
*(All logic is contained within the generic extension bundle.)*

---

## 4. Data Usage
**Data Collection Checklist:**
- [x] **User activity**: Interaction with the extension's settings and features.
- [x] **Website content**: Read locally to perform page modifications or analysis.
- [x] **User-generated content**: Clipboard data is processed only when you trigger a paste action.


**Certifications:**
- [x] **I do not sell** or transfer user data to third parties.
- [x] **I do not use** user data for purposes unrelated to the single purpose.
- [x] **I do not use** user data for creditworthiness or lending purposes.

---

## 5. Privacy Policy
*(You must host your privacy policy online. If you don't have a website, you can use a GitHub Gist or Google Doc.)*

**Privacy Policy URL:** `https://github.com/yourusername/your-repo/blob/main/PRIVACY_POLICY.md` (Placeholder)

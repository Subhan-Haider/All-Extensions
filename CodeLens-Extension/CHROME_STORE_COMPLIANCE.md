# Chrome Web Store Compliance: CodeLens: Extension Source Explorer

## 1. Single Purpose
**Description:**
Unlock the secrets of any browser extension. View source code for Chrome, Firefox, and Opera extensions with a single click.

*Justification:*
The single purpose of **CodeLens: Extension Source Explorer** is to unlock the secrets of any browser extension. view source code for chrome, firefox, and opera extensions with a single click directly within the browser. All features and permissions are strictly scoped to support this purpose.

---

## 2. Permissions

### tabs
Required to query the current tab state or open new tabs for displaying results/dashboards.

### storage
Required to persist user preferences (like theme, options) and extension state locally. No data is sent to external servers.

### contextMenus
Required to provide a convenient right-click menu interface for quick access to tools.

### declarativeContent
Required for core functionality.


### Host Permission Justification
**Specific Hosts**: Access is strictly limited to `*://clients2.google.com/service/update2/crx*, *://clients2.googleusercontent.com/crx/download/*, *://microsoftedge.microsoft.com/extensionwebstorebase/v1/crx*, *://edge.microsoft.com/extensionwebstorebase/v1/crx*, https://addons.mozilla.org/*, https://api.github.com/*, https://github.com/*` to execute scripts on these target sites.

---

## 3. Remote Code
- [x] **No, I am not using Remote code.**
*(All logic is contained within the generic extension bundle.)*

---

## 4. Data Usage
**Data Collection Checklist:**
- [x] **Web history**: Accessed locally to manage tabs or detect navigation events.
- [x] **User activity**: Interaction with the extension's settings and features.
- [x] **Website content**: Read locally to perform page modifications or analysis.


**Certifications:**
- [x] **I do not sell** or transfer user data to third parties.
- [x] **I do not use** user data for purposes unrelated to the single purpose.
- [x] **I do not use** user data for creditworthiness or lending purposes.

---

## 5. Privacy Policy
*(You must host your privacy policy online. If you don't have a website, you can use a GitHub Gist or Google Doc.)*

**Privacy Policy URL:** `https://github.com/yourusername/your-repo/blob/main/PRIVACY_POLICY.md` (Placeholder)

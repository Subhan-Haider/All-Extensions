# Chrome Web Store Compliance: Website Copier

## 1. Single Purpose
**Description:**
Copy entire websites with all assets and export as ZIP file. Works offline-ready.

*Justification:*
The single purpose of **Website Copier** is to copy entire websites with all assets and export as zip file. works offline-ready directly within the browser. All features and permissions are strictly scoped to support this purpose.

---

## 2. Permissions

### activeTab
Required to access the content of the *current* tab only when the user explicitly clicks the extension icon.

### scripting
Required to inject content scripts that modify the page (e.g., blocking elements, changing styles) as per Website Copier's core function.

### downloads
Required to save generated files (reports, images, backups) to the user's local disk.

### storage
Required to persist user preferences (like theme, options) and extension state locally. No data is sent to external servers.

### contextMenus
Required to provide a convenient right-click menu interface for quick access to tools.


### Host Permission Justification
**<all_urls>**: Website Copier operates on all websites to provide its functionality universally (e.g., blocking ads or modifying content globally).

---

## 3. Remote Code
- [x] **No, I am not using Remote code.**
*(All logic is contained within the generic extension bundle.)*

---

## 4. Data Usage
**Data Collection Checklist:**
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

# Chrome Web Store Compliance: StudyStream

## 1. Single Purpose
**Description:**
Premium student productivity hub with Focus Timer, Soundscapes, Stats, and Research Vault.

*Justification:*
The single purpose of **StudyStream** is to premium student productivity hub with focus timer, soundscapes, stats, and research vault directly within the browser. All features and permissions are strictly scoped to support this purpose.

---

## 2. Permissions

### storage
Required to persist user preferences (like theme, options) and extension state locally. No data is sent to external servers.

### declarativeNetRequest
Required to block unwanted network requests (ads/trackers) efficiently without inspecting sensitive request data.

### activeTab
Required to access the content of the *current* tab only when the user explicitly clicks the extension icon.

### notifications
Required to alert the user when a background task (like a download or scan) is completed.


### Host Permission Justification
**<all_urls>**: StudyStream operates on all websites to provide its functionality universally (e.g., blocking ads or modifying content globally).

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

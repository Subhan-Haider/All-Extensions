# Chrome Web Store Compliance: FocusGuard - Advanced Site Blocker

## 1. Single Purpose
**Description:**
Stay focused by blocking distracting websites. Includes focus timer, password protection, and custom redirects.

*Justification:*
The single purpose of **FocusGuard - Advanced Site Blocker** is to stay focused by blocking distracting websites. includes focus timer, password protection, and custom redirects directly within the browser. All features and permissions are strictly scoped to support this purpose.

---

## 2. Permissions

### storage
Required to persist user preferences (like theme, options) and extension state locally. No data is sent to external servers.

### declarativeNetRequest
Required to block unwanted network requests (ads/trackers) efficiently without inspecting sensitive request data.

### declarativeNetRequestWithHostAccess
Required for network filtering functionality.

### declarativeNetRequestFeedback
Required for network filtering functionality.

### tabs
Required to query the current tab state or open new tabs for displaying results/dashboards.

### contextMenus
Required to provide a convenient right-click menu interface for quick access to tools.

### alarms
Required to schedule periodic background maintenance tasks to ensure FocusGuard - Advanced Site Blocker runs smoothly.

### notifications
Required to alert the user when a background task (like a download or scan) is completed.

### webNavigation
Required to listen for navigation events to automatically trigger FocusGuard - Advanced Site Blocker on specific websites.


### Host Permission Justification
**<all_urls>**: FocusGuard - Advanced Site Blocker operates on all websites to provide its functionality universally (e.g., blocking ads or modifying content globally).

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

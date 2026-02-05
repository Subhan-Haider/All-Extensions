# Chrome Web Store Privacy & Compliance Form

## Single Purpose
**Single purpose description:**
ClipTrack is a clipboard history manager that automatically records, organizes, and allows users to search, manage, and re-use text they have copied, cut, or pasted. The extension provides a searchable history of clipboard events, favorites management, tagging, templates, and usage statistics—all focused on enhancing clipboard productivity.

---

## Permission Justifications

### storage
**Justification:**
Required to save clipboard history, user preferences, favorites, tags, templates, and statistics locally on the user's device. All data is stored in chrome.storage.local and never transmitted externally.

### clipboardRead
**Justification:**
Essential for detecting and capturing text content when users perform copy or cut operations. This is the core functionality of a clipboard history manager—without this permission, the extension cannot record clipboard events.

### clipboardWrite
**Justification:**
Enables users to re-copy previously saved clipboard items back to their system clipboard. This allows users to quickly access and reuse historical clipboard content, which is a primary feature of the extension.

### activeTab
**Justification:**
Used to capture the source URL and page title where clipboard events occur. This contextual information helps users identify where they copied content from, improving organization and searchability of their clipboard history.

### downloads
**Justification:**
Allows users to export their clipboard history to local files in JSON, CSV, or TXT formats. This gives users full control and ownership of their data, enabling backup and portability.

### Host permission (<all_urls>)
**Justification:**
ClipTrack's core functionality is to automatically track clipboard events (copy, cut, paste) across ALL websites the user visits, which is the fundamental purpose of a clipboard history manager. Here's why broad host permissions are essential and cannot be replaced with activeTab:

1. **Automatic Event Detection**: The extension must detect clipboard events the moment they occur on any website, without requiring explicit user interaction with the extension. The activeTab permission only grants access when the user clicks the extension icon, which would miss 99% of clipboard events that happen during normal browsing.

2. **Passive Monitoring**: Users copy/paste content while working across dozens of different websites throughout their day (GitHub, Google Docs, Stack Overflow, email clients, etc.). The extension needs to run silently in the background on all sites to capture this activity—it cannot predict which sites users will copy from.

3. **Context Preservation**: The extension records the source URL and page title where clipboard events occur. This requires the content script to be active on every page to capture this contextual information at the moment of the clipboard action.

4. **Industry Standard**: All major clipboard managers (Ditto, ClipClip, CopyQ) require system-wide access to function. The web extension equivalent is <all_urls> in content_scripts.

**Privacy Safeguards**:
- The content script ONLY listens for clipboard events (copy/cut/paste)
- No other page content, forms, or user input is accessed
- All data stays local on the user's device
- No network requests are made
- Open source code available for audit

**Why activeTab Won't Work**:
activeTab only grants access when the user explicitly clicks the extension icon. This would mean:
- Missing all clipboard events that happen during normal browsing
- Requiring users to click the extension before every copy/paste (defeating the purpose)
- Making the extension essentially non-functional as a clipboard manager

The <all_urls> permission is not a security risk in this case—it's a functional requirement for the extension's single, well-defined purpose.

---

## Remote Code

**Are you using remote code?**
No, I am not using Remote code

**Justification:**
All JavaScript code is bundled within the extension package. No external scripts, CDN resources, or eval() functions are used. The extension operates entirely offline after installation.

---

## Data Usage

**What user data do you plan to collect from users now or in the future?**

☐ Personally identifiable information
☐ Health information
☐ Financial and payment information
☐ Authentication information
☐ Personal communications
☐ Location
☐ Web history
☐ User activity
☑ Website content (clipboard text, source URLs, page titles)

**Explanation:**
ClipTrack collects only the text content users explicitly copy/cut/paste, along with the source URL and page title for context. This data is stored locally on the user's device and is never transmitted to external servers.

---

## Certifications

☑ I certify that I do not sell or transfer user data to third parties, outside of the approved use cases

☑ I certify that I do not use or transfer user data for purposes that are unrelated to my item's single purpose

☑ I certify that I do not use or transfer user data to determine creditworthiness or for lending purposes

---

## Privacy Policy

**Privacy policy URL:**
https://github.com/haider-subhan/ClipTrack---Clipboard-History-Manager/blob/main/PRIVACY_POLICY.md

---

## Additional Notes for Reviewers

ClipTrack is designed with privacy as the top priority:
- All data storage is local (chrome.storage.local)
- No analytics or tracking services
- No external API calls
- No user authentication or accounts
- Users can export or delete their data at any time
- Open source code available for review

The extension's sole purpose is to help users manage their clipboard history locally on their device.

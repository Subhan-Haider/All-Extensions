# Chrome Web Store Compliance: Humanize AI

## 1. Single Purpose
**Description:**
The simplest way to make AI text sound human.

*Justification:*
The single purpose of **Humanize AI** is to the simplest way to make ai text sound human directly within the browser. All features and permissions are strictly scoped to support this purpose.

---

## 2. Permissions

### storage
Required to persist user preferences (like theme, options) and extension state locally. No data is sent to external servers.

### sidePanel
Required for core functionality.

### declarativeNetRequest
Required to block unwanted network requests (ads/trackers) efficiently without inspecting sensitive request data.


### Host Permission Justification
**Specific Hosts**: Access is strictly limited to `https://deceptioner.site/*` to execute scripts on these target sites.

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

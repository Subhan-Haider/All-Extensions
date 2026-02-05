# Chrome Web Store Compliance: UniSaver - Student Discount Finder

## 1. Single Purpose
**Description:**
Automatically find student discounts and deals on the websites you visit.

*Justification:*
The single purpose of **UniSaver - Student Discount Finder** is to automatically find student discounts and deals on the websites you visit directly within the browser. All features and permissions are strictly scoped to support this purpose.

---

## 2. Permissions

### activeTab
Required to access the content of the *current* tab only when the user explicitly clicks the extension icon.

### scripting
Required to inject content scripts that modify the page (e.g., blocking elements, changing styles) as per UniSaver - Student Discount Finder's core function.

### storage
Required to persist user preferences (like theme, options) and extension state locally. No data is sent to external servers.

### alarms
Required to schedule periodic background maintenance tasks to ensure UniSaver - Student Discount Finder runs smoothly.

### notifications
Required to alert the user when a background task (like a download or scan) is completed.


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


**Certifications:**
- [x] **I do not sell** or transfer user data to third parties.
- [x] **I do not use** user data for purposes unrelated to the single purpose.
- [x] **I do not use** user data for creditworthiness or lending purposes.

---

## 5. Privacy Policy
*(You must host your privacy policy online. If you don't have a website, you can use a GitHub Gist or Google Doc.)*

**Privacy Policy URL:** `https://github.com/yourusername/your-repo/blob/main/PRIVACY_POLICY.md` (Placeholder)

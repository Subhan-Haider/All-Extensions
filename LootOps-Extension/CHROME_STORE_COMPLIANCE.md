# Chrome Web Store Compliance: LootOps: Epic & Steam Games

## 1. Single Purpose
**Description:**
Tactical HUD for free games. LootOps tracks every free loot drop from Epic Games and Steam.

*Justification:*
The single purpose of **LootOps: Epic & Steam Games** is to tactical hud for free games. lootops tracks every free loot drop from epic games and steam directly within the browser. All features and permissions are strictly scoped to support this purpose.

---

## 2. Permissions

### alarms
Required to schedule periodic background maintenance tasks to ensure LootOps: Epic & Steam Games runs smoothly.

### notifications
Required to alert the user when a background task (like a download or scan) is completed.

### storage
Required to persist user preferences (like theme, options) and extension state locally. No data is sent to external servers.


### Host Permission Justification
**Specific Hosts**: Access is strictly limited to `https://store-site-backend-static-ipv4.ak.epicgames.com/, https://store.steampowered.com/*` to execute scripts on these target sites.

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

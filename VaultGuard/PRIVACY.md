# Privacy Policy for VaultGuard

**Last Updated: January 2026**

At **VaultGuard**, we believe that your privacy is not a feature—it is a fundamental right. This Privacy Policy outlines exactly how we handle your data and our commitment to your security.

## 1. The Local-First Philosophy
VaultGuard is built on a "Local-First" architecture. This means:
- **No Cloud Syncing:** Your passwords, usernames, and notes are never uploaded to any server. 
- **Zero Data Collection:** We do not track your browsing history, clicks, or usage patterns.
- **No Third-Party Analytics:** We do not use Google Analytics, Mixpanel, or any other tracking scripts.

## 2. Data We Process
VaultGuard stores the following data exclusively on your local device:
- **Credentials:** Domain names, usernames, and passwords.
- **Metadata:** Last updated timestamps, usage counts, and site categories.
- **Assets:** Website logos (favicons) fetched from public CDNs.
- **Preferences:** Your chosen theme, accent colors, and settings (e.g., Force HTTPS).

## 3. Storage Mechanism
All data is stored using the `chrome.storage.local` API. This storage is:
- **Sandboxed:** Only the VaultGuard extension can access its own data.
- **Browser-Protected:** Your data is protected by your operating system's user account security.
- **User-Controlled:** You can export your data to JSON or wipe it completely at any time.

## 4. Permissions
VaultGuard requires the following permissions to function:
- `storage`: To save your passwords locally.
- `tabs` & `activeTab`: To identify the current website for auto-fill and logo fetching.
- `notifications`: To provide feedback when a password is secured.
- `declarativeNetRequest`: To implement the "Force HTTPS" security feature.

## 5. Third-Party Services
VaultGuard interacts with only two external services for purely functional reasons:
- **Google Favicon Service:** To fetch high-resolution logos for your vault list. No credentials are ever sent to this service—only the domain name (e.g., `github.com`).
- **QR Server API:** To generate QR codes for secure password transfer to mobile. This happens via a secure GET request of the encrypted-style password string.

## 6. Your Rights
Since we do not collect your data, we have no data to "sell" or "share." You have absolute control:
- **Access:** You can view all stored data in the "Vault" tab.
- **Portability:** You can export your entire vault as a JSON file.
- **Deletion:** You can clear individual entries or "Nuke" the entire vault from the Settings tab.

## 7. Chrome Web Store Compliance
VaultGuard complies with the Chrome Web Store Developer Program Policies, including the "Single Purpose" and "User Data Privacy" requirements.

### Single Purpose
The single purpose of VaultGuard is to provide a secure and efficient tool for managing user credentials and personal security settings locally.

### Data Minimization
We only request permissions that are essential to the extension's core functionality. Each permission usage is documented and justified within our developer dashboard submission.

## 8. Contact
If you have questions about our privacy commitment, please open an issue on our [GitHub Repository](https://github.com/haider-subhan/VaultGuard).

# Privacy Policy for FocusGuard

**Last Updated: January 28, 2026**

---

## Our Commitment to Your Privacy

FocusGuard is built with **privacy-first principles**. We believe your browsing data is yours and yours alone. This privacy policy explains our approach to data handling.

---

## Data Collection

### What We DON'T Collect

FocusGuard does **NOT** collect, transmit, or store any of the following:

- ❌ Browsing history
- ❌ Personal information
- ❌ Website URLs you visit
- ❌ Search queries
- ❌ Cookies or tracking data
- ❌ Analytics or telemetry
- ❌ User accounts or login credentials
- ❌ IP addresses
- ❌ Location data
- ❌ Any data sent to external servers

### What We DO Store (Locally Only)

All data is stored **locally on your device** using Chrome's Storage API:

- ✅ **Blocked Sites List**: Domains you've added to your blocklist
- ✅ **Blocked Keywords**: Keywords you've chosen to block
- ✅ **Category Preferences**: Which categories you've enabled (Social, Video, etc.)
- ✅ **Focus Session Settings**: Your preferred session durations
- ✅ **Statistics**: Local counts of distractions avoided and focus minutes
- ✅ **Extension Settings**: Your preferences (Strict Mode, Whitelist Mode, etc.)

**Important**: This data never leaves your device. It is not synced to the cloud, not sent to any server, and not accessible to anyone but you.

---

## How Your Data is Used

Your locally stored data is used **exclusively** for:

1. **Blocking websites** based on your custom rules
2. **Displaying statistics** in your dashboard
3. **Maintaining your preferences** across browser sessions
4. **Running focus sessions** with your chosen settings

---

## Data Storage Location

- **Storage Type**: Chrome Local Storage API
- **Location**: Your device only
- **Encryption**: Managed by your browser
- **Backup**: Not automatically backed up (stays on your device)

---

## Third-Party Services

FocusGuard does **NOT** use any third-party services, including:

- No analytics platforms (Google Analytics, etc.)
- No crash reporting services
- No advertising networks
- No cloud storage providers
- No external APIs

The only external resource loaded is:
- **Google Fonts** (Outfit font) - loaded from Google's CDN for typography

---

## Permissions Explained

FocusGuard requests the following Chrome permissions:

### `declarativeNetRequest`
- **Purpose**: Block websites at the network level
- **Access**: Can intercept network requests to blocked domains
- **Privacy**: Only checks URLs against your local blocklist

### `storage`
- **Purpose**: Save your settings and blocklist locally
- **Access**: Can read/write to Chrome's local storage
- **Privacy**: Data never leaves your device

### `tabs`
- **Purpose**: Detect which website you're currently viewing
- **Access**: Can see tab URLs and titles
- **Privacy**: Only used to check against your blocklist; not logged or transmitted

### `webNavigation`
- **Purpose**: Intercept navigation to blocked sites
- **Access**: Can monitor page navigation events
- **Privacy**: Only triggers blocking logic; no data collected

### `alarms`
- **Purpose**: Run background timers for focus sessions
- **Access**: Can schedule periodic tasks
- **Privacy**: No data access; purely for timing

---

## Data Retention

- **Duration**: Data persists until you manually delete it or uninstall the extension
- **Deletion**: Uninstalling FocusGuard automatically deletes all local data
- **Export**: No export feature (data is not designed to leave your device)

---

## Your Control

You have **complete control** over your data:

- ✅ View all blocked sites in the Dashboard
- ✅ Delete individual sites or keywords anytime
- ✅ Clear all statistics manually
- ✅ Uninstall the extension to remove all data

---

## Children's Privacy

FocusGuard does not knowingly collect data from anyone, including children under 13. Since we don't collect any data at all, there are no age restrictions from a privacy perspective.

---

## Changes to This Policy

We may update this privacy policy to reflect changes in the extension. Any updates will be posted in the GitHub repository and included with extension updates.

- **Current Version**: 1.0.0
- **Last Updated**: January 28, 2026

---

## Open Source Transparency

FocusGuard is **open source**. You can review the entire codebase to verify our privacy claims:

**GitHub Repository**: https://github.com/haider-subhan/Site-Blocker

We encourage security researchers and privacy advocates to audit our code.

---

## Contact

If you have questions about this privacy policy or FocusGuard's data practices:

- **GitHub Issues**: https://github.com/haider-subhan/Site-Blocker/issues
- **Repository**: https://github.com/haider-subhan/Site-Blocker

---

## Summary

**TL;DR:**
- 🔒 **Zero data collection** - We don't collect anything
- 💾 **100% local storage** - Everything stays on your device
- 🚫 **No tracking** - No analytics, no telemetry, no servers
- 🔓 **Open source** - Fully transparent and auditable
- ✅ **You're in control** - Delete your data anytime

---

**FocusGuard respects your privacy because we believe focus starts with trust.**

---

*This privacy policy is effective as of January 28, 2026 and applies to FocusGuard version 1.0.0 and later.*

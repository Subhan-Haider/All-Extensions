# Security Policy

## 🛡️ Security Commitment

FocusGuard takes security seriously. As a privacy-focused browser extension, we are committed to protecting our users and maintaining the integrity of the software.

---

## 🔒 Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

---

## 🐛 Reporting a Vulnerability

If you discover a security vulnerability in FocusGuard, please help us protect our users by reporting it responsibly.

### How to Report

**Please DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues via:

1. **GitHub Security Advisories** (Preferred)
   - Go to: https://github.com/haider-subhan/Site-Blocker/security/advisories
   - Click "Report a vulnerability"
   - Provide detailed information about the issue

2. **GitHub Issues** (For non-critical issues)
   - Create a new issue with the label `security`
   - Provide as much detail as possible

### What to Include

When reporting a vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Impact**: What could an attacker do with this vulnerability?
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Affected Versions**: Which versions are affected?
- **Suggested Fix**: If you have ideas for a fix (optional)
- **Proof of Concept**: Code or screenshots demonstrating the issue (if applicable)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

---

## 🔐 Security Best Practices

FocusGuard follows these security practices:

### Code Security

- ✅ **No External Dependencies**: Vanilla JavaScript only - no npm packages to exploit
- ✅ **Content Security Policy**: Strict CSP in manifest
- ✅ **Minimal Permissions**: Only requests necessary Chrome permissions
- ✅ **Input Validation**: All user inputs are sanitized
- ✅ **No eval()**: No dynamic code execution
- ✅ **No Inline Scripts**: All JavaScript in separate files

### Data Security

- ✅ **Local Storage Only**: No data sent to external servers
- ✅ **No Tracking**: Zero analytics or telemetry
- ✅ **No Third Parties**: No external API calls
- ✅ **Encrypted Storage**: Chrome's built-in storage encryption

### Privacy Security

- ✅ **No Data Collection**: We don't collect any user data
- ✅ **No Network Requests**: Extension doesn't make external requests
- ✅ **Open Source**: Full code transparency for auditing

---

## 🔍 Known Security Considerations

### Permissions Required

FocusGuard requires these permissions for functionality:

1. **declarativeNetRequest**
   - **Purpose**: Block websites at network level
   - **Risk**: Can intercept network requests
   - **Mitigation**: Only checks against local blocklist; no data logged

2. **storage**
   - **Purpose**: Save user preferences locally
   - **Risk**: Can read/write local storage
   - **Mitigation**: Only stores user-defined settings; no sensitive data

3. **tabs**
   - **Purpose**: Detect current website
   - **Risk**: Can see tab URLs
   - **Mitigation**: Only used for blocking logic; not logged or transmitted

4. **webNavigation**
   - **Purpose**: Intercept navigation to blocked sites
   - **Risk**: Can monitor page navigation
   - **Mitigation**: Only triggers blocking; no data collection

### Potential Attack Vectors

We've considered and mitigated these potential attack vectors:

1. **XSS (Cross-Site Scripting)**
   - **Mitigation**: Strict CSP, no innerHTML with user data, input sanitization

2. **Injection Attacks**
   - **Mitigation**: All user inputs validated and sanitized

3. **Permission Abuse**
   - **Mitigation**: Minimal permissions, clear purpose for each

4. **Data Leakage**
   - **Mitigation**: No external network requests, local storage only

---

## 🔄 Security Updates

### How We Handle Security Issues

1. **Verification**: Confirm the vulnerability exists
2. **Assessment**: Determine severity and impact
3. **Development**: Create and test a fix
4. **Release**: Push update to users
5. **Disclosure**: Publish details after users are protected

### Update Notifications

- Critical security updates are released immediately
- Users are notified via GitHub releases
- Extension auto-updates through Chrome Web Store (when published)

---

## 🏆 Security Acknowledgments

We appreciate security researchers who help keep FocusGuard safe. Contributors who responsibly disclose vulnerabilities will be acknowledged here (with permission).

### Hall of Fame

*No vulnerabilities reported yet*

---

## 📚 Security Resources

### For Users

- [Privacy Policy](PRIVACY.md)
- [README](README.md)
- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)

### For Developers

- [Manifest V3 Security](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/#security)
- [Content Security Policy](https://developer.chrome.com/docs/extensions/mv3/manifest/content_security_policy/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🤝 Responsible Disclosure

We believe in responsible disclosure and will:

- ✅ Acknowledge your report within 48 hours
- ✅ Keep you updated on our progress
- ✅ Credit you for the discovery (if you wish)
- ✅ Work with you to understand the issue
- ✅ Release a fix as quickly as possible

We ask that you:

- ❌ Don't publicly disclose the vulnerability before we've released a fix
- ❌ Don't exploit the vulnerability for malicious purposes
- ❌ Don't access or modify user data
- ✅ Give us reasonable time to fix the issue
- ✅ Provide detailed information to help us reproduce and fix

---

## 📞 Contact

For security-related questions or concerns:

- **Security Issues**: Use GitHub Security Advisories
- **General Questions**: Open a GitHub issue
- **Repository**: https://github.com/haider-subhan/Site-Blocker

---

## 📜 Security Policy Updates

This security policy may be updated to reflect new practices or address new threats.

- **Last Updated**: January 28, 2026
- **Version**: 1.0

---

**Thank you for helping keep FocusGuard and its users safe!** 🛡️

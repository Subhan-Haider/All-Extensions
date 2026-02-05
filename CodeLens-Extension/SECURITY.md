# Security Policy

## Supported Versions

Currently, only the latest version of CodeLens is supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| < 2.1.0 | :x:                |

## Reporting a Vulnerability

We take the security of CodeLens seriously. If you believe you have found a security vulnerability, please do NOT open a public issue. Instead, please report it through one of the following methods:

1. **Email**: Shoot an email to the maintainer (Subhan Haider) at the contact address listed on my GitHub profile.
2. **GitHub Private Reporting**: If enabled on the repository, use the "Report a vulnerability" button under the **Security** tab.

Please include the following in your report:
- A description of the vulnerability.
- Steps to reproduce the issue (PoC).
- Potential impact.

We will acknowledge receipt of your report within 48 hours and provide a timeline for a fix.

## Our Commitment

- **Local Processing**: CodeLens is designed to process extension data entirely on the client-side. We do not transmit extension source code to any external servers unless you explicitly use the "Upload to GitHub" feature.
- **No Eval**: We avoid using `eval()` or other dangerous functions to ensure that analyzed extensions cannot execute code within the context of the explorer.
- **Privacy by Design**: We collect zero diagnostic or usage data. Your analysis history remains private to your browser instance.

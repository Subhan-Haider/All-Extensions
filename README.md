# 📦 Universal Extension Monorepo

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Extensions](https://img.shields.io/badge/extensions-15+-green.svg) ![Status](https://img.shields.io/badge/status-active-success.svg) ![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Edge%20%7C%20Brave-orange.svg)

Welcome to the **Universal Extension Hub**. This repository serves as a centralized collection of premium browser extensions, productivity tools, and security utilities. Each project is maintained as an independent module designed to enhance your web experience.

---

## 📑 Table of Contents
- [🛡️ Privacy & Security](#-privacy--security)
- [⚡ Productivity Tools](#-productivity-tools)
- [🛠️ Developer Utilities](#-developer-utilities)
- [🎮 Gaming & Lifestyle](#-gaming--lifestyle)
- [�️ Creative Suite](#-creative-suite)
- [🚀 Installation Guide](#-installation-guide)
- [🤝 Contributing](#-contributing)

---

## 🛡️ Privacy & Security
*Extensions dedicated to protecting your data, identity, and browsing habits.*

| Extension | Status | Description |
| :--- | :---: | :--- |
| **[AdShield Pro](./AdShield-Pro)** | ✅ | **Advanced Ad-Blocker**. Features a custom element picker, anti-adblock detection circumvention, and whitelist management. |
| **[VaultGuard](./VaultGuard)** | ✅ | **Secure Password Manager**. Offline-first credential storage using AES-256 encryption. Includes auto-fill and password generation. |
| **[StealthStudy](./StealthStudy)** | ⚠️ | **Student Privacy Suite**. Includes a "Panic Button" to instantly hide tabs and screen blurring filters for privacy in public spaces. |

## ⚡ Productivity Tools
*Tools to help you focus, manage time, and write better.*

| Extension | Status | Description |
| :--- | :---: | :--- |
| **[FocusGuard](./FocusGuard)** | ✅ | **Distraction Blocker**. Implements Pomodoro timers and strictly blocks social media/entertainment sites during work hours. |
| **[ClipTrack](./ClipTrack)** | ✅ | **Clipboard Manager**. Automatically saves your clipboard history. Search, tag, and favorite copied snippets for later use. |
| **[GhostType AI](./GhostType-AI)** | 🚀 | **Human Text Simulator**. Pastes AI-generated text using natural typing patterns (speeds and pauses) to bypass bot detection. |
| **[Humanize AI](./Humanize-AI)** | 🚀 | **Text Refiner**. Rewrites robotic text into fluid, human-sounding language using advanced prompt engineering. |
| **[StudyStream](./StudyStream)** | ✅ | **Virtual Environment**. A dashboard with Lofi music, task tracking, and ambient sounds to boost study retention. |

## 🛠️ Developer Utilities
*Essential tools for web developers and extension creators.*

| Extension | Status | Description |
| :--- | :---: | :--- |
| **[CodeLens Extension](./CodeLens-Extension)** | 💎 | **Source Viewer**. Adds a "View Source" button to the Chrome Web Store, opening a Monaco editor to inspect extension code. |
| **[Website Copier](./Website-Copier)** | ✅ | **Site Cloner**. Downloads all HTML, CSS, Images, and Scripts from a page and packages them into a clean ZIP file. |
| **[ExtGuard Analyzer](./ExtGuard-Analyzer)** | 🔒 | **Security Auditor**. Scans installed extensions for risky permissions and code vulnerabilities. |

## 🎮 Gaming & Lifestyle
*Fun additions to your browser.*

| Extension | Status | Description |
| :--- | :---: | :--- |
| **[LootOps](./LootOps-Extension)** | 🎮 | **Game Deal Tracker**. Monitors Epic Games, Steam, and GOG for 100% free game giveaways and sends instant alerts. |
| **[UniSaver](./UniSaver-Discounts)** | 🎓 | **Student Discounts**. Automatically detects when you visit a store with student pricing and applies verified coupons. |

## 🖼️ Creative Suite
*Media manipulation in your browser.*

| Extension | Status | Description |
| :--- | :---: | :--- |
| **[Image Converter Pro](./Image-Converter-Pro)** | 🖼️ | **Local Converter**. Right-click any image to convert it (WebP → PNG/JPG) or compress it. Uses WebAssembly for speed. |
| **[ExtGuard Web](./ExtGuard-Web)** | 🌐 | **Web Dashboard**. The companion landing page for the ExtGuard auditing tool suite. |

---

## 🚀 Installation Guide

Since this is a monorepo, you can choose to install just the extensions you need.

### Prerequisites
*   Google Chrome, Microsoft Edge, Brave, or any Chromium-based browser.
*   (Optional) `Node.js` installed if you want to build from source for complex extensions.

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Subhan-Haider/All-Extensions.git
    cd All-Extensions
    ```

2.  **Enable Developer Mode**
    *   Open your browser and enter `chrome://extensions` in the URL bar.
    *   Toggle the **Developer mode** switch in the top right corner.

3.  **Load Unpacked Extension**
    *   Click the **Load unpacked** button.
    *   Navigate to the directory of the extension you want (e.g., `All-Extensions/AdShield-Pro`).
    *   Select the folder. The extension is now installed!

---

## � Tech Stack
This repository utilizes a modern web development stack:
*   **Core**: HTML5, CSS3, JavaScript (ES6+)
*   **Frameworks**: React.js, Vite (for complex UIs like ExtGuard)
*   **Styling**: TailwindCSS, Styled Components
*   **APIs**: Chrome Extension Manifest V3

---

## 🤝 Contributing
Contributions make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` in each subdirectory for more information.

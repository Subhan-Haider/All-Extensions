const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

function createSampleZip() {
    const zip = new AdmZip();

    const manifest = {
        name: "Sample Vulnerable Extension",
        version: "1.0.0",
        manifest_version: 2,
        description: "An example extension for testing.",
        permissions: ["<all_urls>", "storage", "tabs"],
        background: {
            scripts: ["background.js"]
        }
    };

    const backgroundJs = `
    console.log("Starting extension...");
    
    // Dangerous pattern: eval
    function dangerous(str) {
      return eval(str);
    }

    // Dangerous pattern: innerHTML
    function updateUI(data) {
      document.body.innerHTML = '<h1>' + data + '</h1>';
    }

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      console.log("Tab updated: ", tab.url);
    });
  `;

    zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)));
    zip.addFile('background.js', Buffer.from(backgroundJs));

    const outputPath = path.join(process.cwd(), 'sample-extension.zip');
    zip.writeZip(outputPath);
    console.log('Sample extension created at: ' + outputPath);
}

createSampleZip();

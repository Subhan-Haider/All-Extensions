const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    // Correct absolute path to the HTML file
    const filePath = 'c:\\Users\\setup\\Videos\\ext5\\3\\store_assets\\assets_generator.html';
    const fileUrl = 'file://' + filePath.replace(/\\/g, '/');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set a large viewport to accommodate both elements
    await page.setViewport({ width: 1500, height: 1200 });

    try {
        console.log(`Loading page: ${fileUrl}`);
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });

        // Wait for Font Awesome to load (approximate check)
        await new Promise(r => setTimeout(r, 2000));

        // Capture Small Promo
        const smallPromo = await page.$('#small-promo');
        if (smallPromo) {
            await smallPromo.screenshot({
                path: 'c:\\Users\\setup\\Videos\\ext5\\3\\store_assets\\small_promo_tile.png',
                omitBackground: false
            });
            console.log('Saved small_promo_tile.png');
        } else {
            console.error('Element #small-promo not found');
        }

        // Capture Marquee Promo
        const marqueePromo = await page.$('#marquee-promo');
        if (marqueePromo) {
            await marqueePromo.screenshot({
                path: 'c:\\Users\\setup\\Videos\\ext5\\3\\store_assets\\marquee_promo_tile.png',
                omitBackground: false
            });
            console.log('Saved marquee_promo_tile.png');
        } else {
            console.error('Element #marquee-promo not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

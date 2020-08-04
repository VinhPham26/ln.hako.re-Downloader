const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://ln.hako.re/sang-tac/7528-mot-the-gioi-dieu-ki");
    await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 3 });

    const chapter = await page.evaluate(() => {
        let items = document.querySelectorAll(".chapter-name");
        let links = [];
        items.forEach(item => {
            links.push({
                title: item.innerText.replace(/[\n\r]+|[\s]{2,}/g, ' ').replace('Mới', '').trim(),
                url: item.querySelector('a').href
            });
        });
        return links;
    });
    console.log(chapter);
    await browser.close();
})();
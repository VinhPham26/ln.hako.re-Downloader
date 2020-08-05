const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 2 }); //viewport for samsung s8
    await page.goto("https://ln.hako.re/truyen/3569-in-no-jitsury-okusha-ni-naritakute-new");
    //await page.click('#guest-menu');

    const chapters = await page.evaluate(() => {
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

    try {
        for (let chapter of chapters) {
            let chapterName = chapter.title.replace(/[|&;?:$%@/"<>()+,]/g, ""); //remove illegal character for file name
            let path = `pics/${chapterName}.png`;

            if (fs.existsSync(path)) {
                continue;
            }
            else {
                await page.goto(`${chapter.url}`, {
                    waitUntil: 'networkidle0',
                });
                await page.waitFor('#chapter-comments', { visible: true }) //wait for comment to show to make sure all the content are fully loaded
                await page.screenshot({ path: path, fullPage: true });
                await console.log(`${chapterName}`);
            }
        }
    } catch (err) {
        console.log(err)
    }

    await browser.close();
})();
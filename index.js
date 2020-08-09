const puppeteer = require('puppeteer');
const fs = require('fs');
const { waitForDebugger } = require('inspector');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 2 });  //viewport for samsung s8
    await page.goto("https://ln.hako.re/truyen/3601-maou-gakuin-no-futekigousha");   //go to the serie main page

    // //turn on night mode of the site
    await page.click('#guest-menu');
    await page.click('.nightmode-toggle');
    await page.waitForSelector('.series-name')    //wait for hako change to night mode

    //get serie name
    const serie = await page.evaluate(() => {
        var serieName = document.querySelector('.series-name')
        return serieName.innerText.replace(/[|&;?:$%@/"<>()+,]/g, "");
    })

    //Create folder with serie name
    fs.mkdirSync(serie, { recursive: true })

    //get all the chapters link and title
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

    //download all the chapters
    try {
        for (let chapter of chapters) {
            let chapterName = chapter.title.replace(/[|&;?:$%@/"<>()+,]/g, ""); //remove illegal character for file name
            let path = `${serie}/${chapterName}.png`;

            if (fs.existsSync(path)) {
                continue;
            }
            else {
                await page.goto(`${chapter.url}`, {
                    waitUntil: 'networkidle0',
                });
                await page.waitForSelector('#chapter-comments') //wait for comment to show to make sure all the content are fully loaded
                await page.screenshot({ path: path, fullPage: true });
                //await page.pdf({ path: path })
                await console.log(`${chapterName}`);
            }
        }
    } catch (err) {
        console.log(err)
    }

    await browser.close();
})();
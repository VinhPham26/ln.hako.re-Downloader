const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 2, isMobile: true });  //viewport for samsung s8
    //set device scale to 1 fix the white in some image
    await page.goto("https://ln.hako.re/truyen/3285-youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e");   //go to the serie main page

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

    //get all the volume
    const volumes = await page.evaluate(() => {
        let items = document.querySelectorAll('.volume-list')
        let lists = [];
        items.forEach(item => {
            lists.push({
                title: item.innerText,
                link: item.querySelector('a').href,
            })
        })
        return lists;
    });

    for await (const volume of volumes) {
        let volumeName = volume.title.replace(/[|&;?:$%@/"<>()+*,]/g, "").trim(); //remove illegal character for file name
        //Create folder with volume name
        fs.mkdirSync(`${serie}/${volumeName}`, { recursive: true })
        await page.goto(volume.link)
        await console.log(volumeName)

        //get the chapter title and url
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
        for (let chapter of chapters) {
            let chapterName = chapter.title.replace(/[|&;?:$%@/"<>()+,]/g, ""); //remove illegal character for file name
            let path = `${serie}/${volumeName}/${chapterName}.png`;

            if (fs.existsSync(path)) {
                continue;
            }
            else {
                await page.goto(`${chapter.url}`, { waitUntil: 'networkidle0', });
                await page.waitForSelector('.sect-title') //wait for comment to show to make sure all the content are fully loaded
                await page.screenshot({ path: path, fullPage: true });
                await console.log(` ${chapterName}`);
            }
        }
    }

    await browser.close()
})();
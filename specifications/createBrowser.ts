import puppeteer from "puppeteer"
export default async () => {
    const browser = await puppeteer.launch({
        headless: true,
        dumpio: false,
        defaultViewport: {
            width: 1280,
            height: 720,
        },
    })

    const page = await browser.newPage()

    page.on("pageerror", ({ message }: { message: string }) => {
        console.log(message)

        page.screenshot({
            path: "screens/" + new Date().getTime() + ".png",
        }).then(() => browser.close())
    })

    return page

    //    await browser.close()
}

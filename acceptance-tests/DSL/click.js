module.exports = async (x, y, page) => {
    await page.waitForTimeout(300) // equals 200 actions per minute
    page.mouse.click(x, y)
}

import {test} from "@playwright/test";

test("test browser",async({page}) =>{
// await page.goto("http://localhost:3001/")
await page.goto("https://qa.kankanasilks.com/")

// keep browser open
await page.pause()
})
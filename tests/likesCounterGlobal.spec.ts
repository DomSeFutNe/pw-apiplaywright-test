import test, { expect } from "@playwright/test";

test("Like counter increase", async ({ page }) => {
    await page.goto("https://conduit.bondaracademy.com/");
    await page.getByText("Global feed").click();


    const likeCounter = page.locator("app-article-preview").first().locator("button");

    await expect(likeCounter).toHaveText("0")
    await likeCounter.click();
    await expect(likeCounter).toHaveText("1")
})
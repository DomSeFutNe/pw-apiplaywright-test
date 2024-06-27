import {test, expect} from "@playwright/test";

import tags from "../test-data/tags.json";

const newArticle = {
    body: "This is a test article body",
    description: "This is a test article description",
    tagList: ["test", "toast"],
    title: "This is a test article title",
};

test.beforeEach(async ({page}) => {
    await page.route("https://conduit-api.bondaracademy.com/api/tags", async (route) => {
        await route.fulfill({
            body: JSON.stringify(tags),
        });
    });
    await page.goto("https://conduit.bondaracademy.com/");
    await page.waitForTimeout(1000)
});

test("has title", async ({page}) => {
    await page.route("https://conduit-api.bondaracademy.com/api/articles*", async (route) => {
        const response = await route.fetch();
        const responseBody = await response.json();

        responseBody.articles[0].title = "This is a MOCK test title.";
        responseBody.articles[0].description = "This is a MOCK test description.";

        await route.fulfill({
            body: JSON.stringify(responseBody),
        });
    });

    await page.getByText("Global feed").click();

    await expect(page.locator(".navbar-brand")).toHaveText("conduit");
    await expect(page.locator("app-article-list h1").first()).toContainText("This is a MOCK test title.");
    await expect(page.locator("app-article-list p").first()).toContainText("This is a MOCK test description");
});

test("Delete article", async ({page, request}) => {

    const articleResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles", {
        data: {
            article: newArticle,
        },
    });

    expect(articleResponse.status()).toEqual(201);

    const articleBody = await articleResponse.json();
    console.log(articleBody.article.slug);

    await page.getByText("Global feed").click();

    // Validate article on global feed
    await expect(page.locator("app-article-list h1").first()).toContainText(newArticle.title);

    // Delete article with UI
    await page.getByText(newArticle.title).click();
    await page.getByRole("button", {name: "Delete Article"}).first().click();

    await page.getByText("Global feed").click();

    // Validate article is deleted
    await expect(page.locator("app-article-list h1").first()).not.toContainText(newArticle.title);
});

test("Create article", async ({page, request}) => {
    await page.getByText("New Article").click();

    // Create article with UI
    await page.getByRole("textbox", {name: "Article Title"}).fill(newArticle.title+"2");
    await page.getByRole("textbox", {name: "What's this article about?"}).fill(newArticle.description);
    await page.getByRole("textbox", {name: "Write your article (in markdown)"}).fill(newArticle.body);
    await page.getByRole("textbox", {name: "Enter tags"}).fill(newArticle.tagList.join(","));

    await page.getByRole("button", {name: "Publish Article"}).click();

    // Wait for the response and intercept the request to get the slug of the article
    const articleResponse = await page.waitForResponse("https://conduit-api.bondaracademy.com/api/articles/");

    const articleResponseBody = await articleResponse.json();

    const slugId = articleResponseBody.article.slug;

    // Validate article on article-page
    await expect(page.locator(".article-page h1").first()).toContainText(newArticle.title+"2");

    await page.getByText("Home").click();
    await page.getByText("Global feed").click();

    // Validate article on global feed
    await expect(page.locator("app-article-list h1").first()).toContainText(newArticle.title+"2");

    // Delete article with API
    const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`);

    expect(deleteArticleResponse.status()).toEqual(204);

    await page.getByText("Global feed").click();

    // Validate article is deleted
    await expect(page.locator("app-article-list h1").first()).not.toContainText(newArticle.title+"2");
});

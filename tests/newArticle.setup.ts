import { test as setup, expect } from "@playwright/test";

const newArticle = {
    body: "This is a test article body",
    description: "This is a test article description",
    tagList: ["test", "like"],
    title: "Likes test article",
};

setup("Create new article", async ({ request }) => {
    const articleResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles", {
        data: {
            article: newArticle,
        },
    });

    expect(articleResponse.status()).toEqual(201);

    const response = await articleResponse.json();
    const slug = response.article.slug;

    process.env["SLUGID"] = slug;

})
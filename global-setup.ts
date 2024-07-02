import {request, expect} from "@playwright/test";
import user from "./.auth/user.json";

import fs from "node:fs";

const newArticle = {
    body: "This is a test article body",
    description: "This is a test article description",
    tagList: ["test", "like"],
    title: "Likes test article global setup",
};

const payload = {
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
};

async function globalSetup() {
    const context = await request.newContext();
    const authFile = ".auth/user.json";

    const resToken = await context.post("https://conduit-api.bondaracademy.com/api/users/login", {
        data: {
            user: payload,
        },
    });
    const responseBody = await resToken.json();
    const accessToken = responseBody.user.token;

    user.origins[0].localStorage[0].value = accessToken;
    fs.writeFileSync(authFile, JSON.stringify(user));

    process.env["ACCESS_TOKEN"] = accessToken;

    const articleResponse = await context.post("https://conduit-api.bondaracademy.com/api/articles", {
        data: {
            article: newArticle,
        },
        headers: {
            "Authorization": `Token ${process.env.ACCESS_TOKEN || ""}`
        }
    });

    expect(articleResponse.status()).toEqual(201);

    const response = await articleResponse.json();
    const slug = response.article.slug;

    process.env["SLUGID"] = slug;
}

export default globalSetup;

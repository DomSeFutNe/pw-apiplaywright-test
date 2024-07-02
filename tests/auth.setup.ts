import { test as setup } from '@playwright/test';
import user from "../.auth/user.json";
import fs from "node:fs";

const authFile = ".auth/user.json";

setup("Authentication", async ({ page, request }) => {
    // Login with UI and store the token in the storage state
    // await page.goto("https://conduit.bondaracademy.com/");

    // await page.getByText("Sign in").click();
    // await page.getByRole("textbox", {name: "Email"}).fill(process.env.EMAIL || "");
    // await page.getByRole("textbox", {name: "Password"}).fill(process.env.PASSWORD || "");
    // await page.getByRole("button", {name: "Sign in"}).click();
    // await page.waitForResponse("https://conduit-api.bondaracademy.com/api/users/login")
    
    // await page.context().storageState({ path: authFile }); 
    
    // Login with API and store the token in the storage state
    const payload = {
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
    };

    const res = await request.post("https://conduit-api.bondaracademy.com/api/users/login", {
        data: {
            user: payload,
        },
    });
    const responseBody = await res.json();
    const accessToken = responseBody.user.token;

    user.origins[0].localStorage[0].value = accessToken;
    fs.writeFileSync(authFile, JSON.stringify(user));

    process.env["ACCESS_TOKEN"] = accessToken;
})
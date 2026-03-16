const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.post("/click", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      ok: false,
      error: "url is required",
    });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // wait a little in case redirect/page update happens
    await page.waitForTimeout(3000);

    const confirmSelector = 'button[data-uia="set-primary-location-action"]';
    const hasConfirmButton = await page.$(confirmSelector);

    if (hasConfirmButton) {
      await page.click(confirmSelector);

      await browser.close();
      return res.json({
        ok: true,
        action: "clicked-confirm-button",
        message: "Opened link and clicked confirm button",
      });
    }

    await browser.close();
    return res.json({
      ok: true,
      action: "direct-link-confirmed",
      message: "Opened link and no second confirm button was needed",
    });
  } catch (error) {
    if (browser) await browser.close();

    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

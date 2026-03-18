const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.post("/click", async (req, res) => {
  const { url, selector } = req.body;

  if (!url || !selector) {
    return res.status(400).json({
      ok: false,
      error: "url and selector are required",
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
    await page.waitForSelector(selector, { timeout: 15000 });
    await page.click(selector);

    res.json({
      ok: true,
      message: "Button clicked successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.get("/", (_req, res) => {
  res.send("browser-click-api is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

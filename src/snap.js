const puppeteer = require("puppeteer");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const run = async cont => {
  if (cont > 2) {
    console.log("Didn't work this time 🥶");
    process.abort();
  }
  try {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({
      width: 2448,
      height: 1530
    });
    await page.goto("https://www.flightradar24.com/17.98,-17.91/3");
    await page.waitForNavigation({
      waitUntil: "networkidle0"
    });
    console.log("Setup complete 😉");
    await screenshot(page, browser);
    process.exit(0);
  } catch (err) {
    console.log("We had a problem setting up 🤯", err);
    try {
      await browser.close();
      cont++;
      console.log("Retrying ...", cont);
      run(cont);
      return null;
    } catch (err) {
      console.log("Browser did not close correctly 🤯", err);
      cont++;
      console.log("Retrying ...", cont);
      run(cont);
      return null;
    }
  }
};

const screenshot = async (page, browser) => {
  let snapName = new Date().getTime();
  const cloudinary_options = {
    public_id: `flightSnaps/${snapName}`
  };
  try {
    let snapResult = await page.screenshot({});
    console.log(`Screenshot taken: ${snapName} 📸`);
    await browser.close();
    console.log("Saving to cloudinary ⏳");
    return cloudinaryPromise(snapResult, cloudinary_options);
  } catch (error) {
    console.error(`[${snapName}] Error in snapshotting 🤯`, error);
    try {
      await browser.close();
      cont++;
      console.log("Retrying ...", cont);
      run(cont);
      return null;
    } catch (err) {
      console.log("Browser did not close correctly 🤯", err);
      cont++;
      console.log("Retrying ...", cont);
      run(cont);
      return null;
    }
  }
};

function cloudinaryPromise(snapResult, cloudinary_options) {
  return new Promise(function(res, rej) {
    cloudinary.v2.uploader
      .upload_stream(cloudinary_options, function(error, cloudinary_result) {
        if (error) {
          console.error("Upload to cloudinary failed 🤯 ", error);
          rej(error);
        }
        console.log("Saved to cloudinary 🧾");
        res(cloudinary_result);
      })
      .end(snapResult);
  });
}

run(0);

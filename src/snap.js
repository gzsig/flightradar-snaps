const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({
    width: 2448,
    height: 1530
  })
  await page.goto('https://www.flightradar24.com/17.98,-17.91/3');
  await page.waitForNavigation({
    waitUntil: 'networkidle0',
  });
  let snapName = new Date().getTime();
  const cloudinary_options = {
    public_id: `flightSnaps/${snapName}`
  };
  let snapResult = await page.screenshot({
  }).then((result) => {
    console.log(`Screenshot taken: ${snapName}`);
    return result;
  }).catch(e => {
    console.error(`[${snapName}] Error in snapshotting`, e);
    return false;
  });

  if (snapResult) {
    await browser.close();
    console.log('Saving to cloudinary')
    return cloudinaryPromise(snapResult, cloudinary_options);
  } else {
    await browser.close();
    return null;
  }
})();

function cloudinaryPromise(snapResult, cloudinary_options) {
  return new Promise(function (res, rej) {
    cloudinary.v2.uploader.upload_stream(cloudinary_options,
      function (error, cloudinary_result) {
        if (error) {
          console.error('Upload to cloudinary failed: ', error);
          rej(error);
        }
        console.log('Saved to cloudinary')
        res(cloudinary_result);
      }
    ).end(snapResult);
  });
}
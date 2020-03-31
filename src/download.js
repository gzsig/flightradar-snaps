const cloudinary = require("cloudinary");
const download = require("image-downloader");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const getSnaps = async (snaps = [], next_cursor = null) => {
  await cloudinary.v2.api.resources(
    { type: "upload", prefix: "flightSnaps", max_results: 500, next_cursor },
    function(error, result) {
      if (error) {
        console.log(error);
        return;
      } else {
        result.resources.forEach(element => {
          snaps.push(element.url);
        });
        if (result.next_cursor) {
          console.log("call again ⏳");
          getSnaps(snaps, result.next_cursor);
        } else {
          console.log("Done getting photos 😉");
          downloadSnaps(snaps);
        }
      }
    }
  );
};

const downloadSnaps = async snaps => {
  console.log(snaps);
  for (let i = 0; i < snaps.length; i++) {
    const options = {
      url: snaps[i],
      dest: "flightSnaps"
    };

    try {
      const { filename, image } = await download.image(options);
      console.log("Saved 📸", filename); // => /path/to/dest/image.jpg
    } catch (e) {
      console.error(e);
    }
  }
};

getSnaps();

const build = require("../functions/build");

const event = {};
const context = {};
const callback = (error, response) => {
  if (error) {
    console.error(error);
  }

  if (response) {
    console.log(response);
  }
};

build.handler(event, context, callback).catch((error) => {
  console.error(error);
});

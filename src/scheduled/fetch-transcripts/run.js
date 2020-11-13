require('dotenv').config();
const { checkForTranscripts } = require("./lib");


async function go() {
  const res = await checkForTranscripts();
  console.log(res);
}

go();

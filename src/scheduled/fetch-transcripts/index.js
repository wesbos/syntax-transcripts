// learn more about scheduled functions here: https://arc.codes/primitives/scheduled
const { checkForTranscripts } = require('./lib.js');

exports.handler = async function scheduled (event) {
  const res = await checkForTranscripts();
  console.log(res)
  return {
    statusCode: 200,
    body: res
  }
}

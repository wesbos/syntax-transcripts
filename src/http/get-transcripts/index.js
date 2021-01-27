// learn more about scheduled functions here: https://arc.codes/primitives/scheduled
const { checkForTranscripts } = require('../../scheduled/fetch-transcripts/lib');

exports.handler = async function scheduled(event) {
  console.log('checking to transcripts')
  const res = await checkForTranscripts();
  console.log(res)
  return {
    statusCode: 200,
    body: res
  }
}

// learn more about HTTP functions here: https://arc.codes/primitives/http
const {handler} = require('../../scheduled/fetch-transcripts/index');

exports.handler = handler;

// exports.handler = async function() {
//   return {
//     statusCode: 200,
//     body: 'hey'
//   }
// }

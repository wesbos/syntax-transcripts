const { Octokit } = require('@octokit/rest');
const { getToken } = require('github-app-installation-token');

let token;


exports.createOctokit = async function() {
  if(!token) {
    console.log('Fetching new token')
    const res = await getToken({
      appId: process.env.GITHUB_APP_ID,
      installationId: process.env.GITHUB_INSTALL_ID,
      privateKey: process.env.GITHUB_PRIVATE_KEY
    });
    token = res.token;
  }

  return new Octokit({
    auth: token
  });
}









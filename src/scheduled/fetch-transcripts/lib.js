const fetch = require('isomorphic-fetch');
const SPEECHES_ENDPOINT = `https://otter.ai/forward/api/v1/speeches?userid=2928871&folder=0&page_size=45&source=owned`;
const { createOctokit } = require('./github');
const REPO = `wesbos/syntax`;
let existingTranscripts = [];
let speeches = [];

// https://github.com/jwalton922/ffpods-projects/blob/1fd371a3ce47fd7e54046f0672b43e1d3049d092/OtterAIUploader/src/main/java/com/ffpods/otteraiuploader/Test.java

// 1. Loop over each local show, and find shows that don't have a transcript

// 2. Ping the URL for the audio https://api.aisense.com/audio/23GQ5NVYQ6I7D4LH - make sure `diarization_finished` is set to true, otherwise it'd not done yet and we should try again in 30 mins.

// 3. Download the transcript as an SRT.
// GET https://otter.ai/forward/api/v1/download_transcript_file?userid=2928871&otid=MgRB0lz1phrRiUleZ79Wlp7Q6YM&format=srt&speaker_names=1&advanced_srt=0

// 4. Commit it to github
// https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#create-or-update-file-contents

// 5. ??? We need some way to associate the markdown file for the syntax episode, with the SRT file.

function getHeaders() {
  return {
    cookie: `sessionid=${process.env.OTTER_SESSION_ID}`,
  }
}


async function getSpeeches() {
  if (speeches.length) {
    console.log('They are cached!')
    return speeches;
  }
  const res = await fetch(SPEECHES_ENDPOINT, {
    headers: getHeaders()
  });
  speeches = await res.json();
  return speeches;
}


async function findSpeech(showNumber) {
  const { speeches } = await getSpeeches();
  const speech = speeches.find(speech => {
    // Search for a show that is like "Syntax 255" or "syntax5".
    const title = speech.title.toLowerCase().replace(' ', '');
    return title.includes(`syntax${showNumber}`);
  });
  if (!speech) return;
  // now that we have the speech data, we have to hit another endpoint to get _all_ the data about that speech
  const url = `https://otter.ai/forward/api/v1/speech?userid=2928871&otid=${speech.otid}`;
  const res = await fetch(url, { headers: getHeaders() });
  const detail = await res.json();
  if (!detail.speech) {
    return console.log(`${detail.status} : ${detail.message}`);
  }
  return detail.speech;
}

async function getTranscriptsForShow(showNumber) {
  // get the speech
  const speech = await findSpeech(showNumber);
  if (!speech) {
    return console.log(`No show for ${showNumber} found`)
  }
  if (!speech.process_finished) {
    return console.log(`Processing for Show ${showNumber} is not yet finished`)
  }
  if (!speech.diarization_finished) {
    return console.log(`Diarization for Show ${showNumber} is not yet finished`)
  }

  console.log(`Getting captions for ${showNumber} from otter.ai`)
  const res = await fetch(`https://otter.ai/forward/api/v1/download_transcript_file?userid=2928871&otid=${speech.otid}&format=srt&speaker_names=1&advanced_srt=0`, { headers: getHeaders() });
  const transcript = await res.text();
  return transcript;
}

async function uploadFiletoGithub({ commitMessage, content, filename }) {
  console.log(`Uploading ${filename} to github`);
  try {
    const octokit = await createOctokit();
    const res = await octokit.request(`PUT /repos/${REPO}/contents/transcripts/${filename}`, {
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
    });
    return res.url;
  } catch (err) {
    console.log(err.headers.status)
  }
}

async function getExistingTranscripts() {
  if (existingTranscripts.length) {
    return existingTranscripts;
  }
  const octokit = await createOctokit();
  const { data } = await octokit.request(`GET /repos/${REPO}/contents/transcripts`);
  existingTranscripts = data;
  return existingTranscripts;
}

async function getNumbersOfShows() {
  const res = await fetch(`https://syntax.fm/api/shows/latest`);
  const { number } = await res.json();
  return number;
}


async function checkForTranscripts() {
  const numberOfShows = await getNumbersOfShows();
  // we add one here because there is an episode 0
  const episodes = Array.from({ length: numberOfShows + 1 }, (_, i) => numberOfShows - i);
  for (const number of episodes) {
    const filename = `Syntax${number}.srt`;
    const files = await getExistingTranscripts();
    const existingTranscript = existingTranscripts.find(file => file.name === filename);
    if (existingTranscript) {
      console.log(`We already have a ${existingTranscript.name} on github! Skipping...`);
      continue;
    }
    const transcript = await getTranscriptsForShow(number);
    if (transcript) {
      await uploadFiletoGithub({
        commitMessage: `Transcript for Syntax Episode ${number}`,
        content: transcript,
        filename
      })
    }
  }
  return 'Done!'
}

exports.checkForTranscripts = checkForTranscripts;

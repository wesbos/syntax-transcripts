# Syntax Transcript Downloader

This is a serverless function for downloading and commiting [Syntax transcripts](https://github.com/wesbos/Syntax/tree/master/transcripts) From Otter.ai.

It works like this:

1. Every 10 minutes, the serverless function is kicked off. It's hosted on Begin.com outside of our Regular Next.js / Vercel website because Vercel doesn't currently support background scripts, long running scripts, or cron jobs.
2. The Function fetches a list of episodes from the Syntax API
3. The function fetches a list of existing transcripts from Github
4. We loop over each episode, and check:
  1. Is there an existing transcript?
  2. Is there a transcript on Otter.ai for this episode?
  3. Is the above transcript done processing (fast)?
  3. Is the above transcript done diarization (slower)?
5. If there is a new transcript, it's exported from Otter, and commited to the [Syntax transcripts folder](https://github.com/wesbos/Syntax/tree/master/transcripts)


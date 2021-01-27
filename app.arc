@app
begin-app

@static

@scheduled
fetch-transcripts cron(0/5 * * * ? *)

@aws
timeout 300

@http
get /transcripts

@app
begin-app

@static

@scheduled
fetch-transcripts cron(0/30 * ? * MON-SUN *)

@aws
timeout 300

@http
get /transcripts

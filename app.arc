@app
begin-app

@static

@scheduled
fetch-transcripts rate(5 minutes)

@aws
timeout 300

@http
get /transcripts

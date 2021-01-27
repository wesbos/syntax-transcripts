@app
begin-app

@static

@scheduled
fetch-transcripts rate(6 hours)

@aws
timeout 300

@http
get /transcripts

@app
begin-app

@static

@scheduled
fetch-transcripts rate(10 minute)

@aws
timeout 300

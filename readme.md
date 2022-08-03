# Initialization

```
yarn
```

# Deploy

### Deploy all

```
sls deploy
```

### Deploy one service

```
sls deploy --service <service>
```

eg. `sls deploy --service ml`

### Deploy one function

```
sls deploy function -f <func> --service <service>
```

eg. `sls deploy function -f processImage --service ml`

# Invoke Function

```
sls invoke local -f <func> --service=<service>
sls invoke local -f <func> -p <event-path> --service=<service>
```

eg. `sls invoke local -f processImage -p functions/process-image/test.json --service=ml`

eg. `sls invoke local -f hello --service=ml`

# Ver.bot-notify
Ver.bot notify part.

## Deploy by yourself
### AWS Lambda(`master` branch)
1. install dependency
```bash
npm i
```

2. before deploy to AWS, [install AWS CLI][1] and [configure it][2].

3. create lambda function.

4. set following environment variables.
```
CHECK_DAYS
SKYPE_APP_ID
SKYPE_APP_SECRET
SLACK_BOT_TOKEN
TELEGRAM_BOT_TOKEN
```

5. If you want to update lambda function:
```bash
sh update-lambda.sh
```

6. set a cron job ( e.g. [CloudWatch Events][3]) to match `CHECK_DAYS` in environment variables.


### General server(`normal-server` branch)
1. install dependency
```bash
npm i
```
2. set following environment variables.
```
AWS_ACCESS_ID
AWS_SECRET_KEY
CHECK_DAYS
SKYPE_APP_ID
SKYPE_APP_SECRET
SLACK_BOT_TOKEN
TELEGRAM_BOT_TOKEN
```
3. set a cron job to match `CHECK_DAYS` in environment variables.


## LICENSE
[AGPL-3.0](LICENSE)

[1]: http://docs.aws.amazon.com/cli/latest/userguide/installing.html
[2]: http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html
[3]: http://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html

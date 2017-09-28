#!/bin/sh

echo -n "zip project ..."
zip -rq Vbot-notify *

echo -ne "\r\033[K"
echo "update lambda ..."
aws lambda update-function-code --function-name Vbot-notify --zip-file "fileb://Vbot-notify.zip"


rm -rf ./Vbot-notify.zip

#!/bin/sh

zip -r Vbot-notify *
aws lambda update-function-code --function-name Vbot-notify --zip-file "fileb://Vbot-notify.zip"
rm -rf ./Vbot-notify.zip

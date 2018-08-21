# widdix GitHub bot

## Deploying the solution manually

1. Get the source code: `git clone git@github.com:widdix/github-bot.git`
2. `cd github-bot/`
3. Run the following command to install the Node.js dependencies: `npm install --production`
4. Inside `lambda-src/`: cd `lambda-src/`
    1. copy the `config.example.json` file save it as `config.json`: `cp config.example.json config.json`
    2. In `config.json`, replace `GITHUB_TOKEN` with a [personal access token](https://github.com/settings/tokens) of a GitHub user with scope `repo:status`.
    3. In `config.json`, replace `SECRET` with a random 16 characters string.
    4. Run the following command to install the Node.js dependencies: `npm install --production`
5. Run the following command and replace `BUCKET_NAME` with the name of an S3 bucket: `aws cloudformation package --template-file template.yml --s3-bucket BUCKET_NAME --output-template-file packaged.yml`
6. Run the following command to deploy the CloudFormation stack: `aws cloudformation deploy --template-file packaged.yml --stack-name github-bot --capabilities CAPABILITY_IAM`
7. Get the URL of the API Gateway to receive GitHub webhooks: `aws cloudformation describe-stacks --stack-name github-bot --query 'Stacks[0].Outputs'`
8. The CodeCommit dummy repository needs an init commit: `aws codecommit put-file --repository-name github-bot-dummy --branch-name master --file-content dummy --file-path README.md`
9. Create a GitHub organization or repository [webhook](https://developer.github.com/webhooks/)
    1. Set the `Payload URL` to the `Url` output from step 7
    2. Set the `Content type` to `application/json`
    3. Set the `Secret` to the random 16 characters string from step 4
    5. Select the individual event `Issue comments` to trigger the webhook

A new comment on a Pull Request will now trigger the API Gateway.

Don't forget to delete the CloudFormation stack when you are done: `aws cloudformation delete-stack --stack-name github-bot`

## Pipeline prerequisites

1. Create SSM parameter `/github-bot/github/token` of type `SecureString` with a [personal access token](https://github.com/settings/tokens) of a GitHub user (`aws ssm put-parameter --name '/github-bot/github/token' --type SecureString --value x`).
2. Create SSM parameter `/github-bot/secret` of type `SecureString` with a random 16 characters string (`aws ssm put-parameter --name '/github-bot/secret' --type SecureString --value x`).

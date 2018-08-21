# widdix GitHub bot

## Pipeline prerequisites

1. Create SSM parameter `/github-bot/github/token` of type `SecureString` with a [personal access token](https://github.com/settings/tokens) of a GitHub user (`aws ssm put-parameter --name '/github-bot/github/token' --type SecureString --value x`).
2. Create SSM parameter `/github-bot/secret` of type `SecureString` with a random 16 characters string (`aws ssm put-parameter --name '/github-bot/secret' --type SecureString --value x`).

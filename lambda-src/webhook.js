const AWS = require('aws-sdk');
const axios = require('axios');

const config = require('./config.json');

const codebuild = new AWS.CodeBuild({apiVersion: '2016-10-06'});

exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  const body = JSON.parse(event.body);
  console.log(JSON.stringify(body));
  if (event.headers['X-GitHub-Event'] === 'issue_comment') {
    if(body.action === 'created') {
      if ('pull_request' in body.issue) {
        if (body.sender.login === 'michaelwittig' || body.sender.login === 'andreaswittig') {
          if (body.comment.body === 'test') {
            const pr = await axios.get(`https://api.github.com/repos/${body.repository.owner.login}/${body.repository.name}/pulls/${body.issue.number}`, {
              headers: {
                Accept: 'application/vnd.github.v3+json',
                Authorization: `token ${config.github.token}`,
                'User-Agent': 'github-bot'
              } 
            });
            const githubOwner = pr.data.head.repo.owner.login;
            const githubRepo = pr.data.head.repo.name;
            const githubSha = pr.data.head.sha;
            await codebuild.startBuild({
              projectName: process.env.VARIABLE1,
              environmentVariablesOverride: [{
                name: 'GITHUB_OWNER',
                value: githubOwner,
                type: 'PLAINTEXT'
              }, {
                name: 'GITHUB_REPO',
                value: githubRepo,
                type: 'PLAINTEXT'
              }, {
                name: 'GITHUB_SHA',
                value: githubSha,
                type: 'PLAINTEXT'
              }]
            }).promise();
          } else {
            console.log('comment body was not test');
          }
        } else {
          console.log('comment not by an admin');
        }
      } else {
        console.log('comment was not for an PR');
      }
    } else {
      console.log('comment was not created');
    }
  } else {
    console.log('not an issue_comment event');
  }
  return {statusCode: 204};
};

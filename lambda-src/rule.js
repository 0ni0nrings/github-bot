const axios = require('axios');

const config = require('./config.json');

const mapBuildStatus = (status) => {
  switch(status) {
  case 'IN_PROGRESS':
    return 'pending';
  case 'FAILED':
    return 'failure';
  case 'SUCCEEDED':
    return 'success';
  case 'STOPPED':
    return 'error';
  default:
    return 'error';
  }
};

exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  if (event.detail['project-name'] === process.env.VARIABLE1) {
    const environmentVariables  = event.detail['additional-information'].environment['environment-variables'].reduce((acc, environmentVariable) => {
      acc[environmentVariable.name] = environmentVariable.value;
      return acc;
    }, {});
    const state = mapBuildStatus(event.detail['build-status']);
    const targetUrl = (state === 'failure' || state === 'success') ? event.detail['additional-information'].logs['deep-link'] : undefined; 
    const githubSha = environmentVariables.GITHUB_SHA;
    const githubPrOwner = environmentVariables.GITHUB_PR_OWNER
    const githubPrRepo = environmentVariables.GITHUB_PR_REPO;
    await axios.post(`https://api.github.com/repos/${githubPrOwner}/${githubPrRepo}/statuses/${githubSha}`, {
      state,
      description: 'Create stacks (sponsored by widdix.net)',
      context: 'widdix-github-bot',
      target_url: targetUrl
    }, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${config.github.token}`,
        'User-Agent': 'widdix-github-bot'
      }
    }).catch(err => {
      if (err.response) {
        console.log(err.response.data);
        console.log(err.response.status);
        console.log(err.response.headers);
      }
      throw err;
    });
  }
  return true;
};

const fetch = require('node-fetch');

const OWNER = 'your-github-username';
const REPO = 'your-repo-name';
const FILE_PATH = 'downloads.json';

exports.handler = async () => {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch file');
    }

    const data = await res.json();
    const count = JSON.parse(Buffer.from(data.content, 'base64').toString()).totalDownloads || 0;

    return {
      statusCode: 200,
      body: JSON.stringify({ totalDownloads: count }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

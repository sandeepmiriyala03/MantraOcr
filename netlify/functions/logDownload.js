const fetch = require('node-fetch');

const OWNER = 'your-github-username';
const REPO = 'your-repo-name';
const FILE_PATH = 'downloads.json';

exports.handler = async () => {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
    const getRes = await fetch(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    if (!getRes.ok) throw new Error('Failed to get file content');

    const fileData = await getRes.json();
    const contentBuffer = Buffer.from(fileData.content, 'base64');
    const jsonContent = JSON.parse(contentBuffer.toString());
    const newCount = (jsonContent.totalDownloads || 0) + 1;
    jsonContent.totalDownloads = newCount;

    // Update the file on GitHub
    const updateRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Increment download count to ${newCount}`,
        content: Buffer.from(JSON.stringify(jsonContent, null, 2)).toString('base64'),
        sha: fileData.sha,
      }),
    });

    if (!updateRes.ok) throw new Error('Failed to update count');

    return {
      statusCode: 200,
      body: JSON.stringify({ totalDownloads: newCount }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

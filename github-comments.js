// netlify/functions/github-comments.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // 从环境变量获取token
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  // GitHub仓库信息 - 需要您替换为实际的值
  const OWNER = 'ExtrmelyLazy';
  const REPO = 'ExtrmelyLazy/CatHouse';
  const ISSUE_NUMBER = 1;

  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  try {
    // 获取评论
    if (event.httpMethod === 'GET') {
      const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/issues/${ISSUE_NUMBER}/comments`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'User-Agent': 'Netlify-Comments-App'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const comments = await response.json();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(comments)
      };
    }
    
    // 提交新评论
    if (event.httpMethod === 'POST') {
      const { comment } = JSON.parse(event.body);
      
      const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/issues/${ISSUE_NUMBER}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'User-Agent': 'Netlify-Comments-App',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ body: comment })
        }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, comment: result })
      };
    }
    
    // 不支持的HTTP方法
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
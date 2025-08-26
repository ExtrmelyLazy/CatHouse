// netlify/functions/github-comments.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  console.log('Function被调用，方法:', event.httpMethod);
  
  // 从环境变量获取token
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  // 请替换为您的实际GitHub信息
  const OWNER = 'ExtrmelyLazy'; // 必须修改
  const REPO = 'CatHouse';       // 必须修改
  const ISSUE_NUMBER = 1;          // 必须修改

  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    console.log('处理OPTIONS预检请求');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  try {
    console.log('开始处理请求，路径:', event.path);
    
    // 检查环境变量
    if (!GITHUB_TOKEN) {
      console.error('错误: GITHUB_TOKEN环境变量未设置');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: '服务器配置错误',
          message: 'GITHUB_TOKEN环境变量未设置，请在Netlify控制台中设置'
        })
      };
    }
    
    // 检查GitHub配置
    if (OWNER === '您的GitHub用户名' || REPO === '您的仓库名') {
      console.error('错误: GitHub配置未修改');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: '配置错误',
          message: '请修改github-comments.js中的OWNER、REPO和ISSUE_NUMBER为您的实际信息'
        })
      };
    }

    // 获取评论
    if (event.httpMethod === 'GET') {
      console.log('处理GET请求，获取评论');
      
      const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/issues/${ISSUE_NUMBER}/comments`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'User-Agent': 'Netlify-Comments-App',
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API错误:', response.status, errorText);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ 
            error: `GitHub API错误: ${response.status}`,
            details: errorText
          })
        };
      }
      
      const comments = await response.json();
      console.log('成功获取评论数量:', comments.length);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(comments)
      };
    }
    
    // 提交新评论
    if (event.httpMethod === 'POST') {
      console.log('处理POST请求，提交评论');
      
      let body;
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        console.error('解析请求体失败:', e);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '无效的JSON格式' })
        };
      }
      
      const { comment } = body;
      
      if (!comment) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '评论内容不能为空' })
        };
      }
      
      const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/issues/${ISSUE_NUMBER}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'User-Agent': 'Netlify-Comments-App',
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({ body: comment })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub提交错误:', response.status, errorText);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ 
            error: `提交失败: ${response.status}`,
            details: errorText
          })
        };
      }
      
      const result = await response.json();
      console.log('评论提交成功');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, comment: result })
      };
    }
    
    // 不支持的HTTP方法
    console.log('不支持的HTTP方法:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '不支持的请求方法' })
    };
    
  } catch (error) {
    console.error('Function执行错误:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '服务器内部错误',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

// 这段代码会在Netlify的服务器上运行
exports.handler = async (event) => {
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 解析提交的数据
    const { name, comment } = JSON.parse(event.body);
    
    // 这里可以添加保存到数据库的代码
    // 但我们先简单返回成功消息
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: '评论提交成功！',
        data: { name, comment, timestamp: new Date().toISOString() }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '提交失败' })
    };
  }
};

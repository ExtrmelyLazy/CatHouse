function time() {
  const now = new Date();
  document.getElementById('time').innerHTML = now.toLocaleString('zh-CN', { // 添加了 now.
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  }); // 修正了括号和引号
}
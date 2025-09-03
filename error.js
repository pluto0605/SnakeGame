document.addEventListener('DOMContentLoaded', () => {
    // 获取按钮元素
    const retryBtn = document.getElementById('retry-btn');
    const homeBtn = document.getElementById('home-btn');
    
    // 重试按钮点击事件
    retryBtn.addEventListener('click', () => {
        // 刷新当前页面
        window.location.reload();
    });
    
    // 返回首页按钮点击事件
    homeBtn.addEventListener('click', () => {
        // 跳转到首页并添加参数防止循环重定向
        window.location.href = 'index.html?from=error&t=' + new Date().getTime();
    });
    
    // 添加动画效果
    const errorContainer = document.querySelector('.error-container');
    errorContainer.style.opacity = '0';
    errorContainer.style.transform = 'translateY(20px)';
    
    // 使用setTimeout模拟加载过程
    setTimeout(() => {
        errorContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        errorContainer.style.opacity = '1';
        errorContainer.style.transform = 'translateY(0)';
    }, 100);
    
    // 自动重试计时器（可选功能）
    let retryCount = 0;
    const maxRetries = 3;
    const retryInterval = 30000; // 30秒
    
    function autoRetry() {
        if (retryCount < maxRetries) {
            retryCount++;
            console.log(`自动重试 (${retryCount}/${maxRetries})...`);
            // 这里可以添加实际的重试逻辑，例如检查服务是否恢复
            // 如果服务恢复，可以重定向到首页
            // 如果服务仍然不可用，继续等待下一次重试
            
            // 模拟检查服务状态
            checkServiceStatus();
        }
    }
    
    // 模拟检查服务状态的函数
    function checkServiceStatus() {
        // 这里应该是实际检查服务状态的代码
        // 为了演示，我们假设服务仍然不可用
        console.log('检查服务状态...');
        
        // 如果想模拟服务恢复，可以取消下面的注释
        // if (Math.random() > 0.7) {
        //     console.log('服务已恢复！');
        //     window.location.href = 'index.html';
        //     return;
        // }
        
        console.log('服务仍然不可用');
    }
    
    // 启动自动重试定时器
    const retryTimer = setInterval(autoRetry, retryInterval);
    
    // 页面关闭时清除定时器
    window.addEventListener('beforeunload', () => {
        clearInterval(retryTimer);
    });
});
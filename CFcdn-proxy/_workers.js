export default {
    async fetch(request, env) {
        // 解析请求的 URL
        let url = new URL(request.url);
        
        // 检查路径是否以 '/' 开头
        if (url.pathname.startsWith('/')) {
            // 定义目标主机数组
            const targetHosts = [
                'aaaa.bbbbb.hf.space',
                // 可以在这里添加更多的目标主机
            ];
            
            // 设置目标 URL 的协议
            url.protocol = 'https:';
            // 随机选择一个目标主机
            url.hostname = getRandomArray(targetHosts);
            
            // 创建一个新的请求对象，保持原请求的所有参数
            let newRequest = new Request(url, request);
            
            // 将请求发送到随机选择的目标主机
            return fetch(newRequest);
        }
        
        // 如果路径不符合条件，则返回静态资源
        return env.ASSETS.fetch(request);
    },
};

// 辅助函数：从数组中随机选择一个元素
function getRandomArray(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

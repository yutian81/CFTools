## cohere2openai
这是一个 Cloudflare Worker，用于将 Cohere API 转换为 OpenAI API
原项目地址：https://github.com/beanqi/cohere2openai

## 如何使用

1. 在 Cloudflare 中创建一个新的 Worker。
2. 将` worker.js` 中的代码复制到 Worker 中。
3. 在 Worker 中设置环境变量：
   - `API_AUTH_TOKEN`： Cohere API 密钥。
5. 部署 Worker。
6. 使用 Worker URL 作为 API 端点。
7. （可选）如有需要，为 Worker 绑定自定义域名。

## 你需要知道的一些事情

我强制 Worker 使用 command-r-plus 模型，[代码在这里](https://github.com/beanqi/cohere2openai/blob/8880315a0ead2f62c8243c249e06374de7ce77d3/worker.js#L52)。如果你想使用其他模型，可以对此处进行注释。

## 另外一个项目
地址：https://github.com/ckt1031/cohere2openai-cf-worker  
压缩包：`workers1.zip`

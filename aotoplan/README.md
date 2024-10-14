# Cronbin 自动化访问指定的网页

## 开发

>  先安装 Deno

```bash
make cronserve
# or: deno run -A --watch ./scripts/cronbin/serve.js ./scripts/cronbin/serve.js
```

## 在 CF WORKER 上部署

1. 创建一个KV命名空间，名称为`CRONBIN`
2. 创建一个 worker，名称随意, 绑定刚刚创建的KV空间，名称: `CRONBIN`
3. 复制[此处代码](https://github.com/theowenyoung/blog/blob/main/scripts/cronbin/main.js)到worker中
4. 修改`APIKEY`，默认为`abc`，点击`保存并部署`
5. 【可选】给项目绑定自定义域
6. 到 worker 项目的`设置`——`触发器`——`corn触发器`，添加corn触发器

第5、6步截图

![add triger](./add-trigger.png)

## 使用

访问 <https://yourdomain.com/?key=abc>，`abc`修改为你自定义的`APIKEY`

然后，浏览器会记住您的 cookie，以便下次我们可以直接访问 https://yourdomain.com

## TG通知代码模板
> 在面板下方填入
```bash
curl --location 'https://api.telegram.org/bot1351044089:xxxxxxxxxxxxxxx/sendMessage' \
--header 'Content-Type: application/json' \
--data '{
    "chat_id":"-100000000000",
    "text":"{{message}}"
}'
```

## 面板截图

![screenshot](./cronbin3.png)

如果启用任务，则勾选复选框；去掉勾选，则任务不生效

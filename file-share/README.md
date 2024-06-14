## file-share
这是一个轻量级的文件管理和在线剪贴板，基于 Cloudflare Pages 或 workers 和 R2 或 kv。  

此处只收录 workers 脚本及部署方法。上传文件最大限制为25M

### 项目一：https://github.com/SharzyL/pastebin-worker
代码：`_workers.zip`，可分享小文件和剪贴板，还可作为短链接

示例：https://shz.al/

- 创建一个`KV`命名空间，记住其名称
- 创建一个`workers`，复制代码`_workers.js`并按需修改
- 将`workers`项目与`KV`命名空间绑定
- 部署，并绑定一个自定义域（中国大陆地区必须绑定）

### 项目二：https://github.com/yllhwa/FileWorker
只能使用`pages`部署，部署方法：

创建 R2 存储桶  
- Cloudflare DashBoard -> R2 -> Create Bucket

获取 R2 存储桶的信息
- Cloudflare DashBoard -> R2 -> Manage R2 API Tokens -> Create API token
- 选择 Object Read & Write 或者 Admin Read & Write。
- 创建后记录 Access Key ID、Secret Access Key。 以及存储桶的Endpoint（格式为：https://{account_id}.r2.cloudflarestorage.com）
- 这些信息不会再次显示。

创建一个`workers`或`pages`，`pages`需要先fork[此项目](https://github.com/yllhwa/FileWorker)  

设置环境变量
- REGION=auto（S3 地区，对于 R2 存储桶可以直接设置为 auto）
- BUCKET=store（存储桶名称）
- ENDPOINT=https://{account_id}.r2.cloudflarestorage.com（存储桶的 Endpoint）
- ACCESS_KEY_ID=31415926535897932384626433832795（存储桶的 Access Key ID）
- SECRET_ACCESS_KEY=3141592653589793238462643383279502884197169399375105820974944592（存储桶的 Secret Access Key）
- PASSWORD=123456（访问密码（自己设置））

截图

![index](https://github.com/yllhwa/FileWorker/blob/main/README/index.png)

![clip](https://github.com/yllhwa/FileWorker/blob/main/README/clip.png)

![file](https://github.com/yllhwa/FileWorker/blob/main/README/file.png)

![manage](https://github.com/yllhwa/FileWorker/blob/main/README/manage.png)

### 项目三：https://github.com/iiop123/dingding
代码：`_workers2.js`，小文件传输，支持拖拽、多文件、口令、二维码

- 创建一个`KV`命名空间，记住其名称
- 创建一个`workers`，复制代码`_workers.js`并按需修改
- 将`workers`项目与`KV`命名空间绑定
- 部署，并绑定一个自定义域（中国大陆地区必须绑定）
- 可以访问 /list.html 页面查看已经上传的数据，密码为123，可以在 src/index.js文件中修改密码
- 可以修改 src/index.js中 const exp=86400 的值，单位为秒，该参数为文件过期时间

截图
<table width="100%">
<tr>
<td width="50%">
    <img src="https://f.pz.al/pzal/2023/02/09/3c020420b7b1d.jpg" width="100%"/>
    <p>主页 </p>
</td>
<td width="50%">
    <img src="https://f.pz.al/pzal/2023/02/09/e95544ff865f3.jpg" width="100%"/>
    <p>文件上传成功信息页</p>
</td>
</tr>
</table>

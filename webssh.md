## 自行部署web端SSH服务

### 部署容器
<https://dashboard.render.com>  

### 部署教程
<https://zelikk.blogspot.com/2023/10/huashengdun-webssh-codesandbox.html>  
- 类型选择：`web service`
- 导入github项目：`https://github.com/crazypeace/huashengdun-webssh`
- 项目名称：随便填
- 服务器位置：选择一个离你近的
- 语言选择：`python3`
- 启动命令行：`python run.py --xsrf=False --xheaders=False --origin='*' --debug --delay=6`
- 点击部署
- 部署完成点击左侧`设置`，添加`自定义域`，在cf中创建一条`CNAME`记录指向分配给你的域名
- 等待解析生效后访问你的自定义域名

### 部署示例
<https://ssh.yutian81.top>

### webssh的github项目
带`ssh link`功能的：<https://github.com/crazypeace/huashengdun-webssh>
  - 缺点：不带`sftp`功能  

带简易`sftp`（支持上传下载）功能的：<https://github.com/Jrohy/webssh>
  - 缺点：不带私钥登录功能

### 其他可用示例
CMLiu：<https://ssh.090227.xyz>
DCI云：<https://webssh.duckyci.com>
AC云：<https://webssh.anyfastcloud.com/>

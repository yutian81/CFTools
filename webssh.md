## 自行部署web端SSH服务

## 项目一

### 部署容器
[northflank](https://app.northflank.com)

### 部署教程
<https://zelikk.blogspot.com/2023/10/huashengdun-webssh-codesandbox.html>  

- fork项目，[点击打开](https://github.com/crazypeace/huashengdun-webssh)
- 进入[northflank](https://app.northflank.com)官网，创建一个项目，再新建一个服务
- 类型：`service`；名称：随便填，自己知道就行
- 选择自己在github中fork的项目
- 构建类型：`dockerfile`
- 在`dockerfile`最后一行添加命令：`CMD ["python", "run.py", "--xsrf=False --xheaders=False --origin='*' --debug --delay=6"]`
- 点击`updata dockerfile`
- 端口设置为`8888`，协议选`http`，公开端口`打勾`，端口名称：随便填，自己知道就行
- 资源：选择免费的最大资源，实例编号：选`1`
- 点击`creat service`，等待搭建完成
- 可选绑定自定义域名

### 部署示例
<https://ssh.yzong.us.kg>  

### 优缺点
- 支持sshlink一键登录
- 支持交互式密码和私钥登录
- 不带`sftp`功能  

----
## 项目二

### 拉取docker镜像部署到 [koyeb](https://app.koyeb.com)
- git项目：<https://github.com/Jrohy/webssh>

### 部署过程

- 点击创建服务，选择docker镜像方式
- 填入镜像地址`jrohy/webssh:latest`, 点击下一步
- 设置环境变量
```
GIN_MODE=release
TZ=Asia/Shanghai
savePass=true
```
- 设置端口：`5032`
- 点击部署，等待完成
- koyeb免费版不支持自定义域名，可以通过cf搭建反代或cname来自定义域

### 优缺点
- 支持`sftp`（支持上传下载）功能
- 不支持交互式密码和私钥登录功能

### 其他可用示例
CMLiu：<https://ssh.090227.xyz>  
DCI云：<https://webssh.duckyci.com>  
AC云：<https://webssh.anyfastcloud.com/>  
electerm-web：<https://electerm-demo.html5beta.com/>

# goindex
Google Drive Directory Index  
项目地址：https://github.com/yanzai/goindex  

## 功能：
部署在 CloudFlare Workers的小程序。  
可以将 Google Drive 文件以目录形式列出，并直连下载。  
流量走 CloudFlare ，网速由 CloudFlare 决定。

## Demo
[https://index.gd.workers.dev/](https://index.gd.workers.dev/)  

## 安装运行

1、访问[https://install.gd.workers.dev/](https://install.gd.workers.dev/)  
2、授权认证后，生成部署代码。  
3、复制代码 到 CloudFlare 部署。  

## 手动部署
打开 Google 云端硬盘 API  
创建 OAuth 客户端 ID  
本地安装rclone软件，使用 rclone 获取 refresh_token   
  - 按照https://rclone.org/drive/绑定驱动器
  - 执行命令 rclone config file 查找文件 rclone.conf 路径
  - 打开 rclone.conf ，找到配置 root_folder_id 和 refresh_token
在`index.js`中填写`client_id`、`client_secret`、`refresh_token`、`root_folder_id`     
将代码部署到 Cloudflare Workers  

## 修改版
项目地址：https://github.com/Aicirou/goindex-theme-acrou  
`index2.js`：在 原版`goindex`基础上添加了多盘支持、搜索、分页加载等功能  

## 另一个修改版
项目地址：https://github.com/maple3142/GDIndex  
`index3.js`
  -   查看图片不用另开新窗口
  -   视频播放器支持字幕(目前只支持 srt)
  -   支持在线阅读 PDF, EPUB
  -   不支持目录加密(.password)
  -   支持 Http Basic Auth
  -   无需修改程序，即可接入多个云端硬盘(个人、团队)
可以使用服务账户
  - 创建一个服务帐户，一个相应的服务帐户密钥，然后从[Google Cloud Platform控制台]获取JSON（https://cloud.google.com/iam/docs/creating-managing-service-account-keys）
  - 在props对象中，将`service_account_json`值替换为服务帐户JSON文件的内容，并将`service_account`设置为`true`。
  - 确保所涉及的服务帐户有权访问“ root_folder_id”中指定的文件夹
  - 部署


## yx_ips.py功能

1. 从五个公开的网页抓取ip、线路、延迟数据  
    https://cf.090227.xyz  
    https://stock.hostmonit.com/CloudFlareYes  
    https://ip.164746.xyz  
    https://monitor.gacjie.cn/page/cloudflare/ipv4.html  
    https://345673.xyz  

3. 将获取的数据进行筛选、去重，按国家命名，并在仓库内生成`yx.ips.txt`文件

4. 从`yx.ips.txt`文件中提取ip地址，将延迟低于100ms的IP自动更新到cf子域名的dns记录中（先清空再更新，不影响根域名）

6. 配置`github actions`脚本`yx_ips.yml`实现每12小时更新一次`yx_ips.txt`文件

## FDIP-cesu.sh功能

1. 从`白嫖哥的反代ip库`下载数据包 [下载地址](https://zip.baipiao.eu.org/)

2. 对ip库进行删选，只保留`45102-1-443.txt`和`31898-1-443.txt`

3. 合并、去重，对合并后的IP进行归属地查询，只保留归属为`新加坡`的IP地址

4. 对筛选出的新加坡反代IP进行测速，测速工具为`CloudflareST`

6. 保留下载速度高于`6mb/s`的ip，写入到`sgcs.txt`文件中

7. 配置`github actions`每6小时自动运行一次

## sgfd_ips.py功能

1. 从<https://raw.githubusercontent.com/ymyuuu/IPDB/main/bestproxy.txt>获取ip地址，[项目地址](https://github.com/ymyuuu/IPDB)

2. 筛选其中归属地为`SG`的ip，并按照`IP#SG`的格式写入`sgfd_ips.txt`文件中

3. 将上述测速过的`sgcs.txt`文件中的IP地址按照`IP#SG`的格式合并到`sgfd_ips.txt`文件中

4. 将获取到的IP地址更新到cf的子域名dns记录中（先清空再更新，不影响根域名）

5. 配置`github actions`脚本`sgfd_ips.yml`实现每6小时更新一次`sgfd_ips.txt`文件

## Github Actions的部署方式

### 首先添加环境变量
> 需要脚本中代码支持才能生效

- 依次点击`Settings`-->`Secrets and variables`-->`Secrets and variables`-->`Actions`，添加以下环境变量
  - `CF_API_EMAIL` = 你的cf邮箱用户名
  - `CF_API_KEY` = 你的cf API，不能使用全局API，新建一个具有dns读写权限的API。如何新建请自行谷歌
  - `CF_ZONE_ID` = 你域名的区域ID，在你的cf域名主页右下角可以找到
  - `CF_DOMAIN_NAME` = 你需要更新dns的子域名，如`cdn.yutian.xyz`

- 依次点击`Settings`-->`Actions`-->`General`，找到`Workflow permissions`，选择`Read and write permissions`可读写权限

### 修改自动运行频率

- 打开`.github/workflows/`文件夹中的`yml`文件

- 修改第5行`- cron: '0 0/12 * * *' # 每12小时运行一次`中的参数

## 其他说明

可以添加同类型的其他网页抓取更多数据，自行在`py`文件的`urls`参数中添加，  

但是必须注意：*网页内容必须是可以直接获取ip数据的直链API地址，如果不是，需要解析网页数据结构，请自行修改代码。*

**将你已更新DNS的域名设置到cm大佬的的edge项目中的`ADD`变量，享受大佬们的成果吧**

[CM项目地址](https://github.com/cmliu/edgetunnel)  

[CM订阅器地址](https://github.com/cmliu/WorkerVless2sub)  

[测速工具CloudflareST](https://github.com/XIU2/CloudflareSpeedTest)


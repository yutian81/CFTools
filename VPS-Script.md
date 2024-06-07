# VPS常用命令与脚本

## 系统相关
**非 root 的机器上获取 root 用户权限:** `sudo -i`  

**系统重启:** `reboot`  

**查看 VPS 的 IP 与网络信息:** `ip a`  

### 修改为默认 root 用户登录
```
echo "root:811118abcd" | sudo chpasswd root && sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/g' /etc/ssh/sshd_config && sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/g' /etc/ssh/sshd_config && sudo service ssh restart && sudo reboot && echo "Password changed successfully and SSH configuration updated. Restarting Server…" || echo "Failed to change password or update SSH configuration"
```
### 系统更新与安装依赖包
- **debian 和 ubuntu 系统：** `apt update -y && apt install -y curl`
- **alpine 系统：** `apk add curl && apk add bash && apk add sudo`
- **Fedora：** `dnf install -y curl wget`
- **CentOS/Rocky/Almalinux/Oracle-linux/Amazon-linux：** `yum install -y curl wget`

### 添加 swap 交换分区
```
curl -L https://raw.githubusercontent.com/spiritLHLS/addswap/main/addswap.sh -o addswap.sh && chmod +x addswap.sh && bash addswap.sh
```
### BBR 加速四合一魔改版
```
wget -N --no-check-certificate "https://raw.githubusercontent.com/chiakge/Linux-NetSpeed/master/tcp.sh" && chmod +x tcp.sh && ./tcp.sh
```

## 防火墙相关
> debian 和 ubuntu 系统，其他系统不知道

**安装防火墙:** `apt-get install firewalld -y && firewall-cmd --zone=public --add-port=22/tcp --permanent && firewall-cmd --reload`  

**开放指定端口:** `firewall-cmd --zone=public --add-port=端口/tcp --permanent && firewall-cmd --reload`  

**停止防火墙:** `systemctl stop firewalld`  

**禁用防火墙:** `systemctl disable firewalld`  

**防火墙端口放行:** `ufw allow 端口号`  

## 搭建节点
### 申请 CF 的 acme 证书
**Misaka15 年证书脚本**
> 15 年证书，先到 cf 绑定域名并申请源服务器证书
```
wget -N --no-check-certificate https://raw.githubusercontent.com/Misaka-blog/acme-script/main/acme.sh && bash acme.sh
```
**甬哥证书申请脚本**
```
bash <(curl -Ls https://gitlab.com/rwkgyg/acme-script/raw/main/acme.sh)
```
### x-ui 面板
**FranzKafkaYu 版**
```
bash <(curl -Ls https://raw.githubusercontent.com/FranzKafkaYu/x-ui/master/install.sh)
```
**sing-web 版**
```
bash <(wget -qO- https://raw.githubusercontent.com/sing-web/x-ui/main/install_CN.sh)
```
**甬哥版**
```
bash <(curl -Ls https://raw.githubusercontent.com/yonggekkk/x-ui-yg/main/install.sh)
```
**Misaka 的 3x-ui**
```
bash <(curl -Ls https://raw.githubusercontent.com/Misaka-blog/3x-ui/master/install.sh)
```
**alpine 专用版x-ui**
```
apk add curl && apk add bash && bash <(curl -Ls https://raw.githubusercontent.com/Lynn-Becky/Alpine-x-ui/main/alpine-xui.sh)
```
### HY2脚本
**debian 和 ubuntu 系统 hy2**
> V4机器先装 HY2 脚本；V6机器先装warp脚本
```
wget -N --no-check-certificate https://raw.githubusercontent.com/Misaka-blog/hysteria-install/main/hy2/hysteria.sh && bash hysteria.sh
```
**甬哥 Sing-box-hy2 全家桶**
```
bash <(curl -Ls https://gitlab.com/rwkgyg/sing-box-yg/raw/main/sb.sh)
```
或
```
bash <(wget -qO- https://gitlab.com/rwkgyg/sing-box-yg/raw/main/sb.sh 2> /dev/null)
```
**mack-a xray-hy2 全家桶**
```
wget -P /root -N --no-check-certificate "https://raw.githubusercontent.com/mack-a/v2ray-agent/master/install.sh" && chmod 700 /root/install.sh && /root/install.sh
```
备用镜像
```
wget -P /root -N --no-check-certificate "https://www.v2ray-agent.com/v2ray-agent/install.sh" && chmod 700 /root/install.sh && /root/install.sh
```
**alpine 专用版hy2**
```
wget -O hy2.sh https://raw.githubusercontent.com/zrlhk/alpine-hysteria2/main/hy2.sh && sh hy2.sh
```
### argo 类脚本
> 不能与 X-UI 面板共存

**ArgoX 脚本（fscarmen）**
```
bash <(wget -qO- https://raw.githubusercontent.com/fscarmen/argox/main/argox.sh)
```
**梭哈脚本（白嫖哥）**
```
curl [https://www.baipiao.eu.org/suoha.sh](https://www.baipiao.eu.org/suoha.sh) -o suoha.sh && bash suoha.sh
```
**全能脚本**
```
curl -fsSL https://raw.githubusercontent.com/eooce/ssh_tool/main/ssh_tool.sh -o ssh_tool.sh && chmod +x ssh_tool.sh && ./ssh_tool.sh
```
### WARP 脚本
**fscarmen 版 warp**
```
wget -N https://gitlab.com/fscarmen/warp/-/raw/main/menu.sh && bash menu.sh[option] [lisence/url/token]
```
  > 再次运行: `warp [option] [lisence]`

**fscarmen 版 warp-go**
```
wget -N https://gitlab.com/fscarmen/warp/-/raw/main/warp-go.sh && bash warp-go.sh [option] [lisence]
```
  > 再次运行: `warp-go [option] [lisence]`

**甬哥版多功能 warp**
```
bash <(wget -qO- https://gitlab.com/rwkgyg/CFwarp/raw/main/CFwarp.sh 2> /dev/null)
```
**甬哥多平台优选 WARP 对端 IP + 无限生成 WARP-Wireguard 配置 手机版**
```
curl -sSL https://gitlab.com/rwkgyg/CFwarp/raw/main/point/endip.sh -o endip.sh && chmod +x endip.sh && bash endip.sh
```
**CMliu warp 优选 IP 并生成 clash 配置文件**
```
wget -N -P Warp2Clash https://raw.githubusercontent.com/cmliu/Warp2Clash/main/W2C_start.sh && cd Warp2Clash && chmod +x W2C_start.sh
```
### 其他脚本
**alpine专用xrayr**
> alpine  Xrayr重启命令：/etc/init.d/XrayR restart  或者 rc-service XrayR restart
```
wget https://github.com/Cd1s/alpineXrayR/releases/download/one-click/install-xrayr.sh && chmod +x install-xrayr.sh && bash install-xrayr.sh
```

## 安装 docker
```
curl -sSL https://get.docker.com/ | sh
systemctl start docker
systemctl enable docker
```

## 安装面板
### 科技蓝系统优化与建站
**github 官方源**
```
curl -sS -O https://raw.githubusercontent.com/kejilion/sh/main/kejilion.sh && chmod +x kejilion.sh && ./kejilion.sh
```
**国内加速源**
```
curl -sS -O https://raw.gitmirror.com/kejilion/sh/main/cn/kejilion.sh && chmod +x kejilion.sh && ./kejilion.sh
```
### vps一键脚本工具 
> 主要用于系统优化  
> 支持列表：Debian Ubuntu CentOS Alpine Fedora Rocky-linux Amazom-linux Oracle-linux 
```
curl -fsSL https://raw.githubusercontent.com/eooce/ssh_tool/main/ssh_tool.sh -o ssh_tool.sh && chmod +x ssh_tool.sh && ./ssh_tool.sh
```
或  
```
wget -qO ssh_tool.sh https://raw.githubusercontent.com/eooce/ssh_tool/main/ssh_tool.sh && chmod +x ssh_tool.sh && ./ssh_tool.sh
```
### 宝塔面板：主要用于建站
**乌班图系统**
```
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
```
**debian 系统**
```
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && bash install.sh ed8484bec
```
**万能版**
```
if [ -f /usr/bin/curl ];then curl -sSO https://download.bt.cn/install/install_panel.sh;else wget -O install_panel.sh https://download.bt.cn/install/install_panel.sh;fi;bash install_panel.sh ed8484bec
```
### 1panel 面板：主要用于建站
```
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh
```
### 哪吒探针：用于监控 VPS 的状态  
> 教程：[安装 Dashboard | 哪吒监控](https://nezha.wiki/guide/dashboard.html)

**github 官方源**
```
curl -L https://raw.githubusercontent.com/naiba/nezha/master/script/install.sh -o nezha.sh && chmod +x nezha.sh && sudo ./nezha.sh
```
**国内加速源**
```
curl -L https://gitee.com/naibahq/nezha/raw/master/script/install.sh -o nezha.sh && chmod +x nezha.sh && sudo CN=true ./nezha.sh
```

## 系统换源
### debian9 系统
```
wget -O /etc/apt/sources.list https://static.lty.fun/%E5%85%B6%E4%BB%96%E8%B5%84%E6%BA%90/SourcesList/Debian-9-archive.list
```
### LXC 乌班图 20 系统
```
cat > /etc/apt/sources.list <<EOF
deb http://mirrors.163.com/ubuntu/ focal main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ focal-security main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ focal-updates main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ focal-proposed main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ focal-backports main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ focal main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ focal-security main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ focal-updates main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ focal-proposed main restricted universe multiverse
deb-src http://mirrors.163.com/ubuntu/ focal-backports main restricted universe multiverse
EOF
```

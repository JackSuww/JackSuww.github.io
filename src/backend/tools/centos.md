---
title: CentOS
date: 2024-03-11
author: JackSu
categories:
  - 工具
tags:
  - CentOS
---

## 防火墙

- 查看防火墙的状态。

```sh
systemctl status firewalld
```

- 查看防火墙开放的端口列表。

```sh
firewall-cmd --list-port
```

- 开启防火墙。

```sh
systemctl start firewalld
```

- 关闭防火墙。

```sh
systemctl stop firewalld
```

- 开放端口。

```sh
firewall-cmd --zone=public --add-port=3306/tcp --permanent
```

- 关闭端口。

```sh
firewall-cmd --permanent --remove-port=3306/tcp
```

- 重启防火墙（更新配置）。

```sh
firewall-cmd --reload
```

## 显存

- 查看显存信息

```sh
watch -n 1 nvidia-smi
```

## 问题汇总

1. `ssh` 连接远程服务器时报错 `Permission denied (publickey,gssapi-keyex,gssapi-with-mic)`

```sh
vim /etc/ssh/sshd_config
# 将配置文件中 PasswordAuthentication 的值改为 yes
PasswordAuthentication yes
```

2. 关闭`CentOS`系统提示音。

```sh
vim /etc/inputrc
# 修改配置文件以下内容。bell-style 的取值范围是:none, visible, audible
set bell-style none
# 重新启动服务器
reboot
```

3. 关闭 `vim`编辑器提示音。

```sh
vim /etc/vimrc
# 添加以下配置
set vb t_vb=
```

4. 重启网络后，IP 转发被禁用。

```sh
vi /etc/sysctl.conf
# 添加如下代码
net.ipv4.ip_forward=1
# 重启 network 服务
systemctl restart network
```

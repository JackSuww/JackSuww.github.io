---
title: VuePress + GitHub Pages 自定义域名
date: 2023-06-18
author: JackSu
categories: 
 - 前端
tags: 
 - VuePress
---

>本文主要介绍为 VuePress + GitHub Pages + GitHub Actions 搭建的网站添加自定义域名的详细步骤。
>
>前提：站点已经使用 VuePress + GitHub Pages + GibHub Actions 搭建并正常运行。
>


## 域名

### 申请

首先我们需要拥有一个域名，登录[万网](https://wanwang.aliyun.com/domain/)选择域名后进行购买，填写相关信息，并等待审核。审核通过之后，在域名列表页（右上角控制台->控制台首页->域名->域名列表页）就可以看见已购买的域名了。

![image-20230617144639816.png](https://s2.loli.net/2023/06/17/BzKhbJSynRd32Ev.png)

![image-20230617145052448.png](https://s2.loli.net/2023/06/17/FZHrgbIC8wA4PqG.png)

### 配置

域名首次申请成功后，需要为域名配置 DNS 解析信息，用来路由到 GitHub Pages 的服务器地址。

1. 在终端窗口执行如下命令，查看当前网站的域名（GitHub Pages 中的域名）对应的 IP 地址，并复制到剪贴板，用于下一步配置 DNS 解析记录使用。

~~~sh
ping JackSu-99.github.io
~~~

2. 进入到域名解析页面（域名列表页->解析），为域名添加 DNS 解析记录。

  我们需要为域名配置两个 DNS 解析记录。配置信息如下表所示（注意替换相关信息）。配置完成后，需要等待几分钟来让 DNS 记录生效。域名 DNS 记录生效后，下一步需要将域名配置到 GitHub Pages 中。

| 记录类型 | 主机记录 | 解析请求来源 | 记录值                            | TTL            |
| -------- | -------- | ------------ | --------------------------------- | -------------- |
| CNAME    | www      | 默认         | 网站域名（JackSu-99.github.io） | 10分钟（默认） |
| A        | @        | 默认         | 上一步获取的 IP 地址              | 10分钟（默认） |

![image-20230617160144514.png](https://s2.loli.net/2023/06/17/SdsHzFactYLOXpq.png)

## GitHub Pages 设置

进入到 GitHub pages 页面（仓库-> Settings -> Pages），在 Custom domain 中填写域名并保存。等待 DNS 检查，检查通过后，即可通过新域名访问网站。

![image-20230617162910158.png](https://s2.loli.net/2023/06/17/Fka16xMycBwVieg.png)


## GitHub Actions 配置

每次更新代码，通过 GitHub Actions 自动部署后，Pages 中到自定义域名会重置，因此需要同时修改 workflow 配置文件。

在 workflow 配置文件中，新增自定义域名配置。配置信息如下所示（仅贴出与 GitHub Pages 有关的代码，完整代码可以查看该文章：[使用 VuePress + GitHub Pages + GitHub Actions 搭建个人博客](https://juejin.cn/post/7239536753971724344#heading-9)）

~~~yaml
# 部署到 GitHub Pages
    - name: Deploy
      uses: crazy-max/ghaction-github-pages@v2
      env:
        GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
      with:
        target-branch: gh-pages # 部署到 gh-pages 分支，因为 main 分支存放的一般是源码，而 gh-pages 分支则用来存放生成的静态文件
        build_dir: docs/.vuepress/dist # vuepress 生成的静态文件存放的地方
        fqdn: JackSu.love  # 自定义域名
~~~

## 问题

1. 为什么需要添加两个 DNS 解析记录？

   GitHub Pages 要求同时添加两个解析记录，确保自定义域名能够解析到 GitHub Pages 的服务器上，否则 DNS check 时会出错。

   以域名 JackSu.love 为例，因为 JackSu.love（根域名） 和 www.JackSu.love（子域名）会被视为两个不同的域名，CNAME 记录用于将子域名指向 GitHub Pages 服务器，A 记录用于将根域名指向 GitHub Pages 的服务器。

| 记录类型   | 含义                                                         |
| ---------- | ------------------------------------------------------------ |
| A 记录     | 将域名指向一个 IPV4 地址（映射 Web 服务器地址）              |
| CNAME 记录 | 将域名指向另外一个域名（CDN）                                |
| AAAA 记录  | 将域名指向一个 IPV6 地址（类似于 A 记录）                    |
| NS 记录    | 将子域名指定其他 DNS 服务器解析（解析特定域名的权威 DNS 服务器） |
| MX 记录    | 将域名指向邮件服务器地址（邮件路由）                         |
| SRV 记录   | 记录提供特定的服务的服务器（标识 VoIP(Voice over IP)服务、XMPP(Extensible Messaging and Presence Protocol)服务等） |
| TXT 记录   | 存储任意文本信息（域名验证、配置 SPF(Sender Policy Framework)、DKIM(DomainKeys Identified Mail)） |
| PTR 记录   | 用于反向 DNS 查找（将 IP 地址解析为域名，用于确定特定 IP 地址所对应的域名） |
| SOA 记录   | 指定域名的主要配置信息。包括域名的权威服务器、刷新时间、重试时间等。 |

2. 域名需要备案吗？

   不需要备案，因为 GitHub Pages 的服务器在国外。如果网站是部署在国内的服务器上（国内的服务器需要备案），可以在相应的云服务器厂商处进行备案。



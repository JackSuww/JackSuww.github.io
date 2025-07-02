---
title: 使用 Dockerfile + Docker Compose 部署 Web 项目
date: 2024-06-06
author: JackSu
categories:
  - 工具
tags:
  - Docker
---

> 本文主要介绍使用 Dockerfile + Docker Compose 部署完整 Web 项目（包括数据库、后端和前端）的详细步骤。
>
> 项目是前后端分离的，后端使用 SpringBoot2.7.5 + JDK17 + MySQL 8；前端使用 Vue + webpack。服务器是跑在 WSL2 上的 Ubuntu 20.04.5

## 服务器目录结构

```
—— root
  |—— mall  // 根目录
      |—— pack
          |—— back // 后端
              |-- Dockerfile // 构建镜像的文本文件
              |-- core-0.0.1-SNAPSHOT.jar
              |-- deploy.sh     // 用来将 jar 包复制到服务器上的脚本文件
              |-- docker-compose.yaml       // 启动容器
          |—— web // 前端
              |-- Dockerfile
              |-- dist
              |-- deploy.sh     // 用来将 dist 文件夹复制到服务器上的脚本文件
              |-- docker-compose.yaml       // 启动容器
              |-- nginx.conf    // nginx 配置文件
          |—— jdk // jdk 环境
              |-- Dockerfile    // 用来构建 JDK 镜像
              |-- jdk-17.0.5_linux-x64_bin.tar.gz   // JDK
              |-- jdk-17.0.5    // jdk-17.0.5_linux-x64_bin.tar.gz 解压后的文件夹
      |—— mysql // 数据库(以下三个目录，启动 MySQL 容器时自动创建)
          |-- conf
          |-- data
          |-- logs
```

## 数据库

### 拉取 MySQL 镜像

**注意：**  MySQL 版本需与项目中使用的版本相对应

```sh
docker pull mysql:8.0.28
```

### 启动 MySQL 容器

切换到 **mysql** 目录下，执行以下命令，启动容器。执行成功后会在当前目录下创建 **conf**、**data**、**logs** 三个文件夹

```sh
docker run -p 3306:3306 --name mysql \
--restart=always \
--privileged=true \
-v $PWD/conf/:/etc/mysql/conf.d \
-v $PWD/logs:/logs \
-v $PWD/data:/var/lib/mysql \
-e TZ=Asia/Shanghai \
-e MYSQL_ROOT_PASSWORD=123456 \
-d mysql:8.0.28
```

如果需要对 MySQL 进行详细配置，可以在 **conf** 目录下添加 my.cnf 配置文件，然后重新启动容器（命令如下）

```sh
docker restat mysql(容器id)
```

my.cnf 配置文件

```ini
[client]
port = 3306
[mysqld]
# Mysql服务的唯一编号 每个mysql服务Id需唯一
server-id = 1
​
# 服务端口号 默认3306
port = 3306
​
# mysql安装根目录
basedir = /usr/local/mysql
​
# mysql数据文件所在位置
datadir = /usr/local/mysql/data
​
secure-file-priv= /var/lib/mysql
​
# 允许访问的IP网段
bind-address = 0.0.0.0
​
# 只能用IP地址检查客户端的登录，不用主机名
skip_name_resolve = 1
​
# 数据库默认字符集,主流字符集支持一些特殊表情符号（特殊表情符占用4个字节）
character-set-server = utf8mb4
​
# 数据库字符集对应一些排序等规则，注意要和character-set-server对应
collation-server = utf8mb4_general_ci
​
# 设置client连接mysql时的字符集,防止乱码
init_connect='SET NAMES utf8mb4'
​
# 是否对sql语句大小写敏感，1表示不敏感
lower_case_table_names = 1
​
# 最大连接数
max_connections = 400
​
# 最大错误连接数
max_connect_errors = 1000
​
# TIMESTAMP如果没有显示声明NOT NULL，允许NULL值
explicit_defaults_for_timestamp = true
​
# SQL数据包发送的大小，如果有BLOB对象建议修改成1G
max_allowed_packet = 128M
​
​
# MySQL连接闲置超过一定时间后(单位：秒)将会被强行关闭
# MySQL默认的wait_timeout  值为8个小时, interactive_timeout参数需要同时配置才能生效
interactive_timeout = 1800
wait_timeout = 1800
​
# 内部内存临时表的最大值，设置成128M。
# 比如大数据量的group by,order by时可能用到临时表，
# 超过了这个值将写入磁盘，系统IO压力增大
tmp_table_size = 134217728
max_heap_table_size = 134217728
​
# 慢查询sql日志设置
slow_query_log = 1
slow_query_log_file = slow.log
​
# 检查未使用到索引的sql
log_queries_not_using_indexes = 1
​
# 针对log_queries_not_using_indexes开启后，记录慢sql的频次、每分钟记录的条数
log_throttle_queries_not_using_indexes = 5
​
# 慢查询执行的秒数，必须达到此值可被记录
long_query_time = 8
​
# 检索的行数必须达到此值才可被记为慢查询
min_examined_row_limit = 100
​
# mysql binlog日志文件保存的过期时间，过期后自动删除
binlog_expire_logs_seconds = 604800
```

至此，数据库部署完成。之后可以使用 Navicat 连接数据库将本地数据库中的数据同步过来。

## 制作 JDK17 镜像

### 下载 JDK

项目使用的 JDK 版本为 17.0.5。[下载](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)对应的版本，上传到 **jdk** 目录下，并解压。 ![image-20230128185346114.png](https://s2.loli.net/2023/02/03/tAVzlEXg9DHF71u.png)

### 编写 Dockerfile 文件

```Dockerfile
# 基础镜像
FROM ubuntu:20.04
# 更新软件源
RUN apt-get update
# 安装字体支持
RUN apt-get install -y fontconfig
# 清理缓存
RUN apt-get clean
# 添加JDK17，并解压在/usr/local/jdk
COPY ./jdk-17.0.5 /usr/local/jdk
# 配置jdk17 环境变量
ENV JAVA_HOME /usr/local/jdk
ENV PATH=$JAVA_HOME/bin:$PATH
# 设置系统编码
ENV LANG C.UTF-8
```

### 构建 JDK 镜像

在当前目录（**jdk**）下执行如下命令

```sh
docker build -t jdk_17.0.5 .
```

至此，JDK 环境镜像构建完成。

## 后端

使用 Maven 将项目打成 jar 包，并上传到服务器  **back**  目录下。**注意修改项目的数据库配置。**

### 编写 Dockerfile 文件

```Dockerfile
# 基础镜像（上面我们构建的JDK镜像）
FROM jdk_17.0.5
# 添加springboot jar 包 指定别名为 core.jar
ADD core-0.0.1-SNAPSHOT.jar core.jar
​
EXPOSE 9998
​
# 启动容器时运行jar包
ENTRYPOINT ["java","-jar","-Duser.timezone=GMT+8","/core.jar"]
```

### 启动容器

使用 Docker Compose 构建镜像和启动容器

1.  编写 docker-compose.yaml 文件

```yaml
version: '3.3'
services: # 可以指定多个服务
    mall: # 这个名字随便起 只要有意义
      build:
        context: ./   # Dockerfile 文件位置
      restart: always # 自动开机启动
      image: mall:latest  # 镜像名称
      container_name: mall # 容器名称
      networks:
         - mall-network
      ports: # 指定端口 可以是多个
         - 9998:9998
networks:
  mall-network:
```

2.  启动容器

```sh
docker-compose up -d --build  // 根据Dockerfile的最新内容来构建镜像并启动容器
```

3.  验证

```sh
docker ps // 查看启动的容器列表
docker logs -f mall(容器id)  // 查看日志
```

至此后端部署完成。之后更新服务只需要把 jar 包上传到  **back** 目录下，执行`docker-compose up -d --build`命令即可

## 前端

### 项目打包

执行如下命令，生成 **dist** 文件夹，并上传到服务器  **web** 目录下。**注意修改请求的后端地址。**

```sh
npm run build  
```

### 编写 nginx.conf 配置文件

前端项目部署到 Nginx 上，需要对 Nginx 进行配置

```conf
worker_processes auto;
​
events {
    worker_connections  1024;
}
​
http {
    include       mime.types;
    default_type  application/octet-stream;
​
    sendfile        on;
    #tcp_nopush     on;
​
    #keepalive_timeout  0;
    keepalive_timeout  65;
​
    #gzip  on;
​
    client_max_body_size   20m;
    server {
        listen       9527;
        location / {
          root   /usr/share/nginx/html;
          index  index.html index.htm;
          try_files $uri $uri/ /index.html;
        }
        location /api {
          proxy_pass http://192.168.107.65:9998;
          rewrite "^/api/(.*)$" /$1 break;
        }
        #error_page  404              /404.html;
​
        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

### 编写 Dockerfile 文件

```Dockerfile
# 设置基础镜像
FROM nginx
# 将 dist 文件中的内容复制到 /usr/share/nginx/html/ 这个目录下面
COPY dist/  /usr/share/nginx/html/
RUN rm /etc/nginx/nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN echo 'echo init ok!!'
```

### 启动容器

使用 Docker Compose 构建镜像和启动容器

1.  编写 docker-compose.yaml 文件

```yaml
version: '3.3'
services: # 可以指定多个服务
    mall-web: #这个名字随便起 只要有意义
      build:
        context: ./
      restart: always # 自动开机启动
      image: mall-web:latest # 基于哪个镜像
      container_name: mall-web #容器名称
      privileged: true
      networks:
         - mall-web-network
      ports: # 指定端口 可以是多个
         - 9527:9527
networks:
  mall-web-network:
```

2.  启动服务

```sh
docker-compose up -d --build
```

3.  验证

```sh
docker ps // 查看启动的容器列表
docker logs -f mall-web(容器id)  // 查看日志
```

至此，前端部署完成，可以通过浏览器进行访问来验证功能。

## 问题

1、每次重启电脑或者 WSL2 后，WSL2 子系统的 IP 地址就会发生改变

- 解决方法：[WSL2 固定 IP 地址](https://blog.csdn.net/manbu_cy/article/details/108476859)

附：我自己的 bat 脚本（管理员身份运行）

```bat
@echo off
setlocal enabledelayedexpansion
​
::先停掉可能在跑的wsl实例
wsl --shutdown ubuntu
::重新拉起来，并且用root的身份，启动docker服务
wsl -u root service docker start
if !errorlevel! equ 0 (
    echo docker start success
    :: 看看我要的IP在不在
    wsl -u root ip addr | findstr "192.168.107.65" > nul
    if !errorlevel! equ 0 (
        echo wsl ip has set
    ) else (
        ::不在的话给安排上
        wsl -u root ip addr add 192.168.107.65/24 broadcast 192.168.107.0 dev eth0 label eth0:1
        echo set wsl ip success: 192.168.107.65
    )
​
​
    ::windows作为wsl的宿主，在wsl的固定IP的同一网段也给安排另外一个IP
    ipconfig | findstr "192.168.107.100" > nul
    if !errorlevel! equ 0 (
        echo windows ip has set
    ) else (
        netsh interface ip add address "vEthernet (WSL)" 192.168.107.100 255.255.255.0
        echo set windows ip success: 192.168.107.100
    )
)
pause
```

2、WSL2 固定 IP 地址后，ping 不通外网，Dockerfile 拉取镜像失败

- 解决方法：服务器上执行下面的命令。[参考文章](https://blog.csdn.net/weixin_43577131/article/details/119279749)

```sh
sudo rm /etc/resolv.conf
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "[network]" > /etc/wsl.conf'
sudo bash -c 'echo "generateResolvConf = false" >> /etc/wsl.conf'
```

---
title: 分布式存储系统——Ceph 部署使用
date: 2023-12-25
author: JackSu
star: true
categories:
  - Python
tags:
  - Ceph
---

> 最近工作中接触了一个 Python + Flask 的新项目，项目中使用了 Ceph 对象存储服务。遂在开发环境使用 Docker 搭建了一套 Ceph 集群。
>
> [Ceph 官方文档](https://docs.ceph.com/en/reef/start/intro/)

## Ceph 介绍

Ceph 是一个开源的分布式存储系统，提供了对象存储、块存储和文件系统三种存储接口。Ceph 将数据存储在逻辑存储池中，使用 CRUSH 分布式算法决定如何将数据分散存储在集群的各个节点上，以实现高可用性和数据冗余。本文介绍如何使用 Ceph 的对象存储功能。

搭建 Ceph 集群至少要包括一个 MON（Monitor） 节点、一个 MGR（Manager） 节点和多个 OSD（Object Storage Daemon）节点，OSD 节点数量由你要保存的数据副本数量决定，比如你要将数据集存储三份，就需要部署至少三个 OSD 节点。

- OSD（Object Storage Daemon）：负责管理磁盘上的数据块（数据存储、数据复制和数据恢复等），执行数据的读写操作。**确保集群的高可用性，通常至少要部署三个节点。**

- MON（Monitor）：负责维护 Ceph 集群的状态信息、配置信息和映射信息，确保集群元数据的一致性，协调集群节点间数据的分布和恢复。**确保集群的高可用性，通常至少要部署三个节点。**

- MDS（Metadata Server）：负责管理文件系统的目录结构、文件和目录的元数据信息，为 CephFS（Ceph 的分布式文件系统）提供元数据服务。**块存储和对象存储不需要部署 MDS**。

- MGR（Manager）：负责收集 Ceph 集群的状态信息（OSD、MON、MDS 的性能指标、健康状况等），并提供了可视化的仪表板（Ceph Dashboard）方便用户查看。**确保集群的高可用性，通常至少要部署两个节点。**

- RGW（Rados Gateway）：提供了 RESTful API，允许用户发送 HTTP/HTTPS 请求访问和管理存储在 Ceph 集群中的数据，支持 Amazon S3 API 和 OpenStack Swift API。

![ceph-rgw.png](https://s2.loli.net/2023/12/22/hHDbRsEJ6YyXuUr.png)

## Ceph 集群搭建

### 部署环境

三台网络互通的 CentOS 虚拟机。

| 主机名称   | 主机 IP    | 说明               |
| ---------- | ---------- | ------------------ |
| ceph-admin | 10.0.28.10 | osd、mon、mgr、rgw |
| ceph-1     | 10.0.28.11 | osd、mon           |
| ceph-2     | 10.0.28.12 | osd、mon           |

### 拉取镜像

[DockerHub 镜像地址](https://hub.docker.com/r/ceph/daemon/tags)

```sh
# 拉取镜像
docker pull ceph/daemon:master-7ef46af-nautilus-centos-7-x86_64
# 更改镜像tag
docker image tag ceph/daemon:master-7ef46af-nautilus-centos-7-x86_64 ceph/daemon:latest
```

### 启动 mon 容器

登陆到第一台服务器（ceph-admin）。

1.  创建挂载目录，并赋予权限。

```sh
sudo mkdir -p "/root/ceph/etc"
sudo mkdir -p "/root/ceph/lib"
sudo mkdir -p "/root/ceph/logs"
sudo mkdir -p "/root/ceph/data;
chmod -R 777 /root/ceph
```

2\. 启动容器。

```sh
docker run -d \
   --net=host \
   --name=mon \
   --restart=always \
   --privileged=true \
   -v /root/ceph/etc:/etc/ceph \
   -v /root/ceph/lib:/var/lib/ceph/ \
   -v /root/ceph/logs:/var/log/ceph \
   -e MON_IP=10.0.28.10,10.0.28.11,10.0.28.12 \
   -e CEPH_PUBLIC_NETWORK=10.0.28.0/24 \
   ceph/daemon mon
```

3\. 复制配置文件到另外两台服务器.

```sh
# ceph-2 10.0.28.11
scp -r /root/ceph root@10.0.28.11:/root
​
# ceph-3 10.0.28.12
scp -r /root/ceph root@10.0.28.12:/root
```

4\. 执行上面的容器启动命令，在另外两台服务器上启动 mon 容器。

5\. 查看部署状态。如下图，三个 mon 节点启动成功。

```sh
docker exec mon ceph -s
```

![ceph-01.png](https://s2.loli.net/2023/12/22/1oPi3JfhdeVq9xp.png)

### 启动 osd 容器

1.  执行如下命令，在 mon 节点生成 osd 密钥信息，否则启动 osd 容器会报错。

```sh
docker exec -it mon ceph auth get client.bootstrap-osd -o /var/lib/ceph/bootstrap-osd/ceph.keyring
```

2\. 启动容器。

```sh
docker run -d \
   --net=host \
   --name=osd \
   --restart=always \
   --privileged=true \
   -v /root/ceph/etc:/etc/ceph \
   -v /root/ceph/lib/:/var/lib/ceph/ \
   -v /root/ceph/logs/:/var/log/ceph \
   -v /root/ceph/data/osd:/var/lib/ceph/osd \
   ceph/daemon osd_directory
```

3\. 查看部署状态。如下图，三个 osd 节点启动成功。

![ceph-02.png](https://s2.loli.net/2023/12/22/qPwACd25X7taokF.png)

### 启动 mds 容器

```sh
docker run -d \
    --net=host \
    --name mds \
    --restart=always \
    --privileged=true \
    -v /root/baseService/ceph/etc:/etc/ceph \
    -v /root/baseService/ceph/lib:/var/lib/ceph/ \
    -v /root/baseService/ceph/logs:/var/log/ceph \
    -e CEPHFS_CREATE=0 \
    -e CEPHFS_METADATA_POOL_PG=512 \
    -e CEPHFS_DATA_POOL_PG=512 \
    ceph/daemon mds
# CEPHFS_CREATE 是为METADATA服务生成文件系统， 0表示不自动创建文件系统（默认值）， 1表示自动创建。
# CEPHFS_DATA_POOL_PG是数据池的数量，默认为8。
# CEPHFS_METADATA_POOL_PG是元数据池的数量，默认为8。
```

### 启动 rgw 容器

1.  执行如下命令，在 mon 节点生成 rgw 密钥信息，否则启动 rgw 容器会报错。

```sh
docker exec mon ceph auth get client.bootstrap-rgw -o /var/lib/ceph/bootstrap-rgw/ceph.keyring
```

2\. 启动容器。

```sh
docker run -d \
    --net=host \
    --name rgw \
    --restart=always \
    -p 7480:80 \
    -v /root/ceph/etc:/etc/ceph \
    -v /root/ceph/lib:/var/lib/ceph/ \
    -v /root/ceph/logs:/var/log/ceph \
    ceph/daemon rgw
```

### 启动 mgr 容器

1.  启动容器。

```sh
docker run -d \
    --net=host  \
    --name=mgr \
    --restart=always \
    -v /root/ceph/etc:/etc/ceph \
    -v /root/ceph/lib:/var/lib/ceph \
    -v /root/ceph/logs:/var/log/ceph \
    ceph/daemon mgr
```

2\. 查看部署状态。如下图，至此，Ceph 集群节点全部启动成功。

![ceph-03.png](https://s2.loli.net/2023/12/22/lB1Ok6fN7e8Vq4U.png)

### 安装 Dashboard 管理后台

1.  开启 Dashboard 功能。

```sh
docker exec mgr ceph mgr module enable dashboard
```

2\. 创建证书。

```sh
docker exec mgr ceph dashboard create-self-signed-cert
```

3\. 创建登陆用户名和密码。

```sh
docker exec mgr ceph dashboard set-login-credentials cephAdmin cephPassword
```

4\. 配置外部访问端口。

```sh
docker exec mgr ceph config set mgr mgr/dashboard/server_port 7800
```

5\. 配置外部访问 ip。

```sh
docker exec mgr ceph config set mgr mgr/dashboard/server_addr 10.0.28.10
```

6\. 关闭 HTTPS（如果没有证书或内网使用，可以关闭）。

```sh
docker exec mgr ceph config set mgr mgr/dashboard/ssl false
```

7\. 重启`mgr`服务。

```sh
docker restart mgr
```

8\. 查看 Dashboard 服务信息。

```sh
docker exec mgr ceph mgr services
```

![ceph-04.png](https://s2.loli.net/2023/12/22/jGZ7t8pAevsmcFz.png)

9.  浏览器访问 Dashboard 管理页面。

![ceph-05.png](https://s2.loli.net/2023/12/22/GxjH2tga3cJKUhq.png)

![ceph-06.png](https://s2.loli.net/2023/12/22/zIlArb8mqkxQhVj.png)

## 创建用户 和 bucket

使用 **boto3** 库操作 Ceph 对象存储服务，需要先初始化用户和 bucket。

创建 bucket 参考该篇文章。[使用 s3cmd 创建 bucket](https://blog.csdn.net/m0_52412144/article/details/124705083)

- 查看系统内所有用户。

```sh
docker exec rgw radosgw-admin metadata list user
```

- 创建新用户。

```sh
docker exec rgw radosgw-admin user create --display-name="cephAdmin" --uid=cephAdmin
```

- 查看用户信息。access_key 和 secret_key 在代码中要使用。

```sh
docker exec rgw radosgw-admin user info --uid=cephAdmin
```

- 查看系统内所有 bucket。

```sh
docker exec rgw radosgw-admin metadata list bucket
```

## 问题

- osd 容器启动失败。`error connecting to the cluster`、`does not generate config`。执行如下命令解决。

```sh
docker exec -it mon ceph auth get client.bootstrap-osd -o /var/lib/ceph/bootstrap-osd/ceph.keyring
```

![ceph-07.png](https://s2.loli.net/2023/12/22/xpZrCjDymOgvKlJ.png)

- rgw 容器启动失败。`ERROR- /var/lib/ceph/bootstrap-rgw/ceph.keyring must exist` 执行如下命令解决。

```sh
docker exec mon ceph auth get client.bootstrap-rgw -o /var/lib/ceph/bootstrap-rgw/ceph.keyring
```

![ceph-08.png](https://s2.loli.net/2023/12/22/aJdxhMYjoWmyeX2.png)

- 服务器重启后，mon 节点重启失败。`Existing mon, trying to rejoin cluster`。修改 mon 的启动脚本解决。

![ceph-09.png](https://s2.loli.net/2023/12/25/UlAO1qyk3SbGdn9.png)

1.  将 mon 容器内的启动脚本复制到宿主机中。

```sh
docker cp mon:/opt/ceph-container/bin/start_mon.sh .
```

2\. 修改启动脚本。

```sh
# 找到如下代码，注释掉
v2v1=$(ceph-conf -c /etc/ceph/${CLUSTER}.conf 'mon host' | tr ',' '\n' | grep -c ${MON_IP})
# 替换为如下代码
v2v1=2
```

3\. 将修改后的启动脚本再复制到容器中。

```sh
docker cp start_mon.sh mon:/opt/ceph-container/bin/start_mon.sh
```

4\. 重新启动 mon 容器。

```sh
docker restart mon
```

5\. 容器正常启动，但出现如下错误日志，执行`docker exec mon ceph -s`命令无响应。因为部署了三个 mon 节点，只要再启动其他两个 mon 节点即可恢复正常响应。

![ceph-10.png](https://s2.loli.net/2023/12/25/K1uyRMFx4GePcsn.png)

## 参考文档

1. [radosgw-admin 命令使用](https://blog.csdn.net/yujia_666/article/details/108189421)

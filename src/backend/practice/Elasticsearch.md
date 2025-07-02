---
title: 使用 Docker Compose 部署 Elasticsearch + Kibana
date: 2023-10-06
author: JackSu
categories:
  - 工具
tags:
  - Docker
---

> 本文主要介绍使用 Docker Compse 部署 Elasticsearch + Kibana，并整合到 Spring Boot 项目中的详细步骤。
>
> Elasticsearch + Kibana 版本: 7.17.0（7 的最新版本）；Spring Boot 版本：2.7.5 。
>
> [Kibana 官方文档](https://www.elastic.co/guide/cn/kibana/current/settings.html)、[Elasticsearch 官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/important-settings.html)

## 服务器目录结构

```
—— root
  |—— mall  // 根目录
      |—— pack
          |—— elastic
              |-- config
                  |-- elasticsearch.yml     // Elasticsearch 配置文件
              |-- data  // Elasticsearch 数据目录
              |-- plugins       // Elasticsearch 插件目录
              |-- docker-compose.yaml   // 启动容器
              |-- kibana
                  |-- kibana.yml    kibana 配置文件
```

## 部署 Elasticsearch 和 Kibana

### 启动容器

1.  在 **config** 目录下，编写 elasticsearch.yml 配置文件，内容如下。

```yaml
network.host: 0.0.0.0
discovery.type: single-node
```

2.  在 **kibana** 目录下，编写 kibana.yml 配置文件，内容如下。

```yaml
server.host: 0.0.0.0
server.name: kibana
```

3.  在 **elastic** 目录下，编写 docker-compose.yaml 配置文件，内容如下。

```yaml
version: '3.3'
services:
    elasticsearch:
        restart: always
        image: elasticsearch:7.17.0     # 使用的镜像名称
        container_name: elasticsearch   # 容器名称
        ports:  # 指定暴露的端口
          - 9200:9200
          - 9300:9300
        environment:
          - ES_JAVA_OPTS= -Xms2g -Xmx2g # 指定 JVM 内存大小
        volumes:    # 指定挂载目录
          - ~/mall/pack/elastic/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml
          - ~/mall/pack/elastic/data:/usr/share/elasticsearch/data
          - ~/mall/pack/elastic/plugins:/usr/share/elasticsearch/plugins
        networks:   # 网络配置
           - elasticsearch-network
    kibana:
        restart: always
        image: kibana:7.17.0
        container_name: kibana
        ports:
         - 5601:5601
        depends_on: # 服务依赖
          - elasticsearch
        volumes:
          - ~/mall/pack/elastic/kibana/kibana.yml:/usr/share/kibana/config/kibana.yml
        networks:
          - elasticsearch-network
networks:
  elasticsearch-network:
```

4.  执行如下命令，启动容器。

```sh
docker-compose up -d    // 启动容器
docker-compose logs -f  // 查看容器启动日志
```

5.  分别访问 localhost:9200 和 localhost:5601 网址。显示如下信息和界面，说明 Elasticsearch 服务和 Kibana 服务部署成功。

```json
{
  "name": "cf55d2d2cfd9",
  "cluster_name": "docker-cluster",
  "cluster_uuid": "ZqDLEOikRW-W8YU4qQuC5A",
  "version": {
    "number": "7.17.0",
    "build_flavor": "default",
    "build_type": "docker",
    "build_hash": "bee86328705acaa9a6daede7140defd4d9ec56bd",
    "build_date": "2022-01-28T08:36:04.875279988Z",
    "build_snapshot": false,
    "lucene_version": "8.11.1",
    "minimum_wire_compatibility_version": "6.8.0",
    "minimum_index_compatibility_version": "6.0.0-beta1"
  },
  "tagline": "You Know, for Search"
}
```

![image-20230605100450480.png](https://s2.loli.net/2023/06/05/X6cogqtLQYr3OGy.png)

### 设置登陆密码

1.  在 elasticsearch.yml 配置文件中添加如下配置

```yaml
xpack.security.enabled: true
```

2.  执行如下命令，进入到 elasticsearch 容器中。

```sh
docker exec -it elasticsearch /bin/bash
```

3.  执行如下命令，设置密码。一共有七个用户，依次设置这七个用户的密码，我这里统一将密码设置成 123456。

```sh
/usr/share/elasticsearch/bin/elasticsearch-setup-passwords interactive
```

![image-20230605103218114.png](https://s2.loli.net/2023/06/05/ZnM5NGe31kwLWOT.png)

4.  退出容器，然后在 kibana.yml 文件中添加如下配置。

```yaml
elasticsearch.username: "elastic"
elasticsearch.password: "123456"
```

5.  重新启动容器，再次访问页面，会出现弹框，输入用户名和密码登陆即可。**默认用户名为：elastic** 。

```sh
docker-compose down
docker-compose up -d
```

### 完整配置文件内容

更多配置可以参考官方文档。

- elasticsearsh.yml

```yaml
network.host: 0.0.0.0
discovery.type: single-node
xpack.security.enabled: true
```

- kibana.yml

```yaml
server.host: 0.0.0.0
server.name: kibana
elasticsearch.username: "elastic"
elasticsearch.password: "123456"
```

## Spring Boot 整合 Elasticsearch

[Spring Data Elasticsearch 官方文档](https://docs.spring.io/spring-data/elasticsearch/docs/4.4.12/reference/html/#preface)

### 添加依赖

**Spring Boot 版本要与 Elasticsearch 版本对应上，对应关系如下图所示。**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
    <!--  版本为 Spring Boot 版本  -->
    <version>2.7.5</version>
</dependency>
```

![image-20230605182211128.png](https://s2.loli.net/2023/06/06/XqwQuK89ea2yBJg.png)

### 添加配置

在 application.yaml 配置文件中新增如下配置。

```yaml
spring:
  elasticsearch:
    username: elastic
    password: 123456
    uris: http://192.168.107.65:9200  // 虚拟机地址
    connection-timeout: 10s
```

### 使用

本文只介绍 Elasticsearch 的基本使用，更详细的用法可以查看官方文档。

1.  引入 ElasticsearchRestTemplate

```java
@RestController
@RequestMapping("/demo")
public class Demo {
    @Resource
    private ElasticsearchRestTemplate elasticsearchRestTemplate;
    
    /**
    * 创建索引
    **/
    @GetMapping("/createIndex")
    public void createIndex() {
        IndexOperations indexOps = esRestTemplate.indexOps(IndexCoordinates.of("elasticsearch"));
        boolean result = indexOps.create();
    }
}
```

2.  访问地址，创建索引。然后通过 Kibana 查看新增的索引。

![image-20230606102111649.png](https://s2.loli.net/2023/06/06/g5N4oGQOCePLWXf.png)

## 问题

1.  elasticsearch 容器启动报错。原因是挂载的 **data** 目录权限不够。

    解决：执行命令 `chmod -R 777 data` ，然后重新启动容器即可。

![image-20230605094800124.png](https://s2.loli.net/2023/06/05/jnJvgN16cfRLSQU.png)

2.  elasticsearch 容器内存占用高达 13G。

    解决：在 docker-compose.yaml 文件中添加如下配置，指定 JVM 内存占用大小。

```yaml
environment:
  - ES_JAVA_OPTS= -Xms2g -Xmx2g
```

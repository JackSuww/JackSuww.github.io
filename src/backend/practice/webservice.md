---
title: 使用 Axis 调用 WebService 服务接口
date: 2023-12-20
author: JackSu
categories:
  - Java
tags:
  - WebService
---

## 前言

项目中要使用第三方平台提供的服务，接口是以 SOAP WebService 的形式暴露的。因为是初次接触 WebService 技术，本文主要记录从学习 WebService 到项目成功接入服务的整个过程。学习过程中参考了几篇不错的博客。（WebService 目前很少使用，作为知识的额外补充，了解即可，不需要深入学习）

- [WebService 快速入门](https://zhuanlan.zhihu.com/p/126507013)
- [Axis 调用 WebService 接口](https://www.cnblogs.com/archermeng/p/8587537.html)
- [Axis 调用 WebService 接口](https://blog.csdn.net/qq_33236248/article/details/80436688)

## 实现

实现过程：

1. 参考 WebService 服务端提供的 WSDL 格式的文档，根据文档确定要调用的方法及参数。

2. 选择接口调用方式。

   - 直接发送 HTTP 请求调用。

   - 根据 WSDL 文档生成 Client，通过 Client 调用。（IDEA 中提供了代码生成的方法，需要先安装 WebServcie 插件。）

   - 通过 Axis 方式调用。（Java 提供了相关的类库，引入相关依赖即可使用）

**工作中 WebService 服务接口需要传递 XML 格式的参数，参数中包含了身份认证的信息。使用 Axis 方式调用比较方便**。

3. 引入相关依赖，编写代码。

### 引入依赖

```xml
<!--  Axis 相关依赖      -->
<dependency>
    <groupId>org.apache.axis</groupId>
    <artifactId>axis</artifactId>
    <version>1.4</version>
</dependency>
<dependency>
    <groupId>org.apache.axis</groupId>
    <artifactId>axis-jaxrpc</artifactId>
    <version>1.4</version>
</dependency>
<dependency>
    <groupId>wsdl4j</groupId>
    <artifactId>wsdl4j</artifactId>
</dependency>
<dependency>
    <groupId>commons-discovery</groupId>
    <artifactId>commons-discovery</artifactId>
    <version>0.2</version>
</dependency>
<!--  dom4j 用来解析xml文件      -->
<dependency>
    <groupId>org.dom4j</groupId>
    <artifactId>dom4j</artifactId>
    <version>2.1.4</version>
</dependency>
```

### 代码实现

```java
/**
 * 发送请求
 *
 * @param url	WSDL文档地址（示例：http://webservice?wsdl）
 * @param soapActionUrl	要调用的方法地址
 * @param namespace	    命名空间
 * @param method	    调用的方法名称
 * @param parameter	    调用的方法参数
 * 注：命名空间、方法地址、方法、方法参数根据实际情况调整（在提供的WSDL文件中查看）
*/
public void sendRequest(String url,String soapActionUrl, String namespace, String method,String parameter) throws Exception {
    Service service = new Service();
    Call call = (Call) service.createCall();
    // 请求地址
    call.setTargetEndpointAddress(url);
     // 请求地址
    call.setTargetEndpointAddress(new URL(url));
    call.setEncodingStyle("UTF-8");
    call.setUseSOAPAction(true);
    call.setSOAPActionURI(soapUrl);
    // 操作的方法
    call.setOperationName(new QName(namespace, method));
    // 方法参数
    call.addParameter(new QName(namespace,parameter), XMLType.XSD_STRING, ParameterMode.IN);
    // 返回结果类型
    call.setReturnType(XMLType.XSD_STRING);
    // 构造xml参数
    String str = makeXml();
    Object invoke = call.invoke(new Object[]{str});
    // 响应的结果
    String result = (String) invoke;
	// 根据响应结果写业务逻辑
    Document document = DocumentHelper.parseText(result);
    Element rootElement = document.getRootElement();
    Element resp = rootElement.element("Resp");	// 只能获取当前节点的下一节点
    String respCode = resp.element("RespCode").getTextTrim();
    if (!StrUtil.equals(respCode, "success")) {
        System.out.println("请求异常");
    } else {
        System.out.println("请求成功");
    }
}

/**
 * xml 参数构造方法（dom4j）
 * @return
*/
private String makeXml() {
    Document document = DocumentHelper.createDocument();
    Element contractRoot = document.addElement("ContractRoot");
    Element tcpCont = contractRoot.addElement("TcpCont");
    tcpCont.addElement("RequestTime").setText(DateUtil.now());

    Element bizCont = contractRoot.addElement("BizCont");
    bizCont.addElement("RequestTime").setText(DateUtil.now());

    return document.asXML();
}
```

## 说明

- WSDL 命名空间查看：在 WSDL 文档中找到`targetNamespace`标签
- soapActionUrl 查看：在 WSDL 文档中找到`soap:operation`标签

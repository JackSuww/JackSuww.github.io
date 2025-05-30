---
title: 使用 Poi-tl 类库实现 Echarts 图表 + 前端表格导出到 Word 文档
date: 2023-06-11
author: JackSu
categories:
  - Java
tags:
  - Poi-tl
---

> 本文主要介绍使用 Poi-tl Java 类库实现 Echarts 图表和前端表格导出到 Word 文档的详细步骤。
>
> Word 版本：2019、Poi-tl 版本：1.10.5 ，POI 版本：4.1.2
>
> [Poi-tl 官方文档](http://deepoove.com/poi-tl/)

## 前言

最近工作中有一个将 Echarts 图表和前端表格导出到 Word 文档中的需求，需要纯后端实现，在网上搜寻对比了一些实现方式，同时结合当前项目，最后选择了 Poi-tl Java 类库。Poi-tl 是一个基于 Apache POI 的 Word 模板引擎，它提供了简单易用的 API，可以让我们方便快捷地操作 Word 文档。

实现思路：创建 Word 文档并绘制好图表，利用 Poi-tl 类库将数据渲染到 Word 文档中的图表上，然后再通过直接修改 Word 文档中的图表样式达到美化展示的效果。

## 图表导出

需求中需要导出的图表有条形图、圆环图、堆积条形图、饼图和组合图（柱形 + 折线）。接下来本文将以导出条形图为例介绍完整实现步骤，完成了一个图表的导出操作，导出其他图表就是照葫芦画瓢。

### 引入依赖

<font color=red>**注意：**</font>Poi-tl 版本要和 POI 版本对应上，否则程序执行会报错，Poi-tl 1.8 版本以下不支持图表操作。版本对应关系如下表所示。

| Poi-tl 版本            | POI 版本 |
| ---------------------- | -------- |
| 1.12.1（当前最新版本） | 5.2.2+   |
| 1.10.x                 | 4.1.2    |
| 1.9.x                  | 4.1.2    |
| 1.8.x                  | 4.1.2    |

```xml
<dependency>
     <groupId>org.apache.poi</groupId>
     <artifactId>poi</artifactId>
     <version>4.1.2</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>4.1.2</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-scratchpad</artifactId>
    <version>4.1.2</version>
</dependency>
<dependency>
    <groupId>com.deepoove</groupId>
    <artifactId>poi-tl</artifactId>
    <version>1.10.5</version>
</dependency>
```

### 准备 Word 模板

1.  新建一个空白的 Word 文档，在其中插入一个条形图。

2.  右键点击条形图，选择**查看可选文字**，然后在**替换文字**选项卡的文本框中输入 chart。**chat** 可以理解为图表的唯一 ID，后面写代码渲染数据时会使用。

3.  保存文件，格式为 .doc 或者 .docx 都可以，然后将文档放到项目中的 **resources/templates** 目录下即可。

### 编码实现

主要分为三个步骤：编译模板、渲染数据、输出到流。代码量不多，但是包含了所有细节。如需添加其他图表，可以参照如下代码和官方文档，自行实现。

```java
public void exportWord(HttpServletResponse response) {
    // 获取输入流
    InputStream inputStream = null;
    try {
        inputStream = new ClassPathResource("templates/template.doc").getInputStream();
    } catch (IOException e) {
        logger.error("读取Word模板失败，原因为：{}",e.getMessage());
        throw new RuntimeException(e);
    }
    // 编译word模板
    XWPFTemplate template = XWPFTemplate.compile(inputStream);
    // 获取数据(自己查询所需数据即可，这里以 dataList 为例)
    List<Data> dataList = xxxxx;
    // 构建图表模型
    ChartMultiSeriesRenderData chart = null;
    if (!CollectionUtils.isEmpty(dataList)){
        chart = Charts
            .ofMultiSeries("图表标题", dataList.stream()
                           .map(Data::getDataName)
                           .collect(Collectors.toList())
                           .toArray(new String[dataList.size()]))
            .addSeries("系列名称", dataList.stream()
                       .map(Data::getDataValue)
                       .collect(Collectors.toList())
                       .toArray(new Double[dataList.size()]))
            .create();
    }
    // 用来渲染数据的 Map，key 为模板中可选文字指定的值，value 为图表模型对象
    Map<String,Object> dataMap = new HashMap<>();
    dataMap.put("chart", chart);
    // 渲染数据
    template.render(dataMap);
    try {
        // 输出到流
        response.setHeader(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + fileName + ".doc");
        OutputStream outputStream = response.getOutputStream();
        template.writeAndClose(outputStream);
    } catch (Exception e){
        e.printStackTrace();
    }
}
```

## 表格导出

Poi-tl 的强大和核心之处，在于它内置了一些常用的插件。通过使用这些插件，可以更加便捷的满足我们的需求。同时，我们还可以通过实现相关接口开发自己的插件，以满足特殊需求。

接下来将使用**表格行循环插件**来实现表格的导出操作。

### Word 模板调整

1.  在 Word 文档中插入表格，表格结构要和前端展示的表格结构相同。
2.  为表格填充占位标签。**table** 是表格的唯一 ID，**name** 和 **phone** 对应代码中类的字段名，渲染数据时会使用。表格模板如下表所示。

| 姓名 {{table}} | 手机号   |
| -------------- | -------- |
| \[name]        | \[phone] |

### 编码实现

只需加载要使用的表格插件，获取数据，再放入到`Map`集合中即可。与导出图表相比，只多了一个加载插件的步骤，通过使用插件，非常方便的就可以完成表格的导出操作。

```java
// 只放入了表格实现的代码，自行结合上面的代码补充完整
// 表格行循环插件，用于填充表格数据
LoopRowTableRenderPolicy policy = new LoopRowTableRenderPolicy();
// table对应模板中的表格ID
Configure config = Configure.builder()
        .bind("table", policy)
        .build();
// 编译word模板
XWPFTemplate template = XWPFTemplate.compile(inputStream,config);
// 表格数据，表格对象的属性要和模板中的字段名对应
List<Table> tableDataList = xxxx;
Map<String,Object> dataMap = new HashMap<>();
// 表格
dataMap.put("table",tableDataList);

```

至此，需求完美完成。

## 问题

- 图表系列的值只能为`Number[]`类型，代码中使用`String`类型字段会报错。

  解决：可以将字段转为`int`或`double`类型再使用。

- 模板中的占位标签要和代码中一一对应，否则渲染数据时会出错。

- 当圆环图数据项较多时，即使将数据标签的标签位置设置为**最佳匹配**，标签依然会重叠。

  解决：可以在 Word 中换一种图表类型展示数据，暂无其他更好的解决方式，

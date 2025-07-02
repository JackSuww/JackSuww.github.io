<!-- ---
title: Java 生成与解析大疆无人机 KMZ 航线文件
date: 2024-11-19
author: JackSu
star: true
categories:
  - Java
tags:
  - dji
---

> 完整的 Demo 源码可以在该 [GitHub 仓库](https://github.com/JackSu-99/dj-uav) 中获取，源码实现了 KMZ 文件生成和解析功能，生成的 KMZ 文件可以直接导入到 Pilot2 或机场中使用。如果该项目对你有帮助的话，欢迎点个 star 支持！

## 实现效果

- KMZ 文件结构。
  ![kmz-01.gif](https://s2.loli.net/2024/11/19/kznUqoeSa7CbBAX.gif)

- template.kml 文件内容。
  ![kmz-02.png](https://s2.loli.net/2024/11/19/tDBySCuWoM3mUpf.png)

## 航线文件介绍

KMZ 航线文件本质上是一个 ZIP 格式的压缩文件，一个标准的 KMZ 文件结构如下。

    —— wpmz
      |—— res
      |—— template.kml
      |—— waylines.wpml

- res：资源文件夹，用来存储航线所需的辅助资源文件（如图片、数据等）。
- template.kml：模板文件，定义了航线的业务属性，便于用户快速编辑和调整。
- waylines.wpml：执行文件，包含了无人机执行航线任务时的具体执行细节。

template.kml、waylines.wpml 和 res 资源文件夹都是航线文件格式标准的一部分，我们可以根据使用场景灵活调整文件结构。如果需要将 KMZ 航线文件导入到 Pilot2 中使用，可以只生成 template.kml 文件，Pilot2 可以根据 template 文件生成 waylines 文件。除特殊使用场景外（精准复拍前，准备参考目标照片等），可以不生成 res 文件夹。

## 实现思路

大疆开发者平台上云 API 文档中详细介绍了[航线文件格式标准](https://developer.dji.com/doc/cloud-api-tutorial/cn/api-reference/dji-wpml/overview.html)以及文件中具体的元素、名称以及取值和释义。本文主要介绍如何生成和解析航点飞行模板类型的 KMZ 航线文件，具体的实现思路如下：

- KMZ 文件生成：首先生成一个 wpmz 文件夹，然后在 wpmz 文件夹下，生成 template.kml 文件和 waylines.wpml 文件，然后将 wpmz 文件夹压缩成 .zip 格式，最后修改 .zip 文件后缀为 .kmz。
- KMZ 文件解析：上传 KMZ 文件，对 KMZ 文件解压缩，获取到 template.kml 和 waylines.wpml 文件，然后分别解析 template.kml 文件和 waylines.wpml 文件。

template.kml 和 waylines.wpml 文件都是 XML 格式，而且文件中包含多个元素标签，每个元素标签又有不同的属性，航线文件内容比较灵活，因此可以使用 Java 类库 XStream 来方便的将 Java 对象和 XML 文档相互转换，航线文件中每个元素标签可以对应一个 Java Bean，通过操作这些 Java Bean 来生成和解析 KMZ 航线文件。

## 具体实现

由于代码量较大，这里主要贴一下关键代码。

### 引入 maven 依赖

```xml
<dependency>
    <groupId>com.thoughtworks.xstream</groupId>
    <artifactId>xstream</artifactId>
    <version>1.4.20</version>
</dependency>
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-compress</artifactId>
    <version>1.26.0</version>
</dependency>
```

### 使用 XStream 注解的 Java 类。

```java
import com.thoughtworks.xstream.annotations.XStreamAlias;
import com.thoughtworks.xstream.annotations.XStreamAsAttribute;
import lombok.Data;

@Data
@XStreamAlias("kml")
public class KmlInfo {

    @XStreamAsAttribute
    @XStreamAlias("xmlns")
    private String xmlns = "http://www.opengis.net/kml/2.2";

    @XStreamAsAttribute
    @XStreamAlias("xmlns:wpml")
    private String wpml = "http://www.dji.com/wpmz/1.0.4";

    @XStreamAlias("Document")
    private KmlDocument document;

}
```

### 生成 KMZ 文件。

```java
/**
 * 生成kmz文件
 */
public static String buildKmz(String fileName, KmlParams kmlParams) {
    KmlInfo kmlInfo = buildKml(kmlParams);
    KmlInfo wpmlInfo = buildWpml(kmlParams);
    return buildKmz(fileName, kmlInfo, wpmlInfo);
}

public static String buildKmz(String fileName, KmlInfo kmlInfo, KmlInfo wpmlInfo) {
    XStream xStream = new XStream(new DomDriver());
    xStream.processAnnotations(KmlInfo.class);
    xStream.addImplicitCollection(KmlActionGroup.class, "action");

    String kml = XML_HEADER + xStream.toXML(kmlInfo);
    String wpml = XML_HEADER + xStream.toXML(wpmlInfo);

    try (FileOutputStream fileOutputStream = new FileOutputStream(LOCAL_KMZ_FILE_PATH + fileName + ".kmz");
         ZipOutputStream zipOutputStream = new ZipOutputStream(fileOutputStream)) {
        zipOutputStream.setLevel(0); // 0 表示不压缩，存储方式

        // 创建 wpmz 目录中的 template.kml 文件条目
        ZipEntry kmlEntry = new ZipEntry("wpmz/template.kml");
        zipOutputStream.putNextEntry(kmlEntry);
        // 将内容写入 ZIP 条目
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(kml.getBytes(StandardCharsets.UTF_8))) {
            byte[] buffer = new byte[1024];
            int length;
            while ((length = inputStream.read(buffer)) >= 0) {
                zipOutputStream.write(buffer, 0, length);
            }
        }
        zipOutputStream.closeEntry(); // 关闭条目

        // 创建 wpmz 目录中的 waylines.wpml 文件条目
        ZipEntry wpmlEntry = new ZipEntry("wpmz/waylines.wpml");
        zipOutputStream.putNextEntry(wpmlEntry);
        // 将内容写入 ZIP 条目
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(wpml.getBytes(StandardCharsets.UTF_8))) {
            byte[] buffer = new byte[1024];
            int length;
            while ((length = inputStream.read(buffer)) >= 0) {
                zipOutputStream.write(buffer, 0, length);
            }
        }
        zipOutputStream.closeEntry(); // 关闭条目

    } catch (Exception e) {
        throw new RuntimeException(e);
    }
    return LOCAL_KMZ_FILE_PATH + fileName + ".kmz";
}
```

### 解析 KMZ 文件。

```java
/**
 * 解析kmz文件
 * @param file
 */
@GetMapping("/parseKmz")
public void test(@RequestParam("file") MultipartFile file) {
    try (ArchiveInputStream archiveInputStream = new ZipArchiveInputStream(file.getInputStream())) {
        ArchiveEntry entry;
        while (!Objects.isNull(entry = archiveInputStream.getNextEntry())) {
            String name = entry.getName();
            if (name.toLowerCase().endsWith(".kml")) {
                KmlInfo kmlInfo = RouteFileUtils.parseKml(archiveInputStream);
                System.out.println("kml = " + kmlInfo);
            } else if (name.toLowerCase().endsWith(".wpml")) {
                KmlInfo kmlInfo = RouteFileUtils.parseKml(archiveInputStream);
                System.out.println("wpml = " + kmlInfo);
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}

/**
 * kml文件解析
 *
 * @param inputStream
 * @return
 */
public static KmlInfo parseKml(InputStream inputStream) {
    XStream xStream = new XStream();
    xStream.allowTypes(new Class[]{KmlInfo.class, KmlAction.class, KmlWayLineCoordinateSysParam.class, KmlPoint.class});
    xStream.alias("kml", KmlInfo.class);
    xStream.processAnnotations(KmlInfo.class);
    xStream.autodetectAnnotations(true);
    xStream.addImplicitCollection(KmlActionGroup.class, "action");
    return (KmlInfo) xStream.fromXML(inputStream);
}
``` -->

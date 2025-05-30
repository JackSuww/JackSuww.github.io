---
title: EasyExcel 导出多张图片
date: 2024-04-09
author: JackSu
star: true
categories:
  - Java
tags:
  - EasyExcel
---

> 最近在工作中实现了一个将多张图片导出到 Excel 表格，而且图片需要在单元格内平铺展示的需求。
>
> 需求通过 EasyExcel（版本 3.3.4）中提供的转换器（Converter）和拦截器（Handler）实现。
>
> [EasyExcel 官网地址](https://easyexcel.opensource.alibaba.com/)

## 实现效果

![EasyExcel-01.png](https://s2.loli.net/2024/04/08/ucAbk4ejaKmdQgS.png)

## 实现过程

EasyExcel 支持导出 `ByteArray`、`File`、`String`、`InputStream`、`URL` 五种类型的图片。项目中图片字段存储的是图片 URL 地址，因此本文将介绍导出 `String` 类型图片的实现过程。

实现过程主要包括两个关键步骤：

1. 自定义转换器（实现 Converter 接口）：图片数据转换（将 `String` 类型图片的 URL 地址转换为字节数组，并设置到 `writeCellData`对象的 `imageDataList` 属性中）。
2. 自定义拦截器（实现 CellWriteHandler 接口）：阻止 EasyExcel 默认的图片导出操作，使用 Apache POI 库向 Excel 表格中手动写入图片。

执行流程和具体步骤如下。

![EasyExcel-02.png](https://s2.loli.net/2024/04/08/F2N6Xji7pTZW5hn.png)

### 1、引入依赖

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.3.4</version>
</dependency>
```

### 2、定义实体类

```java
/**
 * @author JackSu
 * @description 只保留图片字段，省略其他字段
 */
@Data
public class ExportImageVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 图片地址列表
     */
    @ExcelProperty(value = "图片", order = 1,converter = ExcelUrlConverterUtil.class)
    private List<String> imageUrlList;
}
```

### 3、定义转换器

```java
public class ExcelImageUrlConverterUtil implements Converter<List<String>> {

    @Override
    public CellDataTypeEnum supportExcelTypeKey() {
        return CellDataTypeEnum.STRING;
    }

    @Override
    public WriteCellData<?> convertToExcelData(List<String> value, ExcelContentProperty contentProperty, GlobalConfiguration globalConfiguration) {
        List<ImageData> imageDataList = new ArrayList<>();
        for (String url : value) {
            try {
                URL imageUrl = new URL(url);
                byte[] bytes = IoUtils.toByteArray(imageUrl.openConnection().getInputStream());
                ImageData imageData = new ImageData();
                imageData.setImage(bytes);
                imageDataList.add(imageData);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        WriteCellData writeCellData = new WriteCellData();
        writeCellData.setImageDataList(imageDataList);
        writeCellData.setType(CellDataTypeEnum.STRING);
        return writeCellData;
    }
}
```

### 4、定义拦截器

- `afterCellDataConverted` 方法：单元格数据经过转换器处理之后，会回调执行该方法。在这个方法中阻止默认的图片导出操作。
- `afterCellDispose` 方法：单元格数据已经写入到 Excel 表格后，会回调执行该方法。在这个方法中实现手动插入图片到 Excel 表格。

```java
public class ImageCellWriteHandler implements CellWriteHandler {

    private final HashMap<String, List<ImageData>> imageDataMap = new HashMap<>(16);

    @Override
    public void afterCellDataConverted(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder, WriteCellData<?> cellData, Cell cell, Head head, Integer relativeRowIndex, Boolean isHead) {
        if (isHead) {
            return;
        }
        // 将单元格图片数据复制出来，清空单元格图片数据
        if (!CollectionUtils.isEmpty(cellData.getImageDataList())) {
            imageDataMap.put(cell.getRowIndex() + "_" + cell.getColumnIndex(), cellData.getImageDataList());
            cellData.setType(CellDataTypeEnum.EMPTY);
            cellData.setImageDataList(new ArrayList<>());
        }
    }

    @Override
    public void afterCellDispose(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder, List<WriteCellData<?>> cellDataList, Cell cell, Head head, Integer relativeRowIndex, Boolean isHead) {
        if (isHead || CollectionUtils.isEmpty(cellDataList)) {
            return;
        }
        String key = cell.getRowIndex() + "_" + cell.getColumnIndex();
        List<ImageData> imageDataList = imageDataMap.get(key);
        if (CollectionUtils.isEmpty(imageDataList)) {
            return;
        }

        // 设置单元格行高和列宽
        Sheet sheet = cell.getSheet();
        sheet.getRow(cell.getRowIndex())
                .setHeight((short) 900);
        sheet.setColumnWidth(cell.getColumnIndex(), 250 * 50);
		// 插入图片
        for (int i = 0; i < imageDataList.size(); i++) {
            ImageData imageData = imageDataList.get(i);
            if (ObjectUtils.isEmpty(imageData)) {
                continue;
            }
            byte[] image = imageData.getImage();
            this.insertImage(sheet, cell, image, i);
        }
        imageDataMap.remove(key);
    }


    private void insertImage(Sheet sheet, Cell cell, byte[] pictureData, int i) {
        // 图片宽度
        int pictureWidth = Units.pixelToEMU(150);
        int index = sheet.getWorkbook().addPicture(pictureData, HSSFWorkbook.PICTURE_TYPE_PNG);
        Drawing<?> drawing = sheet.getDrawingPatriarch();
        if (ObjectUtils.isEmpty(drawing)) {
            drawing = sheet.createDrawingPatriarch();
        }
        CreationHelper helper = sheet.getWorkbook().getCreationHelper();
        ClientAnchor anchor = helper.createClientAnchor();
        // 设置图片在哪个单元格中
        anchor.setCol1(cell.getColumnIndex());
        anchor.setCol2(cell.getColumnIndex());
        anchor.setRow1(cell.getRowIndex());
        anchor.setRow2(cell.getRowIndex() + 1);
        // 设置图片在单元格中的位置
        anchor.setDx1(pictureWidth * i);
        anchor.setDx2(pictureWidth + pictureWidth * i);
        anchor.setDy1(0);
        anchor.setDy2(0);
        // 设置图片可以随着单元格移动
        anchor.setAnchorType(ClientAnchor.AnchorType.MOVE_AND_RESIZE);
        drawing.createPicture(anchor, index);
    }
}
```

## 总结

因为 EasyExcel 使用的是目前的最新版本，在实现功能的过程中，遇到了一些使用上的问题，解决问题的过程中翻阅了官方文档和一些博客文章，但未找到合适的解决方式，最后在 [GitHub Issues](https://github.com/alibaba/easyexcel/issues/3034) 中找到了答案。

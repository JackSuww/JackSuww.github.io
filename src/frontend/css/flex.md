---
title: flex布局
date: 2025-11-24
author: JackSu
categories: 
 - 前端
tags: 
 - Vue
---

###盒子模型

1.将所有元素表示为一个矩形的盒子，每个盒子包括内容边界（width，height，background-image）、
内边距边界（paddig）内边距的粗细可以由 padding-top、padding-right、padding-bottom、padding-left，和简写属性 padding 控制。
边框边界。边框的粗细由 border-width 和简写的 border 属性控制。如果 box-sizing 属性被设为 border-box，那么边框区域的大小可明确地通过 width、min-width, max-width、height、min-height，和 max-height 属性控制。
外边框边界。外边距区域（margin area）由外边距边界限制，用空白区域扩展边框区域，以分开相邻的元素。它的尺寸为 margin-box 宽度和 margin-box 高度。
外边距区域的大小由 margin-top、margin-right、margin-bottom、margin-left，和简写属性 margin 控制。在发生外边距合并的情况下，由于盒之间共享外边距，外边距不容易弄清楚。

##Flex布局
任何一个容器都可以指定为 Flex 布局
~~~CSS3
.box{
  display: flex;
}
行内元素也可以使用 Flex 布局。

.box{
  display: inline-flex;
}

二、基本概念
采用 Flex 布局的元素，称为 Flex 容器（flex container），简称"容器"。它的所有子元素自动成为容器成员，称为 Flex 项目（flex item），简称"项目"。

![flex布局属性说明](./public/images/image.png)

三、容器的属性
以下6个属性设置在容器上。
~~~CSS3
flex-direction
flex-wrap
flex-flow
justify-content
align-items
align-content

3.1 flex-direction属性
flex-direction属性决定主轴的方向（即项目的排列方向）。


.box {
  flex-direction: row | row-reverse | column | column-reverse;
}

它可能有4个值。

row（默认值）：主轴为水平方向，起点在左端。
row-reverse：主轴为水平方向，起点在右端。
column：主轴为垂直方向，起点在上沿。
column-reverse：主轴为垂直方向，起点在下沿。
3.2 flex-wrap属性
默认情况下，项目都排在一条线（又称"轴线"）上。flex-wrap属性定义，如果一条轴线排不下，如何换行。

（1）nowrap（默认）：不换行。



（2）wrap：换行，第一行在上方。



（3）wrap-reverse：换行，第一行在下方。


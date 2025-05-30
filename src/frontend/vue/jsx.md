---
title: JSX 实现 Element-ui 表格列动态渲染
date: 2024-03-07
author: JackSu
categories: 
 - 前端
tags: 
 - Vue
---

使用 JSX、render 自定义表格组件。

提供两种实现方式：一种使用 scopedSlots 插槽实现，一种使用表格列 formatter 函数实现。

1. scopedSlots  插槽实现。

~~~javascript
// 定义
const slotScope = {
	scopedSlots: {
		default(scope) {
			return <el-input v-model={scope.row[scheme.__vModel__]}></el-input>
		},
	},
};
// 使用
<el-table-column label={config.label} align='center' {...slotScope}>
</el-table-column>
~~~

2. formatter 函数实现。

~~~javascript
// 定义
const formatter = (row, column, cellValue, index) => {
	return  <el-input v-model={row[scheme.__vModel__]}></el-input>
}
// 使用
<el-table-column label={config.label} align='center' formatter={formatter}>
</el-table-column>
~~~
<br>
<br>
<br>
<br>
<br>
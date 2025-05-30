---
title: Git
date: 2023-09-05
author: JackSu
categories: 
 - 工具
tags: 
 - Git
---

## Git 常用命令


* `git add`：代码提交到本地暂存区
* `git commit -m  ''`：代码提交到本地仓库
* `git push`：代码提交到远程仓库
* `git pull`：拉取远程仓库代码到本地
* `git clone` ：克隆远程仓库代码到本地
* `git branch -m master main`：本地代码分支重命名（master 重命名为 main）。本地分支和远程分支名称不同时，可以通过该命令来同步分支名称
* `git remote -v`：查看本地仓库关联的远程仓库
* `git remote remove origin`：删除关联的远程仓库
* `git remote add origin xxx`：关联远程仓库
* `git pull origin master --allow-unrelated-histories`：允许不相关历史提交，并强制合并。执行 Git 命令报错`fatal: refusing to merge unrelated histories`时使用，然后再解决冲突。
* `git stash`：将当前分支的修改暂存起来。之后使用`git stash pop`命令可以将暂存的内容恢复。**适用场景：开发过程中，需要临时切换分支。**

## 项目开发中的 Git 规范

### git commit  提交信息规范

**常用：**

* feat：新增功能
* fix：bug 修复
* refactor：重构代码（既没有新增功能，也没有修复 bug）
* docs：文档更新
* test：新增测试用例或是更新现有测试
* perf：性能, 体验优化
* revert：回滚某个更早之前的提交

**不常用（相对来说使用没那么频繁）：**

* style：不影响程序逻辑的代码修改（修改空白字符，格式缩进等）
* ci：主要目的是修改项目继续集成流程（Jenkins，GitLab CI 等）的提交
* chore：不属于以上类型的其他类型，比如构建流程, 依赖管理

### 代码提交流程

![代码提交流程.png](https://s2.loli.net/2023/09/05/o64sHE2Jq71ZCMI.png)
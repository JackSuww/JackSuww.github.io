---
title: "JimuReport 仪表盘多租户功能实现与问题解析"
date: 2025-12-15
---

<!-- TOC -->

## 🧩 背景介绍

JimuReport 是一款开源的轻量级低代码报表工具，支持多种数据库、仪表盘、大屏与图表报表设计，适合快速构建企业级可视化报表系统。:contentReference[oaicite:1]{index=1}

在 SaaS 场景下，多租户架构是保障各租户隔离性和安全性的重要设计。然而，在实际使用中，积木报表（JimuReport）**仪表盘模块的多租户功能存在一些实现问题**，可能导致租户数据隔离不一致或失效。:contentReference[oaicite:2]{index=2}

---

## 🧠 多租户架构概述

在多租户系统中：

- **标准模式**：所有租户共享逻辑层和部分资源
- **租户隔离模式（saasMode: tenant）**：业务数据和访问权限需要完全按照租户进行隔离处理

JimuReport 通过 `JmReportTokenServiceImpl` 注入租户信息，以区分不同租户的数据访问上下文。:contentReference[oaicite:3]{index=3}

---

## ❗ 仪表盘模块问题表现

在版本 `1.8.1-beta` 及部分后续版本中，发现多个 **多租户相关问题**：

### 🔎 主要表现

1. **仪表盘查询不触发租户注入**  
   在调用 `/drag/list` 接口时，租户信息未自动附带，导致查询结果不符合当前租户的数据隔离要求。:contentReference[oaicite:4]{index=4}

2. **新增仪表盘不携带租户信息**  
   新建仪表盘时未在请求或内部逻辑中注入租户标识。:contentReference[oaicite:5]{index=5}

3. **复制功能意外正常**  
   与查询、新增不同的是，仪表盘“复制”功能因走了不同逻辑路径，反而触发正确的租户信息注入。:contentReference[oaicite:6]{index=6}

⚠️ **这种不一致性严重影响多租户数据隔离性，可能导致跨租户数据泄露或权限越界。**:contentReference[oaicite:7]{index=7}

---

## 🛠️ 问题原因分析

分析发现以下核心原因：

### 1. **租户拦截器未统一集成**

部分仪表盘功能接口缺少统一的多租户信息拦截器配置，因此执行时租户上下文未正确注入。:contentReference[oaicite:8]{index=8}

### 2. **时序逻辑冲突**

接口权限校验与租户信息注入的执行顺序不正确，有时导致校验先于租户信息注入，出现租户信息丢失的情况。:contentReference[oaicite:9]{index=9}

### 3. **数据访问层缺少租户过滤条件**

查询语句没有添加 `tenant_id` 或租户标识字段的过滤条件，导致无法正确隔离数据。:contentReference[oaicite:10]{index=10}

---

## 🧩 解决方案与最佳实践

### ✅ 🔁 确保所有接口都通过租户拦截器

为所有涉及数据访问的仪表盘接口配置统一的多租户拦截器（例如 SpringBoot 中的租户拦截器逻辑），确保 **每个请求都能包含租户信息**。:contentReference[oaicite:11]{index=11}

### ✅ 🛡️ 后端强制加入租户过滤

在数据访问逻辑（如 MyBatis 查询或 JPA repository）中确保加入：

```sql
WHERE tenant_id = #{currentTenantId}

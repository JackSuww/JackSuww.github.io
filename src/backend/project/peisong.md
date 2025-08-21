---
title: 配送项目需求说明书）
description: 超市/配送小程序与若依后台一体化项目需求，适配 VuePress 展示，已脱敏处理
date: 2025-08-19
sidebarDepth: 2
---

# 超市/配送小程序与若依后台一体化项目 需求说明书

本文档基于第一版与第二版需求进行系统化梳理，适配 VuePress 展示。所有涉及隐私的账号、密钥、IP、数据库连接等信息均已脱敏并以占位符表示。实际部署请使用环境变量或密钥管理服务。

- 前台：微信小程序（下单、查看订单、管理个人信息）
- 后台：若依（RuoYi）管理平台（商品/顾客/订单/报价/打印/审批）
- 打印：单订单模板导出、当日订单合并导出（多 Sheet）
- OCR：手写结构化数据识别（PP-Structure），用于表单/清单转结构化数据

## 1. 代码与资源

<!-- - GitHub（参考/示例）：https://github.com/sword2022/super-shop
- Gitee（后台）：https://gitee.com/jacksu1/back-peisong.git
- Gitee（前台小程序）：https://gitee.com/jacksu1/peisomg.git -->

- 微信小程序：
  - appid：<WX_APPID>
  - secret：<WX_SECRET>

- 服务器：<SERVER_HOST> / <SERVER_USER> / <SERVER_PASSWORD>
- MySQL：
  - jdbc：jdbc:mysql://<DB_HOST>:3306/ry-vue?...（详见部署环境变量）
  - username：<DB_USER>
  - password：<DB_PASSWORD>

安全建议：
- 所有敏感信息仅存放于部署环境变量或配置中心，禁止提交到仓库。
- 生产环境与测试环境分离，最小权限访问。

## 2. 角色与用户

- 管理员（平台/运营）：系统配置、价格管理、打印、审批、数据导出。
- 商户（B 端客户，可选角色）：维护其客户/模板/订单的范围化管理与开单。
- 顾客（C 端/微信用户）：小程序快捷登录、浏览商品、下单、查看历史订单、维护个人信息。

> 注：若“商户”与“顾客”为同一业务主体，请在立项时统一术语。本文默认二者有区别。

## 3. 范围与优先级

- 已完成（V1 + 第二版已解决）：
  - 后台：商品管理、顾客管理、订单管理（基础）
  - 微信小程序：快捷登录、查看订单、管理个人信息
  - 前台：展示、购物车选菜、生成订单（购物车纯前端，无表）
  - 报价管理：每日商品报价、历史报价、报价状态字段
  - 订单模板：默认订单、昨日订单模板、一键开单
  - 打印：单个订单模板导出；当日订单合并导出 Excel（多 Sheet）
  - 订单审批：审批后订单才参与后续数据分析
  - 明细生成：从 JSON 明细生成 detail 表

- 待实现（V2 未解决）：
  1. 订单报表行金额：根据是否有重量计算行金额
  2. 定时打印脚本：设计与实施
  3. 今日订单打印：根据字段确定是否参与当日打印

- 非功能性：
  - 目标工期：10-15 天
  - 人天估算：按 120/人天（供预算参考）
  - 安全、性能、可运维性要求见后文

## 4. 详细功能需求

### 4.1 微信小程序（前台）

- 登录
  - 微信快捷登录（openId/unionId 绑定 customer）
  - 登录后查看个人历史订单、修改个人信息（昵称、电话、地址、备注等）
- 商品展示
  - 分类：干菜 | 水菜 | 特殊品类
  - 支持按商品状态、单位、关键词搜索/筛选
  - UI 参考地址：<UI_REFERENCE_URL>（由需求方提供）
- 购物车与下单
  - 购物车纯前端实现，无需数据库表
  - 选择菜品、调整数量、显示合计数量、生成订单
  - 无需计算配送距离/自取逻辑（本期不含）
  - 无需实时计算价格（以下单时后台报价为准）
- 订单
  - 订单列表（今日/历史）、订单详情
  - 从详情页可返回开单页（深链/路由回退）

验收要点：
- 微信授权登录与 customer 绑定成功
- 分类/搜索可用；购物车下单成功，订单可查询
- 返回开单页链路正确

### 4.2 后台管理（若依）

- 顾客管理
  - 增删改查、禁用/启用
  - 维护顾客默认订单模板（可多套）
- 商品管理
  - 基本信息：名称、分类、单位、是否称重（is_weighted）、状态（上/下架）
  - 报价相关：日报价状态、当前价、历史价
- 订单管理
  - 新建订单：从“默认订单/昨日订单模板/历史订单一键开单”
  - 订单明细：从 JSON 明细生成 detail 表；支持删除/增减商品
  - 审批：is_approved 字段，审批后才参与数据分析/打印
  - 今日订单筛选：默认仅展示今日订单；支持“是否参与今日打印”字段控制
  - 模板：
    - 默认订单：状态为 0 的订单视为默认模板（去除数量）
    - 昨日订单模板：保留菜品与报价（去除数量）
    - 一键开单：复制模板商品与价格，生成新订单与明细（新订单 id）
  - 默认打印单：
    - 可将某订单设为默认打印单（通过备注区分）

- 报价管理
  - 每日报价：为商品设置当日报价
  - 未报价规则：当日未报价则回退至最近一次报价
  - 称重商品可不参与报价（is_weighted=1）
  - 字段：
    - daily_quote_status：0 已报价 / 1 未报价 / 3 不参与报价
    - current_price、历史价格表（按日期维度）

- 打印/导出
  - 单个订单导出打印模板（PDF 或 Excel）
  - 当日订单合并导出 Excel（多 Sheet），可按顾客/规则拆分

验收要点：
- 商品/顾客/订单全流程闭环
- 报价管理与回退逻辑正确
- 一键开单生成新订单与明细
- 默认打印单与备注标记生效
- 当日多 Sheet 导出可用

## 5. 数据模型（建议）

说明：现有表包含 customer、good、order_info；购物车无表。以下为建议字段扩展与新表，落地前需与现有结构对齐评审。

- customer（顾客/商户）
  - id, name, wx_openid, wx_unionid, phone, address, remark, status, created_at, updated_at
  - is_merchant（是否商户，若需 B 端隔离）

- good（商品）
  - id, name, category（dry/wet/special）, unit, is_weighted, status
  - daily_quote_status（0/1/3）, current_price, last_quoted_at
  - created_at, updated_at

- good_price_history（历史报价）
  - id, good_id, price, quote_date, source（manual/system）, created_at

- order_info（订单主表）
  - id, customer_id, order_no, order_date
  - source（mini_program/admin/template）
  - template_type（none/default/yesterday）
  - is_template_default（bool）
  - is_yesterday_template（bool）
  - is_approved（bool）
  - participate_today_print（bool）
  - total_amount, remark, status（draft/confirmed/cancelled/finished）
  - created_at, updated_at

- order_detail（订单明细）
  - id, order_id, good_id, good_name, unit, is_weighted
  - quantity, weight（可空）, price, line_amount, remark

- order_detail_json（可选，历史/过渡）
  - id, order_id, payload（json）, created_at

索引建议：
- good_price_history(good_id, quote_date)
- order_info(customer_id, order_date, participate_today_print)
- order_detail(order_id, good_id)

## 6. 业务规则与公式

- 报价回退
  - 当日无报价：取 good_price_history 中最近一次 price 作为 current_price
  - is_weighted=1 的商品可 daily_quote_status=3，不参与日报价
- 行金额计算（V2 待实现建议）
  - 若 is_weighted=1 且 weight > 0：line_amount = price × weight
  - 否则：line_amount = price × quantity
  - 价格保留 2 位，数量/重量保留 3 位，金额四舍五入 2 位
- 模板复制（“一键开单”）
  - 复制模板商品与价格（不带数量），生成新订单与明细；新订单 id 独立
  - “昨日订单模板”：以昨日订单为蓝本（保留菜品与报价，不带数量）
- 今日订单与打印
  - 默认仅展示 order_date=今日
  - 建议参与条件：participate_today_print=true 且 order_date=今日 且 is_approved=true

## 7. 关键流程

- 小程序下单
  1. 微信授权登录 → 绑定/创建 customer
  2. 商品展示/搜索 → 前端购物车
  3. 提交订单 → 后台依据当日/回退报价计算 → 生成 order_info + order_detail
  4. 返回订单号与详情，用户可查询
- 后台开单（模板 → 开单）
  1. 选择顾客 → 开单界面（上：选品与搜索；下：订单明细）
  2. 从“默认/昨日订单”一键开单
  3. 调整明细并审批
  4. 导出/打印
- 报价（每日）
  1. 列出全部商品（可过滤称重）
  2. 批量/单个录入当日报价，更新 current_price、daily_quote_status=0
  3. 未报价商品提示将回退至“最后一次报价”
- 打印导出
  - 单订单：模板导出
  - 当日合并：参与今日打印且已审批的订单 → 按规则多 Sheet 输出

## 8. 接口与页面（概要）

- 小程序 API（示例）
  - POST /api/auth/wx-login
  - GET /api/goods?category=&status=&keyword=
  - POST /api/orders
  - GET /api/orders?scope=today|history
  - GET /api/orders/{id}
  - PUT /api/customers/me

- 后台 API（示例）
  - GET/POST/PUT/DELETE /admin/customers
  - GET/POST/PUT/DELETE /admin/goods
  - GET/POST /admin/goods/price/daily
  - GET /admin/goods/price/history?goodId=&date=
  - POST /admin/orders/template/{customerId}/default|yesterday/open
  - GET/POST/PUT/DELETE /admin/orders
  - PUT /admin/orders/{id}/approve
  - PUT /admin/orders/{id}/participate-print
  - POST /admin/orders/{id}/export
  - GET /admin/orders/export/today?split=sheet-rule

- 后台页面
  - 顾客管理、商品管理、订单管理、报价管理、打印中心、审批工作台、模板中心、打印/定时配置

> 注：具体接口以实际仓库代码为准，本节为需求级草案。

## 9. 打印与导出

- 单订单打印模板
  - 可设置默认打印单（备注区分）
  - 模板要素：抬头（商户/顾客/日期/订单号）、明细（名称/单位/数量/重量/单价/金额/备注）、页眉页脚
  - 导出格式：PDF 或 Excel（至少一种）
- 当日汇总导出（多 Sheet）
  - 过滤：order_date=今日 & participate_today_print=true & is_approved=true
  - Sheet 规则（建议选一）：
    - 按顾客分 Sheet（Sheet 名：顾客名_订单号/时间）
    - 按路线/时段分 Sheet（需新增字段）
  - 统计：每 Sheet 小计 + 总表汇总

## 10. 定时打印（V2）

- 方案建议
  - 后端提供导出接口：/admin/orders/export/today
  - 服务器使用定时任务（如 cron）：
    - 调用导出接口获取 Excel/PDF，保存至指定目录
    - 调用打印服务（通过python脚本调用/内网打印服务）
  - 配置项：
    - 定时表达式、导出参数、打印机名称、份数、纸张/方向、失败重试
  - 监控与告警：日志 + 邮件/群机器人
- 安全
  - 优先内网执行，导出文件设置生命周期与清理策略

## 11. OCR（PP-Structure）

- 目标：手写结构化数据（带数字）识别 → 结构化订单明细
- 流程
  1. 小程序或后台上传图片
  2. 调用 PP-Structure 识别服务（本地或云）
  3. 解析输出 → 字段映射（商品名/单位/数量/重量/价格/备注）
  4. 基于商品库做模糊匹配与纠错（别名/同义词）
  5. 人工校对 UI，确认后生成订单明细
- 留痕
  - 保留原图、识别 JSON、结构化结果与比对日志

## 12. 非功能需求

- 性能
  - 下单 P95 < 500ms（不含大批量模板复制）
  - 当日导出：1k 订单 < 30s（流式生成）
- 安全
  - 微信鉴权、Token 时效与续期、接口权限
  - 配置与密钥不入库不入 Git
- 可用性
  - 日志、错误码、幂等（下单/导出）
- 运维
  - 灰度/回滚、数据备份（每日全量 + binlog）

## 13. 工期与工作量（参考估算）

- 人天单价：120（预算单位）
- 模块估算：
  - 后台商品/顾客/订单管理：1 人天
  - 小程序登录/订单/个人信息：2 人天
  - 前台展示/购物车/下单：2.5 人天
  - 报价与模板（第二版新增）：≤ 5 人天（并行推进）
  - V2 未解决项：2-3 人天
- 目标工期：10-15 天（按时完成奖励）

> 最终以开发评审为准。

## 14. 验收标准

- 小程序
  - 登录绑定成功，不同用户仅能查看各自订单与信息
  - 分类/搜索正常，购物车下单成功
- 后台
  - 报价管理生效，未报价回退正确
  - 模板一键开单成功，生成新订单与明细
  - 审批后方可参与统计与打印
  - 今日订单默认筛选，参与打印字段生效
- 打印
  - 单订单导出正确
  - 当日合并导出多 Sheet 正确，金额/汇总准确
- 金额规则（V2）
  - 称重按重量，不称重按数量，四舍五入规则符合预期

## 15. 风险与依赖

- OCR 与商品库匹配依赖词典与别名维护
- 历史报价数据完整性影响回退逻辑
- 打印环境依赖（驱动、网络权限）
- 一键开单并发场景下的价格冻结与一致性

## 16. 待确认事项

1. “商户”与“顾客”的边界与权限是否区分？是否需要商户多账号？
2. 前台 UI 参考地址与设计稿是否提供？
3. 多 Sheet 导出规则采用“按顾客”或“按路线/时段”？若按路线需新增字段。
4. 审批流是否需要多级与驳回原因记录？
5. 报价是否涉及时段价/客户价/会员价等差异化？（当前无）
6. 打印模板是否有品牌样式与示例？
7. 是否需要发票/对账单（当前未包含）？
8. OCR 的入口（后台/小程序）与人工校对阈值策略？

## 17. 版本规划

- V1.1：报价管理、模板一键开单、默认打印单、当日合并导出
- V1.2（V2）：行金额计算、参与今日打印字段闭环、定时打印
- V1.3：OCR 集成与校验流程完善、审批后订单数据分析

## 18. 附录：字段枚举建议

- good.category：dry（干菜）/ wet（水菜）/ special（特殊）
- good.daily_quote_status：0 已报价 / 1 未报价 / 3 不参与报价
- order_info.status：draft / confirmed / cancelled / finished
- order_info.template_type：none / default / yesterday
- boolean：建议 tinyint(1) 存储（0/1）

---

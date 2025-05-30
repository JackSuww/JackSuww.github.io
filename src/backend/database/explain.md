---
title: SQL 语句执行计划分析
date: 2023-08-23
author: JackSu
categories:
  - 数据库
tags:
  - MySQL
---

## 前言

由于工作中业务比较复杂，一条 SQL 查询语句通常会涉及多个表，加上某些表数据量庞大（百万、甚至千万），SQL 语句的执行效率就成为日常工作中重点关注的方面。同时作为后端开发人员，对 SQL 语句进行优化的能力也是必不可少的。

## Explain 各字段含义

`Explain` 关键字可以查看 SQL 语句（适用 SELECT、INSERT、UPDATE、DELETE）的执行计划，使用命令如下。

```sql
explain select * from user where user_id = 1
```

结果信息中包含一些重要字段，我们先来了解下这些字段分别代表什么含义。

| 字段          | 含义                         | 备注                                                                                                                                                              |
| ------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | 序列标识                     | SQL 执行时从各表读取数据的顺序（常用）                                                                                                                            |
| select_type   | 查询类型                     | SQL 语句的查询类型（常用）                                                                                                                                        |
| table         | 表名                         | SQL 执行时涉及的表信息。可取值：1、表名（例如：user）2、<derived*N*>（N 是 id 值，例如：\<derived4>）3、<union*M*,_N_>（M、N 是 id 值，例如：<union1,2>）（常用） |
| partitions    | 分区信息                     | 如果不涉及分区表，该列值为 NULL。                                                                                                                                 |
| type          | 连接类型                     | 用来衡量 SQL 语句的查询效率（常用）                                                                                                                               |
| possible_keys | SQL 语句可能使用的索引       | 取值可以为一个、多个或者为 NULL（常用）                                                                                                                           |
| key           | SQL 语句实际使用的索引       | 如果为 NULL，则表示未使用索引（常用）                                                                                                                             |
| key_len       | 索引使用的字节数             | 估计值，大致使用的字节数。值越小，索引的效率越高                                                                                                                  |
| ref           | 连接使用的列或常数           | （参考）                                                                                                                                                          |
| rows          | MySQL 估计要读取并检测的行数 | （参考）                                                                                                                                                          |
| filtered      | 表示通过索引过滤的行百分比   | （参考）                                                                                                                                                          |
| Extra         | 附加信息                     | 用来优化 SQL 语句（常用）                                                                                                                                         |

### id

序列号，表示 MySQL 执行 SQL 语句时从各表读取数据的顺序。id 越大，执行优先级越高；id 相同的为一组，执行优先级按照由上到下的循序排列。在复杂的 SQL 语句中可以清晰查看 SQL 的执行顺序。

### select_type

SQL 语句的查询类型。取值如下。

- SIMPLE：简单查询，不涉及子查询和关联查询。
- PRIMARY：主查询（查询中包含子查询，最外层的查询为 PRIMARY）。
- UNION：UNION 之后的查询。
  ```sql
  union (select * from user)
  ```
- DEPENDENT UNION：UNION 之后的查询，但依赖外部查询结果。
- UNION RESULT：UNION 操作的结果。
- SUBQUERY：子查询，通常出现在 select 和 where 语句中
- DEPENDENT SUBQUERY：子查询，但依赖外部查询结果。
- DERIVED：派生表，临时产生的虚拟表（不实际存在于数据库中）。
- DEPENDENT DERIVED：派生表，但依赖外部查询结果。
- MATERIALIZED：物化子查询。
- UNCACHEABLE SUBQUERY：无法缓存结果的子查询，外部查询的每一行都需要子查询重新计算结果。
- UNCACHEABLE UNION：UNION 之后的查询是无法缓存结果的子查询（UNCACHEABLE SUBQUERY）。

### type

连接类型。MySQL 优化器选择的查询方法，用来衡量 SQL 语句的查询效率。效率从高到低，取值如下。

- system：表中只有一行数据。const 类型的特例。
- const：表中最多有一个匹配记录。通常情况下使用了主键索引或唯一索引。
  ```sql
  select * from user where id = 1;  // 主键索引
  select * from user where phone = 'xxx'  // 唯一索引
  ```
- eq_ref：使用主键索引或唯一索引进行联表查询时，最多返回一条符合条件的记录。与 const 类型非常相似，区别是 eq_ef 通常出现在联表的情况下，而 const 通常出现在单表情况下。
  ```sql
  select * from user,role where user.role_id = role.id; // 用户角色一对多的情况
  ```
- ref：使用非唯一索引查找和多表连接，会返回匹配某个单独值的所有行。
  ```sql
  select * from user where name = 'xxx';
  ```
- fulltext：使用 fulltext 索引，没见过。
- ref_or_null：类似 ref，但是包含了搜索 NULL 值的情况。
  ```sql
  select * from user where name = 'xxx' or name is NULL;
  ```
- index_merge：使用了索引合并的优化方法。

  索引合并：对多个索引分别进行条件扫描，然后将它们各自的结果进行合并。

- unique_subquery：在特殊的子查询中用来替换 eq_ref 类型。MySQL 内部优化器的一个标识符，并不是 `Explain` 输出的标准字段。
  ```sql
  value in (SELECT primary_key FROM table WHERE xxx)
  ```
- index_subquery：类似 unique_subquery，但是查询的列是非唯一索引。
  ```sql
  value in (SELECT key_column FROM table WHERE xxx)
  ```
- range：检索给定范围的行。
- index：表示只遍历索引树，不扫描数据行，只从索引树中获取数据。
- ALL：全表扫描，没有使用索引。

### Extra

附加信息，MySQL 执行 SQL 语句的相关信息，是否使用临时表、文件排序等.

**性能好**

- Using index：查询的列被索引覆盖，并且 where 条件满足最左匹配原则。通过索引即可获取所需的数据，检索效率高（覆盖索引，避免回表）。
- Using index Condition：查询的列未被索引覆盖，但 where 条件可以使用到索引。（需要回表查询数据，多个 where 条件时有索引下推优化）
- Using MRR：多范围读取优化，减少磁盘随机访问的次数，提升数据检索的效率。
- Using join buffer：MySQL 使用连接缓冲区来处理查询，优化查询性能。连接缓冲区用于存储连接操作的中间结果。
- Using where Using index：查询的列被索引覆盖，并且 where 条件是索引列之一，但不是索引的前导列。（使用 where 条件过滤结果，又使用了覆盖索引来优化查询性能）

**性能差**

- Distinct：MySQL 执行 distinct 操作过滤结果集中的重复记录，性能较差。

  **优化：可以在入库前做唯一校验，保证数据库记录唯一，避免使用 distinct。**

- Using temporary：MySQL 需要创建一个临时表来处理查询。一般发生在涉及到排序（`order by`）和分组（`group by`）的查询操作中。如果数据量较少，临时表会存放在内存中，数据检索速度尚可。如果数据量很大，内存中存不下，临时表则会存放在磁盘上，数据检索速度很慢。

  **优化：1、为排序和分组字段建立索引。2、加内存，确保临时表能够装载到内存。**

- Using filesort：MySQL 需要对结果集进行排序操作，但无法使用索引，必须在磁盘上创建一个临时文件来完成排序。

  **优化：1、给排序字段添加索引。2、加内存，确保临时文件能够装载到内存。**

- Using where：查询的列未被索引覆盖、where 条件非索引列或 where 条件不是索引的前导列。（没有使用索引，仅使用 where 条件过滤结果）

  **优化：为条件字段建立索引**

## 实战优化思路

了解了 Explain 各个字段的含义和使用，那么如何在实际工作中使用呢？

大部分查询性能差的 SQL 语句都存在索引设计不合理的问题，一个复合索引字段顺序的调整，查询效率就会天差地别。实际工作中具体要如何优化 SQL 语句并无绝对，因为受到业务、表、索引等多方面的影响，每条 SQL 语句优化的方法都不一样，但是大体思路都是差不多的。

1. 判断 SQL 语句是否使用索引（key 列和 type 列）。
2. 确认 SQL 语句的查询类型和连接类型（select_type 列和 type 列），了解优化器选择的查询方法。
3. 查看 Extra 列的附加信息，进一步了解 SQL 语句的执行细节。
4. 配合 id 列和 table 列，了解 SQL 语句的执行流程，分析复杂 SQL 语句时常用。
5. 根据掌握的信息进行优化。索引设计不合理的情况通过添加索引、调整复合索引字段的顺序（保证 where、order by、group by 字段为索引字段）或者使用索引相关命令（`force index`、`ignore index`）的方式基本就可以解决。对于复杂的 SQL 语句有时需要重写，结合实际业务，调整 SQL 语句的执行顺序，利用索引提升查询效率。

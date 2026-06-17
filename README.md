# 宿舍管理系统

基于 Node.js + Python + SQL Server 的高校宿舍管理 Web 系统，支持楼栋管理、宿舍分配、报修、访客登记、卫生检查等功能。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | HTML + CSS + JavaScript |
| 后端 | Node.js (Express) |
| 数据库桥接 | Python (pyodbc) |
| 数据库 | SQL Server |

## 快速开始

### 1. 环境要求

- Node.js（推荐 v18+）
- Python（推荐 3.8+）
- SQL Server（Express 版即可）
- ODBC Driver 18 for SQL Server

### 2. 初始化数据库

用 sqlcmd 执行建库脚本：

```cmd
sqlcmd -S "localhost" -C -i "数据库/宿舍.sql"
```

> 如果你的 SQL Server 是命名实例，把 `localhost` 改成 `localhost\SQLEXPRESS`。

### 3. 启动系统

双击 `start.bat`，脚本会自动检查环境、安装依赖、打开浏览器访问 `http://localhost:3456`。

## 项目结构

```
.../
├── server.js          # Express 后端主程序
├── db.js              # Node.js Python 数据库桥接
├── db_bridge.py       # Python 数据库连接桥
├── start.bat          # 一键启动脚本
├── package.json       # npm 依赖清单
├── public/
│   ├── index.html     # 前端主页面
│   ├── css/style.css  # 样式
│   └── js/app.js      # 前端逻辑
├── 数据库/
│   └── 宿舍.sql       # 建库建表 + 初始数据
├── ER图/              # 数据库设计文档
└── 文档/              # 项目报告
```

## 功能模块

- 登录：学生 / 管理员两种角色
- 楼栋管理：增删改查
- 宿舍管理：按楼栋查看，分配床位
- 学生管理：入住 / 调换 / 退宿
- 报修管理：提交报修 处理 评价
- 访客登记：登记 审核 结束
- 卫生检查：评分（A/B/C/D）
- 统计面板：入住率、待处理事项概览

## 常见问题

### 1. 启动后网页提示 "failed to fetch" / 登录失败

原因：数据库连接不上，通常是 SQL Server 实例名不匹配。

解决：打开 `db_bridge.py`，检查第 6 行 `SERVER=` 的值，改为正确的实例名（如 `localhost\SQLEXPRESS`），重启 `start.bat`。

### 2. 提示 "Python bridge closed" / 服务启动后立即退出

原因：`db.js` 中硬编码的 Python 路径在新电脑上不存在。

解决：打开 `db.js`，把第 4 行改成 `const PYTHON = "python";`

### 3. sqlcmd 无法连接 SQL Server

原因：SQL Server 未启用 TCP/IP 或防火墙阻挡。

解决：
1. 打开 SQL Server 配置管理器 SQL Server 网络配置 启用 TCP/IP
2. 重启 SQL Server 服务
3. 防火墙开放 1433 端口

### 4. pyodbc 连接报错 "命名管道提供程序: 无法打开与 SQL Server 的连接"

原因：实例名错误。默认实例用 `localhost`，命名实例必须写 `localhost\实例名`。

解决：用 Get-Service | Where-Object {$_.Name -like '*SQL*'} 确认实例名。

## 注意事项

- 首次启动时 start.bat 会执行 npm install 和 pip install pyodbc，需要联网
- 从旧电脑拷贝到新电脑时，务必检查 db.js 和 db_bridge.py 中的路径和连接配置
- 数据库使用 Windows 认证，需当前 Windows 用户有 SQL Server 访问权限

## 许可证

仅供学习用途。

---------------------------------------------------------------------------
##2026/06/17
## 修改摘要

### 修复
- db.js: 数据库错误不再静默吞没，修复假报"操作成功"的 bug
- server.js: 学生删除时先清理关联记录(allocation/visitor/repair)，解决外键冲突
- server.js: 分配记录按 allocation_id 降序排列，新增楼栋/宿舍筛选接口
- 触发器: 新增自动安装+DELETE处理，学生入住/调换/休学/退宿/删除均实时更新宿舍人数

### 新增
- server.js: 男女分宿校验，男生不能入住女生楼，反之亦然
- server.js: 卫生检查支持 problem_photo 字段
- server.js: 每次启动自动安装触发器 + 修正宿舍人数
- app.js: 卫生检查表格增加照片列、弹窗增加照片输入框
- app.js: 分配记录页面增加楼栋/宿舍下拉筛选


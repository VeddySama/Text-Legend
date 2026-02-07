# 文字传奇 1.76（网页版文字版）

致敬 1.76 时代的网页文字版游戏，支持 SQLite / MySQL，内置 GM 后台。

## 赞赏

| 支付宝 | 微信 |
| --- | --- |
| <img src="img/zfb.png" alt="alipay" width="260"> | <img src="img/wx.png" alt="wechat" width="260"> |

## 快速启动

支持 SQLite 与 MySQL 两种数据库。

### SQLite

```bash
docker build -t text-legend .
docker run -p 3000:3000 -e DB_CLIENT=sqlite -e DB_FILENAME=/app/data/game.sqlite -e DB_POOL_MAX=1 -e SQLITE_WAL=true -e SQLITE_SYNCHRONOUS=NORMAL -e ADMIN_BOOTSTRAP_SECRET=change_me -e ADMIN_BOOTSTRAP_USER=admin_account -v %cd%/data:/app/data text-legend
```

### Docker Compose

```bash
docker compose up --build
```

### MySQL（Compose）

```bash
docker compose -f docker-compose.mysql.yml up --build
```

## 配置说明

### 数据库

- `DB_CLIENT`：`sqlite` 或 `mysql`
- `DB_FILENAME`：SQLite 文件路径
- `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`：MySQL 连接信息
- `DB_POOL_MAX`：连接池最大连接数（SQLite 建议 1）

### SQLite 优化（仅 SQLite 生效）

- `SQLITE_WAL`：是否启用 WAL（默认 `true`）
- `SQLITE_SYNCHRONOUS`：同步模式（默认 `NORMAL`，可选 `FULL` / `EXTRA`）

### 管理员

- `ADMIN_BOOTSTRAP_SECRET`：初始化 GM 密钥
- `ADMIN_BOOTSTRAP_USER`：需要提升为 GM 的账号

## 玩法与功能（UI 操作）

当前版本主要通过 UI 操作，不提供指令列表。

### 行动面板

- **方向**：点击方向入口移动
- **目标**：点击怪物或玩家目标
- **技能**：点击技能立即释放
- **召唤物**：点击切换召唤物并查看详情
- **自动技能（挂机）**：点击“挂机”按钮选择要自动释放的技能

### 交互与社交

- **队伍/行会**：聊天面板内的“队伍 / 行会 / 邀请 / 创建 / 报名”按钮
- **交易**：聊天面板“交易”按钮，弹出交易面板进行物品/金币交换
- **查看玩家**：点击玩家列表项可观察、邀请组队或发起交易

### 功能面板

- **背包**：打开背包、按类别筛选、使用/装备/出售物品
- **商店**：购买与出售（支持一键出售）
- **行会/队伍**：查看成员、邀请、退出
- **沙巴克**：报名、查看沙巴克信息
- **VIP**：激活与领取（按钮在右侧操作区）

## 安卓客户端（原生）

已提供一个原生安卓客户端（Kotlin + Jetpack Compose），通过现有 HTTP / Socket API 连接服务器，功能与网页端一致（不含 GM 功能）。

### 构建

1. 用 Android Studio 打开 `android` 目录  
2. 等待 Gradle 同步完成  
3. 运行 `app` 模块

### GitHub Actions 打包 APK

已提供工作流：`.github/workflows/android-apk.yml`  
触发方式：推送 `android/**` 或手动 `workflow_dispatch`。

构建产物会上传为 `app-release-apk`，路径：

`android/app/build/outputs/apk/release/app-release.apk`

### 自动签名（GitHub Secrets）

已提供 keystore 生成工作流：`.github/workflows/android-keystore.yml`  
运行后下载 `android-keystore` artifact，里面包含：

- `keystore_base64.txt`
- `store_password.txt`
- `key_password.txt`
- `key_alias.txt`

将以上内容分别写入仓库 Secrets：

- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

之后执行 APK 打包工作流会自动签名。

### 连接服务器

首次启动会提示输入服务器地址：

- 默认：`https://cq.071717.xyz/`
- 模拟器本地调试：`http://10.0.2.2:3000/`
- 真机局域网：`http://192.168.1.10:3000/`

## GM 后台

访问：`http://localhost:3000/admin/`

首次配置 GM（任选其一）：
1) 注册一个普通账号  
2) 在容器环境变量中设置 `ADMIN_BOOTSTRAP_SECRET` 和 `ADMIN_BOOTSTRAP_USER`  
3) 启动服务后自动设置 GM  

或调用 `/admin/bootstrap` 传入 `secret` 和 `username`。

后台支持：
- 用户/权限管理
- 角色修改
- 站内邮件
- VIP 激活码与自助激活开关
- 掉落日志开关
- 数据备份与导入

# 自动备份功能说明

## 功能概述

系统已配置每日凌晨 0 点自动备份功能，自动备份数据库到 `data/backup` 目录。

## 备份策略

- **备份时间**: 每天凌晨 0 点自动执行
- **备份目录**: `data/backup`
- **保留天数**: 30 天（自动删除超过 30 天的旧备份）
- **备份格式**: JSON 文件，包含完整的数据库数据
- **文件命名**: `text-legend-backup-YYYY-MM-DD-HH-MM-SS.json`

## 备份内容

备份包含以下表的数据：
- realms (服务器区)
- users (用户)
- sessions (会话)
- characters (角色)
- guilds (行会)
- guild_members (行会成员)
- sabak_state (沙巴克状态)
- sabak_registrations (沙巴克报名)
- mails (邮件)
- vip_codes (VIP码)
- game_settings (游戏设置)
- mob_respawns (怪物重生)
- consignments (寄售物品)
- consignment_history (寄售历史)

## 备份清理规则

1. **同日备份清理**: 每次备份后，会删除同一天的其他备份文件，只保留最新的
2. **超期备份清理**: 自动删除超过 30 天的备份文件

## 手动备份

除了自动备份外，管理员还可以通过 GM 后台手动导出备份：

1. 登录 GM 后台
2. 点击"数据备份"选项
3. 点击"导出备份"按钮
4. 备份文件将自动下载

## 恢复备份

如需恢复备份，请使用 GM 后台的"数据导入"功能：

1. 登录 GM 后台
2. 点击"数据备份"选项
3. 上传备份 JSON 文件
4. 点击"导入"按钮

**注意**: 导入前请确保没有在线玩家，导入后会强制所有玩家下线。

## 日志

自动备份的执行情况会记录在服务器日志中：

```
[AutoBackup] 已设置每日0点自动备份，备份目录: data/backup，保留30天
[AutoBackup] 开始执行自动备份...
[AutoBackup] 创建备份目录: data/backup
[AutoBackup] 备份完成: text-legend-backup-2026-01-30-00-00-00.json
[AutoBackup] 清理完成，删除了 2 个旧备份文件
[AutoBackup] 清理同日备份完成，删除了 1 个旧备份
[AutoBackup] 自动备份执行成功
```

## 首次使用

1. 安装依赖: `npm install`
2. 启动服务器: `npm start`
3. 自动备份定时任务会自动启动
4. 备份目录会在首次备份时自动创建

## 注意事项

- 确保 `data` 目录有写入权限
- 备份文件可能会占用较大磁盘空间，建议定期检查磁盘空间
- 恢复备份前，建议先备份当前数据库
- 恢复操作不可逆，请谨慎操作

## 数据备份与导入

后台支持下载备份与导入 JSON 数据，SQLite 与 MySQL 可互相导入。  
注意：导入会覆盖当前全部数据，建议停服或确保无在线玩家。

## 后台 API（节选）

所有接口都需要 `Authorization: Bearer <admin-token>`。

### 掉落日志开关

```http
GET  /admin/loot-log-status
POST /admin/loot-log-toggle   body: { "enabled": true|false }
```

### 备份与导入

```http
GET  /admin/backup
POST /admin/import            body: 备份 JSON
```

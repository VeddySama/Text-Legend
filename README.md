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

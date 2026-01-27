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

## 玩法与功能

- 功能界面：聊天面板、交易面板、商店弹窗（购买/出售）、修炼面板、在线人数、沙巴克加成提示
- 行会：创建行会需要 `woma_horn`（沃玛号角），沙巴克报名需要会长操作

## 指令说明

在聊天输入框直接输入指令即可（大小写不敏感）。

### 基础与移动

| 指令 | 说明 | 示例 |
| --- | --- | --- |
| `help` | 帮助 | `help` |
| `look` | 查看当前房间 | `look` |
| `go <方向>` / `move <方向>` | 移动 | `go north` |
| `go <房间名>` | 按房间名移动 | `go 土城` |
| `goto_room <区:房间>` | 传送至 BOSS 房间 | `goto_room bq_boss:boss` |
| `goto <玩家>` | 跟随玩家位置 | `goto 张三` |
| `say <内容>` | 房间聊天 | `say 大家好` |
| `who` | 查看在线玩家 | `who` |

### 战斗与技能

| 指令 | 说明 | 示例 |
| --- | --- | --- |
| `attack <怪物/玩家>` / `kill <怪物>` | 普通攻击 | `attack 半兽人` |
| `pk <玩家>` | PK 玩家 | `pk 张三` |
| `cast <技能> <目标>` | 施放技能 | `cast 治愈术` / `cast 火球 祖玛卫士` |
| `autoskill <技能>` | 自动技能 | `autoskill halfmoon` |
| `autoskill all/off` | 自动技能开关 | `autoskill all` / `autoskill off` |
| `autopotion <hp%> <mp%>` | 自动喝药 | `autopotion 40 30` |

### 物品与养成

| 指令 | 说明 | 示例 |
| --- | --- | --- |
| `bag` | 查看背包 | `bag` |
| `use <物品>` | 使用物品 | `use 回城卷` |
| `equip <物品>` | 装备 | `equip 炼狱` |
| `unequip <部位>` | 卸下装备 | `unequip weapon` |
| `buy <物品> [数量]` | 购买 | `buy 小红药 10` |
| `sell <物品> [数量]` | 出售 | `sell 小红药 10` |
| `sell_bulk <类型>` | 批量出售 | `sell_bulk consumable` |
| `shop` | 查看商店 | `shop` |
| `repair` | 修理装备 | `repair` |
| `forge <材料>` | 锻造 | `forge ring` |
| `consign <物品> <价格> [数量]` | 寄售 | `consign 裁决之杖 500000` |
| `train <属性>` | 修炼属性 | `train atk` |
| `rest` | 休息恢复 | `rest` |

### 社交与系统

| 指令 | 说明 | 示例 |
| --- | --- | --- |
| `stats` | 查看角色属性 | `stats` |
| `observe <玩家>` / `inspect <玩家>` | 观察玩家 | `observe 张三` |
| `party <子命令>` | 队伍 | `party invite 张三` |
| `guild <子命令>` | 行会 | `guild create 行会名` |
| `gsay <内容>` | 行会聊天 | `gsay 集合` |
| `mail <子命令>` | 邮件 | `mail` |
| `trade <玩家>` | 交易 | `trade 张三` |
| `vip <子命令>` | VIP | `vip activate CODE` |
| `vipclaim` | 领取 VIP 奖励 | `vipclaim` |
| `sabak <子命令>` | 沙巴克相关 | `sabak info` |

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

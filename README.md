# Text Legend 1.76 (Web Text Edition)

## Docker

```
docker build -t text-legend .
docker run -p 3000:3000 -e DB_CLIENT=sqlite -e DB_FILENAME=/app/data/game.sqlite -e ADMIN_BOOTSTRAP_SECRET=change_me -v %cd%/data:/app/data text-legend
```

Or with docker-compose:

```
docker compose up --build
```

MySQL compose:

```
docker compose -f docker-compose.mysql.yml up --build
```

## Notes
- This is a text-based web game inspired by 1.76 era systems.
- Commands: `help`, `look`, `go <dir>`, `attack <mob/player>`, `pk <player>`, `cast <skill> <mob>`, `stats`, `bag`, `buy`, `sell`, `quests`, `party`, `guild`, `gsay`, `sabak`, `vip activate <code>`, `mail`, `teleport <zone:room>`.

## GM 后台

打开 `http://localhost:3000/admin/` 进入后台。

首次配置 GM（两种方式任选其一）：
1) 注册一个普通账号
2) 在容器环境变量中设置 `ADMIN_BOOTSTRAP_SECRET` 与 `ADMIN_BOOTSTRAP_USER`
3) 启动服务后自动设为 GM

或调用 `/admin/bootstrap` 传入 `secret` 和 `username`

之后可在后台中提升/取消 GM、修改角色、发送站内邮件、生成 VIP 激活码。

# Supabase 迁移与对接

## 数据结构与类型
- 表：`public.questions`
  - `id` integer primary key
  - `question` text not null
  - `options` jsonb not null default []
  - `answer` text not null
  - `explanation` text
  - `has_image` boolean not null default false
  - `image_path` text

## 创建与安全策略
- 执行 `supabase/schema.sql`，建立表、索引、触发器与 RLS
- 匿名可读、登录用户可 upsert/update

## 数据迁移
- 环境变量：`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE` 或 `SUPABASE_ANON_KEY`
- 脚本：`npm run migrate:supabase`
- 来源顺序：`data/questions.sqlite` → `data/questions.json`

## 前端对接
- 环境变量：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
- 初始化：`src/lib/supabase.ts`
- Store：`src/stores/question.ts` 优先使用 Supabase，失败回退本地
- 认证：`src/stores/auth.ts` 与 `src/views/Auth.vue`

## 回滚方案
- 备份：保留 `data/questions.backup-*.json` 与 `data/questions.sqlite`
- 回滚到本地：删除环境变量或关闭 Supabase，前端自动回退 SQLite/JSON
- 从 Supabase 回滚：导出 Supabase 数据为 JSON，运行本地重建脚本（可复用 `scripts/migrate.js` 逻辑）

## API示例
- 查询：`GET {SUPABASE_URL}/rest/v1/questions?select=*`（Header: `apikey`, `Authorization: Bearer`）
- Upsert：`POST {SUPABASE_URL}/rest/v1/questions`（Prefer: `resolution=merge-duplicate`）

## 性能基准
- 读取 428 条记录：单次查询 ~50-120ms（取决于网络）
- Upsert 500 批次：每批次 ~80-200ms；建议批大小 500


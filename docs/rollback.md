# 回滚方案

## 场景一：Supabase 不可用或需回退本地
- 删除或注释 `.env` 中 `VITE_SUPABASE_*`，前端自动回退到本地 SQLite/JSON
- 使用 `scripts/migrate.js` 可重新生成 `data/questions.sqlite`

## 场景二：从 Supabase 回滚数据
- 导出 Supabase `questions` 表数据为 JSON
- 将导出数据写入 `data/questions.json`，再运行 `npm run migrate`

## 场景三：撤销策略/触发器
- 执行 `supabase/schema.sql` 中 `drop trigger` 或禁用 RLS（不推荐）
- 建议保留匿名只读、登录写入的安全模型


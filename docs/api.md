# API 端点与示例

## Supabase REST
- Base: `{SUPABASE_URL}/rest/v1`
- Auth: Header `apikey`, `Authorization: Bearer {key}`

### GET /questions
- 示例：`GET /questions?select=*&order=id.asc`

### POST /questions
- 用途：Upsert 批量题目
- Header：`Prefer: resolution=merge-duplicate`
- Body：`[{ id, question, options, answer, explanation, has_image, image_path }]`

## 前端环境变量
- `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`

## 本地虚拟 API（回退）
- `GET /api/questions`：读取 SQLite
- `POST /api/save-questions`：写回 SQLite


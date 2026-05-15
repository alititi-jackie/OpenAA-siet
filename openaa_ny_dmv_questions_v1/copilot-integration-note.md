# Copilot 接入说明：OpenAA DMV 题库 V1

建议页面路径：`/dmv/ny/practice`。

建议数据位置：
- `data/dmv/openaa-ny-dmv-questions-v1.json` 或
- `public/data/dmv/openaa-ny-dmv-questions-v1.min.json`

每题字段：
```ts
type DmvQuestion = {
  id: number
  category: string
  question: string
  image: string
  options: string[]
  answerIndex: number
  answerText: string
  explanation: string
  reference: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}
```

第一版功能：练习模式、模拟考试、查看题库、随机/顺序、题数选择、倒计时、自动判分、错题重做、localStorage 保存错题。

不要新增 Supabase 表，不要求登录，不保存用户答题记录到服务器。

页面必须显示免责声明：本题库为 OpenAA 根据纽约 DMV Driver’s Manual 常见知识点整理，仅供学习参考。实际考试内容、题型和规则请以 New York DMV 官方资料为准。

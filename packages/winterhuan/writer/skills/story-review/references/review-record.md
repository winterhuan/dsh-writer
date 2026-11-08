# 审稿记录

本地正文审查把结论保存到书内 `.story/reviews/`，让作者在侧栏查看问题和处理状态。记录不修改正文、设定、大纲或追踪，也不增加章节提交门槛。粘贴在对话中的文本没有本地正文路径时，只在回答里交付报告，不伪造文件记录。

## 开审前固定正文版本

在首次读稿或派 reviewer 前，为每个正文文件计算原始字节 SHA-256 并保存；将这个摘要与对应正文路径交给审稿任务。可用 Python 3：

```sh
python3 -c 'import hashlib,pathlib,sys; print(hashlib.sha256(pathlib.Path(sys.argv[1]).read_bytes()).hexdigest())' "<正文绝对路径>"
```

行号必须是原文件的 1 起行号，不能删除空行后编号。多章按文件分别记录。任务期间正文变化时，本轮结论对应的是旧稿；先报告发生变化，再审当前稿，不在结束时重算摘要来套用旧结论。

## 保存实际结论

审查完成后，主会话把综合 findings 映射成 JSON，临时输入放在书内 `.story/work/`。S1/S2 对应 `must`，S3 对应 `suggestion`，S4 对应 `optional`。`mode` 写实际完成的 `full`、`lean` 或 `solo`，降级后不得保留请求模式。每个 finding 包含本次稳定的 ID、原文行号和该行中的准确引用。

```json
{
  "body_sha256": "开审前保存的摘要",
  "mode": "solo",
  "summary": "本章主要问题与审查范围",
  "findings": [
    {
      "id": "R1",
      "severity": "must",
      "line": 12,
      "quote": "该行准确原文",
      "explanation": "这处给读者造成的具体问题",
      "suggestion": "最小修改建议"
    }
  ]
}
```

没有发现时 `findings` 为空数组；需要人工核实但没有当前正文证据的疑问写进报告限制，不伪造引用。然后执行：

```sh
python3 "<story-review目录>/scripts/review_record.py" record --project "<书目录>" --file "正文/第001章.md" --chapter 1 --input "<输入JSON>"
```

短篇使用 `--file 正文.md` 并省略 `--chapter`。工具验证正文摘要、行号和引文，成功返回记录路径；失败时先解释错误，不宣称记录已保存。正文中途变化需要重审；纯输入格式问题可以修正输入再提交。审查多个文件时逐文件保存，仅将实际成功的记录算作已落盘。

## 后续处理

`status --project "<书目录>" --file "<正文相对路径>" [--chapter N]` 检查记录是否仍对应当前正文。正文改动后旧记录显示过期，需重新审稿；不要自动清除旧问题或沿用旧的「已处理」。

作者明确接受问题时，或审查者依据当前原文撤销/确认解决时，用 `resolve` 保留处理理由：

```sh
python3 "<story-review目录>/scripts/review_record.py" resolve --project "<书目录>" --file "正文/第001章.md" --chapter 1 --id R1 --resolution accepted --reason "作者接受此处安排" --body-sha256 "<当前审稿摘要>"
```

`accepted` 表示作者接受，`resolved` 表示审查者已核实不需继续处理；不能只为清空数量而标记。正文变化后的旧记录不可处理，先重审。修改正文仍须沿用作者本轮的改稿授权。

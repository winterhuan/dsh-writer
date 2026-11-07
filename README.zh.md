# @winterhuan/dsh-writer

[English](README.md) | 中文

为 DSH 提供写作模式、oh-story 技能和写作工作区侧栏。

[插件说明](packages/winterhuan/writer/README.zh.md) · [发布包](https://github.com/winterhuan/dsh-writer/releases/download/v0.1.0/winterhuan-dsh-writer-0.1.0.tgz)

通过 Release 地址安装到 DSH profile 时使用 pnpm 10.28.0；pnpm 11 可能报 `MISSING_TARBALL_INTEGRITY`。仓库构建使用 pnpm 11.7.0。

默认使用 Node 24，也兼容 Node 22.19 及以上；pnpm 版本为 11.7.0。

```sh
git clone https://github.com/winterhuan/dsh-writer.git
cd dsh-writer
git submodule update --init
pnpm install
pnpm run typecheck
pnpm run build
pnpm test
```

upstream 子模块提供客户端测试源码。构建使用发布版 DSH 依赖。插件源码位于 `packages/winterhuan/writer`。

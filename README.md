# @winterhuan/dsh-writer

English | [中文](README.zh.md)

Thin DSH writing mode that mounts oh-story skills and a Dashboard-aligned workspace sidebar.

[Plugin documentation](packages/winterhuan/writer/README.md) · [Release package](https://github.com/winterhuan/dsh-writer/releases/download/v0.1.0/winterhuan-dsh-writer-0.1.0.tgz)

Use pnpm 10.28.0 to install Release URLs into DSH profiles; pnpm 11 can reject them with `MISSING_TARBALL_INTEGRITY`. Repository builds use pnpm 11.7.0.

Use Node 24 (default) or Node 22.19 and later, with pnpm 11.7.0.

```sh
git clone https://github.com/winterhuan/dsh-writer.git
cd dsh-writer
git submodule update --init
pnpm install
pnpm run typecheck
pnpm run build
pnpm test
```

The upstream submodule supplies client test sources. Builds use the published DSH dependencies. The plugin source is in `packages/winterhuan/writer`.

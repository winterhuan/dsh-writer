# @winterhuan/dsh-writer

English | [中文](README.zh.md)

Thin DSH writing mode that mounts oh-story skills and a Dashboard-aligned workspace sidebar.

[Plugin documentation](packages/winterhuan/writer/README.md) · [Release package](https://github.com/winterhuan/dsh-writer/releases/download/v0.1.10/winterhuan-dsh-writer-0.1.10.tgz)

For DSH `0.2.2-rc.1`, enable Custom plugin market and add `https://winterhuan.github.io/dsh-creative/index.json` in Discover. Alternatively, install the prebuilt Git version with pnpm 11.7.0:

```sh
dsh plugin --profile market add 'git+https://github.com/winterhuan/dsh-writer.git#v0.1.10&path:/packages/winterhuan/writer'
```

Replace `market` with the name of your existing DSH profile.

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

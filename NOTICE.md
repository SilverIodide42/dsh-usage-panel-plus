# NOTICE

This repository is a **fork and independent continuation** of
[`HaoyueQin/dsh-usage-statistics-panel`](https://github.com/HaoyueQin/dsh-usage-statistics-panel)
v0.3.4 by **HaoyueQin**, licensed under the MIT License.

- [LICENSE](LICENSE) carries the **unmodified MIT text** with the upstream
  copyright notice, so automated license detection classifies this repository
  as MIT (an appended rider made GitHub report `NOASSERTION`). Per the MIT
  terms, that notice applies to the original portions of this repository and is
  included in all copies and substantial portions of the Software.
- The derivative relationship, and the copyright in the modifications
  (© 2026 SilverIodide42), are stated **here** rather than inside `LICENSE`
  precisely so the licence file stays machine-classifiable.
- The modifications in this repository are offered under the MIT License, on
  the same terms, without any additional restrictions.
- This project is **not affiliated with, endorsed by, or maintained by** the
  upstream author.
- It is published as a **separate plugin** under its own identity:
  `dsh-usage-panel-plus@0.1.1`, bundle id
  `dsh-external/dsh-usage-panel-plus`, route prefix `/usage-panel-plus/api`,
  storage domain `usage_panel_plus`, and panel id `usage-panel-plus`. It is
  **not** a release or an upgrade of the upstream package, does not share the
  upstream's data or route namespace, and can be installed alongside it.

## Upstream source

The baseline source was obtained from the upstream `v0.3.4` tag
(`https://codeload.github.com/HaoyueQin/dsh-usage-statistics-panel/zip/refs/tags/v0.3.4`)
and is byte-identical to the upstream npm package's `src/` (modulo CRLF/LF
line endings). Before any modification, the local `tsdown` toolchain was used
to reproduce `lib/client.js`, `lib/client-registry.js` and `lib/index.js`
with SHA-256 hashes identical to the published 0.3.4 artifacts, establishing
that the build is reproducible rather than a hand-edited bundle.

## What changed for the standalone release

On top of the functional enhancements listed in
[docs/ENHANCEMENTS.md](docs/ENHANCEMENTS.md), every runtime identifier was
renamed so this plugin no longer collides with its upstream: the package name
and version, plugin/bundle id, cordis fiber id, web route prefix, storage
domain, locale namespace, panel/slot keys, localStorage keys, CSS attribute
names and client-bundle registration ids. The `0.1.1` version is this
project's own first release, not a continuation of the upstream version
series.

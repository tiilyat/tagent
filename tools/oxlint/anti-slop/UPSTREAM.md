# Upstream

- Source: https://github.com/dmmulroy/anti-slop, `skills/install-anti-slop/assets/anti-slop`
- Commit: `13909c9e07590f5a85d93c62712259fe14a883f7`
- The files are a copy of that directory. No file is changed.

## Installed paths

- `tools/oxlint/anti-slop/index.ts`: the generic rules. `.oxlintrc.json` registers them as the `anti-slop` plugin.
- `tools/oxlint/anti-slop/effect/index.ts`: the Effect rules. `.oxlintrc.json` registers them as the `anti-slop-effect` plugin.
- `tools/oxlint/anti-slop/vendor/eslint-stylistic/`: the padding-line logic from ESLint Stylistic, with its `LICENSE` and `UPSTREAM.md`.

## Dependencies

- `@oxlint/plugins` must have the same version as `oxlint`. `package.json` pins the two packages to one exact version.

## Deviations

- None. All rules are set to `error`.

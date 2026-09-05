# Development toolchain update

Vite 5.4.21 and its esbuild dependency matched published development-server
advisories. This update uses Vite 6.4.3 and esbuild 0.25.12, with the existing
React and single-file plugins accepting Vite 6. The application remains a static
site; these audit findings do not establish a compromise of the built page.

The Vite maintainer lists 6.4.3 as patched for
[GHSA-fx2h-pf6j-xcff](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff).
The [Vite 5 to 6 migration guide](https://v6.vite.dev/guide/migration) was checked
against this app's small React/single-file configuration. No custom SSR, Sass,
resolve conditions or runtime API migration was needed.

Validation uses a fresh npm install from the lockfile, engine tests, strict
TypeScript and the production build with both content gates, plus the full
dependency audit. Node 22 is configured in the new GitHub workflow. The optional
maintainer mirror is not written in CI. A local browser smoke check exercised the
built scene feed, local demo vote/waitlist, director controls and a timed clip.
The review fixture blocked external font/network loading, so it does not prove
third-party font delivery, live show services, account voting or signup delivery.

All dependency groups audited clean at the review checkpoint. An audit is a
check against currently published advisories, not a guarantee of no defects.

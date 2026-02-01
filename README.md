# Archived Abandoned JS version of the PPC Software

There are MORE hours of fighting the tooling than actual programming in this project. I spent about 5 full days with just solving problems caused by the infrastructure around JS. Programming is not fun this way.

If you just play by the book, creating an application with npm create smth and then  edit your files to make pages.... you will be fine. But if you (like me) think of a certain architecture you want to build things just seem to fall apart everywhere. So it's not just "JS tooling is bad" but it's very much incompatible with how I want to do things.

This is the error which finally broke me and made me switch to Rust (which aparently also has full stack SSR web frameworks ((Leptos)[https://leptos.dev/], (Dioxus)[https://dioxuslabs.com/])). It is because: I want to be able to declare routes in the individual parts of the application. Routes however have to be declared at bundle time. (so what i already hate is that some code (the one describing the routes) of the part runs at bundle time...) so the part's main js file is imported during bundle time, but also contains runtime code. So somehow (and i have spent >2h but couldn't even figure out what causes this import) vite when reading the vite.config.ts file tries to import some ui part, which imports @/ui... which fails because the @/ui alias is define in this vite.config.js.
```
failed to load config from /home/me/work/ppc/vite.config.ts
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/ui' imported from /home/me/work/ppc/node_modules/.vite-temp/vite.config.ts.timestamp-1769938989639-9d36d88d26734.mjs
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:266:9)
    at packageResolve (node:internal/modules/esm/resolve:767:81)
    at moduleResolve (node:internal/modules/esm/resolve:853:18)
    at defaultResolve (node:internal/modules/esm/resolve:983:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///home/me/work/ppc/node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/dist/esm/index.mjs?1769938988022:2:3744)
    at resolveDirectory (file:///home/me/work/ppc/node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/dist/esm/index.mjs?1769938988022:2:4243)
    at resolveTsPaths (file:///home/me/work/ppc/node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/dist/esm/index.mjs?1769938988022:2:4984)
    at resolve (file:///home/me/work/ppc/node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/dist/esm/index.mjs?1769938988022:2:5361)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
Failed running './apps/server.ts'. Waiting for file changes before restarting...
```

PPC is now developed as part of the [MiZe](https://mize.works) repository in Rust.


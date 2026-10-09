# Deploy Afritrace to Vercel

## One-click (dashboard)

1. Open [vercel.com/new](https://vercel.com/new)
2. Import **GitHub → importantpapi/afritrace**
3. Framework Preset: **Other**
4. Root Directory: leave as `.`
5. Click **Deploy**

You will get a public URL like:

```
https://afritrace-xxxx.vercel.app
```

## CLI

```bash
git clone https://github.com/importantpapi/afritrace.git
cd afritrace
npx vercel --yes
```

## After deploy

- Landing page: `/`
- Full interactive UI: push `app.html` from your local copy if not yet on main, then visit `/app.html`

Local full UI path (in the build environment):

```
/home/workdir/artifacts/cbam-platform/index.html
```

## Repo

https://github.com/importantpapi/afritrace

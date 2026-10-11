# Deployment to hebert.phd

Every push to `main` in `bearlyachemist/electronics_learning` runs
`.github/workflows/deploy-electronics.yml`. You can also run it manually from
the repository's Actions tab, selecting the `main` branch.

The workflow installs dependencies from the lockfile, runs the numerical tests
and TypeScript check, builds for `/electronics`, and verifies every page's local
links, assets, schematic connections and the new chapters' critical feedback
topologies and practice math. Only after those checks pass does it replace
`public/electronics` in `bearlyachemist/hebert.phd` and push a commit to that
repository's `main` branch. The existing Cloudflare Pages integration deploys
that commit. Identical output produces no host commit.

The homepage source, links, and build configuration are unchanged. The notebook
is available at https://hebert.phd/electronics/.

## Repository credential

`electronics_learning` stores a dedicated private SSH key as the encrypted
Actions secret `HEBERT_PHD_DEPLOY_KEY`. Its matching public key is registered as
the write-enabled deploy key `electronics_learning main deployment` on
`hebert.phd`. It grants access to that one repository, rather than using a
personal account token. The workflow stages only `public/electronics`.

The workflow runs only on the trusted `main` branch and does not run for pull
requests. Actions are pinned to commit hashes. The source repository's
`GITHUB_TOKEN` has only `contents: read`; it does not authorize writes to the
host repository.

To replace the credential, generate a new dedicated Ed25519 key, register its
public key on the host repository with write access, update the encrypted secret
in the notebook repository, and remove the old deploy key. Do not commit private
keys or reuse your personal SSH key for this workflow.

## Checking a deployment

The notebook repository's Actions tab shows the build and sync result. The
resulting host commit includes the source commit's short SHA. Its Cloudflare
Pages check confirms when the public site has finished deploying. A failed build
does not change the live site; fix the failing check and push again. A host push
rejected because `hebert.phd/main` changed during the run can be retried using
the workflow's manual trigger.

## Manual publishing

From this repository, with a clean, current hebert.phd checkout beside it:

```sh
npm test
npm run build:hosted
npm run check:hosted
npm run check:schematics
npm run check:advanced
npm run check:synthesis
git -C ../hebert.phd pull --ff-only
node scripts/stage-hosted.mjs ../hebert.phd
git -C ../hebert.phd add -- public/electronics
git -C ../hebert.phd commit -m 'Update electronics notebook'
git -C ../hebert.phd push origin main
```

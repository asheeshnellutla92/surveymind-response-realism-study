# Publishing to YouTube

**There is no YouTube publisher in this repository, and that is deliberate.**

`brutalist.art` renders and stages video. It stops at a staged 4K master with a QC record.
Everything after that — OAuth credentials, upload code, the ledger of what has already been
published — lives in a *private sibling folder* that is never pushed anywhere.

This page tells you how to build your own.

## Why the split

An uploader needs a long-lived OAuth refresh token for your YouTube channel. Anyone holding
that token can upload to, and delete from, your channel. It does not belong in a public repo,
and it does not belong in a repo that *might* become public later — because a secret that has
ever been committed is in the history forever, whether or not you delete the file afterwards.

Keeping the publisher in a separate folder means the mistake is structurally impossible rather
than something you have to remember not to make.

```
parent-directory/
├── brutalist.art/     ← this repo. public. renders, stages, never uploads.
└── brutalist.yt/      ← yours. private, local-only git, no remote. uploads.
```

Same parent, never nested. Nesting is how a private folder ends up inside a public repo's
working tree.

## The handoff contract

`brutalist.art` ends its job by staging a master:

```
youtube/TOPOST/<reel-slug>.mp4
youtube/TOPOST/<reel-slug>.staged.json
```

`staged.json` is the QC record, and it is what makes the handoff safe. A publisher should
**refuse any file that does not carry a passing record**:

| field | required value |
|---|---|
| `resolution` | `3840x2160` |
| `all_beats_4k` | `true` |
| `markers_clean` | `true` |
| `gate_t` | `pass` |
| `status` | `staged` |

That check is the whole point of the contract. Without it, a publisher will happily upload a
720p preview cut with debug markers burned in, and you will find out from a viewer.

## Four rules worth keeping

**Dry run is the default.** Every entry point defaults to dry-run. A real upload takes an
explicit, differently-named command. This is not caution theatre — the failure mode of an
upload script is public, permanent, and attached to your name.

**Unlisted is the default privacy.** `public` is a deliberate act, never a default value.

**Keep a ledger, and write to it immediately.** Record `slug → {video_id, playlist, date,
privacy}` after *each* successful upload, not at the end of a batch. If the run dies halfway,
the ledger is what stops the retry from double-posting the first half.

**Uploads are expensive in quota.** The YouTube Data API v3 default is 10,000 units per day
and an upload costs roughly 1,600 — about six videos before you are cut off until the quota
resets. Handle the quota error explicitly and say what it means, or the batch will fail at
video seven with something unhelpful.

## Build your own — paste into Claude Code

Run this from the parent directory of your `brutalist.art` clone.

```
Build `brutalist.yt`, a private publish-side companion folder, as a SIBLING of my brutalist.art
clone. Same parent directory. Never nested inside it.

HARD RULES
1. brutalist.art is public. Nothing secret ever enters it. If you find upload code, credentials,
   a TOPOST folder or a publish log inside it, MOVE them out and STOP to tell me before touching
   its git history or committing anything.
2. brutalist.yt gets `git init` with NO REMOTE. Its .gitignore excludes credentials/, *.mp4,
   *.mp3 from the first commit.
3. Upload is never automatic. Dry-run is the default. Default privacy is unlisted, never public.
4. Publish only masters carrying a passing staged.json (resolution 3840x2160, all_beats_4k true,
   markers_clean true, gate_t pass, status staged). Refuse anything else, loudly.

LAYOUT
  brutalist.yt/
    README.md  .gitignore  yt  config.json  requirements.txt
    skills/upload/youtube-publisher/{SKILL.md,scripts/publish_playlist.py}
    credentials/<channel>/{README.md,client_secret.json,youtube_token.json,youtube_publish_ledger.json}
    TOPOST/          PUBLISH-LOG.md

config.json: {"brutalist_art": "../brutalist.art", "channel": "<channel>", "default_privacy": "unlisted"}

publish_playlist.py CLI:
  publish_playlist.py <reel...> --playlist NAME --channel C --privacy unlisted
    --client credentials/C/client_secret.json --token credentials/C/youtube_token.json
    --ledger credentials/C/youtube_publish_ledger.json [--dry-run]
  YouTube Data API v3 via google-api-python-client + google-auth-oauthlib.
  Scopes: youtube.upload, youtube. Resumable uploads. Ledger written after EACH upload.
  --dry-run validates the cached token and prints resolved files, order, and target playlist
  WITHOUT any write call to YouTube. (You cannot request a narrower scope at call time — the
  scope is fixed when the token is granted, so a dry run is "make no write calls", not
  "authenticate read-only".)
  On quota errors, say plainly that uploads cost ~1600 units against a 10,000/day default.

./yt wrapper: doctor | pull <reel> | dry <reel...> --playlist N | publish <reel...> --playlist N | log
  dry and publish fill --client/--token/--ledger/--channel from config.json.
  publish asks for confirmation, then appends a session block to PUBLISH-LOG.md.

Do NOT invent placeholder credentials. If client_secret.json is missing, scaffold everything
else, run ./yt doctor, and stop with instructions for me to create it.
```

## OAuth, once per machine

1. Google Cloud Console → new project → enable **YouTube Data API v3**.
2. OAuth consent screen → External → add your own Google account as a test user.
3. Credentials → Create OAuth client ID → **Desktop app** → download the JSON → save it as
   `credentials/<channel>/client_secret.json`.
4. The first dry run opens a browser consent flow and caches `youtube_token.json`, refreshed
   automatically thereafter.
5. While the consent screen is in **Testing**, refresh tokens expire every 7 days. Publishing
   the consent screen — it stays private to your app — makes them long-lived.

A note on which file actually matters: for a Desktop-app client, Google's own documentation
treats the client secret as not confidential, because it cannot be kept secret in an installed
app. **The file to protect is `youtube_token.json`** — the refresh token in it is what grants
standing access to your channel. Guard the ledger too; it is not a credential, but it is a
record of your unlisted URLs.

## If you ever commit a credential

Deleting the file is not the fix. Assume it is compromised the moment it is pushed.

1. **Revoke first.** Google Cloud Console → Credentials → delete the OAuth client. Any token
   derived from it dies with it.
2. Then remove it from history (`git filter-repo`, or BFG) and force-push.
3. Then create a new client and re-authorise.

In that order. Purging history on a credential you have not revoked just makes the leak harder
to find.

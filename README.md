# Fork

Adds support for deno, the codebase now works with deno and bun at the same time

**Usage:**

The fork have tags that follows upstream but with `-deno` suffix, for example `0.31-deno`

To run with deno

```
deno run --allow-env --allow-net https://raw.githubusercontent.com/sigmaSd/helix-gpt/0.31-deno/src/app.ts  --handler codeium` # make sure to use the latest deno tag
```

To compile to a standalone executable

```
deno compile --output helix-gpt --no-check --allow-env --allow-net https://raw.githubusercontent.com/sigmaSd/helix-gpt/0.31-deno/src/app.ts # make sure to use the latest deno tag
```


# helix-gpt

![Build Status](https://github.com/leona/helix-gpt/actions/workflows/release.yml/badge.svg)
![Github Release](https://img.shields.io/badge/release-v0.31-blue)

Code assistant language server for [Helix](https://github.com/helix-editor/helix) with support for Copilot/OpenAI/Codeium.

Completion example

![helix-gpt example](https://github.com/leona/helix-gpt/raw/master/assets/example.gif)

Code actions example (space + a)

![helix-gpt example](https://github.com/leona/helix-gpt/raw/master/assets/example2.gif)

Available code actions: `resolveDiagnostics` `generateDocs` `improveCode` `refactorFromComment` `writeTest`

### How?

When a trigger character is pressed it will request a completion and use the entire file as context.
Default triggers characters: `["{", "(", " "]` can be overwritten with `--triggerCharacters "{||(|| "`

Use `ctrl+x` to manually trigger completions, and `space+a` to trigger code actions that only use the selected code as context.

### Install

This was made to run with [Bun](https://bun.sh/), but you can also use a precompiled binary.

#### Without Bun

```bash
wget https://github.com/leona/helix-gpt/releases/download/0.31/helix-gpt-0.31-x86_64-linux.tar.gz \
-O /tmp/helix-gpt.tar.gz \
&& tar -zxvf /tmp/helix-gpt.tar.gz \
&& mv helix-gpt-0.31-x86_64-linux /usr/bin/helix-gpt \
&& chmod +x /usr/bin/helix-gpt
```

#### With Bun (tested with 1.0.25)

```bash
wget https://github.com/leona/helix-gpt/releases/download/0.31/helix-gpt-0.31.js -O /usr/bin/helix-gpt
```

### Configuration

You can configure helix-gpt by exposing either the environment variables below, or by passing the command line options directly to helix-gpt in the Helix configuration step.

[All configuration options](https://github.com/leona/helix-gpt/blob/master/src/config.ts)

NOTE: Copilot is the best choice due to the model and implementation.

#### Environment Variables

```bash
OPENAI_API_KEY=123 # Required if using openai handler
COPILOT_API_KEY=123 # Required if using copilot handler
CODEIUM_API_KEY=123 # Not required, will use public API key otherwise.
HANDLER=openai # openai/copilot/codeium
```

#### Command Line Arguments

(Add to `command = "helix-gpt"` in Helix configuration)

```bash
--handler openai --openaiKey 123
```

You can also use:

```bash
helix-gpt --authCopilot
```

To fetch your Copilot token.

### Helix Configuration

Example for TypeScript `.helix/languages.toml` tested with Helix 23.10 (older versions may not support multiple LSPs)

```toml
[language-server.gpt]
command = "helix-gpt"

[language-server.ts]
command = "typescript-language-server"
args = ["--stdio"]
language-id = "javascript"

[[language]]
name = "typescript"
language-servers = [
    "ts",
    "gpt"
]
```

In case you opt out of the precompiled binary, modify as follows:

```toml
[language-server.gpt]
command = "bun"
args = ["run", "/app/helix-gpt.js"]
```

### All Done

If there are any issues, refer to the helix-gpt and Helix log files:

```bash
tail -f /root/.cache/helix/helix.log
tail -f /app/helix-gpt.log # Or wherever you set --logFile to
```

### Special Thanks

- [rsc1975](https://github.com/rsc1975/bun-docker) for their Bun Dockerfile.

### Todo

- [x] Copilot support
- [x] Resolve diagnostics code action
- Self-hosted model support (partial support if they are openai compliant)
- Inline completion provider (pending support from Helix)
- Single config for all languages (pending [#9318](https://github.com/helix-editor/helix/pull/9318))
- Support workspace commands to toggle functionality (pending Helix support for merging workspace commands)
- Increase test coverage
- Async load completions to show other language server results immediately (pending Helix support)
- Improve recovery from errors as it can leave the editor unusable sometimes

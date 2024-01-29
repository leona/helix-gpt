# helix-gpt

Code assistant language server for [Helix](https://github.com/helix-editor/helix) with support for Copilot + OpenAI.

Completion example

![helix-gpt example](https://github.com/leona/helix-gpt/raw/master/assets/example.gif)

Code actions example (space + a)

![helix-gpt example](https://github.com/leona/helix-gpt/raw/master/assets/example2.gif)

### How?

When a trigger character is pressed it will request a completion and use the entire file as context.
Triggers characters: `["{", "(", " ", "."]`
You can also use `ctrl+x` to manually trigger it.

Code actions are triggered by `space+a` and only use the selected code as context.

### Install

This was made to run with [Bun](https://bun.sh/), but you can also use a precompiled binary.

#### Without Bun

```bash
wget https://github.com/leona/helix-gpt/releases/download/0.16/helix-gpt-0.16-x86_64-linux.tar.gz \
-O /tmp/helix-gpt.tar.gz \
&& tar -zxvf /tmp/helix-gpt.tar.gz \
&& mv helix-gpt-0.16-x86_64-linux /usr/bin/helix-gpt \
&& chmod +x /usr/bin/helix-gpt
```

#### With Bun

```bash
wget https://github.com/leona/helix-gpt/releases/download/0.16/helix-gpt-0.16.js -O helix-gpt.js
```

### Configuration

You can configure helix-gpt by exposing either the environment variables below, or by passing the command line options directly to helix-gpt in the Helix configuration step.

[All configuration options](https://github.com/leona/helix-gpt/blob/master/src/config.ts)

NOTE: Copilot is the best choice due to the model and implementation.

#### Environment Variables

```bash
OPENAI_API_KEY=123 # At least 1 API key needed
COPILOT_API_KEY=123
HANDLER=openai # Can be openai or copilot
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
- Self-hosted model support (partial support if they are openai compliant)
- Inline completion provider (pending support from Helix)
- Error fixing assistant
- Single config for all languages (pending [#9318](https://github.com/helix-editor/helix/pull/9318))
- Support workspace commands to toggle functionality (pending Helix support for merging workspace commands)
- Better test coverage

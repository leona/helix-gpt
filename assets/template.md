# helix-gpt

![Build Status](https://github.com/leona/helix-gpt/actions/workflows/release.yml/badge.svg)
![Github Release](https://img.shields.io/badge/release-v<release-version>-blue)

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
wget https://github.com/leona/helix-gpt/releases/download/<release-version>/helix-gpt-<release-version>-x86_64-linux.tar.gz \
-O /tmp/helix-gpt.tar.gz \
&& tar -zxvf /tmp/helix-gpt.tar.gz \
&& mv helix-gpt-<release-version>-x86_64-linux /usr/bin/helix-gpt \
&& chmod +x /usr/bin/helix-gpt
```

#### With Bun (tested with 1.0.25)

```bash
wget https://github.com/leona/helix-gpt/releases/download/<release-version>/helix-gpt-<release-version>.js -O /usr/bin/helix-gpt
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

### With Nix

#### Usage

To build it:

```bash
nix build .
```

To run it:

```bash
nix run github:leona/helix-gpt
```

To use this flake in your own flake, add it as an input in your `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    helix-gpt.url = "github:leona/helix-gpt";
  };

  outputs = { nixpkgs, helix-gpt }: {
    devShells.default = pkgs.mkShell {
        packages = [helix-gpt.packages.default];
    };
  };
}
```

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

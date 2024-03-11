{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;

            config.allowUnfree = true;
          };

          node_modules = with pkgs; stdenv.mkDerivation {
            name = "helix-gpt_node_modules";
            src = ./.;

            dontConfigure = true;
            dontFixup = true;
            nativeBuildInputs = [ bun ];
            buildInputs = [ nodejs_20 ];
            impureEnvVars = lib.fetchers.proxyImpureEnvVars ++ [ "GIT_PROXY_COMMAND" "SOCKS_SERVER" ];

            buildPhase = ''
              bun install --no-progress --frozen-lockfile
            '';

            installPhase = ''
              mkdir -p $out/node_modules

              cp -R ./node_modules $out
            '';

            outputHash = "sha256-y6K5Xq1Q5iK9xiXr4+kQSyDa9kxeYpdhmoBooeXm6hg=";
            outputHashAlgo = "sha256";
            outputHashMode = "recursive";
          };
          helix-gpt = with pkgs; stdenv.mkDerivation {

            name = "helix-gpt";
            src = ./.;

            dontConfigure = true;
            dontBuild = true;
            nativeBuildInputs = [ makeBinaryWrapper ];
            buildInputs = [ bun ];

            installPhase = ''
              runHook preInstall

              mkdir -p $out/bin

              ln -s ${node_modules}/node_modules $out
              cp -R ./* $out

              makeBinaryWrapper ${bun}/bin/bun $out/bin/helix-gpt \
                --prefix PATH : ${lib.makeBinPath [ bun ]} \
                --add-flags "run --prefer-offline --no-install --cwd $out ./src/app.ts"

              runHook postInstall
            '';
          };
        in
        {
          packages = {
            default = helix-gpt;
          };

          devShells.default = with pkgs; mkShell {
            packages = with pkgs; [
              bun
            ];
          };
        });
}

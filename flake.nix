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


          node_modules =
            let
              inherit (pkgs) stdenv lib;
            in
            stdenv.mkDerivation {
              name = "helix-gpt-node_modules";
              src = ./.;
              dontUnpack = true;
              sourceRoot = ./.;

              dontConfigure = true;
              nativeBuildInputs = [ pkgs.bun ];
              impureEnvVars = lib.fetchers.proxyImpureEnvVars ++ [ "GIT_PROXY_COMMAND" "SOCKS_SERVER" ];

              buildPhase = ''
                echo "HELLO";
                bun install --no-progress --frozen-lockfile
              '';

              installPhase = ''
                mkdir -p $out/node_modules

                cp -R ./node_modules $out
              '';
            };
        in
        {
          packages = rec {
            inherit node_modules;

            default = node_modules;
          };

          devShells.default = with pkgs; mkShell {
            packages = with pkgs; [
              bun
            ];
          };
        });
}

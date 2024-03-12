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
          };

          version = (builtins.fromJSON (builtins.readFile ./package.json)).version;
          node_modules = pkgs.mkYarnModules {
            pname = "helix-gpt";
            inherit version;

            packageJSON = ./package.json;
            yarnLock = ./yarn.lock;
            yarnNix = ./yarn.nix;
          };
          helix-gpt = with pkgs; stdenv.mkDerivation {
            name = "helix-gpt";
            inherit version;
            src = ./.;

            dontBuild = true;
            doCheck = true;
            nativeBuildInputs = [ makeBinaryWrapper ];
            buildInputs = [ bun ];

            configurePhase = ''
              runHook preConfigure
            
              mkdir -p $out/bin
              ln -s ${node_modules}/node_modules $out

              runHook postConfigure
            '';

            checkPhase = ''
              runHook preCheck
            
              bun run test

              runHook postCheck 
            '';

            installPhase = ''
              runHook preInstall

              cp -R ./* $out

              makeBinaryWrapper ${bun}/bin/bun $out/bin/helix-gpt \
                --prefix PATH : ${lib.makeBinPath [ bun ]} \
                --add-flags "run --prefer-offline --no-install --cwd $out ./src/app.ts"

              runHook postInstall
            '';
          };
        in
        {
          apps.yarn2nix = {
            type = "app";
            program = "${pkgs.writeShellApplication {
              name = "yarn2nix";
              runtimeInputs = with pkgs; [bun yarn2nix];
              text = ''
                bun install --frozen-lockfile
                yarn2nix > yarn.nix
              '';
            }}/bin/yarn2nix";
          };

          checks.default = helix-gpt;

          packages.default = helix-gpt;

          devShells.default = with pkgs; mkShell {
            packages = [
              bun
            ];
          };
        });
}

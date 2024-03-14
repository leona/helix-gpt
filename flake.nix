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

          package = pkgs.callPackage ./package.nix { };

          yarn2nix = pkgs.writeShellApplication {
            name = "yarn2nix";
            runtimeInputs = [
              pkgs.bun
              pkgs.yarn2nix
            ];
            text = ''
              bun install --frozen-lockfile
              yarn2nix > yarn.nix
            '';
          };
        in
        {
          apps =
            let
              app = {
                type = "app";
                program = "${package}/bin/helix-gpt";
              };
            in
            {
              helix-gpt = app;
              default = app;
            };

          checks.default = package;

          packages = {
            helix-gpt = package;
            default = package;
          };

          devShells.default = with pkgs; mkShell {
            packages = [
              bun
              # This is the wrapped flake yarn2nix
              yarn2nix
            ];
          };
        })
    // {
      overlays.default = final: prev: {
        helix-gpt = final.callPackage ./package.nix { };
      };
    };
} 

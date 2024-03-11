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

          helix-gpt = pkgs.callPackage ./package.nix { };
        in
        {
          apps.yarn2nix = with pkgs; {
            type = "app";
            program = "${writeShellApplication {
              name = "yarn2nix";
              runtimeInputs = [
                bun 
                yarn2nix
              ];
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

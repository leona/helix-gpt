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
            ];
          };
        })
    // {
      overlays.default = final: prev: {
        helix-gpt = final.callPackage ./package.nix { };
      };
    };
} 

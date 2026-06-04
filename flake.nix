{
  description = "RecipeHub — fullstack recipe manager (Express + React)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
            pnpm
            mongosh
          ];

          shellHook = ''
            echo "✦ RecipeHub dev shell"
            echo "   Node: $(node --version)"
            echo "   npm:  $(npm --version)"
          '';
        };
      });
}
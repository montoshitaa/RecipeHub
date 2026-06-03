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
            nodejs_20
            nodePackages.npm
            nodePackages.pnpm
            mongosh
          ];

          shellHook = ''
            echo "✦ RecipeHub dev shell"
            echo "   Node: $(node --version)"
            echo "   npm:  $(npm --version)"
            echo ""
            echo "   ── install ──"
            echo "   npm install  (in backend/ & frontend/)"
            echo ""
            echo "   ── run ──"
            echo "   npm run dev  (in backend/ & frontend/)"
            echo ""
            echo "   ── env ──"
            echo "   cp .env.example .env  (then edit credentials)"
            echo "   ── mongo ──"
            echo "   docker compose up -d mongo  (for local DB)"
          '';
        };
      });
}

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
	    opencode
            gsd
          ];

          shellHook = ''
            export NPM_CONFIG_PREFIX="$PWD/.npm-global"
            export PATH="$PWD/.npm-global/bin:$PATH"

            GSD_MARKER="$PWD/.gsd-installed"

            if [ ! -f "$GSD_MARKER" ]; then
              echo "Installing GSD for OpenCode..."

              npx -y @opengsd/gsd-core@latest install \
                --ide opencode \
                --project .

              touch "$GSD_MARKER"
            fi
          '';
        };
      });
}
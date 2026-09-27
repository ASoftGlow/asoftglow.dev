with import <nixpkgs> {};
pkgs.mkShell {
  buildInputs = [ nodejs ];
  shellHook = "npx @11ty/eleventy --serve";
}

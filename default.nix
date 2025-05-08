with import <nixpkgs> {};
fastStdenv.mkDerivation {
  name = "env";
  nativeBuildInputs = [ nodejs ];
  shellHook = "kitty npx @11ty/eleventy --serve &";
}

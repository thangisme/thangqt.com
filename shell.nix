{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  buildInputs = [ pkgs.deno ];

  shellHook = ''
    alias serve='deno run -A ./main.ts -i content/ -s'
  '';
}

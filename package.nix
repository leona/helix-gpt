{ stdenv
, lib
, makeBinaryWrapper
, bun
, ...
}:
let
  version = (builtins.fromJSON (builtins.readFile ./package.json)).version;

in
stdenv.mkDerivation {
  name = "helix-gpt_${version}";
  inherit version;
  src = ./.;

  dontBuild = true;
  doCheck = true;
  nativeBuildInputs = [ makeBinaryWrapper ];
  buildInputs = [ bun ];

  checkPhase = ''
    runHook preCheck
            
    bun run test

    runHook postCheck 
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p $out/bin
    cp -R ./* $out

    makeBinaryWrapper ${bun}/bin/bun $out/bin/helix-gpt \
      --prefix PATH : ${lib.makeBinPath [ bun ]} \
      --add-flags "run --prefer-offline --no-install --cwd $out ./src/app.ts"

    runHook postInstall
  '';
}

{ stdenv
, lib
, mkYarnModules
, makeBinaryWrapper
, bun
, ...
}:
let
  version = (builtins.fromJSON (builtins.readFile ./package.json)).version;

  node_modules = mkYarnModules {
    pname = "helix-gpt";
    inherit version;

    packageJSON = ./package.json;
    yarnLock = ./yarn.lock;
    yarnNix = ./yarn.nix;
  };
in
stdenv.mkDerivation {
  name = "helix-gpt";
  inherit version;
  src = ./.;

  dontBuild = true;
  doCheck = true;
  nativeBuildInputs = [ makeBinaryWrapper ];
  buildInputs = [ bun ];

  configurePhase = ''
    runHook preConfigure
            
    mkdir -p $out/bin
    ln -s ${node_modules}/node_modules $out

    runHook postConfigure
  '';

  checkPhase = ''
    runHook preCheck
            
    bun run test

    runHook postCheck 
  '';

  installPhase = ''
    runHook preInstall

    cp -R ./* $out

    makeBinaryWrapper ${bun}/bin/bun $out/bin/helix-gpt \
      --prefix PATH : ${lib.makeBinPath [ bun ]} \
      --add-flags "run --prefer-offline --no-install --cwd $out ./src/app.ts"

    runHook postInstall
  '';
}

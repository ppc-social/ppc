{ pkgs
, system
, lib
, inputs
, instant_port ? 3003
, instant_www_port ? 3000
, zitadel_port ? 3001
, zitadel_login_port ? 3002
, dataDir ? "\${PPC_DATA_DIR}" # by default use the PPC_DATA_DIR which is set to $(pwd)/gitignore/data in the devppc script.
, ...

}@args : rec {

  ppcdev = pkgs.writeShellScriptBin "ppcdev" ''
    export PPC_SRC_DIR=$(${lib.getExe pkgs.git} rev-parse --show-toplevel)
    export PPC_DATA_DIR=${if dataDir == "\${PPC_DATA_DIR}" then "\${PPC_SRC_DIR}/gitignore/data" else dataDir}
    echo PPC_DATA_DIR = $PPC_DATA_DIR
    echo PPC_SRC_DIR = $PPC_SRC_DIR

    mkdir -p $PPC_DATA_DIR

    # copy the instant src to the data dir if not existing
    # because instant wants to write to src/server/resources/config/override.edn.....
    # we only copy, when the insant src changed....
    if [ -f $PPC_DATA_DIR/instant/src-nix-path ] && [[ "$(cat $PPC_DATA_DIR/instant/src-nix-path)" == "${inputs.instant}" ]]
    then
      echo not copying instant src
    else
      mkdir -p $PPC_DATA_DIR/instant/src
      ${lib.getExe pkgs.rsync} -r ${inputs.instant}/* $PPC_DATA_DIR/instant/src
      sudo chmod +w -R $PPC_DATA_DIR/instant/src
      echo -en ${inputs.instant} > $PPC_DATA_DIR/instant/src-nix-path
    fi

    # prepare for docker use
    if command -V podman >/dev/null
    then
      DOCKER_CMD=podman
    elif command -V docker >/dev/null
    then
      DOCKER_CMD=docker
    else
      echo You need docker or podman installed on your system for this devshell to work
      exit 1
    fi
    export DOCKER_CMD

    echo running arion on the file ${arion_file}
    exec ${lib.getExe inputs.arion.packages.${system}.default} --prebuilt-file ${arion_file} $@
  '';

  arion_module = import ./services.nix (args // {
    inherit instant_www_port zitadel_port zitadel_login_port dataDir instant_port;
  });

  arion_file = inputs.arion.lib.build {
    modules = [ arion_module ];
    inherit pkgs;
  };

}

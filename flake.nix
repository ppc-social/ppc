{
  description = "PPC Software flake";

  inputs = {
		nixpkgs.url = "github:NixOS/nixpkgs/release-25.05";

 		flake-utils.url = "github:numtide/flake-utils";

    arion = {
      url = "github:hercules-ci/arion";
      #inputs.nixpkgs.follows = "nixpkgs";
    };

    instant = {
      url = "github:bioshazard/instant/selfhost-coolify";
      flake = false;
    };
  };


  outputs = ({ self, nixpkgs, flake-utils, arion, instant }@inputs: let
      eachSystem = flake-utils.outputs.lib.eachSystem;
      allSystems = flake-utils.outputs.lib.allSystems;

  in eachSystem allSystems (system: let
    pkgs = import nixpkgs { inherit system; };
    dev_env = import ./deploy/dev_env.nix (inputs // {
      inherit inputs pkgs system;
      lib = pkgs.lib;
    });
  in {
    devShells.default = pkgs.mkShell {
      packages = with pkgs; [
        pnpm
        arion.packages.${system}.default
        dev_env.ppcdev
      ];

      shellHook = ''
      '';
    };

    packages.ppcdev = dev_env.ppcdev;

  }) // {inherit inputs self;});
}

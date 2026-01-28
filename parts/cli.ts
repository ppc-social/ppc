import cac from "cac";

export async function create(ppc: PPC): Promise<{}> {
  const cli = cac("ppc");

  cli.run = () => {
    cli.parse();
  };
  cli.isPPCPart = true;

  return cli;
}


import { Config } from "@ppc/parts"

class CliMain {
  app_type: "cli"

  // all the parts
  config: Config

  constructor () {
    console.log("hello from PPC init")

    this.config = new Config(this)
  }

  run () {
    console.log("PPC Cli running")
  }
}


const cli = new CliMain();
cli.run()


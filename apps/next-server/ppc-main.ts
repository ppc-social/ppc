import {Config, setPPCSingelton} from "@ppc/parts"

export class BrowserClientMain {
  app_type = "browser"

  config: Config = new Config(this)

  constructor () {
    setPPCSingelton(this)
  }
}

export class NextServerMain {
  app_type = "server"

  config: Config = new Config(this)

  constructor () {
    setPPCSingelton(this)
  }
}



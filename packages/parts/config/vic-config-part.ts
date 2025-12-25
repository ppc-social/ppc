
export type VicConfigValue = string | number | boolean | Object;

// handels all the impl of config options
// named like this because it should eventually be moved to the Victorinix project
export class VicConfigPart {
  [key: string]: VicConfigValue
}

// hmmmmm
export class VicOption {
  [key: string]: VicConfigValue

  constructor(options_for_option: Object) {
  }
}

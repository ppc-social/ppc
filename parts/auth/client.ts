import { PartBase, type PPC } from "../index.ts";

export default class AuthClient extends PartBase {
  static override async create(_ppc: PPC): Promise<AuthClient> {
    const auth = new AuthClient();
    return auth;
  }
}

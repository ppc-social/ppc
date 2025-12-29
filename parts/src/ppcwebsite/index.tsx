
import { PartBase } from "@ppc/parts"
import { MainPage, MainPageHydration } from "./main_page.js"

export default class PPCWebSite extends PartBase {
	[key: string]: any

	static deps = [ "web" ]

	static async create (ppc: any): Promise<PPCWebSite> {

		ppc.web.addPage("/", <MainPage/>, MainPageHydration)

		return new PPCWebSite()
	}

	run () {
		// does not do anything here
	}

}

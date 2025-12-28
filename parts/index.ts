import {BrowserClientMain, NextServerMain} from "@/ppc-main";

export * from "./config/index"

export function getPPCSingelton(): any {
  if (! ("ppc" in globalThis as any)) {
    if (typeof window == "undefined") {
        (globalThis as any).ppc = new NextServerMain()
    } else {
        (globalThis as any).ppc = new BrowserClientMain()
    }
    console.log("getPPCSingelton creating PPC object:", (globalThis as any).ppc)
  }
  return (globalThis as any).ppc
}

export function setPPCSingelton(ppc: any) {
  (globalThis as any).ppc = ppc
}


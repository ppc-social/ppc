import { Plugin, TFile, Vault, MetadataCache } from "obsidian";
import DevPage from "../../parts/ppcwebsite/dev.tsx";
import DevOnePage from "../../parts/ppcwebsite/dev-one.tsx";

import { ItemView, WorkspaceLeaf } from "obsidian";
import React from "react";
import ReactDOM from "react-dom/client";
import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";

export default class PPCPlugin extends Plugin {
  async onload() {
    this.registerView("ppc-react-view", (leaf) => new PPCReactView(leaf, this));

    this.addCommand({
      id: "dev-page",
      name: "Open dev Page",
      callback: async () => {
        const leaf = this.app.workspace.getLeaf(true);
        await leaf.setViewState({
          type: "ppc-react-view",
          active: true,
        });
        this.app.workspace.revealLeaf(leaf);
      },
    });
  }
}

export class PPCReactView extends ItemView {
  root: ReactDOM.Root | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: SystemC2Plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return "ppc-react-view";
  }

  getDisplayText(): string {
    return "PPC Plugin";
  }

  override async onOpen() {
    // create React root
    this.root = ReactDOM.createRoot(this.containerEl.children[1]);
    this.root.render(
      <MemoryRouter initialEntries={["/"]}>
        <PluginApp />
      </MemoryRouter>,
    );
  }

  override async onClose() {
    this.root?.unmount();
  }
}

function PluginApp() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dev">Settings</Link>
      </nav>
      // there are plans to somehow generate those routes from the remix routing
      manifest... but for new we'll just manually add them here
      <Routes>
        <Route path="/" element={<>Hello world Home page</>} />
        <Route path="/dev" element={<DevPage />} />
        <Route path="/dev/one" element={<DevOnePage />} />
      </Routes>
    </>
  );
}

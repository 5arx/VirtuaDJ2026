import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const originalAssets = fileURLToPath(
  new URL("../original/VirtuaDJ", import.meta.url),
);
const xiteStylesheet = fileURLToPath(
  new URL("./node_modules/x_ite/dist/x_ite.css", import.meta.url),
);
const xiteAssets = fileURLToPath(
  new URL("./node_modules/x_ite/dist/assets", import.meta.url),
);
// Correct case-only filename mismatches in served copies, leaving original VRML untouched.
const sharedReferenceCorrections = new Map([
  ['"Platter.wrl"', '"Platter.WRL"'],
  ['"htring.wrl"', '"Htring.WRL"'],
  ['"hdshell.wrl"', '"hdshell.WRL"'],
  ['"TArmWt.wrl"', '"TArmWt.WRL"'],
  ['"armscrew.wrl"', '"armscrew.WRL"'],
]);
const servedScenes = new Map([
  ["DeckI.wrl", sharedReferenceCorrections],
  ["DeckII.wrl", sharedReferenceCorrections],
  ["hdshell.WRL", new Map([['"cart.wrl"', '"cart.WRL"']])],
]);

function correctSceneReferences(
  filename: string,
  scene: string,
  corrections: Map<string, string>,
): string {
  for (const [incorrect, corrected] of corrections) {
    scene = scene.replaceAll(incorrect, corrected);
  }

  return scene;
}

function serveOriginalAsset(
  request: IncomingMessage,
  response: ServerResponse,
  next: (error?: Error) => void,
): void {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  const filename = pathname.slice(1);
  const corrections = servedScenes.get(filename);
  const assetPath = corrections
    ? join(originalAssets, filename)
    : pathname === "/node_modules/x_ite/dist/x_ite.css"
      ? xiteStylesheet
      : undefined;

  if (!assetPath) {
    next();
    return;
  }

  void readFile(assetPath)
    .then((contents) => {
      response.statusCode = 200;
      response.setHeader(
        "Content-Type",
        corrections ? "model/vrml; charset=utf-8" : "text/css; charset=utf-8",
      );
      response.end(
        corrections
          ? correctSceneReferences(filename, contents.toString("utf8"), corrections)
          : contents,
      );
    })
    .catch(next);
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    }),
  );
  return nested.flat();
}

function originalSceneAliases(): Plugin {
  return {
    name: "original-vrml-reference-corrections",
    configureServer(server) {
      server.middlewares.use(serveOriginalAsset);
    },
    async generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "assets/x_ite.css",
        source: await readFile(xiteStylesheet),
      });

            const requiredAssets = [
        "components/ScriptingComponent.js",
        "components/TextComponent.js",
              "lib/woff2_decoder.js",
              "linetype/linetypes.png",
              ...(
                await Promise.all(
                  ["fonts", "hatching", "images"].map((directory) =>
                    listFiles(join(xiteAssets, directory)),
                  ),
                )
              )
                .flat()
                .map((path) => path.slice(xiteAssets.length + 1)),
            ];

      for (const asset of requiredAssets) {
        this.emitFile({
          type: "asset",
          fileName: `assets/assets/${asset}`,
          source: await readFile(join(xiteAssets, asset)),
        });
      }
    },
    async writeBundle(outputOptions) {
      if (!outputOptions.dir) {
        throw new Error("The production build must use an output directory.");
      }

      for (const [filename, corrections] of servedScenes) {
        const scenePath = join(outputOptions.dir, filename);
        const scene = await readFile(scenePath, "utf8");
        await writeFile(
          scenePath,
          correctSceneReferences(filename, scene, corrections),
          "utf8",
        );
      }
    },
  };
}

export default defineConfig({
  publicDir: originalAssets,
  plugins: [originalSceneAliases()],
  optimizeDeps: {
    exclude: ["x_ite"],
  },
});

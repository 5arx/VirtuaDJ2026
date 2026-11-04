import X3D from "x_ite";
import "./style.css";
import { DeckAudioPlayer } from "./audio/DeckAudioPlayer";

const viewer = document.querySelector<X3D.X3DCanvasElement>("x3d-canvas");

if (!viewer) {
  throw new Error("The X_ITE viewer element is missing from the page.");
}

const audioContext = new AudioContext();
const audioStatus = document.querySelector<HTMLElement>("#audio-system-status");

function setAudioStatus(message: string): void {
  if (audioStatus) {
    audioStatus.textContent = message;
  }
}

// Browser autoplay policies require Web Audio to be unlocked directly inside
// a user gesture. Capture the interaction before X_ITE dispatches VRML events.
viewer.addEventListener(
  "pointerdown",
  () => {
    void audioContext.resume().catch((error: unknown) => console.error(error));
  },
  { capture: true },
);

function connectDeck(
  deckScene: X3D.X3DScene,
  deckLabel: string,
  trackUrl: string,
): void {
  const stateMachine = deckScene.getNamedNode("PowerBoxScript");
  const legacySound = deckScene.getNamedNode("mySound");
  const player = new DeckAudioPlayer(audioContext, trackUrl);
  let turning = false;
  let needleEngaged = false;

  // Prevent X_ITE's legacy AudioClip from doubling the Web Audio output.
  (legacySound as unknown as { intensity: number }).intensity = 0;

  stateMachine.addFieldCallback(`${deckLabel}-audio`, "audioToggle", (value) => {
    if (Number(value) < 0) {
      needleEngaged = true;
      setAudioStatus(`${deckLabel} PLAY SIGNAL`);
      void player
        .play()
        .then(() => setAudioStatus(`${deckLabel} AUDIO PLAYING`))
        .catch((error: unknown) => {
          console.error(error);
          setAudioStatus(`${deckLabel} AUDIO ERROR`);
        });
    } else {
      player.pause();

      // A stop button event sets turning false before audioToggle. Preserve the
      // engaged needle so start can resume; an audio stop while still turning
      // means the arm was lifted and must disarm playback.
      if (turning) {
        needleEngaged = false;
      }

      setAudioStatus(`${deckLabel} WAITING FOR NEEDLE`);
    }
  });

  stateMachine.addFieldCallback(`${deckLabel}-turning`, "turning", (value) => {
    turning = Boolean(value);

    if (!turning) {
      player.pause();
      setAudioStatus(`${deckLabel} PLATTER STOPPED`);
    } else if (needleEngaged) {
      setAudioStatus(`${deckLabel} RESUME SIGNAL`);
      void player
        .play()
        .then(() => setAudioStatus(`${deckLabel} AUDIO PLAYING`))
        .catch((error: unknown) => {
          console.error(error);
          setAudioStatus(`${deckLabel} AUDIO ERROR`);
        });
    }
  });
}

interface InlineNodeImplementation {
  getInternalScene(): X3D.X3DScene;
}

function findDeckScenes(scene: X3D.X3DScene): X3D.X3DScene[] {
  const deckScenes: X3D.X3DScene[] = [];

  for (const rootNode of scene.rootNodes) {
    if (!rootNode || rootNode.getNodeTypeName() !== "Transform") {
      continue;
    }

    const children = (rootNode as unknown as { children: X3D.MFNode }).children;

    for (const child of children) {
      if (!child || child.getNodeTypeName() !== "Inline") {
        continue;
      }

      const inline = child.getValue() as InlineNodeImplementation;
      const deckScene = inline.getInternalScene();

      try {
        deckScene.getNamedNode("PowerBoxScript");
        deckScenes.push(deckScene);
      } catch {
        // The Inline exists but its deck scene is still loading.
      }
    }
  }

  return deckScenes;
}

async function waitForDeckScenes(browser: X3D.X3DBrowser): Promise<X3D.X3DScene[]> {
  const timeoutAt = performance.now() + 10_000;

  while (performance.now() < timeoutAt) {
    const deckScenes = findDeckScenes(browser.currentScene);

    if (deckScenes.length === 2) {
      return deckScenes;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  throw new Error("Deck audio controls did not finish loading.");
}

await X3D();

const [deckOneScene, deckTwoScene] = await waitForDeckScenes(viewer.browser);
connectDeck(deckOneScene, "DECK 01", "/dnbsamp.wav");
connectDeck(deckTwoScene, "DECK 02", "/dnbbeats.wav");
setAudioStatus("AUDIO READY");

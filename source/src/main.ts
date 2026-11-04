import X3D from "x_ite";
import "./style.css";
import { DeckAudioPlayer } from "./audio/DeckAudioPlayer";

const viewer = document.querySelector<X3D.X3DCanvasElement>("x3d-canvas");

if (!viewer) {
  throw new Error("The X_ITE viewer element is missing from the page.");
}

const audioContext = new AudioContext();
const audioStatus = document.querySelector<HTMLElement>("#audio-system-status");
const SLIDER_TRAVEL = 65;
const MAX_PITCH_PERCENT = 8;
const RPM_33 = 33 + 1 / 3;
const RPM_45 = 45;

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
  const speedSlider = deckScene.getNamedNode("SpeedSlider");
  const player = new DeckAudioPlayer(audioContext, trackUrl);
  let turning = false;
  let powerOn = false;
  let needleEngaged = false;
  let basePlaybackRate = 1;
  let pitchMultiplier = 1;

  const applyPlaybackRate = (): void => {
    player.setPlaybackRate(basePlaybackRate * pitchMultiplier);
  };

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
      if (powerOn && turning) {
        player.pause();
      }

      // A stop button event sets turning false before audioToggle. Preserve the
      // engaged needle so start can resume; an audio stop while still turning
      // means the arm was lifted and must disarm playback.
      if (powerOn && turning) {
        needleEngaged = false;
      }

      setAudioStatus(`${deckLabel} WAITING FOR NEEDLE`);
    }
  });

  stateMachine.addFieldCallback(`${deckLabel}-turning`, "turning", (value) => {
    turning = Boolean(value);

    if (!turning) {
      if (powerOn) {
        player.spinDown(0.7);
        setAudioStatus(`${deckLabel} STOP DRAG`);
      }
    } else if (needleEngaged) {
      setAudioStatus(`${deckLabel} START DRAG`);
      void player
        .spinUp()
        .then(() => setAudioStatus(`${deckLabel} AUDIO PLAYING`))
        .catch((error: unknown) => {
          console.error(error);
          setAudioStatus(`${deckLabel} AUDIO ERROR`);
        });
    }
  });

  stateMachine.addFieldCallback(`${deckLabel}-power`, "powerOn", (value) => {
    powerOn = Boolean(value);

    if (!powerOn && turning && needleEngaged) {
      player.spinDown();
      setAudioStatus(`${deckLabel} POWER SPIN-DOWN`);
    }
  });

  speedSlider.addFieldCallback(`${deckLabel}-pitch`, "translation", (value) => {
    const translation = value as ArrayLike<number>;
    const sliderPosition = Math.max(
      -SLIDER_TRAVEL,
      Math.min(SLIDER_TRAVEL, Number(translation[1])),
    );
    const pitchPercent = (sliderPosition / SLIDER_TRAVEL) * MAX_PITCH_PERCENT;

    pitchMultiplier = 1 + pitchPercent / 100;
    applyPlaybackRate();
    setAudioStatus(
      `${deckLabel} PITCH ${pitchPercent >= 0 ? "+" : ""}${pitchPercent.toFixed(1)}%`,
    );
  });

  stateMachine.addFieldCallback(`${deckLabel}-rpm`, "current", (value) => {
    basePlaybackRate = Number(value);
    applyPlaybackRate();

    const rpm = basePlaybackRate > 1.1 ? RPM_45 : RPM_33;
    setAudioStatus(`${deckLabel} ${rpm === RPM_45 ? "45" : "33⅓"} RPM`);
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

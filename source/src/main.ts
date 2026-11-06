import X3D from "x_ite";
import "./style.css";
import { DeckAudioPlayer } from "./audio/DeckAudioPlayer";

const viewer = document.querySelector<X3D.X3DCanvasElement>("x3d-canvas");

if (!viewer) {
  throw new Error("The X_ITE viewer element is missing from the page.");
}

const xiteBrowser = viewer.browser;
const audioContext = new AudioContext();
const audioStatus = document.querySelector<HTMLElement>("#audio-system-status");
const SLIDER_TRAVEL = 65;
const MAX_PITCH_PERCENT = 8;
const RPM_33 = 33 + 1 / 3;
const RPM_45 = 45;

interface PlatterTimerControl {
  enabled: boolean;
  startTime: number;
}

interface XiteBrowserClock {
  getCurrentTime(): number;
}

interface ToneArmControl {
  rotation: X3D.SFRotation;
}

interface ArmSensorControl {
  enabled: boolean;
}

interface DeckScriptInputs {
  touchTime: number;
  SStouchtime: number;
  levertouchTime: number;
}

interface DeckScriptState {
  powerOn: boolean;
  turning: boolean;
  isUp: boolean;
}

function setAudioStatus(message: string): void {
  if (audioStatus) {
    audioStatus.textContent = message;
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function animateToneArm(
  toneArm: ToneArmControl,
  targetAngle: number,
  durationMilliseconds: number,
): Promise<void> {
  const initialAngle = Number(toneArm.rotation[3]);
  const startedAt = performance.now();

  return new Promise((resolve) => {
    const update = (now: number): void => {
      const progress = Math.min((now - startedAt) / durationMilliseconds, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      const angle = initialAngle + (targetAngle - initialAngle) * easedProgress;

      toneArm.rotation = new X3D.SFRotation(0, 1, 0, angle);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(update);
  });
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
  deckId: string,
  deckLabel: string,
  trackUrl: string,
): void {
  const stateMachine = deckScene.getNamedNode("PowerBoxScript");
  const legacySound = deckScene.getNamedNode("mySound");
  const speedSlider = deckScene.getNamedNode("SpeedSlider");
  const platterTimer = deckScene.getNamedNode("TIMER") as unknown as PlatterTimerControl;
  const toneArm = deckScene.getNamedNode("ToneArm") as unknown as ToneArmControl;
  const armSensor = deckScene.getNamedNode(
    "ArmSensorHorizontal",
  ) as unknown as ArmSensorControl;
  const deckInputs = stateMachine as unknown as DeckScriptInputs;
  const initialState = stateMachine as unknown as DeckScriptState;
  const quickPlayButton = document.querySelector<HTMLButtonElement>(
    `[data-quick-play="${deckId}"]`,
  );
  const player = new DeckAudioPlayer(audioContext, trackUrl);
  let turning = Boolean(initialState.turning);
  let powerOn = Boolean(initialState.powerOn);
  let armUp = Boolean(initialState.isUp);
  let needleEngaged = false;
  let basePlaybackRate = 1;
  let pitchMultiplier = 1;

  if (!quickPlayButton) {
    throw new Error(`Quick Play control is missing for ${deckLabel}.`);
  }

  const applyPlaybackRate = (): void => {
    player.setPlaybackRate(basePlaybackRate * pitchMultiplier);
  };

  const setPlatterTurning = (isTurning: boolean): void => {
    platterTimer.enabled = false;

    if (isTurning) {
      platterTimer.startTime = (
        xiteBrowser as unknown as XiteBrowserClock
      ).getCurrentTime();
      platterTimer.enabled = true;
    }
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
    setPlatterTurning(powerOn && turning);

    if (!turning) {
      if (powerOn) {
        player.spinDown(0.35);
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

    if (!powerOn) {
      setPlatterTurning(false);

      if (turning && needleEngaged) {
        player.spinDown();
        setAudioStatus(`${deckLabel} POWER SPIN-DOWN`);
      }
    }
  });

  stateMachine.addFieldCallback(`${deckLabel}-arm-up`, "isUp", (value) => {
    armUp = Boolean(value);

    if (armUp) {
      needleEngaged = false;
      player.pause();
      setAudioStatus(`${deckLabel} ARM RAISED`);
      return;
    }

    needleEngaged = Number(toneArm.rotation[3]) < -0.5;

    if (needleEngaged && powerOn && turning) {
      setAudioStatus(`${deckLabel} NEEDLE ENGAGED`);
      void player
        .play()
        .then(() => setAudioStatus(`${deckLabel} AUDIO PLAYING`))
        .catch((error: unknown) => {
          console.error(error);
          setAudioStatus(`${deckLabel} AUDIO ERROR`);
        });
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
    player.rampPlaybackRate(basePlaybackRate * pitchMultiplier);

    const rpm = basePlaybackRate > 1.1 ? RPM_45 : RPM_33;
    setAudioStatus(`${deckLabel} ${rpm === RPM_45 ? "45" : "33⅓"} RPM`);
  });

  quickPlayButton.addEventListener("click", () => {
    quickPlayButton.disabled = true;
    void audioContext.resume().catch((error: unknown) => console.error(error));

    const runSequence = async (): Promise<void> => {
      if (!powerOn) {
        setAudioStatus(`${deckLabel} QUICK PLAY · POWERING ON`);
        deckInputs.touchTime = (
          xiteBrowser as unknown as XiteBrowserClock
        ).getCurrentTime();
        powerOn = true;
        await delay(200);
      }

      if (!turning) {
        setAudioStatus(`${deckLabel} QUICK PLAY · STARTING PLATTER`);
        deckInputs.SStouchtime = (
          xiteBrowser as unknown as XiteBrowserClock
        ).getCurrentTime();
        turning = true;
        setPlatterTurning(true);
        await delay(750);
      }

      if (!armUp) {
        setAudioStatus(`${deckLabel} QUICK PLAY · LIFTING ARM`);
        deckInputs.levertouchTime = (
          xiteBrowser as unknown as XiteBrowserClock
        ).getCurrentTime();
        armUp = true;
        await delay(1_050);
      }

      // The original lift event enables manual arm dragging. Lock it while the
      // automated sweep runs so pointer input cannot race the animation.
      armSensor.enabled = false;
      setAudioStatus(`${deckLabel} QUICK PLAY · CUEING`);
      await animateToneArm(toneArm, -0.6, 900);

      setAudioStatus(`${deckLabel} QUICK PLAY · LOWERING ARM`);
      deckInputs.levertouchTime = (
        xiteBrowser as unknown as XiteBrowserClock
      ).getCurrentTime();
      armUp = false;
      await delay(1_050);
      needleEngaged = true;
      await player.play();
      setAudioStatus(`${deckLabel} AUDIO PLAYING`);
    };

    void runSequence()
      .catch((error: unknown) => {
        console.error(error);
        setAudioStatus(`${deckLabel} QUICK PLAY ERROR`);
      })
      .finally(() => {
        quickPlayButton.disabled = false;
      });
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

const [deckOneScene, deckTwoScene] = await waitForDeckScenes(xiteBrowser);
connectDeck(deckOneScene, "deck-1", "DECK 01", "/dnbsamp.wav");
connectDeck(deckTwoScene, "deck-2", "DECK 02", "/dnbbeats.wav");
setAudioStatus("AUDIO READY");

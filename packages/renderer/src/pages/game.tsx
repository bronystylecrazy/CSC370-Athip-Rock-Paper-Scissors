import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import { Box, Button, Typography } from "@suid/material";
import { useLocation, useNavigate } from "solid-app-router";
import { CaptureData, GameState, Responses } from "@/types";
import { debounce, throttle } from "@solid-primitives/scheduled";
import BG from '../../public/images/gg.jpg';

function parseData(message: string): any {
  try {
    return JSON.parse(message);
  } catch (e) {
    return { success: false, message };
  }
}

const Game = () => {
  const location = useLocation<any>();
  const navigate = useNavigate();
  if (!location?.state?.round) {
    navigate("/");
  }
  const round: number = location?.state?.round;
  window.ipcRenderer.send("gameState", "started");
  const [setting, setSetting] = createSignal<Responses<any>>();
  const [detections, setDetections] = createSignal<CaptureData[]>([]);
  const [videoSize, setVideoSize] = createSignal([640, 320])
  const [gameState, setGameState] = createSignal<GameState>("PREPARE");

  window.ipcRenderer.on("sidecar", (event, arg) => {
    const data: Responses<CaptureData> = parseData(arg);
    //console.log(data.detection, setting())
    setDetections(data.detection)
    setSetting(data);
    checkGameState();
    onGameUpdated();
  });

  const timeout = setTimeout(() => {
    var video: any = document.querySelector("#videoElement");
    //console.log(video);
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          if (video) {
            video.srcObject = stream;
          }
        })
        .catch(function (err0r) {
          //console.log("Something went wrong!", err0r);
        });
    }
  }, 2000);

  function onGameUpdated() {

  }

  const [stateTitle, setStateTitle] = createSignal("✅ Just checking... Getting ready by showing ✌️ hands.")
  const [leftHand, setLeftHand] = createSignal<CaptureData>();
  const [rightHand, setRightHand] = createSignal<CaptureData>();
  const [isCountDown, setIsCountDown] = createSignal(false)
  const [countDown, setCountDown] = createSignal<number>(4);
  let timer: any = null;
  const checkReadyState = throttle(() => {
    if (gameState() !== 'PREPARE') return;
    setCountDown(c => c - 1);
    if (countDown() < 0) {
      setIsCountDown(false);
      setGameState("READY")
    }
  }, 1000)

  const [matchText, setMatchText] = createSignal("");

  const readyState = throttle(() => {
    if (gameState() !== 'READY') return;
    setCountDown(c => c - 1);
    if (countDown() === 2) setMatchText("Ro");
    if (countDown() === 1) setMatchText("Sham");
    if (countDown() === 0) setMatchText("Bo!!!!");
    if (countDown() < 0) {

      setIsCountDown(false);
      setGameState("GAMEPLAY");
    }
  }, 1000)

  const checkGameplayState = throttle(() => {
    if (gameState() !== 'GAMEPLAY') return;
    console.log(leftHand()?.label, rightHand()?.label)
    if (typeof leftHand() !== 'undefined' && typeof rightHand() !== 'undefined') {
      if (leftHand()?.label === "scissors" && rightHand()?.label === "paper")
        setMatchText("Player1 won!");
      else if (rightHand()?.label === "scissors" && leftHand()?.label === "paper")
        setMatchText("Player2 won!");
      else if (leftHand()?.label === "rock" && rightHand()?.label === "paper")
        setMatchText("Player2 won!");
      else if (rightHand()?.label === "rock" && leftHand()?.label === "paper")
        setMatchText("Player1 won!");
      else if (leftHand()?.label === "rock" && rightHand()?.label === "scissors")
        setMatchText("Player1 won!");
      else if (rightHand()?.label === "rock" && leftHand()?.label === "scissors")
        setMatchText("Player2 won!");
      else
        setMatchText("Draw!")

      setPlayer1(p => {
        p[index()] = leftHand()?.label || '-'
        return [...p];
      });
      setPlayer2(p => {
        p[index()] = rightHand()?.label || '-'
        return [...p];
      });
      setIndex(i => i + 1);
      setIsCountDown(false);
      setGameState("FINISH")
    }
  }, 100)

  const showResultState = throttle(() => {
    if (gameState() !== 'FINISH') return;
    setCountDown(c => c - 1);
    if (countDown() < 0) {
      setIsCountDown(false);
      setMatchText("");
      setGameState("PREPARE")
    }
  }, 1000)

  const [player1, setPlayer1] = createSignal([...Array(round).map(e => '-')]);
  const [player2, setPlayer2] = createSignal([...Array(round).map(e => '-')]);

  const [index, setIndex] = createSignal(0)

  function calculateWinning(left: string, right: string) {
    if (left === "scissors" && right === "paper")
      return true;
    else if (right === "scissors" && left === "paper")
      return false;
    else if (left === "rock" && right === "paper")
      return false;
    else if (right === "rock" && left === "paper")
      return true;
    else if (left === "rock" && right === "scissors")
      return true;
    else if (right === "rock" && left === "scissors")
      return false;
    else
      return null;
  }

  const [result, setResult] = createSignal("Draw");

  createEffect(() => {
    let p1 = player1()
    let p2 = player2();
    let s1 = 0, s2 = 0;
    for (let i = 0; i < p1.length; i++) {
      if (calculateWinning(p1[i], p2[i]) == null) {
        s1++;
        s2++;
      } else if (calculateWinning(p1[i], p2[i])) {
        s1++;
      } else {
        s2++;
      }
    }

    if (s1 > s2) setResult("Player 1 won!");
    else if (s2 > s1) setResult("Player 2 won!");
    else setResult("Draw!")
  })

  function checkGameState() {
    const left = detections().find(hand => (hand.x + hand.x + hand.width) / 2 <= (setting()?.size[0] || 620) / 2);
    const right = detections().find(hand => (hand.x + hand.x + hand.width) / 2 > (setting()?.size[0] || 620) / 2);
    setLeftHand(left);
    setRightHand(right);

    if (gameState() === "PREPARE") {
      const checkState = typeof leftHand() !== 'undefined' && typeof rightHand() !== "undefined" && leftHand()?.label === "scissors" && rightHand()?.label === 'scissors'
      if (checkState) {
        setIsCountDown(true);
        setStateTitle("🚩 Good then, game will start now!")
        checkReadyState();
      } else {
        setStateTitle("✅ Just checking... Getting ready by showing ✌️ hands.");
        setCountDown(4);
        setIsCountDown(false);
      }
    }
    else if (gameState() === "READY") {
      if (!isCountDown()) {
        setIsCountDown(true);
        setCountDown(4);
      }
      readyState();
    }
    else if (gameState() === "GAMEPLAY") {
      if (!isCountDown()) {
        setCountDown(3);
        setIsCountDown(true);
      }
      checkGameplayState();
    } else if (gameState() === "FINISH") {
      if (!isCountDown()) {
        setIsCountDown(true);
        setCountDown(1);
      }
      showResultState();
    }
  }

  const checkHand = (data: string) => ({
    "rock": "✊",
    "paper": "✋",
    "scissors": "✌️",
  }[data] || "⚪")

  onCleanup(() => {
    window.ipcRenderer.removeAllListeners("sidecar");
    clearTimeout(timeout);
  });

  function onLoadedMedia(e: HTMLVideoElement) {
    const box = e.getBoundingClientRect()
    setVideoSize([box.width, box.height])
  }

  return (
    <Box
      sx={{
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        inset: 0,
        color: "white",
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '90vw', height: '100%', maxHeight: '90vh', padding: '4rem' }}>
        <Box sx={{ position: 'relative', borderRadius: 3, overflow: "hidden", width: '100%', height: '100%' }}>
          {/* <Box sx={{ position: 'absolute', top: 2, left: 2 }}>
            {detections().length}
          </Box> */}
          {/* <For each={detections()}>
            {
              (item, index) => <>
                <Box sx={{ position: 'absolute', top: (100 * item.y / setting()?.size[1]) + '%', left: (100 * item.x / setting()?.size[0]) + '%', width: (100 * item.width / videoSize()[0]) + '%', height: (100 * item.height / videoSize()[1]) + '%', background: 'rgba(0,0,0,.5)' }}>
                  Confident Level{item.confidence}, top: {(item.y / setting()?.size[1])}, left: {(item.x / setting()?.size[0])}
                </Box>
              </>
            }
          </For> */}
          <Show when={gameState() === "GAMEPLAY" || gameState() === "READY" || gameState() === "FINISH" || true}><Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'fixed', left: 0, right: 0, bottom: '0', top: '1rem'
          }}>
            <Box sx={{ padding: 2, borderRadius: '.5rem', alignItems: 'center', display: 'flex', gap: 10, justifyContent: 'space-between', background: 'rgba(0,0,0,.1)', }}>
              <Box sx={{ display: 'flex', gap: 2 }}>Player 1 <For each={player1()}>{v => <Box sx={{ opacity: v === '-' ? .2 : 1 }}> {checkHand(v)} </Box>}</For></Box><b style={{ "font-size": '24px' }}>{index() + 1}</b> <Box sx={{ display: 'flex', gap: 2 }}><For each={player2()}>{v => <Box sx={{ opacity: v === '-' ? .2 : 1 }}> {checkHand(v)} </Box>}</For> Player 2</Box></Box>
          </Box></Show>
          <Show when={gameState() === "PREPARE"} fallback={<></>}>
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              position: 'absolute', left: 0, right: 0, bottom: '0', top: '1rem'
            }}>
              <Box sx={{ padding: 2, borderRadius: '.5rem', background: 'rgba(0,0,0,.7)', }}>
                {stateTitle}</Box>
            </Box>
          </Show>

          <Show when={gameState() === "READY"} fallback={<></>}>
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              position: 'absolute', left: 0, right: 0, bottom: '0', top: '1rem'
            }}>
              <Box sx={{ padding: 2, borderRadius: '.5rem', background: 'rgba(0,0,0,.7)', }}>
                🫠 Prepare for round {index() + 1} ...</Box>
            </Box>
          </Show>

          <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', left: 0, right: '50%', bottom: '1rem', top: 0 }}>
            <Show when={typeof leftHand() !== "undefined"} fallback={<></>}>
              <Box sx={{ padding: 2, borderRadius: '.5rem', background: 'rgba(0,0,0,.7)', }}>
                Detect {checkHand('' + leftHand()?.label)}</Box>
            </Show>
          </Box>

          <Box sx={{ position: 'absolute', left: '50%', right: '0%', bottom: '1rem', top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', }}>
            <Show when={typeof rightHand() !== "undefined"} fallback={<></>}>
              <Box sx={{ padding: 2, borderRadius: '.5rem', background: 'rgba(0,0,0,.7)', }}>
                Detect {checkHand('' + rightHand()?.label)}</Box>
            </Show>
          </Box>
          <Show when={isCountDown() && (gameState() === "PREPARE" || gameState() === "READY")} fallback={<></>}>
            <Box sx={{ zIndex: 500, position: 'absolute', fontSize: '120px', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {countDown}
            </Box>
          </Show>
          <Show when={matchText() !== ""} fallback={<></>}>
            <Box sx={{ zIndex: 500, position: 'absolute', fontSize: '32px', left: 0, right: 0, bottom: '7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: 'rgba(0,0,0,.2)', padding: '1rem', "border-radius": '6px' }}>{matchText}</span>
            </Box>
          </Show>

          <Box sx={{ zIndex: 1, position: 'absolute', left: 0, right: '50%', bottom: '0', top: 0, borderRight: '2px dashed rgba(0,0,0,.3)' }}></Box>
          <video onLoad={e => onLoadedMedia(e.target as any)} autoplay id="videoElement" style={{ width: "100%" }}></video>
        </Box>
      </Box>
      <Show when={index() >= round}>
        <Box sx={{ position: 'fixed', display: 'flex', justifyContent: 'center', alignItems: 'center', inset: 0, zIndex: 1000, background: `url('${BG}')`, backgroundSize: 'cover' }}>
          <Box sx={{ border: '.5px solid rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', borderRadius: '12px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(0,0,0,.2)', padding: 3, transform: 'scale(1.5)' }}>
            <Typography sx={{ color: 'pink', textAlign: 'center' }}>🧠 Match Result</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              Player 1 <For each={player1()}>
                {v => <Box sx={{ opacity: v === '-' ? .2 : 1 }}> {checkHand(v)} </Box>}</For></Box>
            <Box sx={{ display: 'flex', gap: 2 }}>Player 2 <For each={player2()}>{v => <Box sx={{ opacity: v === '-' ? .2 : 1 }}> {checkHand(v)} </Box>}</For> </Box>
            <Typography color="gold" fontSize="12px" textAlign="center">{result}</Typography>
            <Button variant="contained" size="small" onClick={() => navigate('/', { replace: true })}>Main menu</Button>
          </Box>
        </Box>
      </Show>
    </Box >
  );
};

export default Game;

import { createEffect, onCleanup } from "solid-js";
import { Box } from "@suid/material";
import { useLocation, useNavigate } from "solid-app-router";
function parseData(message: string): {
  success: boolean;
  data?: any;
  message: string;
} {
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
  window.ipcRenderer.send("gameState", "started");

  window.ipcRenderer.on("sidecar", (event, arg) => {
    // console.log(event, parseData(arg));
  });

  const timeout = setTimeout(() => {
    var video: any = document.querySelector("#videoElement");
    console.log(video);
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          if (video) {
            video.srcObject = stream;
          }
        })
        .catch(function (err0r) {
          console.log("Something went wrong!", err0r);
        });
    }
  }, 2000);

  onCleanup(() => {
    window.ipcRenderer.removeAllListeners("sidecar");
    clearTimeout(timeout);
  });

  return (
    <Box
      sx={{
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        inset: 0,
        background: "#262626",
        color: "white",
      }}
    >
      <Box sx={{ borderRadius: 3, overflow: "hidden" }}>
        <video autoplay id="videoElement" style={{ width: "100%" }}></video>
      </Box>
    </Box>
  );
};

export default Game;

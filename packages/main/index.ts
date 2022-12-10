import { app, BrowserWindow, ipcRenderer, shell } from "electron";
import { release } from "os";
import { join } from "path";
import { spawn } from "child_process";
import "./samples/electron-store";

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
  });

  if (app.isPackaged) {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;

    win.loadURL(url);
    win.webContents.openDevTools();
  }

  // Test active push message to Renderer-process
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
    // console.log(
    //   "Main-process message sent",
    //   join(process.cwd(), "yolov5", "detect.py")
    // );
    // const ls = spawn("python", [
    //   join(process.cwd(), "yolov5", "detect.py"),
    //   "--source",
    //   "0",
    //   "--weight",
    //   join(process.cwd(), "yolov5", "best.pt"),
    // ]);

    // ls.stdout.on("data", (data) => {
    //   // console.log(`stdout: ${data}`);
    //   // console.log(parseData(data.toString()));
    //   win?.webContents.send("sidecar", `${data}`);
    // });

    // ls.stderr.on("data", (data) => {
    //   win?.webContents.send("sidecar", `${data}`);
    // });

    // ls.on("close", (code) => {
    //   console.log(`child process exited with code ${code}`);
    // });
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

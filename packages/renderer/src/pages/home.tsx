import { Box, Button, Typography } from "@suid/material";
import { useNavigate } from "solid-app-router";
import { createSignal } from "solid-js";

export default function Home() {
  const [round, setRound] = createSignal(0);
  const navigate = useNavigate();

  function setRoundTo(round: number) {
    return () => setRound(round);
  }

  function startGame() {
    navigate("/game", {
      state: {
        round: round(),
      },
    });
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
        background: "#262626",
      }}
    >
      <Typography color="white" variant="h3">
        Rock Paper Scissors
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          marginTop: "3rem",
        }}
      >
        <Typography color="white" mr={3}>
          Choose rounds:{" "}
        </Typography>
        <Button
          variant={round() === 1 ? "contained" : "text"}
          onClick={setRoundTo(1)}
        >
          1
        </Button>
        <Button
          variant={round() === 3 ? "contained" : "text"}
          onClick={setRoundTo(3)}
        >
          3
        </Button>
        <Button
          variant={round() === 5 ? "contained" : "text"}
          onClick={setRoundTo(5)}
        >
          5
        </Button>
        <Button
          variant={round() === 7 ? "contained" : "text"}
          onClick={setRoundTo(7)}
        >
          7
        </Button>
      </Box>
      <Button
        variant="contained"
        sx={{ marginTop: "2rem" }}
        onClick={startGame}
        disabled={round() === 0}
        color="success"
      >
        Start Game
      </Button>
    </Box>
  );
}

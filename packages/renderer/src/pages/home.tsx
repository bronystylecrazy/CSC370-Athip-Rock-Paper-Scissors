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
      }}
    >
      <Box sx={{ padding: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '.5px solid rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', borderRadius: '12px', }}>
        <Typography color="white" variant="h3" sx={{ fontWeight: '200' }}>
          ROCK•PAPER•SCISSORS
        </Typography>
        <Typography textAlign="center" mt={1} color="rgba(255,255,255,.2)">A deep learning project for CSC370-Artificial Intelligence</Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: 'center',
            gap: 1,
            marginTop: "2rem",
          }}
        >
          <Typography color="white" mr={3}>
            Choose rounds:{" "}
          </Typography>
          <Button
            variant={round() === 1 ? "contained" : "text"}
            onClick={setRoundTo(1)}
            sx={{ borderRadius: '10000px' }}
          >
            1
          </Button>
          <Button
            variant={round() === 3 ? "contained" : "text"}
            onClick={setRoundTo(3)}
            sx={{ borderRadius: '10000px' }}
          >
            3
          </Button>
          <Button
            variant={round() === 5 ? "contained" : "text"}
            onClick={setRoundTo(5)}
            sx={{ borderRadius: '10000px' }}
          >
            5
          </Button>
          <Button
            variant={round() === 7 ? "contained" : "text"}
            onClick={setRoundTo(7)}
            sx={{ borderRadius: '10000px' }}
          >
            7
          </Button>
        </Box>
        <Button
          variant="outlined"
          sx={{ marginTop: "2rem" }}
          onClick={startGame}
          disabled={round() === 0}
          color="success"
          size="large"
        >
          Start Game
        </Button>
      </Box>
    </Box >
  );
}

const queryParams = new URLSearchParams(window.location.search);
const speed = queryParams.get("speed");

export const GAME_SPEED = speed
  ? parseInt(speed)
  : parseInt(process.env.SPEED || "1");

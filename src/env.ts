export const GAME_SPEED = location.search
  ? parseInt(location.search.split("?")[1].split("=")[1])
  : parseInt(process.env.SPEED || "1");

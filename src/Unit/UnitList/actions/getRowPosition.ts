export function getRowPosition(x: number, y: number, index: number) {
  const lineHeight = 100;
  return {
    x,
    y: y + lineHeight * index,
  };
}

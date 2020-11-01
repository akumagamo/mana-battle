export const invertBoardPosition = (n: number) => {
  // TOOD: use a range, like this
  // const positions = [1,2,3]
  // return positions.reverse()[n+1]

  if (n === 1) return 3;
  else if (n === 3) return 1;
  else return n;
};

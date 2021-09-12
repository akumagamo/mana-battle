import { getMember, invertBoardPosition, SquadRecord } from "../Squad/Model"

export const memberToBoardPosition = (isLeftSquad: boolean) => ({
    x,
    y,
}: {
    x: number
    y: number
}) => {
    return {
        x: isLeftSquad ? x : invertBoardPosition(x) + 4,
        y: isLeftSquad ? y : invertBoardPosition(y),
    }
}

export const renderPieceOnCell = ({ x, y }: { x: number; y: number }) => {
    const boardX = 210
    const boardY = 120

    return {
        x: boardX + x * 110,
        y: boardY + y * 80,
    }
}

export const placeUnitOnBoard = (isLeftSquad: boolean) => (
    squad: SquadRecord
) => (memberId: string) =>
    renderPieceOnCell(
        memberToBoardPosition(isLeftSquad)(getMember(memberId, squad))
    )

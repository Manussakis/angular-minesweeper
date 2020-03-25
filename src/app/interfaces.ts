import { CellCodeEnum } from './enums';
export interface ICellStructure {
    type: string|number;
    y: number;
    x: number;
    i: number;
    label: CellCodeEnum|string;
    isOpened: boolean;
    isMine: boolean;
    isMineExploded: boolean;
    isCenterZero?: boolean;
    openedIdClassName?: string;
    isWrongFlag?: boolean;
}

export interface IBoardData { 
    board: number[][] | any[][];
    isBoardReseted: boolean;
}

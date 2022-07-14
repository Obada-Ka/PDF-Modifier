export interface BordersValues{
    MypagePfWidth: number;
    MypagePfOffsetLeft: number;
    MypagePfHeight: number;
    MypagePfOffsetTop: number;
    eventXHolder: number;
    eventYHolder: number;
    offsetXHolder: number;
    offsetYHolder: number;
    topBorderPointy: number;
    rightBorderPointx: number;
    bottomBorderPointy: number;
    leftBorderPointx: number;
    leftBottomCords?: {
        x: number,
        y: number,
        lowestYx?: number
    };
    containerPosition?: {
        x: number,
        y: number
    };
    checkBorder?: boolean;
}

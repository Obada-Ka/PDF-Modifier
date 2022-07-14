export interface UpdateLocation {
    displacementXY: {
        x: number,
        y: number
    };
    correctValuesAfterBordersXY: {
        x: number,
        y: number
    };
    iframePage: any;
    pfXX: any;
    leftBottomCords?: {
        x: number,
        y: number,
        lowestYx?: number
    };
    workingPage: number;
    specificPage?: boolean;
}

export class Period {
    id: number;
    start: string;
    end: string;

    constructor(
        id: number,
        start: string,
        end: string,
    ) {
        this.id = id;
        this.start = start;
        this.end = end;
    }
}

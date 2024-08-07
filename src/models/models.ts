export interface Drop {
    id: number;
    name: string;
    streams?: Stream[];
}

export interface Stream {
    name: string;
    link: string;
}
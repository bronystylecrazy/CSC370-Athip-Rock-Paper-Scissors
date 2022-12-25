export type CaptureData = {
    label: string;
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export type Responses<T> = {
    "detects": number;
    "source": "webcam";
    "detection": T[];
    "size": [number, number];
    "success": boolean;
}

export type GameState = "PREPARE" | "READY" | "GAMEPLAY" | "FINISH" | "ENDING"
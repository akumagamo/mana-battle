export type JobPluginExternalData = {
    id: string
    animations: {
        [x: string]: {
            prefix: string
            start: number
            end: number
            zeroPad: number
            suffix: string
            repeat: number
            yoyo: boolean
        }
    }
}

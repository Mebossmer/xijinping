export function getTimeString(date: Date): string {
    var hours = date.getUTCHours().toString()
    if(date.getUTCHours() < 10) {
        hours = `0${date.getUTCHours()}`
    }

    var minutes = date.getUTCMinutes().toString()
    if(date.getUTCMinutes() < 10) {
        minutes = `0${date.getUTCMinutes()}`
    }

    var seconds = date.getUTCSeconds().toString()
    if(date.getUTCSeconds() < 10) {
        seconds = `0${date.getUTCSeconds()}`
    }

    return `${hours}:${minutes}:${seconds}`
}

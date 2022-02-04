export function shorten(hash, { length = 3 } = {}) {
    if(!hash) return ""
    return hash.substring(0, length + 2) + "..." + hash.substring(hash.length - length);
}
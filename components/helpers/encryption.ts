export const simple_hash = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const length = 25;
    let hash = ""
    for (let i = 0; i < length; i++) {
        hash += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return hash
}
import { customAlphabet } from "nanoid";

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const generateBase62Id = customAlphabet(BASE62, 7);

export function randomUrl(): string {
    return generateBase62Id();
}
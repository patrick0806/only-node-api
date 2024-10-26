import crypto from 'node:crypto';

export class CryptoUtils {
    public static hashPassword(password: string) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
        return { hash, salt }
    }

    public static comparePassword(password: string, salt: string, hash: string) {
        const newKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
        return newKey === hash;
    }
}
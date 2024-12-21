export interface PasswordResult {
    length: boolean;
    upperCase: boolean;
    specialChar: boolean;
}

export function validatePassword(password: string): PasswordResult {
    const result: PasswordResult = {
        length: false,
        upperCase: false,
        specialChar: false,
    };

    if (password.length >= 8) {
        result.length = true;
    }

    for (const c of password) {
        if (c >= 'A' && c <= 'Z' && !result.upperCase) {
            result.upperCase = true;
        } else if (!/[a-zA-Z0-9]/.test(c) && !result.specialChar) {
            result.specialChar = true;
        }
    }

    return result;
}

export function passwordOk(result: PasswordResult): boolean {
    return result.length && result.upperCase && result.specialChar;
}

import * as CryptoJS from 'crypto-js';

export class CryptoUtil {

    public encryptData(data: string): string {
        let encrypted: string = data;
        if (data && data != 'null') {
            let key = CryptoJS.enc.Utf8.parse('4792074259234687');
            let iv = CryptoJS.enc.Utf8.parse('4792074259234687');
            encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key,
                {
                    keySize: 128 / 8,
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
        }
        return encrypted;
    }

    public decryptData(encryptedData: string): string {
        let decrypted: string = encryptedData;
        if (encryptedData && encryptedData != 'null') {
            let key = CryptoJS.enc.Utf8.parse('4792074259234687');
            let iv = CryptoJS.enc.Utf8.parse('4792074259234687');
            decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8);
        }
        return decrypted;
    }

    public encryptDataUsingKeyPadding(data: string, keyValue: string, ivValue: string): string {
        let key = CryptoJS.enc.Utf8.parse(keyValue);
        let iv = CryptoJS.enc.Utf8.parse(ivValue);
        let encrypted: string = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        return encrypted;
    }

    public decryptDataUsingKeyPadding(encryptedData: string, keyValue: string, ivValue: string): string {
        let key = CryptoJS.enc.Utf8.parse(keyValue);
        let iv = CryptoJS.enc.Utf8.parse(ivValue);
        let decrypted: string = CryptoJS.AES.decrypt(encryptedData, key, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
        return decrypted;
    }

    public generateHash(request, salt): string {
        var sha256 = CryptoJS.SHA256(salt + request);
        return sha256.toString();
    }

}
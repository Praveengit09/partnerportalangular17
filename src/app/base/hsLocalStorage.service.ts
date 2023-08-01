import { Injectable } from '@angular/core';
import { CryptoUtil } from './../auth/util/cryptoutil';

@Injectable()
export class HsLocalStorage {
    constructor() { }
    private static COMPONENT_DATA: string = "component_data";

    saveComponentData(data: any) {
        this.setDataEncrypted(HsLocalStorage.COMPONENT_DATA, data);
    }

    getComponentData() {
        return this.getDataEncrypted(HsLocalStorage.COMPONENT_DATA);
    }

    setDataEncrypted(key: string, data: any) {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.removeItem(key);
        window.localStorage.setItem(key, cryptoUtil.encryptData(JSON.stringify(data)));
    }

    getDataEncrypted(key: string) {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        let data = null;
        if (window.localStorage.getItem(key) != null && window.localStorage.getItem(key).length > 0) {
            data = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem(key)));
        }
        return data;
    }

    setData(key: string, data: any) { //method for storing autorefresh interval
        window.localStorage.removeItem(key);
        window.localStorage.setItem(key, JSON.stringify(data));
    }

    getData(key: string) {  //method for retrieving autorefresh interval
        let data = null;
        if (window.localStorage.getItem(key) != null && window.localStorage.getItem(key).length > 0) {
            try {
                let item = window.localStorage.getItem(key)
                data = item ? JSON.parse(item) : undefined;
            } catch (error) {
                console.log(error);
            }
        }
        return data;
    }

    removeData(key: string) {
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.log(error);
        }
    }
}
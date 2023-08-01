import { Injectable } from '@angular/core'

@Injectable()
export class ValidationUtil {

    //This will allow only Numbers with Decimal up to two characters No alphabets and No Special character
    onlyDecimalValueTillTwoDigits(evt) {
        console.log("event" + JSON.stringify(evt));
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode == 46 && evt.srcElement.value.split('.').length > 1) {
            return false;
        }
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        var velement = evt.target || evt.srcElement
        var fstpart_val = velement.value;
        var fstpart = velement.value.length;
        console.log("length" + fstpart);
        if (fstpart.length == 2) return false;
        var parts = velement.value.split('.');
        console.log("split" + parts);
        if (parts[0].length >= 14) return false;
        if (parts.length == 2 && parts[0].length <= 10 && parts[1].length >= 2) return false;
    }

    //This will decimal value up to two characters on Number type TextBox
    decimalValueforTwoCharacters(evt) {
        var keyCode = evt.keyCode ? evt.keyCode : ((evt.charCode) ? evt.charCode : evt.which);
        if (!(keyCode >= 48 && keyCode <= 57)) {
            return true;
        }
        var velement = evt.target || evt.srcElement
        var fstpart_val = velement.value;
        var fstpart = velement.value.length;
        if (fstpart.length == 2) return false;
        var parts = velement.value.split('.');
        if (parts[0].length >= 14) return false;
        if (parts.length == 2 && parts[1].length >= 2) return false;
    }

    //This method will allow only Numbers and Text characters No special characters
    noSpecialCharacters(evt) {
        var keyCode = evt.keyCode ? evt.keyCode : ((evt.charCode) ? evt.charCode : evt.which);
        if (keyCode != 8 && (keyCode < 48 || (keyCode > 57 && keyCode < 65) || (keyCode > 90 && keyCode < 97) || keyCode > 122)) {
            return false;
        } else {
            return true;
        }
    }
    // This method will allow only alphabets
    onlyAlphabets(evt) {
        var keyCode = evt.keyCode ? evt.keyCode : ((evt.charCode) ? evt.charCode : evt.which);
        if (keyCode != 8 && (keyCode < 48 || (keyCode > 57 && keyCode < 65) || (keyCode > 90 && keyCode < 97) || keyCode > 122 || (keyCode > 47 && keyCode < 58))) {
            return false;
        } else {
            return true;
        }
    }

    // This method will allow only alphabets with spacebar
    onlyAlphabetsWithSpace(evt) {
        var keyCode = evt.keyCode ? evt.keyCode : ((evt.charCode) ? evt.charCode : evt.which);
        if (keyCode != 8 && (keyCode < 32 || (keyCode > 32 && keyCode < 48) || (keyCode > 57 && keyCode < 65) || (keyCode > 90 && keyCode < 97) || keyCode > 122 || (keyCode > 47 && keyCode < 58))) {
            return false;
        } else {
            return true;
        }
    }

    //This method will allow only number characters no special charaters and alphabets
    onlyNumbers(evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode < 48 || charCode > 57) {
            return false;
        }
        return true;
    }

    //This method will prevent Number textbox for scrolling
    noMouseScrollforNumberTextBox() {
        $('input[type=number]').on('mousewheel.disableScroll', function (e) {
            e.preventDefault()
        })
    }

    //This method prevents number textbox to UP/DOWN keys
    noArrowKeyforNumberTextBox() {
        $("input[type=number]").on("focus", function () {
            $(this).on("keydown", function (event) {
                if (event.keyCode === 38 || event.keyCode === 40) {
                    event.preventDefault();
                }
            });
        });
    }

    //This method will allow only email specific character and check format for email specific
    validateEmail(evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        console.log("code", charCode);
        if (charCode > 95 && charCode < 106)
            return true;
        if (((charCode > 31 && charCode < 48) && charCode != 46)) {
            return false;
        }
        if ((charCode > 57 && charCode < 64) || charCode == 32)
            return false;
        return true;
    }

    public static validateText = (input, max: number = 10) => {
        let text = input + '';
        return text.replace(/[0-9.,`~>!@#$%=^&*()_+{}":?</*\-+';\\\]\[]/gim, '').slice(0, max);
    }
    public static validateTextWithNumber(input, max: number = 30): string {
        let text = input + '';
        let match = text.match(new RegExp("\\w\{0," + (max - 1) + "\}", "g"));
        if (match && match[0]) return match[0] + '';
        return '';
    }
    public static validateInteger = (input, max = 10) => {
        let text = input + '';
        let match = text.match(new RegExp("\(\[1\-9\]\)\(\[0\-9\]\?\)\{1," + (max - 1) + "\}", "g"));
        if (match && match[0]) return match[0];
        return 0;
    }
}
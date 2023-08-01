import { Injectable } from '@angular/core'

import { Config } from '../../base/config';

@Injectable()
export class CommonUtil {

    //Get age in Years and months format by passing dob pass data using below line
    //this.commonUtil.getAge(queue.patientDOB).split(",")[0]+this.commonUtil.getAge(queue.patientDOB).split(",")[1];
    getAge(dob: number): string {
        let age: string = '';
        var date = new Date(dob);
        if (date.getMonth() == 12) {
            var ageYears = (((new Date()).getFullYear()) - (date.getFullYear() + 1)) + 1;
            var ageMonths = 0;

        } else {
            var ageYears = (new Date()).getFullYear() - (date.getFullYear() + 1);
            if (ageYears <= 0) {
                if (date.getMonth() == new Date().getMonth()) {
                    var ageMonths = 0;
                }
                else {
                    var ageMonths = 12 - (date.getMonth() - new Date().getMonth());
                }
            } else {
                var ageMonths = 12 - (date.getMonth() - new Date().getMonth());
                if (ageMonths == 12) {
                    ageYears = ageYears + 1;
                    ageMonths = 0;
                }
            }
            if (ageMonths > 12) {
                ageYears = ((new Date()).getFullYear() - (date.getFullYear() + 1)) + 1;
                ageMonths = ageMonths - 12;
            }
        }

        if (ageYears < 18) {
            if (ageYears < 1) {
                age = ',' + ageMonths + ' Months';
            } else if (ageMonths < 1) {
                age = ageYears + ' Years ' + ',';
            } else {
                age = ageYears + ' Years ' + ',' + ageMonths + ' Months';
            }
        } else {
            age = ageYears + ' Years ' + ',';
        }

        return age;
    }
    //Get age in Years and months format by passing dob Witout any condition
    getAgeForall(dob: number): string {
        let age: string = '';
        // console.log(dob);
        var date1 = new Date();
        date1.getDate();
        date1.getMonth();
        date1.getFullYear();
        date1.setHours(0);
        date1.setMinutes(0);
        date1.setSeconds(0);
        date1.setMilliseconds(0);
        // console.log("here are the list=====>>>" + date1.getTime() + "============" + dob)
        if (dob == date1.getTime()) {
            var ageMonths = 0;
            var ageYears = 0;
            age = "0";
            return age;
        }
        var date = new Date(dob);
        // console.log("In age 12===>" + (date.getMonth() + 1));
        if (date.getMonth() == 12) {
            var ageYears = (((new Date()).getFullYear()) - (date.getFullYear() + 1)) + 1;
            var ageMonths = 0;

        } else {
            var ageYears = (new Date()).getFullYear() - (date.getFullYear() + 1);
            if (ageYears < 0) {
                if (date.getMonth() == new Date().getMonth()) {
                    var ageMonths = 0;
                    var ageYears = 0;
                }
                else {
                    var ageMonths = 12 - (date.getMonth() - new Date().getMonth());
                }
            } else {
                var ageMonths = 12 - (date.getMonth() - new Date().getMonth());
                if (ageMonths == 12) {
                    ageYears = ageYears + 1;
                    ageMonths = 0;
                }
            }
            if (ageMonths > 12) {
                ageYears = ((new Date()).getFullYear() - (date.getFullYear() + 1)) + 1;
                ageMonths = ageMonths - 12;
            }


            // console.log(ageMonths + "AGE from DOB=+++>>>" + ageYears);

        }

        age = ageYears + ' Years ' + ',' + ageMonths + ' Months';

        return age;
    }

    getYearOnlyAgeForall(dob: number): string {
        let age: string = '';
        // console.log(dob);
        var date = new Date(dob);
        // console.log("In age 12===>" + (date.getMonth() + 1));
        if ((date.getMonth() + 12) == 12) {
            var ageYears = (((new Date()).getFullYear()) - (date.getFullYear() + 1)) + 1;
            var ageMonths = 0;
            //console.log("In age 12===>"+date.getFullYear());
        } else {

            //if(((new Date()).getMonth()+1)<=6){
            var ageYears = (new Date()).getFullYear() - (date.getFullYear() + 1);
            if (ageYears == 0) {
                var ageMonths = 12 - (date.getMonth() - (new Date().getMonth() + 1));
            } else {
                var ageMonths = 12 - (date.getMonth() - new Date().getMonth());
            }
            if (ageMonths > 12) {
                ageYears = ((new Date()).getFullYear() - (date.getFullYear() + 1)) + 1;
                ageMonths = ageMonths - 12;
            }
        }

        age = ageYears + 'Y'

        return age;
    }

    //Get dob in timestamp format by passing years and months
    getDobFromAge(years, months) {
        // console.log(months + "from dob-->" + years);
        var dob: number = 0;
        var date: Date = new Date();
        if (!years || years == 0) {
            //alert(months+"   "+(date.getMonth()+1));
            if (!months || months == 0) {
                var year = date.getFullYear();
            }
            else {
                var year = ((date.getFullYear() - 1) - years);
            }
            var month = (date.getMonth()) - months;
            if (month < date.getMonth()) {
                month = 12 + month;
            }
            date.setFullYear(year);
            date.setMonth(month);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
        } else {
            var year = (date.getFullYear() - 1) - years;
            var month = 12 - (months - date.getMonth());
            date.setFullYear(year);
            date.setMonth(month);
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
        }
        //var month = 12 - (months - (date.getMonth()));        
        // console.log(month + "dob-->" + year);

        dob = date.getTime();
        // console.log(dob + " Date---->" + date);
        return dob;
    }
    sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    //This method will convert current time and date to timestamp
    convertCurrentDateToTimeStamp(str) {
        var d = str;
        var n = str.getTime();
        return n;
    }

    //This method will make time 0 and then convert to timestamp
    convertOnlyDateToTimestamp(str) {
        str.setHours(0);
        str.setMinutes(0);
        str.setSeconds(0);
        str.setMilliseconds(0);

        return str.getTime();
    }

    convertOnlyTimeToTimestamp(str) {
        str.setDate(1);
        str.setMonth(0);
        str.setFullYear(1970);

        return str.getTime();
    }

    convertDateToTimestamp(str) {
        str.setHours(0);
        str.setMinutes(0);
        str.setSeconds(0);
        str.setMilliseconds(0);
        // console.log("Time stamp-->" + str);
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        var dateString = [day, mnth, date.getFullYear()].join("-");
        var newDate = new Date(dateString.split("-").reverse().join("-")).getTime();
        return newDate;
    }

    convertDateToDayOfWeek(str) {
        return new Date(str).getDay();
    }

    convertToDate(str) {
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [day, mnth, date.getFullYear()].join("-");
    }
    convertTimeStampToDate(input) {
        var d = new Date(input);
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + '  ' + d.getHours() + ':' + d.getMinutes();
    }

    //Date picker display
    showTiepicker() {
        $(".bootstrap-timepicker-widget").css("display", "block");
    }

    //Convert Date or Time to UTC Time stamp
    toUTCFormatTimeStamp(date) {
        var d1 = new Date(Date.parse(new Date(date).toUTCString())).getTime();
        return d1;
    }

    //Convert Date or Time from string to UTC Time stamp
    convertTimeToUTC(date) {
        let hour = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let millisecond = date.getMilliseconds()
        let time = new Date(Date.UTC(1970, 0, 1, hour, minutes, seconds, millisecond)).getTime();
        return time;
    }

    convertMinutesToUTC(Minutes) {
        let d2 = new Date(Date.UTC(1970, 1, 1, 0, Minutes, 0, 0)).getTime();
        return d2;
    }

    convertOnlyDateToUTC(date) {
        let year = date.getUTCFullYear();
        let month = date.getUTCMonth();
        let day = date.getUTCDate();
        var d2 = new Date(Date.UTC(year, month, day, 0, 0, 0)).getTime();
        return d2;
    }

    convertOnlyTimeStampToTime(timestamp) {
        var date = new Date(timestamp);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        return hours + ':' + minutes.substr(-2) + "";
    }

    //combines given date and time into single date object and compares it with present date and time.
    dateAndTimeValidation(date, time) {
        var tempdate = new Date(date);
        var tempSlotTime = new Date(time);
        var tempDateTime = new Date(tempdate.getFullYear(), tempdate.getMonth(), tempdate.getDate(),
            tempSlotTime.getHours(), tempSlotTime.getMinutes(), tempSlotTime.getSeconds()).getTime();
        if ((tempDateTime) < new Date().getTime()) {
            return -1;
        }
        else if ((tempDateTime) > new Date().getTime()) {
            return 1;
        }
        else {
            return 0;
        }
    }

    getTimezoneDifferential() {
        return +Config.portal.timezoneDifferential;
    }

    getBoldString(text) {
        var str = `<b> + ${text} + </b>`
        console.log("getBoldString: ", str);
        return str;
    }

    boldString(str, substr) {
        var strRegExp = new RegExp(substr, 'g');
        return str.replace(strRegExp, '<b>' + substr + '</b>');
    }

    getFormattedConsumerInteractionData(item) {
        console.log("item: ", item);
        let tempString = "";
        let name = item.consumerInteractedEmployeeName ? ('<b>Name: </b>' + item.consumerInteractedEmployeeName) : '';
        let status = item.consumerInteractionStatus ? ('<b>Status: </b>' + item.consumerInteractionStatus) : '';
        let date = item.consumerInteractionDate ? ('<b>Date: </b>' + this.convertTimeStampToDate(item.consumerInteractionDate)) : '';
        let comments = item.consumerInteractedComments ? ('<b>Comments: </b>' + item.consumerInteractedComments) : '';
        console.log("Check: ", name + ">>>: ", status + ">>>>: ", comments);
        tempString = name + "<br>" + status + "<br>" + date + "<br>" + comments + "<br>" + "<br>";
        console.log("InteractionData: ", tempString);
        return tempString;
    }

    getFormattedDoctorInteractionData(item) {
        let tempString = "";
        let name = item.doctorInteractedEmployeeName ? ("<b>Name: </b>" + item.doctorInteractedEmployeeName) : "";
        let status = item.doctorInteractedStatus ? ("<b>Status: </b>" + item.doctorInteractedStatus) : "";
        let date = item.doctorInteractionDate ? ('<b>Date: </b>' + this.convertTimeStampToDate(item.doctorInteractionDate)) : '';
        let comments = item.doctorInteractionComments ? ("<b>Comments: </b>" + item.doctorInteractionComments) : "";
        tempString = name + "<br>" + status + "<br>" + date + "<br>" + comments + "<br>" + "<br>";
        console.log("InteractionData: ", tempString);
        return tempString;
    }

    getFormattedFeedbackDetails(userRating) {
        let formattedDataString = '';
        let tmp = new Array();
        if (userRating && userRating.userRating > 0) {
            formattedDataString += '<div><b>User Rating: </b>' + userRating.userRating + '/ 5</div>';
            let index = 0;
            userRating.question.forEach(question => {
                index++;
                let tmpTxt = '<br/>' + index + '. <b>Question: </b>' + question.text;
                if (question.componentId == 2 || question.componentId == 8 || question.componentId == 9) {
                    // Text question
                    // tmpTxt += '<br/><b>  Answer: </b>' + question.ans;
                    let tempTxt1 = '';
                    let substringSize = 80;
                    let totalSubstrings = Math.ceil(question.ans.length / substringSize);
                    for (let i = 0; i < question.ans.length; i = i + substringSize) {
                        tempTxt1 +=
                            question.ans.substring(i, Math.min(i + substringSize, question.ans.length)) + '\n';
                    }
                    tmpTxt += '<br/><b>  Answer: </b>' + tempTxt1;

                } else if (question.componentId == 0) {
                    // Dropdown
                    let answer = '';
                    if (question.choices && question.choices.length > 0
                        && question.choices[0] && question.choices[0].length > 0) {
                        let choices = question.choices[0];
                        let tmpChoice = choices.filter(item => item.id == question.ans);
                        if (tmpChoice && tmpChoice.length > 0) {
                            answer = tmpChoice[0].option;
                        }
                    }
                    tmpTxt += '<br/><b>  Answer: </b>' + answer;
                } else if (question.componentId == 5) {
                    //multiselection checkbox
                    let answer = '';
                    if (question.choices && question.choices.length > 0
                        && question.choices[0] && question.choices[0].length > 0) {
                        let choices = question.choices[0];
                        let tmpChoice = choices.filter(item => question.ans.includes(item.id));
                        if (tmpChoice && tmpChoice.length > 0) {
                            let tmpIndex = 0;
                            tmpChoice.forEach(item => {
                                if (tmpIndex > 0) {
                                    answer += ', ';
                                }
                                answer += item.option;
                                tmpIndex++;
                            });

                        }
                    }
                    tmpTxt += '<br/><b>  Answer: </b>' + answer;
                } else if (question.componentId == 7) {
                    // RadioButton
                    let answer = '';
                    if (question.choices && question.choices.length > 0
                        && question.choices[0] && question.choices[0].length > 0) {
                        let choices = question.choices[0];
                        let tmpChoice = choices.filter(item => item.id == question.ans);
                        if (tmpChoice && tmpChoice.length > 0) {
                            answer = tmpChoice[0].option;
                        }
                    }
                    tmpTxt += '<br/><b>  Answer: </b>' + answer;
                }
                tmp.push(tmpTxt);
            });
            formattedDataString += tmp.join(' ');
        } else {
            formattedDataString += '<div>Feedback Pending</div>';
        }
        return formattedDataString;
    }

    getFormattedName(item) {
        let fullName = (item.title ? item.title + " " : "") + (item.firstName ? item.firstName : "") + (item.lastName ? " " + item.lastName : "")
        return fullName;
    }

    public static getStringTimeFromTimeStampTo(timeslot: any) {
        var date = new Date(timeslot);
        var hours = date.getHours();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        var strhours = hours < 10 ? "0" + hours : hours;
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var strTime = strhours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    validateInputes(event,fieldType){
        var charCode =  window.event ? event.keyCode : event.which; //(event.which) ? event.which : event.keyCode
            if(fieldType===0){ //numericOnly(decimal and non-decimal) number(0-9), .(dot), backspace, leftShif, rightShift
                var charCode =  window.event ? event.keyCode : event.which;
                return (event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 37 || event.keyCode == 39) ?
                true : (charCode < 48 || charCode > 57 ? false : true);
            }
            else if(fieldType===1){ //alphabetic [A-Z,a-z]
                var charCode = (event.which) ? event.which : event.keyCode
                if ((charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 123) && charCode != 32)
                    return false;
                return true;
            }
            else if(fieldType===2){ //mobileNumber
                var charCode = (charCode>=48 && charCode<=57) ? charCode : ((charCode>=96 && charCode<=105) ? charCode=-48 :charCode);
                if((charCode>=48 && charCode<=57) || (charCode>=96 && charCode<=105))
                    return true
                return false;
            }
            else if(fieldType===3){//alphaNumeric : OrderId
                var charCode =  window.event ? event.keyCode : event.which;
                if((charCode>=65 && charCode<=90) || ((charCode>=48 && charCode<=57)&& !event.shiftKey) || (charCode>=96 && charCode<=122)) 
                    return true;
                return false;
            }
            else return false;
    }
}
import { Component, ViewEncapsulation, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Login } from './model/login';
import { OTPVerification } from './model/otpverification';
import { AuthService } from '../auth/auth.service';
import { SpinnerService } from '../layout/widget/spinner/spinner.service';
import { Config } from '../base/config';
import { HttpService } from '../base/http.service';
import { CryptoUtil } from '../auth/util/cryptoutil';

@Component({
    selector: 'login',
    styleUrls: ['./login.style.scss'],
    templateUrl: './login.template.html',
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'login-page app'
    },
})
export class LoginComponent implements OnInit, OnDestroy {

    environment: any = Config.portal;
    isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)

    @Input() login: Login;
    @Input() otpVerification: OTPVerification = new OTPVerification();
    @Input() confirmPassword: string;
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    dialogOpen: boolean = false;
    showOTPField: boolean = false;
    loginClickedOnce: boolean = false;
    changePasswordClicked: boolean = false;
    message = "Use your email to sign in.";
    version: string = Config.VERSION;
    isCorporateLogin: boolean = false;

    passwordType: string = 'password';

    qaChangeIP = new Array();
    setQaChangeIP: Array<any> = new Array();
    awsBaseUrls: any[] = this.httpService.AWS_QA_BASE_URL;
    TEST_TYPE: number = Config.TEST_TYPE;
    BUG_FIX_MODE: number = 3;
    TEMP_TEST_TYPE: number = Config.TEMP_TEST_TYPE;
    isCustomIp: boolean = false;

    backgroundImagePath: string = '../../assets/img/background-img';
    loginText: string = 'Digital Health B2B Platform & Services';
    backgroundImagePathsmall: string = '../../assets/img/background-img';

    constructor(private authService: AuthService,
        private router: Router, public spinner: SpinnerService, private httpService: HttpService) {
        this.login = new Login('', '');
        window.addEventListener("load", function () {
            let cryptoUtil = new CryptoUtil();
            localStorage.setItem('noOfTabsOpened', cryptoUtil.encryptData('1'));
        });
        if (Config.TEST_TYPE > Config.AWS_DEMO) {
            this.BUG_FIX_MODE = null;
        } else {
            this.BUG_FIX_MODE = (this.TEST_TYPE === Config.BUG_FIX_MODE ? Config.BUG_FIX_MODE : 3);
        }
        console.log("this.BUG_FIX_MODE>>" + this.BUG_FIX_MODE)
        console.log("Config.TEST_TYPE>>" + Config.TEST_TYPE)
        if (Config.portal.content && Config.portal.content.loginImageUrl && Config.portal.content.loginImageUrl.length > 0) {
            this.backgroundImagePath = Config.portal.content.loginImageUrl;
        }
        if (Config.portal.content && Config.portal.content.loginText && Config.portal.content.loginText.length > 0) {
            this.loginText = Config.portal.content.loginText;
        }
    }


    ngOnInit() {
        this.spinner.stop();
        this.removeFromLocalStore();
        // this.setQaChangeIP = this.httpService.qaChangeIp;
        $(document).ready(function () {
            $('.tab a').on('click', function (e) {

                e.preventDefault();

                $(this).parent().addClass('active');
                $(this).parent().siblings().removeClass('active');

                let target = $(this).attr('href');

                $('.tab-content > div').not(target).hide();

                $(target).fadeIn(600);

            });
        });
        let dt = localStorage.getItem('qaChangeIP');
        this.setQaChangeIP = dt != 'null' ? JSON.parse(dt) : new Array();
        this.qaChangeIP = new Array();
        this.setQaChangeIP.length > 0 ? this.setQaChangeIP.forEach(e => {
            let data = e ? e.split('/') : [];
            this.qaChangeIP.push((data.pop()));
        }) : '';
        // BUG_FIX_MODE: number = 3;
        this.setQaChangeIP.length > 0 ? this.BUG_FIX_MODE = this.TEST_TYPE = -1 : '';

        $(".modal").on("shown.bs.modal", function () {
            if ($(".modal-backdrop").length > 1) {
                $(".modal-backdrop").not(':first').remove();
            }
        })
        $('.modal').on('hidden.bs.modal', function (e) {
            $('.modal-backdrop').remove();
        });
        if ($(window).width() <= 575) {
            // $('.login-pageimg').css('display','none');
            // $('.login-page1').each(function(){
            //     var type = $(this).attr('data-type');
            //     var brand = $(this).attr('data-brand');
            //     $(this).css('background-image', 'url(../../assets/' + type + '/' + brand + '.png)');
            // });
        }

        if ($(window).width() >= 992) {
            // $('.login-pageimg1').css('display','none');
            // $('.login-pageimg').each(function(){
            //     var type = $(this).attr('data-type');
            //     var brand = $(this).attr('data-brand');

            //     $(this).css('background-image', 'url(../../assets/' + type + '/' + brand + '.png)');
            // });
        }
    }

    ngOnDestroy() {
        this.spinner.start();
    }
    getDynamicPath(url: string) {
        let width = $(window).width();
        let dynamicImgType = 'img1.png'
        dynamicImgType = width <= 575 ? '-small1' : width > 575 && width < 992 ? '-small12' : width >= 992 ? '1' : '2';
        let fPath = url + dynamicImgType + '.png';
        console.log(fPath, width);
        return fPath;
    }



    changeToCustomizeIp(index?) {
        if (isNaN(this.qaChangeIP[index][1])) {
            this.setQaChangeIP[index] = this.qaChangeIP[index] ? (this.qaChangeIP[index].includes('http') ? this.qaChangeIP[index] : 'http://' + this.qaChangeIP[index]) : undefined;
        }
        else {
            this.setQaChangeIP[index] = this.qaChangeIP[index] ? (this.qaChangeIP[index].includes('http') ? this.qaChangeIP[index] : 'http://' + this.qaChangeIP[index]) : undefined;
        }
        this.httpService.qaChangeIp = this.setQaChangeIP;
        console.log(JSON.stringify(this.setQaChangeIP));
        localStorage.setItem('qaChangeIP', JSON.stringify(this.setQaChangeIP));
    }

    chengeIp2DevWQa(configType?, type?) {
        this.isCustomIp = false;
        localStorage.removeItem('qaChangeIP');
        this.qaChangeIP = new Array();
        this.setQaChangeIP = new Array();
        localStorage.setItem('changeTestType', configType);
        this.httpService.qaChangeIp = new Array();
        // configType == +'-101' ? configType = 3 : '';
        // localStorage.removeItem('changeTestType')
        configType != +'-1' ? Config.changeTestType(+configType) : this.isCustomIp = true;
        configType == +'-1' ? Config.changeTestType(2) : '';
        // configType == this.TEMP_TEST_TYPE ? this.TEMP_TEST_TYPE = Config.TEMP_TEST_TYPE : '';
        this.BUG_FIX_MODE = this.TEST_TYPE = +configType;
    }

    userLogin(): void {
        this.loginClickedOnce = true;
        this.dialogOpen = false;
        this.spinner.start();
        this.errorMessage = new Array<string>();
        this.showMessage = false;
        if (this.login.emailId == null || this.login.emailId.length <= 4 || this.login.password == null || this.login.password.length <= 4) {
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = 'EmailId/Password should not be blank or less than 5 Character ';
            // 'Invalid username/password';
            this.isError = true;
            this.showMessage = true;
            this.spinner.stop();
            this.loginClickedOnce = false;
            return;
        }
        this.authService.login(this.login, this.isCorporateLogin)
            .then(resp => {
                if (resp == true) {
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = 'Login Successful!';
                    this.isError = false;
                    this.showMessage = true;
                    this.gotoDashboard();
                } else {
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = 'Invalid username/password';
                    this.isError = true;
                    this.showMessage = true;
                    this.spinner.stop();
                    this.loginClickedOnce = false;
                }
            }).catch(error => {
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = error.message;
                this.isError = true;
                this.showMessage = true;
                this.spinner.stop();
                this.loginClickedOnce = false;
            });
    }

    // isDialog(): boolean{
    //    return (<any>$('#myModal')).isShown;
    // }

    changePassword(): void {
        if (this.showOTPField) {
            this.verifyOTP();
        } else {
            this.generateOtp();
        }
    }

    generateOtp(): void {
        this.changePasswordClicked = true;
        this.dialogOpen = true;
        this.errorMessage = new Array<string>();
        this.showMessage = false;
        if (this.otpVerification.emailId == null || this.otpVerification.emailId.length <= 3) {
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = 'Invalid email';
            this.isError = true;
            this.showMessage = true;
            this.changePasswordClicked = false;
            return;
        }
        this.authService.generateOTP(this.otpVerification)
            .then(resp => {
                if (resp == true) {
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = 'OTP has been sent to your registered email !';
                    this.isError = false;
                    this.showMessage = true;
                    this.showOTPField = true;
                    this.changePasswordClicked = false;
                } else {
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = 'Could not find your email address. Please enter a valid email!';
                    this.isError = true;
                    this.showMessage = true;
                    this.showOTPField = false;
                    this.changePasswordClicked = false;
                }
            }).catch(error => {
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = error.errorMessage;
                this.isError = true;
                this.showMessage = true;
                this.changePasswordClicked = false;
            });
    }

    verifyOTP(): void {
        this.changePasswordClicked = true;
        this.dialogOpen = true;
        this.errorMessage = new Array<string>();
        this.showMessage = false;
        if (this.otpVerification.emailId == null || this.otpVerification.emailId.length <= 3) {
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = 'Invalid email';
            this.isError = true;
            this.showMessage = true;
            this.changePasswordClicked = false;
            return;
        }
        if (this.otpVerification.otp == null || this.otpVerification.otp.length <= 4) {
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = 'Invalid otp';
            this.isError = true;
            this.showMessage = true;
            this.changePasswordClicked = false;
            return;
        }
        if (this.otpVerification.password == null || this.otpVerification.password.length <= 3) {
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = 'Invalid password';
            this.isError = true;
            this.showMessage = true;
            this.changePasswordClicked = false;
            return;
        }
        if (this.confirmPassword == null || this.confirmPassword.length <= 3
            || this.otpVerification.password != this.confirmPassword) {
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = 'Password mismatch!';
            this.isError = true;
            this.showMessage = true;
            this.changePasswordClicked = false;
            return;
        }
        this.authService.verifyOTP(this.otpVerification)
            .then(resp => {
                if (resp == true) {
                    this.dialogOpen = false;
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = 'Password has been reset successfully!';
                    this.isError = false;
                    this.showMessage = true;
                    this.showOTPField = true;
                    (<any>$('#myModal')).modal('hide');
                    this.otpVerification = new OTPVerification();
                    this.confirmPassword = null;
                    this.changePasswordClicked = false;
                    this.showOTPField = false;
                } else {
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = 'Could not reset password! Please enter valid OTP!';
                    this.isError = true;
                    this.showMessage = true;
                    //this.otpVerification = new OTPVerification();
                    this.confirmPassword = null;
                    this.otpVerification.password = null;
                    this.otpVerification.otp = null;
                    //this.showOTPField = false;
                    this.changePasswordClicked = false;
                }
            }).catch(error => {
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = error.errorMessage;
                this.isError = true;
                this.showMessage = true;
                this.changePasswordClicked = false;
            });
    }

    removeFromLocalStore(): void {
        this.authService.removeFromLocalStore();
    }

    resetForm() {
        this.errorMessage = null;
        this.showOTPField = false;
        this.otpVerification = new OTPVerification();
    }

    gotoDashboard() {
         if (this.authService.routeNavNumber === 0) {
            this.router.navigate(['/app/dashboard']);
        }
        else if (this.authService.routeNavNumber === 1) {
            this.router.navigate(['/pocpopup']);
        }else if (this.authService.routeNavNumber === 2){
            console.log('login');
            this.router.navigate(['/pocadmin/sidebar/basicinfo'])
        }
       
    }

    showPartnerPortalLogin() {
        this.message = 'Login to Partner Portal';
        this.isCorporateLogin = false;
    }

    showCorporateLogin() {
        this.message = 'Login to Corporate Portal';
        this.isCorporateLogin = true;
    }

    showPasswordClick() {
        this.passwordType = this.passwordType == 'password' ? 'text' : 'password';
    }

    getAssertsLogoPath(): string {
        if (Config.portal.iconspath) {
            return Config.portal.iconspath;
        } else return 'assets/icon/';
    }
    getAssertsbackgroundPath(): string {
        if (Config.portal.backgroundImage) {
            return Config.portal.backgroundImage;
        } else return 'assets/img/';
    }

}


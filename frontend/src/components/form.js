import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {

    constructor(page) {

        this.agreeElement = null;
        this.processElement = null;
        this.page = page;
        this.rememberMe = false;


        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/';
            return;
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                name: 'fullName',
                id: 'full-name',
                element: null,
                regex: /^[А-Я][а-я]*([-][А-Я][а-я]*)?\s[А-Я][а-я]*\s[А-Я][а-я]*$/,
                valid: false,
            });
            this.fields.push({
                name: 'passwordRepeat',
                id: 'password-repeat',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            });
        }

        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        });

        this.processElement = document.getElementById('process');
        this.processElement.onclick = function () {
            that.processForm();
        }


        if (this.page === 'login') {
            this.agreeElement = document.getElementById('agree');
            this.agreeElement.onchange = function () {
                that.validateForm();
            }
        }
    }


    validateField(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.removeAttribute('style');
            field.valid = true;
        }
        this.validateForm();
    }


    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        if (validForm) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }
        return validForm;
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            if (this.page === 'signup') {
                const passwordRepeat = this.fields.find(item => item.name === 'passwordRepeat').element.value;
                if (password === passwordRepeat) {
                    try {

                        const name = this.fields.find(item => item.name === 'fullName').element.value.split(' ')[1];
                        const lastName = this.fields.find(item => item.name === 'fullName').element.value.split(' ')[0];
                        const result = await CustomHttp.request(config.host + '/signup', "POST", {
                            name: name,
                            lastName: lastName,
                            email: email,
                            password: password,
                            passwordRepeat: passwordRepeat,
                        });

                        if (result) {
                            if (result.error || !result.user) {
                                throw new Error(result.message);
                            }
                        }
                    } catch (error) {
                        return console.log(error);
                    }
                } else {
                    alert('Пароли не совпадают');
                    return;
                }
            }

            try {
                this.rememberMeElement = false
                const rememberMe = this.rememberMeElement.checked;
                const result = await CustomHttp.request(config.host + '/login', "POST", {
                    email: email,
                    password: password,
                    rememberMe: rememberMe,
                });

                if (result) {
                    if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.lastName
                        || !result.user.name || !result.user.id) {
                        throw new Error(result.message);
                    }
                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        name: result.user.name,
                        user_id: result.user.id,
                        lastName: result.user.lastName,
                        rememberMe: this.rememberMe,
                    })
                    location.href = '#/';
                }
            } catch (error) {
                console.log(error);
            }

            try {
                const result = await CustomHttp.request(config.host + '/balance');
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    Auth.setBalance(result.balance);
                    location.reload();
                }
            } catch (error) {
                return console.log(error);
            }
        }
    }

}


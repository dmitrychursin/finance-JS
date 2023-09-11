import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class EditCategoryIncome {

    constructor() {
        this.saveButtonElement = document.getElementById('save');
        this.cancelButtonElement = document.getElementById('cancel');
        this.inputIncomeElement = document.getElementById('input-income');

        this.id = UrlManager.getQueryParams()['id'];

        this.cancelButtonElement.onclick = function () {
            location.href = '#/income';
        }

        const that = this
        this.saveButtonElement.onclick = function () {
            that.editCategoryIncome();
            location.href = '#/income';
        }

        this.init();
    }


    async init() {
        if (this.id) {
            try {
                const result = await CustomHttp.request(config.host + '/categories/income/' + this.id);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.categories = result;
                    this.inputIncomeElement.value = this.categories.title
                }
            } catch (error) {
                return console.log(error);
            }
        }
    }

    async editCategoryIncome() {
        try {
            const result = await CustomHttp.request(config.host + '/categories/income/' + this.id, "PUT", {
                title: this.inputIncomeElement.value
            });

            if (result) {
                if (result.error) {
                    throw new Error(result.message);
                }
            }
        } catch (error) {
            return console.log(error);
        }
    }
}
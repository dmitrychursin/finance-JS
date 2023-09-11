import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class AddCategoryIncome {

    constructor() {
        this.saveAddButtonElement = document.getElementById('add-save');
        this.cancelAddButtonElement = document.getElementById('add-cancel');
        this.inputAddIncomeElement = document.getElementById('input-add-income');

        this.id = UrlManager.getQueryParams()['id'];

        this.cancelAddButtonElement.onclick = function () {
            location.href = '#/income';
        }

        const that = this
        this.saveAddButtonElement.onclick = function () {
            that.init();
            location.href = '#/income';
        }
    }

    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/categories/income', "POST", {
                title: this.inputAddIncomeElement.value
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
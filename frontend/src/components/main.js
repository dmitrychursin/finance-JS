import config from "../../config/config.js";
import {CustomHttp} from "../services/custom-http.js";
import Chart from 'chart.js/auto';
import {Auth} from "../services/auth";


export class Main {

    period;

    incomeChart;
    incomeChartConfig;
    incomeCategoriesLabels;
    incomeOperationsReduced;

    expenseChart;
    expenseChartConfig;
    expenseCategoriesLabels;
    expenseOperationsReduced;

    constructor() {

        this.period = ''
        this.operationsAll = [];
        this.getBalance();
        this.initializeButtons();
        this.initializeCharts();
        this.getOperations();
    }


    async getBalance() {
        try {
            const result = await CustomHttp.request(config.host + '/balance');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.balance = result
                Auth.setBalance(result.balance);
            }
        } catch (error) {
            return console.log(error);
        }
        document.getElementById('money').innerText = this.balance.balance + "$";
    }


    initializeButtons() {
        const buttons = document.getElementsByClassName('button-date-action');
        for (let button of buttons) {
            switch (button.id) {
                case 'main-today-button':
                    button.onclick = () => {
                        this.period = '';
                        this.setActiveButton(button);
                        this.getOperations();
                    };
                    break;
                case 'main-week-button':
                    button.onclick = () => {
                        this.period = 'week';
                        this.setActiveButton(button);
                        this.getOperations(this.period);
                    };
                    break;
                case 'main-month-button':
                    button.onclick = () => {
                        this.period = 'month';
                        this.setActiveButton(button);
                        this.getOperations(this.period);
                    };
                    break;
                case 'main-year-button':
                    button.onclick = () => {
                        this.period = 'year';
                        this.setActiveButton(button);
                        this.getOperations(this.period);
                    };
                    break;
                case 'main-all-button':
                    button.onclick = () => {
                        this.period = 'all';
                        this.setActiveButton(button);
                        this.getOperations(this.period);
                    };
                    break;
                case 'main-interval-button':
                    button.onclick = () => {
                        this.period = 'interval';
                        this.setActiveButton(button);

                        const dateForm = document.getElementById('dateForm');
                        const dateTo = document.getElementById('dateTo');

                        if (dateForm.value && dateTo.value) {
                            this.getOperations(this.period, dateForm.value, dateTo.value);
                        }

                        dateForm.onchange = () => {
                            if (this.period === 'interval' && dateForm.value && dateTo.value) {
                                this.getOperations(this.period, dateForm.value, dateTo.value);
                            }
                        };

                        dateTo.onchange = () => {
                            if (this.period === 'interval' && dateTo.value && dateForm.value) {
                                this.getOperations(this.period, dateForm.value, dateTo.value);
                            }
                        };
                    };
                    break;
            }
        }
    }


    initializeCharts() {
        const incomeChartContext = document.getElementById('my-chart-incomes').getContext('2d');
        this.incomeChartConfig = {
            type: 'pie',
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Доходы",
                        data: [],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.9)',
                            'rgba(255, 159, 64, 0.9)',
                            'rgba(255, 205, 86, 0.9)',
                            'rgba(75, 192, 192, 0.9)',
                            'rgba(54, 162, 235, 0.9)',
                            'rgba(153, 102, 255, 0.9)',
                            'rgba(2,112,248,0.9)'
                        ],
                    },
                ]
            },
        }
        this.incomeChart = new Chart(incomeChartContext, this.incomeChartConfig);

        const expenseChartContext = document.getElementById('my-chart-expenses').getContext('2d');
        this.expenseChartConfig = {
            type: 'pie',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Расходы',
                        data: [],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.9)',
                            'rgba(255, 159, 64, 0.9)',
                            'rgba(255, 205, 86, 0.9)',
                            'rgba(75, 192, 192, 0.9)',
                            'rgba(54, 162, 235, 0.9)',
                            'rgba(153, 102, 255, 0.9)',
                            'rgba(2,112,248,0.9)'
                        ],
                    },
                ]
            },
        }
        this.expenseChart = new Chart(expenseChartContext, this.expenseChartConfig);
    }

    updateCharts() {
        this.incomeChartConfig.data.labels = this.incomeCategoriesLabels;
        this.incomeChartConfig.data.datasets[0].data = this.incomeOperationsReduced;
        this.incomeChart.update();

        this.expenseChartConfig.data.labels = this.expenseCategoriesLabels;
        this.expenseChartConfig.data.datasets[0].data = this.expenseOperationsReduced;
        this.expenseChart.update();
    }

    prepareDataForCharts() {
        const incomeOperations = this.operationsAll.filter(value => value.type === 'income');
        this.incomeCategoriesLabels = [
            ...new Set(incomeOperations.map((operation) => operation.category)),
        ];
        this.incomeOperationsReduced = Object.values(incomeOperations.reduce((acc, {category, amount}) => {
            acc[category] ? acc[category] += amount : acc[category] = amount;
            return acc
        }, {}))

        const expenseOperations = this.operationsAll.filter(value => value.type === 'expense');
        this.expenseCategoriesLabels = [
            ...new Set(expenseOperations.map((operation) => operation.category)),
        ];
        this.expenseOperationsReduced = Object.values(expenseOperations.reduce((acc, {category, amount}) => {
            acc[category] ? acc[category] += amount : acc[category] = amount;
            return acc
        }, {}))
    }

    setActiveButton(buttonElement) {
        document.querySelectorAll('.active').forEach(item => {
            item.classList.remove('active');
        });
        buttonElement.classList.add('active');
    }

    async getOperations(period, dateFrom, dateTo) {
        let url = "/operations"

        if (period) {
            url += '?period=' + period;
        }

        if (period === 'interval') {
            url += '&dateFrom=' + dateFrom;
            url += '&dateTo=' + dateTo;
        }

        try {
            const result = await CustomHttp.request(config.host + url);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.operationsAll = result;
                this.prepareDataForCharts();
                this.updateCharts();
            }
        } catch (error) {
           console.log(error);
        }
    }
}




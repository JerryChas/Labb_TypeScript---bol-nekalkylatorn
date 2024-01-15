"use strict";
const loanInput = document.getElementById('loan_input');
const interestInput = document.getElementById('interest_input');
const yearsInput = document.getElementById('years_input');
const calculateBtn = document.getElementById('calculate_btn');
const scheduleContainer = document.querySelector('.schedule_container');
let totalPaymentsArray = [];
let monthlyList = [];
function handleInputValues() {
    const loanAmount = parseFloat(loanInput.value);
    const interestRate = parseFloat(interestInput.value);
    const loanTermInYears = parseFloat(yearsInput.value);
    if (isNaN(loanAmount) || loanAmount <= 0) {
        alert('Vänligen ange ett giltigt lånebelopp.');
        return;
    }
    if (isNaN(interestRate) || interestRate < 1 || interestRate > 50) {
        alert('Vänligen ange en ränta mellan 1 och 50.');
        return;
    }
    if (isNaN(loanTermInYears) || loanTermInYears < 1 || loanTermInYears > 100) {
        alert('Vänligen ange en giltig lånetid mellan 1 och 100 år.');
        return;
    }
    return { loanAmount, interestRate, loanTermInYears };
}
function calcMonthlyPayment(loanAmount, interestRate, loanTermInYears) {
    const monthlyInterestRate = interestRate / 12 / 100;
    const numberOfPayments = loanTermInYears * 12;
    const monthlyPayment = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    return monthlyPayment;
}
function calculateLoanSchedule(loanAmount, interestRate, loanTermInYears) {
    totalPaymentsArray = [];
    monthlyList = [];
    const monthlyPayment = calcMonthlyPayment(loanAmount, interestRate, loanTermInYears);
    let monthlyDept = loanAmount;
    let totalInterestCost = 0;
    let totalCost = 0;
    for (let month = 1; month <= loanTermInYears * 12; month++) {
        const monthlyInterestPayment = monthlyDept * (interestRate / 12 / 100);
        totalInterestCost += monthlyInterestPayment;
        const principalPayment = monthlyPayment - monthlyInterestPayment;
        monthlyDept -= principalPayment;
        monthlyList.push({
            month: month,
            monthlyInterestPayment: monthlyInterestPayment,
            monthlyDept: monthlyDept,
            year: month % 12 === 0 && month < loanTermInYears * 12 ? Math.floor(month / 12) + 1 : undefined,
        });
    }
    totalCost = loanAmount + totalInterestCost;
    totalPaymentsArray.push({
        monthlyPayment: monthlyPayment,
        totalInterestCost: totalInterestCost,
        totalCost: totalCost,
    });
}
function renderSchedule() {
    scheduleContainer.innerHTML = '';
    if (!scheduleContainer.classList.contains('show')) {
        scheduleContainer.classList.add('show');
    }
    totalPaymentsArray.map((t) => {
        scheduleContainer.innerHTML = `
      <div class="total-payments">
        <div class="monthly-payment">
          <p>Monthly:</p>
          <span>${t.monthlyPayment.toFixed(2)}kr</span>
        </div>
        <div class="total-interest">
          <p>Interest:</p>
          <span>${t.totalInterestCost.toFixed(2)}kr</span>
        </div>
        <div class="total-cost">
          <p>total:</p>
          <span>${t.totalCost.toFixed(2)}kr</span>
        </div>
      </div>
    `;
    });
    const listCategories = document.createElement('div');
    listCategories.classList.add('list-categories');
    scheduleContainer.appendChild(listCategories);
    listCategories.innerHTML = `
    <span class="month-category">Month</span>
    <span class="interest-category">Interest</span>
    <span class="dept-category">Dept</span>
  `;
    const monthListContainer = document.createElement('div');
    monthListContainer.classList.add('month-list_container');
    scheduleContainer.appendChild(monthListContainer);
    monthlyList.forEach((m, index) => {
        const monthDiv = document.createElement('div');
        monthDiv.classList.add('month_div');
        monthDiv.innerHTML = `
      <span class="month_span">${m.month}</span>
      <span class="interest_span">${m.monthlyInterestPayment.toFixed(2)}kr</span>
      <span class="dept_span">${m.monthlyDept.toFixed(2)}kr</span>
    `;
        monthListContainer.appendChild(monthDiv);
        if ((m.year && (index + 1) % 12 === 0) || index === 0) {
            const yearDiv = document.createElement('div');
            yearDiv.classList.add('year_div');
            yearDiv.innerHTML = `
        <span>year ${m.year || 1}</span>
      `;
            if (index === 0) {
                monthListContainer.insertBefore(yearDiv, monthListContainer.firstChild);
            }
            else {
                monthListContainer.appendChild(yearDiv);
            }
        }
    });
}
calculateBtn.addEventListener('click', () => {
    const inputValues = handleInputValues();
    if (inputValues) {
        const { loanAmount, interestRate, loanTermInYears } = inputValues;
        calculateLoanSchedule(loanAmount, interestRate, loanTermInYears);
        renderSchedule();
    }
});

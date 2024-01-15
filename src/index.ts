const loanInput = document.getElementById('loan_input') as HTMLInputElement;
const interestInput = document.getElementById('interest_input') as HTMLInputElement;
const yearsInput = document.getElementById('years_input') as HTMLInputElement;
const calculateBtn = document.getElementById('calculate_btn') as HTMLButtonElement;
const scheduleContainer = document.querySelector('.schedule_container') as HTMLDivElement;

// En type som används till den detaljerade listan
type month = {
  month: number;
  monthlyInterestPayment: number;
  monthlyDept: number;
  year?: number; // Denna används var 12e månad
};

// Arrays för totala belopp
let totalPaymentsArray: { monthlyPayment: number; totalInterestCost: number; totalCost: number }[] = [];
// Array som håller månadsobjekt
let monthlyList: month[] = [];

//* --------------------------------------------------------------- *//
//* -------------------------- FUNCTIONS -------------------------- *//
//* --------------------------------------------------------------- *//

//* ---=== Hämtar och Felhanterar värden från input-elementen  ===---
function handleInputValues(): { loanAmount: number; interestRate: number; loanTermInYears: number } | undefined {
  // Hämta värden från input-fälten
  const loanAmount = parseFloat(loanInput.value);
  const interestRate = parseFloat(interestInput.value);
  const loanTermInYears = parseFloat(yearsInput.value);

  // Kontrollera att inputen är numerisk och inom sina gränser
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

  // Returnerar värden
  return { loanAmount, interestRate, loanTermInYears };
}

//* ---=== Beräknar månadskostnaden ===--- (Annuitetsmetoden)
function calcMonthlyPayment(loanAmount: number, interestRate: number, loanTermInYears: number): number {
  // ÅrsRäntan uppdelad i månader
  const monthlyInterestRate = interestRate / 12 / 100;
  // År uppdelat i månader
  const numberOfPayments = loanTermInYears * 12;

  // Beräknar månadskostnad
  const monthlyPayment =
    (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  // Returnerar den stående Månadsbetalningen
  return monthlyPayment;
}

//* ---=== Beräknar skuld VARJE månad ===---
function calculateLoanSchedule(loanAmount: number, interestRate: number, loanTermInYears: number): void {
  // Tömmer arrayerna
  totalPaymentsArray = [];
  monthlyList = [];

  //* Deklarerar variabler
  // Månadsbetalningen (samma varje månad)
  const monthlyPayment: number = calcMonthlyPayment(loanAmount, interestRate, loanTermInYears);
  // Skuld varje månad (startar med lånets värde)
  let monthlyDept: number = loanAmount;
  // Den TOTALA räntekostnaden (adderas med varje MÅNADS räntekostnad)
  let totalInterestCost: number = 0;
  // Totala kostnad (lånade pengar + den totala räntan)
  let totalCost: number = 0;

  //* Loopa igenom amorteringsplanen (går igenom varje månad)
  for (let month = 1; month <= loanTermInYears * 12; month++) {
    // Månadens räntekostnad
    const monthlyInterestPayment: number = monthlyDept * (interestRate / 12 / 100);
    // Beräknar totala räntekostnaden (för alla månader)
    totalInterestCost += monthlyInterestPayment;
    // Beräknar kapitalbelopp (månadsbelopp - månadens räntekostnad)
    const principalPayment: number = monthlyPayment - monthlyInterestPayment;
    // Kvarstående skuld varje månad ( minus kapitalbeloppet )
    monthlyDept -= principalPayment;

    // Lägg till månadsdata som ett objekt i monthlyList
    monthlyList.push({
      month: month,
      monthlyInterestPayment: monthlyInterestPayment,
      monthlyDept: monthlyDept,
      // År läggs till var 12e månad
      year: month % 12 === 0 && month < loanTermInYears * 12 ? Math.floor(month / 12) + 1 : undefined,
    });
  }
  // Totala lånekostnaden
  totalCost = loanAmount + totalInterestCost;

  // Lägg till totala datan som ett objekt i totalPaymentsArray
  totalPaymentsArray.push({
    monthlyPayment: monthlyPayment,
    totalInterestCost: totalInterestCost,
    totalCost: totalCost,
  });
}

//* ---=== Skriv ut amorteringsplanen ===---
function renderSchedule() {
  // Tömmer befintligt innehåll
  scheduleContainer.innerHTML = '';

  //* Animation
  //Om inte scheduleContainer har class 'show', ge denna class
  if (!scheduleContainer.classList.contains('show')) {
    scheduleContainer.classList.add('show');
  }

  //Renderar totala belopp
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

  // skapar en element för list-kategorier
  const listCategories = document.createElement('div');
  listCategories.classList.add('list-categories');
  scheduleContainer.appendChild(listCategories);

  listCategories.innerHTML = `
    <span class="month-category">Month</span>
    <span class="interest-category">Interest</span>
    <span class="dept-category">Dept</span>
  `;

  // skapar en element för månadslistan
  const monthListContainer = document.createElement('div');
  monthListContainer.classList.add('month-list_container');
  scheduleContainer.appendChild(monthListContainer);

  // Lägger till nytt innehåll för varje objekt i monthlyList
  monthlyList.forEach((m, index) => {
    const monthDiv = document.createElement('div');
    monthDiv.classList.add('month_div');

    monthDiv.innerHTML = `
      <span class="month_span">${m.month}</span>
      <span class="interest_span">${m.monthlyInterestPayment.toFixed(2)}kr</span>
      <span class="dept_span">${m.monthlyDept.toFixed(2)}kr</span>
    `;

    // Lägger till det nya elementet i monthListContainer
    monthListContainer.appendChild(monthDiv);
    // Lägger till året var 12:e månad eller i början av listan
    if ((m.year && (index + 1) % 12 === 0) || index === 0) {
      const yearDiv = document.createElement('div');
      yearDiv.classList.add('year_div');
      yearDiv.innerHTML = `
        <span>year ${m.year || 1}</span>
      `;
      if (index === 0) {
        monthListContainer.insertBefore(yearDiv, monthListContainer.firstChild);
      } else {
        monthListContainer.appendChild(yearDiv);
      }
    }
  });
}

//* --------------------------------------------------------------- *//

//* KNAPP - Kalkylerar lånet
calculateBtn.addEventListener('click', () => {
  // Hämta inputvärden från funktionen handleInputValues.
  const inputValues = handleInputValues();

  // Kontrollera om inputvärden har hämtats framgångsrikt.
  if (inputValues) {
    // Deklarerar inputvärdena för att använda dem lättare.
    const { loanAmount, interestRate, loanTermInYears } = inputValues;

    // Anropa calculateLoanSchedule-funktionen med de hämtade inputvärdena.
    calculateLoanSchedule(loanAmount, interestRate, loanTermInYears);

    // Anropa renderSchedule-funktionen för att visa eller hantera låneplanen.
    renderSchedule();
  }
});

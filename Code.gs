function doGet() {
  return HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function processForm(form) {
  var amount = parseFloat(form.amount);
  var category = form.category;

  addToBudget(amount, category);

  return [amount, category];
}

const SPREADSHEET_ID = "XXXXX"; // extract from spreadsheet URL, eg https://docs.google.com/spreadsheets/d/XXXXX/edit
const SHEET_NAME = "Income & Expenses";

function addToBudget(amt, cat) {
  var category = cat;
  var amount = amt;

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

  var categories = sheet.getRange("income_and_expenses_categories").getValues().map(category => category[0].trim());
  var now = new Date();
  var thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toDateString();
  var monthValues = sheet.getRange("income_and_expenses_headings").getValues()[0];
  var months = monthValues.map(
    function(month) {
      if(month instanceof Date) {
        return month.toDateString();
      }
      return null;
    });

  var row = categories.indexOf(category) + 1;
  var column = months.indexOf(thisMonth) + 1;
  var cell = sheet.getRange(row, column).getCell(1,1);
  cell.setFormula(concatenateAmount(cell, amount));
}

function concatenateAmount(cell, amount) {
  var amountString = amount.toFixed(2);
  var precedingOperator = (amount >= 0 ? "+" : "");

  if (cell.getFormula()) {
    return cell.getFormula() + precedingOperator + amountString;
  } else if (cell.getValue()) {
    return "=" + cell.getValue() + precedingOperator + amountString;
  } else {
    return "=" + amountString;
  }
}

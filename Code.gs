const ENV = PropertiesService.getScriptProperties();
const SHEET_NAME = "Income & Expenses";

function doGet() {
  return HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .setTitle('Add expense')
    .setFaviconUrl("https://img.icons8.com/ios/150/990000/add-receipt.png")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no');
}

function processForm(form) {
  var amount = parseFloat(form.amount);
  var category = form.category;
  var note = form.note.trim();

  addToBudget(amount, category, note);

  return [amount, category];
}

function addToBudget(amount, category, note) {
  var sheet = SpreadsheetApp.openById(ENV.getProperty('SPREADSHEET_ID')).getSheetByName(SHEET_NAME);

  var categories = sheet
    .getRange("income_and_expenses_categories")
    .getValues()
    .map(category => category[0].trim());
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
  if (note) {
    cell.setNote(appendNote(cell, amount, note));
  }
}

function appendNote(cell, amount, note) {
  var amountString = amount.toFixed(2);
  var existingNote = cell.getNote();

  if (existingNote) {
    return existingNote.trim() + "\n" + amountString + " " + note;
  } else {
    return amountString + " " + note;
  }
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

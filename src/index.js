import arg from 'arg';
import stringify from 'csv-stringify';
import moment from 'moment';
import Harvest from 'harvest-v2';

function processArgs(rawArgs){
  const args = arg(
    {
      '--start-date': String,
      '--end-date': String
    },
    {
      argv: rawArgs.slice(2)
    }
  );
  return args;
}

export async function main(args) {
  const harvest = new Harvest({
    access_token: process.env.HARVEST_ACCESS_TOKEN,
    account_ID: process.env.HARVEST_ACCOUNT_ID,
    user_agent: 'harvest-monthly-expenses'
  });

  args = processArgs(args);
  const date = new Date();
  let requestArgs = {
    'from': args['--start-date'] || (new Date(date.getFullYear(), date.getMonth(), 1)).toISOString(),
    'to': args['--end-date'] || (new Date()).toISOString(),
    'page': 1
  };

  // Fetch all of the expense categories to build our initial data model.
  // { Education: { '2019-08': '0.00', '2019-07': '0.00', '2019-06': '0.00' } }
  const expenseSummariesUnsorted = {};
  const baseValues = {};
  const startDate = moment(requestArgs.from);
  let endDate = moment(requestArgs.to);
  let year = endDate.format('YYYY');
  while (endDate.isAfter(startDate)) {
    baseValues[endDate.format('MMMM YYYY')] = 0.00;
    endDate.subtract(1, 'month');
    if (endDate.format('YYYY') !== year) {
      baseValues['All ' + year] = 0.00;
      year = endDate.format('YYYY');
    }
  }
  await harvest.expenseCategories.list().then((response) =>{
    response.expense_categories.forEach((category) => {
      expenseSummariesUnsorted[category.name] = {...baseValues};
    });
  }).catch((response) => {
    console.error(response.message);
    process.exit(1);
  });
  const expenseSummaries = {};
  Object.keys(expenseSummariesUnsorted).sort().forEach(function(key) {
    expenseSummaries[key] = expenseSummariesUnsorted[key];
  });

  // Fetch all of the expenses for the date period.
  let expenses = [];
  let next_page = null;
  do {
    await harvest.expenses.listBy(requestArgs).then((response) => {
      expenses = expenses.concat(response.expenses);
      next_page = response.next_page;
    }).catch((response) => {
      console.error(response.message);
      process.exit(1);
    });
    requestArgs['page']++;
  } while ( next_page !== null );

  // Add each expense to the monthly summary.
  expenses.forEach((expense) => {
    const expenseMonth = moment(expense.spent_date).format('MMMM YYYY');
    const expenseYear = moment(expense.spent_date).format('YYYY');
    expenseSummaries[expense.expense_category.name][expenseMonth] += expense.total_cost;
    expenseSummaries[expense.expense_category.name]['All ' + expenseYear] += expense.total_cost;
  });

  // Build rows for the CSV.
  let csvData = [];
  for (let [category, expenseSummary] of Object.entries(expenseSummaries)) {
    let csvRow = {
      'Expense Category': category,
    };
    for ( let [date, amount] of Object.entries(expenseSummary) ) {
      csvRow[date] = '$' + amount.toFixed(2);
    }
    csvData.push(csvRow);
  }

  // Render the CSV
  stringify(csvData, { header: true }, (err, output) => {
    console.log(output);
  });
}

# Welcome to harvest-monthly-expenses 👋

Summarize your monthly Harvest expenses on the command line!

Yes, you can do this in Excel too. I decided to write some code instead.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)

## Install

To install, simply run:

```sh
npm install harvest-monthly-expenses
```

You'll also need to obtain a [Harvest Personal Access Token](https://help.getharvest.com/api-v2/authentication-api/authentication/authentication/#personal-access-tokens).

## Usage

First, set your Harvest authentication details as environment variables:

```sh
export HARVEST_ACCESS_TOKEN=<access-token>
export HARVEST_ACCOUNT_ID=<account-id>
```

By default, the current month's expenses are displayed:
```sh
$ harvest-monthly-expenses
Expense Category,August 2019
Education,$20.00
Professional Organization,$0.00
Subscriptions,$8.00
Contractors,$0.00
[...]
```

Control the date range with the `--start-date=<date>` and `--end-date=<date>` arguments:

```sh
$ harvest-monthly-expenses --start-date=2019-01-01 --end-date=2019-03-31
Expense Category,March 2019,February 2019,January 2019
Education,$0.00,$0.00,$56.99
Professional Organization,$0.00,$0.00,$99.00
Subscriptions,$0.00,$14.95,$280.00
Contractors,$0.00,$0.00,$0.00
```

## Author

👤 **Daniel Bachhuber**

* Github: [@danielbachhuber](https://github.com/danielbachhuber)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/danielbachhuber/harvest-monthly-expenses/issues).

## Show your support

Give a ⭐️ if this project helped you!


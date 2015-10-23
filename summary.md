# Technical Summary

## Premise

I want to find the accumulated growth of a single currency compared to all the others. This program will separate the growth of single currencies from their corresponding pairs. Once an average growth line is made based off of all pairs combined, then I will be able to make accurate trading decisions.

!! **All growth will be based off of January 1st, 2009** !!

## Steps

1. Server starts
- Check if we have the current market data
- If we do not have current data find the latest complete bar then GET the remaining bars.
- During normal running check every 15 minutes for the current 4h bar
- If previous bar is not complete then update it otherwise insert new document (bar)
- Collection hook on both insert/update of **oanda4HourBars** and insert or update **single4HourGrowths** documents
- Collection hook on both insert/update of **single4HourGrowths** and insert or update **summary4HourGrowths** documents

## Collections

- **instruments**: Available currency pairs.

    | Key | Type | Description |
    |---|---|---|
    | name | String | Name of pair |
    | firstCurrency | String | Abbreviation of first currency |
    | firstCurrencyId | String | ID of first currency document |
    | secondCurrency | String | Abbreviation of second currency |
    | secondCurrencyId | String | ID of second currency document |

- **currencies**: Single currencies.

    | Key | Type | Description |
    |---|---|---|
    | name | String | Name / abbreviation of currency |

- **oanda4HourBars**: API Data gathered from Oanda servers with minor alterations.
	
    | Key | Type | Description |
    |---|---|---|
    | result | Object | Data received from Oanda |
    | pairId | String | ID of parent pair document |
    | firstCurrencyId | String | ID of first currency document |
    | secondCurrencyId | String | ID of second currency document |

- **single4HourGrowths**: Single calculated growth of a currency compared to it's counter-part in a pair.

    | Key | Type | Description |
    |---|---|---|
    | oanda4HourBarId | String | ID from corresponding root data document |
    | previousDocId | String | ID of similar document but previous 4H bar |
    | pairId | String | ID of parent pair document |
    | pair | String | Name of the pair this doc came from |
    | currencyId | String | ID of parent currency document |
    | currency | String | Abbreviation of the currency this is for |
    | growthFromPrev | Number | Percent difference from prev. bar |
    | growthFromStart | Number | Percent difference from 01-01-2007 |
    | timeBar | Date | What is the date-time of Oanda bar |
    | completeBar | Function | Check if related Oanda bar is complete |
    | createDate | Date | Date document was created |
    | modifyDate | Date | Date document was updated |

- **summary4HourGrowths**: Combined calculated growth of a currency averaged across all pairs.

    | Key | Type | Description |
    |---|---|---|
    | currencyId | String | ID of parent currency document |
    | currency | String | Abbreviation of the currency this is for |
    | growthFromPrev | Number | Percent difference from prev. bar |
    | growthFromStart | Number | Percent difference from 01-01-2007 |
    | timeBar | Date | What is the date-time of Oanda bar |
    | single4HourGrowthIds | Array | IDs of growths averaged to make this doc |
    | pairIds | Array | IDs of all pairs that make this doc |
    | completeBar | Function | Check if related Oanda bars are complete |
    | createDate | Date | Date document was created |
    | modifyDate | Date | Date document was updated |
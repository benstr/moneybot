# MoneyBot

MoneyBot is a tool used as part of a [Forex](https://en.wikipedia.org/wiki/Foreign_exchange_market) trading strategy system by [Ben Strahan](https://twitter.com/_benstr).

Currently MoneyBot is a web app that measures standalone Forex currency daily percent change over time. It does this by combining all the daily percents of [Forex trading pairs](https://www.forex4noobs.com/forex-education/currency-pairs/) a particular currency is part of.

You can see MoneyBot in action at [moneybot.io](http://moneybot.io). It uses data from [Oanda](http://oanda.com). Built on the [MeteorJS](http:meteor.com) stack.

## The Strategy

This strategy is a High Probability [Trend Trading](http://www.investopedia.com/terms/t/trendtrading.asp) system. It is a 4 step strategy. If used correctly you can expect your portfolio to grow at a rate of 50% to 94% APY.

1. Each Monday identify with [MoneyBot.io](http://moneybot.io) the strongest and weakest currencies to target the top 10 highest probable pairs to trade. I recommending picking 2 pairs form each historic  step: 5 days, 10, 20, and 30.
2. In fxTrade or another charting software place [Support + Resistance](https://www.youtube.com/watch?v=DfNYmXkCfOs) and Trend lines on the recommended pairs. Narrow down to the best 5-8 pairs that you predict are ready to pop in a particular direction. **Note:** we *only* use 1 Day chart granularity for *all* charting.
3. Place 5-8 market trades, one for each pair identified above with the following parameters:
	- Units = **20%** of your cash balance.
	- [TP](http://fxtrade.oanda.com/learn/intro-to-currency-trading/first-trade/orders) = **0.20%** of your cash balance, usually 100 [pips](https://www.forex4noobs.com/forex-education/pips-and-profits/).
	- [SL](http://fxtrade.oanda.com/learn/intro-to-currency-trading/first-trade/orders) = **none**, this is a high probable trade silly! 
4. Maintain the trades... there are couple different ways we can maintain our trades and it all depends on our confidence and secondly the market.
	- **Pair moves as predicted and TP is hit:** Keep profits and only enter new trades in new pairs next Monday. Do not get greedy or over-confident... that leads to gambling.
	- **You lose confidence in the Pair:** Or breaks trend against your position, then move the TP to a break-even or slight profit position. Do not ever take a loss.
	- **Pair moves against you massively and does not hit TP:** At each S+R line place an order in the same direction of the original trade (Units: 10% balance, TP: same as initial trade, SL: none!). You can accomplish this automatically with pending orders. If trade goes negative more than 10% of your balance consider moving the TP so to equal 0.25% of balance profit for each week trade is held. Do not take a loss, do not worry, do not get emotional. You may be in a trade for unto 12+ months.

### Important Notes 

- I recommend Oanda as broker, primarily for two reasons: 1. great spreads, 2. unit sizes as small as $1 (important for FIFO).
- I recommend trading on a practice account for a maximum of 1 month to acquire a basic understanding. After that you need to put some skin in the game with real cash. The biggest hurdle to your success is your lizard brain fears. The sooner you put cash in, the sooner you can conquer your lizard brain.
- Recommend [50:1 leveraged account](https://www.forex4noobs.com/forex-education/lots-leverage-margin/) but this system will work for leveraged accounts as low as 1:10.
- Take note, each week the units and TP change since your balance is larger each week. This system is designed for compounding growth.
- You are working on a weekly time schedule. Do not expect to make huge profits immediately.
- Only use 1 Day charts granularity. Do not try this system at smaller timeframes, you will crash and burn.
- Only have a maximum of 8 positions opened at one time! If you have 1 or more large losers opened then I recommend moving your maximum allowed positions down to 5 so you have adequate liquidity to hold losing positions.
- Never take a loss on a position.
- Never add to winning trades. Let them close in profit as planned. Again, this is to avoid greed and gambling.

### Advance methods to try

These methods below are alterations to the original system. They are only to be used after you acquire adequate experience (~6 months of trading) and have solid confidence in the system. If these methods are done correctly you can jump your earning potential but it is a double edge sword that can work in the opposite factor as well.

- Take partial profits on large losers if it turns into a range. Research FIFO rules. Avoid FIFO by make sure each trade is one unit ($1) more than the last.
- With initial trades try placing bounding orders at two nearest S+R lines instead of market trades. This sets conditions for a entry a trade... a Pair needs to prove to you it can first break a S+R line and will indeed have the strength to go the way you want it to.
- Increase TP each week a trade is open. Add 0.2% of balance to each position for each week it is opened.
- If you are sitting on a large negative position and you witness a large rejection candle in your favor, consider placing a trade at units 4x your normal trade. This will explode your earning potential.
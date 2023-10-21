/** @param {NS} ns */

export async function main(ns)
{
	var organizationSymbols = ns.stock.getSymbols();

	for (var i = 0; i < organizationSymbols.length; i++)
	{
		var organizationSymbol = organizationSymbols[i];

		var numOfShares = getNumOfShares(organizationSymbol);
		var priceOfShare = getPriceOfShare(organizationSymbol);

		ns.tprint(
			organizationSymbol
			+ " - "
			+ ns.stock.getOrganization(organizationSymbol)
			+ ": "
			+ ns.formatNumber(numOfShares)
			+ " (Max: "
			+ ns.formatNumber(ns.stock.getMaxShares(organizationSymbol))
			+ ") X "
			+ ns.formatNumber(priceOfShare)
			+ " = "
			+ ns.formatNumber(numOfShares * priceOfShare)
			+ ". Purchase cost: "
			+ ns.formatNumber(
				ns.stock.getPurchaseCost(
					organizationSymbol,
					1,
					"Long"))
			+ ". Ask price: "
			+ ns.formatNumber(ns.stock.getAskPrice(organizationSymbol))
			+ ". Bid price: "
			+ ns.formatNumber(ns.stock.getBidPrice(organizationSymbol))
			+ ". Forecast: "
			+ ns.stock.getForecast(organizationSymbol));
	}

	function getNumOfShares(organizationSymbol)
	{
		return ns.stock.getPosition(organizationSymbol)[0];
	}

	function getPriceOfShare(organizationSymbol)
	{
		return ns.stock.getPosition(organizationSymbol)[1];
	}
}

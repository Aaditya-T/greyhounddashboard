/* eslint-disable jsx-a11y/anchor-is-valid */
import LoadingOverlay from 'react-loading-overlay-ts';
import React, { useState, useRef, useEffect } from "react";
import { Tab, Nav, Button, Modal } from "react-bootstrap";
import { dataa } from './greyhoundVolume';
import { data } from './ActivityLine3';
import { GHdata } from './ActivityLine';
import TransactionsSent from './TransactionsSent'
import TransactionsReceived from './TransactionsReceived'
import TransactionsSell from './TransactionsSell'
import TransactionsBuy from './TransactionsBuy'
import GreyVolume from "./greyhoundVolume";
import GreySupply from "./greyhoundSupply";
import ActivityLine from "./ActivityLine";
import ActivityLine3 from "./ActivityLine3";
import Tilt from 'react-vanilla-tilt';
import { dataSup } from './greyhoundSupply';
import { convertHexToString } from '../utls';

function format(x, p) {
	if (p === undefined) {
		p = 2;
	}
	let formated_number = Number.parseFloat(x).toFixed(p);
	let tmp = String(formated_number).split('.');

	// Add spaces for thousand sep
	tmp[0] = tmp[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	return tmp.join('.');
}
const formatNumber = (num) => {
	try {
		if (num >= 1000000000) {
			return format(num / 1000000000, 2) + "B";
		} else if (num >= 1000000) {
			return format(num / 1000000, 2) + "M";
		} else if (num >= 1000) {
			return format(num / 1000, 1) + "K";
		} else {
			return format(num, 0);
		}
	} catch (e) {
		return num;
	}
};

const reverseFormat = (num) => {
	try {
		const len = num.length;
		if (len > 1) {
			const lastChar = num.charAt(len - 1);
			const value = parseFloat(num.substring(0, len - 1));
			switch (lastChar) {
				case "K":
					return value * 1000;
				case "M":
					return value * 1000000;
				case "B":
					return value * 1000000000;
				default:
					return num;
			}
		}
		return num;
	} catch (e) {
		return num;
	}
};

const reverseFormatCommas = (num) => {
	try {
		//check if string has a comma
		if (num.includes(",")) {
			return parseFloat(num.replace(/,/g, ""));
		}
		return num;
	} catch (e) {
		return num;
	}
};

function Dashboard(props) {
	const [isActive, setActive] = useState(true)
	const [greyHoundBalance, setGreyHoundBalance] = useState(0)
	const [greyHoundSupply, setGreyHoundSupply] = useState(1000000000000)
	const [greyHoundAmountBurnt, setGreyHoundAmountBurnt] = useState(0)
	const [lastTransactionsSent, setLastTransactionsSent] = useState([])
	const [lastTransactionsReceived, setLastTransactionsReceived] = useState([])
	const [lastTransactionsSell, setLastTransactionsSell] = useState([])
	const [lastTransactionsBuy, setLastTransactionsBuy] = useState([])
	const [snapShotTier, setSnapShotTier] = useState('None')
	const [basicModal, setBasicModal] = useState(false);
	const [ogModal, setOgModal] = useState(false);
	const [greyHoundPrice, setGreyHoundPrice] = useState(0)
	const [xrpPrice, setXrpPrice] = useState(0)
	const [qrcodepng, setQrcodepng] = useState('')
	const [popupTrade, setPopupTrade] = useState(false)
	const [volumeTraded, setVolumeTraded] = useState(0)
	const [balanceChanges, setBalanceChanges] = useState(0)
	const [showChangePos, setShowChangePos] = useState(false)
	const [showChangeNeg, setShowChangeNeg] = useState(false)
	const [showNoChange, setShowNoChange] = useState(false)
	const [baseAmount, setBaseAmount] = useState(0)
	const [quoteAmount, setQuoteAmount] = useState(0)
	const [issueCheck, setIssueCheck] = useState(false)
	const [issueAmount, setIssueAmount] = useState(0)
	const [xrpBalance, setXrpBalance] = useState(0)
	const [listenWs, setListenWs] = useState(false)
	const ws = useRef(WebSocket);
	const [xrpQT, setXrpQT] = useState(0)
	const [curStringB, setCurStringB] = useState('')
	const [curStringS, setCurStringS] = useState('')
	const [showSuccess, setShowSuccess] = useState(false)
	const [showError, setShowError] = useState(false)
	const [tradeMode, setTradeMode] = useState(0) // 0 = buy, 1 = sell 
	const [pins, setPins] = useState([])

	const getMainData = async (requestContent) => {
		try {
			let response = await fetch(process.env.REACT_APP_PROXY_ENDPOINT + 'api/mainData', {
				method: 'post',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ "xrpAddress": requestContent })
			});
			let json = await response.json()
			var VolumeDict = json.TokenVolume
			var xrppricess = json.XRPPrices
			var ghpricess = json.GHPrices
			setBalanceChanges(json.Change)
			// setXrpBalance(json.XRPBalance)
			let xrpBal = json.XRPBalance - (json.Account_Lines.length * 2) - 10
			setXrpBalance(xrpBal)
			var labelsArray = []
			var dataArray = []
			var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			var counter = 0
			for (var key in VolumeDict) {
				// console.log(VolumeDict[key])
				// console.log(key)
				labelsArray.push(months[counter])
				dataArray.push(VolumeDict[key])
				counter += 1
			}
			dataa.datasets[0].data = dataArray
			dataa.labels = labelsArray
			setVolumeTraded(dataArray[dataArray.length - 1])
			var xrpPirces = []
			var days = []
			for (var key in xrppricess) {
				xrpPirces.push(format(xrppricess[key], 4))
				days.push(key)
			}
			data.datasets[0].data = xrpPirces
			data.labels = days
			var ghPirces = []
			var dayss = []
			for (var key in ghpricess) {
				ghPirces.push(format(ghpricess[key], 8))
				dayss.push(key)
			}
			GHdata.datasets[0].data = ghPirces
			GHdata.labels = dayss
			return { success: true, data: json };
		} catch (error) {
			return { success: false };
		}
	}

	async function createOffer(amountBase, amountCounter, type) {
		//create offer
		if (type === 'sell') {
			var xummPayload = {
				"options": {
					"submit": true
				},
				"txjson": {
					"TransactionType": "OfferCreate",
					"Account": props.xrpAddress,
					"TakerPays": {
						"currency": "47726579686F756E640000000000000000000000",
						"issuer": "rJWBaKCpQw47vF4rr7XUNqr34i4CoXqhKJ",
						"value": amountBase
					},
					"TakerGets": `${amountCounter * 1000000}`,
					"Flags": 131072

				}
			}
		} else {
			let apiLinkTemp = "https://gh-api-gray.vercel.app/book_offers?xrpAmount=" + amountCounter;
			let response = await fetch(apiLinkTemp);
			let json = await response.json();
			amountBase = json.amount_gh;

			var xummPayload = {
				"options": {
					"submit": true
				},
				"txjson": {
					"TransactionType": "OfferCreate",
					"Account": props.xrpAddress,
					"TakerGets": {
						"currency": "47726579686F756E640000000000000000000000",
						"issuer": "rJWBaKCpQw47vF4rr7XUNqr34i4CoXqhKJ",
						"value": `${amountBase}`
					},
					"TakerPays": `${amountCounter * 1000000}`,
					"Flags": 131072
				}
			}
		}
		//send the payload to the XUMM API
		let response = await fetch(process.env.REACT_APP_PROXY_ENDPOINT + 'xumm/createpayload', {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(xummPayload)
		});
		let json = await response.json()
		//console.log(json)
		let qrCode = json.refs.qr_png
		//check if the user is on mobile
		let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if (isMobile) {
			window.open(json.next.always, '_blank');
		} else {
			setQrcodepng(qrCode)
		}
		////console.log(json)
		ws.current = new WebSocket(json.refs.websocket_status)
		setListenWs(true)
	}
	
	
	//detect button click and call function
	// document.addEventListener("DOMContentLoaded", function () {
	// 	//double click event
	// 	document.getElementById("swapButton").addEventListener("click", function () {
	// 		//console.log("swap")
	// 		//swap two divs but keep the button in the same place
	// 		var div_main = document.getElementById("trade-wrapper");
	// 		var div1 = document.getElementById("trade-box-counter");
	// 		var div2 = document.getElementById("trade-box-base");
	// 		var div3Button = document.getElementById("swapButtonC");
	// 		// //console.log(div_main.firstChild)
	// 		if (div_main.firstChild.id === "trade-box-counter") {
	// 			div_main.insertBefore(div2, div1);
	// 			div_main.insertBefore(div3Button, div1);
	// 			//change the text inside the div (in a span) from Receive to pay with
	// 			document.getElementById("trade-box-counter").querySelector("span").innerHTML = "Receive"
	// 			document.getElementById("trade-box-base").querySelector("span").innerHTML = "Pay with"
	// 		} else {
	// 			div_main.insertBefore(div1, div2);
	// 			div_main.insertBefore(div3Button, div2);
	// 			document.getElementById("trade-box-counter").querySelector("span").innerHTML = "Pay with"
	// 			document.getElementById("trade-box-base").querySelector("span").innerHTML = "Receive"
	// 		}
	// 	});
	// 	document.getElementById("tradeButton").addEventListener("click", function () {
	// 		//disable the button
	// 		document.getElementById("tradeButton").disabled = true
	// 		let amountBase = document.getElementById("baseCur").value
	// 		let amountCounter = document.getElementById("counterCur").value
	// 		// setBaseAmount(amountBase)
	// 		// setQuoteAmount(amountCounter)
	// 		amountBase = reverseFormat(amountBase)
	// 		//convert from drops to xrp
	// 		amountCounter = amountCounter * 1000000
	// 		if (amountBase != "" && amountCounter != "" && amountBase != 0 && amountCounter != 0) {
	// 			var div_main = document.getElementById("trade-wrapper");
	// 			if (div_main.firstChild.id === "trade-box-counter") {
	// 				createOffer(amountBase, amountCounter, 'sell')
	// 				setBaseAmount(amountCounter / 1000000)
	// 				setQuoteAmount(amountBase)
	// 				setCurStringB("Hound")
	// 				setCurStringS("XRP")
	// 				amountCounter = amountCounter / 1000000
	// 				//1.5% fee
	// 				let fee = amountCounter * 0.015
	// 				setIssueAmount(fee)
	// 			} else {
	// 				createOffer(amountBase, amountCounter, 'buy')
	// 				setBaseAmount(amountBase)
	// 				setQuoteAmount(amountCounter / 1000000)
	// 				setCurStringB("XRP")
	// 				setCurStringS("Hound")
	// 				setIssueAmount(0)
	// 			}
	// 			let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	// 			// setPopupTrade(true)
	// 			if (!isMobile) {
	// 				setPopupTrade(true)
	// 			}
	// 		}
	// 		else {
	// 			alert("Please enter an amount")
	// 		}

	// 	});
	// 	//check if something is written in basecur
	// 	document.getElementById("counterCur").addEventListener("input", function () {
	// 		//disable the countercur
	// 		// document.getElementById("baseCur").disabled = true
	// 		let price = document.getElementById("gpricegraph").innerHTML
	// 		let xrpPr = document.getElementById("xrppricegraph").innerHTML
	// 		price = parseFloat(price)
	// 		setXrpQT(xrpPr * document.getElementById("counterCur").value)
	// 		// setGreyHoundQT(xrpPr * document.getElementById("counterCur").value)
	// 		document.getElementById("baseCur").value = formatNumber(document.getElementById("counterCur").value / price)
	// 		document.getElementById("baseCur").placeholder = formatNumber(document.getElementById("counterCur").value / price)
	// 		//change the text
	// 		// document.getElementById("counterCur").placeholder = "Disabled"
	// 		if (document.getElementById("counterCur").value == "") {
	// 			// document.getElementById("baseCur").disabled = false
	// 			document.getElementById("baseCur").placeholder = " "
	// 		}
	// 	});
	// 	document.getElementById("baseCur").addEventListener("input", function () {
	// 		//disable the countercur
	// 		// document.getElementById("counterCur").disabled = true
	// 		let price = document.getElementById("gpricegraph").innerHTML
	// 		let xrpPr = document.getElementById("xrppricegraph").innerHTML
	// 		price = parseFloat(price)
	// 		// setXrpQT(xrpPr * document.getElementById("counterCur").value)
	// 		// setGreyHoundQT(xrpPr * reverseFormatCommas(document.getElementById("counterCur").value))
	// 		document.getElementById("counterCur").value = document.getElementById("baseCur").value * price
	// 		document.getElementById("counterCur").placeholder = document.getElementById("baseCur").value * price
	// 		setXrpQT(xrpPr * document.getElementById("counterCur").value)
	// 		//change the text
	// 		// document.getElementById("baseCur").placeholder = "Disabled"
	// 		if (document.getElementById("baseCur").value == "") {
	// 			// document.getElementById("counterCur").disabled = false
	// 			document.getElementById("counterCur").placeholder = " "
	// 		}
	// 	}
	// 	);
	// });

	async function handleTrade() {
		//console.log(`Base: ${baseAmount} Quote: ${quoteAmount}`)
		//disable the button
		document.getElementById("tradeButton").disabled = true
		let url = "https://gh-api-gray.vercel.app/book_offers?xrpAmount=" + quoteAmount;
		// let response = await fetch(url) no cors
		let response = await fetch(url)
		let data = await response.json()
		//console.log(data)
		let amountBase = data.amount_gh
		let amountCounter = quoteAmount
		setBaseAmount(amountBase)
		setQuoteAmount(quoteAmount)
		createOffer(amountBase, amountCounter, 'sell')
		setCurStringS("XRP")
		setCurStringB("Hound")
		setIssueAmount(0)
		let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		// setPopupTrade(true)
		if (!isMobile) {
			setPopupTrade(true)
		} 
	}

	async function handleCounterCur(value) {
		setQuoteAmount(value)
		//change BaseCur
		if (tradeMode === 0) {
			let price = document.getElementById("gpricegraph").innerHTML
			let xrpPr = document.getElementById("xrppricegraph").innerHTML
			price = parseFloat(price)

			setXrpQT(xrpPr * value)

			document.getElementById("baseCur").value = formatNumber(value / price)
			document.getElementById("baseCur").placeholder = formatNumber(value / price)

			setBaseAmount(value / price)

			//1.5% fee
			let fee = value * 0.015
			setIssueAmount(fee)
		} else {
			let price = document.getElementById("gpricegraph").innerHTML
			let xrpPr = document.getElementById("xrppricegraph").innerHTML
			price = parseFloat(price)

			setXrpQT(xrpPr * value)

			document.getElementById("baseCur").value = formatNumber(value * price)
			document.getElementById("baseCur").placeholder = formatNumber(value * price)

			setBaseAmount(value * price)
			setIssueAmount(0)
		}
	}

	async function handleBaseCur(value) {
		setBaseAmount(value)
	}

	async function handleSwap() {
		// if (tradeMode === 0) {
		// 	console.log("Swap")
		// 	setTradeMode(1)
		// 	setCurStringB("Hound")
		// 	setCurStringS("XRP")
		// } else {
		// 	setTradeMode(0)
		// 	setCurStringB("XRP")
		// 	setCurStringS("Hound")
		// }
		// var div_main = document.getElementById("trade-wrapper");
		// var div1 = document.getElementById("trade-box-counter");
		// var div2 = document.getElementById("trade-box-base");
		// var div3Button = document.getElementById("swapButtonC");
		// var baseInput = document.getElementById("baseCur");
		// var counterInput = document.getElementById("counterCur");
		// if (div_main.firstChild.id === "trade-box-counter") {
		// 	div_main.insertBefore(div2, div1);
		// 	div_main.insertBefore(div3Button, div1);
		// 	document.getElementById("trade-box-counter").querySelector("span").innerHTML = "Receive"
		// 	document.getElementById("trade-box-base").querySelector("span").innerHTML = "Pay with"
	
		// } else {
		// 	div_main.insertBefore(div1, div2);
		// 	div_main.insertBefore(div3Button, div2);
		// 	document.getElementById("trade-box-counter").querySelector("span").innerHTML = "Pay with"
		// 	document.getElementById("trade-box-base").querySelector("span").innerHTML = "Receive"
		// }
	}

	const handleChangeIss = event => {
		//console.log(event.target)
		//////console.log(issueCheck)
		if (event.target.checked) {
			setIssueCheck(true)
		}
		else {
			setIssueCheck(false)
		}

	}

	const getXummPayload = async (requestContent) => {
		try {
			let response = await fetch(process.env.REACT_APP_PROXY_ENDPOINT + 'xumm/getpayload', {
				method: 'post',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ "payloadID": requestContent })
			});
			let json = await response.json()
			return { success: true, data: json };
		} catch (error) {
			return { success: false };
		}
	}

	useEffect(() => {
		async function getMainDataa() {
			////console.log("getMainData")
			let mainData = await getMainData(props.xrpAddress)
			setActive(false)
			// setShowChange(true)
			if (mainData.data.Change > 0) {
				setShowChangePos(true)
				setShowChangeNeg(false)
			}
			else if (mainData.data.Change === 0) {
				setShowChangePos(false)
				setShowChangeNeg(false)
				setShowNoChange(true)
			}
			else {
				setShowChangeNeg(true)
				setShowChangePos(false)
			}

			ParseDataUpdateState(mainData)
		}

	getMainDataa()

    async function getPins() {
        try {
	        let response = await fetch(process.env.REACT_APP_PROXY_ENDPOINT + 'api/getnfts', {
	            method: 'POST',
	            headers: { 'Content-Type': 'application/json' },
	            body: JSON.stringify({"xrpAddress": props.xrpAddress})
	            });
	        let data = await response.json();
	        console.log(data);
	        let keys = Object.keys(data);
            let pins = [];
	        for (let i = 0; i < keys.length; i++) {
                let taxon = data[keys[i]].taxon;
                if (taxon === 2) {
                    pins.push({"name": data[keys[i]].name, "image": data[keys[i]].image, "nftid": keys[i]});
                    console.log(`Pin Detected: ${data[keys[i]].name}`)
                }
	        }
            setPins(pins);
        } catch (error) {
            console.log(error);
        }
    }

	getPins();
	}, [props.xrpAddress])

	function closePopup() {
		document.getElementById("tradeButton").disabled = false
		setPopupTrade(false)
		setListenWs(false)
		ws.current.close()
		//enable the button
	}

	useEffect(() => {
		ws.current.onmessage = async (e) => {
			if (!listenWs) return;
			let responseObj = JSON.parse(e.data.toString())
			if (responseObj.signed !== null) {
				//console.log(responseObj)
				const payload = await getXummPayload(responseObj.payload_uuidv4)
				//console.log(payload)

				if (payload.success) {
					//console.log('signed')
					// console.log(responseObj)
					if (responseObj.signed === true) {
						closePopup()
						setShowSuccess(true)
						setTimeout(() => {
							setShowSuccess(false)
						}, 6000);
					} else {
						closePopup()
						setShowError(true)
						setTimeout(() => {
							setShowError(false)
						}, 6000);
					}
				}
			}
		}
	}, [listenWs])

	function SendTierToParent(tier) {
		props.updateTier(tier);
	}

	function convertRippleEpochToDate(epoch) {
		var d = new Date(0);
		d.setUTCSeconds(epoch + 946684800);
		return getFormattedDate(d);
	}

	function getFormattedDate(date) {
		var year = date.getFullYear();

		var month = (1 + date.getMonth()).toString();
		month = month.length > 1 ? month : '0' + month;

		var day = date.getDate().toString();
		day = day.length > 1 ? day : '0' + day;

		return month + '/' + day + '/' + year;
	}

	function ParseDataUpdateState(mainData) {
		try {

			setSnapShotTier(mainData.data.UserTier.tier);
			SendTierToParent(mainData.data.UserTier.tier)

			//Get Greyhound Balance
			for (let i = 0; i < mainData.data.Account_Lines.length; i++) {
				if (mainData.data.Account_Lines[i].currency === '47726579686F756E640000000000000000000000') {
					setGreyHoundBalance(Math.round(parseFloat(mainData.data.Account_Lines[i].balance)));
				}
			}
			//Set Greyhound Supply
			if (mainData.data.GreyHoundAmount[0].sum !== null) {
				setGreyHoundSupply(Math.round(mainData.data.GreyHoundAmount[0].sum));
				setGreyHoundAmountBurnt(parseFloat((1 - parseFloat(mainData.data.GreyHoundAmount[0].sum) / 1000000000000) * 100).toFixed(2))
				dataSup.labels = ['Hound Supply', 'Hound Burnt'];
				dataSup.datasets[0].data = [1000000000000, mainData.data.GreyHoundAmount[0].sum];
			}
			//Get Greyhound Price
			setGreyHoundPrice(format(mainData.data.CurrentGH, 8))
			//Get XRP Price
			let xrpprice = mainData.data.CurrentXRP
			//parse to float and reduce to 2 decimals
			xrpprice = parseFloat(xrpprice).toFixed(4)
			setXrpPrice(xrpprice)
			//Set Transactions
			let receivedTxns = []
			let sentTxns = []
			let sellTxns = []
			let buyTxns = []
			for (let i = 0; i < mainData.data.Transactions.length; i++) {
				if (mainData.data.Transactions[i].tx.TransactionType === 'Payment') {
					if (mainData.data.Transactions[i].tx.Destination === props.xrpAddress) {
						//Received
						if (typeof mainData.data.Transactions[i].tx.Amount === 'object') {
							//token currency
							if (mainData.data.Transactions[i].tx.Amount.currency.length === 3) {
								//standard currency
								receivedTxns.push({ currency: mainData.data.Transactions[i].tx.Amount.currency, amount: format(mainData.data.Transactions[i].tx.Amount.value), date: convertRippleEpochToDate(mainData.data.Transactions[i].tx.date), account: mainData.data.Transactions[i].tx.Account, hash: mainData.data.Transactions[i].tx.hash })
							} else {
								if (mainData.data.Transactions[i].tx.Amount.currency === '47726579686F756E640000000000000000000000') {
									//greyhound currency
									receivedTxns.push({ currency: "HOUND", amount: format(mainData.data.Transactions[i].tx.Amount.value), date: convertRippleEpochToDate(mainData.data.Transactions[i].tx.date), account: mainData.data.Transactions[i].tx.Account, hash: mainData.data.Transactions[i].tx.hash })
								} else {
									receivedTxns.push({ currency: convertHexToString(mainData.data.Transactions[i].tx.Amount.currency), amount: format(mainData.data.Transactions[i].tx.Amount.value), date: convertRippleEpochToDate(mainData.data.Transactions[i].tx.date), account: mainData.data.Transactions[i].tx.Account, hash: mainData.data.Transactions[i].tx.hash })
									//non-standard currency
								}
							}

						} else {
							receivedTxns.push({ currency: 'XRP', amount: Math.round(parseFloat(mainData.data.Transactions[i].tx.Amount) / 1000000), date: convertRippleEpochToDate(mainData.data.Transactions[i].tx.date), account: mainData.data.Transactions[i].tx.Account, hash: mainData.data.Transactions[i].tx.hash })
							//standard XRP
						}
					} else {
						//Sent
						if (typeof mainData.data.Transactions[i].tx.Amount === 'object') {
							//token currency
							if (mainData.data.Transactions[i].tx.Amount.currency.length === 3) {
								//standard currency
								sentTxns.push({ currency: mainData.data.Transactions[i].tx.Amount.currency, amount: format(mainData.data.Transactions[i].tx.Amount.value), date: convertRippleEpochToDate(mainData.data.Transactions[i].tx.date), account: mainData.data.Transactions[i].tx.Destination, hash: mainData.data.Transactions[i].tx.hash })
							} else {
								if (mainData.data.Transactions[i].tx.Amount.currency === '47726579686F756E640000000000000000000000') {
									sentTxns.push({ currency: "HOUND", amount: format(mainData.data.Transactions[i].tx.Amount.value), date: convertRippleEpochToDate(mainData.data.Transactions[i].tx.date), account: mainData.data.Transactions[i].tx.Account, hash: mainData.data.Transactions[i].tx.hash })

								} else {
									//non-standard currency
									sentTxns.push({ currency: convertHexToString(mainData.data.Transactions[i].tx.Amount.currency), amount: format(mainData.data.Transactions[i].tx.Amount.value), date: convertRippleEpochToDate(mainData.data.Transactions[i].tx.date), account: mainData.data.Transactions[i].tx.Destination, hash: mainData.data.Transactions[i].tx.hash })
								}
							}

						} else {
							//standard XRP
							sentTxns.push({ currency: 'XRP', amount: Math.round(parseFloat(mainData.data.Transactions[i].tx.Amount) / 1000000), date: convertRippleEpochToDate(mainData.data.Transactions[i].tx.date), account: mainData.data.Transactions[i].tx.Destination, hash: mainData.data.Transactions[i].tx.hash })
						}
					}
				}
			}
			//Sell Buy Transactions
			for (let i = 0; i < mainData.data.TokenBuy.length; i++) {
				buyTxns.push({ amount: mainData.data.TokenBuy[i].amountGH, amountXrp: mainData.data.TokenBuy[i].TakerGetsXRP, exchangeRate: mainData.data.TokenBuy[i].price, address: mainData.data.TokenBuy[i].address })
			}
			for (let i = 0; i < mainData.data.TokenSell.length; i++) {
				sellTxns.push({ amount: mainData.data.TokenSell[i].amount, amountXrp: mainData.data.TokenSell[i].priceXrp, exchangeRate: mainData.data.TokenSell[i].price, address: mainData.data.TokenSell[i].seller })
			}

			//console.log(sentTxns, receivedTxns)
			setLastTransactionsSent(sentTxns);
			setLastTransactionsReceived(receivedTxns);
			setLastTransactionsSell(sellTxns);
			setLastTransactionsBuy(buyTxns);

		} catch (err) {

		}
	}

	function handleNft() {
		window.location.href = '/userprofile'
	}

	function handleNft1() {
		window.location.href = '/claimNFT'
	}



	return (
		<LoadingOverlay
			active={isActive}
			styles={{
				content: {
					width: '100%',
					height: '100%',
					marginTop: '400px',
					verticalAlign: 'top',
				}
			}}
			spinner
			text='Loading...'
		>
			<div className="content-body">
				<div className="container-fluid">
					<div className="row">

						<div className="col-xl-6 col-xxl-6 col-lg-6">
							<div className="card overflow-hidden">
								<div className="card-header border-0 pb-0">
									<h5 className="card-title text-black">Balance</h5>
									<div className="card-header-right">

									</div>
									<div className="btn sharp btn-details dropdown custom-dropdown mb-0 d-md-block d-none">
										<div data-toggle="dropdown">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
												xmlns="http://www.w3.org/2000/svg">
												<path
													d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
													stroke="#fff" strokeWidth="2"
													stroke-linecap="round" stroke-linejoin="round">
												</path>
												<path
													d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
													stroke="#fff" strokeWidth="2"
													stroke-linecap="round" stroke-linejoin="round">
												</path>
												<path
													d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
													stroke="#fff" strokeWidth="2"
													stroke-linecap="round" stroke-linejoin="round">
												</path>
											</svg>
										</div>
										<div className="dropdown-menu dropdown-menu-right">
											<a className="dropdown-item" href={'https://bithomp.com/explorer/' + props.xrpAddress} target="_blank">View Details</a>
										</div>
									</div>
								</div>
								<div className="card-body">
									<div className="balance-info pb-4">
										<div>
											<h2 className="card-text text-white fs-28 greyhound-price" style={{ fontWeight: 700 }} id="greyhound-amount">{format(greyHoundBalance)} HOUND</h2>
											<span>≈ </span><h2 className="card-text fs-14 dollar-price"> {format(format(greyHoundPrice, 8) * greyHoundBalance)} XRP</h2>
											{/* <span className="fs-14 ml-3 font-w500 text-success " href="#"><i className="fi fi-rr-arrow-small-up"></i> {format(balanceChanges,2)}</span><br /> */}
											{/* //only show this change when `showChange` is true */}
											{showChangePos && <span className="fs-14 ml-3 font-w500 text-success " href="#"><i className="fi fi-rr-arrow-small-up"></i> {format(balanceChanges, 2)}% (30 day change)</span>}
											{showChangeNeg && <span className="fs-14 ml-3 font-w500 text-danger " href="#"><i className="fi fi-rr-arrow-small-down"></i> {format(balanceChanges, 2)}% (30 day change)</span>}
											{showNoChange && <span className="fs-14 ml-3 font-w500 text-success " href="#"><i className="fi fi-rr-arrow-small-up"></i> {format(balanceChanges, 2)}% (30 day change)</span>}
										</div>
									</div>


								</div>





								<div className="card-footer border-0 pt-0">
									<h5 className="card-title text-white">Badges Collection</h5>
									<div id="pins">
							
										{Array(pins.length).fill().map((_, i) => (
                                            <li className="nav-item dropdown medal">
                                                <a className="nav-link"
                                                   href={process.env.REACT_APP_URL + "nftDetails?nftid=" + pins[i].nftid}
                                                   data-toggle="modal">
                                                    <img src={pins[i].image} title={pins[i].name}
                                                        draggable="false" alt="pin"
                                                        />
                                                </a>
                                            </li>
                                        ))}
									</div>
								</div>





								<Modal className="fade" id="badge-nft-airdrop" show={basicModal} size="lg">
									<div className="modal-content modal-badge">
										<Modal.Header>
											2022 NFT Snapshot Medal
											<Button
												variant=""
												className="close"
												onClick={() => setBasicModal(false)}
											>
												<span>&times;</span>
											</Button>
										</Modal.Header>
										<Modal.Body>
											<svg className="badge-bg" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
												<circle cx="30" cy="30" r="18" />
											</svg>
											<Tilt className="tlt" options={{ scale: 1, max: 35, perspective: 1000 }} style={{}}>
												<img className="layer0" draggable="false" src="./images/badges/airdropnft_layer0.png" />
												<img className="layer1" draggable="false" src="./images/badges/airdropnft_layer1.png" />
											</Tilt>
											<p className="mt-5">You successfully held through the March 13th snapshot to earn an NFT from the Houndies collection.</p>
										</Modal.Body>
									</div>
								</Modal>

								<Modal className="fade" id="badge-greyhound-og" show={ogModal} size="lg">
									<div className="modal-content modal-badge">
										<Modal.Header>
											2022 OG Snapshot Medal
											<Button
												variant=""
												className="close"
												onClick={() => setOgModal(false)}
											>
												<span>&times;</span>
											</Button>
										</Modal.Header>
										<Modal.Body>
											<svg className="badge-bg" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
												<circle cx="30" cy="30" r="18" />
											</svg>
											<Tilt className="tlt" options={{ scale: 1, max: 35, perspective: 1000 }} style={{}}>
												<img className="layer0" draggable="false" src="./images/badges/og_layer0.png" />
												<img className="layer1" draggable="false" src="./images/badges/og_layer1.png" />
											</Tilt>
											<p className="mt-5">You have been here since the genesis of Greyhound. Thanks for being an early supporter and an OG.</p>
										</Modal.Body>
									</div>
								</Modal>




							</div>
						</div>
						
						<div className="col-xl-6 col-xxl-6 col-lg-6">
                        	<div className="card nft-intro-card">
	                            <div className="row">
	
	                                <div className="col-md-8 col-sm-8 col-8 justify-content-center align-self-center">
	                                    <div className="card-body">
	                                        <h2 className="card-text text-white">Discover, Collect Mint Houndies NFTs</h2>
	                                        <p>Time has come to mint your houndies!</p>
	                                        <a href="/nftCollection" className="btn btn-white rounded-4 mb-2">
	                                            Explore
	                                        </a>
	                                         
	                                        <a href="/nftMint" className="btn btn-white rounded-4 mb-2 ml-2">
	                                            Mint NFT
	                                        </a>
	                                    </div>
	                                </div>
	
	                                <div className="col-md-4 col-sm-4 col-4">
	                                    <img draggable="false" src="./images/hound-3d.png" alt="NFT 1" />
	                                </div>
	                            </div>
	                        </div>
	                    </div>
						
						
						
						
						
						{/*<div className="col-xl-5 col-xxl-5 col-lg-5">
							<div className="card ">
								
								<div className="card-body">
									<div className='d-flex gap-30 ntf-owned-card'>
										<div className='left'>
											<h2>The Houndies Airdrop is finally here! </h2>
											<button className="btn btn-white rounded-4 mt-3" onClick={handleNft1}>Claim NFT</button>
										</div>
										<div className='right'>
											<Swiper spaceBetween={15} slidesPerView={""} scrollbar={{ draggable: true }}>
													<SwiperSlide>
														<NftCard className="min" name="Houndie #4334" nft={"/images/placeholder/4334.png"} clickable={false} />
													</SwiperSlide>
													<SwiperSlide>
														<NftCard className="min" name="Houndie #7698" nft={"/images/placeholder/7698.png"} clickable={false} />
													</SwiperSlide>
													<SwiperSlide>
														<NftCard className="min" name="Houndie #4812" nft={"/images/placeholder/4812.png"} clickable={false}/>
													</SwiperSlide>
													<SwiperSlide>
														<NftCard className="min" name="Houndie #6141" nft={"/images/placeholder/6141.png"} clickable={false}/>
													</SwiperSlide>
													<SwiperSlide>
														<NftCard className="min" name="Houndie #8572" nft={"/images/placeholder/8572.gif"} clickable={false}/>
													</SwiperSlide>
													<SwiperSlide>
														<NftCard className="min" name="Houndie #6551" nft={"/images/placeholder/6551.png"} clickable={false}/>
													</SwiperSlide>
											</Swiper>
										</div>
									</div>
								</div>
							</div>
						</div>*/}

						<div className="col-xl-8 col-xxl-8 col-lg-8">
							<div className="row">
								<div className="col-xl-12 col-xxl-12 col-lg-12">


									<div className="card overflow-hidden trade-card">
										{/* <div class="alert alert-success">
										<strong>Success!</strong> Indicates a successful or positive action.
									</div> */}
										{showSuccess && (
											<div className="alert alert-success">
												<strong>Success!</strong> The txn was signed!.
											</div>
										)}

										{showError && (
											<div className="alert alert-danger">
												<strong>Declined!</strong> The txn was declined!.
											</div>)}
										<div className="card-header border-0 pb-0 d-block d-md-flex">
											<h5 className="card-title text-white">Quick Swap</h5>
										</div>
										<div className="card-body">
											<div className="row">
												<div className="trade-wrapper" id='trade-wrapper'>
													<div className="flex-col trade-box" id="trade-box-counter">
														<span className="text-white">Pay with</span>
														<form id='swapBase' className='swap-form'>
															<div className="dropdow d-block mt-sm-0">
																<div className="btn d-flex align-items-center rounded-4 svg-btn btn-md" data-toggle="dropdown" aria-expanded="false">
																	<img src="./images/tokens/xrp.png" height="30px" id='counterImage' alt="xrp" />
																	<div className="text-left ml-3">
																		<span className="d-block fs-20 text-white" id='counterField'>XRP</span>
																	</div>
																	<i className="fa fa-angle-down scale3 ml-3 text-white" />
																</div>
																<div className="dropdown-menu dropdown-menu-right" x-placement="bottom-end" style={{ position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(-37px, 72px, 0px)' }}>
																	<a className="dropdown-item" href="">HOUND</a>
																</div>
															</div>
																<input type="text" className="form-control fs-28" placeholder={greyHoundPrice} id='counterCur' autoComplete='off' onChange= { (e) => handleCounterCur(e.target.value) } />
																{/* <input type="text" className="form-control fs-28" placeholder={greyHoundPrice} id='counterCur' autoComplete='off' onChange= { (e) => handleCounterCur(e.target.value) } disabled /> */}
															
														</form>

														<div className='trade-value'>
															<p className="fs-14" id='houndPriceXRP'>Balance: {format(xrpBalance)}</p>
															<p className="fs-14" id='houndPriceXRP'>≈ ${format(xrpQT, 2)}</p>
														</div>
													</div>
													<div className="flex-col justify-content-center align-self-center" id='swapButtonC'>
														{/* <button className="round-button" id="swapButton" onClick = { () => setTradeMode(tradeMode === 'buy' ? 'sell' : 'buy') }> */}
														<button className="round-button" id="swapButton" onClick = { () => handleSwap() } disabled={true}>
															<i className="fi fi-rr-exchange"></i>
														</button>
													</div>
													<div className="flex-col trade-box" id='trade-box-base'>
														<span className="text-white">Receive</span>
														<form id='swapCount'>
															<div className="dropdown d-block  mt-sm-0">
																<div className="btn d-flex align-items-center rounded-4 svg-btn btn-md" data-toggle="dropdown" aria-expanded="false">
																	<img className="gh-icon" src="./images/svg/logo-icon.svg" height="30px" id='baseImage' alt="hound" />
																	<div className="text-left ml-3">
																		<span className="d-block fs-20 text-white" id='baseField'>HOUND</span>
																	</div>
																	<i className="fa fa-angle-down scale3 ml-3 text-white" />
																</div>
																<div className="dropdown-menu dropdown-menu-right" x-placement="bottom-end" style={{ position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(-37px, 72px, 0px)' }}>
																	<a className="dropdown-item" href="">XRP</a>
																</div>
															</div>
															{/* <input type="text" className="form-control fs-28" placeholder="1" id='baseCur' autoComplete='off' onChange= change baseAmount /> */}
															{/* <input type="text" className="form-control fs-28" placeholder="1" id='baseCur' autoComplete='off' onChange={ (e) => handleBaseCur(e.target.value) } /> */}
																<input type="text" className="form-control fs-28" placeholder="1" id='baseCur' autoComplete='off' onChange={ (e) => handleBaseCur(e.target.value) } disabled />
														</form>
														<div className='trade-value'>
															<p className="fs-14" id='houndPriceXRP'>Balance: {format(greyHoundBalance)}</p>
															<p className="fs-14" id='houndPriceXRP'>≈ ${format(xrpQT, 2)}</p>
														</div>
													</div>
												</div>
											</div>
										</div>

										<div className="card-footer border-0 pt-0">
											<div className="row align-items-center">
												<div className="col-md-5 col-sm-12">
													<div className="form-check custom-checkbox ">
														<input
															type="checkbox"
															className="form-check-input"
															id="issuer-fee"
															value={setIssueCheck}
															onChange={handleChangeIss} />
														<label className="form-check-label " for="issuer-fee">Include issuer fee (1.5%)</label>
													</div>
												</div>
												<div className="col-md-7 text-left mt-3 mt-sm-0 text-sm-right">
													{/* <a href="" className="btn btn-primary rounded-4 mb-2">Trade</a></div></div></div> */}
													<button className="btn btn-white rounded-4 mb-2" id='tradeButton'
													 onClick={handleTrade}>
													 Place order</button></div></div></div>

										<Modal className="xumm-tx" size='lg' animation={false} show={popupTrade} centered>
											<img className="modal-above-image" src="./images/xumm.svg" />
											<Modal.Header>
												<Modal.Title>Confirm Swap</Modal.Title>
												<button type="button" onClick={closePopup} className="close"><span aria-hidden="true">×</span><span className="sr-only">Close</span></button>
											</Modal.Header>
											<Modal.Body>
												<div className="xumm-tx-container">
													<div>
														<div className='tx-info'>
															<span>You Pay</span>
															<p className='text-white'>{quoteAmount} XRP</p>
														</div>
														<div className='tx-info'>
															<span>Receive</span>
															<p className='text-white'>{baseAmount} GH</p>
														</div>
														{issueCheck && <div className='tx-info'>
															<span>Issuer Fee</span>
															<p className='text-white'>{issueAmount} XRP</p>
														</div>}

														<div className='tx-info'>
															<span>XRP transaction fee</span>
															<p className='text-white'>0.000012 XRP</p>
														</div>
													</div>

													<div className="qr-code-img">

														<img src={qrcodepng} alt="QR Code" />
													</div>
												</div>

											</Modal.Body>
										</Modal>

									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-xl-6 col-xxl-6 col-lg-6">
									<div className="card overflow-hidden">
										<div className="card-header border-0 pb-0">
											<div className="me-auto">
												<h5 className="card-title text-white mb-2">Hound Supply</h5>
												<p className="mb-3 fs-14 font-w500">Total: {formatNumber(greyHoundSupply)}<p className="mb-3 fs-14 font-w500 text-red" style={{ paddingTop: '0px' }}> Burnt: {greyHoundAmountBurnt}%</p></p>
											</div>
										</div>
										<div className="card-body p-0">
											<GreySupply />
										</div>
									</div>
								</div>
								<div className="col-xl-6 col-xxl-6 col-lg-6">
									<div className="card overflow-hidden">
										<div className="card-header border-0 pb-0">
											<div className="me-auto">
												<h5 className="card-title text-white mb-2">Volume</h5>
												<p className="mb-3 fs-14 font-w500">{format(volumeTraded)} XRP in the last month</p>
											</div>
										</div>
										<div className="card-body p-0">
											<GreyVolume />
										</div>
									</div>
								</div>
							</div>

						</div>
						<div className="col-xl-4 col-xxl-4 col-lg-4">
							<div className="card overflow-hidden">
								<div className="card-header border-0 d-sm-flex d-block">

									<div>
										<h4 className="fs-20 text-white">Last Transactions</h4>
									</div>
									<div className="card-action card-tabs mt-3 mt-sm-0">
										<ul className="nav nav-tabs" role="tablist">
											<li className="nav-item">
												<a className="nav-link " data-toggle="tab" href="#sent" role="tab" aria-selected="true">
													Sent
												</a>
											</li>
											<li className="nav-item">
												<a className="nav-link active" data-toggle="tab" href="#received" role="tab" aria-selected="false">
													Rec
												</a>
											</li>
										</ul>
									</div>

								</div>
								<div className="card-body p-0 tab-content card-table">
									{/* SENT */}
									<div className="tab-pane " id="sent">
										<div className="table-responsive">
											<table className="table">
												<tbody>
													<TransactionsSent transactions={lastTransactionsSent} />
												</tbody>
											</table>
										</div>
									</div>
									{/* RECEIVED */}
									<div className="tab-pane fade active show" id="received">
										<div className="table-responsive">
											<table className="table">
												<tbody>
													<TransactionsReceived transactions={lastTransactionsReceived} />
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>

					</div>














					<div className="row">
						<div className="col-xl-8 col-xxl-8 col-lg-6">






							<div className="card">
								<div className="card-header d-sm-flex d-block pb-0 border-0">
									<div>
										<h4 className="text-black fs-20">Market Overview</h4>
										<p className="fs-13 mb-0">
											Current 30 day market information
										</p>
									</div>
								</div>
								<div className="card-body" id="user-activity">
									<Tab.Container defaultActiveKey="all">
										<div className="d-flex flex-wrap justify-content-between mb-5">
											<div className="card-action card-tabs icontabs mt-3 mt-sm-0">
												<Nav className="nav nav-tabs" role="tablist">
													<Nav.Item className="nav-item">
														<Nav.Link eventKey="all">
															<img src="images/tokens/greyhound.svg" style={{ height: '28px' }} />
														</Nav.Link>
													</Nav.Item>
													<Nav.Item className="nav-item">
														<Nav.Link eventKey="xrp" >
															<img src="images/svg/xrp-icon.svg" style={{ height: '20px' }} />
														</Nav.Link>
													</Nav.Item>
												</Nav>
											</div>
											<div className="d-flex align-items-center mt-3 mt-sm-0" id="marketTab">

												<Tab.Pane eventKey="all">
													<p className="mb-0 fs-13 mr-3">Current HOUND price</p>
													<h2 className="mb-0 text-black font-w600" id='gpricegraph'>
														{/* {greyHoundPrice} */}
														{format(greyHoundPrice, 8)}
													</h2>
												</Tab.Pane>
												<Tab.Pane eventKey="xrp">
													<p className="mb-0 fs-13 mr-3">Current XRP price</p>
													<h2 eventKey="xrp" className="mb-0 text-black font-w600" id='xrppricegraph'>
														{/* {xrpPrice} */}
														{/* change xrpPrice to 3 decimals */}
														{format(xrpPrice, 3)}
													</h2>
												</Tab.Pane>
											</div>
										</div>
										<Tab.Content
											className="tab-content"
											id="myTabContent"
										>
											<Tab.Pane eventKey="all">
												<ActivityLine />
											</Tab.Pane>
											<Tab.Pane eventKey="xrp">
												<ActivityLine3 />
											</Tab.Pane>
										</Tab.Content>
									</Tab.Container>
								</div>
							</div>










						</div>
						<div className="col-xl-4 col-xxl-4 col-lg-6">
							<div className="card overflow-hidden">
								<div className="card-header border-0 pb-0">
									<div>
										<h4 className="fs-20 text-white">Recent Orders</h4>
									</div>
									<div className="card-action card-tabs mt-3 mt-sm-0">
										<ul className="nav nav-tabs" role="tablist">
											<li className="nav-item">
												<a className="nav-link active" data-toggle="tab" href="#buy" role="tab" aria-selected="true">
													Buy
												</a>
											</li>
											<li className="nav-item">
												<a className="nav-link" data-toggle="tab" href="#send" role="tab" aria-selected="false">
													Sell
												</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="card-body p-0 tab-content">
									{/* send */}
									<div className="tab-pane" id="send">
										<div className="table-responsive">
											<table className="table text-center bg-info-hover card-table">
												<thead>
													<tr>
														<th className="text-left text-white fs-16">Greyhound Amount</th>
														<th className=" text-white fs-16">Price (XRP)</th>
													</tr>
												</thead>
												<tbody>
													<TransactionsSell transactions={lastTransactionsSell} />
												</tbody>
											</table>
										</div>
									</div>
									{/* buy */}
									<div className="tab-pane fade active show" id="buy">
										<div className="table-responsive">
											<table className="table text-center bg-info-hover card-table">
												<thead>
													<tr>
														<th className="text-left text-white fs-16">Greyhound Amount</th>
														<th className=" text-white fs-16">Price (XRP)</th>
													</tr>
												</thead>
												<tbody>
													<TransactionsBuy transactions={lastTransactionsBuy} />
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</LoadingOverlay>
	);
}

export default Dashboard;

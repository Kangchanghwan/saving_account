var Constants = {
	LoadingCnt : 0
	, KINFA_HISTORY : "_kinfaHistory"
};

var ComUtil = {

	/**
	 * 문자열 전체 변경
	 * @parameter find 		: 변경할 문자열
	 * @parameter replace 	: 변경될 문자열
	 * @parameter str 		: 변경대상 문자열
	 * @return 				: 변경 완료한 문자열
	 */
	replaceAll : function(find, replace, str){
		return str.toString().replace(new RegExp(find, 'g'), replace);
	},

	/**
	 * 문자열 앞뒤 공백 제거
	 * @parameter str 		: 변경대상 문자열
	 * @return 				: 변경 완료한 문자열
	 */
	replaceEmpty : function(str){
		if(!ComUtil.isNull(str)){
			return str.toString().replace(/(^\s*)|(\s*$)/gi, '');
		}else{
			return null;
		}
	},

	/**
	 * 숫자 3자리마다 , 넣기
	 * @parameter str 		: ,를 넣을 숫자
	 * @return 				: ,가 들어간 숫자
	 */
	setComma : function(str){
//		if(/^[0-9]+$/.test(str)){
		if(/^[+-]?\d*(\.?\d*)$/.test(str)){
			if(str.toString().indexOf('.') == -1){
				return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}else{
				str = str.toString();
				var intVal = str.substring(0, str.indexOf('.'));
				var floatVal = str.substring(str.indexOf('.')+1, str.length);
				intVal = intVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				return intVal + '.' + floatVal;
			}
		}else{
			return str;
		}
	},

	/**
	 * null check
	 * @parameter data 		: null 여부 체크할 데이터
	 * @return 				: null 이면 true, null이 아니면 false
	 */
	isNull : function(data){
		if(data === undefined ||  data === 'undefined'
			|| data === null || data === 'null' || (typeof(data) == 'string' && data.replace(/(^\s*)|(\s*$)/gi, '') === '')
			|| (data != null && typeof(data) == 'object' && !Object.keys(data).length) ){
			return true;
		} else {
			return false;
		}
	},

	/**
	 * 숫자만 있는지 확인
	 * @parameter str 		: 확인할 문자열
	 * @return 				: 숫자면 true, 숫자가 아니면 false
	 */
	isNum : function(str){
		if(!ComUtil.isNull(str)){
			return /^[+-]?\d*(\.?\d*)$/.test(str.toString());
		}else{
			return false;
		}
	},

	/**
	 * 숫자만 있는지 확인
	 * @parameter str 		: 확인할 tag
	 */
	changeNum : function(tagObj){
		var chkVal = $(tagObj).val();
		if(!ComUtil.isNull(chkVal) && !ComUtil.isNum(chkVal)){
			$(tagObj).val('');
			$(tagObj).focus();
		}
	},

	/**
	 * 한글+숫자만 있는지 확인
	 * @parameter str 		: 확인할 문자열
	 * @return 				: 한글+숫자 면 true, 한글+숫자가 아니면 false
	 */
	isKoreanAndNum : function(str){
		if(!ComUtil.isNull(str)){
			return /^[가-힣\s0-9]*$/.test(str.toString());
		}else{
			return false;
		}
	},

	/**
	 * 한글+숫자만 있는지 확인
	 * @parameter str 		: 확인할 tag
	 */
	changeKoreanAndNum : function(tagObj){
		var chkVal = $(tagObj).val();
		if(!ComUtil.isNull(chkVal) && !ComUtil.isKoreanAndNum(chkVal)){
			$(tagObj).val('');
			$(tagObj).focus();
		}
	},

	/**
	 * 한글+영문만 있는지 확인
	 * @parameter str 		: 확인할 문자열
	 * @return 				: 한글+영문 면 true, 한글+영문가 아니면 false
	 */
	isLetter : function(str){
		if(!ComUtil.isNull(str)){
			return /^[가-힣a-zA-Z\s]*$/.test(str.toString());
		}else{
			return false;
		}
	},

	/**
	 * 한글+영문만 있는지 확인
	 * @parameter str 		: 확인할 tag
	 */
	changeLetter : function(tagObj){
		var chkVal = $(tagObj).val();
		if(!ComUtil.isNull(chkVal) && !ComUtil.isLetter(chkVal)){
			$(tagObj).val('');
			$(tagObj).focus();
		}
	},


	/**
	 * 영문(대문자+소문자) + 숫자 만 있는지 확인
	 * @parameter str 		: 확인할 문자열
	 * @return 				: 영문(대문자) 면 true, 영문(대문자)가 아니면 false
	 */
	isCapitalAndNum : function(str){
		if(!ComUtil.isNull(str)){
			return /^[A-Za-z0-9\s]*$/.test(str.toString());
		}else{
			return false;
		}
	},

	/**
	 * 영문(대문자+소문자) + 숫자 + "." 만 있는지 확인
	 * @parameter str 		: 확인할 문자열
	 * @return 				: 영문(대문자) 면 true, 영문(대문자)가 아니면 false
	 */
	isCapitalAndNumAndDot : function(str){
		if(!ComUtil.isNull(str)){
			return /^[A-Za-z0-9/.\s]*$/.test(str.toString());
		}else{
			return false;
		}
	},

	/**
	 * 영문(대문자)+숫자 만 있는지 확인
	 * @parameter str 		: 확인할 tag
	 */
	changeCapitalAndNum : function(tagObj){
		var chkVal = $(tagObj).val();
		if(!ComUtil.isNull(chkVal) && !ComUtil.isCapitalAndNum(chkVal)){
			$(tagObj).val('');
			$(tagObj).focus();
		}
	},

	/**
	 * E-mail 형식인지 확인
	 * @parameter str 		: 확인할 문자열
	 * @return 				:
	 */
	isEmail : function(str){
		if(!ComUtil.isNull(str)){
			return /(\w+\.)*\w+@(\w+\.)+[A-Za-z]+/.test(str);
		}else{
			return false;
		}
	},

	/**
	 * 세션스토리지 데이터 저장
	 * @parameter key 		: 저장할 데이터의 이름
	 * @parameter value 	: 저장할 데이터
	 */
	setSessionStorage : function (key, value) {
		if(key == undefined) {
			console.error('저장할 key가 없습니다.');
		} else if(value == undefined) {
			console.error('저장할 value가 없습니다.');
		} else {
			if(typeof(value) == 'object') {
				value = JSON.stringify(value);
			}
			sessionStorage.setItem(key, value);
		}
	},

	/**
	 * 세션스토리지 데이터 호출
	 * @parameter key 		: 호출할 데이터의 이름
	 */
	getSessionStorage : function (key) {
		var ssValue = null;
		if(key == undefined) {
			console.warn('조회할 key가 없습니다.');
		} else if(sessionStorage.getItem(key) == undefined) {
			console.warn('저장된 data가 없습니다.');
		} else {
			try{
				ssValue = JSON.parse( sessionStorage.getItem(key) );
			} catch(e){
				ssValue = sessionStorage.getItem(key);
			}
			return ssValue;
		}
	},

	/**
	 * 세션스토리지 데이터 삭제
	 * @parameter key 		: 삭제할 데이터의 이름
	 */
	removeSessionStorage : function (key) {
		if(key == undefined) {
			console.warn('삭제할 key가 없습니다.');
		}else{
			var ssValue = sessionStorage.getItem(key);
			if(ssValue == undefined) {
				console.warn('삭제할 value가 없습니다.');
			} else {
				sessionStorage.removeItem(key);
			}
		}
	},

	/**
	 * 쿠키 데이터 저장
	 * @parameter cookieName	: 저장할 쿠키명
	 * @parameter value			: 저장할 데이터
	 * @parameter value			: 저장할 기간(날자)
	 */
	setCookie : function (cookieName, value, exdays){
		var exdate = new Date();
		if(ComUtil.isNull(exdays)){
			exdays = 1;
		}
		exdate.setDate(exdate.getDate() + exdays);
		var cookieValue = escape(value) + ((exdays==null) ? "" : "; expires=" + exdate.toGMTString());
		document.cookie = cookieName + "=" + cookieValue;
	},

	/**
	 * 쿠키 데이터 삭제
	 * @parameter cookieName 	: 삭제할 쿠키의 이름
	 */
	deleteCookie : function (cookieName){
		var expireDate = new Date();
		expireDate.setDate(expireDate.getDate() - 1);
		document.cookie = cookieName + "= " + "; expires=" + expireDate.toGMTString();
	},

	/**
	 * 쿠키 데이터 삭제
	 * @parameter cookieName 	: 삭제할 쿠키의 이름
	 */
	getCookie :function (cookieName) {
		cookieName = cookieName + '=';
		var cookieData = document.cookie;
		var start = cookieData.indexOf(cookieName);
		var cookieValue = '';
		if(start != -1){
			start += cookieName.length;
			var end = cookieData.indexOf(';', start);
			if(end == -1)end = cookieData.length;
			cookieValue = cookieData.substring(start, end);
		}
		return unescape(cookieValue);
	},

	/**
	 * JSON 객체 복제
	 * @parameter jsonObj 	: 삭제할 쿠키의 이름
	 * @return 				: 주소값이 다른 복사된 객체
	 */
	copyJsonObj : function(jsonObj){
		var returnObj = {};
		try{
			returnObj = JSON.parse(JSON.stringify(jsonObj));
		}catch(e){
			for(var key in jsonObj){
				returnObj[key] = jsonObj[key];
			}
		}

		return returnObj;
	},

	/**
	 * 숫자값 한글로 변환
	 * @parameter numStr 	: 변환할 숫자값
	 * @return 				: 변환된 한글 문자열
	 */
	getKoreanNumStr : function(numStr){
		var danArr = ['', '만', '억', '조', '경'];
		var hanDanArr = ['', '십', '백', '천'];
		var hanArr = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

		var han = '';
		var result = '';

		numStr = numStr.toString();

		if(!/^[0-9]*$/.test(numStr)){
			return result;
		}

		for(var i = 0; i < numStr.length; i++){
			str = '';

			han = hanArr[numStr.charAt(numStr.length - (i+1))];

			if(han != '' && (i/4) < danArr.length){
				str += han + hanDanArr[i%4];
			}else if((i/4) >= danArr.length){
				str += numStr.charAt(numStr.length - (i+1));
			}

			if(i%4 == 0){
				if((i/4) < danArr.length){
					str += danArr[i/4];
				}
			}
			result = str + result;
		}
		return result;
	},

	/**
	 * 현재날자 시간 조회
	 * @parameter sep 		: 날자구분자
	 * @parameter typeof 	: 날자만 사용할지 여부(true : 날자만, false : 시간포함)
	 * @return 				: 현재날자
	 */
	getCurrentTime : function(sep, type){
		var d = new Date();
		var year = d.getFullYear().toString();
		var month = (d.getMonth() + 1).toString();
		var date = d.getDate().toString();
		var hour = d.getHours().toString();
		var min = d.getMinutes().toString();
		var sec = d.getSeconds().toString();

		if(ComUtil.isNull(sep)){
			sep = '/';
		}

		var cd = year + sep;
		cd += (month.length == 1 ? "0" : "") + month + sep;
		cd += (date.length == 1 ? "0" : "") + date;

		var ct = (hour.length == 1 ? "0" : "") + hour + ':';
		ct += (min.length == 1 ? "0" : "") + min + ':';
		ct += (sec.length == 1 ? "0" : "") + sec;

		if(ComUtil.isNull(type) || type){
			return cd;
		} else {
			return cd + " " + ct;
		}
	},

	/**
	 * 날자 계산
	 * @parameter dateVal				: 계산하고자 하는 날자 (ex. 2018-10-22)
	 * @parameter calcVal 				: 더하거나 뺄 값
	 * @parameter ymdFlag 				: 어디에 더할지 년 (YY) 월 (MM) 일 (DD)
	 */
	calcDate : function(dateVal, calcVal, ymdFlag){
		var date;

		if(ComUtil.isNull(dateVal) || ComUtil.isNull(calcVal) || ComUtil.isNull(ymdFlag) || !ComUtil.isNum(calcVal)){
			return '';
		}

		calcVal = parseInt(calcVal);

		var y = parseInt(dateVal.substring(0, 4));
		var m = parseInt(dateVal.substring(5, 7), 10) -1;
		var d = parseInt(dateVal.substring(8, 10), 10);

		if(ymdFlag == 'YY'){
			date = new Date(y + (calcVal), m, d);
		}else if(ymdFlag == 'MM'){
			date = new Date(y, m + (calcVal), d);
		}else if(ymdFlag == 'DD'){
			date = new Date(y, m, d + (calcVal));
		}

		d = date.getDate();
		m = date.getMonth() + 1;
		y = date.getFullYear();

		return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
	},

	/**
	 * 날짜 차이 계산
	 * @parameter firstDt			: 계산할 첫 번째 날짜
	 * @parameter secondDt			: 계산할 두 번째 날짜
	 */
	compareDate : function(firstDt, secondDt){
		if(ComUtil.isNull(firstDt) || ComUtil.isNull(secondDt)){
			return 0;
		}
		var fDt = new Date(firstDt);
		var sDt = new Date(secondDt);
		return (fDt.getTime() - sDt.getTime()) / (1000 * 60 * 60 *24);
	},

	/**
	 * 자릿수 반올림
	 * @parameter num					: 반올림할 숫자
	 * @parameter digit				 	: 자릿수 (ex. 10의 단위로 끊을 경우 10, 소숫점 첫번째 자리까지 표시된 반올림의 경우 0.1)
	 */
	round : function(num, digit){
		if(ComUtil.isNum(num) && ComUtil.isNum(digit)){
			num = parseFloat(num);
			digit = parseFloat(digit);

			var digitVal;
			if(digit < 1){
				digitVal = digit.toString().substring(digit.toString().indexOf('.') + 1, digit.length).length;
			}
			num = (Math.round(num / digit) * digit);
			if(digit < 1){
				num = parseFloat(num.toFixed(digitVal));
			}
			return num;
		}else{
			return 0;
		}
	},

	/**
	 * 자릿수 버림
	 * @parameter num					: 버림할 숫자
	 * @parameter digit				 	: 자릿수 (ex. 10의 단위로 끊을 경우 10, 소숫점 첫번째 자리까지 표시된 버림의 경우 0.1)
	 */
	roundDown : function(num, digit){
		if(ComUtil.isNum(num) && ComUtil.isNum(digit)){
			num = parseFloat(num);
			digit = parseFloat(digit);
			var digitVal;
			if(digit < 1){
				digitVal = digit.toString().substring(digit.toString().indexOf('.') + 1, digit.length).length;
			}
			num = (Math.floor(num / digit) * digit);
			if(digit < 1){
				num = parseFloat(num.toFixed(digitVal));
			}
			return num;
		}else{
			return 0;
		}
	},

	/**
	 * 자릿수 올림
	 * @parameter num					: 올림할 숫자
	 * @parameter digit				 	: 자릿수 (ex. 10의 단위로 끊을 경우 10, 소숫점 첫번째 자리까지 표시된 올림의 경우 0.1)
	 */
	roundUp : function(num, digit){
		if(ComUtil.isNum(num) && ComUtil.isNum(digit)){
			num = parseFloat(num);
			digit = parseFloat(digit);
			var digitVal;
			if(digit < 1){
				digitVal = digit.toString().substring(digit.toString().indexOf('.') + 1, digit.length).length;
			}
			num = (Math.ceil(num / digit) * digit);
			if(digit < 1){
				num = parseFloat(num.toFixed(digitVal));
			}
			return num;
		}else{
			return 0;
		}
	},

	/**
	 * Array 특정 key의 value 기준으로 정렬
	 * @parameter dataList				: 정렬할 객체 Array
	 * @parameter sortKey				: 객체의 정렬의 기준이 될 key
	 * @parameter reFlag				: 정렬 역순 여부
	 */
	sortBySpecificKey : function(dataList, sortKey, reFlag){
		if(ComUtil.isNull(dataList) || dataList.length == 0 || ComUtil.isNull(sortKey)){
			return dataList;
		}
		var tmpSort = [];
		var isNumFlag = true;
		for(var i = 0; i < dataList.length; i++){
			if(!ComUtil.isNull(dataList[i][sortKey])){
				tmpSort.push(dataList[i][sortKey]);
				if(ComUtil.isNum(dataList[i][sortKey]) == false){
					isNumFlag == false;
				}
			}
		}
		// 해당 key 값이 없는 경우 정렬 불가
		if(tmpSort.length != dataList.length){
			return dataList;
		}
//		dataList = JSON.parse(JSON.stringify(dataList));

		if(isNumFlag){
			tmpSort.sort(function(a, b){return a-b;});
		}else{
			tmpSort.sort();
		}

		if(!ComUtil.isNull(reFlag) && reFlag == true){
			tmpSort.reverse();
		}
		var tmpDataList = [];
		var cnt = 0;
		var i = 0;
		while(true){
			if(dataList[i][sortKey] == tmpSort[cnt]){
				tmpDataList.push(dataList[i]);
				dataList.splice(i, 1);
				cnt++;
				if(dataList.length == 0){
					break;
				}
				i = -1;
			}
			i++;
		}
		return tmpDataList;
	},

	/**
	 * Null Undefined 를 '' Empty String 으로 변환
	 * @parameter data					: 변환할 Data
	 */
	makeNullToEmptyStr : function(data){
		if(!ComUtil.isNull(data)){
			for(var key in data){
				if(data[key] == undefined || data[key] == null){
					data[key] = '';
				}else if(typeof(data[key]) == 'object'){
					data[key] = ComUtil.makeNullToEmptyStr(data[key]);
				}
			}
		}
		return data;
	},

	/**
	 * Ajax 호출
	 * @parameter paramMap				: parameter
	 * @parameter successCallBackFunc 	: 성공시 호출 함수
	 * @parameter errorCallBackFunc 	: 에러시 호출 함수
	 * @parameter async				 	: 동기/비동기 여부 (false:동기, true:비동기)
	 * @parameter isLoading				: 로딩바 호출 여부
	 */
	request : function(paramMap, successCallBackFunc, errorCallBackFunc, async, isLoading){

		var dataParam;
		var contentType;
		var url;

		if(ComUtil.isNull(paramMap)){
			console.warn('param 이 존재 하지 않습니다.');
			return;
		}

		if(ComUtil.isNull(paramMap['dataParam'])) {
			paramMap['dataParam']	= {};
		}

		url = paramMap['url'];

		if(ComUtil.isNull(url)){
			console.warn('url 이 존재 하지 않습니다.');
			return;
		}

		contentType = paramMap['contentType'];

		if(ComUtil.isNull(contentType)){
			dataParam = JSON.stringify(paramMap['dataParam']);
			contentType = 'application/json; charset=utf-8';
		} else {
			dataParam = paramMap['dataParam'];
			contentType = contentType;
		}

		if(ComUtil.isNull(async)){
			async = true;
		}

		if(ComUtil.isNull(isLoading) || isLoading){
			Constants.LoadingCnt++;
			$('#loading').show();
		}

		$.ajax({
			type		: 'POST',
			url			: url,
			contentType	: contentType,
			data		: dataParam,
			async		: async,
			success		: function(response, status, jqXhr) {
				var contentType = jqXhr.getResponseHeader('Content-Type');

				if(jqXhr.status == 200 && !ComUtil.isNull(contentType) && contentType.toString().toLowerCase().indexOf('text/html') >= 0){
					location.href = '/login';
				}

				if(ComUtil.isNull(isLoading) || isLoading){
					Constants.LoadingCnt--;
					if(Constants.LoadingCnt <= 0){
						$('#loading').hide();
					}
				}

				if(!ComUtil.isNull(response) && !ComUtil.isNull(successCallBackFunc) && typeof(successCallBackFunc) == 'function'){
					successCallBackFunc(response);
				}else if(ComUtil.isNull(successCallBackFunc)){
					console.error('Callback 함수가 없습니다.')
				}else{
					console.error('조회에 실패하였습니다.');
				}
			},
			beforeSend	: function(){

			},
			error		: function(e){
				console.error(e);

				if(ComUtil.isNull(isLoading) || isLoading){
					Constants.LoadingCnt--;
					if(Constants.LoadingCnt <= 0){
						$('#loading').hide();
					}
				}

				if(errorCallBackFunc != undefined && errorCallBackFunc != null && typeof(errorCallBackFunc) == 'function'){
					errorCallBackFunc(e);
				}else {
					if(!ComUtil.isNull(e['responseText']) && e['status'] == 503){
						//ComUtil.alert(e['responseText']);
						console.error(e['responseText']);
					}else{
						//ComUtil.alert(e['responseText']);
						console.error(e['responseText']);
//			    		ComUtil.alert('시스템에 일시적으로 장애가 발생하였습니다.');
					}
				}
			},
			ajaxComplete: function(){

			}
		});
	},

	/* 포용이 Ajax 호출 */
	request2 : function(paramMap, successCallBackFunc, errorCallBackFunc, async, isLoading){

		var dataParam;
		var contentType;
		var url;

		if(ComUtil.isNull(paramMap)){
			console.warn('param 이 존재 하지 않습니다.');
			return;
		}

		if(ComUtil.isNull(paramMap['dataParam'])) {
			paramMap['dataParam']	= {};
		}

		url = paramMap['url'];

		if(ComUtil.isNull(url)){
			console.warn('url 이 존재 하지 않습니다.');
			return;
		}

		contentType = paramMap['contentType'];

		if(ComUtil.isNull(contentType)){
			dataParam = JSON.stringify(paramMap['dataParam']);
			contentType = 'application/json; charset=utf-8';
		} else {
			dataParam = paramMap['dataParam'];
			contentType = contentType;
		}

		if(ComUtil.isNull(async)){
			async = true;
		}

		if(ComUtil.isNull(isLoading) || isLoading){
			Constants.LoadingCnt++;
			$('#poyongLoading').show();
		}

		$.ajax({
			type		: 'POST',
			url			: url,
			contentType	: contentType,
			data		: dataParam,
			async		: async,
			success		: function(response, status, jqXhr) {
				var contentType = jqXhr.getResponseHeader('Content-Type');

				if(jqXhr.status == 200 && !ComUtil.isNull(contentType) && contentType.toString().toLowerCase().indexOf('text/html') >= 0){
					location.href = '/login';
				}

				if(ComUtil.isNull(isLoading) || isLoading){
					Constants.LoadingCnt--;
					if(Constants.LoadingCnt <= 0){
						$('#poyongLoading').hide();
					}
				}

				if(!ComUtil.isNull(response) && !ComUtil.isNull(successCallBackFunc) && typeof(successCallBackFunc) == 'function'){
					successCallBackFunc(response);
				}else if(ComUtil.isNull(successCallBackFunc)){
					console.error('Callback 함수가 없습니다.')
				}else{
					console.error('조회에 실패하였습니다.');
				}
			},
			beforeSend	: function(){

			},
			error		: function(e){
				console.error(e);

				if(ComUtil.isNull(isLoading) || isLoading){
					Constants.LoadingCnt--;
					if(Constants.LoadingCnt <= 0){
						$('#loading').hide();
					}
				}

				if(errorCallBackFunc != undefined && errorCallBackFunc != null && typeof(errorCallBackFunc) == 'function'){
					errorCallBackFunc(e);
				}else {
					if(!ComUtil.isNull(e['responseText']) && e['status'] == 503){
						//ComUtil.alert(e['responseText']);
						console.error(e['responseText']);
					}else{
						//ComUtil.alert(e['responseText']);
						console.error(e['responseText']);
//			    		ComUtil.alert('시스템에 일시적으로 장애가 발생하였습니다.');
					}
				}
			},
			ajaxComplete: function(){

			}
		});
	},


	/**
	 * Ajax 호출
	 * @parameter paramMap				: parameter
	 * @parameter successCallBackFunc 	: 성공시 호출 함수
	 * @parameter errorCallBackFunc 	: 에러시 호출 함수
	 * @parameter async				 	: 동기/비동기 여부 (false:동기, true:비동기)
	 * @parameter isLoading				: 로딩바 호출 여부
	 */
	requestWithLonLoading : function(paramMap, successCallBackFunc, errorCallBackFunc, async, isLoading){

		var dataParam;
		var contentType;
		var url;

		if(ComUtil.isNull(paramMap)){
			console.warn('param 이 존재 하지 않습니다.');
			return;
		}

		if(ComUtil.isNull(paramMap['dataParam'])) {
			paramMap['dataParam']	= {};
		}

		url = paramMap['url'];

		if(ComUtil.isNull(url)){
			console.warn('url 이 존재 하지 않습니다.');
			return;
		}

		contentType = paramMap['contentType'];

		if(ComUtil.isNull(contentType)){
			dataParam = JSON.stringify(paramMap['dataParam']);
			contentType = 'application/json; charset=utf-8';
		} else {
			dataParam = paramMap['dataParam'];
			contentType = contentType;
		}

		if(ComUtil.isNull(async)){
			async = true;
		}

		if(ComUtil.isNull(isLoading) || isLoading){
			Constants.LoadingCnt++;
			$('#loading_lon').show();
		}

		$.ajax({
			type		: 'POST',
			url			: url,
			contentType	: contentType,
			data		: dataParam,
			async		: async,
			success		: function(response, status, jqXhr) {
				var contentType = jqXhr.getResponseHeader('Content-Type');

				if(jqXhr.status == 200 && !ComUtil.isNull(contentType) && contentType.toString().toLowerCase().indexOf('text/html') >= 0){
					location.href = '/login';
				}

				if(ComUtil.isNull(isLoading) || isLoading){
					Constants.LoadingCnt--;
					if(Constants.LoadingCnt <= 0){
						$('#loading_lon').hide();
					}
				}

				if(!ComUtil.isNull(response) && !ComUtil.isNull(successCallBackFunc) && typeof(successCallBackFunc) == 'function'){
					successCallBackFunc(response);
				}else if(ComUtil.isNull(successCallBackFunc)){
					console.error('Callback 함수가 없습니다.')
				}else{
					console.error('조회에 실패하였습니다.');
				}
			},
			beforeSend	: function(){

			},
			error		: function(e){
				console.error(e);

				if(ComUtil.isNull(isLoading) || isLoading){
					Constants.LoadingCnt--;
					if(Constants.LoadingCnt <= 0){
						$('#loading_lon').hide();
					}
				}

				if(!ComUtil.isNull(e['responseText']) && e['status'] == 503){
					ComUtil.alert(e['responseText']);
				}else{
					ComUtil.alert(e['responseText']);
//		    		ComUtil.alert('시스템에 일시적으로 장애가 발생하였습니다.');
				}

				if(errorCallBackFunc != undefined && errorCallBackFunc != null && typeof(errorCallBackFunc) == 'function'){
					errorCallBackFunc(e);
				}else {

				}
			},
			ajaxComplete: function(){

			}
		});
	},

	/**
	 * Submit 호출
	 * @parameter moveUrl				: submit할 URL
	 * @parameter params 				: parameter
	 * @parameter method 				: GET/POST 구분
	 */
	submit : function(moveUrl, params, method){
		if(ComUtil.isNull(moveUrl)){
			console.warn('URL 이 존재하지 않습니다.');
			return;
		}

		if($('#loading').length == 0){
			var tmp = '<div class="loading-page-wrap" id="loading" style="display:none;z-index: 1000;opacity: 0.5;">';
			tmp += '<div class="loading-page-cont">';
			tmp += '<div class="loading-page-top-img">';
			tmp += '<span></span>';
			tmp += '</div>';
			tmp += '<div class="loading-text-box">';
			tmp += '</div>';
			tmp += '</div>';
			tmp += '</div>';

			$('body').append(tmp);
		}

		$('#loading').show();

		setInterval(function(){
			if($('#loading').is(':visible')){
				if(ComUtil.isNull(method)){
					method = 'POST';
				}
				if($('#submitForm').length > 0){
					return;
				}
				$('body').append('<form id="submitForm" action="' + moveUrl + '" method="' + method + '"></form>');

				if(!ComUtil.isNull(params)){
					for(var key in params){
						var input = $('<input>').attr('type', 'hidden').attr('name', key).val(params[key]);
						$('#submitForm').append($(input));
					}
				}

				$('#submitForm').submit();
			}
		}, 100);
	},

	/**
	 * Submit 호출
	 * @parameter moveUrl				: submit할 URL
	 * @parameter params 				: parameter
	 * @parameter method 				: GET/POST 구분
	 */
	submitWithLonLoading : function(moveUrl, params, method){
		if(ComUtil.isNull(moveUrl)){
			console.warn('URL 이 존재하지 않습니다.');
			return;
		}

		if($('#loading_lon').length == 0){
			var tmp = '<div class="np-layer-card-bg"  id="loading_lon"  style="display:none;z-index: 1000;">';
			tmp += '<div class="np-layer-card">';
			tmp += '<div class="np-layer-popup-card">';
			tmp += '<span style :>';
			tmp += '<img src="/img/loan_movie.gif"';
			tmp += '</span>';
			tmp += '</div>';
			tmp += '</div>';
			tmp += '</div>';

			$('body').append(tmp);
		}

		$('#loading_lon').show();

		setInterval(function(){
			if($('#loading_lon').is(':visible')){
				if(ComUtil.isNull(method)){
					method = 'POST';
				}
				if($('#submitForm').length > 0){
					return;
				}
				$('body').append('<form id="submitForm" action="' + moveUrl + '" method="' + method + '"></form>');

				if(!ComUtil.isNull(params)){
					for(var key in params){
						var input = $('<input>').attr('type', 'hidden').attr('name', key).val(params[key]);
						$('#submitForm').append($(input));
					}
				}

				$('#submitForm').submit();
			}
		}, 100);
	},

	/**
	 * 소수점 이하 0 붙이기
	 * @parameter decVal				: 0을 붙일 대상 값
	 * @parameter digit 				: 소수점 자릿수
	 */
	setDecimalPlace : function(decVal, digit){
		if(ComUtil.isNull(decVal) || ComUtil.isNull(digit) || !ComUtil.isNum(decVal) || !ComUtil.isNum(digit) || parseInt(digit) <= 0){
			return decVal;
		}
		decVal = decVal.toString();
		var index = decVal.indexOf('.');

		if(index == -1){
			decVal += '.';
			for(var i = 0; i < digit; i++){
				decVal += '0';
			}
		}else{
			var length = decVal.substring(decVal.indexOf('.') + 1, decVal.length).length;
			if(length < digit){
				while( length < digit){
					decVal += '0';
					length++;
				}
			}else{
				decVal = decVal.substring(0, decVal.indexOf('.') + 1 + digit);
			}
		}
		return decVal;
	},

	/**
	 * 특수문자 제거
	 * @parameter str				: 입력값
	 */
	regExpChg : function(str){
		var reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;

		if(reg.test(str)){
			return str.replace(reg,"");
		}else{
			return str;
		}
	},

	/**
	 * Validation
	 * @parameter type				: valid type
	 * @parameter value				: valid value
	 */
	isValid : function(type, value){
		if (isEmptyString(type) || isEmptyString(value)) {
			return false;
		}

		type = type.toUpperCase();

		if (type == 'ID') {
			if (/^[^가-힇]*$/.test(value)) {
				return false;
			}
			if (value.length < 6 || value.length > 30) {
				return false;
			}
		} else if (type == 'NAME') {
			if (value.length > 50) {
				return false;
			}
		} else if (type == 'DATE') {
			if (!/^(19|20)[0-9]{2}[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])$/.test(value)) {
				return false;
			}
		} else if (type == 'TEL_01') {
			if (/^[^0-9]*$/.test(value)) {
				return false;
			}
			if (value.length > 4) {
				return false;
			}
		} else if (type == 'TEL_02') {
			if (/^[^0-9]*$/.test(value)) {
				return false;
			}
			if (value.length > 4) {
				return false;
			}
		} else if (type == 'TEL_03') {
			if (/^[^0-9]*$/.test(value)) {
				return false;
			}
			if (value.length > 7) {
				return false;
			}
		} else if (type == 'MOB_01') {
			if (/^[^0-9]*$/.test(value)) {
				return false;
			}
			if (value.length < 1 || value.length > 3) {
				return false;
			}
		} else if (type == 'MOB_02') {
			if (/^[^0-9]*$/.test(value)) {
				return false;
			}
			if (value.length < 1 || value.length > 10) {
				return false;
			}
		} else if (type == 'EMAIL') {
			if (!/^[A-z0-9._-]+@[A-z0-9._-]+\.[a-z]{2,}$/.test(value)) {
				return false;
			}
		} else {
			return false;
		}

		return true;

		function isEmptyString(str) {
			if (str == undefined || str == null || str == '') {
				return true;
			}
			return false;
		}
	},

	/**
	 * Mobile OS Check
	 */
	checkMobileOS : function(){
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;

		if(/windows phone/i.test(userAgent)){
			return 'WIN';
		}

		if(/android/i.test(userAgent)){
			return 'AND';
		}

		if(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream){
			return 'IOS';
		}
	},

	/**
	 * WebView Check
	 */
	checkIsWebView : function(){
		if(!ComUtil.isNull(ComUtil.getSessionStorage('TUser'))){
			return true;
		}

		var userAgent = navigator.userAgent || navigator.vendor || window.opera;

		if(userAgent.indexOf('KINFA') != -1){
			return true;
		}else{
			return false;
		}
	},

	/**
	 * init transkey
	 */
	setKeypad : function(){
		$("[keypad]").each(function(){
			$(this).attr({
				"data-tk-kbdType": $(this).attr("keypad")=="q"?"qwerty":"number"
				,"onfocus":"mtk.onKeyboard(this);"
				,"data-tk-bottom":"true"
			});
		});
		initmTranskey();
	},

	/**
	 * search company, search address
	 * @parameter type : ['company', 'address']
	 * @parameter returnFunctionName : function name that'll be taken address
	 * @return {addr0:"", addr1:"", addr2:""}
	 */
	searchAddr : function(url, returnFunctionName){
		var action = url;
		window.open("about:blank", "addrPop", "scollbars=no");
		$("[name='addrPopFrm']").remove();
		$("<form>",{name:"addrPopFrm", action:action, target:"addrPop", method:"post"}).appendTo("body");
		$("<input>",{type:"hidden", name:"returnFunctionName", value:returnFunctionName}).appendTo("[name='addrPopFrm']");
		$("[name='addrPopFrm']").submit();
	},
	searchCompany : function(returnFunctionName){
		ComUtil.searchAddr("/cmn/KFA_CMN_11000000",returnFunctionName);
	},
	searchAddress : function(returnFunctionName){
		ComUtil.searchAddr("/cmn/KFA_CMN_12000000",returnFunctionName);
	},
	searchCommonAddr : function(returnFunctionName){
		ComUtil.searchAddr("/common/search_addr",returnFunctionName);
	},
	searchYouAddress : function(returnFunctionName){
		ComUtil.searchAddr("/view/you/KFA_YOU_12000000", returnFunctionName);
	},


	/**
	 * Alert Customize
	 * @parameter msg				: 알릴 메세지
	 * @parameter callBackFunc		: 메세지 노출 후 작동할 Function
	 */
	alert : function(msg, callBackFunc) {
		$('#msg_alertPop').html(msg);
		$('#alertPopDiv').show();

		$('#cofirmBtn_alertPop').off('click');
		$('#cofirmBtn_alertPop').on('click', function(){
			$('#alertPopDiv').hide();
			if(!ComUtil.isNull(callBackFunc) && typeof(callBackFunc) == 'function'){
				callBackFunc();
			}
		});

		/**
		 alert(msg);

		 if(!ComUtil.isNull(callBackFunc) && typeof(callBackFunc) == 'function'){
			callBackFunc();
		}
		 **/
	},

	/**
	 * Confirm Customize
	 * @parameter msg				: 알릴 메세지
	 * @parameter callBackFunc		: 메세지 노출 후 작동할 Function
	 */
	confirm : function(msg, callBackFunc) {
		$('#cofirmMsg_confirmPop').html(msg);
		$('#confirmPopDiv').show();

		$('#cancelBtn_confirmPop').off('click');
		$('#cancelBtn_confirmPop').on('click', function(){
			callBackFunc(false);
			$('#confirmPopDiv').hide();
		});

		$('#confirmBtn_confirmPop').off('click');
		$('#confirmBtn_confirmPop').on('click', function() {
			callBackFunc(true);
			$('#confirmPopDiv').hide();
		});

		/**
		 var flag = confirm(msg);

		 if(!ComUtil.isNull(callBackFunc) && typeof(callBackFunc) == 'function'){
			callBackFunc(flag);
		}
		 **/
	},

	/**
	 * Confirm Customize
	 * @parameter msg				: 알릴 메세지
	 * @parameter callBackFunc		: 메세지 노출 후 작동할 Function
	 */
	confirmYN : function(msg, callBackFunc) {
		$('#cofirmMsg_confirmPopYN').html(msg);
		$('#confirmPopDivYN').show();

		$('#cancelBtn_confirmPopYN').off('click');
		$('#cancelBtn_confirmPopYN').on('click', function(){
			callBackFunc(false);
			$('#confirmPopDivYN').hide();
		});

		$('#confirmBtn_confirmPopYN').off('click');
		$('#confirmBtn_confirmPopYN').on('click', function() {
			callBackFunc(true);
			$('#confirmPopDivYN').hide();
		});

		/**
		 var flag = confirm(msg);

		 if(!ComUtil.isNull(callBackFunc) && typeof(callBackFunc) == 'function'){
			callBackFunc(flag);
		}
		 **/
	},

	/**
	 * 바이트 length 계산
	 * @parameter s				: 계산할 문자열
	 */
	getByteLength : function(s) {
		var b, i, c;
		for(b=i=0; c=s.charCodeAt(i++);b+=c>>11?3:c>>7?2:1);
		return b;
	},

	validateTotal : function(target, successFunc, errorFunc){
		var returnFlag = true;

		$('#' + target).find('input, select').each(function(){
			var targetId = $(this).attr('id');
			returnFlag = ComUtil.validateOne(targetId);

			if(!returnFlag){
				return false;
			}
		});

		if(returnFlag){
			if(!ComUtil.isNull(successFunc) && typeof(successFunc) == 'function'){
				successFunc();
			}
		}else{
			if(!ComUtil.isNull(errorFunc) && typeof(errorFunc) == 'function'){
				errorFunc();
			}
		}

		return returnFlag;
	},

	validateOne : function(target){
		var targetOne = $('#' + target);

		if(!ComUtil.isNull(targetOne.attr('required'))){
			if(targetOne.attr('required') == 'required' && ComUtil.isNull(targetOne.val()) ){
				ComUtil.alert(targetOne.attr('data-name') + '는 필수 값입니다.');
				return false;
			}else if(targetOne.attr('required') != 'required'){
				var targetId = targetOne.attr('required');
				if(!ComUtil.isNull($('#' + targetId).val()) && ComUtil.isNull(targetOne.val())){
					ComUtil.alert(targetOne.attr('data-name') + '는 ' + $('#' + targetId).attr('data-name') + ' 입력 시 필수 값입니다.');
					return false;
				}
			}
		}

		if(targetOne.attr('data-number') != undefined && !ComUtil.isNull(targetOne.val()) && !ComUtil.isNum(targetOne.val())){
			ComUtil.alert(targetOne.attr('data-name') + '는 숫자만 입력 가능합니다.');
			return false;
		}

		if(targetOne.attr('data-email') != undefined  && !ComUtil.isNull(targetOne.val()) && !ComUtil.isEmail(targetOne.val())){
			ComUtil.alert(targetOne.attr('data-name') + '는 올바른 이메일 형식이 아닙니다.');
			return false;
		}

		if(!ComUtil.isNull(targetOne.attr('data-min'))){
			if(!ComUtil.isNum(targetOne.val()) || parseInt(targetOne.attr('data-min')) > parseInt(targetOne.val()) ){
				ComUtil.alert(targetOne.attr('data-name') + '의 값은 최소 ' + targetOne.attr('data-min') + '를 넘어야 합니다.');
				return false;
			}
		}

		if(!ComUtil.isNull(targetOne.attr('data-max'))){
			if(!ComUtil.isNum(targetOne.val()) || parseInt(targetOne.attr('data-max')) < parseInt(targetOne.val()) ){
				ComUtil.alert(targetOne.attr('data-name') + '의 값은 최대 ' + targetOne.attr('data-max') + '를 넘을 수 없습니다.');
				return false;
			}
		}

		if(!ComUtil.isNull(targetOne.attr('data-minlength'))){
			if(parseInt(targetOne.attr('data-minlength')) > targetOne.val().length ){
				ComUtil.alert(targetOne.attr('data-name') + '의 길이는 최소 ' + targetOne.attr('data-minlength') + '를 넘어야 합니다.');
				return false;
			}
		}

		if(!ComUtil.isNull(targetOne.attr('data-maxlength'))){
			if(parseInt(targetOne.attr('data-maxlength')) < targetOne.val().length ){
				ComUtil.alert(targetOne.attr('data-name') + '의 길이는 최대 ' + targetOne.attr('data-maxlength') + '를 넘을 수 없습니다.');
				return false;
			}
		}

		return true;
	},

	/**
	 * 휴대폰 본인인증 모듈 로드
	 * returnUrl : 본인인증 후 응답 페이지
	 * returnParam : 본인인증 검증 및 다음 프로세스에서 필요한 파라미터
	 */
	KCBLoad	: function(returnUrl, returnParam) {
		var param = {};
		param.returnUrl		= location.origin + returnUrl;
		param.returnParam	= returnParam;

		var paramMap = {
			url			: '/kcb/init'
			, dataParam	: param
		}
		ComUtil.request(paramMap, function(result) {

			if(result && result.CODE == "0000") {
				console.log(JSON.stringify(result))

				var historyObj	= JSON.parse(sessionStorage.getItem(Constants.KINFA_HISTORY));

				if(historyObj == null) {
					historyObj	= {};
				}

				historyObj[location.pathname] = history.length;
				sessionStorage.setItem(Constants.KINFA_HISTORY, JSON.stringify(historyObj));

				$("body").append($("<form/>", {id: "kcbFrm", action:result.DATA.POPUPURL, method:"POST"}));
				$("#kcbFrm").append($("<input/>", {type:"hidden", name:"tc", value:result.DATA.TC}));
				$("#kcbFrm").append($("<input/>", {type:"hidden", name:"cp_cd", value:result.DATA.CP_CD}));
				$("#kcbFrm").append($("<input/>", {type:"hidden", name:"mdl_tkn", value:result.DATA.MDL_TKN}));
				$("#kcbFrm").append($("<input/>", {type:"hidden", name:"target_id"}));
				$("#kcbFrm").submit();
			}

		});
	},

	/**
	 * 로그인 성공 후 이동할 페이지를 전달하여 로그인 페이지 이동
	 */
	login : function(url){
		if(!ComUtil.isNull(url)){
			var param = {
				u	: url
			};
			ComUtil.submit('/login', param, 'GET');
		}else{
			ComUtil.submit('/login', null, 'GET');
		}
	},

	/**
	 * 이전 페이지의 pagename 반환
	 */
	getPrevPagename : function(){
		var pathname = "";
		var referrer = document.referrer;
		if(!ComUtil.isNull(referrer)){
			pathname = referrer.split("/");
		}

		return pathname[pathname.length - 1];
	},

	/**
	 * 날짜를 주어진 형식에 맞추어 변환
	 * date : Date객체
	 * dateFormat : string ('yyyy-MM-dd' 등)
	 */
	formatDate : function(date, dateFormat) {
		if(!date.valueOf()) return "";
		var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
		var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
		var weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		var d = date;

		return dateFormat.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function($1) {
			switch($1) {
				case "yyyy" : return d.getFullYear();				//년 4자리
				case "yy" : return (d.getFullYear() % 1000);		//년 2자리
				case "MM" : return (d.getMonth() + 1);			//월 2자리
				case "dd" : return d.getDate();				//일 2자리
				case "KS" : return weekKorShortName[d.getDay()];		//요일 짧은 한글
				case "KL" : return weekKorName[d.getDay()];			//요일 긴 한글
				case "ES" : return weekEngShortName[d.getDay()];		//요일 짦은 영어
				case "EL" : return weekEngName[d.getDay()];			//요일 긴 영어
				case "HH" : return d.getHours();				//시간 24시간 기준 2자리
				case "hh" : return ((h = d.getHours() % 12) ? h : 12);	//시간 12시간 기준 2자리
				case "mm" : return d.getMinutes();			//분 2자리
				case "ss" : return d.getSeconds();			//초 2자리
				case "a/p" : return d.getHours() < 12 ? "오전" : "오후";		//오전/오후 구분
				default : return $1;
			}
		});
	},
	back : function() {
		if(!ComUtil.isNull(ComUtil.getSessionStorage(location.pathname + "/previousPathname"))) {
			location.href = ComUtil.getSessionStorage(location.pathname + "/previousPathname");
		} else {
			location.href = "/drt/step1";
		}
	},
	disableScrolling : function (){
		var nowScrollX = window.scrollX;
		var nowScrollY = window.scrollY;

		$('html').css("touch-action", "none");

		window.onscroll=function (){
			window.scrollTo(nowScrollX, nowScrollY);
		}
	},
	enableScrolling : function (){
		$('html').css("touch-action", "auto");
		window.onscroll=function (){}
	},
	
	/**
	 * 텍스트 복사 기능 
	 * 다른 웹브라우저로 이동할시 복사된 값을 붙여넣기 하기 위한 함수
	 */
	clipboardCopy : function(text, msg) {
		if (navigator.clipboard) {
			alert(msg);
			return navigator.clipboard.writeText(text);
		}else {
			//임시 textarea 요소 생성
			const textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			
			//textarea 요소 선택 및 복사
			textArea.select();
			textArea.setSelectionRange(0, 99999);
			
			try {
				document.execCommand("copy");
				alert(msg);
			} catch (err) {
				throw err;
			} finally {
				//임시 요소 제거
				textArea.setSelectionRange(0, 0);
				document.body.removeChild(textArea);
			}
		}
	}
};

var NativeUtil = {

	showNativeTime : null,					// Native 화면 띄운 시간(안드로이드에서 중복으로 뜨는 문제가 있어 기능에 타이머 적용)
	easyPassParam : null,					// 간편인증 파라미터 - 결과에서 재등록, 핀 로그인 등 오류코드 공통 처리용
	callbackEasyPass : null,				// 간편인증 성공 콜백
	callbackeSign : null,					// 전자서명 성공 콜백
	callbackGetEasyPassValidType : null,	// 간편인증 가능타입 조회 성공 콜백
	callbackGetRegisteredValidType : null,	// 사용자가 등록한 간편인증타입 조회 성공 콜백
	callbackGetUserInfo : null,				// 사용자PK 조회 성공 콜백
	callbackSetUserInfo : null,				// 사용자PK 저장 성공 콜백
	callbackScraping : {},					// 스크래핑 콜백
	callbackAppAuthCheck : null,			// 앱위변조방지 콜백
	scrapingCallbackKeyCnt : 0,
	callbackCamera : null,					// 카메라모듈 성공 콜백
	cameraParam : null,						// 카메라모듈 파라미터


	/**
	 * 앱 리뷰 호출
	 */
	callAppReview : function() {
		if(NativeUtil.showNativeTime != null) {
			var ts	= new Date() - NativeUtil.showNativeTime;
			if(ts <= 1000) {
				return false;
			}
		}

		NativeUtil.showNativeTime	= new Date();

		var res = ComUtil.checkMobileOS();

		if(res == 'AND'){
			window.android.appReview();
		}else if(res == 'IOS'){
			webkit.messageHandlers.appReview.postMessage('');
		}else{
			return false;
		}
	},

	/**
	 * 카메라모듈 호출
	 *
	 * @parameter param : 이미지 업로드 param
	 * grtno		: 보증번호
	 * docType		: 문서타입코드
	 * @parameter callbackFunc : 성공시 호출 함수
	 */
	callCamera : function(param, callbackFunc) {
		if(NativeUtil.showNativeTime != null) {
			var ts	= new Date() - NativeUtil.showNativeTime;
			if(ts <= 1000) {
				return false;
			}
		}

		NativeUtil.showNativeTime	= new Date();

		var res = ComUtil.checkMobileOS();

		if(ComUtil.isNull(param)){
			console.info('카메라모듈 Parameter 미존재');
			NativeUtil.cameraParam = null;
			return false;
		}

		if(ComUtil.isNull(callbackFunc) || typeof(callbackFunc) != 'function'){
			console.info('카메라모듈 Callback Function 미존재');
			NativeUtil.callbackCamera = null;
			return false;
		}

		var paramStr = JSON.stringify(param)

		NativeUtil.cameraParam = param;
		NativeUtil.callbackCamera = callbackFunc;

		if(res == 'AND'){
			window.android.camera(paramStr);
		}else if(res == 'IOS'){
			webkit.messageHandlers.camera.postMessage(paramStr);
		}else{
			return false;
		}
	},

	/**
	 * 카메라모듈 호출 CallBack
	 *
	 * @parameter jsonStr : 이미지 업로드 응답 Data
	 * resultCode		  : 200 성공 / 그 외 실패
	 * message			  : 결과메시지
	 */
	cameraCallBack : function(jsonStr){
		var jsonData;

		if(!ComUtil.isNull(jsonStr)){
			jsonData = JSON.parse(jsonStr);
		}else{
			console.info('카메라모듈 Error');
			return false;
		}

		if (!ComUtil.isNull(NativeUtil.callbackCamera) && typeof (NativeUtil.callbackCamera) == 'function') {
			NativeUtil.callbackCamera(jsonData);
		}
	},

	/**
	 * 간편인증 호출
	 *
	 * @parameter param : 간편인증 param
	 * userInfo		: 사용자의 PK
	 * op			: 등록(Reg)/인증(Auth)/해지(Dereg)
	 * bioType		: 인증타입 - FINGERPRINT/PATTERN/PINCODE
	 * @parameter callbackFunc : 성공시 호출 함수
	 */
	callEasyPass : function(param, callbackFunc){

		if(NativeUtil.showNativeTime != null) {
			var ts	= new Date() - NativeUtil.showNativeTime;
			if(ts <= 1000) {
				return false;
			}
		}

		NativeUtil.showNativeTime	= new Date();

		var res = ComUtil.checkMobileOS();

		if(ComUtil.isNull(param)){
			console.info('간편인증 Parameter 미존재');
			NativeUtil.easyPassParam = null;
			return false;
		}

		if(ComUtil.isNull(callbackFunc) || typeof(callbackFunc) != 'function'){
			console.info('간편인증 Callback Function 미존재');
			NativeUtil.callbackEasyPass = null;
			return false;
		}

		var paramStr = JSON.stringify(param)

		NativeUtil.easyPassParam	= param;
		NativeUtil.callbackEasyPass = callbackFunc;

		if(res == 'AND'){
			window.android.easyPass(paramStr);
		}else if(res == 'IOS'){
			webkit.messageHandlers.easyPass.postMessage(paramStr);
		}else{
			return false;
		}
	},

	/**
	 * 간편인증 호출 CallBack
	 *
	 * @parameter jsonStr : 간편인증 응답 Data
	 * statusCode		: 0 성공/ -1 실패
	 * statusMessage	: 결과메시지
	 * bioType			: 인증타입 - FINGERPRINT/PATTERN/PINCODE
	 */
	easyPassCallBack : function(jsonStr){

		var jsonData;

//		ComUtil.alert('간편인증 완료\n' + jsonStr);

		if(!ComUtil.isNull(jsonStr)){
			jsonData = JSON.parse(jsonStr);
		}else{
			console.info('간편인증 Error');
			return false;
		}
		/*
		"성공:0,
		실패:-1,
		PIN번호 재등록:-100,
		지문 재등록:-101,
		패턴 재등록:-102,
		PIN번호 로그인:-103"
		*/
		if (jsonData.statusCode == 0){
			if (!ComUtil.isNull(NativeUtil.callbackEasyPass) && typeof (NativeUtil.callbackEasyPass) == 'function') {
				NativeUtil.callbackEasyPass(jsonData);
			}
		} else if(jsonData.statusCode == -2) {
			ComUtil.submit("/view/main");
		} else if(jsonData.statusCode == -100) {
			ComUtil.alert("PIN번호 재등록하기 위해 본인인증을 진행합니다.", function() {
				var dataParam		= NativeUtil.easyPassParam;
				ComUtil.KCBLoad("/reRegisterForLogin", dataParam);
			});
		} else if(jsonData.statusCode == -101) {
			ComUtil.alert("지문 재등록하기 위해 본인인증을 진행합니다.", function() {
				var dataParam		= NativeUtil.easyPassParam;
				ComUtil.KCBLoad("/reRegisterForLogin", dataParam);
			});
		} else if(jsonData.statusCode == -102) {
			ComUtil.alert("패턴 재등록하기 위해 본인인증을 진행합니다.", function() {
				var dataParam		= NativeUtil.easyPassParam;
				ComUtil.KCBLoad("/reRegisterForLogin", dataParam);
			});
		} else if(jsonData.statusCode == -103) {
			var dataParam		= NativeUtil.easyPassParam;
			dataParam.bioType	= "PINCODE";
			NativeUtil.callEasyPass(dataParam, NativeUtil.callbackEasyPass);
		} else if(jsonData.statusCode == 200) {
			ComUtil.alert("생체인증정보가 변경되었습니다. 생체인증정보를 재등록하기 위해 본인인증을 진행합니다.", function() {
				var dataParam		= NativeUtil.easyPassParam;
				ComUtil.KCBLoad("/reRegisterForLogin", dataParam);
			});
		} else if (jsonData.statusCode == 1501) {
			ComUtil.alert("인증이 실패하였습니다. [" + jsonData.statusCode + "]");
		} else if (jsonData.statusCode == 1301) {
			ComUtil.alert("간편인증재등록을 하면 해결될 수 있습니다.<br/>" +
				"회원등록 > 기존회원 확인 > 간편인증재등록<br/>" +
				"순서로 진행해주십시오.<br/>" + "  [" + " " + jsonData.statusCode+ " " + "]");
		} else {
			ComUtil.alert("인증에 실패하였습니다. 잠시 후 다시 시도하십시오<br/>" +
				"계속 문제 발생 시 1397로 접수해주십시오.<br/>"
				+ " [" + jsonData.statusMessage + "] " +"["+ jsonData.statusCode+ "]" )
		}


	},

	/**
	 * 전자서명 호출
	 *
	 * @parameter signMsg		: 전자서명 메세지
	 * @parameter callbackFunc	: 성공시 호출 함수
	 * @parameter visibleBtn	: 휴대폰인증 버튼 활성화 표시 여부(표시:"1", 미표시:"0", default:"0")
	 */
	calleSign : function(signMsg, callbackFunc, visibleBtn){
		if(NativeUtil.showNativeTime != null) {
			var ts	= new Date() - NativeUtil.showNativeTime;
			if(ts <= 1000) {
				return false;
			}
		}

		NativeUtil.showNativeTime	= new Date();

		if(ComUtil.isNull(callbackFunc) || typeof(callbackFunc) != 'function'){
			console.info('전자서명 Callback Function 미존재');
			NativeUtil.callbackeSign = null;
		}

		if(ComUtil.isNull(visibleBtn)) {
			visibleBtn	= "0";
		}

		var dataParam = {

		};
		var paramMap = {
			url			: '/cmn0/eSignNonce'
			, dataParam	: dataParam
		}
		ComUtil.request(paramMap, function(nonceData){
			if(!ComUtil.isNull(nonceData) && !ComUtil.isNull(nonceData['nonStr'])){
				var paramStr	= JSON.stringify({signMsg:signMsg + '&ksbizNonce=' + nonceData['nonStr'], visibleBtn:visibleBtn});

				NativeUtil.callbackeSign = callbackFunc;
				var res = ComUtil.checkMobileOS();
				if(res == 'AND'){
					window.android.eSign(paramStr);
				}else if(res == 'IOS'){
					webkit.messageHandlers.eSign.postMessage(paramStr);
				}else{
					return false;
				}
			}else{
				ComUtil.alert('공동인증서(구 공인인증서) 초기화에 실패하였습니다.');
			}
		});

	},

	/**
	 * 전자서명 호출 - 공인인증서 가져오기
	 *
	 * @parameter signMsg		: 전자서명 메세지
	 * @parameter callbackFunc	: 성공시 호출 함수
	 * @parameter visibleBtn	: 휴대폰인증 버튼 활성화 표시 여부(표시:"1", 미표시:"0", default:"0")
	 */
	calleSignImport : function(signMsg, callbackFunc, visibleBtn){

		if(NativeUtil.showNativeTime != null) {
			var ts	= new Date() - NativeUtil.showNativeTime;
			if(ts <= 1000) {
				return false;
			}
		}

		NativeUtil.showNativeTime	= new Date();

		if(ComUtil.isNull(callbackFunc) || typeof(callbackFunc) != 'function'){
			console.info('전자서명 Callback Function 미존재');
			NativeUtil.callbackeSign = null;
		}

		if(ComUtil.isNull(visibleBtn)) {
			visibleBtn	= "0";
		}

		var dataParam = {

		};

		var paramMap = {
			url			: '/cmn0/eSignNonce'
			, dataParam	: dataParam
		}
		ComUtil.request(paramMap, function(nonceData){
			if(!ComUtil.isNull(nonceData) && !ComUtil.isNull(nonceData['nonStr'])){
				var paramStr	= JSON.stringify({signMsg:signMsg + '&ksbizNonce=' + nonceData['nonStr'], visibleBtn:visibleBtn});

				NativeUtil.callbackeSign = callbackFunc;

				var res = ComUtil.checkMobileOS();

				if(res == 'AND'){
					window.android.eSignImport(paramStr);
				}else if(res == 'IOS'){
					webkit.messageHandlers.eSignImport.postMessage(paramStr);
				}else{
					return false;
				}
			}else{
				ComUtil.alert('공동인증서(구 공인인증서) 초기화에 실패하였습니다.');
			}
		});

	},


	/**
	 * 전자서명 호출 - 공인인증서 내보내기
	 *
	 * @parameter signMsg		: 전자서명 메세지
	 * @parameter callbackFunc	: 성공시 호출 함수
	 * @parameter visibleBtn	: 휴대폰인증 버튼 활성화 표시 여부(표시:"1", 미표시:"0", default:"0")
	 */
	calleSignExport : function(signMsg, callbackFunc, visibleBtn){

		if(NativeUtil.showNativeTime != null) {
			var ts	= new Date() - NativeUtil.showNativeTime;
			if(ts <= 1000) {
				return false;
			}
		}

		NativeUtil.showNativeTime	= new Date();

		if(ComUtil.isNull(callbackFunc) || typeof(callbackFunc) != 'function'){
			console.info('전자서명 Callback Function 미존재');
			NativeUtil.callbackeSign = null;
		}

		if(ComUtil.isNull(visibleBtn)) {
			visibleBtn	= "0";
		}

		var dataParam = {

		};

		var paramMap = {
			url			: '/cmn0/eSignNonce'
			, dataParam	: dataParam
		}
		ComUtil.request(paramMap, function(nonceData){
			if(!ComUtil.isNull(nonceData) && !ComUtil.isNull(nonceData['nonStr'])){
				var paramStr	= JSON.stringify({signMsg:signMsg + '&ksbizNonce=' + nonceData['nonStr'], visibleBtn:visibleBtn});

				NativeUtil.callbackeSign = callbackFunc;

				var res = ComUtil.checkMobileOS();

				if(res == 'AND'){
					window.android.eSignExport(paramStr);
				}else if(res == 'IOS'){
					webkit.messageHandlers.eSignExport.postMessage(paramStr);
				}else{
					return false;
				}
			}else{
				ComUtil.alert('공동인증서(구 공인인증서) 초기화에 실패하였습니다.');
			}
		});
	},


	/**
	 * 전자서명 호출 CallBack
	 *
	 * @parameter jsonStr : 전자서명 응답 Data
	 * statusCode		: 0 성공 / -1 실패
	 * statusMessage	: 결과 메세지
	 * signResult		: 서명 메세지
	 * vidResult		: 본인확인 메세지
	 * userCertPubKey	: 사용자 공개키
	 */
	eSignCallBack : function(jsonStr){
		var jsonData;

//		ComUtil.alert('전사서명 완료\n' + jsonStr);

		if(!ComUtil.isNull(jsonStr)){
			jsonData = JSON.parse(jsonStr);
		}else{
			console.info('전자서명 Error');
			return false;
		}

		//인증서 패스워드 10회 틀릴시
		if(jsonData.statusCode == "203") {
			ComUtil.submit("/view/main");
			return;
		}

		if(!ComUtil.isNull(NativeUtil.callbackeSign) && typeof(NativeUtil.callbackeSign) == 'function'){
			NativeUtil.callbackeSign(jsonData);
		}
	},

	/**
	 * 해당단말 가능한 간편인증타입 요청
	 *
	 * @parameter callbackFunc : 성공시 호출 함수
	 */
	callGetEasyPassValidType : function(callbackFunc){
		var res = ComUtil.checkMobileOS();

		if(ComUtil.isNull(callbackFunc) || typeof(callbackFunc) != 'function'){
			console.info('간편인증 타입조회 Callback Function 미존재');
			NativeUtil.callbackGetEasyPassValidType = null;
			return false;
		}

		NativeUtil.callbackGetEasyPassValidType = callbackFunc;

		if(res == 'AND'){
			window.android.getEasyPassValidType();
		}else if(res == 'IOS'){
			webkit.messageHandlers.getEasyPassValidType.postMessage('');
		}else{
			return false;
		}
	},

	/**
	 * 해당단말 가능한 간편인증타입 요청 CallBack
	 *
	 * @parameter jsonStr : 간편인증 타입 요청 CallBackData
	 * bioTypeList		: ex. {FINGERPRINT, PATTERN, PINCODE}
	 */
	getEasyPassValidTypeCallBack : function(jsonStr){
		var jsonData;

//		ComUtil.alert('간편인증 조회 완료 \n' + jsonStr);

		if(!ComUtil.isNull(jsonStr)){
			jsonData = JSON.parse(jsonStr);
		}else{
			console.info('간편인증 타입조회 Error');
			return false;
		}

		if(!ComUtil.isNull(NativeUtil.callbackGetEasyPassValidType) && typeof(NativeUtil.callbackGetEasyPassValidType) == 'function'){
			NativeUtil.callbackGetEasyPassValidType(jsonData);
		}
	},

	/**
	 * 해당단말 사용자가 등록한 간편인증타입 요청
	 * @parameter param : 사용자가 등록한 간편인증 parameter
	 * userInfo	: 사용자 PK
	 * @parameter callbackFunc : 성공시 호출 함수
	 */
	callGetRegisteredValidType : function(param, callbackFunc){
		var res = ComUtil.checkMobileOS();

		if(ComUtil.isNull(param)){
			console.info('사용자가 등록한 간편인증 Parameter 미존재');
			return false;
		}

		if(ComUtil.isNull(callbackFunc) || typeof(callbackFunc) != 'function'){
			console.info('사용자가 등록한 간편인증 Callback Function 미존재');
			NativeUtil.callbackGetRegisteredValidType = null;
			return false;
		}
		var paramStr = JSON.stringify(param)

		NativeUtil.callbackGetRegisteredValidType = callbackFunc;

		if(res == 'AND'){
			window.android.getRegisteredValidType(paramStr);
		}else if(res == 'IOS'){
			webkit.messageHandlers.getRegisteredValidType.postMessage(paramStr);
		}else{
			return false;
		}
	},

	/**
	 * 해당단말 사용자가 등록한 간편인증타입 요청 CallBack
	 *
	 * @parameter jsonStr : 간편인증 타입 요청 CallBackData
	 * bioTypeList		: ex. {FINGERPRINT, PATTERN, PINCODE}
	 */
	getRegisteredValidTypeCallBack : function(jsonStr){
		var jsonData;

//		ComUtil.alert('사용자가 등록한 간편인증 조회 완료\n' + jsonStr);

		if(!ComUtil.isNull(jsonStr)){
			jsonData = JSON.parse(jsonStr);
		}else{
			console.info('간편인증 타입조회 Error');
			return false;
		}

		if(!ComUtil.isNull(NativeUtil.callbackGetRegisteredValidType) && typeof(NativeUtil.callbackGetRegisteredValidType) == 'function'){
			NativeUtil.callbackGetRegisteredValidType(jsonData);
		}
	},

	/**
	 * App 내에 저장한 사용자 PK 조회
	 *
	 * @parameter callbackFunc : 성공시 호출 함수
	 */
	callGetUserInfo : function(callbackFunc){
		var res = ComUtil.checkMobileOS();

		if(ComUtil.isNull(callbackFunc) || typeof(callbackFunc) != 'function'){
			console.info('사용자PK조회 Callback Function 미존재');
			NativeUtil.callbackGetUserInfo = null;
			return false;
		}

		NativeUtil.callbackGetUserInfo = callbackFunc;

		if(res == 'AND'){
			window.android.getUserInfo();
		}else if(res == 'IOS'){
			webkit.messageHandlers.getUserInfo.postMessage('');
		}else{
			return false;
		}
	},

	/**
	 * App 내에 저장한 사용자 PK 조회 CallBack
	 *
	 * @parameter jsonStr :  App 내에 저장한 사용자 PK CallBackData
	 * userInfo		: 사용자 PK
	 */
	getUserInfoCallBack : function(jsonStr){
		var jsonData;

//		ComUtil.alert('사용자 PK 조회 완료\n' + jsonStr);

		if(!ComUtil.isNull(jsonStr)){
			jsonData = JSON.parse(jsonStr);
		}

		if(typeof(NativeUtil.callbackGetUserInfo) == 'function'){
			NativeUtil.callbackGetUserInfo(jsonData);
		}
	},

	/**
	 * 사용자 PK 앱에 저장
	 * @parameter param : param
	 * userInfo		: 사용자의 pk
	 * @parameter callbackFunc : 성공시 호출 함수
	 */
	callSetUserInfo : function(param, callbackFunc){
		var res = ComUtil.checkMobileOS();

		if(ComUtil.isNull(callbackFunc) || typeof(callbackFunc) != 'function'){
			console.info('사용자 PK 저장 Callback Function 미존재');
			NativeUtil.callbackSetUserInfo = null;
			return false;
		}
		var paramStr = JSON.stringify(param)

		NativeUtil.callbackSetUserInfo = callbackFunc;

		if(res == 'AND'){
			window.android.setUserInfo(paramStr);
		}else if(res == 'IOS'){
			webkit.messageHandlers.setUserInfo.postMessage(paramStr);
		}else{
			return false;
		}
	},

	/**
	 * 사용자 PK 앱에 저장 CallBack
	 *
	 * @parameter jsonStr : 전자서명 응답 Data
	 * statusCode		: 0 성공 / -1 실패
	 * statusMessage	: 결과 메세지
	 */
	setUserInfoCallBack : function(jsonStr){
		var jsonData;

//		ComUtil.alert('사용자 PK 앱에 저장 완료\n' + jsonStr);

		if(!ComUtil.isNull(jsonStr)){
			jsonData = JSON.parse(jsonStr);
		}else{
			console.info('사용자 PK 앱에 저장 Error');
			return false;
		}

		if(!ComUtil.isNull(NativeUtil.callbackSetUserInfo) && typeof(NativeUtil.callbackSetUserInfo) == 'function'){
			NativeUtil.callbackSetUserInfo(jsonData);
		}
	},

	/**
	 *	앱 위변조 방지 확인 호출
	 * @parameter callbackFunc : 성공시 호출 함수
	 */
	callAppAuthCheck : function(){
		var res = ComUtil.checkMobileOS();

		if(res == 'AND'){
			window.android.appAuthCheck();
		}else if(res == 'IOS'){
			webkit.messageHandlers.appAuthCheck.postMessage('');
		}else{
			return false;
		}
	},

	/**
	 * 앱 위변조 방지 확인 호출 CallBack
	 *
	 * @parameter jsonStr : 스크래핑 응답 Data
	 */
	appAuthCheckCallBack : function(jsonStr){
		var jsonData;

//		ComUtil.alert('앱 위변조 방지 확인 완료\n' + jsonStr);

		if(!ComUtil.isNull(jsonStr)){
			jsonData = JSON.parse(jsonStr);
		}else{
			console.info('앱 위변조 방지 확인 Error');
			return false;
		}

		if(!ComUtil.isNull(jsonData) && !ComUtil.isNull(jsonData['statusCode']) && jsonData['statusCode'] == '0'){
			var dataParam = {
				sid		: jsonData['sessionId']
				, adata 	: jsonData['token']
			};

			var paramMap = {
				url			: '/appiron-inspect/appAuth'
				, dataParam	: dataParam
			}
			ComUtil.request(paramMap, NativeUtil.appAuthDoubleCheckCallBack);
		}else{
			ComUtil.alert('앱이 위변조 되었습니다.', NativeUtil.appFinish());
		}
	},

	appAuthDoubleCheckCallBack : function(data){
		if(!ComUtil.isNull(data) && !ComUtil.isNull(data['cd']) && data['cd'] == '0000'){
			NativeUtil.callbackAppAuthCheck();
		}else{
			ComUtil.alert('앱이 위변조 되었습니다.', NativeUtil.appFinish());
		}
	},

	/**
	 * 뒤로가기 스크립트 제어
	 * 안드로이드 back 버튼 터치시 해당 펑션 호출.
	 */
	back : function() {
		if($('#loading').is(':visible') || $('#loading_sun').is(':visible')){			//햇살론17 스크랩 로딩 추가
			return false;
		}else{
			var hasBackBtn		= $("body>#page-transitions>.header-logo-app>.back-button>i").length == 1 ? true : false;
			var hasCancelBtn	= $('body>#page-transitions>.header-logo-app>.header-icon.header-icon-4').text() == "취소" ? true : false;
			var hasPopupBackBtn	= $('.np-layer-white-bg:visible .header-logo-app>.header-icon.header-icon-1').length >= 1 ? true : false;

			// youth add
			var hasYouCancelBtn	= $('body>#page-transitions>.page-header>.close-button.func-cancle').text() == "취소" ? true : false;

			// info page add
			var hasInfoCancelBtn = $('.wrapper>.content__header>.infopage-cancel-btn').text() == "취소" ? true : false;

			// dirLoan add
			var hasDirCancelBtn = $('#header .dir-cancel-btn').text() == "취소" ? true : false;

			// backButton for sun added
			if(location.pathname.startsWith("/view/sun/KFA_SUN_")){
				if($('.wrapper>.page-header>.close-button.func-prev').text() == "이전" || $('body>#page-transitions>.page-header>.close-button.func-prev').text() == "이전"){
					var hasBackBtnForSun = true;
				}
				hasYouCancelBtn = false;
			}

			// backButton for fft added
			if(location.pathname.startsWith("/view/fft/KFA_FFT_")){
				if($('.wrapper>.page-header>.close-button.func-prev').text() == "이전" || $('body>#page-transitions>.page-header>.close-button.func-prev').text() == "이전"){
					var hasBackBtnForSun = true;
				}
				hasYouCancelBtn = false;
			}

			// backButton for saf added
			if(location.pathname.startsWith("/view/saf/KFA_SAF_")){
				if($('.wrapper>.page-header>.close-button.func-prev').text() == "이전" || $('body>#page-transitions>.page-header>.close-button.func-prev').text() == "이전"){
					var hasBackBtnForSun = true;
				}
				hasYouCancelBtn = false;
			}

			if(hasPopupBackBtn) {
				$('.np-layer-white-bg:visible').eq($('.np-layer-white-bg:visible').length-1).hide();
			} else if(hasBackBtn || hasInfoCancelBtn) {
				var href;

				if(hasBackBtn){
					href	= $("#page-transitions>.header-logo-app>.back-button>i").parent().attr("href");
				} else {	// add Info page back btn
					href	= $(".wrapper>.content__header>.infopage-cancel-btn").data("href");
				}
				if(href != "" && href.indexOf("javascript") != 0 && href.indexOf("#") != 0) {
					ComUtil.submit(href);
				} else {
					var referrer	= document.referrer;
					if(!ComUtil.isNull(referrer) && referrer.indexOf("kinfa.or.kr") > -1) {
						history.go(-1);
					} else {
						var historyObj	= JSON.parse(sessionStorage.getItem(Constants.KINFA_HISTORY));
						if(historyObj != null) {
							var KCBIndex	= historyObj[location.pathname];
							delete historyObj[location.pathname];
							history.go((KCBIndex - history.length) - 1);
						} else {
							history.go(-1);
						}
					}
				}
			} else if(hasCancelBtn || hasYouCancelBtn || hasDirCancelBtn) {
//				ComUtil.confirm("현재 작업이 취소 됩니다. 취소 하시겠습니까?", function(flag) {
//					if(flag) {
				if(hasCancelBtn){
					ComUtil.submit($('.header-logo-app .header-icon.header-icon-4').attr("href"));
				}else if(hasYouCancelBtn){
					ComUtil.submit($('.page-header .close-button.func-cancle').attr("href"));
				}else{
					ComUtil.submit($('#header .dir-cancel-btn').attr("href"));
				}
//					}
//				});
			} else if (hasBackBtnForSun) {
				if($('.wrapper>.page-header>.close-button.func-prev').text() == "이전"){
					document.querySelector(".wrapper>.page-header>.close-button.func-prev").click();
				} else {
					document.querySelector(".page-header>.close-button.func-prev").click();
				}
			} else {
				//백버튼도 취소 버튼도 없어 이 페이지에서는 뒤로가기 안돼
			}
		}
	},
	/**
	 * 디바이스의 디폴트로 설정된 브라우저앱으로 링크 열기
	 */
	openExternalBrowser : function(url) {
		if(ComUtil.isNull(url)){
			console.info('링크 주소 미존재');
			return false;
		}

		var res = ComUtil.checkMobileOS();

		if(res == 'AND'){
			window.android.openExternalBrowser(url);
		}else if(res == 'IOS'){
			webkit.messageHandlers.openExternalBrowser.postMessage(url);
		}else{
			return false;
		}
	},

	/**
	 * 앱 종료 인터페이스
	 */
	appFinish : function() {
		var res = ComUtil.checkMobileOS();

		if(res == 'AND'){
			window.android.appFinish();
		}else if(res == 'IOS'){
			webkit.messageHandlers.appFinish.postMessage('');
		}else{
			return false;
		}
	},

	/**
	 * 앱 사용동의저장 인터페이스
	 */
	isAgreeUseTerms : function() {
		var res = ComUtil.checkMobileOS();

		if(res == 'AND'){
			window.android.isAgreeUseTerms();
		}else if(res == 'IOS'){
			webkit.messageHandlers.isAgreeUseTerms.postMessage('');
		}else{
			return false;
		}
	},

	/**
	 * 챗봇코드 접수
	 */
	chatbotCallBack : function(code){

		if(ComUtil.isNull(code)){
			ComUtil.alert('챗봇이 정상 작동하지 않습니다.');
			return false;
		}

		var dataParam = {
			CBOT_CODE	: code
		};

		var paramMap = {
			url			: '/cmn0/chatPage'
			, dataParam	: dataParam
		}
		ComUtil.request(paramMap, NativeUtil.chatbotRedirect);
	},

	/**
	 * 챗봇코드 화면 조회 이동
	 */
	chatbotRedirect : function(data){
		if(!ComUtil.isNull(data) && !ComUtil.isNull(data['msgHeader']) && !ComUtil.isNull(data['resData'])){
			if(!ComUtil.isNull(data['resData']['TARGET_URL']) && data['msgHeader']['MSG_PRCS_RSLT_CD'] == '0'){
				location.href = data['resData']['TARGET_URL'];
			}else{
				ComUtil.alert('챗봇연결 화면이 존재하지 않습니다.', function(){

				});
			}
		}else{
			ComUtil.alert('챗봇연결 화면이 존재하지 않습니다.', function(){

			});
		}
	},


	// fixed by wonhwa.jung

	/**
	 * 앱 실행시 통계 자료 수집
	 */
	setStat : function(type){
		if(ComUtil.isNull(type)){
			return false;
		}

		var dataParam = {
			act_type	: type
		};

		var paramMap = {
			url			: '/cmn0/setStat'
			, dataParam	: dataParam
		}
		ComUtil.request(paramMap, function(data){
		}, undefined, undefined, false);
	},

	/**
	 * 휴대폰 인증 요청 네이티브에 전달
	 *
	 * @parameter
	 * statusCode		: 0 성공 / -1 실패
	 * statusMessage	: 결과 메세지
	 */
	callSmsAuth : function(){
		var res = ComUtil.checkMobileOS();

		if(res == 'AND' && window.android.callSmsAuth){
			window.android.callSmsAuth();
		} else {
			return false;
		}
	}

};


var ComUtilSun = {
	errorAlert : function() {
		var msg = "일시적인 장애가 발생하였습니다.<br>문제가 계속될 경우 국번없이 <a href='tel:1397'>1397</a>로 문의해 주세요.";
		ComUtil.alert(msg, function(){
			ComUtil.submit("/view/main");
		});

	}
}
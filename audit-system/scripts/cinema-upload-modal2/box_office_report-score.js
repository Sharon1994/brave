/**
* 当日票房成绩单
*
* @author ccq by 2015-11-10
**/

// 全局变量(存放: 影院开始时间, 位置偏移量)
var widthMargin = [];
/**
 * 加载当日票房成绩单
 * 
 * @param 
 * 		cinemaId  影院ID
 * 		queryDate 日期参数
 * @return
 * */
function loadBoxOfficeTotals(cinemaId, queryDate){
	$("#boxTotalTbl").find("thead").nextAll().remove();
	$("#boxTotalTbl").append("<tr><td colspan='9' align='center'><img src='images/loading.gif' /></td></tr>");
	
	/**
	 * 汇总数据html
	 * */
	var boxOfficeCntHTML = "";
	/**
	* 内容展示html
	**/
	var boxOfficeHTML = "";
	/**
	 * 合并单元格个数
	 * */
	var colspanNums = 9;
	/**
	 * 总计HTML
	 * */
	var totalHTML = "";
	/**
	 * 是否可编辑
	 * */
	var isEdit = false;
	/**
	 * 数据对象和长度
	 * */
	var dataObj = null, dataObjL = 0;
	
	server.boxOfficeList(cinemaId, queryDate, function(callback){
		if(callback.ret){
			$("#boxTotalTbl").find("thead").nextAll().remove();
			isEdit = callback.isEdit;
			dataObj = callback.data, dataObjL = dataObj.length;
			
			if(isEdit){	// 来自排期
				$("#noTotalDataFlag").val("0");	// 无汇总数据标记
				boxOfficeCntHTML = "<tr>"
						            + "<td colspan='" + colspanNums + "'>"
						            	+ "<div>"
							            	+ "<img src='images/tip.png' width='80' />"
											+ "<span class='tip-text-nodata fs20 clr8'>暂无数据，您可在上传票房后查看</span>"
										+ "</div>"
						            + "</td>"
						           + "</tr>";
				totalHTML = "";
			}else{	// 来自票房明细
				if(dataObjL < 1){
					$("#noTotalDataFlag").val("0");	// 无汇总数据标记
					boxOfficeCntHTML = "<tr>"
						            	+ "<td colspan='" + colspanNums + "'>"
						            		+ "<div>"
							            		+ "<img class='tip-light' src='images/tip.png' width='80' />"
												+ "<span class='tip-text-nodata fs20 clr8'>暂无数据，您可在上传票房后查看</span>"
											+ "</div>"
						            	+ "</td>"
						            + "</tr>";
					totalHTML = "";
				}else{
					$("#noTotalDataFlag").val("1");	// 有汇总数据标记
					var totalPrice = 0;	// 单日票房
					var sessionCount = 0;	// 单日场次
					var ticketCount = 0;	// 单日人次
					var avgPrice = 0;	// 平均票价
					var avgSessionCount = 0;	// 场均人次
					var seatRate = 0;	// 上座率
					var avgTotalPrice = 0;	// 场均票房
					
					var totalAvgSessionCount = 0;	// 场均人次总数
					// var trClassName = "";
					
					for(var i = 0; i < dataObjL; i++){
						// if(i % 2 == 0) {
						// 	trClassName = " show-list-tbl-data-odd";
						// }else {
						// 	trClassName = " show-list-tbl-data-even";
						// }

						if(dataObj[i].totalPrice == undefined)
							totalPrice = "";
						else
							totalPrice = dataObj[i].totalPrice;

						if(dataObj[i].sessionCount == undefined)
							sessionCount = "";
						else
							sessionCount = dataObj[i].sessionCount;

						if(dataObj[i].ticketCount == undefined)
							ticketCount = "";
						else
							ticketCount = dataObj[i].ticketCount;

						if(dataObj[i].avgPrice == undefined)
							avgPrice = "";
						else
							avgPrice = dataObj[i].avgPrice;

						if(dataObj[i].avgSessionCount == undefined){
							avgSessionCount = "";
							totalAvgSessionCount = "";
						}else{
							avgSessionCount = dataObj[i].avgSessionCount;
							totalAvgSessionCount += avgSessionCount;
						}

						seatRate = (dataObj[i].seatRate) * 100;
						seatRate = seatRate.toFixed(2);
						// if(seatRate.indexOf(".") != -1)
						// 	seatRate = seatRate.substring(0, seatRate.indexOf("."));

						if(dataObj[i].avgTotalPrice == undefined)
							avgTotalPrice = "";
						else
							avgTotalPrice = dataObj[i].avgTotalPrice;
						
						boxOfficeCntHTML += "<tr>"
												+"<td><input type='hidden' value='" + dataObj[i].filmId + "' /><span>" + dataObj[i].filmName + "</span></td>"
												+"<td>" + dataObj[i].showDate + "</td>"
												+"<td>" + totalPrice + "</td>"
												+"<td>" + sessionCount + "</td>"
												+"<td>"
													+"<span id='ticketCount" + i + "'>" + ticketCount + "</span>"
												+ "</td>"
												+"<td>" + avgPrice + "</td>"
												+"<td><span id='avgSessionCount" + i + "'>" + avgSessionCount + "</span></td>"
												+"<td>" + seatRate + "%</td>"
												+"<td><span id='ticketRate" + i + "'>" + avgTotalPrice + "</span></td>"
											+"</tr>";
					}
					
					// if(dataObjL % 2 == 0) {
					// 	trClassName = " show-list-tbl-data-odd";
					// }else {
					// 	trClassName = " show-list-tbl-data-even";
					// }
					totalHTML = "<tr>"
									+"<td colspan='2'><B>合计</B></td>"
									+"<td><span id='totalSessionCount'><B>" + callback.totalAllPrice + "</B></span></td>"
									+"<td><span id='totalSessionRate'><B>" + callback.totalSessionCount + "</B></span></td>"
									+"<td><span id='totalTicketCount'><B>" + callback.totalTicketCount + "</B></span></td>"
									+"<td><span id='totalTicketRate'></span></td>"
									+"<td><span id='totalAvgSessionCount'></span></td>"
									+"<td><span id='totalTicketRate'></span></td>"
									+"<td><span id='totalTicketRate'></span></td>"
								+"</tr>";
				}
			}
			
			boxOfficeHTML = boxOfficeCntHTML + totalHTML;	// 数据区html组装(列表标题+数据列表+合计)
			
			$("#boxTotalTbl").append(boxOfficeHTML);	// 装载数据区

			// // 表格数据排序等相关功能
			// $("#reportCntTbl").dataTable({
			// 	"bDestroy":true,
			// 	"aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0 ] }],	// 指定第一列不参与排序
			// 	"asStripClasses":["odd", "even"],
			// 	"aLengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
			// 	"order": [[ 1, "asc" ]],
			// 	"bStateSave": false,
			// 	"bPaginate":true, //翻页功能
			// 	"bSortClasses":true,
			// 	"bLengthChange" : true,//改变每页显示数据数量
			// 	"bFilter": true, //过滤功能
			// 	"bInfo": true,//页脚信息
			// 	"iDisplayLength" : 10,// 每页显示行数
			// 	"language": {
			// 	    "url": "http://cdn.datatables.net/plug-ins/e9421181788/i18n/Chinese.json"
			// 	    // "sEmptyTable": "暂无汇总数据"
			// 	}
			// });
			// // 修改相关项的默认样式
			// $(".dataTable").css({"border-collapse":"collapse", "width":"99.9%"});
			// $(".dataTable thead th").css({"padding":"0 8px", "border-bottom":"1px solid #7098a3"});
			// $(".dataTable thead td").css({"padding":"0 8px"});
			// $(".dataTable thead .sorting").css("background-position", "50% 0%");
			// $(".dataTable thead .sorting_asc").css("background-position", "50% 0%");
			// $(".dataTable thead .sorting_desc").css("background-position", "50% 0%");

			// 显示各时段统计结果
			handleEventAnalysis();
		}else{
			$("#noTotalDataFlag").val("0");	// 无汇总数据标记
			$("#boxTotalTbl").find("thead").nextAll().remove();
			boxOfficeCntHTML = "<tr>"
					            + "<td colspan='" + colspanNums + "'>"
					            	+ "<div>"
						            	+ "<img src='images/tip.png' width='80' />"
										+ "<span class='tip-text-nodata fs20 clr8'>暂无数据，您可在上传票房后查看</span>"
									+ "</div>"
					            + "</td>"
					        + "</tr>";
			
			$("#boxTotalTbl").append(boxOfficeHTML);	// 装载数据区
		}
	});
}

/**
 * 加载当日票房明细
 * 
 * @param 
 * 		cinemaId  影院ID
 * 		queryDate 日期参数
 * @return
 * */
 function loadBoxOfficeDetail(cinemaId, queryDate) {
 	var datas = null, datasL = 0;
 	$(".table-left .table-mask").empty();
	$('.table-right').empty();
	
 	server.boxOfficeDetailListJH(cinemaId, queryDate, function(callback) {
 		if(callback.ret) {
 			if(callback.data != "") {
 				datas = callback.data, datasL = datas.length;

 				for ( var i = 0; i < datasL; i++) {
					var tableLeftMask = $(".table-left .table-mask");
					tableLeftMask.append("<div title='"+datas[i].hallName+"'>"+server._strHandler(datas[i].hallName, 3)+"</div>");
			
					var tableRightMask = $(".table-right");
					tableRightMask.append("<div id='tableRightSon"+datas[i].hallId+"'></div>");

					var viewScheduleResult = datas[i].viewSchedule;
					widthMargin = [];
					for ( var j = 0; j < viewScheduleResult.length; j++) {
						var filmWidth = timeWidthHandler(viewScheduleResult[j].showBeginTime, viewScheduleResult[j].showEndTime);
						var marginLeft = filmMgLfHandler(viewScheduleResult[j].showBeginTime);
				
						var elements = {};
						elements["beginTime"] = viewScheduleResult[j].showBeginTime;
						elements["befMarginLeft"] = filmWidth+marginLeft;
						widthMargin.push(elements);
				
						var marginLeftStr = null;
						if (j == 0) {
							marginLeftStr = marginLeft;
						} else if (j>0) {
							marginLeftStr = marginletfHandler(viewScheduleResult[j].showBeginTime, marginLeft, j);
						}
				
						$("#tableRightSon"+datas[i].hallId).append("<div id='' class='waitB lf btn-all-none btn-common btn-radius-all' title='"+viewScheduleResult[j].showBeginTime+" - "+viewScheduleResult[j].showEndTime+"\n"+viewScheduleResult[j].filmName+"' style='width:"+(filmWidth)+"px; margin-left:"+marginLeftStr+"px; float:left;overflow:hidden; cursor:pointer;'>" +
							"<p>"+viewScheduleResult[j].showBeginTime+" - "+viewScheduleResult[j].showEndTime+"</p>" +
							"<p>"+viewScheduleResult[j].filmName+"</p></div>");
					}

					// 为影片块添加颜色
					var countFilmResult = countGroupByFilmName(datas);	// 影片统计结果
					var film_color = selectColorForObj(countFilmResult, 0);	// 选颜色
					setFilmColorForShowSch(film_color);	// 设置颜色
				}

				// 此处何用?(忘记了)
				if (datas.length < 7) {
					var leg = 7 - datas.length;
					for ( var d = 0; d < leg; d++) {
						var tableLeftMask = $(".table-left .table-mask");
						tableLeftMask.append("<div></div>");
				
						var tableRightMask = $(".table-right");
						tableRightMask.append("<div id='tableRightSon"+i+"'></div>");
					}
				}
 			}else {
 				for ( var i = 0; i < 8; i++) {
					var tableLeftMask = $(".table-left .table-mask");
					tableLeftMask.append("<div></div>");
			
					var tableRightMask = $(".table-right");
					tableRightMask.append("<div id='tableRightSon"+i+"'></div>");
				}
 			}
 		}
 	});
 }

/**
* 显示场次分析结果数据
*
* @param
**/
function handleEventAnalysis() {
	// $(".cinema-up-area1").slideUp();
	$("#schDate").text("日期：" + $("#queryDateTotal").val());
	$(".cinema-up-area2").slideDown();

	var curCinemaId = cinemaObj.id;
	var showDate = $("#queryDateTotal").val();
		
	$("#alldayNnalysisTbl").find("thead").nextAll().remove();
	$("#alldayNnalysisTbl").append("<tr><td colspan='5' align='center'><img src='images/loading.gif' /></td></tr>");

	$("#goldNnalysisTbl").find("thead").nextAll().remove();
	$("#goldNnalysisTbl").append("<tr><td colspan='5' align='center'><img src='images/loading.gif' /></td></tr>");

	$("#generalNnalysisTbl").find("thead").nextAll().remove();
	$("#generalNnalysisTbl").append("<tr><td colspan='5' align='center'><img src='images/loading.gif' /></td></tr>");

	showAnalysisDetail(curCinemaId, showDate);
}

/**
* 分时段展示场次分析结果
*
* @param cinemaId 当前被操作的影院id
* @param showDate 查询日期
**/
function showAnalysisDetail(cinemaId, showDate) {
	server.showAnalysisDetail(cinemaId, showDate, function(callback) {
		if(callback.ret) {
			$("#alldayNnalysisTbl").find("thead").nextAll().remove();
			$("#goldNnalysisTbl").find("thead").nextAll().remove();
			$("#generalNnalysisTbl").find("thead").nextAll().remove();

			var datas = callback.data, datasL = datas.length;
			var allDayObj = null, goldTimeObj = null, generalTimeObj = null;
			var allDayObjL = 0, goldTimeObjL = 0, generalTimeObjL = 0;
			var dayHtml = "", goldHtml = "", generalHtml = "";

			// 获取各时段数据对象
			for(var i = 0; i < datasL; i++) {
				if(datas[i].timeSlotId == 0) {
					// 总场次
					allDayObj = datas[i].viewAnalysis;
					allDayObjL = allDayObj.length;
				}

				if(datas[i].timeSlotId == 1) {
					// 黄金时段
					goldTimeObj = datas[i].viewAnalysis;
					goldTimeObjL = goldTimeObj.length;
				}

				if(datas[i].timeSlotId == 2) {
					// 非黄金时段
					generalTimeObj = datas[i].viewAnalysis;
					generalTimeObjL = generalTimeObj.length;
				}
			}

			// 遍历全天数据对象
			if(allDayObjL > 0) {
				var totalAllDaySessionCount = 0, totalAllDayPrice = 0, totalAllDaySeatRate = 0, totalAllDayHtml = "";

				for (var day = 0; day < allDayObjL; day++) {
					dayHtml += "<tr>"
								+ "<td>" + allDayObj[day].filmName + "</td>"
								+ "<td>" + allDayObj[day].sessionCount + "</td>"
								+ "<td>" + allDayObj[day].avgTotalPrice + "</td>"
								+ "<td>" + Math.round((allDayObj[day].seatRate) * 100) + "%</td>"
								+ "<td>" + allDayObj[day].totalPrice + "</td>"
							+ "</tr>";

					totalAllDaySessionCount += allDayObj[day].sessionCount;
					totalAllDayPrice += allDayObj[day].totalPrice;
					totalAllDaySeatRate += (allDayObj[day].seatRate) * 100;
				}

				totalAllDayHtml = "<tr>"
									+ "<td><B>合计</B></td>"
									+ "<td><B>" + totalAllDaySessionCount + "</B></td>"
									+ "<td>&nbsp;</td>"
									+ "<td><B>" + totalAllDaySeatRate + "%</B></td>"
									+ "<td><B>" + totalAllDayPrice + "</B></td>"
								+ "</tr>";
			}else {
				dayHtml = "<tr>"
							+ "<td colspan='5'>"
								+ "<div>"
						            + "<img src='images/tip.png' width='80' />"
									+ "<span class='tip-text-nodata fs20 clr8'>暂无数据，您可在上传票房后查看</span>"
								+ "</div>"
							+ "</td>"
						+ "</tr>";
			}

			// 遍历黄金时段数据对象
			if(goldTimeObjL > 0) {
				var totalGoldSessionCount = 0, totalGoldPrice = 0, totalGoldSeatRate = 0, totalGoldHtml = "";

				for (var gold = 0; gold < goldTimeObjL; gold++) {
					goldHtml += "<tr>"
								+ "<td>" + goldTimeObj[gold].filmName + "</td>"
								+ "<td>" + goldTimeObj[gold].sessionCount + "</td>"
								+ "<td>" + goldTimeObj[gold].avgTotalPrice + "</td>"
								+ "<td>" + Math.round((goldTimeObj[gold].seatRate) * 100) + "%</td>"
								+ "<td>" + goldTimeObj[gold].totalPrice + "</td>"
							+ "</tr>";

					totalGoldSessionCount += goldTimeObj[gold].sessionCount;
					totalGoldPrice += goldTimeObj[gold].totalPrice;
					totalGoldSeatRate += (goldTimeObj[gold].seatRate) * 100;
				}

				totalGoldHtml = "<tr>"
								+ "<td><B>合计</B></td>"
								+ "<td><B>" + totalGoldSessionCount + "</B></td>"
								+ "<td>&nbsp;</td>"
								+ "<td><B>" + totalGoldSeatRate + "%</B></td>"
								+ "<td><B>" + totalGoldPrice + "</B></td>"
							+ "</tr>";
			}else {
				goldHtml = "<tr>"
							+ "<td colspan='5'>"
								+ "<div>"
						            + "<img src='images/tip.png' width='80' />"
									+ "<span class='tip-text-nodata fs20 clr8'>暂无数据，您可在上传票房后查看</span>"
								+ "</div>"
							+ "</td>"
						+ "</tr>";
			}

			// 遍历非黄金时段数据对象
			if(generalTimeObjL > 0) {
				var totalGeneralSessionCount = 0, totalGeneralPrice = 0, totalGeneralSeatRate = 0, totalGeneralHtml = "";

				for (var general = 0; general < generalTimeObjL; general++) {
					generalHtml += "<tr>"
								+ "<td>" + generalTimeObj[general].filmName + "</td>"
								+ "<td>" + generalTimeObj[general].sessionCount + "</td>"
								+ "<td>" + generalTimeObj[general].avgTotalPrice + "</td>"
								+ "<td>" + Math.round((generalTimeObj[general].seatRate) * 100) + "%</td>"
								+ "<td>" + generalTimeObj[general].totalPrice + "</td>"
							+ "</tr>";

					totalGeneralSessionCount += generalTimeObj[general].sessionCount;
					totalGeneralPrice += generalTimeObj[general].totalPrice;
					totalGeneralSeatRate += (generalTimeObj[general].seatRate) * 100;
				}

				totalGeneralHtml = "<tr>"
								+ "<td><B>合计</B></td>"
								+ "<td><B>" + totalGeneralSessionCount + "</B></td>"
								+ "<td>&nbsp;</td>"
								+ "<td><B>" + totalGeneralSeatRate + "%</B></td>"
								+ "<td><B>" + totalGeneralPrice + "</B></td>"
							+ "</tr>";
			}else {
				generalHtml = "<tr>"
							+ "<td colspan='5'>"
								+ "<div>"
						            + "<img src='images/tip.png' width='80' />"
									+ "<span class='tip-text-nodata fs20 clr8'>暂无数据，您可在上传票房后查看</span>"
								+ "</div>"
							+ "</td>"
						+ "</tr>";
			}

			$("#alldayNnalysisTbl").append(dayHtml + totalAllDayHtml);
			$("#goldNnalysisTbl").append(goldHtml + totalGoldHtml);
			$("#generalNnalysisTbl").append(generalHtml + totalGeneralHtml);

			// 隐藏所有，只显示黄金时段
			$(".analysis-btn-label").removeClass("active");
			$(".analysis-btn-label:eq(0)").addClass("active");
			$(".analysis-total-tbl").hide();
			$(".allday-tbl").show();
		}
	});
}

/**
 * 查询票房成绩单
 * */
function queryBoxOfficeTotal(){
	loginStatus();

	// var cinemaId = getCookie("cinemaId");
	var cinemaId = cinemaObj.id;
	var queryDate = $dp.cal.getDateStr();
	// $("#initSchDate").val(queryDate);	// 保留查询日期
	
	if(queryDate == "")
		tipMsg_Single('totalDataArea', 0, "请选择查询日期", 0, '', '');
	else{
		loadBoxOfficeTotals(cinemaId, queryDate);
		loadBoxOfficeDetail(cinemaId, queryDate);
		$dp.hide();
	}
}

/**
* 处理影片宽度
**/
function timeWidthHandler(startTime, endTime) {
	//23:44 - 02:30
	var startHours = Number(startTime.substring(0, startTime.indexOf(":")));
	var endHours = Number(endTime.substring(0, endTime.indexOf(":")));
	var startHoursNum = 0;
	var endHoursNum = 0;
	var hours = 0;
	if(startHours >= 7 && startHours <= 23){
		startHoursNum = startHours;
	} else if(startHours == 0){
		startHoursNum = 24;
	} else if(startHours > 0 && startHours <= 6){
		startHoursNum = 24+startHours;
	}
	
	if(endHours >= 7 && endHours <= 23){
		endHoursNum = endHours;
	} else if(endHours == 0){
		endHoursNum = 24;
	} else if(endHours > 0 && endHours <=6){
		endHoursNum = 24+endHours;
	}

	hours = endHoursNum - startHoursNum -1;

	var startSeconds = startTime.substring(startTime.indexOf(":")+1, startTime.length);
	var endSeconds = endTime.substring(endTime.indexOf(":")+1, endTime.length);
	
	var seconds = (60 - Number(startSeconds)) + Number(endSeconds);
	
	return hours * 60 + seconds;
}

/**
* 处理影片位置
**/
function filmMgLfHandler(filmStartTime) {
	if (!filmStartTime) 
		return ;
	
	var startHours = filmStartTime.substring(0, filmStartTime.indexOf(":"));
	var startSeconds = filmStartTime.substring(filmStartTime.indexOf(":")+1, filmStartTime.length);
	var hours = Number(startHours);
	
	if (hours >= 7 && hours <= 24) {// 6:00 - 24:00
		return (hours - 7) * 60 + Number(startSeconds);
	} else if (hours >= 0 && hours <= 6) { //0:00 - 5:00
		// 2015-07-28 修改
		return 17*60 + hours*60 + Number(startSeconds);
	}
}

/**
* 处理影院相对位置
**/
function marginletfHandler(beginTime, marginLeft2, j) {
	if (!marginLeft2)
		return ;
	for ( var i = 0; i < widthMargin.length; i++) {
		if(widthMargin[i].beginTime == beginTime) {
			return marginLeft2 - widthMargin[j-1].befMarginLeft;
		}
	}
}

/**
* 动态设置数据区域位置
*
* @return 位置偏移量
**/
function dynamicPositionViewArea() {
	var schData = $("div[id^='tableRightSon']").children();
	var minStartTimeValue = "";		// 最小开始时间
	// var minStartTimePos = "";	// 最小开始时间位置
	var temp_time = "";	// 临时存储时间
	$.each($(".waitB"), function(index, val) {	// 遍历排期项
		var timeCycle = $(val).find("p:eq(0)").text();	// 获取时间段
		temp_time = timeCycle.split("-")[0];
		if(minStartTimeValue == ""){
			minStartTimeValue = timeCycle.split("-")[0];	// 取开始时间
			minStartTimePos = $(val).css("marginLeft");		// 获取开始时间的 marginLeft 样式属性值, 作为动态位置值
		}

		// 比较获得排期项中的最小时间
		if(temp_time.trim() < minStartTimeValue.trim()){
			minStartTimeValue = timeCycle.split("-")[0];
			minStartTimePos = $(val).css("marginLeft");		// 获取最小时间的 marginLeft 样式属性值, 作为动态位置值
		}
	});
	
	minStartTimePos = minStartTimePos.replace(/px/g, "");
	minStartTimePos = minStartTimePos*1 - 10;	// 将 marginLeft 属性值 -10px
	$("#table-container").scrollLeft(minStartTimePos);	// 根据最小时间的 marginLeft 样式属性值, 动态设置排期区域位置
}

$(function() {
	// 黄金时段、非黄金时段、总场次点击
	$(".analysis-btn-label").click(function() {
		var labelIndex = $(this).index();

		$(".analysis-btn-label").removeClass("active");
		$(this).addClass("active");

		// 隐藏所有
		$(".analysis-total-tbl").hide();
		if(labelIndex == 0)
			$(".allday-tbl").show();
		if(labelIndex == 1)
			$(".gold-tbl").show();
		if(labelIndex == 2)
			$(".general-tbl").show();
	});

	// 票房成绩单、票房明细 点击
	$(".boxoffice-btn-label").click(function() {
		var labelIndex = $(this).index();

		$(".boxoffice-btn-label").removeClass("active");
		$(this).addClass("active");
		// 隐藏所有
		$(".boxoffice-block").hide();
		if(labelIndex == 0)
			$(".boxoffice-total-div").show();
		if(labelIndex == 1) {
			// 动态设置数据展示区位置
			setTimeout(function() {
				// 延迟执行有效
				dynamicPositionViewArea();
			}, 50);

			$(".boxoffice-detail-div").show();
		}
	});
});
if(typeof NetFunnel == "object"){

    //blockSkin
    NetFunnel.SkinUtil.add('blockSkin',{
        prepareCallback:function(){
        },
        updateCallback:function(percent,nwait,totwait,timeleft){
        },
        htmlStr:'<div id="NetFunnel_Skin_Top" style="background-color:white;border:1px solid black; width:300px"> \
			<div style="text-align:right;padding-top:5px;padding-right:5px;;text-align:center;"> \
				<div style="text-align:center;font-size:9pt;color:black"><b><span style="color:black"> 해당 상품은 조기 소진되었습니다. </span> \
				<div style="text-align:center;font-size:9pt;color:black"><b><span style="color:black"> 10:10 부터 서비스 가능합니다. </span> \
					<br><br><br><span onclick="NetFunnel_sendStop();" style="cursor:pointer">[닫기]</span> </b><br><br> \
				</div> \
			</div>'
    },'normal');

    //ipBlockSkin
    NetFunnel.SkinUtil.add('ipBlockSkin',{
        prepareCallback:function(){
        },
        updateCallback:function(percent,nwait,totwait,timeleft){
        },
        htmlStr:'<div id="NetFunnel_Skin_Top" style="background-color:white;border:1px solid black; width:300px"> \
			<div style="text-align:right;padding-top:5px;padding-right:5px;;text-align:center;"> \
				<div style="text-align:center;font-size:9pt;color:black"><b><span style="color:black"> 비정상적인 시도가 감지되어 접근을 차단합니다!!! </span> \
					<br><br><br><span onclick="NetFunnel_sendStop();" style="cursor:pointer">[닫기]</span> </b><br><br> \
				</div> \
			</div>'
    },'normal');

    //sloanSkin
    NetFunnel.SkinUtil.add('sloanSkin',{
        prepareCallback:function(){
            var progress_print = document.getElementById("Progress_Print");
            progress_print.innerHTML=" ";
        },
        updateCallback:function(percent,nwait,totwait,timeleft){
            var progress_print = document.getElementById("Progress_Print");
            var prog=totwait - nwait;
            var poyongEl = document.getElementById("poyong");
            poyongEl.style.left=percent + "%";
            progress_print.innerHTML=" ";
        },
        htmlStr:
            '<div id="NetFunnel_Skin_Top"> \
                    <div class="control-modal-wrap"> \
                        <div class="container" style="padding:0;"> \
                            <div class="control-modal"> \
                                <div class="control-modal-box"> \
                                    <h2 class="img-wrap"><img src="https://rl9mnsqm6.toastcdn.net/drt/images/modal/logo.png" alt="서민금융진흥원" /></h2> \
                                    <div class="contents"> \
                                    <div class="tit">접속대기중입니다.</div> \
                                    <div class="now-info"> \
                                        <dl> \
                                            <dt class="num-tit">나의 순번</dt> \
                                            <dd> \
                                                <strong class="num"><span id="NetFunnel_Loading_Popup_Count"></span>번째</strong> \
                                                <p class="time">예상대기시간 <span class="point" id="timeWait"><span id="NetFunnel_Loading_Popup_TimeLeft"> </span></p> \
                                            </dd> \
                                            <dd> \
                                                <div class="progress-bar-wrap"> \
                                                <div class="progress-bar-back"></div> \
                                                <div class="progress-bar" style="width:100%" id="NetFunnel_Loading_Popup_Progressbar"></div> \
                                                <div class="icon-box" id="poyong"></div> \
                                                </div> \
                                            </dd> \
                                            <dd> \
                                                <div id="Progress_Print"></div> \
                                            </dd> \
                                        </dl> \
                                        </div> \
                            <div class="txt"> \
                                현재 사용자가 많아 지연되고 있습니다. <br> \
                                잠시만 기다려 주세요. \
                            </div> \
                        </div> \
                    <div class="attention-info">재접속하시면 대기시간이 더 길어집니다.</div> \
                </div> \
            </div>'
    },'normal');

    //skin2
    NetFunnel.SkinUtil.add('skin2',{
        prepareCallback:function(){
            var progress_print = document.getElementById("Progress_Print");
            progress_print.innerHTML="0 % (0/0) - 0 sec";
        },
        updateCallback:function(percent,nwait,totwait,timeleft){
            var progress_print = document.getElementById("Progress_Print");
            var prog=totwait - nwait;
            progress_print.innerHTML=percent+" % ("+prog+"/"+totwait+") - "+timeleft+" sec";
        },
        htmlStr:
            '<div id="NetFunnel_Skin_Top" style="position:relative;width:550px;height:150px;padding:68px 0 72px 0;font-family:Nanum Gothic;background-color:#ffffff;border:2px solid #006fb7;"> '
            + '<div> '
            + '<strong style="position:absolute;left:0;top:0;display:block;width:100%;height:68px;font-weight:normal;background:#006db8;"> '
            + '<h2>skin2</h2> '
            + '<p style="padding:24px 30px;margin:0 60px 0 0;text-align:left;font-size:20px;color:#fff;">서비스 이용고객이 많아 <span style="font-weight:bold;">접속 대기중</span>입니다.</p></strong> '
            + '<p style="position:absolute;left:30px;top:60px;width:100%;color:#006db8;font-size:20px">대기 순서에 따라 <span style="color:#ff4a1a;">자동 접속</span>됩니다.</p> '
            + '<p style="position:absolute;left:30px;top:100px;color:#006db8;font-size:17px">  예상 대기 시간 : <span id="NetFunnel_Loading_Popup_TimeLeft" style="color:#ff4a1a;"></span>'
            + '&nbsp;/&nbsp;현재 대기순번 <span id="NetFunnel_Loading_Popup_Count" style="color:#ff4a1a;"></span>번째</p> '
            + '<div style="position:absolute;left:0;bottom:0;width:100%;height:65px;background:#eff4f5;">'
            + '<div style="padding:25px 30px 0 30px;color:#455251;font-size:13px;line-height:20px;">- 새로고침, 뒤로가기 또는 재접속하시면 대기시간이 더 길어집니다.</div>'
            + '</div> '
            + '<div id="Progress_Print" style="display:none;position:absolute;left:0;top:100px;width:100%;text-align:center;font-size:17px;color:gray"></div> '
            + '</div> '
            + '<div style="padding:90px 0 0 30px;width:490px" id="NetFunnel_Loading_Popup_Progressbar"> </div>'
            + '<center><button id="NetFunnel_Countdown_Stop" style=" font-size: 15px;  padding: 5px 5px 5px 5px;color: #900; font-weight: bold;margin:15px;width:80px;">중지</button> </center>'
            + '</div>'
    },'normal');

    //skin3 대기창에 동영상 추가
    NetFunnel.tstr = ' \
		<div id="NetFunnel_Skin_Top" style="background-color:#ffffff;border:1px solid #9ab6c4;width:620px;height:600px;-moz-border-radius: 5px; -webkit-border-radius: 5px; -khtml-border-radius: 5px; border-radius: 5px;"> \
			<div style="background-color:#ffffff;border:6px solid #eaeff3;-moz-border-radius: 5px; -webkit-border-radius: 5px; -khtml-border-radius: 5px; border-radius: 5px;"> \
				<div style="padding-top:0px;padding-left:25px;padding-right:25px"> \
					<h2>skin3</h2> \
					<div>  <iframe width="560" height="315" src="https://www.youtube.com/embed/6m4lR2oW_SI?rel=0;amp;autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div> \
					<div style="text-align:left;font-size:12pt;color:#001f6c;height:22px"><b>서비스 <span style="color:#013dc1">접속대기 중</span>입니다.</b></div> \
					<div style="text-align:right;font-size:9pt;color:#4d4b4c;padding-top:4px;height:17px" ><b>PC 예상대기시간 : <span id="NetFunnel_Loading_Popup_TimeLeft" class="%H시간 %M분 %02S초^ ^false"></span></b></div> \
					<div style="padding-top:6px;padding-bottom:6px;vertical-align:center;width:560px;height:20px" id="NetFunnel_Loading_Popup_Progressbar"></div> \
					<div style="background-color:#ededed;width:560px;padding-bottom:8px;overflow:hidden"> \
						<div style="padding-left:5px"> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;padding-top:10px;height:10px">고객님 앞에 <b><span style="color:#2a509b"><span id="NetFunnel_Loading_Popup_Count" class="'+NetFunnel.TS_LIMIT_TEXT+'"></span></span></b> 명, 뒤에 <b><span style="color:#2a509b"><span id="NetFunnel_Loading_Popup_NextCnt" class="'+NetFunnel.TS_LIMIT_TEXT+'"></span></span></b> 명의 대기자가 있습니다.  </div> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;height:10px">현재 접속 사용자가 많아 대기 중이며, 잠시만 기다리시면 </div> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;height:10px;">서비스로 자동 접속 됩니다.</div> \
							<div style="text-align:center;font-size:9pt;color:#2a509b;padding-top:10px;"> \
								<b>※ 재 접속하시면 대기시간이 더 길어집니다. <span id="NetFunnel_Countdown_Stop" style="cursor:pointer">[중지]</span> </b> \
							</div> \
						</div> \
					</div> \
					<div style="height:5px;"></div> \
				</div> \
			</div> \
		</div>';
    NetFunnel.SkinUtil.add('skin3',{htmlStr:NetFunnel.tstr},'normal');

    //skin4
    NetFunnel.SkinUtil.add('skin4',{
        prepareCallback:function(){
            var progress_print = document.getElementById("Progress_Print");
            progress_print.innerHTML="0 % (0/0) - 0 sec";
        },
        updateCallback:function(percent,nwait,totwait,timeleft){
            var progress_print = document.getElementById("Progress_Print");
            var prog=totwait - nwait;
            progress_print.innerHTML=percent+" % ("+prog+"/"+totwait+") - "+timeleft+" sec";
        },
        htmlStr:
            '<div id="NetFunnel_Skin_Top" style="position:relative;width:550px;height:150px;padding:68px 0 72px 0;font-family:Nanum Gothic;background-color:#ffffff;border:2px solid #006fb7;"> '
            + '<div> '
            + '<strong style="position:absolute;left:0;top:0;display:block;width:100%;height:68px;font-weight:normal;background:#006db8;"> '
            + '<h2>skin2</h2> '
            + '<p style="padding:24px 30px;margin:0 60px 0 0;text-align:left;font-size:20px;color:#fff;">서비스 이용고객이 많아 <span style="font-weight:bold;">접속 대기중</span>입니다.</p></strong> '
            + '<p style="position:absolute;left:30px;top:60px;width:100%;color:#006db8;font-size:20px">대기 순서에 따라 <span style="color:#ff4a1a;">자동 접속</span>됩니다.</p> '
            + '<p style="position:absolute;left:30px;top:100px;color:#006db8;font-size:17px">  예상 대기 시간 : <span id="NetFunnel_Loading_Popup_TimeLeft" style="color:#ff4a1a;"></span>'
            + '&nbsp;/&nbsp;현재 대기순번 <span id="NetFunnel_Loading_Popup_Count" style="color:#ff4a1a;"></span>번째</p> '
            + '<div style="position:absolute;left:0;bottom:0;width:100%;height:65px;background:#eff4f5;">'
            + '<div style="padding:25px 30px 0 30px;color:#455251;font-size:13px;line-height:20px;">- 새로고침, 뒤로가기 또는 재접속하시면 대기시간이 더 길어집니다.</div>'
            + '</div> '
            + '<div id="Progress_Print" style="display:none;position:absolute;left:0;top:100px;width:100%;text-align:center;font-size:17px;color:gray"></div> '
            + '</div> '
            + '<div style="padding:90px 0 0 30px;width:490px" id="NetFunnel_Loading_Popup_Progressbar"> </div>'
            + '<center><button id="NetFunnel_Countdown_Stop" style=" font-size: 15px;  padding: 5px 5px 5px 5px;color: #900; font-weight: bold;margin:15px;width:80px;">중지</button> </center>'
            + '</div>'
    },'normal');

    //skin4
    NetFunnel.tstr = ' \
		<div id="NetFunnel_Skin_Top" style="background-color:#ffffff;border:1px solid #9ab6c4;width:580px;height:600px;-moz-border-radius: 5px; -webkit-border-radius: 5px; -khtml-border-radius: 5px; border-radius: 5px;"> \
			<div style="background-color:#ffffff;border:6px solid #eaeff3;-moz-border-radius: 5px; -webkit-border-radius: 5px; -khtml-border-radius: 5px; border-radius: 5px;"> \
				<div style="padding-top:0px;padding-left:25px;padding-right:25px"> \
					<h2>skin3</h2> \
					<div>  <iframe width="560" height="315" src="https://www.youtube.com/embed/6m4lR2oW_SI?rel=0;amp;autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div> \
					<div style="text-align:left;font-size:12pt;color:#001f6c;height:22px"><b>서비스 <span style="color:#013dc1">접속대기 중</span>입니다.</b></div> \
					<div style="text-align:right;font-size:9pt;color:#4d4b4c;padding-top:4px;height:17px" ><b>mobile 예상대기시간 : <span id="NetFunnel_Loading_Popup_TimeLeft" class="%H시간 %M분 %02S초^ ^false"></span></b></div> \
					<div style="padding-top:6px;padding-bottom:6px;vertical-align:center;width:400px;height:20px" id="NetFunnel_Loading_Popup_Progressbar"></div> \
					<div style="background-color:#ededed;width:400px;padding-bottom:8px;overflow:hidden"> \
						<div style="padding-left:5px"> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;padding-top:10px;height:10px">고객님 앞에 <b><span style="color:#2a509b"><span id="NetFunnel_Loading_Popup_Count" class="'+NetFunnel.TS_LIMIT_TEXT+'"></span></span></b> 명, 뒤에 <b><span style="color:#2a509b"><span id="NetFunnel_Loading_Popup_NextCnt" class="'+NetFunnel.TS_LIMIT_TEXT+'"></span></span></b> 명의 대기자가 있습니다.  </div> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;height:10px">현재 접속 사용자가 많아 대기 중이며, 잠시만 기다리시면 </div> \
							<div style="text-align:left;font-size:8pt;color:#4d4b4c;padding:3px;height:10px;">서비스로 자동 접속 됩니다.</div> \
							<div style="text-align:center;font-size:9pt;color:#2a509b;padding-top:10px;"> \
								<b>※ 재 접속하시면 대기시간이 더 길어집니다. <span id="NetFunnel_Countdown_Stop" style="cursor:pointer">[중지]</span> </b> \
							</div> \
						</div> \
					</div> \
					<div style="height:5px;"></div> \
				</div> \
			</div> \
		</div>';
    NetFunnel.SkinUtil.add('skin4',{htmlStr:NetFunnel.tstr},'mobile');



}
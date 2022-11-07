/*!
* NAME OF THE FILE (e.g. marketo-mcid-integration.js)
* This file contains the code for the Marketo-MCID Interaction.
* 
* @project   Marketo-MCID
* @date      2018-07-27 
* @author    Chandan Singh, Cvent <c.singh@cvent.com>
* @licensor  cvent
* @site      Socialtable.com
*
*/
//Global Namespace

var MCID = MCID || {};
/** 
 * Some Global Helper Methods and properties available with MCID Object.
**/
 (function($, window, document, MCID, undefined) {

	 
	$.extend(MCID, {
		// assigning $(document) to variable eventTarget. Can be accessed as MCID.eventTarget.
		eventTarget: $(document),
		// Formating Time
		formatTime : function(e){
			if (e < 10) e = "0" + e;
				return e;		
		},
		getQueryVariable : function(){
			var e = window.location.search.substring(1).split("&"),//cid=testcid&i_cid=thisisicid													
			n, r;   //cid=testcid,i_cid=thisisicid
			for (n = 0; n < e.length; n++) {
				r = e[n].split("=");     //(first iteration) r[0]=cid r[1]=testcid (second iteration) r[0]=i_cid r[1]=thisisicid
				if (r[0].toLowerCase() == "cid" || (r[0].toLowerCase() == "i_cid" || r[0].toLowerCase() == "r_cid")) return r[1]
			}				
		},
		getPageQueryVariable: function(variable){ 
			var query = window.location.search.substring(1),vars = query.split("&");  
			for (var i=0;i<vars.length;i++){
				var pair = vars[i].split("=");
				if (pair[0] == variable){
					return unescape(pair[1]);
				}
			} 
		},
		getCookie : function(c_name) {			
			var i, x, y, ARRcookies = document.cookie.split(";");
			for (i = 0; i < ARRcookies.length; i++) {
				x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
				y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
				x = x.replace(/^\s+|\s+$/g, "");
				if (x == c_name) {
					return unescape(y);
				}
			}
		},
		setCookie : function(c_name, value, exdays) {			
			var exdate = new Date();
			exdate.setDate(exdate.getDate() + exdays);
			var c_value = escape(value) + ((exdays == null) ? "" : ";expires=" + exdate.toUTCString() + ";domain=."+document.domain+";path=/");
			document.cookie = c_name + "=" + c_value;						
		},
		cookieDisclaimerBanner : function(){
			var cookieDisclaimerHtml = '<section class="gdpr-survey cookie-disclaimer-banner" id="cookie-disclaimer" style="display:none"><div class="container" ><div class="row"><div class="col-md-9 leftsection"><h2>Cookie Usage</h2><p>We use functional cookies on this website to enhance your browsing experience and by continuing to use the site you consent to these cookies. To find out more about how we use cookies or for more options <a href="https://www.cvent.com/en/privacy-policy" target="_blank">click here</a>. We use additional cookies to provide you with a more personalized experience and relevant advertising. By closing this box or by clicking Accept, you are indicating your consent to our use of these additional cookies.</p></div><div class="col-md-2 rightsection"><div class="cc-compliance"><a aria-label="accept cookie message" role="button" tabindex="0" class="cc-btn cd-accept">Accept</a><a aria-label="dismiss cookie message" role="button" tabindex="0" class="cc-btn cd-decline">Decline</a></div></div></div></div></section>';
			$('body').append(cookieDisclaimerHtml);
			
		},
		cookieDisclaimerOverlay : function(e){

			if( $('#cookie-disclaimer')[0] ){
				var dCVal = MCID.getCookie('gdpr_cookie_acceptance');								
				if((typeof dCVal !=='undefined' && dCVal ==="decline") || (typeof dCVal !=='undefined' && dCVal ==="explicit")){
					//do nothing													
				}else{
					$('.cookie-disclaimer-banner').css('display','block');
				}
				
				// When the user clicks on <span> (x), modalClose the modal
				$(".cd-accept").click(function(){					
					$('.cookie-disclaimer-banner').css('display','none');	
					MCID.setCookie('gdpr_cookie_acceptance','explicit',365);
					
										
				});

				// When the user clicks on <span> (x), modalClose the modal
				$(".cd-dismiss,.cd-decline").click(function(){
					$('.cookie-disclaimer-banner').css('display','none');	
					MCID.setCookie('gdpr_cookie_acceptance','decline',365);	
							
				});							
			}	
		},
		
		cookieDisclaimerRegion : function(e){

			const euList = ["GB", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "EL", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH", "IS", "LI", "NO"];
			let token = '63de90678e0e7c';        	

	        $.get("//ipinfo.io?token=" + token, function(data) {

	          let country = data.country;
	          // EU/EEA.
	          if (euList.indexOf(country) > -1) {
	          		var dCVal = MCID.getCookie('gdpr_cookie_acceptance');						
					if(typeof dCVal !=='undefined' && dCVal ==="implicit"){	
						MCID.cookieDisclaimerBanner();
						delCookie('gdpr_cookie_acceptance');
					}else{
						MCID.cookieDisclaimerBanner();
					}	          	
	            
	          }else {
	          	
	          	var dCVal = MCID.getCookie('gdpr_cookie_acceptance');	
	          	if((typeof dCVal !=='undefined' && dCVal ==="decline") || (typeof dCVal !=='undefined' && dCVal ==="explicit")){
					//do nothing													
				}else{
					 MCID.setCookie('gdpr_cookie_acceptance','implicit',365);	
				}
	           
	          }
	         
	        }, "jsonp");
		}		
	});
	MCID.mCIDCapture = (function(){
		function _mCIDCapture(){		
			this.init = function() {               
				CookieFunction.init(); 
				GeneralFunction.init();				
			}; 							
			var CookieFunction =(function(){
				function _CookieFunction(){
					this.init = function(){
						setTimeout(function(){
							loadCookie();						
						},2500);
												
					}							
					var nameEQ, cVal,lsrc, dDate, hrs = "", mnts = "", sec = "", ca = "", limit = 0, dCurDate, dCurDate1,iHrs,iMin,iSec, newTimeStamp =[] ;
					var loadCookie = function(){						
						dDate = new Date;
						dCurDate = "$" + dDate.getFullYear() + "-" + (dDate.getMonth() + 1) + "-" + dDate.getDate(),
						dCurDate1 = dDate.getFullYear() + "-" + (dDate.getMonth() + 1) + "-" + dDate.getDate(),
						iHrs = MCID.formatTime(dDate.getHours());iMin = MCID.formatTime(dDate.getMinutes());iSec = MCID.formatTime(dDate.getSeconds());
						cVal = "";nameEQ = "CampaignID=";
						lsrc = MCID.getQueryVariable();
						readCookie();
						if (typeof lsrc === "undefined" || lsrc == "")// check for referral channels here and assign appropriate CIDs
						{
							var sRefUrl = document.referrer,//'http://youtube.in/l.php?u=' 
							oAnchor=document.createElement('a'),							
							sReferrals=['google','yahoo','bing','ask','yandex','baidu', 'aol', 'naver', 'blekko', 'webcrawler', 'duckduckgo','pinterest','stumbleupon','quora','linkedin','instagram','flickr','foursquare','tumbler','youtube','facebook','twitter'],sRefDomain='';	
							if(typeof sRefUrl === 'undefined' || sRefUrl ==''){							    
								sRefDomain='direct';														
							}else{									
								sRefUrl=sRefUrl.split('?');								
								oAnchor.href = sRefUrl[0];								
								var sHost=oAnchor.hostname.toLowerCase();								
								if(sHost.indexOf('plus') >=0){
									sRefDomain = 'googleplus';
								}else if(sHost === 't.co'){
									sRefDomain = 'twitter';
								}else if(sHost === 'lnkd.in'){
									sRefDomain = 'linkedin';
								}else if(sHost ==='hqwww02' || sHost ==='www.socialtables.com' || sHost ==='dev-crowdtorch' || sHost ==='www.cvent.com' || sHost ==='www.crowdcompass.com' || sHost ==='www.crowdtorch.com' || sHost ==='cvent.com' || sHost ==='crowdcompass.com' || sHost ==='crowdtorch.com' || sHost ==='speedrfp.com' || sHost ==='elitemeetings.com'){
									sRefDomain='direct';
								}else{
									for(var i=0;i<(sReferrals.length);i++)
									{
										if(sHost.indexOf(sReferrals[i])>=0)
										{
											sRefDomain=sReferrals[i];
											break;
										}
									}
								}
							}
							
							switch (sRefDomain) {
								case 'google':
									lsrc="70100000000SYFuAAO";  // referral Google
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'yahoo':
									lsrc="70100000000SYFlAAO";  // referral Yahoo
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'bing':
									lsrc="70100000000SYFvAAO";  // referral Bing or MSN
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'ask':
									lsrc="70100000000SYFoAAO";  // referral ASK
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'yandex':
									lsrc="70100000000SYFnAAO";  // referral Yandex
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'baidu':
									lsrc="70100000000SYFpAAO";  // referral Baidu
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'aol':
									lsrc="70100000000SYFmAAO";  // referral AOL
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'naver':
									lsrc="70100000000SYFqAAO";  // referral Naver
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'blekko':
									lsrc="70100000000SYFrAAO";  // referral Blekko
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'webcrawler':
									lsrc="70100000000SYFsAAO";  // referral WebCrawler
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'duckduckgo':
									lsrc="70100000000SYFtAAO";  // referral DuckDuckGo
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'direct':									
									lsrc="70100000000SYFjAAO";  // Typed or Bookmarked
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'pinterest':
									lsrc="70100000000SYFwAAO";  // referral pinterest
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'stumbleupon':
									lsrc="70100000000SYFxAAO";  // referral stumbleupon
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'quora':
									lsrc="70100000000SYFyAAO";  // referral quora
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'googleplus':
									lsrc="70100000000SYFzAAO";  // referral googleplus
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'facebook':
									lsrc="70100000000SYG0AAO";  // referral facebook
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'twitter':
									lsrc="70100000000SYG1AAO";  // referral twitter
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'linkedin':
									lsrc="70100000000SYG2AAO";  // referral linkedin
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'instagram':
									lsrc="70100000000SYG3AAO";  // referral instagram
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'flickr':
									lsrc="70100000000SYG4AAO";  // referral flickr
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'foursquare':
									lsrc="70100000000SYG5AAO";  // referral foursquare
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'tumbler':
									lsrc="70100000000SYG6AAO";  // referral tumbler
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								case 'youtube':
									lsrc="70100000000SYG7AAO";  // referral youtube
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
									break;
								default:									
									lsrc="70100000000SYFiAAO";  // Other Referral
									cVal = cVal + "NEXTID" + lsrc;
									setCookie("CampaignID", cVal, 365);
							}
						}
						else {							
							cVal = cVal + "NEXTID" + lsrc;
							setCookie("CampaignID", cVal, 365)
						}
						readCookie();
						var finalCookie = cVal.split("NEXTID"), objid1, objid2, index = 0, ext = "", tempCID, cIDExist = $('input:hidden[name=cID1]')[0],tempCIDVal,finalCookieLength,tempCIDDateValue;
						if(cIDExist){						
							for (n = 0; n < finalCookie.length; n++) {
								objid1 = "cID" + (n + 1);
								objid2 = "cID" + (n + 1) + "DATE";
								ext = new String(finalCookie[n + 1]);
								ext = ext.split("$");
								if (ext[index] === "undefined");
								else {
									finalCookieLength = finalCookie.length - 1;
									tempCID="cID" + finalCookieLength;
									tempCIDVal = $("input:hidden[name="+tempCID+"]").val();									
									if(ext[index]==tempCIDVal)
									{
										var tempCIDDate="cID" + finalCookieLength + "DATE";	
										tempCIDDateValue = $("input:hidden[name="+tempCIDDate+"]").val();										
										var x=tempCIDDateValue.toString();
										if(x.length > 0){
											x=x.split('T');	
											var slotDate=x[0].split('-'); //slotDate[0] is year, slotDate[1] is month, slotDate[2] is date
											var slotTime=x[1].split(':'); //slotTime[0] is Hour, slotTime[1] is minutes, slotTime[2] is seconds
											
											var curDate=new Date();
											if((curDate.getDate()-slotDate[2])==0 && (curDate.getHours()-slotTime[0])<12)
											{
												//Deny entry of Duplicate CID to the slot
											}
											else
											{
												$("input:hidden[name="+objid1+"]").val(ext[index]);
												$("input:hidden[name="+objid2+"]").val(ext[index+1]);											
											}
										}	
										
									}
									else
									{
										$("input:hidden[name="+objid1+"]").val(ext[index]);
										$("input:hidden[name="+objid2+"]").val(ext[index+1]);			
									}
								}
							}
							var lcidName = "cID15=";
							var lcidVal = "";
							for (var i = 0; i < ca.length; i++) {
								var c = ca[i];
								while (c.charAt(0) == " ") c = c.substring(1, c.length);
								if (c.indexOf(lcidName) == 0) lcidVal = decodeURIComponent(c.substring(lcidName.length, c.length))
							}
							if (lcidVal != "") {
								var lastCid = lcidVal.split("$");
								if( lastCid[0] && lastCid[1]){
									$("input:hidden[name=cID15]").val(lastCid[0]);
									$("input:hidden[name=cID15DATE]").val(lastCid[1]);
								}
							};
						}
					}					
					var setCookie = function(e, t, n){
					   	var r = new Date, i = false;
						r.setDate(r.getDate() + n);
						readCookie();
						var s = cVal.split("NEXTID"), o = 0;	
						
						if (s.length <=15) {
							for (z = 0; z < s.length - 1; z++) {								
								var u = "", dCookieDate="";	
								u = new String(s[z + 1]);								
								u = u.split("$");
								if(typeof u[o+1] === "undefined")
								{
									//donothing
								}
								else
								{
									dCookieDate = u[o+1].split("T");
								}							
								var newString =[];	
								if (lsrc === u[o] && dCookieDate[o] === dCurDate1) {
								    var d = escape(lsrc) + escape(dCurDate) + "T" + encodeURIComponent(iHrs) + encodeURIComponent(":") + encodeURIComponent(iMin) + encodeURIComponent(":") + encodeURIComponent(iSec);
									
									if(s[1] !== s[z+1]){
										pos=s.indexOf(s[z + 1]);															
										s.splice(pos,1,d);
                                    }									
									for(var k=0; k<s.length; k++){
										if(s[k] == ''){
										  // do nothing
										}else{
											newString.push('NEXTID'+s[k]);
										}										
									}	
									a=newString.toString().replace(/\,/g,"");																		
									document.cookie = e + "=" + a + (n == null ? "" : "; expires=" + r.toUTCString() + ";"+document.domain+";path=/");									
									i = false;
                                    return;									
								}else if((lsrc === u[o]) && (typeof dCookieDate[o] !== 'undefined') && ( dCookieDate[o] !== dCurDate1) ){									
									var d = escape(lsrc) + escape(dCurDate) + "T" + encodeURIComponent(iHrs) + encodeURIComponent(":") + encodeURIComponent(iMin) + encodeURIComponent(":") + encodeURIComponent(iSec);								
									if(s[1] !== s[z+1]){
										pos=s.indexOf(s[z + 1]);															
										s.splice(pos,1,d);
                                    }									
									for(var k=0; k<s.length; k++){
										if(s[k] == ''){
										  // do nothing
										}else{
											newString.push('NEXTID'+s[k]);
										}										
									}								
									a=newString.toString().replace(/\,/g,"");                                    									
									document.cookie = e + "=" + a + (n == null ? "" : "; expires=" + r.toUTCString() + ";"+document.domain+";path=/");										
									i = false;
									return;									
									}else{											
									i = true
								}								
								
							}															
							if (i) {
								var a = escape(t) + escape(dCurDate) + "T" + encodeURIComponent(iHrs) + encodeURIComponent(":") + encodeURIComponent(iMin) + encodeURIComponent(":") + encodeURIComponent(iSec) + (n == null ? "" : "; expires=" + r.toUTCString() + ";"+document.domain+";path=/");
								document.cookie = e + "=" + a;
								document.cookie = "cID15=;"+document.domain+";path=/"							
							}							
						}else{
							for (z = 0; z < s.length - 1; z++) {
								var u = "", j=false, newString1 =[];	
								u = new String(s[z + 1]);								
								u = u.split("$");	
								if(lsrc == u[o]){								 
                                    var d = escape(lsrc) + escape(dCurDate) + "T" + encodeURIComponent(iHrs) + encodeURIComponent(":") + encodeURIComponent(iMin) + encodeURIComponent(":") + encodeURIComponent(iSec);									
									if(s[1] !== s[z+1]){
										pos=s.indexOf(s[z + 1]);															
										s.splice(pos,1,d);
                                    }									
									for(var k=0; k<s.length; k++){
										if(s[k] == ''){
										  // do nothing
										}else{
											newString1.push('NEXTID'+s[k]);
										}										
									}								
									a=newString1.toString().replace(/\,/g,"");	                                    								
									document.cookie = e + "=" + a + (n == null ? "" : "; expires=" + r.toUTCString() + ";"+document.domain+";path=/");									
									i = false;
                                    return;									
								}else{
									j=true; 									
								}
							}
							if(j){
								document.cookie = "cID15=" + lsrc + escape(dCurDate) + "T" +encodeURIComponent(iHrs) + encodeURIComponent(":") + encodeURIComponent(iMin) + encodeURIComponent(":") + encodeURIComponent(iSec) + (n == null ? "" : "; expires=" + r.toUTCString() + ";"+document.domain+";path=/");							
							}								
						}						
					}					
					var readCookie = function(){
						ca = document.cookie.split(";");						
						for (var e = 0; e < ca.length; e++) {
							var t = ca[e];
							while (t.charAt(0) == " ") t = t.substring(1, t.length);
							if (t.indexOf(nameEQ) == 0) cVal = decodeURIComponent(t.substring(nameEQ.length, t.length))
							
						}
					}
				}
				return new _CookieFunction();			
			}());
			
			var GeneralFunction =(function(){
				function _GeneralFunction(){
					this.init = function(){
						loadMktoForm();
						setTimeout(function(){
							fptValue = $('#formProgramType').text();
							$('input:hidden[name=formProgramType]').val(fptValue);
						},7000);
						setTimeout(function(){	
							loadOptIn();
							fptValue = $('#formProgramType').text();
							$('input:hidden[name=formProgramType]').val(fptValue);							
						},2200);
						
						setTimeout(function(){
							prepop();			
						},1500);						
					}


					var prepop = function(){
						
						var first_name = MCID.getPageQueryVariable("f"),
						last_name = MCID.getPageQueryVariable("l"),
						company = MCID.getPageQueryVariable("c"),
						phone = MCID.getPageQueryVariable("p"),
						title = MCID.getPageQueryVariable("t"),
						email = MCID.getPageQueryVariable("email"),
						lsVal = MCID.getPageQueryVariable("LS"),
						pageIdentifier = MCID.getPageQueryVariable("pi"),
						fnField = document.getElementById("FirstName"),
						lnField = document.getElementById("LastName"),
						emailField = document.getElementById("Email"),
						phoneField = document.getElementById("Phone"),
						companyField = document.getElementById("Company"),
						titleField = document.getElementById("Title"),
						ls = document.getElementsByTagName('input')[7],
						pv = $('input[name="contactUsformProductSelection"]');
						
						
						if(fnField!=null && first_name !=null){
							fnField.value=first_name;
						}
						if(lnField!=null && last_name !=null){
							lnField.value=last_name;
						}
						if(emailField!=null && email !=null){
							emailField.value=email;
						}
						if(companyField!=null && company !=null){
							companyField.value=company;
						}
						if(phoneField!=null && phone !=null){
							phoneField.value=phone;
						}
						if(titleField!=null && title !=null){
							titleField.value=title;
						}
						if(ls!=null && lsVal !=null){
							ls.value=lsVal;
						}
						if(pv!=null && pageIdentifier !=null){	
												
							$('input[name="contactUsformProductSelection"]').val(pageIdentifier);	

						}
						if($('.mktoButton')[0]){								
							$('.mktoButton').attr('disabled', true);	
						}		
					}
					function loadMktoForm(){
							tyurl = $('#tyurl').text();
							formId= $('#formid').text();
							assetname=$('#assetname').text();
							assetlink=$('#assetlink').text();
							
							eventValue = $('#eventid').text();
							keyValue = $('#key').text();
							btnText = $('#buttontext').text();
					
							
							//$('<div id="successMsg"></div>').insertBefore('#'+form_id);							
							if($('#formid')[0]){
								MktoForms2.loadForm("//app-sji.marketo.com", "006-LRT-285", formId, function(form){	
									form.onSuccess(function(values, followUpUrl){
										//get the form's jQuery element and hide it											
										delCookie('CampaignID');
										if($('#eventid')[0]){
											redirectToOnTwentyFour(values.FirstName, values.LastName, values.Email, values.Company);
										}else if($('#accorform')[0]){
											location.href = tyurl; 

										}else{
											location.href = tyurl+'?assetname='+assetname+'&assetlink='+assetlink;    	
										}               							
										return false;
									});
								});
							}

							function redirectToOnTwentyFour(fname, lname, email, company){
								var webinarLink ="http://event.on24.com/interface/registration/autoreg/index.html?eventid="+eventValue+"&sessionid=1&key="+keyValue+"&deletecookie=true&email="+email+"&firstname="+fname+"&lastname="+lname+"&company="+company;
									window.location = webinarLink;
							}
							

						}

					var loadOptIn = function(){						
							
							$('.mktoButton').text(btnText);	
							optIn ( true );
							optinBox();							
						//},2700);
						function optinBox() {
								
							$('input#optinBox[type=checkbox]').on('click', function(){
								if( $(this).is(':checked')){						
									$('input:hidden[name=tempImplicitOptin]').val('Yes');
								}else{						
									$('input:hidden[name=tempImplicitOptin]').val('No');
								}					
							});
							
						}
						function optIn( optIn ){									
							if( typeof optIn === "undefined" ){
								return console.error("@@optIn()@@: optIn parameter is undefined.");
							}else{ 
									if( optIn === true ){									
									/* !Countries in the array will use the API */
									var countryArray = ["US", "CA", "GB","BE", "FR", "NL", "SE"];
									var token = '63de90678e0e7c';
									/* !Make our AJAX call to ipinfo tool */
									$.get("//ipinfo.io?token=" + token, function(data){
										//Grab the country data from ipinfo
										var country = data.country;	
										$('.mktoButton').attr('disabled', false);
										//If the country is in the array, remove the opt in box							
										if(country==="US" && $.inArray(country, countryArray) > -1){					
											$("input#optinBox[type=checkbox]").parents('.mktoFormRow').hide();
											$("#c-address").hide();
										}else if(country==="CA" && $.inArray(country, countryArray) > -1){
											$('input:hidden[name=tempImplicitOptin]').val('No');
											var optinCheckbox = $('<div class="mktoFormRow" id="optinContainer"><div class="mktoFormCol" style="margin-bottom: 30px;"><div class="mktoOffset" style="width: 0px;"></div>'
											+'<div class="mktoFieldWrap"><label for="optinBox" class="mktoLabel mktoHasWidth" style="width: 0px;"><div class="mktoAsterix">*</div></label><div class="mktoGutter mktoHasWidth" style="width: 0px;"></div>'
											+'<div class="mktoLogicalField mktoCheckboxList mktoHasWidth" style="width: auto;"><input name="optinBox" id="optinBox" type="checkbox" value="No" class="mktoField">'
											+'<label for="optinBox"></label></div><span class="optIn">I agree to receive electronic messages from Cvent, Inc. about future whitepapers, webcasts, videos, products, events and more. I understand I can withdraw my consent by <a href="//hello.cvent.com/subscriptionmanagement">unsubscribing</a> at any time. <br/><br/>Please refer to our <a href="//www.cvent.com/en/privacy-policy.shtml" target="_blank">Privacy Policy</a> or <a href="mailto:privacy@cvent.com" target="_blank">Contact Us</a> for more details.</span>'
											+'<div class="mktoClear"></div></div><div class="mktoClear"></div></div><div class="mktoClear"></div></div>');							
											$('form.mktoForm ').find('.mktoButtonRow').before(optinCheckbox);
											$("input#optinBox[type=checkbox]").parents('.mktoFormRow').show();
											var optinAddress = $('<div id="c-address" class="c-address" style="margin-top:10px"><p style="text-align:center;font-size:11px">Cvent, Inc. 1765 Greensboro Station Place<br>7th Floor, Tysons Corner, VA 22102</p></div>');
											$('form.mktoForm ').find('.mktoButtonRow').after(optinAddress);
										}else if((country === "GB" || country ==="BE" || country ==="FR" || country ==="NL" || country ==="SE") && $.inArray(country, countryArray) > -1){
											//$('input:hidden[name=tempImplicitOptin]').val('No');
											var optinCheckbox = $('<div class="mktoFormRow" id="optinContainer"><div class="mktoFormCol" style="margin-bottom: 30px;"><div class="mktoOffset" style="width: 0px;"></div>'
											+'<div class="mktoFieldWrap"><label for="optinBox" class="mktoLabel mktoHasWidth" style="width: 0px;"><div class="mktoAsterix">*</div></label><div class="mktoGutter mktoHasWidth" style="width: 0px;"></div>'
											+'<div class="mktoLogicalField mktoCheckboxList mktoHasWidth" style="width: auto;">'
											+'<label for="optinBox"></label></div><span class="optIn">The information you provide will be used to send you information related to this request and may also be used for marketing and/or sales communications from Cvent, Inc. You can update your <a href="//hello.cvent.com/subscriptionmanagement">communication preferences</a> at any time.<br><br>Please refer to our <a href="//www.cvent.com/en/privacy-policy.shtml" target="_blank">Privacy Policy</a> or <a href="mailto:privacy@cvent.com">Contact Us</a> for more details.</span>'
											+'<div class="mktoClear"></div></div><div class="mktoClear"></div></div><div class="mktoClear"></div></div>');							
											$('form.mktoForm ').find('.mktoButtonRow').before(optinCheckbox);
											$("input#optinBox[type=checkbox]").parents('.mktoFormRow').show();
										}else{
											$('input:hidden[name=tempImplicitOptin]').val('No');
											
											var optinCheckbox = $('<div class="mktoFormRow" id="optinContainer"><div class="mktoFormCol" style="margin-bottom: 30px;"><div class="mktoOffset" style="width: 0px;"></div>'
											+'<div class="mktoFieldWrap"><label for="optinBox" class="mktoLabel mktoHasWidth" style="width: 0px;"><div class="mktoAsterix">*</div></label><div class="mktoGutter mktoHasWidth" style="width: 0px;"></div>'
											+'<div class="mktoLogicalField mktoCheckboxList mktoHasWidth" style="width: auto;"><input name="optinBox" id="optinBox" type="checkbox" value="No" class="mktoField">'
											+'<label for="optinBox"></label></div><span class="optIn">I would like to receive information via email about future Cvent white papers, webcasts, videos, events and more. I understand I can withdraw my consent by <a href="//hello.cvent.com/subscriptionmanagement">unsubscribing</a> at any time. <br/><br/>Please refer to our <a href="//www.cvent.com/en/privacy-policy.shtml" target="_blank">Privacy Policy</a> or <a href="mailto:privacy@cvent.com" target="_blank">Contact Us</a> for more details.</span>'
											+'<div class="mktoClear"></div></div><div class="mktoClear"></div></div><div class="mktoClear"></div></div>');							
											$('form.mktoForm ').find('.mktoButtonRow').before(optinCheckbox);
											$("input#optinBox[type=checkbox]").parents('.mktoFormRow').show();								
										}
										//Ajax options
										$.ajaxSetup({ cache: false, timeout: 1000 });
									}, "jsonp");
								}else{			
									$("input#optinBox[type=checkbox]").parents('.mktoFormRow').remove();
								}
							}
						}						
						
					}
				}
				return new _GeneralFunction();		
			}());					
		};
		return new _mCIDCapture();
	}());	
 
 })(jQuery, this, this.document, MCID);
 
(function($, window, document, MCID, undefined) {
	$(function() {
		MCID.cookieDisclaimerRegion();       
        setTimeout(function(){ MCID.cookieDisclaimerOverlay();},1000);	
		setTimeout(function(){ MCID.mCIDCapture.init();},1000);
     });
 })(jQuery, this, this.document, MCID);


function delCookie(e) {   
	document.cookie = e + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;"+document.domain+";path=/";
	document.cookie = "cID15=;expires=Thu, 01 Jan 1970 00:00:01 GMT;"+document.domain+";path=/";
}




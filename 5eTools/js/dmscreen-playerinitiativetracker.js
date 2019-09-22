"use strict";class InitiativeTrackerPlayer{static make$tracker(a,b){const c=$(`<div class="initp__meta"/>`).hide(),d=$(`<div class="initp__header"/>`).hide(),e=$(`<div class="initp__rows"/>`).hide(),f=$$`<div class="initp__wrp_active">
			${c}
			${d}
			${e}
		</div>`,g=new InitiativeTrackerPlayerMessageHandlerScreen;g.setElements(c,d,e);const h=$(`<button class="btn btn-primary mb-2" style="min-width: 200px;">Connect to Remote Tracker</button>`).click(()=>{h.detach(),i.detach();const a=$(`<input class="form-control input-sm code">`).disableSpellcheck(),b=$(`<button class="btn btn-primary btn-xs">Generate Client Token</button>`),c=$(`<input class="form-control input-sm code copyable">`).disableSpellcheck(),d=$(`<input type="checkbox" checked>`),e=$(`<button class="btn btn-default btn-xs">Back</button>`).click(()=>{f.remove(),$wrpInitial.append(h).append(i)}),f=$$`<div class="flex-col full-width">
					<div class="flex-vh-center px-4 mb-2">
						<span style="min-width: fit-content;" class="mr-2">Server Token</span>
						${a}
					</div>
					
					<div class="split px-4 mb-2">
						<label class="flex-label">
								<span class="mr-2 help" title="Turning this off will produce a client token which is roughly twice as long, but contains only standard characters.">Short client token</span>
								${d}
						</label>
						${b}					
					</div>
					
					<div class="flex-vh-center px-4 mb-2">
						<span style="min-width: fit-content;" class="mr-2">Client Token</span>
						${c}
					</div>
					
					<div class="flex-vh-center px-4">
						${e}
					</div>
				</div>`.appendTo($wrpInitial),j=new InitiativeTrackerPlayerUi(g,a,b,c,d);j.init()}),i=$(`<button class="btn btn-primary" style="min-width: 200px;">Connect to Local Tracker</button>`).click(()=>{const b=a.getPanelsByType(PANEL_TYP_INITIATIVE_TRACKER).map(a=>a.tabDatas.filter(a=>a.type===PANEL_TYP_INITIATIVE_TRACKER).map(a=>a.$content.find(`.dms__data_anchor`))).flat();if(!b.length)JqueryUtil.doToast({content:"No local trackers detected!",type:"warning"});else if(1===b.length)b[0].data("doConnectLocal")(g);else{h.detach(),i.detach();const a=$(`<select class="form-control input-xs mr-1">
							<option value="-1" disabled>Select a local tracker</option>
						</select>`).change(()=>a.removeClass("error-background"));b.forEach((b,c)=>a.append(`<option value="${c}">${b.data("getSummary")()}</option>`)),a.val("-1");const c=$(`<button class="btn btn-primary btn-xs">OK</button>`).click(async()=>"-1"===a.val()?a.addClass("error-background"):void(await b[+a.val()].data("doConnectLocal")(g),e.remove(),d.remove(),$wrpInitial.append(h).append(i))),d=$$`<div class="flex-vh-center mb-2">
							${a}
							${c}
						</div>`.appendTo($wrpInitial),e=$(`<button class="btn btn-default btn-xs">Back</button>`).click(()=>{e.remove(),d.remove(),$wrpInitial.append(h).append(i)}).appendTo($wrpInitial)}});return g.$wrpInitial=$$`<div class="flex-vh-center full-height flex-col">
			${h}
			${i}
		</div>`.appendTo(f),f}}class InitiativeTrackerPlayerMessageHandlerScreen extends InitiativeTrackerPlayerMessageHandler{constructor(){super(!0),this._$wrpInitial=null}initUi(){this._isUiInit||(this._isUiInit=!0,this._$meta.show(),this._$head.show(),this._$rows.show(),this._$wrpInitial.hide(),$(window).on("beforeunload",a=>{if(this._clientData.client.isActive){return(a||window.event).message="The connection will be closed","The connection will be closed"}}))}set $wrpInitial(a){this._$wrpInitial=a}}
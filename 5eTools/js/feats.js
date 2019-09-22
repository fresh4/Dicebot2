"use strict";class FeatsPage extends ListPage{constructor(){const a=getSourceFilter(),b=getAsiFilter(),c=new Filter({header:"Prerequisite",items:["Ability","Race","Proficiency","Spellcasting"]});super({urlData:"data/feats.json",filters:[a,b,c],filterSource:a,listValueNames:["name","source","ability","prerequisite","uniqueid"],listClass:"feats",sublistValueNames:["name","ability","prerequisite","id"],sublistClass:"subfeats",dataProp:"feat"}),this._sourceFilter=a,this._asiFilter=b,this._prereqFilter=c}getListItem(a,b){const c=a.name,d=Renderer.getAbilityData(a.ability);d.asText||(d.asText=STR_NONE),a._fAbility=d.asCollection.filter(b=>!d.areNegative.includes(b));let e=Renderer.feat.getPrerequisiteText(a.prerequisite,!0);e||(e=STR_NONE);const f=new Set;return(a.prerequisite||[]).forEach(a=>f.add(...Object.keys(a))),a._fPrereq=[...f].map(a=>a.uppercaseFirst()),a._slAbility=d.asText,a._slPrereq=e,this._sourceFilter.addItem(a.source),`
		<li class="row" ${FLTR_ID}="${b}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
			<a id="${b}" href="#${UrlUtil.autoEncodeHash(a)}" title="${c}">
				<span class="name col-3-8 pl-0">${c}</span>
				<span class="ability col-3-5 ${d.asText===STR_NONE?"list-entry-none ":""}">${d.asText}</span>
				<span class="prerequisite col-3 ${e===STR_NONE?"list-entry-none ":""}">${e}</span>
				<span class="source col-1-7 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
				
				<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:b}</span>
			</a>
		</li>`}handleFilterChange(){const a=this._filterBox.getValues();this._list.filter(b=>{const c=this._dataList[$(b.elm).attr(FLTR_ID)];return this._filterBox.toDisplay(a,c.source,c._fAbility,c._fPrereq)}),FilterBox.selectFirstVisible(this._dataList)}getSublistItem(a,b){return`
			<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
				<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="name col-4 pl-0">${a.name}</span>
					<span class="ability col-4 ${a._slAbility===STR_NONE?"list-entry-none":""}">${a._slAbility}</span>
					<span class="prerequisite col-4 ${a._slPrereq===STR_NONE?"list-entry-none":""} pr-0">${a._slPrereq}</span>
					<span class="id hidden">${b}</span>
				</a>
			</li>
		`}doLoadHash(a){this._renderer.setFirstSection(!0);const b=$("#pagecontent").empty(),c=this._dataList[a],d=Renderer.feat.getPrerequisiteText(c.prerequisite);Renderer.feat.mergeAbilityIncrease(c);const e=[];this._renderer.recursiveRender({entries:c.entries},e,{depth:2}),b.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(c)}
		${d?`<tr><td colspan="6"><span class="prerequisite">Prerequisite: ${d}</span></td></tr>`:""}
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		<tr class='text'><td colspan='6'>${e.join("")}</td></tr>
		${Renderer.utils.getPageTr(c)}
		${Renderer.utils.getBorderTr()}
	`),ListUtil.updateSelected()}doLoadSubHash(a){a=this._filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a)}}const featsPage=new FeatsPage;window.onload=function(){featsPage.pOnLoad()};
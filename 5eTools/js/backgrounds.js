"use strict";class BackgroundPage extends ListPage{constructor(){const a=getSourceFilter(),b=new Filter({header:"Skill Proficiencies",displayFn:StrUtil.toTitleCase}),c=new Filter({header:"Tool Proficiencies",displayFn:StrUtil.toTitleCase}),d=new Filter({header:"Language Proficiencies",displayFn:StrUtil.toTitleCase});super({urlData:"data/backgrounds.json",urlFluff:"data/fluff-backgrounds.json",filters:[a,b,c,d],filterSource:a,listValueNames:["name","source","skills","uniqueid"],listClass:"backgrounds",sublistValueNames:["name","skills","id"],sublistClass:"subbackgrounds",dataProp:"background"}),this._sourceFilter=a,this._skillFilter=b,this._toolFilter=c,this._languageFilter=d}getListItem(a,b){const c=Renderer.background.getSkillSummary(a.skillProficiencies,!0,a._fSkills=[]);return Renderer.background.getToolSummary(a.toolProficiencies,!0,a._fTools=[]),Renderer.background.getLanguageSummary(a.languageProficiencies,!0,a._fLangs=[]),this._sourceFilter.addItem(a.source),this._skillFilter.addItem(a._fSkills),this._toolFilter.addItem(a._fTools),this._languageFilter.addItem(a._fLangs),`
		<li class="row" ${FLTR_ID}="${b}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
			<a id="${b}" href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
				<span class="name col-4 pl-0">${a.name.replace("Variant ","")}</span>
				<span class="skills col-6">${c}</span>
				<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)}" title="${Parser.sourceJsonToFull(a.source)} pr-0" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
				
				<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:b}</span>
			</a>
		</li>`}handleFilterChange(){const a=this._filterBox.getValues();this._list.filter(b=>{const c=this._dataList[$(b.elm).attr(FLTR_ID)];return this._filterBox.toDisplay(a,c.source,c._fSkills,c._fTools,c._fLangs)}),FilterBox.selectFirstVisible(this._dataList)}getSublistItem(a,b){return`
			<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
				<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="name col-4 pl-0">${a.name}</span>
					<span class="name col-8 pr-0">${Renderer.background.getSkillSummary(a.skillProficiencies||[],!0)}</span>
					<span class="id hidden">${b}</span>
				</a>
			</li>
		`}doLoadHash(a){this._renderer.setFirstSection(!0);const b=$("#pagecontent").empty(),c=this._dataList[a],d=a=>Renderer.utils.buildFluffTab(a,b,c,a=>c.fluff||a.background.find(a=>a.name===c.name&&a.source===c.source),this._urlFluff,()=>!0),e=Renderer.utils.tabButton("Traits",()=>{},()=>{const a=[],d={type:"entries",entries:c.entries};this._renderer.recursiveRender(d,a),b.append(`
			${Renderer.utils.getBorderTr()}
			${Renderer.utils.getNameTr(c)}
			<tr><td class="divider" colspan="6"><div></div></td></tr>
			<tr class="text"><td colspan="6">${a.join("")}</td></tr>
			${Renderer.utils.getPageTr(c)}
			${Renderer.utils.getBorderTr()}
			`)}),f=Renderer.utils.tabButton("Info",()=>{},d),g=Renderer.utils.tabButton("Images",()=>{},d.bind(null,!0));Renderer.utils.bindTabButtons(e,f,g),ListUtil.updateSelected()}doLoadSubHash(a){a=this._filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a)}}const backgroundsPage=new BackgroundPage;window.onload=function(){backgroundsPage.pOnLoad()};
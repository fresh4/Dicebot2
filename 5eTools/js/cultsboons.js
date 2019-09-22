"use strict";const JSON_URL="data/cultsboons.json";window.onload=function(){ExcludeUtil.pInitialise(),SortUtil.initHandleFilterButtonClicks(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};function cultBoonTypeToFull(a){return"c"===a?"Cult":"Demonic Boon"}let cultsAndBoonsList;const sourceFilter=getSourceFilter();let filterBox,list;async function onJsonLoad(a){list=ListUtil.search({valueNames:["name","source","type","uniqueid"],listClass:"cultsboons",sortFunction:SortUtil.listSort});const b=new Filter({header:"Type",items:["b","c"],displayFn:cultBoonTypeToFull});filterBox=await pInitFilterBox({filters:[sourceFilter,b]});const c=$(`.lst__wrp-search-visible`);list.on("updated",()=>{c.html(`${list.visibleItems.length}/${list.items.length}`)}),$(filterBox).on(FilterBox.EVNT_VALCHANGE,handleFilterChange);ListUtil.initSublist({valueNames:["type","name","source","id"],listClass:"subcultsboons",getSublistRow:getSublistItem});ListUtil.initGenericPinnable(),RollerUtil.addListRollButton(),ListUtil.addListShowHide(),a.cult.forEach(a=>a._type="c"),a.boon.forEach(a=>a._type="b"),cultsAndBoonsList=a.cult.concat(a.boon);let d="";cultsAndBoonsList.forEach((a,b)=>{d+=`
			<li class="row" ${FLTR_ID}="${b}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${b}" href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="type col-3 text-center pl-0">${cultBoonTypeToFull(a._type)}</span>
					<span class="name col-7">${a.name}</span>
					<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
					
					<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:b}</span>
				</a>
			</li>`,sourceFilter.addItem(a.source)});const e=ListUtil.getSearchTermAndReset(list);$("ul.cultsboons").append(d),list.reIndex(),e&&list.search(e),list.sort("type"),filterBox.render(),handleFilterChange(),ListUtil.setOptions({itemList:cultsAndBoonsList,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(cultsAndBoonsList),UrlUtil.bindLinkExportButton(filterBox),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton(),History.init(!0)}function handleFilterChange(){const a=filterBox.getValues();list.filter(function(b){const c=cultsAndBoonsList[$(b.elm).attr(FLTR_ID)];return filterBox.toDisplay(a,c.source,c._type)}),FilterBox.selectFirstVisible(cultsAndBoonsList)}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
				<span class="name col-12 px-0">${a.name}</span>
				<span class="id hidden">${b}</span>
			</a>
		</li>
	`}const renderer=Renderer.get();function loadHash(a){renderer.setFirstSection(!0);const b=cultsAndBoonsList[a],c=[];"c"===b._type?(Renderer.cultboon.doRenderCultParts(b,renderer,c),renderer.recursiveRender({entries:b.entries},c,{depth:2}),$("#pagecontent").html(`
			${Renderer.utils.getBorderTr()}
			${Renderer.utils.getNameTr(b)}
			<tr id="text"><td class="divider" colspan="6"><div></div></td></tr>
			<tr class='text'><td colspan='6' class='text'>${c.join("")}</td></tr>
			${Renderer.utils.getPageTr(b)}
			${Renderer.utils.getBorderTr()}
		`)):"b"===b._type&&(b._displayName=b._displayName||`Demonic Boon: ${b.name}`,Renderer.cultboon.doRenderBoonParts(b,renderer,c),renderer.recursiveRender({entries:b.entries},c,{depth:1}),$("#pagecontent").html(`
			${Renderer.utils.getBorderTr()}
			${Renderer.utils.getNameTr(b)}
			<tr class='text'><td colspan='6'>${c.join("")}</td></tr>
			${Renderer.utils.getPageTr(b)}
			${Renderer.utils.getBorderTr()}
		`)),ListUtil.updateSelected()}function loadSubHash(a){a=filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a)}
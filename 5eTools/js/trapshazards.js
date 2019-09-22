"use strict";const JSON_URL="data/trapshazards.json";window.onload=async function(){await ExcludeUtil.pInitialise(),SortUtil.initHandleFilterButtonClicks(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};function filterTypeSort(c,d){return c=c.item,d=d.item,SortUtil.ascSortLower(Parser.trapHazTypeToFull(c),Parser.trapHazTypeToFull(d))}const sourceFilter=getSourceFilter();let filterBox,list;async function onJsonLoad(a){list=ListUtil.search({valueNames:["name","trapType","source","uniqueid"],listClass:"trapshazards",sortFunction:SortUtil.listSort});const b=new Filter({header:"Type",items:["MECH","MAG","SMPL","CMPX","HAZ","WTH","ENV","WLD","GEN"],displayFn:Parser.trapHazTypeToFull,itemSortFn:filterTypeSort});filterBox=await pInitFilterBox({filters:[sourceFilter,b]});const c=$(`.lst__wrp-search-visible`);list.on("updated",()=>{c.html(`${list.visibleItems.length}/${list.items.length}`)}),$(filterBox).on(FilterBox.EVNT_VALCHANGE,handleFilterChange);ListUtil.initSublist({valueNames:["name","type","id"],listClass:"subtrapshazards",getSublistRow:getSublistItem});ListUtil.initGenericPinnable(),addTrapsHazards(a),BrewUtil.pAddBrewData().then(handleBrew).then(()=>BrewUtil.bind({list})).then(()=>BrewUtil.pAddLocalBrewData()).catch(BrewUtil.pPurgeBrew).then(async()=>{BrewUtil.makeBrewButton("manage-brew"),BrewUtil.bind({filterBox,sourceFilter}),await ListUtil.pLoadState(),RollerUtil.addListRollButton(),ListUtil.addListShowHide(),History.init(!0),ExcludeUtil.checkShowAllExcluded(trapsAndHazardsList,$(`#pagecontent`))})}function handleBrew(a){return addTrapsHazards({trap:a.trap}),addTrapsHazards({hazard:a.hazard}),Promise.resolve()}let trapsAndHazardsList=[],thI=0;function addTrapsHazards(a){if((!a.trap||!a.trap.length)&&(!a.hazard||!a.hazard.length))return;a.trap&&a.trap.length&&(trapsAndHazardsList=trapsAndHazardsList.concat(a.trap)),a.hazard&&a.hazard.length&&(a.hazard.forEach(a=>a.trapHazType=a.trapHazType||"HAZ"),trapsAndHazardsList=trapsAndHazardsList.concat(a.hazard));let b="";for(;thI<trapsAndHazardsList.length;thI++){const a=trapsAndHazardsList[thI];if(!Renderer.traphazard.isTrap(a.trapHazType)&&ExcludeUtil.isExcluded(a.name,"hazard",a.source))continue;else if(Renderer.traphazard.isTrap(a.trapHazType)&&ExcludeUtil.isExcluded(a.name,"trap",a.source))continue;b+=`
			<li class="row" ${FLTR_ID}="${thI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${thI}" href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="name col-6 pl-0">${a.name}</span>
					<span class="trapType col-4">${Parser.trapHazTypeToFull(a.trapHazType)}</span>
					<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
					
					<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:thI}</span>
				</a>
			</li>
		`,sourceFilter.addItem(a.source)}const c=ListUtil.getSearchTermAndReset(list);$(`#trapsHazardsList`).append(b),list.reIndex(),c&&list.search(c),list.sort("name"),filterBox.render(),handleFilterChange(),ListUtil.setOptions({itemList:trapsAndHazardsList,getSublistRow:getSublistItem,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(trapsAndHazardsList),UrlUtil.bindLinkExportButton(filterBox),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton()}function handleFilterChange(){const a=filterBox.getValues();list.filter(function(b){const c=trapsAndHazardsList[$(b.elm).attr(FLTR_ID)];return filterBox.toDisplay(a,c.source,c.trapHazType)}),FilterBox.selectFirstVisible(trapsAndHazardsList)}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
				<span class="name col-8 pl-0">${a.name}</span>
				<span class="type col-4 pr-0">${Parser.trapHazTypeToFull(a.trapHazType)}</span>
				<span class="id hidden">${b}</span>
			</a>
		</li>
	`}const renderer=Renderer.get();function loadHash(a){renderer.setFirstSection(!0);const b=trapsAndHazardsList[a],c=[];renderer.recursiveRender({entries:b.entries},c,{depth:2});const d=Renderer.traphazard.getSimplePart(renderer,b),e=Renderer.traphazard.getComplexPart(renderer,b),f=Renderer.traphazard.getSubtitle(b),g=$(`#pagecontent`).empty();g.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(b)}
		${f?`<tr class="text"><td colspan="6"><i>${Renderer.traphazard.getSubtitle(b)}</i></td>`:""}
		<tr class="text"><td colspan="6">${c.join("")}${d||""}${e||""}</td></tr>
		${Renderer.utils.getPageTr(b)}
		${Renderer.utils.getBorderTr()}
	`),ListUtil.updateSelected()}function loadSubHash(a){a=filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a)}
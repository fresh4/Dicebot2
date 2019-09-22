"use strict";const JSON_URL="data/conditionsdiseases.json",entryRenderer=Renderer.get();window.onload=function(){ExcludeUtil.pInitialise(),SortUtil.initHandleFilterButtonClicks(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};function conditionDiseaseTypeToFull(a){return"c"===a?"Condition":"Disease"}const sourceFilter=getSourceFilter();let filterBox,list;async function onJsonLoad(a){list=ListUtil.search({valueNames:["name","source","type","uniqueid"],listClass:"conditions"});const b=new Filter({header:"Type",items:["c","d"],displayFn:conditionDiseaseTypeToFull,deselFn:a=>"d"===a});filterBox=await pInitFilterBox({filters:[sourceFilter,b]});const c=$(`.lst__wrp-search-visible`);list.on("updated",()=>{c.html(`${list.visibleItems.length}/${list.items.length}`)}),$(filterBox).on(FilterBox.EVNT_VALCHANGE,handleFilterChange);ListUtil.initSublist({valueNames:["name","type","id"],listClass:"subconditions",getSublistRow:getSublistItem});ListUtil.initGenericPinnable(),addConditions(a),BrewUtil.pAddBrewData().then(handleBrew).then(()=>BrewUtil.bind({list})).then(()=>BrewUtil.pAddLocalBrewData()).catch(BrewUtil.pPurgeBrew).then(async()=>{BrewUtil.makeBrewButton("manage-brew"),BrewUtil.bind({filterBox,sourceFilter}),await ListUtil.pLoadState(),RollerUtil.addListRollButton(),ListUtil.addListShowHide(),History.init(!0)})}function handleBrew(a){return addConditions(a),Promise.resolve()}let conditionList=[],cdI=0;function addConditions(a){if((!a.condition||!a.condition.length)&&(!a.disease||!a.disease.length))return;a.condition&&a.condition.forEach(a=>a._type="c"),a.disease&&a.disease.forEach(a=>a._type="d"),a.condition&&a.condition.length&&(conditionList=conditionList.concat(a.condition)),a.disease&&a.disease.length&&(conditionList=conditionList.concat(a.disease));const b=$("ul.conditions");let c="";for(;cdI<conditionList.length;cdI++){const a=conditionList[cdI];c+=`
			<li class="row" ${FLTR_ID}="${cdI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id='${cdI}' href='#${UrlUtil.autoEncodeHash(a)}' title="${a.name}">
					<span class="type col-3 text-center pl-0">${conditionDiseaseTypeToFull(a._type)}</span>
					<span class="name col-7">${a.name}</span>
					<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
					
					<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:cdI}</span>
				</a>
			</li>`,sourceFilter.addItem(a.source)}const d=ListUtil.getSearchTermAndReset(list);b.append(c),list.reIndex(),d&&list.search(d),list.sort("name"),filterBox.render(),handleFilterChange(),ListUtil.setOptions({itemList:conditionList,getSublistRow:getSublistItem,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(conditionList),UrlUtil.bindLinkExportButton(filterBox),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton()}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}">
				<span class="name col-12 px-0">${a.name}</span>
				<span class="id hidden">${b}</span>
			</a>
		</li>
	`}function handleFilterChange(){const a=filterBox.getValues();list.filter(function(b){const c=conditionList[$(b.elm).attr(FLTR_ID)];return filterBox.toDisplay(a,c.source,c._type)}),FilterBox.selectFirstVisible(conditionList)}function loadHash(a){entryRenderer.setFirstSection(!0);const b=$("#pagecontent").empty(),c=conditionList[a],d={type:"entries",entries:c.entries},e=[];entryRenderer.recursiveRender(d,e),b.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(c)}
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		<tr class='text'><td colspan='6'>${e.join("")}</td></tr>
		${Renderer.utils.getPageTr(c)}
		${Renderer.utils.getBorderTr()}
	`),ListUtil.updateSelected()}function loadSubHash(a){a=filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a)}
"use strict";const JSON_URL="data/ships.json";window.onload=async function(){await ExcludeUtil.pInitialise(),SortUtil.initHandleFilterButtonClicks(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};const sourceFilter=getSourceFilter();let filterBox,list;async function onJsonLoad(a){list=ListUtil.search({valueNames:["name","source","uniqueid"],listClass:"ships",sortFunction:SortUtil.listSort}),filterBox=await pInitFilterBox({filters:[sourceFilter]});const b=$(`.lst__wrp-search-visible`);list.on("updated",()=>{b.html(`${list.visibleItems.length}/${list.items.length}`)}),$(filterBox).on(FilterBox.EVNT_VALCHANGE,handleFilterChange);ListUtil.initSublist({valueNames:["name","id"],listClass:"subships",getSublistRow:getSublistItem});ListUtil.initGenericPinnable(),addShips(a),BrewUtil.pAddBrewData().then(handleBrew).then(()=>BrewUtil.bind({list})).then(()=>BrewUtil.pAddLocalBrewData()).catch(BrewUtil.pPurgeBrew).then(async()=>{BrewUtil.makeBrewButton("manage-brew"),BrewUtil.bind({filterBox,sourceFilter}),await ListUtil.pLoadState(),RollerUtil.addListRollButton(),ListUtil.addListShowHide(),History.init(!0),ExcludeUtil.checkShowAllExcluded(shipList,$(`#pagecontent`))})}function handleBrew(a){return addShips({ship:a.ship}),Promise.resolve()}let shipList=[],shI=0;function addShips(a){if(!a.ship||!a.ship.length)return;shipList=shipList.concat(a.ship);let b="";for(;shI<shipList.length;shI++){const a=shipList[shI];ExcludeUtil.isExcluded(a.name,"ship",a.source)||(b+=`
			<li class="row" ${FLTR_ID}="${shI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${shI}" href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="name col-10 pl-0">${a.name}</span>
					<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
					
					<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:shI}</span>
				</a>
			</li>
		`,sourceFilter.addItem(a.source))}const c=ListUtil.getSearchTermAndReset(list);$(`#shipList`).append(b),list.reIndex(),c&&list.search(c),list.sort("name"),filterBox.render(),handleFilterChange(),ListUtil.setOptions({itemList:shipList,getSublistRow:getSublistItem,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(shipList),UrlUtil.bindLinkExportButton(filterBox),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton()}function handleFilterChange(){const a=filterBox.getValues();list.filter(function(b){const c=shipList[$(b.elm).attr(FLTR_ID)];return filterBox.toDisplay(a,c.source)}),FilterBox.selectFirstVisible(shipList)}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
				<span class="name col-12 px-0">${a.name}</span>
				<span class="id hidden">${b}</span>
			</a>
		</li>
	`}function loadHash(a){function b(a){return Renderer.utils.buildFluffTab(a,d,c,a=>c.fluff||a.ship.find(a=>a.name===c.name&&a.source===c.source),`data/fluff-ships.json`,()=>!0)}Renderer.get().setFirstSection(!0);const c=shipList[a],d=$(`#pagecontent`).empty(),e=Renderer.utils.tabButton("Item",()=>{},function(){d.append(Renderer.ship.getRenderedString(c))}),f=Renderer.utils.tabButton("Info",()=>{},b),g=Renderer.utils.tabButton("Images",()=>{},()=>b(!0));Renderer.utils.bindTabButtons(e,f,g),ListUtil.updateSelected()}function loadSubHash(a){a=filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a)}
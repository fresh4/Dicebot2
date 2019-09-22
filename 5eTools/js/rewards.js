"use strict";const JSON_URL="data/rewards.json";window.onload=async function(){await ExcludeUtil.pInitialise(),SortUtil.initHandleFilterButtonClicks(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};let list;const sourceFilter=getSourceFilter(),typeFilter=new Filter({header:"Type",items:["Blessing","Boon","Charm"]});let filterBox;async function onJsonLoad(a){filterBox=await pInitFilterBox({filters:[sourceFilter,typeFilter]}),list=ListUtil.search({valueNames:["name","source","uniqueid"],listClass:"rewards"});const b=$(`.lst__wrp-search-visible`);list.on("updated",()=>{b.html(`${list.visibleItems.length}/${list.items.length}`)}),$(filterBox).on(FilterBox.EVNT_VALCHANGE,handleFilterChange);ListUtil.initSublist({valueNames:["name","id"],listClass:"subrewards",getSublistRow:getSublistItem});addRewards(a),BrewUtil.pAddBrewData().then(handleBrew).then(()=>BrewUtil.bind({list})).then(()=>BrewUtil.pAddLocalBrewData()).catch(BrewUtil.pPurgeBrew).then(async()=>{BrewUtil.makeBrewButton("manage-brew"),BrewUtil.bind({filterBox,sourceFilter}),await ListUtil.pLoadState(),RollerUtil.addListRollButton(),ListUtil.addListShowHide(),History.init(!0),ExcludeUtil.checkShowAllExcluded(rewardList,$(`#pagecontent`))})}function handleBrew(a){return addRewards(a),Promise.resolve()}let rewardList=[],rwI=0;function addRewards(a){if(!a.reward||!a.reward.length)return;rewardList=rewardList.concat(a.reward);let b="";for(;rwI<rewardList.length;rwI++){const a=rewardList[rwI];ExcludeUtil.isExcluded(a.name,"reward",a.source)||(b+=`
			<li class="row" ${FLTR_ID}="${rwI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${rwI}" href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="name col-10 pl-0">${a.name}</span>
					<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
					
					<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:rwI}</span>
				</a>
			</li>`,sourceFilter.addItem(a.source),typeFilter.addItem(a.type))}const c=ListUtil.getSearchTermAndReset(list);$("ul.rewards").append(b),list.reIndex(),c&&list.search(c),list.sort("name"),filterBox.render(),handleFilterChange(),ListUtil.setOptions({itemList:rewardList,getSublistRow:getSublistItem,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(rewardList),UrlUtil.bindLinkExportButton(filterBox),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton()}function handleFilterChange(){const a=filterBox.getValues();list.filter(function(b){const c=rewardList[$(b.elm).attr(FLTR_ID)];return filterBox.toDisplay(a,c.source,c.type)}),FilterBox.selectFirstVisible(rewardList)}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
				<span class="name col-12 px-0">${a.name}</span>
				<span class="id hidden">${b}</span>
			</a>
		</li>
	`}function loadHash(a){Renderer.get().setFirstSection(!0);const b=$("#pagecontent").empty(),c=rewardList[a];b.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(c)}
		<tr id="text"><td class="divider" colspan="6"><div></div></td></tr>
		${Renderer.reward.getRenderedString(c)}
		${Renderer.utils.getPageTr(c)}
		${Renderer.utils.getBorderTr()}
	`),ListUtil.updateSelected()}function loadSubHash(a){a=filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a)}
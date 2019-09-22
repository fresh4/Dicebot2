"use strict";const JSON_URL="data/variantrules.json";window.onload=async function(){await ExcludeUtil.pInitialise(),SortUtil.initHandleFilterButtonClicks(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};const entryRenderer=Renderer.get();let list;const sourceFilter=getSourceFilter();let filterBox;async function onJsonLoad(a){list=ListUtil.search({valueNames:["name","source","search"],listClass:"variantRules"}),filterBox=await pInitFilterBox({filters:[sourceFilter]});const b=$(`.lst__wrp-search-visible`);list.on("updated",()=>{b.html(`${list.visibleItems.length}/${list.items.length}`)}),$(filterBox).on(FilterBox.EVNT_VALCHANGE,handleFilterChange);ListUtil.initSublist({valueNames:["name","id"],listClass:"subVariantRules",getSublistRow:getSublistItem});ListUtil.initGenericPinnable(),addVariantRules(a),BrewUtil.pAddBrewData().then(handleBrew).then(()=>BrewUtil.bind({list})).then(()=>BrewUtil.pAddLocalBrewData()).catch(BrewUtil.pPurgeBrew).then(async()=>{BrewUtil.makeBrewButton("manage-brew"),BrewUtil.bind({filterBox,sourceFilter}),await ListUtil.pLoadState(),ListUtil.addListShowHide(),History.init(!0),ExcludeUtil.checkShowAllExcluded(rulesList,$(`#pagecontent`))})}function handleBrew(a){return addVariantRules(a),Promise.resolve()}let rulesList=[],rlI=0;function addVariantRules(a){if(!a.variantrule||!a.variantrule.length)return;rulesList=rulesList.concat(a.variantrule);let b="";for(;rlI<rulesList.length;rlI++){const a=rulesList[rlI];if(ExcludeUtil.isExcluded(a.name,"variantrule",a.source))continue;const c=[];for(const b of a.entries)Renderer.getNames(c,b);b+=`
			<li class="row" ${FLTR_ID}="${rlI}" onclick="ListUtil.toggleSelected(event, this)">
				<a id="${rlI}" href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="name col-10 pl-0">${a.name}</span>
					<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
					<span class="search hidden">${c.join(",")}</span>
				</a>
			</li>`,sourceFilter.addItem(a.source)}const c=ListUtil.getSearchTermAndReset(list);$("ul.variantRules").append(b),list.reIndex(),c&&list.search(c),list.sort("name"),filterBox.render(),handleFilterChange(),ListUtil.setOptions({itemList:rulesList,getSublistRow:getSublistItem,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(rulesList),UrlUtil.bindLinkExportButton(filterBox),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton()}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
				<span class="name col-12 px-0">${a.name}</span>
				<span class="id hidden">${b}</span>
			</a>
		</li>
	`}function handleFilterChange(){const a=filterBox.getValues();list.filter(function(b){const c=rulesList[$(b.elm).attr(FLTR_ID)];return filterBox.toDisplay(a,c.source)}),FilterBox.selectFirstVisible(rulesList)}function loadHash(a){const b=rulesList[a];entryRenderer.setFirstSection(!0);const c=[];entryRenderer.resetHeaderIndex(),entryRenderer.recursiveRender(b,c),$("#pagecontent").html(`
		${Renderer.utils.getBorderTr()}
		<tr class="text"><td colspan="6">${c.join("")}</td></tr>
		${Renderer.utils.getPageTr(b)}
		${Renderer.utils.getBorderTr()}
	`),loadSubHash([]),ListUtil.updateSelected()}function loadSubHash(a){if(a.length){a=filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a);const b=$(`.rd__h[data-title-index="${a[0]}"]`);b.length&&b[0].scrollIntoView()}}
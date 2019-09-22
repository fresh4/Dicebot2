"use strict";const GEN_JSON_URL="data/generated/gendata-tables.json",JSON_URL="data/tables.json",renderer=Renderer.get();window.onload=function(){ExcludeUtil.pInitialise(),SortUtil.initHandleFilterButtonClicks(),Promise.all([GEN_JSON_URL,JSON_URL].map(a=>DataUtil.loadJSON(a))).then(a=>{const b={};a.forEach(a=>{Object.entries(a).forEach(([a,c])=>{if(b[a]&&b[a]instanceof Array&&c instanceof Array)b[a]=b[a].concat(c);else if(null==b[a])b[a]=c;else throw new Error(`Could not merge keys for key "${a}"`)})}),onJsonLoad(b)})};const sourceFilter=getSourceFilter();let filterBox,list;async function onJsonLoad(a){list=ListUtil.search({valueNames:["name","source","sort-name"],listClass:"tablesdata"}),filterBox=await pInitFilterBox({filters:[sourceFilter]});const b=$(`.lst__wrp-search-visible`);list.on("updated",()=>{b.html(`${list.visibleItems.length}/${list.items.length}`)}),$(filterBox).on(FilterBox.EVNT_VALCHANGE,handleFilterChange);ListUtil.initSublist({valueNames:["name","id"],listClass:"subtablesdata",getSublistRow:getSublistItem});ListUtil.initGenericPinnable(),addTables(a),BrewUtil.pAddBrewData().then(handleBrew).then(()=>BrewUtil.bind({list})).then(()=>BrewUtil.pAddLocalBrewData()).catch(BrewUtil.pPurgeBrew).then(async()=>{BrewUtil.makeBrewButton("manage-brew"),BrewUtil.bind({filterBox,sourceFilter}),await ListUtil.pLoadState(),RollerUtil.addListRollButton(),ListUtil.addListShowHide(),History.init(!0)})}function handleBrew(a){return addTables(a),Promise.resolve()}let tableList=[],cdI=0;function addTables(a){if((!a.table||!a.table.length)&&(!a.tableGroup||!a.tableGroup.length))return;a.table&&a.table.forEach(a=>a._type="t"),a.tableGroup&&a.tableGroup.forEach(a=>a._type="g"),a.table&&a.table.length&&(tableList=tableList.concat(a.table)),a.tableGroup&&a.tableGroup.length&&(tableList=tableList.concat(a.tableGroup));const b=$("ul.tablesdata");let c="";for(;cdI<tableList.length;cdI++){const a=tableList[cdI],b=a.name.replace(/^([\d,.]+)gp/,(...a)=>a[1].replace(Parser._numberCleanRegexp,"").padStart(9,"0"));c+=`
			<li class="row" ${FLTR_ID}="${cdI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${cdI}" href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="name col-10 pl-0">${a.name}</span>
					<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
					<span class="hidden sort-name">${b}</span>
				</a>
			</li>`,sourceFilter.addItem(a.source)}const d=ListUtil.getSearchTermAndReset(list);b.append(c),list.reIndex(),d&&list.search(d),list.sort("sort-name"),filterBox.render(),handleFilterChange(),ListUtil.setOptions({itemList:tableList,getSublistRow:getSublistItem,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(tableList),UrlUtil.bindLinkExportButton(filterBox),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton()}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}">
				<span class="name col-12 px-0">${a.name}</span>		
				<span class="id hidden">${b}</span>				
			</a>
		</li>
	`}function handleFilterChange(){const a=filterBox.getValues();list.filter(function(b){const c=tableList[$(b.elm).attr(FLTR_ID)];return filterBox.toDisplay(a,c.source)}),FilterBox.selectFirstVisible(tableList)}function loadHash(a){renderer.setFirstSection(!0);const b=$("#pagecontent").empty(),c=tableList[a];b.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(c)}
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		${Renderer.table.getCompactRenderedString(c)}
		${c.chapter?`<tr class="text"><td colspan="6">
		${Renderer.get().render(`{@note ${"t"===c._type?`This table`:"These tables"} can be found in ${Parser.sourceJsonToFull(c.source)}${Parser.bookOrdinalToAbv(c.chapter.ordinal,!0)}, {@book ${c.chapter.name}|${c.source}|${c.chapter.index}|${c.chapter.name}}.}`)}
		</td></tr>`:""}
		${Renderer.utils.getPageTr(c)}
		${Renderer.utils.getBorderTr()}
	`),ListUtil.updateSelected()}function loadSubHash(a){a=filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a)}
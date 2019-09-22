"use strict";const STR_REPRINTED="reprinted";window.onload=async function(){await ExcludeUtil.pInitialise(),SortUtil.initHandleFilterButtonClicks(),DataUtil.deity.loadJSON().then(onJsonLoad)};let list;const sourceFilter=getSourceFilter(),pantheonFilter=new Filter({header:"Pantheon",items:["Celtic","Dawn War","Dragonlance","Drow","Dwarven","Eberron","Egyptian","Elven","Faer\xFBnian","Forgotten Realms","Gnomish","Greek","Greyhawk","Halfling","Nonhuman","Norse","Orc"]}),categoryFilter=new Filter({header:"Category",items:[STR_NONE,"Other Faiths of Eberron","The Dark Six","The Gods of Evil","The Gods of Good","The Gods of Neutrality","The Sovereign Host"],itemSortFn:null});function unpackAlignment(a){if(a.alignment.sort(SortUtil.alignmentSort),2===a.alignment.length&&a.alignment.includes("N")){const b=[...a.alignment];return"N"===b[0]?b[0]="NX":b[1]="NY",b}return MiscUtil.copy(a.alignment)}let filterBox;async function onJsonLoad(a){list=ListUtil.search({valueNames:["name","pantheon","alignment","domains","symbol","source","uniqueid"],listClass:"deities",sortFunction:SortUtil.listSort});const b=new Filter({header:"Alignment",items:["L","NX","C","G","NY","E","N"],displayFn:Parser.alignmentAbvToFull,itemSortFn:null}),c=new Filter({header:"Domain",items:["Arcana","Death","Forge","Grave","Knowledge","Life","Light","Nature",STR_NONE,"Order","Tempest","Trickery","War"]}),d=new Filter({header:"Miscellaneous",items:[STR_REPRINTED],displayFn:StrUtil.uppercaseFirst,deselFn:a=>a===STR_REPRINTED});filterBox=await pInitFilterBox({filters:[sourceFilter,b,pantheonFilter,categoryFilter,c,d]});const e=$(`.lst__wrp-search-visible`);list.on("updated",()=>{e.html(`${list.visibleItems.length}/${list.items.length}`)}),$(filterBox).on(FilterBox.EVNT_VALCHANGE,handleFilterChange);ListUtil.initSublist({valueNames:["name","pantheon","alignment","domains","id"],listClass:"subdeities",getSublistRow:getSublistItem});ListUtil.initGenericPinnable(),addDeities(a),BrewUtil.pAddBrewData().then(handleBrew).then(()=>BrewUtil.bind({list})).then(()=>BrewUtil.pAddLocalBrewData()).catch(BrewUtil.pPurgeBrew).then(async()=>{BrewUtil.makeBrewButton("manage-brew"),BrewUtil.bind({filterBox,sourceFilter}),await ListUtil.pLoadState(),RollerUtil.addListRollButton(),ListUtil.addListShowHide(),History.init(!0),ExcludeUtil.checkShowAllExcluded(deitiesList,$(`#pagecontent`))})}function handleBrew(a){return addDeities(a),Promise.resolve()}let deitiesList=[],dtI=0;function addDeities(a){if(!a.deity||!a.deity.length)return;deitiesList=deitiesList.concat(a.deity);let b="";for(;dtI<deitiesList.length;dtI++){const a=deitiesList[dtI];ExcludeUtil.isExcluded(a.name,"deity",a.source)||(a._fAlign=unpackAlignment(a),!a.category&&(a.category=STR_NONE),!a.domains&&(a.domains=[STR_NONE]),a.domains.sort(SortUtil.ascSort),a._fReprinted=a.reprinted?STR_REPRINTED:"",b+=`
			<li class="row" ${FLTR_ID}="${dtI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${dtI}" href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="name col-3 pl-0">${a.name}</span>
					<span class="pantheon col-2 text-center">${a.pantheon}</span>
					<span class="alignment col-2 text-center">${a.alignment.join("")}</span>
					<span class="domains col-3 ${a.domains[0]===STR_NONE?`list-entry-none`:""}">${a.domains.join(", ")}</span>
					<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
					
					<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:dtI}</span>
				</a>
			</li>
		`,sourceFilter.addItem(a.source),pantheonFilter.addItem(a.pantheon),categoryFilter.addItem(a.category))}const c=ListUtil.getSearchTermAndReset(list);$(`#deitiesList`).append(b),list.reIndex(),c&&list.search(c),list.sort("name"),filterBox.render(),handleFilterChange(),ListUtil.setOptions({itemList:deitiesList,getSublistRow:getSublistItem,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(deitiesList),UrlUtil.bindLinkExportButton(filterBox),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton()}function handleFilterChange(){const a=filterBox.getValues();list.filter(function(b){const c=deitiesList[$(b.elm).attr(FLTR_ID)];return filterBox.toDisplay(a,c.source,c._fAlign,c.pantheon,c.category,c.domains,c._fReprinted)}),FilterBox.selectFirstVisible(deitiesList)}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
				<span class="name col-4 pl-0">${a.name}</span>
				<span class="pantheon col-2">${a.pantheon}</span>
				<span class="alignment col-2">${a.alignment.join("")}</span>
				<span class="domains col-4 ${a.domains[0]===STR_NONE?`list-entry-none`:""} pr-0">${a.domains.join(", ")}</span>
				<span class="id hidden">${b}</span>
			</a>
		</li>
	`}const renderer=Renderer.get();function loadHash(a){function b(a,b){const c=[];return a.entries&&renderer.recursiveRender({entries:a.entries},c),`
		${b?`
			<tr><td colspan="6">
			<i class="text-muted">
			${1===b?`This deity is a reprint.`:""} The version below was printed in an older publication (${Parser.sourceJsonToFull(a.source)}${0<a.page?`, page ${a.page}`:""}).
			</i>
			</td></tr>
		`:""}

		${Renderer.deity.getOrderedParts(a,`<tr><td colspan="6">`,`</td></tr>`)}
		
		${a.symbolImg?`<tr><td colspan="6">${renderer.render({entries:[a.symbolImg]})}</td></tr>`:""}
		${c.length?`<tr class="text"><td colspan="6">${c.join("")}</td></tr>`:""}
		`}renderer.setFirstSection(!0);const c=deitiesList[a],d=$(`#pagecontent`).empty();d.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(c,{suffix:c.title?`, ${c.title.toTitleCase()}`:""})}
		${b(c)}
		${c.reprinted?`<tr class="text"><td colspan="6"><i class="text-muted">Note: this deity has been reprinted in a newer publication.</i></td></tr>`:""}
		${Renderer.utils.getPageTr(c)}
		${c.previousVersions?`
		${Renderer.utils.getDividerTr()}
		${c.previousVersions.map((a,c)=>b(a,c+1)).join(Renderer.utils.getDividerTr())}
		`:""}
		${Renderer.utils.getBorderTr()}
	`),ListUtil.updateSelected()}function loadSubHash(a){a=filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a)}
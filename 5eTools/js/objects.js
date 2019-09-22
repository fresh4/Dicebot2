"use strict";const JSON_URL="data/objects.json";function imgError(a){a&&$(a).parent().remove(),$(`.rnd-name`).find(`span.stats-source`).css("margin-right","0")}function handleStatblockScroll(a,b){$(`#token_image`).toggle(32>b.scrollTop).css({opacity:(32-b.scrollTop)/32,top:-b.scrollTop})}window.onload=async function(){await ExcludeUtil.pInitialise(),SortUtil.initHandleFilterButtonClicks(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};let list;function onJsonLoad(a){list=ListUtil.search({valueNames:["name","size","source","uniqueid"],listClass:"objects",sortFunction:SortUtil.listSort}),Renderer.hover.bindPopoutButton(objectsList);ListUtil.initSublist({valueNames:["name","size","id"],listClass:"subobjects",itemList:objectsList,getSublistRow:getSublistItem,primaryLists:[list]});ListUtil.initGenericPinnable(),addObjects(a),BrewUtil.pAddBrewData().then(handleBrew).then(()=>BrewUtil.bind({list})).then(()=>BrewUtil.pAddLocalBrewData()).catch(BrewUtil.pPurgeBrew).then(async()=>{BrewUtil.makeBrewButton("manage-brew"),BrewUtil.bind({list}),await ListUtil.pLoadState(),ListUtil.addListShowHide(),History.init(!0),ExcludeUtil.checkShowAllExcluded(objectsList,$(`#pagecontent`))})}function handleBrew(a){return addObjects(a),Promise.resolve()}let objectsList=[],obI=0;function addObjects(a){if(!a.object||!a.object.length)return;objectsList=objectsList.concat(a.object);let b="";for(;obI<objectsList.length;obI++){const a=objectsList[obI];ExcludeUtil.isExcluded(a.name,"object",a.source)||(b+=`
			<li class="row" ${FLTR_ID}="${obI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${obI}" href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
					<span class="name col-8 pl-0">${a.name}</span>
					<span class="size col-2">${Parser.sizeAbvToFull(a.size)}</span>
					<span class="source col-2 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
					
					<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:obI}</span>
				</a>
			</li>
		`)}const c=ListUtil.getSearchTermAndReset(list);$(`#objectsList`).append(b),list.reIndex(),c&&list.search(c),list.sort("name"),ListUtil.setOptions({itemList:objectsList,getSublistRow:getSublistItem,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(objectsList),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton()}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
				<span class="name col-9 pl-0">${a.name}</span>
				<span class="ability col-3 pr-0">${Parser.sizeAbvToFull(a.size)}</span>
				<span class="id hidden">${b}</span>
			</a>
		</li>
	`}const renderer=Renderer.get();function loadHash(a){renderer.setFirstSection(!0);const b=objectsList[a],c=[];b.entries&&renderer.recursiveRender({entries:b.entries},c,{depth:2}),b.actionEntries&&renderer.recursiveRender({entries:b.actionEntries},c,{depth:2});const d=$(`#pagecontent`).empty();d.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(b)}
		<tr class="text"><td colspan="6"><i>${"GEN"===b.type?`Variable size object`:`${Parser.sizeAbvToFull(b.size)} object`}</i><br></td></tr>
		<tr class="text"><td colspan="6">
			<b>Armor Class:</b> ${b.ac}<br>
			<b>Hit Points:</b> ${b.hp}<br>
			<b>Damage Immunities:</b> ${b.immune}<br>
			${b.resist?`<b>Damage Resistances:</b> ${b.resist}<br>`:""}
			${b.vulnerable?`<b>Damage Vulnerabilities:</b> ${b.vulnerable}<br>`:""}
		</td></tr>
		<tr class="text"><td colspan="6">${c.join("")}</td></tr>
		${Renderer.utils.getPageTr(b)}
		${Renderer.utils.getBorderTr()}
	`);const e=$(`#float-token`).empty();if(b.tokenUrl||!b.uniqueId){const a=b.tokenUrl||UrlUtil.link(`img/objects/${b.name.replace(/"/g,"")}.png`);e.append(`
			<a href="${a}" target="_blank" rel="noopener">
				<img src="${a}" id="token_image" class="token" onerror="imgError(this)" alt="${b.name}">
			</a>`)}else imgError();ListUtil.updateSelected()}function loadSubHash(a){ListUtil.setFromSubHashes(a)}
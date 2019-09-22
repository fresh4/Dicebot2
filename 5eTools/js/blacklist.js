"use strict";class Blacklist{static getDisplayCategory(a){return"variantrule"===a?"Variant Rule":"optionalfeature"===a?"Optional Feature":"variant"===a?"Magic Item Variant":a.uppercaseFirst()}static getDisplayValues(a,b){const c="*"===b?b:Parser.sourceJsonToFullCompactPrefix(b),d="*"===a?a:Blacklist.getDisplayCategory(a);return{displaySource:c,displayCategory:d}}static _renderList(){ExcludeUtil.getList().sort((c,a)=>SortUtil.ascSort(c.source,a.source)||SortUtil.ascSort(c.category,a.category)||SortUtil.ascSort(c.name,a.name)).forEach(({name:a,category:b,source:c})=>Blacklist._addListItem(a,b,c))}static async pInitialise(){function a(a){Object.keys(a).filter(a=>!Blacklist.IGNORED_CATEGORIES.has(a)).forEach(b=>f[b]?f[b]=f[b].concat(a[b]):f[b]=a[b])}function b(){function a(a,b){const c="subclass"===b?a.map(a=>({name:a.name,source:a.source,class:a.class})).sort((c,a)=>SortUtil.ascSort(c.class,a.class)||SortUtil.ascSort(c.name,a.name)||SortUtil.ascSort(c.source,a.source)):a.map(({name:a,source:b})=>({name:a,source:b})).sort((c,a)=>SortUtil.ascSort(c.name,a.name)||SortUtil.ascSort(c.source,a.source)),d=new Set;let f="";c.forEach((a,e)=>{f+=`<option value="${a.name}|${a.source}">${"subclass"===b?`${a.class}: `:""}${a.name}${d.has(a.name)||c[e+1]&&c[e+1].name===a.name?` (${Parser.sourceJsonToAbv(a.source)})`:""}</option>`,d.add(a.name)}),e.append(f)}const b=d.val();if(e.empty(),e.append(`<option value="*">*</option>`),"*"!==b){const d=c.val();"*"===d?a(f[b],b):a(f[b].filter(a=>a.source===d),b)}}Blacklist._list=new List("listcontainer",{valueNames:["id","source","category","name"],listClass:"blacklist",item:`<li class="row no-click"><span class="id hidden"></span><span class="source col-3"></span><span class="category col-3"></span><span class="name col-3"></span><span class="actions col-3 text-center"></span></li>`}),Blacklist._listId=1,ListUtil.bindEscapeKey(Blacklist._list,$(`#search`));const c=$(`#bl-source`),d=$(`#bl-category`),e=$(`#bl-name`),f={},g=await DataUtil.loadJSON(`data/bestiary/index.json`),h=await Promise.all(Object.values(g).map(a=>DataUtil.loadJSON(`data/bestiary/${a}`)));h.forEach(b=>a(b));const i=await DataUtil.loadJSON(`data/spells/index.json`),j=await Promise.all(Object.values(i).map(a=>DataUtil.loadJSON(`data/spells/${a}`)));j.forEach(b=>a(b));const k=await DataUtil.class.loadJSON();k.class.forEach(a=>(a.subclasses||[]).forEach(b=>b.class=a.name)),k.subclass=k.subclass||[],k.class.forEach(a=>k.subclass=k.subclass.concat(a.subclasses||[])),a(k);const l=["backgrounds.json","cultsboons.json","deities.json","feats.json","magicvariants.json","optionalfeatures.json","objects.json","psionics.json","races.json","rewards.json","trapshazards.json","variantrules.json"].map(a=>DataUtil.loadJSON(`data/${a}`));l.push(async()=>({item:await Renderer.items.pBuildList({isAddGroups:!0})}));const m=await Promise.all(l);m.forEach(b=>{b.race&&(b.race=Renderer.race.mergeSubraces(b.race)),b.variant&&b.variant.forEach(a=>a.source=a.source||a.inherits.source),a(b)});const n=new Set,o=new Set;Object.keys(f).forEach(a=>{o.add(a);const b=f[a];b.forEach(a=>n.has(a.source)||n.add(a.source))}),[...n].sort((c,a)=>SortUtil.ascSort(Parser.sourceJsonToFull(c),Parser.sourceJsonToFull(a))).forEach(a=>c.append(`<option value="${a}">${Parser.sourceJsonToFull(a)}</option>`)),[...o].sort((c,a)=>SortUtil.ascSort(Blacklist.getDisplayCategory(c),Blacklist.getDisplayCategory(a))).forEach(a=>d.append(`<option value="${a}">${Blacklist.getDisplayCategory(a)}</option>`)),c.change(b),d.change(b),Blacklist._renderList();const p=$(`#main_content`);p.find(`.loading`).prop("disabled",!1),p.find(`.loading-temp`).remove()}static _addListItem(a,b,c){const d=Blacklist.getDisplayValues(b,c),e=Blacklist._list.add([{id:Blacklist._listId++,name:a,category:d.displayCategory,source:d.displaySource}]);$(`<button class="btn btn-xs btn-danger m-1">Remove</button>`).click(()=>{Blacklist.pRemove(a,b,c)}).appendTo($(e[0].elm).find(`.actions`))}static async add(){const a=$(`#bl-source`),b=$(`#bl-category`),c=$(`#bl-name`),d=a.val(),e=b.val(),f=c.val().split("|")[0];"*"===d&&"*"===e&&"*"===f&&!window.confirm("This will exclude all content from all list pages. Are you sure?")||(await ExcludeUtil.pAddExclude(f,e,d))&&Blacklist._addListItem(f,e,d)}static addAllUa(){$(`#bl-source`).find(`option`).each(async(a,b)=>{const c=$(b).val();"*"===c||!SourceUtil.isNonstandardSource(c)||(await ExcludeUtil.pAddExclude("*","*",c))&&Blacklist._addListItem("*","*",c)})}static async pRemove(a,b,c){await ExcludeUtil.pRemoveExclude(a,b,c);const d=Blacklist.getDisplayValues(b,c);Blacklist._list.items.filter(b=>b.values().name===a&&b.values().category===d.displayCategory&&b.values().source===d.displaySource).map(a=>a.values().id).forEach(a=>Blacklist._list.remove("id",a))}static export(){DataUtil.userDownload("content-blacklist",JSON.stringify({blacklist:ExcludeUtil.getList()},null,"\t"))}static import(a){function b(a,b){const c=a.target,e=new FileReader;e.onload=async()=>{const a=e.result,c=JSON.parse(a);$(".blacklist").empty(),Blacklist._list.reIndex(),b?await ExcludeUtil.pSetList(ExcludeUtil.getList().concat(c.blacklist||[])):await ExcludeUtil.pSetList(c.blacklist||[]),await BrewUtil.pDoHandleBrewJson(c,"NO_PAGE"),Blacklist._renderList(),d.remove()},e.readAsText(c.files[0])}const c=a.shiftKey,d=$(`<input type="file" accept=".json" style="position: fixed; top: -100px; left: -100px; display: none;">`).on("change",a=>{b(a,c)}).appendTo($(`body`));d.click()}static async pReset(){await ExcludeUtil.pResetExcludes(),$(".blacklist").empty(),Blacklist._list.reIndex()}}Blacklist.IGNORED_CATEGORIES=new Set(["_meta","linkedLootTables"]),window.addEventListener("load",async()=>{await ExcludeUtil.pInitialise(),Blacklist.pInitialise()});
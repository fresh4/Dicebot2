"use strict";const JSON_DIR="data/spells/",JSON_LIST_NAME="spell",META_ADD_CONC="Concentration",META_ADD_V="Verbal",META_ADD_S="Somatic",META_ADD_M="Material",META_ADD_R="Royalty",META_ADD_M_COST="Material with Cost",META_ADD_M_CONSUMED="Material is Consumed",META_ADD_MB_SIGHT="Requires Sight",META_ADD_MB_PERMANENT="Permanent Effects",META_ADD_MB_SCALING="Scaling Effects",META_ADD_MB_SUMMONS="Summons Creature",META_ADD_MB_HEAL="Healing",META_RITUAL="Ritual",META_TECHNOMAGIC="Technomagic",STR_WIZARD="Wizard",STR_FIGHTER="Fighter",STR_ROGUE="Rogue",STR_CLERIC="Cleric",STR_SORCERER="Sorcerer",STR_ELD_KNIGHT="Eldritch Knight",STR_ARC_TCKER="Arcane Trickster",STR_DIV_SOUL="Divine Soul",STR_FAV_SOUL_V2="Favored Soul v2 (UA)",STR_FAV_SOUL_V3="Favored Soul v3 (UA)",TM_ACTION="action",TM_B_ACTION="bonus",TM_REACTION="reaction",TM_ROUND="round",TM_MINS="minute",TM_HRS="hour",TO_HIDE_SINGLETON_TIMES=[TM_ACTION,TM_B_ACTION,TM_REACTION,TM_ROUND],TIME_UNITS_TO_FULL={};TIME_UNITS_TO_FULL[TM_ACTION]="Action",TIME_UNITS_TO_FULL[TM_B_ACTION]="Bonus Action",TIME_UNITS_TO_FULL[TM_REACTION]="Reaction",TIME_UNITS_TO_FULL[TM_ROUND]="Rounds",TIME_UNITS_TO_FULL[TM_MINS]="Minutes",TIME_UNITS_TO_FULL[TM_HRS]="Hours";const F_RNG_POINT="Point",F_RNG_SELF_AREA="Self (Area)",F_RNG_SELF="Self",F_RNG_TOUCH="Touch",F_RNG_SPECIAL="Special",SUBCLASS_LOOKUP={};function getFltrSpellLevelStr(a){return 0===a?Parser.spLevelToFull(a):Parser.spLevelToFull(a)+" level"}function getNormalisedTime(a){const b=a[0];let c=1,d=0;switch(b.unit){case TM_B_ACTION:d=1;break;case TM_REACTION:d=2;break;case TM_ROUND:c=6;break;case TM_MINS:c=60;break;case TM_HRS:c=3600;}return 1<a.length&&(d+=.5),c*b.number+d}const INCHES_PER_FOOT=12,FEET_PER_MILE=5280;function getNormalisedRange(a){function b(){const b=a.distance;switch(b.type){case UNT_FEET:c=INCHES_PER_FOOT,d=b.amount;break;case UNT_MILES:c=INCHES_PER_FOOT*FEET_PER_MILE,d=b.amount;break;case RNG_SELF:d=0;break;case RNG_TOUCH:d=1;break;case RNG_SIGHT:c=INCHES_PER_FOOT*FEET_PER_MILE,d=12;break;case RNG_UNLIMITED_SAME_PLANE:d=9e8;break;case RNG_UNLIMITED:d=900000001;break;default:{const a=MiscUtil.getProperty(BrewUtil.homebrewMeta,"spellDistanceUnits",b.type);if(a){const e=a.feetPerUnit;null==e?d=91e7:(c=INCHES_PER_FOOT*e,d=b.amount)}break}}}let c=1,d=0,e=0;switch(a.type){case RNG_SPECIAL:return 1e9;case RNG_POINT:b();break;case RNG_LINE:e=1,b();break;case RNG_CONE:e=2,b();break;case RNG_RADIUS:e=3,b();break;case RNG_HEMISPHERE:e=4,b();break;case RNG_SPHERE:e=5,b();break;case RNG_CYLINDER:e=6,b();break;case RNG_CUBE:e=7,b();}return c*d+e}function getRangeType(a){switch(a.type){case RNG_SPECIAL:return F_RNG_SPECIAL;case RNG_POINT:switch(a.distance.type){case RNG_SELF:return F_RNG_SELF;case RNG_TOUCH:return F_RNG_TOUCH;default:return F_RNG_POINT;}case RNG_LINE:case RNG_CONE:case RNG_RADIUS:case RNG_HEMISPHERE:case RNG_SPHERE:case RNG_CYLINDER:case RNG_CUBE:return F_RNG_SELF_AREA;}}function getTblTimeStr(a){return 1===a.number&&TO_HIDE_SINGLETON_TIMES.includes(a.unit)?`${a.unit.uppercaseFirst()}${a.unit===TM_B_ACTION?" acn.":""}`:`${a.number} ${a.unit===TM_B_ACTION?"Bonus acn.":a.unit}${1<a.number?"s":""}`.uppercaseFirst()}function getTimeDisplay(a){return TIME_UNITS_TO_FULL[a]}function getClassFilterStr(a){const b=a.name.split("(")[0].trim();return`${b}${a.source===SRC_PHB?"":` (${Parser.sourceJsonToAbv(a.source)})`}`}function getMetaFilterObj(a){const b=[];return a.meta&&a.meta.ritual&&b.push(META_RITUAL),a.meta&&a.meta.technomagic&&b.push(META_TECHNOMAGIC),a.duration.filter(a=>a.concentration).length?(b.push(META_ADD_CONC),a._isConc=!0):a._isConc=!1,a.components&&a.components.v&&b.push(META_ADD_V),a.components&&a.components.s&&b.push(META_ADD_S),a.components&&a.components.m&&b.push(META_ADD_M),a.components&&a.components.r&&b.push(META_ADD_R),a.components&&a.components.m&&a.components.m.cost&&b.push(META_ADD_M_COST),a.components&&a.components.m&&a.components.m.consume&&b.push(META_ADD_M_CONSUMED),(a.miscTags&&a.miscTags.includes("PRM")||a.duration.filter(a=>"permanent"===a.type).length)&&b.push(META_ADD_MB_PERMANENT),(a.miscTags&&a.miscTags.includes("SCL")||a.entriesHigherLevel)&&b.push(META_ADD_MB_SCALING),a.miscTags&&a.miscTags.includes("HL")&&b.push(META_ADD_MB_HEAL),a.miscTags&&a.miscTags.includes("SMN")&&b.push(META_ADD_MB_SUMMONS),a.miscTags&&a.miscTags.includes("SGT")&&b.push(META_ADD_MB_SIGHT),b}function getFilterAbilitySave(a){return`${a.uppercaseFirst().substring(0,3)}. Save`}function getFilterAbilityCheck(a){return`${a.uppercaseFirst().substring(0,3)}. Check`}function handleBrew(a){return a.class&&a.class.filter(a=>a.subclasses).forEach(a=>{(SUBCLASS_LOOKUP[a.source]=SUBCLASS_LOOKUP[a.source]||{})[a.name]=SUBCLASS_LOOKUP[a.source][a.name]||{};const b=SUBCLASS_LOOKUP[a.source][a.name];a.subclasses.forEach(a=>{(b[a.source]=b[a.source]||{})[a.shortName||a.name]=b[a.source][a.shortName||a.name]||a.name})}),a.subclass&&a.subclass.forEach(a=>{const b=a.classSource||SRC_PHB;(SUBCLASS_LOOKUP[b]=SUBCLASS_LOOKUP[b]||{})[a.class]=SUBCLASS_LOOKUP[b][a.class]||{};const c=SUBCLASS_LOOKUP[b][a.class];(c[a.source]=c[a.source]||{})[a.shortName||a.name]=c[a.source][a.shortName||a.name]||a.name}),addSpells(a.spell),Promise.resolve()}function pPostLoad(){return new Promise(a=>{BrewUtil.pAddBrewData().then(handleBrew).then(()=>BrewUtil.bind({list})).then(()=>BrewUtil.pAddLocalBrewData()).catch(BrewUtil.pPurgeBrew).then(async()=>{BrewUtil.makeBrewButton("manage-brew"),BrewUtil.bind({filterBox,sourceFilter}),await ListUtil.pLoadState(),ListUtil.bindShowTableButton("btn-show-table","Spells",spellList,{name:{name:"Name",transform:!0},source:{name:"Source",transform:a=>`<span class="${Parser.sourceJsonToColor(a)}" title="${Parser.sourceJsonToFull(a)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a)}</span>`},level:{name:"Level",transform:a=>Parser.spLevelToFull(a)},time:{name:"Casting Time",transform:a=>getTblTimeStr(a[0])},_school:{name:"School",transform:a=>`<span class="school_${a.school}">${Parser.spSchoolAndSubschoolsAbvsToFull(a.school,a.subschools)}</span>`},range:{name:"Range",transform:a=>Parser.spRangeToFull(a)},_components:{name:"Components",transform:a=>Parser.spComponentsToFull(a)},classes:{name:"Classes",transform:a=>Parser.spMainClassesToFull(a)},entries:{name:"Text",transform:a=>Renderer.get().render({type:"entries",entries:a},1),flex:3},entriesHigherLevel:{name:"At Higher Levels",transform:a=>Renderer.get().render({type:"entries",entries:a||[]},1),flex:2}},{generator:ListUtil.basicFilterGenerator},(c,a)=>SortUtil.ascSort(c.name,a.name)||SortUtil.ascSort(c.source,a.source)),a()})})}window.onload=async function(){let a;[filterBox,a]=await Promise.all([pInitFilterBox({filters:[sourceFilter,levelFilter,classAndSubclassFilter,raceFilter,backgroundFilter,metaFilter,schoolFilter,subSchoolFilter,damageFilter,conditionFilter,spellAttackFilter,saveFilter,checkFilter,timeFilter,durationFilter,rangeFilter,areaTypeFilter]}),DataUtil.loadJSON(`data/generated/gendata-subclass-lookup.json`),ExcludeUtil.pInitialise()]),Object.assign(SUBCLASS_LOOKUP,a),SortUtil.initHandleFilterButtonClicks(),multisourceLoad(JSON_DIR,JSON_LIST_NAME,pPageInit,addSpells,pPostLoad).then(()=>{null==History.lastLoadedId&&History._freshLoad(),ExcludeUtil.checkShowAllExcluded(spellList,$(`#pagecontent`))})};let list,spellBookView,brewSpellClasses;const sourceFilter=getSourceFilter(),levelFilter=new Filter({header:"Level",items:[0,1,2,3,4,5,6,7,8,9],displayFn:getFltrSpellLevelStr}),classFilter=new Filter({header:"Class"}),subclassFilter=new Filter({header:"Subclass",nests:{},groupFn:a=>SourceUtil.hasBeenReprinted(a.userData.subClass.name,a.userData.subClass.source)||Parser.sourceJsonToFull(a.userData.subClass.source).startsWith(UA_PREFIX)||Parser.sourceJsonToFull(a.userData.subClass.source).startsWith(PS_PREFIX)}),classAndSubclassFilter=new MultiFilter({header:"Classes",filters:[classFilter,subclassFilter]}),raceFilter=new Filter({header:"Race"}),backgroundFilter=new Filter({header:"Background"}),metaFilter=new Filter({header:"Components & Miscellaneous",items:[META_ADD_CONC,META_ADD_V,META_ADD_S,META_ADD_M,META_ADD_M_COST,META_ADD_M_CONSUMED,META_ADD_MB_HEAL,META_ADD_MB_SIGHT,META_ADD_MB_PERMANENT,META_ADD_MB_SCALING,META_ADD_MB_SUMMONS,META_RITUAL,META_TECHNOMAGIC],itemSortFn:null}),schoolFilter=new Filter({header:"School",items:[SKL_ABV_ABJ,SKL_ABV_CON,SKL_ABV_DIV,SKL_ABV_ENC,SKL_ABV_EVO,SKL_ABV_ILL,SKL_ABV_NEC,SKL_ABV_TRA],displayFn:Parser.spSchoolAbvToFull}),subSchoolFilter=new Filter({header:"Subschool",items:[],displayFn:Parser.spSchoolAbvToFull}),damageFilter=new Filter({header:"Damage Type",items:["acid","bludgeoning","cold","fire","force","lightning","necrotic","piercing","poison","psychic","radiant","slashing","thunder"],displayFn:StrUtil.uppercaseFirst}),conditionFilter=new Filter({header:"Conditions Inflicted",items:["blinded","charmed","deafened","exhaustion","frightened","grappled","incapacitated","invisible","paralyzed","petrified","poisoned","prone","restrained","stunned","unconscious"],displayFn:StrUtil.uppercaseFirst}),spellAttackFilter=new Filter({header:"Spell Attack",items:["M","R","O"],displayFn:Parser.spAttackTypeToFull,itemSortFn:null}),saveFilter=new Filter({header:"Saving Throw",items:["strength","dexterity","constitution","intelligence","wisdom","charisma"],displayFn:getFilterAbilitySave,itemSortFn:null}),checkFilter=new Filter({header:"Opposed Ability Check",items:["strength","dexterity","constitution","intelligence","wisdom","charisma"],displayFn:getFilterAbilityCheck,itemSortFn:null}),timeFilter=new Filter({header:"Cast Time",items:[TM_ACTION,TM_B_ACTION,TM_REACTION,TM_ROUND,TM_MINS,TM_HRS],displayFn:getTimeDisplay,itemSortFn:null}),durationFilter=new Filter({header:"Duration",items:["instant","timed","permanent","special"],displayFn:StrUtil.uppercaseFirst,itemSortFn:null}),rangeFilter=new Filter({header:"Range",items:[F_RNG_SELF,F_RNG_TOUCH,"Point",F_RNG_SELF_AREA,F_RNG_SPECIAL],itemSortFn:null}),areaTypeFilter=new Filter({header:"Area Style",items:["ST","MT","R","N","C","Y","H","L","S","Q","W"],displayFn:Parser.spAreaTypeToFull,itemSortFn:null});let filterBox;function pPageInit(a){Object.keys(a).map(a=>new FilterItem({item:a,changeFn:loadSource(JSON_LIST_NAME,addSpells)})).forEach(a=>sourceFilter.addItem(a)),list=ListUtil.search({valueNames:["name","source","level","time","school","range","concentration","classes","uniqueid"],listClass:"spells",sortFunction:sortSpells});const b=$(`.lst__wrp-search-visible`);list.on("updated",()=>{b.html(`${list.visibleItems.length}/${list.items.length}`)}),$(filterBox).on(FilterBox.EVNT_VALCHANGE,handleFilterChange),$("#filtertools").find("button.sort").click(function(){const a=$(this);"asc"===a.attr("sortby")?a.attr("sortby","desc"):a.attr("sortby","asc"),list.sort(a.data("sort"),{order:a.attr("sortby"),sortFunction:sortSpells})});ListUtil.initSublist({valueNames:["name","level","time","school","concentration","range","id"],listClass:"subspells",sortFunction:sortSpells});return ListUtil.initGenericPinnable(),spellBookView=new BookModeView("bookview",$(`#btn-spellbook`),"If you wish to view multiple spells, please first make a list",a=>{const b=ListUtil.getSublistedIds().map(a=>spellList[a]);let c=0;const d=[],e=a=>{d.push(`<table class="spellbook-entry"><tbody>`),d.push(Renderer.spell.getCompactRenderedString(a)),d.push(`</tbody></table>`)};for(let f=0;10>f;++f){const a=b.filter(a=>a.level===f);if(a.length){const b=0==f?`${Parser.spLevelToFull(f)}s`:`${Parser.spLevelToFull(f)}-level Spells`;d.push(Renderer.utils.getBorderTr(`<span class="spacer-name">${b}</span>`)),d.push(`<tr class="spellbook-level"><td>`),a.forEach(a=>e(a)),d.push(`</td></tr>`)}c+=a.length}return b.length||null==History.lastLoadedId||(d.push(`<tr class="spellbook-level"><td>`),e(spellList[History.lastLoadedId]),d.push(`</td></tr>`)),a.append(d.join("")),c},!0),brewSpellClasses={PHB:{}},BrewUtil.pAddBrewData().then(a=>{function b(a,b=SRC_PHB,c){const d=(d,e)=>{const f="string"==typeof d?d:d.name,g="string"==typeof d?"PHB":d.source;brewSpellClasses[g]=brewSpellClasses[g]||{fromClassList:[],fromSubclass:[]},brewSpellClasses[g][f]=brewSpellClasses[g][f]||{fromClassList:[],fromSubclass:[]};const h={class:{name:a,source:b},subclass:{name:c.shortName,source:c.source}};e&&(h.subclass.subSubclass=e),brewSpellClasses[g][f].fromSubclass.push(h)};c.subclassSpells&&c.subclassSpells.forEach(a=>d(a)),c.subSubclassSpells&&$.each(c.subSubclassSpells,(a,b)=>b.forEach(b=>d(b,a)))}a.class&&a.class.forEach(a=>{a.classSpells&&a.classSpells.forEach(b=>{const c="string"==typeof b?b:b.name,d="string"==typeof b?"PHB":b.source;brewSpellClasses[d]=brewSpellClasses[d]||{},brewSpellClasses[d][c]=brewSpellClasses[d][c]||{fromClassList:[],fromSubclass:[]},brewSpellClasses[d][c].fromClassList.push({name:a.name,source:a.source})}),a.subclasses&&a.subclasses.forEach(c=>b(a.name,a.source,c))}),a.subclass&&a.subclass.forEach(a=>b(a.class,a.classSource,a))}).catch(BrewUtil.pPurgeBrew)}function getSublistItem(a,b){return`
		<li class="row" ${FLTR_ID}="${b}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(a)}" title="${a.name}">
				<span class="name col-3-2 pl-0">${a.name}</span>
				<span class="level col-1-5 text-center">${Parser.spLevelToFull(a.level)}</span>
				<span class="time col-1-8 text-center">${getTblTimeStr(a.time[0])}</span>
				<span class="school col-1-6 school_${a.school} text-center" title="${Parser.spSchoolAndSubschoolsAbvsToFull(a.school,a.subschools)}">${Parser.spSchoolAndSubschoolsAbvsShort(a.school,a.subschools)}</span>
				<span class="concentration concentration--sublist col-0-7 text-center" title="Concentration">${a._isConc?"\xD7":""}</span>
				<span class="range col-3-2 pr-0 text-right">${Parser.spRangeToFull(a.range)}</span>
				
				<span class="id hidden">${b}</span>
			</a>
		</li>
	`}function handleFilterChange(){const a=filterBox.getValues();list.filter(b=>{const c=spellList[$(b.elm).attr(FLTR_ID)];return filterBox.toDisplay(a,c._fSources,c.level,[c._fClasses,c._fSubclasses],c._fRaces,c._fBackgrounds,c._fMeta,c.school,c.subschools,c.damageInflict,c.conditionInflict,c.spellAttack,c.savingThrow,c.opposedCheck,c._fTimeType,c._fDurationType,c._fRangeType,c.areaTags)}),onFilterChangeMulti(spellList)}let spellList=[],spI=0;const _addedHashes=new Set;function addSpells(a){if(!a||!a.length)return;spellList=spellList.concat(a);const b=$("ul.spells");let c="";for(;spI<spellList.length;spI++){const a=spellList[spI],b=UrlUtil.autoEncodeHash(a);if(!a.uniqueId&&_addedHashes.has(b))continue;if(_addedHashes.add(b),ExcludeUtil.isExcluded(a.name,"spell",a.source))continue;let d=Parser.spLevelToFull(a.level);a.meta&&a.meta.ritual&&(d+=" (rit.)"),a.meta&&a.meta.technomagic&&(d+=" (tec.)"),a.classes.fromClassList&&a.classes.fromClassList.filter(a=>a.name===STR_WIZARD&&a.source===SRC_PHB).length&&(!a.classes.fromSubclass&&(a.classes.fromSubclass=[]),a.classes.fromSubclass.push({class:{name:STR_FIGHTER,source:SRC_PHB},subclass:{name:STR_ELD_KNIGHT,source:SRC_PHB}}),a.classes.fromSubclass.push({class:{name:STR_ROGUE,source:SRC_PHB},subclass:{name:STR_ARC_TCKER,source:SRC_PHB}}),4<a.level&&(a._scrollNote=!0)),a.classes.fromClassList&&a.classes.fromClassList.filter(a=>a.name===STR_CLERIC&&a.source===SRC_PHB).length&&(a.classes.fromSubclass?!a.classes.fromSubclass.find(a=>a.class.name===STR_SORCERER&&a.class.source===SRC_PHB&&a.subclass.name===STR_DIV_SOUL&&a.subclass.source===SRC_XGE)&&a.classes.fromSubclass.push({class:{name:STR_SORCERER,source:SRC_PHB},subclass:{name:STR_DIV_SOUL,source:SRC_XGE}}):(a.classes.fromSubclass=[],a.classes.fromSubclass.push({class:{name:STR_SORCERER,source:SRC_PHB},subclass:{name:STR_DIV_SOUL,source:SRC_XGE}})),a.classes.fromSubclass.push({class:{name:STR_SORCERER,source:SRC_PHB},subclass:{name:STR_FAV_SOUL_V2,source:SRC_UAS}}),a.classes.fromSubclass.push({class:{name:STR_SORCERER,source:SRC_PHB},subclass:{name:STR_FAV_SOUL_V3,source:SRC_UARSC}})),a.classes.fromClassList&&a.classes.fromClassList.find(a=>"Wizard"===a.name)&&(0===a.level&&((a.races||(a.races=[])).push({name:"Elf (High)",source:SRC_PHB,baseName:"Elf",baseSource:SRC_PHB}),(a.classes.fromSubclass=a.classes.fromSubclass||[]).push({class:{name:STR_CLERIC,source:SRC_PHB},subclass:{name:"Arcana",source:SRC_SCAG}})),6<=a.level&&(a.classes.fromSubclass=a.classes.fromSubclass||[]).push({class:{name:STR_CLERIC,source:SRC_PHB},subclass:{name:"Arcana",source:SRC_SCAG}})),a.classes.fromClassList&&a.classes.fromClassList.find(a=>"Druid"===a.name)&&0===a.level&&(a.classes.fromSubclass=a.classes.fromSubclass||[]).push({class:{name:STR_CLERIC,source:SRC_PHB},subclass:{name:"Nature",source:SRC_PHB}}),brewSpellClasses[a.source]&&brewSpellClasses[a.source][a.name]&&(a.classes=a.classes||{},brewSpellClasses[a.source][a.name].fromClassList.length&&(a.classes.fromClassList=a.classes.fromClassList||[],a.classes.fromClassList=a.classes.fromClassList.concat(brewSpellClasses[a.source][a.name].fromClassList)),brewSpellClasses[a.source][a.name].fromSubclass.length&&(a.classes.fromSubclass=a.classes.fromSubclass||[],a.classes.fromSubclass=a.classes.fromSubclass.concat(brewSpellClasses[a.source][a.name].fromSubclass))),a._normalisedTime=getNormalisedTime(a.time),a._normalisedRange=getNormalisedRange(a.range),a._fSources=ListUtil.getCompleteFilterSources(a),a._fMeta=getMetaFilterObj(a),a._fClasses=a.classes.fromClassList?a.classes.fromClassList.map(a=>getClassFilterStr(a)):[],a._fSubclasses=a.classes.fromSubclass?a.classes.fromSubclass.map(a=>new FilterItem({item:`${a.class.name}: ${getClassFilterStr(a.subclass)}`,nest:a.class.name,userData:{subClass:{name:a.subclass.name,source:a.subclass.source},className:a.class.name}})):[],a._fRaces=a.races?a.races.map(a=>a.baseName||a.name):[],a._fBackgrounds=a.backgrounds?a.backgrounds.map(a=>a.name):[],a._fTimeType=a.time.map(a=>a.unit),a._fDurationType=a.duration.map(a=>a.type),a._fRangeType=getRangeType(a.range),c+=`
			<li class="row" ${FLTR_ID}="${spI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${spI}" href="#${b}" title="${a.name}">
					<span class="name col-2-9 pl-0">${a.name}</span>
					<span class="level col-1-5 text-center">${d}</span>
					<span class="time col-1-7 text-center">${getTblTimeStr(a.time[0])}</span>
					<span class="school col-1-2 school_${a.school} text-center" title="${Parser.spSchoolAndSubschoolsAbvsToFull(a.school,a.subschools)}">${Parser.spSchoolAndSubschoolsAbvsShort(a.school,a.subschools)}</span>
					<span class="concentration col-0-6 text-center" title="Concentration">${a._isConc?"\xD7":""}</span>
					<span class="range col-2-4 text-right">${Parser.spRangeToFull(a.range)}</span>
					<span class="source col-1-7 text-center ${Parser.sourceJsonToColor(a.source)} pr-0" title="${Parser.sourceJsonToFull(a.source)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>

					<span class="classes" style="display: none">${Parser.spClassesToFull(a.classes,!0)}</span>
					<span class="uniqueid hidden">${a.uniqueId?a.uniqueId:spI}</span>
				</a>
			</li>`,9<a.level&&levelFilter.addItem(a.level),sourceFilter.addItem(a._fSources),raceFilter.addItem(a._fRaces),backgroundFilter.addItem(a._fBackgrounds),a._fClasses.forEach(a=>classFilter.addItem(a)),a._fSubclasses.forEach(a=>{subclassFilter.addNest(a.userData.className,{isHidden:!0}),subclassFilter.addItem(a)}),subSchoolFilter.addItem(a.subschools)}const d=ListUtil.getSearchTermAndReset(list);b.append(c),list.reIndex(),d&&list.search(d),list.sort("name"),filterBox.render(),handleFilterChange(),ListUtil.setOptions({itemList:spellList,getSublistRow:getSublistItem,primaryLists:[list]}),ListUtil.bindPinButton(),Renderer.hover.bindPopoutButton(spellList),UrlUtil.bindLinkExportButton(filterBox),ListUtil.bindDownloadButton(),ListUtil.bindUploadButton(sublistFuncPreload)}function sublistFuncPreload(a,b){const c=Object.keys(loadedSources).filter(a=>loadedSources[a].loaded),d=a.sources.map(a=>a.toLowerCase()),e=Object.keys(loadedSources).filter(a=>!c.includes(a)).filter(a=>d.includes(a.toLowerCase())),f=e.length;if(f){let a=0;e.forEach(c=>{loadSource(JSON_LIST_NAME,c=>{addSpells(c),++a===f&&b()})(c,"yes")})}else b()}function sortSpells(c,d,e){function f(){return SortUtil.ascSort(c.name,d.name)}function g(){return SortUtil.ascSort(c.source,d.source)}function h(){const a=f();return 0===a?g():a}function i(a,b){const e=a(c[b],d[b]);return e||h()}if(c=spellList[c.elm.getAttribute(FLTR_ID)],d=spellList[d.elm.getAttribute(FLTR_ID)],"name"===e.valueName)return h();if("source"===e.valueName){const a=SortUtil.ascSort(c.source,d.source);return 0===a?SortUtil.ascSort(c.name,d.name):a}return"level"===e.valueName?i(SortUtil.ascSort,"level"):"time"===e.valueName?i(SortUtil.ascSort,"_normalisedTime"):"school"===e.valueName?i(SortUtil.ascSort,"school"):"range"===e.valueName?i(SortUtil.ascSort,"_normalisedRange"):"concentration"===e.valueName?i(SortUtil.ascSort,"_isConc"):0}const renderer=Renderer.get();function loadHash(a){renderer.setFirstSection(!0);const b=$("#pagecontent").empty(),c=spellList[a];b.append(Renderer.spell.getRenderedString(c,renderer,SUBCLASS_LOOKUP)),loadSubHash([]),ListUtil.updateSelected()}function handleUnknownHash(a){const b=Object.keys(loadedSources).find(b=>b.toLowerCase()===decodeURIComponent(a.split(HASH_LIST_SEP)[1]).toLowerCase());b?loadSource(JSON_LIST_NAME,a=>{addSpells(a),History.hashChange()})(b,"yes"):History._freshLoad()}function loadSubHash(a){a=filterBox.setFromSubHashes(a),ListUtil.setFromSubHashes(a,sublistFuncPreload),spellBookView.handleSub(a)}
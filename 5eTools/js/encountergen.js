"use strict";const JSON_URL="data/encounters.json";let encounterList;const renderer=Renderer.get();function makeContentsBlock(a,b){let c="<ul>";return b.tables.forEach((d,e)=>{const f=getTableName(b,d);c+=`<li>
			<a id="${a},${e}" href="#${UrlUtil.encodeForHash([b.name,b.source,d.minlvl+"-"+d.maxlvl])}" title="${f}">${f}</a>
		</li>`}),c+="</ul>",c}function getTableName(a,b){return`${a.name} Encounters (Levels ${b.minlvl}\u2014${b.maxlvl})`}window.onload=function(){ExcludeUtil.pInitialise(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};let list;function onJsonLoad(a){encounterList=a.encounter;const b=$("ul.encounters");let c="";for(let b=0;b<encounterList.length;b++){const a=encounterList[b];c+=`<li>
				<span class="name" onclick="showHideList(this)" title="Source: ${Parser.sourceJsonToFull(a.source)}">${a.name}</span>
				${makeContentsBlock(b,a)}
			</li>`}b.append(c),list=ListUtil.search({valueNames:["name"],listClass:"encounters"}),History.init(!0),RollerUtil.addListRollButton()}function showHideList(a){const b=$(a);b.next(`ul`).toggle()}function loadHash(a){renderer.setFirstSection(!0);const[b,c]=a.split(",").map(a=>+a),d=encounterList[b],e=d.tables[c].table,f=getTableName(d,d.tables[c]);let g=`
		<tr>
			<td colspan="6">
				<table class="striped-odd">
					<caption>${f}</caption>
					<thead>
						<tr>
							<th class="col-2 text-center">
								<span class="roller" onclick="rollAgainstTable('${b}', '${c}')">d100</span>
							</th>
							<th class="col-10">Encounter</th>
						</tr>
					</thead>`;for(let b=0;b<e.length;b++){const a=e[b].min===e[b].max?pad(e[b].min):`${pad(e[b].min)}-${pad(e[b].max)}`;g+=`<tr><td class="text-center">${a}</td><td>${getRenderedText(e[b].result)}</td></tr>`}g+=`
				</table>
			</td>
		</tr>`,$("#pagecontent").html(g),$(list.list).find(`.list-multi-selected`).removeClass("list-multi-selected");const h=History.getSelectedListElement().parent();$(h).addClass("list-multi-selected")}function pad(a){return(a+"").padStart(2,"0")}function getRenderedText(a){if(-1!==a.indexOf("{@")){const b=[];return renderer.recursiveRender(a,b),b.join("")}return a}function rollAgainstTable(a,b){a=+a,b=+b;const c=encounterList[a],d=c.tables[b],e=d.table,f=RollerUtil.randomise(99,0);let g;for(let c=0;c<e.length;c++){const a=e[c],b=null!=a.max&&a.max<a.min?a.max:a.min,d=null!=a.max&&a.max>a.min?a.max:a.min;if(f>=b&&f<=d){g=getRenderedText(a.result);break}}g=g.replace(RollerUtil.DICE_REGEX,function(a){const b=Renderer.dice.parseRandomise2(a);return`<span class="roller" onmousedown="event.preventDefault()" onclick="reroll(this)">${a}</span> (<span class="result">${b}</span>)`}),Renderer.dice.addRoll({name:`${c.name} (${d.minlvl}-${d.maxlvl})`},`<span><strong>${pad(f)}</strong> ${g}</span>`)}function reroll(a){const b=$(a),c=Renderer.dice.parseRandomise2(b.html()),d=b.next(".result"),e=d.text().replace(/\(\)/g,"");d.html(c),JqueryUtil.showCopiedEffect(d,e,!0)}
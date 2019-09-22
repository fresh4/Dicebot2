"use strict";const JSON_URL="data/names.json";let nameList;const renderer=Renderer.get();function makeContentsBlock(a,b){let c="<ul>";return b.tables.forEach((d,e)=>{const f=getTableName(b,d);c+=`<li>
				<a id="${a},${e}" href="#${UrlUtil.encodeForHash([b.name,b.source,d.option])}" title="${f}">${f}</a>
			</li>`}),c+="</ul>",c}function getTableName(a,b){return`${a.name} - ${b.option}`}window.onload=function(){ExcludeUtil.pInitialise(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};let list;function onJsonLoad(a){nameList=a.name;const b=$("ul.names");let c="";for(let b=0;b<nameList.length;b++){const a=nameList[b];c+=`<li>
				<span class="name" onclick="showHideList(this)" title="Source: ${Parser.sourceJsonToFull(a.source)}">${a.name}</span>
				${makeContentsBlock(b,a)}
			</li>`}b.append(c),list=ListUtil.search({valueNames:["name"],listClass:"names"}),History.init(!0)}function showHideList(a){const b=$(a);b.next(`ul`).toggle()}function loadHash(a){renderer.setFirstSection(!0);const[b,c]=a.split(",").map(a=>+a),d=nameList[b],e=d.tables[c].table,f=getTableName(d,d.tables[c]),g=d.tables[c].diceType;let h=`
		<tr>
			<td colspan="6">
				<table class="striped-odd">
					<caption>${f}</caption>
					<thead>
						<tr>
							<th class="col-2 text-center">
								<span class="roller" onclick="rollAgainstTable('${b}', '${c}')">d${g}</span>
							</th>
							<th class="col-10">Name</th>
						</tr>
					</thead>`;for(let b=0;b<e.length;b++){const a=e[b].min===e[b].max?pad(e[b].min):`${pad(e[b].min)}-${pad(e[b].max)}`;h+=`<tr><td class="text-center">${a}</td><td>${getRenderedText(e[b].result)}</td></tr>`}h+=`
				</table>
			</td>
		</tr>`,$("#pagecontent").html(h),$(list.list).find(`.list-multi-selected`).removeClass("list-multi-selected");const i=History.getSelectedListElement().parent();$(i).addClass("list-multi-selected")}function pad(a){return(a+"").padStart(2,"0")}function getRenderedText(a){if(-1!==a.indexOf("{@")){const b=[];return renderer.recursiveRender(a,b),b.join("")}return a}function rollAgainstTable(a,b){a=+a,b=+b;const c=nameList[a],d=c.tables[b],e=d.table;e._rMax=null==e._rMax?Math.max(...e.filter(a=>null!=a.min).map(a=>a.min),...e.filter(a=>null!=a.max).map(a=>a.max)):e._rMax,e._rMin=null==e._rMin?Math.min(...e.filter(a=>null!=a.min).map(a=>a.min),...e.filter(a=>null!=a.max).map(a=>a.max)):e._rMin;const f=RollerUtil.randomise(e._rMax,e._rMin);let g;for(let c=0;c<e.length;c++){const a=e[c],b=null!=a.max&&a.max<a.min?a.max:a.min,d=null!=a.max&&a.max>a.min?a.max:a.min;if(f>=b&&f<=d){g=getRenderedText(a.result);break}}g=g.replace(RollerUtil.DICE_REGEX,function(a){const b=Renderer.dice.parseRandomise2(a);return`<span class="roller" onmousedown="event.preventDefault()" onclick="reroll(this)">${a}</span> (<span class="result">${b}</span>)`}),Renderer.dice.addRoll({name:`${c.name} - ${d.option}`},`<span><strong>${pad(f)}</strong> ${g}</span>`)}function reroll(a){const b=$(a),c=Renderer.dice.parseRandomise2(b.html());b.next(".result").html(c)}
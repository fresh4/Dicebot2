"use strict";const MONSTER_STATS_BY_CR_JSON_URL="data/msbcr.json",MONSTER_FEATURES_JSON_URL="data/monsterfeatures.json";let msbcr,monsterFeatures;window.onload=function(){ExcludeUtil.pInitialise(),DataUtil.loadJSON(MONSTER_STATS_BY_CR_JSON_URL).then(addMSBCR)};function addMSBCR(a){msbcr=a,DataUtil.loadJSON(MONSTER_FEATURES_JSON_URL).then(addMonsterFeatures)}function addMonsterFeatures(a){function b(a){const b=a.val();"Tiny"===b&&$("#hdval").html("d4"),"Small"===b&&$("#hdval").html("d6"),"Medium"===b&&$("#hdval").html("d8"),"Large"===b&&$("#hdval").html("d10"),"Huge"===b&&$("#hdval").html("d12"),"Gargantuan"===b&&$("#hdval").html("d20"),$("#hp").val(calculateHp())}function c(){if(window.location.hash){let a=window.location.hash.split("#")[1].split(",");$("#expectedcr").val(a[0]),$("#ac").val(a[1]),$("#dpr").val(a[2]),$("#attackbonus").val(a[3]),"true"===a[4]&&$("#saveinstead").attr("checked",!0),b($("#size").val(a[5])),$("#hd").val(a[6]),$("#con").val(a[7]),$("#hp").val(calculateHp()),"true"===a[8]&&$("#vulnerabilities").attr("checked",!0),$("#resistances").val(a[9]),"true"===a[10]&&$("#flying").attr("checked",!0),$("#saveprofs").val(a[11]),$(`.crc__mon_feature_cb`).each((a,b)=>{const c=$(b),d=c.attr("id"),e=History.getSubHash(d);e&&(c.prop("checked",!0),"true"!==e&&c.siblings("input[type=number]").val(e))})}calculateCr()}function d(a,b){const c=a.attr("id");a.prop("checked")?History.setSubhash(c,!b.length||b.val()):History.setSubhash(c,null)}monsterFeatures=a.monsterfeatures;for(let b=0;b<msbcr.cr.length;b++){const a=msbcr.cr[b];$("#msbcr").append(`<tr><td>${a._cr}</td><td>${Parser.crToXp(a._cr)}</td><td>${a.pb}</td><td>${a.ac}</td><td>${a.hpmin}-${a.hpmax}</td><td>${a.attackbonus}</td><td>${a.dprmin}-${a.dprmax}</td><td>${a.savedc}</td></tr>`)}$("#crcalc input").change(calculateCr),$("#saveprofs, #resistances").change(calculateCr),$("#saveinstead").change(function(){const a=parseInt($("#attackbonus").val());$(this).is(":checked")||$("#attackbonus").val(a-10),$(this).is(":checked")&&$("#attackbonus").val(a+10),calculateCr()}),$("select#size").change(function(){b($(this)),calculateCr()}),$("#hd, #con").change(function(){$("#hp").val(calculateHp()),calculateCr()}),$("#msbcr tr").not(":has(th)").click(function(){if(confirm("This will reset the calculator. Are you sure?")){$("#expectedcr").val($(this).children("td:eq(0)").html());const[a,b]=$(this).children("td:eq(4)").html().split("-").map(a=>parseInt(a));$("#hp").val(a+(b-a)/2),$("#hd").val(calculateHd()),$("#ac").val($(this).children("td:eq(3)").html()),$("#dpr").val($(this).children("td:eq(6)").html().split("-")[0]),$("#attackbonus").val($(this).children("td:eq(5)").html()),$("#saveinstead").is(":checked")&&$("#attackbonus").val($(this).children("td:eq(7)").html()),calculateCr()}}),$("#hp").change(function(){$("#hd").val(calculateHd()),calculateCr()});const e=$(`#monsterfeatures .crc__wrp_mon_features`);monsterFeatures.forEach(a=>{const b=[];a.hp&&b.push(`HP: ${a.hp}`),a.ac&&b.push(`AC: ${a.ac}`),a.dpr&&b.push(`DPR: ${a.dpr}`),a.attackbonus&&b.push(`AB: ${a.attackbonus}`);const c=a.numbox?`<input type="number" value="0" min="0" class="form-control form-control--minimal crc__mon_feature_num input-xs ml-2">`:"";e.append(`
			<label class="row crc__mon_feature">
				<div class="col-1 crc__mon_feature_wrp_cb">
					<input type="checkbox" id="mf-${Parser.stringToSlug(a.name)}" title="${a.name}" data-hp="${a.hp}" data-ac="${a.ac}" data-dpr="${a.dpr}" data-attackbonus="${a.attackbonus}" class="crc__mon_feature_cb">${c}
				</div>
				<div class="col-2">${a.name}</div>
				<div class="col-2">${Renderer.get().render(`{@creature ${a.example}}`)}</div>
				<div class="col-7"><span title="${b.join(", ")}" class="explanation">${a.effect}</span></div>
			</label>
		`)}),$(".crc__mon_feature_cb").change(function(){const a=$(this),b=$(this).siblings("input[type=number]");d(a,b)}),$(`.crc__mon_feature_num`).change(function(){const a=$(this),b=$(this).siblings("input[type=checkbox]");d(b,a)}),$("#monsterfeatures .crc__wrp_mon_features input").change(calculateCr),$("#crcalc_reset").click(()=>{confirm("Are you sure?")&&(()=>{window.location="",c()})()}),c()}function calculateCr(){var _Mathceil=Math.ceil,_Mathfloor=Math.floor;const expectedCr=parseInt($("#expectedcr").val());let hp=parseInt($("#crcalc #hp").val());$("#vulnerabilities").prop("checked")&&(hp*=.5),"res"===$("#resistances").val()&&(0<=expectedCr&&4>=expectedCr&&(hp*=2),5<=expectedCr&&10>=expectedCr&&(hp*=1.5),11<=expectedCr&&16>=expectedCr&&(hp*=1.25)),"imm"===$("#resistances").val()&&(0<=expectedCr&&4>=expectedCr&&(hp*=2),5<=expectedCr&&10>=expectedCr&&(hp*=2),11<=expectedCr&&16>=expectedCr&&(hp*=1.5),17<=expectedCr&&(hp*=1.25));let ac=parseInt($("#crcalc #ac").val())+parseInt($("#saveprofs").val())+parseInt(2*$("#flying").prop("checked")),dpr=parseInt($("#crcalc #dpr").val()),attackBonus=parseInt($("#crcalc #attackbonus").val());const useSaveDc=$("#saveinstead").prop("checked");let offensiveCR=-1,defensiveCR=-1;$("#monsterfeatures input:checked").each(function(){let trait=0;$(this).siblings("input[type=number]").length&&(trait=$(this).siblings("input[type=number]").val()),""!==$(this).attr("data-hp")&&(hp+=+eval($(this).attr("data-hp"))),""!==$(this).attr("data-ac")&&(ac+=+eval($(this).attr("data-ac"))),""!==$(this).attr("data-dpr")&&(dpr+=+eval($(this).attr("data-dpr"))),useSaveDc||""===$(this).attr("data-attackbonus")||(attackBonus+=+$(this).attr("data-attackbonus"))}),hp=_Mathfloor(hp),dpr=_Mathfloor(dpr);const effectiveHp=hp,effectiveDpr=dpr;850<hp&&(hp=850),320<dpr&&(dpr=320);for(let a=0;a<msbcr.cr.length;a++){const b=msbcr.cr[a];if(hp>=parseInt(b.hpmin)&&hp<=parseInt(b.hpmax)){let c=parseInt(b.ac)-ac;0<c&&(c=_Mathfloor(c/2)),0>c&&(c=_Mathceil(c/2)),c=a-c,0>c&&(c=0),c>=msbcr.cr.length&&(c=msbcr.cr.length-1),defensiveCR=msbcr.cr[c]._cr}if(dpr>=b.dprmin&&dpr<=b.dprmax){let c=parseInt(b.attackbonus);useSaveDc&&(c=parseInt(b.savedc));let d=c-attackBonus;0<d&&(d=_Mathfloor(d/2)),0>d&&(d=_Mathceil(d/2)),d=a-d,0>d&&(d=0),d>=msbcr.cr.length&&(d=msbcr.cr.length-1),offensiveCR=msbcr.cr[d]._cr}}-1===offensiveCR&&(offensiveCR="0"),-1===defensiveCR&&(defensiveCR="0");let cr=((fractionStrToDecimal(offensiveCR)+fractionStrToDecimal(defensiveCR))/2).toString();"0.5625"===cr&&(cr="1/2"),"0.5"===cr&&(cr="1/2"),"0.375"===cr&&(cr="1/4"),"0.3125"===cr&&(cr="1/4"),"0.25"===cr&&(cr="1/4"),"0.1875"===cr&&(cr="1/8"),"0.125"===cr&&(cr="1/8"),"0.0625"===cr&&(cr="1/8"),-1!==cr.indexOf(".")&&(cr=Math.round(cr).toString());let finalCr=0;for(let a=0;a<msbcr.cr.length;a++)if(msbcr.cr[a]._cr===cr){finalCr=a;break}const hitDice=calculateHd(),hitDiceSize=$("#hdval").html(),conMod=_Mathfloor(($("#con").val()-10)/2),hashParts=[$("#expectedcr").val(),$("#ac").val(),$("#dpr").val(),$("#attackbonus").val(),useSaveDc,$("#size").val(),$("#hd").val(),$("#con").val(),$("#vulnerabilities").prop("checked"),$("#resistances").val(),$("#flying").prop("checked"),$("#saveprofs").val(),$(`.crc__mon_feature_cb`).map((a,b)=>{const c=$(b);if(c.prop("checked")){const a=c.siblings("input[type=number]");return`${c.attr("id")}:${!a.length||a.val()}`}return!1}).get().filter(Boolean).join(",")];window.location=`#${hashParts.join(",")}`,$("#croutput").html(`
		<h4>Challenge Rating: ${cr}</h4>
		<p>Offensive CR: ${offensiveCR}</p>
		<p>Defensive CR: ${defensiveCR}</p>
		<p>Proficiency Bonus: +${msbcr.cr[finalCr].pb}</p>
		<p>Effective HP: ${effectiveHp} (${hitDice}${hitDiceSize}${0>conMod?"":"+"}${conMod*hitDice})</p>
		<p>Effective AC: ${ac}</p>
		<p>Average Damage Per Round: ${effectiveDpr}</p>
		<p>${useSaveDc?"Save DC: ":"Effective Attack Bonus: +"}${attackBonus}</p>
		<p>Experience Points: ${Parser.crToXp(msbcr.cr[finalCr]._cr)}</p>
	`)}function calculateHd(){var a=Math.floor;const b=$("#hdval").html().split("d")[1]/2+.5,c=a(($("#con").val()-10)/2);let d=a(parseInt($("#hp").val())/(b+c));return d||(d=1),d}function calculateHp(){const a=$("#hdval").html().split("d")[1]/2+.5,b=Math.floor(($("#con").val()-10)/2);return Math.round((a+b)*$("#hd").val())}function fractionStrToDecimal(a){return"0"===a?0:parseFloat(a.split("/").reduce((a,b)=>a/b))}
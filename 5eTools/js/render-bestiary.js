class RenderBestiary{static _getRenderedSection(a,b,c){const d=Renderer.get(),f=[];if("legendary"===a){const a=MiscUtil.copy(b).map(a=>(a.name&&a.entries&&(a.name=`${a.name}.`,a.type=a.type||"item"),a));d.recursiveRender({type:"list",style:"list-hang-notitle",items:a},f,{depth:c})}else b.forEach(a=>{a.rendered?f.push(a.rendered):d.recursiveRender(a,f,{depth:c+1})});return`<tr class='${a}'><td colspan='6' class="mon__sect-row-inner">${f.join("")}</td></tr>`}static _getPronunciationButton(a){const b=a.soundClip.substr(a.soundClip.lastIndexOf("/")+1);return`<button class="btn btn-xs btn-default btn-name-pronounce" style="margin-top: 5px;">
			<span class="glyphicon glyphicon-volume-up name-pronounce-icon"></span>
			<audio class="name-pronounce">
			   <source src="${a.soundClip}" type="audio/mpeg">
			   <source src="audio/bestiary/${b}" type="audio/mpeg">
			</audio>
		</button>`}static updateParsed(a){delete a._pTypes,delete a._pCr,RenderBestiary.initParsed(a)}static initParsed(a){a._pTypes=a._pTypes||Parser.monTypeToFullObj(a.type),a._pCr=a._pCr||(a.cr===void 0?"Unknown":a.cr.cr||a.cr)}static $getRenderedCreature(a,b,c){c=c||{};const d=Renderer.get();RenderBestiary.initParsed(a);const e=Renderer.monster.getOrderedTraits(a,d),f=a.legendaryGroup?(b[a.legendaryGroup.source]||{})[a.legendaryGroup.name]:null,g=(()=>{const b=Renderer.monster.getDragonCasterVariant(d,a),c=a.variant;if(!c&&!b)return null;else{const a=[];return(c||[]).forEach(b=>d.recursiveRender(b,a)),b&&a.push(b),`<td colspan=6>${a.join("")}</td>`}})(),h=(()=>{const b={source:a.source,sourceSub:a.sourceSub,page:a.page,otherSources:a.otherSources,additionalSources:a.additionalSources,externalSources:a.externalSources},c=a.additionalSources?JSON.parse(JSON.stringify(a.additionalSources)):[];a.variant&&1<a.variant.length&&a.variant.forEach(a=>{a.variantSource&&c.push({source:a.variantSource.source,page:a.variantSource.page})}),b.additionalSources=c;const d=Renderer.utils._getPageTrText(b);return a.environment&&a.environment.length?[d,`<i>Environment: ${a.environment.sort(SortUtil.ascSortLower).map(a=>a.toTitleCase()).join(", ")}</i>`]:[d]})();return $$`
		${Renderer.utils.getBorderTr()}
		<tr><th class="name mon__name--token" colspan="6">
			<span class="stats-name copyable" onclick="Renderer.utils._pHandleNameClick(this, '${a.source.escapeQuotes()}')">${a._displayName||a.name}</span>
			${a.soundClip?RenderBestiary._getPronunciationButton(a):""}
			<span class="stats-source ${Parser.sourceJsonToColor(a.source)}" title="${Parser.sourceJsonToFull(a.source)}${Renderer.utils.getSourceSubText(a)}" ${BrewUtil.sourceJsonToStyle(a.source)}>${Parser.sourceJsonToAbv(a.source)}</span>
		</th></tr>
		<tr><td colspan="6">
			<div class="mon__wrp-size-type-align"><i>${Parser.sizeAbvToFull(a.size)} ${a._pTypes.asText}, ${Parser.alignmentListToFull(a.alignment).toLowerCase()}</i></div>
		</td></tr>
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		
		<tr><td colspan="6"><div class="mon__wrp-avoid-token"><strong>Armor Class</strong> ${Parser.acToFull(a.ac)}</div></td></tr>
		<tr><td colspan="6"><div class="mon__wrp-avoid-token"><strong>Hit Points</strong> ${Renderer.monster.getRenderedHp(a.hp)}</div></td></tr>
		<tr><td colspan="6"><strong>Speed</strong> ${Parser.getSpeedString(a)}</td></tr>
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		
		<tr class="mon__ability-names">
			<th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
		</tr>
		<tr class="mon__ability-scores">
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(a.str)}|${a.str} (${Parser.getAbilityModifier(a.str)})|Strength}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(a.dex)}|${a.dex} (${Parser.getAbilityModifier(a.dex)})|Dexterity}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(a.con)}|${a.con} (${Parser.getAbilityModifier(a.con)})|Constitution}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(a.int)}|${a.int} (${Parser.getAbilityModifier(a.int)})|Intelligence}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(a.wis)}|${a.wis} (${Parser.getAbilityModifier(a.wis)})|Wisdom}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(a.cha)}|${a.cha} (${Parser.getAbilityModifier(a.cha)})|Charisma}`)}</td>
		</tr>
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		
		${a.save?`<tr><td colspan="6"><strong>Saving Throws</strong> ${Object.keys(a.save).sort(SortUtil.ascSortAtts).map(b=>Renderer.monster.getSave(d,b,a.save[b])).join(", ")}</td></tr>`:""}
		${a.skill?`<tr><td colspan="6"><strong>Skills</strong> ${Renderer.monster.getSkillsString(d,a)}</td></tr>`:""}
		${a.vulnerable?`<tr><td colspan="6"><strong>Damage Vulnerabilities</strong> ${Parser.monImmResToFull(a.vulnerable)}</td></tr>`:""}
		${a.resist?`<tr><td colspan="6"><strong>Damage Resistances</strong> ${Parser.monImmResToFull(a.resist)}</td></tr>`:""}
		${a.immune?`<tr><td colspan="6"><strong>Damage Immunities</strong> ${Parser.monImmResToFull(a.immune)}</td></tr>`:""}
		${a.conditionImmune?`<tr><td colspan="6"><strong>Condition Immunities</strong> ${Parser.monCondImmToFull(a.conditionImmune)}</td></tr>`:""}
		<tr><td colspan="6"><strong>Senses</strong> ${a.senses?`${Renderer.monster.getRenderedSenses(a.senses)},`:""} passive Perception ${a.passive||"\u2014"}</td></tr>
		<tr><td colspan="6"><strong>Languages</strong> ${Renderer.monster.getRenderedLanguages(a.languages)}</td></tr>
		
		<tr>${100===Parser.crToNumber(a.cr)?"":$$`
		<td colspan="6" style="position: relative;"><strong>Challenge</strong>
			<span>${Parser.monCrToFull(a.cr)}</span>
			${c.$btnScaleCr||""}
			${c.$btnResetScaleCr||""}
		</td>
		`}</tr>
		
		${e?`<tr><td class="divider" colspan="6"><div></div></td></tr>${RenderBestiary._getRenderedSection("trait",e,1)}`:""}
		${a.action?`<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">Actions</span></td></tr>
		${RenderBestiary._getRenderedSection("action",a.action,1)}`:""}
		${a.reaction?`<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">Reactions</span></td></tr>
		${RenderBestiary._getRenderedSection("reaction",a.reaction,1)}`:""}
		${a.legendary?`<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">Legendary Actions</span></td></tr>
		<tr class='legendary'><td colspan='6'><span class='name'></span> <span>${Renderer.monster.getLegendaryActionIntro(a)}</span></td></tr>
		${RenderBestiary._getRenderedSection("legendary",a.legendary,1)}`:""}
		
		${f&&f.lairActions?`<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">Lair Actions</span></td></tr>
		${RenderBestiary._getRenderedSection("lairaction",f.lairActions,-1)}`:""}
		${f&&f.regionalEffects?`<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">Regional Effects</span></td></tr>
		${RenderBestiary._getRenderedSection("regionaleffect",f.regionalEffects,-1)}`:""}
		
		${g?`<tr>${g}</tr>`:""}
		${2===h.length?`<tr><td colspan="4">${h[0]}</td><td colspan="2" class="text-right mr-2">${h[1]}</td></tr>`:`<tr><td colspan="6">${h[0]}</td></tr>`}
		${Renderer.utils.getBorderTr()}`}}
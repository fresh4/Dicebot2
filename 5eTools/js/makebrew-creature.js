"use strict";

class CreatureBuilder extends Builder {
	constructor () {
		super({
			titleSidebarLoadExisting: "Load Existing Creature",
			titleSidebarDownloadJson: "Download Creatures as JSON",
			prop: "monster"
		});

		this._bestiaryMetaRaw = null;
		this._bestiaryFluffIndex = null;
		this._bestiaryTypeTags = null;
		// FUTURE mechanism to update this select/etc if the user creates/edits homebrew legendary groups
		this._bestiaryMetaCache = null;
		this._legendaryGroups = null;

		this._renderOutputDebounced = MiscUtil.debounce(() => this._renderOutput(), 50);

		this._generateAttackCache = null;
	}

	handleSidebarLoadExistingClick () {
		const searchWidget = new SearchWidget(
			{Creature: SearchWidget.CONTENT_INDICES.Creature},
			async (page, source, hash) => {
				doClose();
				const creature = MiscUtil.copy(await Renderer.hover.pCacheAndGet(page, source, hash));

				if (this._bestiaryFluffIndex[creature.source] && !creature.fluff) {
					const rawFluff = await DataUtil.loadJSON(`data/bestiary/${this._bestiaryFluffIndex[creature.source]}`);
					const fluff = Renderer.monster.getFluff(creature, this._bestiaryMetaRaw, rawFluff);
					if (fluff) creature.fluff = fluff;
				}

				creature.source = this._ui.source;
				if (Parser.crToNumber(creature.cr) !== 100) {
					const ixDefault = Parser.CRS.indexOf(creature.cr.cr || creature.cr);
					const scaleTo = await InputUiUtil.pGetUserEnum({values: Parser.CRS, title: "At Challange Rating...", default: ixDefault});

					if (scaleTo != null && scaleTo !== ixDefault) {
						const scaled = await ScaleCreature.scale(creature, Parser.crToNumber(Parser.CRS[scaleTo]));
						delete scaled._displayName;
						this.setStateFromLoaded({s: scaled, m: this.getInitialMetaState()});
					} else this.setStateFromLoaded({s: creature, m: this.getInitialMetaState()});
				} else this.setStateFromLoaded({s: creature, m: this.getInitialMetaState()});

				delete creature.otherSources;

				this.renderInput();
				this.renderOutput();
			},
			{defaultCategory: "Creature"}
		);
		const {$modalInner, doClose} = UiUtil.getShowModal({
			title: "Select Creature",
			cbClose: () => searchWidget.$wrpSearch.detach()
		});
		$modalInner.append(searchWidget.$wrpSearch);
		searchWidget.doFocus();
	}

	async pInit () {
		const [bestiaryMetaRaw, bestiaryFluffIndex, jsonCreature, bestiaryIndex] = await Promise.all([
			DataUtil.loadJSON("data/bestiary/meta.json"),
			DataUtil.loadJSON("data/bestiary/fluff-index.json"),
			DataUtil.loadJSON("data/makebrew-creature.json"),
			DataUtil.loadJSON("data/bestiary/index.json")
		]);

		this._bestiaryFluffIndex = bestiaryFluffIndex;

		this._bestiaryMetaRaw = bestiaryMetaRaw;
		this._legendaryGroups = [...this._bestiaryMetaRaw.legendaryGroup, ...(BrewUtil.homebrew.legendaryGroup || [])];
		this._bestiaryMetaCache = {};
		this._legendaryGroups.forEach(it => (this._bestiaryMetaCache[it.source] = (this._bestiaryMetaCache[it.source] || {}))[it.name] = it);

		this._jsonCreature = jsonCreature;
		this._indexedTraits = elasticlunr(function () {
			this.addField("n");
			this.setRef("id");
		});
		SearchUtil.removeStemmer(this._indexedTraits);
		this._jsonCreature.trait.forEach((it, i) => this._indexedTraits.addDoc({
			n: it.name,
			id: i
		}));

		// Load this asynchronously, to avoid blocking the page load
		this._bestiaryTypeTags = [];
		const allTypes = new Set();
		Promise.all(Object.values(bestiaryIndex).map(file => DataUtil.loadJSON(`data/bestiary/${file}`))).then(bestiaryData => {
			bestiaryData.forEach(it => it.monster.forEach(mon => mon.type && mon.type.tags ? mon.type.tags.forEach(tp => allTypes.add(tp.tag || tp)) : ""));
			this._bestiaryTypeTags.push(...allTypes);
		});
	}

	_getInitialState () {
		return {
			name: "New Creature",
			size: "M",
			type: "aberration",
			source: this._ui ? this._ui.source : "",
			alignment: ["N"],
			ac: [10],
			hp: {average: 4, formula: "1d8"},
			speed: {walk: 30},
			str: 10,
			dex: 10,
			con: 10,
			int: 10,
			wis: 10,
			cha: 10,
			passive: 10,
			cr: "0"
		}
	}

	setStateFromLoaded (state) {
		if (state && state.s && state.m) {
			// TODO validate state

			// clean old language/sense formats
			if (state.s.languages && !(state.s.languages instanceof Array)) state.s.languages = [state.s.languages];
			if (state.s.senses && !(state.s.senses instanceof Array)) state.s.senses = [state.s.senses];

			this.__state = state.s;
			this.__meta = state.m;

			// create proxies, but avoid using them during the load
			this.doCreateProxies();

			// validate ixBrew
			if (state.m.ixBrew != null) {
				const expectedIx = (BrewUtil.homebrew.monster || []).findIndex(it => it.source === state.s.source && it.name === state.s.name);
				if (!~expectedIx) state.m.ixBrew = null;
				else if (expectedIx !== state.m.ixBrew) state.m.ixBrew = expectedIx;
			}

			// auto-set proficiency toggles (1 = proficient; 2 = expert)
			if (!state.m.profSave) {
				state.m.profSave = {};
				if (state.s.save) {
					const pb = this._getProfBonus();
					Object.entries(state.s.save).forEach(([prop, val]) => {
						const expected = Parser.getAbilityModNumber(state.s[prop]) + pb;
						if (Number(val) === Number(expected)) state.m.profSave[prop] = 1;
					});
				}
			}
			if (!state.m.profSkill) {
				state.m.profSkill = {};
				if (state.s.skill) {
					const pb = this._getProfBonus();
					Object.entries(state.s.skill).forEach(([prop, val]) => {
						const abilProp = Parser.skillToAbilityAbv(prop);
						const abilMod = Parser.getAbilityModNumber(state.s[abilProp]);

						const expectedProf = abilMod + pb;
						if (Number(val) === Number(expectedProf)) return state.m.profSkill[prop] = 1;

						const expectedExpert = abilMod + 2 * pb;
						if (Number(val) === Number(expectedExpert)) state.m.profSkill[prop] = 2;
					});
				}
			}

			// other fields which don't fall under proficiency
			if (!state.m.autoCalc) {
				state.m.autoCalc = {
					proficiency: true
				};

				// hit points
				if (state.s.hp.formula && state.s.hp.average != null) {
					const expected = Math.floor(Renderer.dice.parseAverage(state.s.hp.formula));
					state.m.autoCalc.hpAverageSimple = expected === state.s.hp.average;
					state.m.autoCalc.hpAverageComplex = state.m.autoCalc.hpAverageSimple;

					const parts = CreatureBuilder.__$getHpInput__getFormulaParts(state.s.hp.formula);
					if (parts) {
						const mod = Parser.getAbilityModNumber(this.__state.con);
						const expected = mod * parts.hdNum;
						if (expected === (parts.mod || 0)) state.m.autoCalc.hpModifier = true;
					}
				} else {
					// enable auto-calc for "Special" HP types; hidden until mode switch
					state.m.autoCalc.hpAverage = true;
					state.m.autoCalc.hpModifier = true;
				}

				// passive perception
				const expectedPassive = (state.s.skill && state.s.skill.perception ? Number(state.s.skill.perception) : Parser.getAbilityModNumber(this.__state.wis)) + 10;
				if (state.s.passive && expectedPassive === state.s.passive) state.m.autoCalc.passivePerception = true;
			}

			if (state._m && this.isEntrySaved != null) this.isEntrySaved = !!state._m.isEntrySaved;
			else this.isEntrySaved = state.m.ixBrew != null;

			this.mutSavedButtonText();
			this.doUiSave();
		}
	}

	doHandleSourcesAdd () {
		(this._$eles.$selVariantSources || []).map($sel => {
			const currSrcJson = $sel.val();
			$sel.empty().append(`<option value="">(Same as Creature)</option>`);
			this._ui.allSources.forEach(srcJson => $sel.append(`<option value="${srcJson.escapeQuotes()}">${Parser.sourceJsonToFull(srcJson).escapeQuotes()}</option>`));

			if (this._ui.allSources.indexOf(currSrcJson)) $sel.val(currSrcJson);
			else $sel[0].selectedIndex = 0;

			return $sel;
		}).forEach($sel => $sel.change());
	}

	renderInput () {
		this._validateMeta();
		this.renderInputControls();
		this._renderInputMain();
	}

	_validateMeta () {
		// ensure expected objects exist
		const setOn = this._meta || this.__meta;
		if (!setOn.profSave) setOn.profSave = {};
		if (!setOn.profSkill) setOn.profSkill = {};
		if (!setOn.autoCalc) setOn.autoCalc = {};
	}

	_renderInputMain () {
		this._sourcesCache = MiscUtil.copy(this._ui.allSources);
		const $wrp = this._ui.$wrpInput.empty();
		this.doCreateProxies();

		const _cb = () => {
			RenderBestiary.updateParsed(this._state);

			// do post-processing
			DiceConvert.cleanHpDice(this._state);
			TagAttack.tryTagAttacks(this._state);
			TagHit.tryTagHits(this._state);
			TagDc.tryTagDcs(this._state);
			TagCondition.tryTagConditions(this._state);
			TraitActionTag.tryRun(this._state);
			LanguageTag.tryRun(this._state);
			SenseTag.tryRun(this._state);
			SpellcastingTypeTag.tryRun(this._state);
			DamageTypeTag.tryRun(this._state);
			MiscTag.tryRun(this._state);

			this.renderOutput();
			this.doUiSave();
			this.isEntrySaved = false;
			this.mutSavedButtonText();
		};
		const cb = MiscUtil.debounce(_cb, 33);
		this._cbCache = cb; // cache for use when updating sources

		// initialise tabs
		this._resetTabs("input");
		const tabs = ["Info", "Race", "Core", "Defence", "Abilities", "Flavor/Misc"].map((it, ix) => this._getTab(ix, it, {hasBorder: true, tabGroup: "input", stateObj: this._meta, cbTabChange: this.doUiSave.bind(this)}));
		const [infoTab, raceTab, coreTab, defenseTab, abilTab, miscTab] = tabs;
		$$`<div class="flex-v-center w-100 no-shrink ui-tab__wrp-tab-heads--border">${tabs.map(it => it.$btnTab)}</div>`.appendTo($wrp);
		tabs.forEach(it => it.$wrpTab.appendTo($wrp));

		// INFO
		BuilderUi.$getStateIptString("Name", cb, this._state, {nullable: false, callback: () => this.renderSideMenu()}, "name").appendTo(infoTab.$wrpTab);
		BuilderUi.$getStateIptString("Short Name", cb, this._state, {title: "If not supplied, this will be generated from the creature's full name. Used in Legendary Action header text."}, "shortName").appendTo(infoTab.$wrpTab);
		this._$selSource = this.$getSourceInput(cb).appendTo(infoTab.$wrpTab);
		BuilderUi.$getStateIptNumber("Page", cb, this._state, {}, "page").appendTo(infoTab.$wrpTab);
		this.__$getAlignmentInput(cb).appendTo(infoTab.$wrpTab);
		this.__$getCrInput(cb).appendTo(infoTab.$wrpTab);
		this.__$getProfBonusInput(cb).appendTo(infoTab.$wrpTab);
		BuilderUi.$getStateIptNumber("Level", cb, this._state, {title: "Used for Sidekicks only"}, "level").appendTo(infoTab.$wrpTab);

		// RACE
		BuilderUi.$getStateIptEnum("Size", cb, this._state, {vals: Parser.SIZE_ABVS, fnDisplay: Parser.sizeAbvToFull, type: "string", nullable: false}, "size").appendTo(raceTab.$wrpTab);
		this.__$getTypeInput(cb).appendTo(raceTab.$wrpTab);
		this.__$getSpeedInput(cb).appendTo(raceTab.$wrpTab);
		this.__$getSenseInput(cb).appendTo(raceTab.$wrpTab);
		this.__$getLanguageInput(cb).appendTo(raceTab.$wrpTab);

		// CORE
		this.__$getAbilityScoreInput(cb).appendTo(coreTab.$wrpTab);
		this.__$getSaveInput(cb).appendTo(coreTab.$wrpTab);
		this.__$getSkillInput(cb).appendTo(coreTab.$wrpTab);
		this.__$getPassivePerceptionInput(cb).appendTo(coreTab.$wrpTab);

		// DEFENCE
		this.__$getAcInput(cb).appendTo(defenseTab.$wrpTab);
		this.__$getHpInput(cb).appendTo(defenseTab.$wrpTab);
		this.__$getVulnerableInput(cb).appendTo(defenseTab.$wrpTab);
		this.__$getResistInput(cb).appendTo(defenseTab.$wrpTab);
		this.__$getImmuneInput(cb).appendTo(defenseTab.$wrpTab);
		this.__$getCondImmuneInput(cb).appendTo(defenseTab.$wrpTab);

		// ABILITIES
		this.__$getSpellcastingInput(cb).appendTo(abilTab.$wrpTab);
		this.__$getTraitInput(cb).appendTo(abilTab.$wrpTab);
		this.__$getActionInput(cb).appendTo(abilTab.$wrpTab);
		this.__$getReactionInput(cb).appendTo(abilTab.$wrpTab);
		BuilderUi.$getStateIptNumber(
			"Legendary Action Count",
			cb,
			this._state,
			{
				title: "If specified, this will override the default number (3) of legendary actions available for the creature.",
				placeholder: "If left blank, defaults to 3."
			},
			"legendaryActions"
		).appendTo(abilTab.$wrpTab);
		BuilderUi.$getStateIptBoolean(
			"Name is Proper Noun",
			cb,
			this._state,
			{
				title: "If selected, the legendary action intro text for this creature will be formatted as though the creature's name is a proper noun (e.g. 'Tiamat can take...' vs 'The dragon can take...')."
			},
			"isNamedCreature"
		).appendTo(abilTab.$wrpTab);
		BuilderUi.$getStateIptEntries(
			"Legendary Action Intro",
			cb,
			this._state,
			{
				title: "If specified, this custom legendary action intro text will override the default.",
				placeholder: "If left blank, defaults to a generic intro."
			},
			"legendaryHeader"
		).appendTo(abilTab.$wrpTab);
		this.__$getLegendaryActionInput(cb).appendTo(abilTab.$wrpTab);
		this.__$getLegendaryGroupInput(cb).appendTo(abilTab.$wrpTab);
		this.__$getVariantInput(cb).appendTo(abilTab.$wrpTab);

		// FLAVOR/MISC
		this.__$getTokenInput(cb).appendTo(miscTab.$wrpTab);
		this.__$getFluffInput(cb).appendTo(miscTab.$wrpTab);
		this.__$getEnvironmentInput(cb).appendTo(miscTab.$wrpTab);
		BuilderUi.$getStateIptString("Group", cb, this._state, {title: "The family this creature belongs to, e.g. 'Modrons' in the case of a Duodrone."}, "group").appendTo(miscTab.$wrpTab);
		BuilderUi.$getStateIptString("Sound Clip URL", cb, this._state, {type: "url"}, "soundClip").appendTo(miscTab.$wrpTab);
		BuilderUi.$getStateIptEnum(
			"Dragon Casting Color",
			cb,
			this._state,
			{
				vals: Object.keys(Parser.DRAGON_COLOR_TO_FULL).sort((a, b) => SortUtil.ascSort(Parser.dragonColorToFull(a), Parser.dragonColorToFull(b))),
				fnDisplay: (abv) => Parser.dragonColorToFull(abv).uppercaseFirst(),
				type: "string"
			},
			"dragonCastingColor"
		).appendTo(miscTab.$wrpTab);
		BuilderUi.$getStateIptBoolean("NPC", cb, this._state, {title: "If selected, this creature will be filtered out from the Bestiary list by default."}, "isNpc").appendTo(miscTab.$wrpTab);
		BuilderUi.$getStateIptBoolean("Familiar", cb, this._state, {title: "If selected, this creature will be included when filtering for 'Familiar' in the Bestiary."}, "familiar").appendTo(miscTab.$wrpTab);
		BuilderUi.$getStateIptStringArray(
			"Search Aliases",
			cb,
			this._state,
			{
				shortName: "Alias",
				title: "Alternate names for this creature, e.g. 'Illithid' as an alternative for 'Mind Flayer,' which can be searched in the Bestiary."
			},
			"alias"
		).appendTo(miscTab.$wrpTab);

		// excluded fields:
		// - otherSources: requires meta support
	}

	__$getTypeInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Type", {isMarked: true});

		const initial = this._state.type;
		const initialSwarm = !!initial.swarmSize;

		const setStateCreature = () => {
			if (tagRows.length) {
				const validTags = tagRows.map($tr => {
					const prefix = $tr.$iptPrefix.val().trim();
					const tag = $tr.$iptTag.val().trim();
					if (!tag) return null;
					if (prefix) return {tag, prefix};
					return tag;
				}).filter(Boolean);
				if (validTags.length) {
					this._state.type = {
						type: $selType.val(),
						tags: validTags
					};
				} else this._state.type = $selType.val();
			} else this._state.type = $selType.val();
			cb();
		};

		const setStateSwarm = () => {
			this._state.type = {
				type: $selType.val(),
				swarmSize: $selSwarmSize.val()
			};
			cb();
		};

		const $selMode = $(`<select class="form-control input-xs mb-2">
			<option value="0">Creature</option>
			<option value="1">Swarm</option>
		</select>`).val(initialSwarm ? "1" : "0").change(() => {
			switch ($selMode.val()) {
				case "0": {
					$stageType.show(); $stageSwarm.hide();
					setStateCreature();
					break;
				}
				case "1": {
					$stageType.hide(); $stageSwarm.show();
					setStateSwarm();
					break;
				}
			}
		}).appendTo($rowInner);

		const $selType = $(`<select class="form-control input-xs">${Parser.MON_TYPES.map(tp => `<option value="${tp}">${tp.uppercaseFirst()}</option>`).join("")}</select>`)
			.change(() => {
				switch ($selMode.val()) {
					case "0": setStateCreature(); break;
					case "1": setStateSwarm(); break;
				}
			})
			.appendTo($rowInner)
			.val(initial.type || initial);

		// TAG CONTROLS
		const tagRows = [];

		const $btnAddTag = $(`<button class="btn btn-xs btn-default">Add Tag</button>`)
			.click(() => {
				const $tagRow = this.__$getTypeInput__getTagRow(null, tagRows, setStateCreature);
				$wrpTagRows.append($tagRow.$wrp);
			});

		const $initialTagRows = initial.tags ? initial.tags.map(tag => this.__$getTypeInput__getTagRow(tag, tagRows, setStateCreature)) : null;

		const $wrpTagRows = $$`<div>${$initialTagRows ? $initialTagRows.map(it => it.$wrp) : ""}</div>`;
		const $stageType = $$`<div class="mt-2">
		${$wrpTagRows}
		<div>${$btnAddTag}</div>
		</div>`.appendTo($rowInner).toggle(!initialSwarm);

		// SWARM CONTROLS
		const $selSwarmSize = $(`<select class="form-control input-xs mt-2">${Parser.SIZE_ABVS.map(sz => `<option value="${sz}">${Parser.sizeAbvToFull(sz)}</option>`).join("")}</select>`)
			.change(() => {
				this._state.type.swarmSize = $selSwarmSize.val();
				cb();
			});
		const $stageSwarm = $$`<div>
		${$selSwarmSize}
		</div>`.appendTo($rowInner).toggle(initialSwarm);
		initialSwarm && $selSwarmSize.val(initial.swarmSize);

		return $row;
	}

	__$getTypeInput__getTagRow (tag, tagRows, setStateCreature) {
		const $iptPrefix = $(`<input class="form-control input-xs form-control--minimal mr-2" placeholder="Prefix">`)
			.change(() => {
				$iptTag.removeClass("error-background");
				if ($iptTag.val().trim().length || !$iptPrefix.val().trim().length) setStateCreature();
				else $iptTag.addClass("error-background");
			});
		if (tag && tag.prefix) $iptPrefix.val(tag.prefix);
		const $iptTag = $(`<input class="form-control input-xs form-control--minimal mr-2" placeholder="Tag (lowercase)">`)
			.change(() => {
				$iptTag.removeClass("error-background");
				setStateCreature();
			});
		if (tag) $iptTag.val(tag.tag || tag);
		const $btnAddGeneric = $(`<button class="btn btn-xs btn-default mr-2">Add Tag...</button>`)
			.click(async () => {
				const tag = await InputUiUtil.pGetUserString({
					title: "Enter a Tag",
					autocomplete: this._bestiaryTypeTags
				});

				if (tag != null) {
					$iptTag.val(tag);
					setStateCreature();
				}
			});
		const $btnRemove = $(`<button class="btn btn-xs btn-danger" title="Remove Row"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				tagRows.splice(tagRows.indexOf(out), 1);
				$wrp.empty().remove();
				setStateCreature();
			});
		const $wrp = $$`<div class="flex mb-2">${$iptPrefix}${$iptTag}${$btnAddGeneric}${$btnRemove}</div>`;
		const out = {$wrp, $iptPrefix, $iptTag};
		tagRows.push(out);
		return out;
	}

	__$getAlignmentInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Alignment", {isMarked: true});

		const doUpdateState = () => {
			const raw = alignmentRows.map(row => row.getAlignment());
			if (raw.some(it => it && (it.special != null || it.alignment !== undefined)) || raw.length > 1) {
				this._state.alignment = raw.map(it => {
					if (it && (it.special != null || it.alignment)) return it;
					else return {alignment: it};
				})
			} else this._state.alignment = raw[0];
			cb();
		};

		const alignmentRows = [];

		const $wrpRows = $(`<div/>`).appendTo($rowInner);

		if ((this._state.alignment && this._state.alignment.some(it => it && (it.special != null || it.alignment !== undefined))) || !~CreatureBuilder.__$getAlignmentInput__getAlignmentIx(this._state.alignment)) {
			this._state.alignment.forEach(alignment => CreatureBuilder.__$getAlignmentInput__getAlignmentRow(doUpdateState, alignmentRows, alignment).$wrp.appendTo($wrpRows));
		} else {
			CreatureBuilder.__$getAlignmentInput__getAlignmentRow(doUpdateState, alignmentRows, this._state.alignment).$wrp.appendTo($wrpRows)
		}

		const $wrpBtnAdd = $(`<div/>`).appendTo($rowInner);
		$(`<button class="btn btn-xs btn-default">Add Alignment</button>`)
			.appendTo($wrpBtnAdd)
			.click(() => {
				CreatureBuilder.__$getAlignmentInput__getAlignmentRow(doUpdateState, alignmentRows).$wrp.appendTo($wrpRows);
				doUpdateState();
			});

		return $row;
	}

	static __$getAlignmentInput__getAlignmentRow (doUpdateState, alignmentRows, alignment) {
		const initialMode = alignment && alignment.chance ? "1" : alignment && alignment.special ? "2" : (alignment === null || (alignment && alignment.alignment === null)) ? "3" : "0";

		const getAlignment = () => {
			switch ($selMode.val()) {
				case "0": {
					return [...CreatureBuilder._ALIGNMENTS[$selAlign.val()]];
				}
				case "1": {
					return {
						alignment: [...CreatureBuilder._ALIGNMENTS[$selAlign.val()]],
						chance: Math.min(Math.max(0, Number($iptChance.val())), 100)
					}
				}
				case "2": {
					const specials = $iptSpecial.val().trim().split(",").map(it => it.trim()).filter(Boolean);
					return specials.length ? specials.map(it => ({special: it})) : {special: ""};
				}
				case "3": {
					return null;
				}
			}
		};

		const $selMode = $(`<select class="form-control input-xs mb-2">
				<option value="0">Basic Alignment</option>
				<option value="1">Chance-Based Alignment</option>
				<option value="2">Special Alignment</option>
				<option value="3">No Alignment (Sidekick)</option>
			</select>`).val(initialMode).change(() => {
			switch ($selMode.val()) {
				case "0": {
					$stageSingle.show(); $stageMultiple.hide(); $stageSpecial.hide();
					doUpdateState();
					break;
				}
				case "1": {
					$stageSingle.show(); $stageMultiple.show(); $stageSpecial.hide();
					doUpdateState();
					break;
				}
				case "2": {
					$stageSingle.hide(); $stageMultiple.hide(); $stageSpecial.show();
					doUpdateState();
					break;
				}
				case "3": {
					$stageSingle.hide(); $stageMultiple.hide(); $stageSpecial.hide();
					doUpdateState();
					break;
				}
			}
		});

		// SINGLE CONTROLS ("multiple" also uses these)
		const $selAlign = $(`<select class="form-control input-xs mb-2">${CreatureBuilder._ALIGNMENTS.map((it, i) => it ? `<option value="${i}">${Parser.alignmentListToFull(it)}</option>` : `<option disabled>\u2014</option>`).join("")}</select>`)
			.change(() => doUpdateState());
		const $stageSingle = $$`<div>${$selAlign}</div>`.toggle(initialMode === "0" || initialMode === "1");
		initialMode === "0" && alignment && $selAlign.val(CreatureBuilder.__$getAlignmentInput__getAlignmentIx(alignment.alignment || alignment));
		initialMode === "1" && alignment && $selAlign.val(CreatureBuilder.__$getAlignmentInput__getAlignmentIx(alignment.alignment));

		// MULTIPLE CONTROLS
		const $iptChance = $(`<input type="number" class="form-control form-control--minimal input-xs mr-2" min="1" max="100" placeholder="Chance of alignment">`)
			.change(() => doUpdateState());
		const $stageMultiple = $$`<div class="mb-2 flex-v-center">${$iptChance}<span>%</span></div>`.toggle(initialMode === "1");
		initialMode === "1" && alignment && $iptChance.val(alignment.chance);

		// SPECIAL CONTROLS
		const $iptSpecial = $(`<input class="form-control input-xs form-control--minimal mb-2">`)
			.change(() => doUpdateState());
		const $stageSpecial = $$`<div>${$iptSpecial}</div>`.toggle(initialMode === "2");
		initialMode === "2" && alignment && $iptSpecial.val(alignment.special);

		const $btnRemove = $(`<button class="btn btn-xs btn-danger mkbru__btn-rm-row mb-2" title="Remove Alignment"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				alignmentRows.splice(alignmentRows.indexOf(out), 1);
				$wrp.empty().remove();
				doUpdateState();
			});

		const $wrp = $$`<div class="flex-col mkbru__wrp-rows mkbru__wrp-rows--removable">${$selMode}${$stageSingle}${$stageMultiple}${$stageSpecial}${$$`<div class="text-right">${$btnRemove}</div>`}</div>`;
		const out = {$wrp, getAlignment};
		alignmentRows.push(out);
		return out;
	}

	static __$getAlignmentInput__getAlignmentIx (alignment) {
		return CreatureBuilder._ALIGNMENTS.findIndex(it => CollectionUtil.setEq(new Set(it), new Set(alignment)))
	}

	__$getAcInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Armor Class", {isMarked: true});

		const doUpdateState = () => {
			this._state.ac = acRows.map($row => $row.getAc());
			cb();
		};

		const acRows = [];

		const $wrpRows = $(`<div/>`).appendTo($rowInner);
		this._state.ac.forEach(ac => CreatureBuilder.__$getAcInput__getAcRow(ac, acRows, doUpdateState).$wrp.appendTo($wrpRows));

		const $wrpBtnAdd = $(`<div/>`).appendTo($rowInner);
		$(`<button class="btn btn-xs btn-default">Add Armor Class Source</button>`)
			.appendTo($wrpBtnAdd)
			.click(() => {
				CreatureBuilder.__$getAcInput__getAcRow(null, acRows, doUpdateState).$wrp.appendTo($wrpRows);
				doUpdateState();
			});

		return $row;
	}

	static __$getAcInput__getAcRow (ac, acRows, doUpdateState) {
		const initialMode = ac && ac.from ? "1" : "0";

		const getAc = () => {
			const acValRaw = Number($iptAc.val().trim());
			const acVal = isNaN(acValRaw) ? 10 : acValRaw;
			const condition = $iptCond.val().trim();
			const braces = $cbBraces.prop("checked");

			const getBaseAC = () => {
				if (condition) {
					const out = {
						ac: acVal,
						condition
					};
					if (braces) out.braces = true;
					return out;
				} else return acVal;
			};

			switch ($selMode.val()) {
				case "0": {
					return getBaseAC();
				}
				case "1": {
					const froms = fromRows.map(it => it.getAcFrom()).filter(Boolean);
					if (froms.length) {
						const out = {
							ac: acVal,
							from: froms
						};
						if (condition) out.condition = condition;
						if (braces) out.braces = true;
						return out;
					} else return getBaseAC();
				}
			}
		};

		const $selMode = $(`<select class="form-control input-xs mkbru_mon__ac-split">
				<option value="0">Unarmored</option>
				<option value="1">Armor Class From...</option>
			</select>`).val(initialMode).change(() => {
			switch ($selMode.val()) {
				case "0": {
					$stageFrom.hide();
					doUpdateState();
					break;
				}
				case "1": {
					$stageFrom.show();
					if (!fromRows.length) CreatureBuilder.__$getAcInput__getFromRow(null, fromRows, doUpdateState).$wrpFrom.appendTo($wrpFromRows);
					doUpdateState();
					break;
				}
			}
		});

		const $iptAc = $(`<input type="number" class="form-control form-control--minimal input-xs mr-2 mkbru_mon__ac-split">`)
			.val(ac ? ac.ac || ac : 10)
			.change(() => doUpdateState());

		const $iptCond = $(`<input class="form-control form-control--minimal input-xs" placeholder="when...">`)
			.change(() => doUpdateState());
		if (ac && ac.condition) $iptCond.val(ac.condition);
		const $cbBraces = $(`<input type="checkbox" class="mkbru__ipt-cb--plain">`)
			.change(() => doUpdateState());
		if (ac && ac.braces) $cbBraces.prop("checked", ac.braces);

		// "FROM" CONTROLS
		const fromRows = [];

		const $wrpFromRows = $(`<div/>`);
		if (ac && ac.from) ac.from.forEach(f => CreatureBuilder.__$getAcInput__getFromRow(f, fromRows, doUpdateState).$wrpFrom.appendTo($wrpFromRows));

		const $btnAddFrom = $(`<button class="btn btn-xs btn-default mb-2">Add Another Feature/Item</button>`)
			.click(() => {
				CreatureBuilder.__$getAcInput__getFromRow(null, fromRows, doUpdateState).$wrpFrom.appendTo($wrpFromRows);
				doUpdateState();
			});
		const $stageFrom = $$`<div class="mb-2 flex-col">
		${$wrpFromRows}
		${$$`<div>${$btnAddFrom}</div>`}
		</div>`.toggle(initialMode === "1");

		// REMOVE CONTROLS
		const $btnRemove = $(`<button class="btn btn-xs btn-danger mkbru__btn-rm-row mb-2" title="Remove AC Source"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				acRows.splice(acRows.indexOf(out), 1);
				$wrp.empty().remove();
				doUpdateState();
			});

		const $wrp = $$`<div class="flex-col mkbru__wrp-rows mkbru__wrp-rows--removable">
			<div class="flex-v-center mb-2">${$iptAc}${$selMode}</div>
			${$$`<div>${$stageFrom}</div>`}
			<div class="flex-v-center mb-2"><span class="mr-2 mkbru__sub-name--50">Condition</span>${$iptCond}</div>
			<label class="flex-v-center mb-2"><span class="mr-2 mkbru__sub-name--50">Surround with brackets</span>${$cbBraces}</label>
			${$$`<div class="text-right">${$btnRemove}</div>`}
		</div>`;
		const out = {$wrp, getAc};
		acRows.push(out);
		return out;
	}

	static __$getAcInput__getFromRow (from, fromRows, doUpdateState) {
		const getAcFrom = () => $iptFrom.val().trim();

		const $iptFrom = $(`<input class="form-control form-control--minimal input-xs mr-2" placeholder="From...">`)
			.change(() => doUpdateState());
		if (from) $iptFrom.val(from);

		const contextId = ContextUtil.getNextGenericMenuId();
		ContextUtil.doInitContextMenu(contextId, (evt, ele, $invokedOn, $selectedMenu) => {
			const val = Number($selectedMenu.data("ctx-id"));
			$iptFrom.val(CreatureBuilder._AC_COMMON[Object.keys(CreatureBuilder._AC_COMMON)[val]]);
			doUpdateState();
		}, Object.keys(CreatureBuilder._AC_COMMON));

		const $btnCommon = $(`<button class="btn btn-default btn-xs mr-2">Feature <span class="caret"></span></button>`)
			.click(evt => ContextUtil.handleOpenContextMenu(evt, $btnCommon, contextId));

		const $btnSearchItem = $(`<button class="btn btn-default btn-xs">Item</button>`)
			.click(() => {
				const searchWidget = new SearchWidget(
					{Item: SearchWidget.CONTENT_INDICES.Item},
					(page, source, hash) => {
						const [encName, encSource] = hash.split(HASH_LIST_SEP);
						$iptFrom.val(`{@item ${decodeURIComponent(encName)}${encSource !== UrlUtil.encodeForHash(SRC_DMG) ? `|${decodeURIComponent(encSource)}` : ""}}`);
						doUpdateState();
						doClose();
					},
					{defaultCategory: "Item"}
				);
				const {$modalInner, doClose} = UiUtil.getShowModal({
					title: "Select Item",
					cbClose: () => searchWidget.$wrpSearch.detach() // guarantee survival of rendered element
				});
				$modalInner.append(searchWidget.$wrpSearch);
				searchWidget.doFocus();
			});

		const $btnRemove = $(`<button class="btn btn-xs btn-danger mkbru__btn-rm-row--nested-1 ml-2" title="Remove AC Feature/Item"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				fromRows.splice(fromRows.indexOf(outFrom), 1);
				$wrpFrom.empty().remove();
				ContextUtil.doTeardownContextMenu(contextId);
				doUpdateState();
			});

		const $wrpFrom = $$`<div class="flex mb-2 mkbru__wrp-rows--removable-nested-1">${$iptFrom}${$btnCommon}${$btnSearchItem}${$btnRemove}</div>`;

		const outFrom = {$wrpFrom, getAcFrom};
		fromRows.push(outFrom);
		return outFrom;
	}

	__$getHpInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Hit Points", {isMarked: true});

		const initialMode = (() => {
			if (this._state.hp.special != null) return "2";
			else {
				const parts = CreatureBuilder.__$getHpInput__getFormulaParts(this._state.hp.formula);
				return parts != null ? "0" : "1";
			}
		})();

		const _getSimpleFormula = () => {
			const modRaw = $iptSimpleMod.val().trim();
			const mod = Number(modRaw);
			const modPart = mod ? `${mod > 0 ? "+" : ""}${mod}` : "";
			return `${$selSimpleNum.val()}d${$selSimpleFace.val()}${modPart}`;
		};

		const doUpdateState = () => {
			switch ($selMode.val()) {
				case "0": {
					this._state.hp = {
						formula: _getSimpleFormula(),
						average: Number($iptSimpleAverage.val())
					};
					break;
				}
				case "1": {
					this._state.hp = {
						formula: $iptComplexFormula.val(),
						average: Number($iptComplexAverage.val())
					};
					break;
				}
				case "2": {
					this._state.hp = {special: $iptSpecial.val()};
					break;
				}
			}
			cb();
		};

		const $selMode = $(`<select class="form-control input-xs mb-2">
			<option value="0">Simple Formula</option>
			<option value="1">Complex Formula</option>
			<option value="2">Custom</option>
		</select>`)
			.appendTo($rowInner)
			.val(initialMode)
			.change(() => {
				switch ($selMode.val()) {
					case "0": $wrpSimpleFormula.show(); $wrpComplexFormula.hide(); $wrpSpecial.hide(); break;
					case "1": $wrpSimpleFormula.hide(); $wrpComplexFormula.show(); $wrpSpecial.hide(); break;
					case "2": $wrpSimpleFormula.hide(); $wrpComplexFormula.hide(); $wrpSpecial.show(); break;
				}
				doUpdateState();
			});

		// SIMPLE FORMULA STAGE
		const conHook = () => {
			if (this._meta.autoCalc.hpModifier) {
				const num = Number($selSimpleNum.val());
				const mod = Parser.getAbilityModNumber(this._state.con);
				$iptSimpleMod.val(num * mod);
				hpSimpleAverageHook();
				doUpdateState();
			}
		};

		this._addHook("state", "con", conHook);

		const hpSimpleAverageHook = () => { // no proxy required, due to being inside a child object
			if (this._meta.autoCalc.hpAverageSimple) {
				const avg = Renderer.dice.parseAverage(_getSimpleFormula());
				if (avg != null) $iptSimpleAverage.val(Math.floor(avg));
			}
		};

		const $selSimpleNum = $(`<select class="form-control input-xs mr-2">${[...new Array(50)].map((_, i) => `<option>${i + 1}</option>`)}</select>`)
			.change(() => {
				conHook();
				doUpdateState();
			});

		const $selSimpleFace = $(`<select class="form-control input-xs mr-2">${Renderer.dice.DICE.map(it => `<option>${it}</option>`)}</select>`)
			.change(() => {
				hpSimpleAverageHook();
				doUpdateState();
			});

		const $iptSimpleMod = $(`<input class="form-control form-control--minimal input-xs text-right mr-2" type="number">`)
			.change(() => {
				if (this._meta.autoCalc.hpModifier) {
					this._meta.autoCalc.hpModifier = false;
					$btnAutoSimpleFormula.removeClass("active");
				}
				hpSimpleAverageHook();
				doUpdateState();
			});

		const $btnAutoSimpleFormula = $(`<button class="btn btn-xs btn-default ${this._meta.autoCalc.hpModifier ? "active" : ""}" title="Auto-calculate modifier from Constitution"><span class="glyphicon glyphicon-refresh"/></button>`)
			.click(() => {
				if (this._meta.autoCalc.hpModifier) {
					this._meta.autoCalc.hpModifier = false;
					this.doUiSave();
				} else {
					this._meta.autoCalc.hpModifier = true;
					conHook();
				}
				$btnAutoSimpleFormula.toggleClass("active", this._meta.autoCalc.hpModifier);
			});

		const $iptSimpleAverage = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number">`)
			.change(() => {
				this._meta.autoCalc.hpAverageSimple = false;
				doUpdateState();
			});

		const $btnAutoSimpleAverage = $(`<button class="btn btn-xs btn-default ${this._meta.autoCalc.hpAverageSimple ? "active" : ""}" title="Auto-calculate"><span class="glyphicon glyphicon-refresh"/></button>`)
			.click(() => {
				if (this._meta.autoCalc.hpAverageSimple) {
					this._meta.autoCalc.hpAverageSimple = false;
					this.doUiSave();
				} else {
					this._meta.autoCalc.hpAverageSimple = true;
					hpSimpleAverageHook();
				}
				$btnAutoSimpleAverage.toggleClass("active", this._meta.autoCalc.hpAverageSimple);
			});

		const $wrpSimpleFormula = $$`<div class="flex-col">
		<div class="flex-v-center mb-2">
			<span class="mr-2 mkbru__sub-name--50">Formula</span>
			${$selSimpleNum}
			<span class="mr-2">d</span>
			${$selSimpleFace}
			<span class="mr-2">+</span>
			${$iptSimpleMod}
			${$btnAutoSimpleFormula}
		</div>
		<div class="flex-v-center mb-2"><span class="mr-2 mkbru__sub-name--50">Average</span>${$iptSimpleAverage}${$btnAutoSimpleAverage}</div>
		</div>`.toggle(initialMode === "0").appendTo($rowInner);
		if (initialMode === "0") {
			const formulaParts = CreatureBuilder.__$getHpInput__getFormulaParts(this._state.hp.formula);
			$selSimpleNum.val(`${formulaParts.hdNum}`);
			$selSimpleFace.val(`${formulaParts.hdFaces}`);
			if (formulaParts.mod != null) $iptSimpleMod.val(formulaParts.mod);
			$iptSimpleAverage.val(this._state.hp.average);
		}

		// COMPLEX FORMULA STAGE
		const hpComplexAverageHook = () => { // no proxy required, due to being inside a child object
			if (this._meta.autoCalc.hpAverageComplex) {
				const avg = Renderer.dice.parseAverage($iptComplexFormula.val());
				if (avg != null) $iptComplexAverage.val(Math.floor(avg));
			}
		};

		const $iptComplexFormula = $(`<input class="form-control form-control--minimal input-xs text-right">`)
			.change(() => {
				hpComplexAverageHook();
				doUpdateState();
			});

		const $iptComplexAverage = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number">`)
			.change(() => {
				this._meta.autoCalc.hpAverageComplex = false;
				doUpdateState();
			});

		const $btnAutoComplexAverage = $(`<button class="btn btn-xs btn-default ${this._meta.autoCalc.hpAverageComplex ? "active" : ""}" title="Auto-calculate from Formula"><span class="glyphicon glyphicon-refresh"/></button>`)
			.click(() => {
				if (this._meta.autoCalc.hpAverageComplex) {
					this._meta.autoCalc.hpAverageComplex = false;
					this.doUiSave();
				} else {
					this._meta.autoCalc.hpAverageComplex = true;
					hpComplexAverageHook();
				}
				$btnAutoComplexAverage.toggleClass("active", this._meta.autoCalc.hpAverageComplex);
			});

		const $wrpComplexFormula = $$`<div class="flex-col">
		<div class="flex-v-center mb-2"><span class="mr-2 mkbru__sub-name--50">Formula</span>${$iptComplexFormula}</div>
		<div class="flex-v-center mb-2"><span class="mr-2 mkbru__sub-name--50">Average</span>${$iptComplexAverage}${$btnAutoComplexAverage}</div>
		</div>`.toggle(initialMode === "1").appendTo($rowInner);
		if (initialMode === "1") {
			$iptComplexFormula.val(this._state.hp.formula);
			$iptComplexAverage.val(this._state.hp.average);
		}

		// SPECIAL STAGE
		const $iptSpecial = $(`<input class="form-control form-control--minimal input-xs mb-2">`)
			.change(() => doUpdateState());
		const $wrpSpecial = $$`<div>${$iptSpecial}</div>`.toggle(initialMode === "1").appendTo($rowInner);
		if (initialMode === "1") $iptSpecial.val(this._state.hp.special);

		return $row;
	}

	static __$getHpInput__getFormulaParts (formula) {
		const m = /^(\d*)d(\d+)([-+]\d+)?$/.exec(formula.replace(/\s+/g, ""));
		if (!m) return null;
		const hdNum = m[1] ? Number(m[1]) : 1;
		if (hdNum <= 0 || hdNum > 50) return null; // if it's e.g. 0d10, consider invalid. Cap at 50 HD
		const hdFaces = Number(m[2]);
		if (!Renderer.dice.DICE.includes(hdFaces)) return null; // if it's a non-standard dice face (e.g. 1d7)
		const out = {hdNum, hdFaces};
		if (m[3]) out.mod = Number(m[3]);
		return out;
	}

	__$getSpeedInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Speed", {isMarked: true});

		const $getRow = (name, prop) => {
			const doUpdateProp = () => {
				const speedRaw = $iptSpeed.val().trim();
				if (!speedRaw) {
					delete this._state.speed[prop];
					if (prop === "fly") delete this._state.speed.canHover
				} else {
					const speed = Number(speedRaw);
					const condition = $iptCond.val().trim();
					this._state.speed[prop] = (condition ? {number: speed, condition: condition} : speed);
					if (prop === "fly") this._state.speed.canHover = !!(condition && /(^|[^a-zA-Z])hover([^a-zA-Z]|$)/i.exec(condition));
				}
				cb();
			};

			const $iptSpeed = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number">`)
				.change(() => doUpdateProp());
			const $iptCond = $(`<input class="form-control form-control--minimal input-xs" placeholder="${prop === "fly" ? "(hover)/when..." : "when..."}">`)
				.change(() => doUpdateProp());

			const initial = this._state.speed[prop];
			if (initial != null) {
				if (initial.condition != null) {
					$iptSpeed.val(initial.number);
					$iptCond.val(initial.condition);
				} else $iptSpeed.val(initial);
			}

			return $$`<div class="flex-v-center mb-2">
			<span class="mr-2 mkbru__sub-name--33">${name}</span>
			<div class="flex-v-center">${$iptSpeed}<span class="mr-2">ft.</span>${$iptCond}</div>
			</div>`;
		};

		$$`<div class="flex-col">
		${$getRow("Walk", "walk")}
		${$getRow("Burrow", "burrow")}
		${$getRow("Climb", "climb")}
		${$getRow("Fly", "fly")}
		${$getRow("Swim", "swim")}
		</div>`.appendTo($rowInner);

		return $row;
	}

	__$getAbilityScoreInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Ability Scores", {isMarked: true, isRow: true});

		const $getRow = (name, prop) => {
			const $iptAbil = $(`<input class="form-control form-control--minimal input-xs" type="number">`)
				.val(this._state[prop])
				.change(() => {
					this._state[prop] = Number($iptAbil.val());
					cb();
				});

			return $$`<div class="flex-v-center mb-2 flex-col mr-1">
			<span class="mb-2 bold">${prop.toUpperCase()}</span>
			${$iptAbil}
			</div>`;
		};

		Parser.ABIL_ABVS.forEach(abv => $getRow(Parser.attAbvToFull(abv), abv).appendTo($rowInner));

		return $row;
	}

	__$getSaveInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Saving Throws", {isMarked: true, isRow: true});

		const $getRow = (name, prop) => {
			const $iptVal = $(`<input class="form-control form-control--minimal input-xs mb-2" type="number">`)
				.change(() => {
					$btnProf.removeClass("active");
					delete this._meta.profSave[prop];
					this.__$getSaveSkillInput__handleValChange(cb, "save", $iptVal, prop);
				});

			const _setFromAbility = () => {
				const total = Parser.getAbilityModNumber(this._state[prop]) + this._getProfBonus();
				(this._state.save = this._state.save || {})[prop] = total < 0 ? `${total}` : `+${total}`;
				$iptVal.val(total);
				cb();
			};

			const $btnProf = $(`<button class="btn btn-xs btn-default" title="Is Proficient">Prof.</button>`)
				.click(() => {
					if (this._meta.profSave[prop]) {
						delete this._meta.profSave[prop];
						$iptVal.val("");
						this.__$getSaveSkillInput__handleValChange(cb, "save", $iptVal, prop);
					} else {
						this._meta.profSave[prop] = 1;
						hook();
					}
					$btnProf.toggleClass("active", this._meta.profSave[prop] === 1);
				});
			if (this._meta.profSave[prop]) $btnProf.addClass("active");

			if ((this._state.save || {})[prop]) $iptVal.val(`${this._state.save[prop]}`.replace(/^\+/, "")); // remove leading plus sign

			const hook = () => {
				if (this._meta.profSave[prop] === 1) _setFromAbility();
			};
			this._addHook("state", prop, hook);
			this._addHook("meta", "profBonus", hook);

			return $$`<div class="flex-v-center flex-col mr-1 mb-2">
			<span class="mr-2 bold">${prop.toUpperCase()}</span>
			${$iptVal}${$btnProf}
			</div>`;
		};

		Parser.ABIL_ABVS.forEach(abv => $getRow(Parser.attAbvToFull(abv), abv).appendTo($rowInner));

		return $row;
	}

	__$getSkillInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Skills", {isMarked: true});

		const $getRow = (name, prop) => {
			const abilProp = Parser.skillToAbilityAbv(prop);

			const $iptVal = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number">`)
				.change(() => {
					if (this._meta.profSkill[prop]) {
						$btnProf.removeClass("active");
						$btnExpert.removeClass("active");
					}
					delete this._meta.profSkill[prop];
					this.__$getSaveSkillInput__handleValChange(cb, "skill", $iptVal, prop);
				});

			const _setFromAbility = (isExpert) => {
				const total = Parser.getAbilityModNumber(this._state[abilProp]) + (this._getProfBonus() * (2 - !isExpert));

				const nextSkills = {...(this._state.skill || {})}; // regenerate the object to allow hooks to fire
				nextSkills[prop] = total < 0 ? `${total}` : `+${total}`;
				this._state.skill = nextSkills;
				$iptVal.val(total);
				cb();
			};

			const _handleButtonPress = (isExpert) => {
				if (isExpert) {
					if (this._meta.profSkill[prop] === 2) {
						delete this._meta.profSkill[prop];
						$iptVal.val("");
						this.__$getSaveSkillInput__handleValChange(cb, "skill", $iptVal, prop);
					} else {
						this._meta.profSkill[prop] = 2;
						hook();
					}
					$btnProf.removeClass("active");
					$btnExpert.toggleClass("active", this._meta.profSkill[prop] === 2);
				} else {
					if (this._meta.profSkill[prop] === 1) {
						delete this._meta.profSkill[prop];
						$iptVal.val("");
						this.__$getSaveSkillInput__handleValChange(cb, "skill", $iptVal, prop);
					} else {
						this._meta.profSkill[prop] = 1;
						hook();
					}
					$btnProf.toggleClass("active", this._meta.profSkill[prop] === 1);
					$btnExpert.removeClass("active");
				}
			};

			const $btnProf = $(`<button class="btn btn-xs btn-default" title="Is Proficient">Prof.</button>`)
				.click(() => _handleButtonPress());
			if (this._meta.profSkill[prop] === 1) $btnProf.addClass("active");

			const $btnExpert = $(`<button class="btn btn-xs btn-default ml-2" title="Has Expertise">Expert.</button>`)
				.click(() => _handleButtonPress(true));
			if (this._meta.profSkill[prop] === 2) $btnExpert.addClass("active");

			if ((this._state.skill || {})[prop]) $iptVal.val(`${this._state.skill[prop]}`.replace(/^\+/, "")); // remove leading plus sign

			const hook = () => {
				if (this._meta.profSkill[prop] === 1) _setFromAbility();
				else if (this._meta.profSkill[prop] === 2) _setFromAbility(true);
			};
			this._addHook("state", abilProp, hook);
			this._addHook("meta", "profBonus", hook);

			return $$`<div class="flex-v-center mb-2">
			<span class="mr-2 mkbru__sub-name--33">${name}</span>
			<div class="text-muted mkbru_mon__skill-attrib-label mr-2 help--subtle" title="This skill is affected by the creature's ${Parser.attAbvToFull((Parser.skillToAbilityAbv(prop)))} score">(${Parser.skillToAbilityAbv(prop).toUpperCase()})</div>
			${$iptVal}${$btnProf}${$btnExpert}
			</div>`;
		};

		Object.keys(Parser.SKILL_TO_ATB_ABV).sort(SortUtil.ascSort).forEach(skill => $getRow(skill.toTitleCase(), skill).appendTo($rowInner));

		return $row;
	}

	__$getSaveSkillInput__handleValChange (cb, mode, $iptVal, prop) {
		// ensure to overwrite the entire object, so that any hooks trigger
		const raw = $iptVal.val();
		if (raw && raw.trim()) {
			const num = Number(raw);
			const nextState = {...this._state[mode]} || {};
			nextState[prop] = num < 0 ? `${num}` : `+${num}`;
			this._state[mode] = nextState;
		} else {
			if (this._state[mode]) {
				const nextState = {...this._state[mode]};
				delete nextState[prop];
				if (Object.keys(nextState).length === 0) delete this._state[mode];
				else this._state[mode] = nextState;
			}
		}
		cb();
	}

	__$getPassivePerceptionInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Passive Perception");

		const hook = () => {
			if (this._meta.autoCalc.passivePerception) {
				const pp = Math.round((() => {
					if (this._state.skill && this._state.skill.perception && this._state.skill.perception.trim()) return Number(this._state.skill.perception);
					else return Parser.getAbilityModNumber(this._state.wis);
				})() + 10);

				$iptPerception.val(pp);
				this._state.passive = pp;
				cb();
			}
		};
		this._addHook("state", "wis", hook);
		this._addHook("state", "skill", hook);

		const $iptPerception = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number">`)
			.change(() => {
				if (this._meta.autoCalc.passivePerception) {
					$btnAuto.removeClass("active");
					this._meta.autoCalc.passivePerception = false;
				}
				this._state.passive = Math.round(Number($iptPerception.val()));
				cb();
			})
			.val(this._state.passive || 0);

		const $btnAuto = $(`<button class="btn btn-default btn-xs ${this._meta.autoCalc.passivePerception ? "active" : ""}" title="Auto-Calculate Passive Perception"><span class="glyphicon glyphicon-refresh"/></button>`)
			.click(() => {
				if (this._meta.autoCalc.passivePerception) {
					delete this._meta.autoCalc.passivePerception;
					this.doUiSave(); // save meta-state
				} else {
					this._meta.autoCalc.passivePerception = true;
					hook();
				}
				$btnAuto.toggleClass("active", this._meta.autoCalc.passivePerception);
			});

		$$`<div class="flex-v-center">${$iptPerception}${$btnAuto}</div>`.appendTo($rowInner);

		return $row;
	}

	__$getVulnerableInput (cb) {
		return this.__$getDefencesInput(cb, "Damage Vulnerabilities", "Vulnerability", "vulnerable")
	}

	__$getResistInput (cb) {
		return this.__$getDefencesInput(cb, "Damage Resistances", "Resistance", "resist")
	}

	__$getImmuneInput (cb) {
		return this.__$getDefencesInput(cb, "Damage Immunities", "Immunity", "immune")
	}

	__$getCondImmuneInput (cb) {
		return this.__$getDefencesInput(cb, "Condition Immunities", "Immunity", "conditionImmune")
	}

	__$getDefencesInput (cb, rowName, shortName, prop) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple(rowName, {isMarked: true});

		const groups = [];
		const $wrpGroups = $(`<div/>`).appendTo($rowInner);
		const $wrpControls = $(`<div/>`).appendTo($rowInner);

		const doUpdateState = () => {
			const out = groups.map(it => it.getState());
			if (out.length) {
				// flatten a single group if there's no meta-information
				if (out.length === 1 && !out[0].note && !out[0].preNote) this._state[prop] = [...out[0][prop]];
				else this._state[prop] = out;
			} else delete this._state[prop];
			cb();
		};

		const doAddGroup = data => {
			const group = CreatureBuilder.__$getDefencesInput__getNodeGroup(shortName, prop, groups, doUpdateState, 0, data);
			groups.push(group);
			group.$ele.appendTo($wrpGroups);
		};

		const $btnAddGroup = $(`<button class="btn btn-xs btn-default mr-2">Add Group</button>`)
			.appendTo($wrpControls)
			.click(() => doAddGroup());

		if (this._state[prop]) {
			// convert flat arrays into wrapped objects
			if (this._state[prop].some(it => it[prop] == null)) doAddGroup({[prop]: this._state[prop]});
			else this._state[prop].forEach(dmgType => doAddGroup(dmgType));
		}

		return $row;
	}

	static __$getDefencesInput__getNodeGroup (shortName, prop, groups, doUpdateState, depth, initial) {
		const children = [];
		const getState = () => {
			const out = {
				[prop]: children.map(it => it.getState()).filter(Boolean)
			};
			if ($iptNotePre.val().trim()) out.preNote = $iptNotePre.val().trim();
			if ($iptNotePost.val().trim()) out.note = $iptNotePost.val().trim();
			return out;
		};

		const addChild = (child, doUpdate = true) => {
			if (child == null) return;
			children.push(child);

			children.sort((a, b) => {
				// sort specials and groups to the bottom, in that order
				// `.order` ensures no non-deterministic shuffling occurs
				if ((a.type === "group" || a.type === "special") && a.type === b.type) return b.order - a.order;
				else if (a.type === "group" && b.type === "special") return 1;
				else if (a.type === "special" && b.type === "group") return -1;
				else if (a.type === "group" || a.type === "special") return 1;
				else if (b.type === "group" || b.type === "special") return -1;
				else return SortUtil.ascSort(a.type, b.type) || b.order - a.order;
			}).forEach(child => {
				child.$ele.detach();
				$wrpChildren.append(child.$ele);
			});

			if (doUpdate) doUpdateState();
		};

		const contextId = ContextUtil.getNextGenericMenuId();
		const optionsList = prop === "conditionImmune" ? Parser.CONDITIONS : Parser.DMG_TYPES;
		ContextUtil.doInitContextMenu(contextId, (evt, ele, $invokedOn, $selectedMenu) => {
			const val = Number($selectedMenu.data("ctx-id"));
			const child = (() => {
				const alreadyExists = (type) => children.some(ch => ch.type === type);

				if (val < optionsList.length) {
					if (alreadyExists(optionsList[val])) return null;
					return CreatureBuilder.__$getDefencesInput__getNodeItem(shortName, children, doUpdateState, optionsList[val]);
				} else if (val === optionsList.length) {
					if (alreadyExists("special")) return null;
					return CreatureBuilder.__$getDefencesInput__getNodeItem(shortName, children, doUpdateState, "special");
				}
			})();

			addChild(child);
		}, [...optionsList.map(it => it.toTitleCase()), null, "Special"]);

		const $btnAddChild = $(`<button class="btn btn-xs btn-default mr-2">Add ${shortName}</button>`)
			.click((evt) => ContextUtil.handleOpenContextMenu(evt, $btnAddChild, contextId));
		const $btnAddChildGroup = $(`<button class="btn btn-xs btn-default mr-2">Add Child Group</button>`)
			.click(() => addChild(CreatureBuilder.__$getDefencesInput__getNodeGroup(shortName, prop, children, doUpdateState, depth + 1)));
		const $iptNotePre = $(`<input class="form-control input-xs form-control--minimal mr-2" placeholder="Pre- note">`)
			.change(() => doUpdateState());
		const $iptNotePost = $(`<input class="form-control input-xs form-control--minimal mr-2" placeholder="Post- note">`)
			.change(() => doUpdateState());
		const $btnRemove = $(`<button class="btn btn-xs btn-danger mkbru__btn-rm-row" title="Remove ${shortName} Group"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				groups.splice(groups.indexOf(out), 1);
				$ele.remove();
				doUpdateState();
			});

		const $wrpChildren = $(`<div class="flex-col"/>`);
		const $wrpControls = $$`<div class="mb-2 flex-v-center">${$btnAddChild}${$btnAddChildGroup}${$iptNotePre}${$iptNotePost}${$btnRemove}</div>`;

		const $ele = (() => {
			const $base = $$`<div class="flex-col ${depth ? "" : "mkbru__wrp-rows"}">${$wrpControls}${$wrpChildren}</div>`;
			if (!depth) return $base;
			else return $$`<div class="flex-v-center w-100"><div class="mkbru_mon__row-indent"/>${$base}</div>`
		})();

		if (initial) {
			$iptNotePre.val(initial.preNote || "");
			$iptNotePost.val(initial.note || "");
			initial[prop].forEach(dmgType => {
				if (typeof dmgType === "string") addChild(CreatureBuilder.__$getDefencesInput__getNodeItem(shortName, children, doUpdateState, dmgType), false);
				else if (dmgType.special != null) addChild(CreatureBuilder.__$getDefencesInput__getNodeItem(shortName, children, doUpdateState, "special", dmgType.special), false);
				else addChild(CreatureBuilder.__$getDefencesInput__getNodeGroup(shortName, prop, children, doUpdateState, depth + 1, dmgType), false);
			});
		}

		const out = {getState, $ele, type: "group", order: CreatureBuilder._rowSortOrder++};
		return out;
	}

	static __$getDefencesInput__getNodeItem (shortName, children, doUpdateState, type, value) {
		const $btnRemove = $(`<button class="btn btn-xxs btn-danger" title="Remove ${shortName} Entry"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				children.splice(children.indexOf(out), 1);
				$ele.remove();
				doUpdateState();
			});

		const {$ele, getState} = (() => {
			switch (type) {
				case "special": {
					const $iptSpecial = $(`<input class="form-control form-control--minimal input-xs mr-2">`)
						.change(() => doUpdateState());
					if (value != null) $iptSpecial.val(value);

					return {
						$ele: $$`<div class="mb-2 split flex-v-center mkbru__wrp-btn-xxs">${$iptSpecial}${$btnRemove}</div>`,
						getState: () => {
							const raw = $iptSpecial.val().trim();
							if (raw) return {special: raw};
							return null;
						}
					}
				}
				default: {
					return {
						$ele: $$`<div class="mb-2 split flex-v-center mkbru__wrp-btn-xxs"><span class="mr-2">&bull; ${type.uppercaseFirst()}</span>${$btnRemove}</div>`,
						getState: () => type
					}
				}
			}
		})();

		const out = {$ele, getState, type, order: CreatureBuilder._rowSortOrder++};
		return out;
	}

	__$getSenseInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Senses");

		const doUpdateState = () => {
			const raw = $iptSenses.val().trim();
			if (!raw) delete this._state.senses;
			else this._state.senses = raw.split(StrUtil.COMMA_SPACE_NOT_IN_PARENTHESES_REGEX);
			cb();
		};

		const $iptSenses = $(`<input class="form-control input-xs form-control--minimal mr-2">`)
			.change(() => doUpdateState());
		if (this._state.senses && this._state.senses.length) $iptSenses.val(this._state.senses.join(", "));

		const contextId = ContextUtil.getNextGenericMenuId();
		const _CONTEXT_ENTRIES = Object.keys(Parser.SENSE_JSON_TO_FULL).map(it => it.uppercaseFirst());
		ContextUtil.doInitContextMenu(contextId, async (evt, ele, $invokedOn, $selectedMenu) => {
			const val = Number($selectedMenu.data("ctx-id"));
			const sense = _CONTEXT_ENTRIES[val].toLowerCase();

			const feet = await InputUiUtil.pGetUserNumber({min: 0, int: true, title: "Enter the Number of Feet"});
			if (feet == null) return;

			const curr = $iptSenses.val().trim();
			const toAdd = `${sense} ${feet} ft.`;
			$iptSenses.val(curr ? `${curr}, ${toAdd}` : toAdd);

			doUpdateState();
		}, _CONTEXT_ENTRIES);

		const $btnAddGeneric = $(`<button class="btn btn-xs btn-default mr-2 mkbru_mon__btn-add-sense-language">Add Sense</button>`)
			.click((evt) => ContextUtil.handleOpenContextMenu(evt, $btnAddGeneric, contextId));

		const $btnSort = BuilderUi.$getSplitCommasSortButton($iptSenses, doUpdateState);

		$$`<div class="flex-v-center">${$iptSenses}${$btnAddGeneric}${$btnSort}</div>`.appendTo($rowInner);

		return $row;
	}

	__$getLanguageInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Languages");

		const doUpdateState = () => {
			const raw = $iptLanguages.val().trim();
			if (!raw) delete this._state.languages;
			else this._state.languages = raw.split(StrUtil.COMMA_SPACE_NOT_IN_PARENTHESES_REGEX);
			cb();
		};

		const $iptLanguages = $(`<input class="form-control input-xs form-control--minimal mr-2">`)
			.change(() => doUpdateState());
		if (this._state.languages && this._state.languages.length) $iptLanguages.val(this._state.languages.join(", "));

		const availLanguages = Object.entries(this._bestiaryMetaRaw.language).filter(([k, v]) => !CreatureBuilder._LANGUAGE_BLACKLIST.has(k))
			.map(([k, v]) => v === "Telepathy" ? "telepathy" : v); // lowercase telepathy

		const $btnAddGeneric = $(`<button class="btn btn-xs btn-default mr-2 mkbru_mon__btn-add-sense-language">Add Language</button>`)
			.click(async () => {
				const language = await InputUiUtil.pGetUserString({
					title: "Enter a Language",
					default: "Common",
					autocomplete: availLanguages
				});

				if (language != null) {
					const curr = $iptLanguages.val().trim();
					$iptLanguages.val(curr ? `${curr}, ${language}` : language);

					doUpdateState();
				}
			});

		const $btnSort = BuilderUi.$getSplitCommasSortButton($iptLanguages, doUpdateState, {bottom: [/telepathy/i]});

		$$`<div class="flex-v-center">${$iptLanguages}${$btnAddGeneric}${$btnSort}</div>`.appendTo($rowInner);

		return $row;
	}

	__$getCrInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Challenge Rating", {isMarked: true});

		const initialMode = this._state.cr != null ? this._state.cr.lair ? "1" : this._state.cr.coven ? "2" : "0" : "3";

		const $selMode = $(`<select class="form-control input-xs mb-2">
			<option value="0">Basic Challenge Rating</option>
			<option value="1">Has Lair Challenge Rating</option>
			<option value="2">Has Coven Challenge Rating</option>
			<option value="3">No Challenge Rating</option>
		</select>`).val(initialMode).change(() => {
			switch ($selMode.val()) {
				case "0": {
					$stageBasic.show(); $stageLair.hide(); $stageCoven.hide();
					this._state.cr = $selCr.val();
					break;
				}
				case "1": {
					$stageBasic.show(); $stageLair.show(); $stageCoven.hide();
					this._state.cr = {
						cr: $selCr.val(),
						lair: $selCrLair.val()
					};
					break;
				}
				case "2": {
					$stageBasic.show(); $stageLair.hide(); $stageCoven.show();
					this._state.cr = {
						cr: $selCr.val(),
						coven: $selCrCoven.val()
					};
					break;
				}
				case "3": {
					$stageBasic.hide(); $stageLair.hide(); $stageCoven.hide();
					delete this._state.cr;
					break;
				}
			}
			cb();
		}).appendTo($rowInner);

		// BASIC CONTROLS
		const $selCr = $(`<select class="form-control input-xs mb-2">${Parser.CRS.map(it => `<option>${it}</option>`).join("")}</select>`)
			.val(this._state.cr ? (this._state.cr.cr || this._state.cr) : null).change(() => {
				if ($selMode.val() === "0") this._state.cr = $selCr.val();
				else this._state.cr.cr = $selCr.val();
				cb();
			});
		const $stageBasic = $$`<div>${$selCr}</div>`
			.appendTo($rowInner).toggle(initialMode !== "3");

		// LAIR CONTROLS
		const $selCrLair = $(`<select class="form-control input-xs">${Parser.CRS.map(it => `<option>${it}</option>`).join("")}</select>`)
			.change(() => {
				this._state.cr.lair = $selCrLair.val();
				cb();
			});
		const $stageLair = $$`<div class="flex-v-center mb-2"><span class="mr-2 mkbru__sub-name--33">While in lair</span>${$selCrLair}</div>`
			.appendTo($rowInner).toggle(initialMode === "1");
		initialMode === "1" && $selCrLair.val(this._state.cr.cr);

		// COVEN CONTROLS
		const $selCrCoven = $(`<select class="form-control input-xs">${Parser.CRS.map(it => `<option>${it}</option>`).join("")}</select>`)
			.change(() => {
				this._state.cr.coven = $selCrCoven.val();
				cb();
			});
		const $stageCoven = $$`<div class="flex-v-center mb-2"><span class="mr-2 mkbru__sub-name--33">While in coven</span>${$selCrCoven}</div>`
			.appendTo($rowInner).toggle(initialMode === "2");
		initialMode === "2" && $selCrCoven.val(this._state.cr.cr);

		return $row;
	}

	// this doesn't directly affect state, but is used as a helper for other inputs
	__$getProfBonusInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Proficiency Bonus");

		const hook = () => {
			// update proficiency bonus input as required
			if (this._meta.autoCalc.proficiency) {
				if (this._state.cr == null) {
					$iptProfBonus.val(0);
					this._meta.profBonus = 0;
				} else {
					const pb = Parser.crToPb(this._state.cr.cr || this._state.cr);
					$iptProfBonus.val(pb);
					this._meta.profBonus = pb;
				}
				cb();
			}
		};
		this._addHook("state", "cr", hook);

		const $iptProfBonus = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number" min="0">`)
			.val(this._getProfBonus())
			.change(() => {
				this._meta.profBonus = Math.round(Number($iptProfBonus.val()));
				this._meta.autoCalc.proficiency = false;
				cb();
			});

		const $btnAuto = $(`<button class="btn btn-xs btn-default ${this._meta.autoCalc.proficiency ? "active" : ""}" title="Auto-calculate from Challenge Rating (DMG p. 274)"><span class="glyphicon glyphicon-refresh"/></button>`)
			.click(() => {
				if (this._meta.autoCalc.proficiency) {
					this._meta.autoCalc.proficiency = false;
					this.doUiSave();
				} else {
					this._meta.autoCalc.proficiency = true;
					hook();
				}
				$btnAuto.toggleClass("active", this._meta.autoCalc.proficiency);
			});

		$$`<div class="flex-v-center">${$iptProfBonus}${$btnAuto}</div>`.appendTo($rowInner);

		return $row;
	}

	_getProfBonus () {
		if (this._meta.profBonus != null) return this._meta.profBonus || 0;
		else return this._state.cr == null ? 0 : Parser.crToPb(this._state.cr.cr || this._state.cr);
	}

	__$getSpellcastingInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Spellcasting", {isMarked: true});

		const traitRows = [];
		const $wrpRows = $(`<div/>`).appendTo($rowInner);
		const $wrpControls = $(`<div/>`).appendTo($rowInner);

		const $btnAddRow = $(`<button class="btn btn-xs btn-default">Add Spellcasting Trait</button>`)
			.appendTo($wrpControls)
			.click(() => {
				doAddTrait();
				doUpdateState();
			});

		const doUpdateState = () => {
			if (!traitRows.length) delete this._state.spellcasting;
			else {
				const spellcastingTraits = traitRows.map(r => r.getState()).filter(Boolean);
				if (spellcastingTraits.length) this._state.spellcasting = spellcastingTraits;
				else delete this._state.spellcasting;
			}
			cb();
		};

		const doAddTrait = trait => {
			const row = CreatureBuilder.__$getSpellcastingInput__getTraitRow(traitRows, doUpdateState, trait);
			traitRows.push(row);
			row.$ele.appendTo($wrpRows);
		};

		if (this._state.spellcasting) this._state.spellcasting.forEach(sc => doAddTrait(sc));

		return $row;
	}

	static __$getSpellcastingInput__getTraitRow (traitRows, doUpdateState, trait) {
		const getState = () => {
			const out = {
				name: $iptName.val().trim()
			};

			if ($btnToggleHeader.hasClass("active")) out.headerEntries = UiUtil.getTextAsEntries($iptHeader.val());
			if (out.headerEntries && !out.headerEntries.length) delete out.headerEntries;
			if ($btnToggleFooter.hasClass("active")) out.footerEntries = UiUtil.getTextAsEntries($iptFooter.val());
			if (out.footerEntries && !out.footerEntries.length) delete out.footerEntries;

			const deepMerge = (target, k, v) => {
				const curr = target[k];
				if (curr == null) target[k] = v;
				else {
					if (typeof v === "object") {
						if (v instanceof Array) target[k] = curr.concat(v);
						else Object.entries(v).forEach(([kSub, vSub]) => deepMerge(curr, kSub, vSub));
					}
				}
			};

			spellRows.forEach(sr => {
				const rowState = sr.getState(); // returns part of a "spellcasting" item; e.g. `{daily: {1e: [...]} }`
				if (rowState == null) return;

				Object.entries(rowState).forEach(([k, v]) => deepMerge(out, k, v));
			});

			SpellcastingTraitConvert.mutSpellcastingAbility(out);

			// auto-hide innately cast spells embedded in the header
			if (out.headerEntries) {
				const strHeader = JSON.stringify(out.headerEntries);
				if (/can innately cast {@spell /i.test(strHeader)) out.hidden = [/per day/i.test(strHeader) ? "daily" : "will"];
				else delete out.hidden;
			} else delete out.hidden;

			if (!Object.keys(out).some(it => it !== "name")) return null;

			return out;
		};

		const spellRows = [];
		const doAddSpellRow = (meta, data) => {
			const row = CreatureBuilder.__$getSpellcastingInput__getSpellGenericRow(spellRows, doUpdateState, meta, data);
			spellRows.push(row);
			row.$ele.appendTo($wrpSubRows);
		};

		const $iptName = $(`<input class="form-control form-control--minimal input-xs mr-2" placeholder="Trait name">`)
			.change(() => doUpdateState());
		$iptName.val(trait ? trait.name : "Spellcasting");

		const $btnToggleHeader = $(`<button class="btn btn-xs btn-default mr-2">Header</button>`)
			.click(() => {
				$btnToggleHeader.toggleClass("active");
				$iptHeader.toggle($btnToggleHeader.hasClass("active"));
				doUpdateState();
			})
			.toggleClass("active", !!(trait && trait.headerEntries));

		const $btnToggleFooter = $(`<button class="btn btn-xs btn-default mr-2">Footer</button>`)
			.click(() => {
				$btnToggleFooter.toggleClass("active");
				$iptFooter.toggle($btnToggleFooter.hasClass("active"));
				doUpdateState();
			})
			.toggleClass("active", !!(trait && trait.footerEntries));

		const contextId = ContextUtil.getNextGenericMenuId();
		const _CONTEXT_ENTRIES = [
			{
				display: "Cantrips",
				type: "0",
				mode: "cantrip"
			},
			{
				display: "\uD835\uDC65th level spells",
				mode: "level"
			},
			null,
			{
				display: "Constant effects",
				type: "constant",
				mode: "basic"
			},
			{
				display: "At will spells",
				type: "will",
				mode: "basic"
			},
			{
				display: "\uD835\uDC65/day (/each) spells",
				type: "daily",
				mode: "frequency"
			},
			null,
			{
				display: "\uD835\uDC65/rest (/each) spells",
				type: "rest",
				mode: "frequency"
			},
			{
				display: "\uD835\uDC65/week (/each) spells",
				type: "week",
				mode: "frequency"
			}
		];
		ContextUtil.doInitContextMenu(contextId, async (evt, ele, $invokedOn, $selectedMenu) => {
			const val = Number($selectedMenu.data("ctx-id"));
			const contextMeta = _CONTEXT_ENTRIES.filter(Boolean)[val];

			// prevent double-adding
			switch (contextMeta.type) {
				case "constant":
				case "will":
					if (spellRows.some(it => it.type === contextMeta.type)) return;
					break;
			}

			const meta = {mode: contextMeta.mode, type: contextMeta.type};
			if (contextMeta.mode === "level") {
				const level = await InputUiUtil.pGetUserNumber({min: 1, int: true});
				if (level == null) return;
				meta.level = level;
			}

			// prevent double-adding, round 2
			switch (contextMeta.mode) {
				case "cantrip":
				case "level":
					if (spellRows.some(it => it.type === meta.level)) return;
					break;
			}

			doAddSpellRow(meta);
			doUpdateState();
		}, _CONTEXT_ENTRIES.map(it => it ? it.display : it));

		const $btnAddSpell = $(`<button class="btn btn-xs btn-default">Add...</button>`)
			.click((evt) => ContextUtil.handleOpenContextMenu(evt, $btnAddSpell, contextId));

		const $iptHeader = $(`<textarea class="form-control form-control--minimal resize-vertical mb-2" placeholder="Header text"/>`)
			.toggle(!!(trait && trait.headerEntries))
			.change(() => doUpdateState());
		if (trait && trait.headerEntries) $iptHeader.val(UiUtil.getEntriesAsText(trait.headerEntries));

		const $iptFooter = $(`<textarea class="form-control form-control--minimal resize-vertical mb-2" placeholder="Footer text"/>`)
			.toggle(!!(trait && trait.footerEntries))
			.change(() => doUpdateState());
		if (trait && trait.footerEntries) $iptFooter.val(UiUtil.getEntriesAsText(trait.footerEntries));

		const $wrpControls = $$`<div class="flex-v-center mb-2">${$iptName}${$btnToggleHeader}${$btnToggleFooter}${$btnAddSpell}</div>`;
		const $wrpSubRows = $$`<div class="flex-col"></div>`;
		const $wrpSubRowsOuter = $$`<div class="flex-col">${$iptHeader}${$wrpSubRows}${$iptFooter}</div>`;

		const $btnRemove = $(`<button class="btn btn-xs btn-danger" title="Remove Trait"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				const currState = getState();
				if (currState) {
					delete currState.name; // ignore name key
					if ((currState.headerEntries || currState.footerEntries || Object.keys(currState).some(it => it !== "headerEntries" && it !== "footerEntries")) && !confirm("Are you sure?")) return;
				}

				traitRows.splice(traitRows.indexOf(out), 1);
				$ele.empty().remove();
				doUpdateState();
			});

		const $ele = $$`<div class="flex-col mkbru__wrp-rows">
		${$wrpControls}
		${$wrpSubRowsOuter}
		<div class="text-right mb-2">${$btnRemove}</div>
		</div>`;

		if (trait) {
			const handleFrequency = prop => Object.entries(trait[prop])
				.forEach(([k, v]) => doAddSpellRow({mode: "frequency", type: prop, each: k.endsWith("e"), count: Number(k[0])}, v));

			if (trait.constant) doAddSpellRow({mode: "basic", type: "constant"}, trait.constant);
			if (trait.will) doAddSpellRow({mode: "basic", type: "will"}, trait.will);
			if (trait.daily) handleFrequency("daily");
			if (trait.rest) handleFrequency("rest");
			if (trait.weekly) handleFrequency("weekly");
			if (trait.spells) {
				Object.entries(trait.spells).forEach(([k, v]) => {
					const level = Number(k);
					if (k === "0") doAddSpellRow({mode: "cantrip", type: level}, v.spells);
					else doAddSpellRow({mode: "level", type: level, lower: v.lower, slots: v.slots, level}, v.spells);
				});
			}
		}

		const out = {$ele, getState};
		return out;
	}

	static __$getSpellcastingInput__getSpellGenericRow (spellRows, doUpdateState, meta, data) {
		const setValueByPath = (root, keyPath, value) => {
			for (let i = 0; i < keyPath.length - 1; ++i) root = (root[keyPath[i]] = root[keyPath[i]] || {});
			root[keyPath.last()] = value;
		};

		const rowItems = [];
		const getState = () => {
			const childState = rowItems.map(ri => ri.getState());
			if (childState.length) {
				const keyPath = metaPart.getKeyPath();
				const out = {};
				setValueByPath(out, keyPath, childState);

				if (metaPart.getAdditionalData) {
					const additionalData = metaPart.getAdditionalData();
					additionalData.filter(it => it.value != null).forEach(it => setValueByPath(out, it.keyPath, it.value))
				}

				return out;
			} else return null;
		};

		const $wrpItems = $(`<div class="flex-col"/>`);

		const $btnAdd = $(`<button class="btn btn-xxs btn-default mr-2" title="Add Spell"><span class="glyphicon glyphicon-plus"/></button>`)
			.click(async () => {
				const options = {};

				if (meta.level) options.level = meta.level;
				if (meta.mode === "cantrip") options.level = 0;

				if (metaPart.filterIgnoreLevel && metaPart.filterIgnoreLevel()) delete options.level;

				const spell = await SearchWidget.pGetUserSpellSearch(options);
				if (spell) {
					addItem(spell.tag);
					doUpdateState();
				}
			});

		const $btnRemove = $(`<button class="btn btn-xxs btn-danger" title="Remove Spell Group"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				spellRows.splice(spellRows.indexOf(out), 1);
				$ele.empty().remove();
				doUpdateState();
			});

		const addItem = spell => {
			const item = CreatureBuilder.__$getSpellcastingInput__getSpellGenericRow__getRowItem(rowItems, doUpdateState, spell);
			rowItems.push(item);

			// sort the rows and re-arrange them as required
			rowItems.forEach(it => it._sortString = Renderer.stripTags(it.getState())); // should always return an entry string
			rowItems.sort((a, b) => SortUtil.ascSortLower(a._sortString, b._sortString) || b.order - a.order)
				.forEach(rowItem => {
					rowItem.$ele.detach();
					$wrpItems.append(rowItem.$ele);
				});
		};

		const metaPart = (() => {
			const out = {};

			switch (meta.mode) {
				case "basic": {
					out.$ele = $$`<i>${meta.type === "constant" ? "Constant Effects" : "At Will"}</i>`;
					out.getKeyPath = () => [meta.type];
					break;
				}

				case "frequency": {
					const $iptFreq = $(`<input class="form-control form-control--minimal input-xs mkbru_mon__spell-header-ipt" type="number" min="1" max="9">`)
						.change(() => doUpdateState());
					if (data) $iptFreq.val(meta.count || 1);
					else $iptFreq.val(1);

					const $cbEach = $(`<input class="mkbru__ipt-cb mkbru__ipt-cb--small-offset" type="checkbox">`)
						.prop("checked", data && meta.each)
						.change(() => doUpdateState());

					const name = (() => {
						switch (meta.type) {
							case "daily": return "/Day";
							case "rest": return "/Rest";
							case "weekly": return "/Week"
						}
					})();

					out.$ele = $$`<div class="flex mkbru_mon__spell-header-wrp mr-4">
					${$iptFreq}
					<span class="mr-2 italic">${name}</span>
					<label class="flex-v-baseline text-muted small ml-auto"><span class="mr-1">(Each? </span>${$cbEach}<span>)</span></label>
					</div>`;

					out.getKeyPath = () => [meta.type, `${Math.max(Math.min(9, Math.round(Number($iptFreq.val()))), 1)}${$cbEach.prop("checked") ? "e" : ""}`];

					break;
				}

				case "cantrip": {
					out.$ele = $$`<i>Cantrips</i>`;
					out.getKeyPath = () => ["spells", "0", "spells"];
					break;
				}

				case "level": {
					const $iptSlots = $(`<input type="number" class="form-control form-control--minimal input-xs mkbru_mon__spell-header-ipt mr-2">`)
						.val(meta.slots || 0)
						.change(() => doUpdateState());

					const $cbWarlock = $(`<input type="checkbox" class="mkbru__ipt-cb">`)
						.prop("checked", !!meta.lower)
						.change(() => doUpdateState());

					out.$ele = $$`<div class="flex mkbru_mon__spell-header-wrp mr-4">
					<div class="italic">${Parser.spLevelToFull(meta.level)}-level Spells</div>
					<div class="flex-v-center text-muted small ml-auto"><span>(</span>${$iptSlots}<span class="mr-2">Slots</span></div>
					<div class="mkbru_mon__spell-header-divider mr-2"/>
					<label class="flex-v-center text-muted small"><span class="mr-1">Warlock?</span>${$cbWarlock}<span>)</span></label>
					</div>`;
					out.getKeyPath = () => ["spells", `${meta.level}`, "spells"];
					out.getAdditionalData = () => {
						return [
							{
								keyPath: ["spells", `${meta.level}`, "slots"],
								value: Number($iptSlots.val())
							},
							{
								keyPath: ["spells", `${meta.level}`, "lower"],
								value: $cbWarlock.prop("checked") ? 1 : null
							}
						]
					};
					out.filterIgnoreLevel = () => $cbWarlock.prop("checked");
				}
			}

			return out;
		})();

		const $ele = $$`<div class="flex-col">
		<div class="split flex-v-center mb-2">
			${metaPart.$ele}
			<div class="flex-v-center mkbru__wrp-btn-xxs">${$btnAdd}${$btnRemove}</div>
		</div>
		${$wrpItems}
		<div class="mkbru_mon__spell-divider mb-2"/>
		</div>`;

		if (data) data.forEach(spell => addItem(spell));

		const out = {$ele, getState, type: meta.type};
		return out;
	}

	static __$getSpellcastingInput__getSpellGenericRow__getRowItem (rowItems, doUpdateState, spellEntry) {
		const getHtml = () => `&bull; ${Renderer.get().render(spellEntry)}`;

		const $iptSpell = $(`<input class="form-control form-control--minimal input-xs mr-2">`)
			.val(spellEntry)
			.change(() => {
				spellEntry = $iptSpell.val();
				$wrpRender.html(getHtml());
				doUpdateState();
			})
			.hide();

		const $btnToggleEdit = $(`<button class="btn btn-xxs btn-default mr-2" title="Toggle Edit Mode"><span class="glyphicon glyphicon-pencil"/></button>`)
			.click(() => {
				$btnToggleEdit.toggleClass("active");
				$iptSpell.toggle($btnToggleEdit.hasClass("active"));
				$wrpRender.toggle(!$btnToggleEdit.hasClass("active"));
			});

		const $wrpRender = $(`<div class="mr-2">${getHtml()}</div>`);

		const $btnRemove = $(`<button class="btn btn-xxs btn-danger" title="Remove Spell"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				rowItems.splice(rowItems.indexOf(out), 1);
				$ele.empty().remove();
				doUpdateState();
			});

		const $ele = $$`<div class="split flex-v-center mb-2 mkbru_mon__spell-wrp-edit">
		${$wrpRender}${$iptSpell}
		<div class="flex-v-center mkbru__wrp-btn-xxs">${$btnToggleEdit}${$btnRemove}</div>
		</div>`;

		const getState = () => spellEntry;

		const out = {$ele, getState, order: CreatureBuilder._rowSortOrder++};
		return out;
	}

	__$getTraitInput (cb) {
		return this.__$getGenericEntryInput(cb, {
			name: "Traits",
			shortName: "Trait",
			prop: "trait",
			canReorder: false,
			generators: [
				{
					name: "Add Predefined Trait",
					action: () => {
						let traitIndex;
						return new Promise(resolve => {
							const searchWidget = new SearchWidget(
								{Trait: this._indexedTraits},
								async (ix) => {
									traitIndex = ix;
									doClose(true);
								},
								{
									defaultCategory: "Trait",
									searchOptions: {
										fields: {
											n: {boost: 5, expand: true}
										},
										expand: true
									},
									fnTransform: (doc) => doc.id
								}
							);
							const {$modalInner, doClose} = UiUtil.getShowModal({
								title: "Select a Trait",
								cbClose: (isDataEntered) => {
									searchWidget.$wrpSearch.detach();
									if (!isDataEntered) return resolve(null);
									const trait = MiscUtil.copy(this._jsonCreature.trait[traitIndex]);
									trait.entries = JSON.parse(JSON.stringify(trait.entries).replace(/<\$name\$>/gi, this._state.name));
									resolve(trait);
								}
							});
							$modalInner.append(searchWidget.$wrpSearch);
							searchWidget.doFocus();
						})
					}
				}
			]
		});
	}

	__$getActionInput (cb) {
		return this.__$getGenericEntryInput(cb,
			{
				name: "Actions",
				shortName: "Action",
				prop: "action",
				generators: [
					{
						name: "Generate Attack",
						action: () => {
							return new Promise(resolve => {
								const {$modalInner, doClose} = UiUtil.getShowModal({
									title: "Generate Attack",
									cbClose: (isDataEntered) => {
										this._generateAttackCache = getState();
										if (!isDataEntered) return resolve(null);
										const data = getFormData();
										if (!data) return resolve(null);
										resolve(data);
									},
									fullHeight: true
								});

								const $iptName = $(`<input class="form-control form-control--minimal input-xs mr-2" placeholder="Weapon">`);
								const $cbMelee = $(`<input type="checkbox" class="mkbru__ipt-cb--plain">`)
									.change(() => $stageMelee.toggle($cbMelee.prop("checked")))
									.prop("checked", true);
								const $cbRanged = $(`<input type="checkbox" class="mkbru__ipt-cb--plain">`)
									.change(() => $stageRanged.toggle($cbRanged.prop("checked")));
								const $cbFinesse = $(`<input type="checkbox" class="mkbru__ipt-cb--plain">`);
								const $cbVersatile = $(`<input type="checkbox" class="mkbru__ipt-cb--plain">`)
									.change(() => $stageVersatile.toggle($cbVersatile.prop("checked")));
								const $cbBonusDamage = $(`<input type="checkbox" class="mkbru__ipt-cb--plain">`)
									.change(() => $stageBonusDamage.toggle($cbBonusDamage.prop("checked")));

								const $iptMeleeRange = $(`<input class="form-control form-control--minimal input-xs" type="number" value="5">`);
								const $iptMeleeDamDiceCount = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number" placeholder="Number of Dice" min="1" value="1">`);
								const $iptMeleeDamDiceNum = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number" placeholder="Dice Type" value="6">`);
								const $iptMeleeDamType = $(`<input class="form-control form-control--minimal input-xs" placeholder="Melee Damage Type" autocomplete="off">`)
									.typeahead({source: Parser.DMG_TYPES});
								const $stageMelee = $$`<div class="flex-col"><hr class="hr-3">
								<div class="flex-v-center mb-2"><span class="mr-2 no-shrink">Melee Range (ft.)</span>${$iptMeleeRange}</div>
								<div class="flex-v-center mb-2">${$iptMeleeDamDiceCount}<span class="mr-2">d</span>${$iptMeleeDamDiceNum}${$iptMeleeDamType}</div>
								</div>`;

								const $iptRangedShort = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number">`);
								const $iptRangedLong = $(`<input class="form-control form-control--minimal input-xs" type="number">`);
								const $iptRangedDamDiceCount = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number" placeholder="Number of Dice" min="1" value="1">`);
								const $iptRangedDamDiceNum = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number" placeholder="Dice Type" value="6">`);
								const $iptRangedDamType = $(`<input class="form-control form-control--minimal input-xs" placeholder="Ranged Damage Type">`)
									.typeahead({source: Parser.DMG_TYPES});
								const $stageRanged = $$`<div class="flex-col"><hr class="hr-3">
								<div class="flex-v-center mb-2">
									<span class="mr-2 no-shrink">Short Range (ft.)</span>${$iptRangedShort}
									<span class="mr-2 no-shrink">Long Range (ft.)</span>${$iptRangedLong}
								</div>
								<div class="flex-v-center mb-2">${$iptRangedDamDiceCount}<span class="mr-2">d</span>${$iptRangedDamDiceNum}${$iptRangedDamType}</div>
								</div>`.hide();

								const $iptVersatileDamDiceCount = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number" placeholder="Number of Dice" min="1" value="1">`);
								const $iptVersatileDamDiceNum = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number" placeholder="Dice Type" value="8">`);
								const $iptVersatileDamType = $(`<input class="form-control form-control--minimal input-xs" placeholder="Two-Handed Damage Type">`)
									.typeahead({source: Parser.DMG_TYPES});
								const $stageVersatile = $$`<div class="flex-col"><hr class="hr-3">
								<div class="flex-v-center mb-2">${$iptVersatileDamDiceCount}<span class="mr-2">d</span>${$iptVersatileDamDiceNum}${$iptVersatileDamType}</div>
								</div>`.hide();

								const $iptBonusDamDiceCount = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number" placeholder="Number of Dice" min="1" value="1">`);
								const $iptBonusDamDiceNum = $(`<input class="form-control form-control--minimal input-xs mr-2" type="number" placeholder="Dice Type" value="6">`);
								const $iptBonusDamType = $(`<input class="form-control form-control--minimal input-xs" placeholder="Bonus Damage Type">`)
									.typeahead({source: Parser.DMG_TYPES});
								const $stageBonusDamage = $$`<div class="flex-col"><hr class="hr-3">
								<div class="flex-v-center mb-2">${$iptBonusDamDiceCount}<span class="mr-2">d</span>${$iptBonusDamDiceNum}${$iptBonusDamType}</div>
								</div>`.hide();

								const $btnConfirm = $(`<button class="btn btn-sm btn-default">Add</button>`)
									.click(() => {
										if (!$cbMelee.prop("checked") && !$cbRanged.prop("checked")) {
											return JqueryUtil.doToast({type: "warning", content: "At least one of 'Melee' or 'Ranged' must be selected!"});
										} else doClose(true);
									});

								const $btnReset = $(`<button class="btn btn-sm btn-danger">Reset</button>`)
									.click(() => {
										if (!confirm("Are you sure?")) return;
										setState({
											iptName: "",
											cbMelee: true,
											cbRanged: false,
											cbFinesse: false,
											cbVersatile: false,
											cbBonusDamage: false,
											iptMeleeRange: "5",
											iptMeleeDamDiceCount: "1",
											iptMeleeDamDiceNum: "6",
											iptMeleeDamType: "",
											iptRangedShort: "",
											iptRangedLong: "",
											iptRangedDamDiceCount: "1",
											iptRangedDamDiceNum: "6",
											iptRangedDamType: "",
											iptVersatileDamDiceCount: "1",
											iptVersatileDamDiceNum: "8",
											iptVersatileDamType: "",
											iptBonusDamDiceCount: "1",
											iptBonusDamDiceNum: "6",
											iptBonusDamType: ""
										});
									});

								const getFormData = () => {
									const pb = this._getProfBonus();
									const abilMod = Parser.getAbilityModNumber($cbFinesse.prop("checked") ? this._state.dex : this._state.str);
									const [melee, ranged] = [$cbMelee.prop("checked") ? "mw" : false, $cbRanged.prop("checked") ? "rw" : false];

									const ptAtk = `{@atk ${[melee ? "mw" : null, ranged ? "rw" : null].filter(Boolean).join(",")}}`;
									const ptHit = `{@hit ${pb + abilMod}} to hit`;
									const ptRange = [
										melee ? `reach ${$iptMeleeRange.val().trim() || 5} ft.` : null,
										ranged ? (() => {
											const vShort = $iptRangedShort.val().trim();
											const vLong = $iptRangedLong.val().trim();
											if (!vShort && !vLong) return `unlimited range`;
											if (!vShort) return `range ${vLong}/${vLong} ft.`;
											if (!vLong) return `range ${vShort}/${vShort} ft.`;
											return `range ${vShort}/${vLong} ft.`;
										})() : null
									].filter(Boolean).join(" or ");

									const getDamageDicePt = ($iptNum, $iptFaces) => {
										const num = Number($iptNum.val()) || 1;
										const faces = Number($iptFaces.val()) || 6;
										return `${Math.floor(num * ((faces + 1) / 2))} ({@damage ${num}d${faces}})`;
									};
									const getDamageTypePt = ($ipDamType) => $ipDamType.val().trim() ? ` ${$ipDamType.val().trim()}` : "";
									const ptDamage = [
										$cbMelee.prop("checked") ? `${getDamageDicePt($iptMeleeDamDiceCount, $iptMeleeDamDiceNum)}${getDamageTypePt($iptMeleeDamType)} damage${$cbRanged.prop("checked") ? ` in melee` : ""}` : null,
										$cbRanged.prop("checked") ? `${getDamageDicePt($iptRangedDamDiceCount, $iptRangedDamDiceNum)}${getDamageTypePt($iptRangedDamType)} damage${$cbMelee.prop("checked") ? ` at range` : ""}` : null,
										$cbVersatile.prop("checked") ? `${getDamageDicePt($iptVersatileDamDiceCount, $iptVersatileDamDiceNum)}${getDamageTypePt($iptVersatileDamType)} damage if used with both hands` : null
									].filter(Boolean).join(", or ");
									const ptDamageFull = $cbBonusDamage.prop("checked") ? `${ptDamage}, plus ${getDamageDicePt($iptBonusDamDiceCount, $iptBonusDamDiceNum)}${getDamageTypePt($iptBonusDamType)} damage` : ptDamage;

									return {
										name: $iptName.val().trim() || "Unarmed Strike",
										entries: [
											`${ptAtk} ${ptHit}, ${ptRange}, one target. {@h}${ptDamageFull}.`
										]
									};
								};

								const getState = () => ({
									iptName: $iptName.val(),
									cbMelee: $cbMelee.prop("checked"),
									cbRanged: $cbRanged.prop("checked"),
									cbFinesse: $cbFinesse.prop("checked"),
									cbVersatile: $cbVersatile.prop("checked"),
									cbBonusDamage: $cbBonusDamage.prop("checked"),
									iptMeleeRange: $iptMeleeRange.val(),
									iptMeleeDamDiceCount: $iptMeleeDamDiceCount.val(),
									iptMeleeDamDiceNum: $iptMeleeDamDiceNum.val(),
									iptMeleeDamType: $iptMeleeDamType.val(),
									iptRangedShort: $iptRangedShort.val(),
									iptRangedLong: $iptRangedLong.val(),
									iptRangedDamDiceCount: $iptRangedDamDiceCount.val(),
									iptRangedDamDiceNum: $iptRangedDamDiceNum.val(),
									iptRangedDamType: $iptRangedDamType.val(),
									iptVersatileDamDiceCount: $iptVersatileDamDiceCount.val(),
									iptVersatileDamDiceNum: $iptVersatileDamDiceNum.val(),
									iptVersatileDamType: $iptVersatileDamType.val(),
									iptBonusDamDiceCount: $iptBonusDamDiceCount.val(),
									iptBonusDamDiceNum: $iptBonusDamDiceNum.val(),
									iptBonusDamType: $iptBonusDamType.val()
								});

								const setState = (state) => {
									$iptName.val(state.iptName);
									$cbMelee.prop("checked", state.cbMelee).change();
									$cbRanged.prop("checked", state.cbRanged).change();
									$cbFinesse.prop("checked", state.cbFinesse).change();
									$cbVersatile.prop("checked", state.cbVersatile).change();
									$cbBonusDamage.prop("checked", state.cbBonusDamage).change();
									$iptMeleeRange.val(state.iptMeleeRange);
									$iptMeleeDamDiceCount.val(state.iptMeleeDamDiceCount);
									$iptMeleeDamDiceNum.val(state.iptMeleeDamDiceNum);
									$iptMeleeDamType.val(state.iptMeleeDamType);
									$iptRangedShort.val(state.iptRangedShort);
									$iptRangedLong.val(state.iptRangedLong);
									$iptRangedDamDiceCount.val(state.iptRangedDamDiceCount);
									$iptRangedDamDiceNum.val(state.iptRangedDamDiceNum);
									$iptRangedDamType.val(state.iptRangedDamType);
									$iptVersatileDamDiceCount.val(state.iptVersatileDamDiceCount);
									$iptVersatileDamDiceNum.val(state.iptVersatileDamDiceNum);
									$iptVersatileDamType.val(state.iptVersatileDamType);
									$iptBonusDamDiceCount.val(state.iptBonusDamDiceCount);
									$iptBonusDamDiceNum.val(state.iptBonusDamDiceNum);
									$iptBonusDamType.val(state.iptBonusDamType);
								};

								if (this._generateAttackCache) setState(this._generateAttackCache);

								$$`<div class="flex-col">
								<div class="flex-v-center mb-2">
									${$iptName}
									<label class="flex-v-center mr-2"><span class="mr-2">Melee</span>${$cbMelee}</label>
									<label class="flex-v-center"><span class="mr-2">Ranged</span>${$cbRanged}</label>
								</div>
								<div class="flex-v-center">
									<label class="flex-v-center mr-2"><span class="mr-2">Finesse</span>${$cbFinesse}</label>
									<label class="flex-v-center mr-2"><span class="mr-2">Versatile</span>${$cbVersatile}</label>
									<label class="flex-v-center"><span class="mr-2">Bonus Damage</span>${$cbBonusDamage}</label>
								</div>
								${$stageMelee}
								${$stageRanged}
								${$stageVersatile}
								${$stageBonusDamage}
								<div class="split flex-v-center mt-2">${$btnConfirm}${$btnReset}</div>
								</div>`.appendTo($modalInner)
							});
						}
					}
				]
			});
	}

	__$getReactionInput (cb) {
		return this.__$getGenericEntryInput(cb, {name: "Reactions", shortName: "Reaction", prop: "reaction"});
	}

	__$getLegendaryActionInput (cb) {
		return this.__$getGenericEntryInput(cb, {name: "Legendary Actions", shortName: "Legendary Action", prop: "legendary"});
	}

	__$getGenericEntryInput (cb, options) {
		if (options.canReorder == null) options.canReorder = true;

		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple(options.name, {isMarked: true});

		const doUpdateState = () => {
			const raw = entryRows.map(row => row.getState()).filter(Boolean);
			if (raw && raw.length) this._state[options.prop] = raw;
			else delete this._state[options.prop];
			cb();
		};

		const doUpdateOrder = !options.canReorder ? null : () => {
			entryRows.forEach(it => it.$ele.detach().appendTo($wrpRows));
			doUpdateState();
		};

		const entryRows = [];

		const $wrpRowsOuter = $(`<div class="relative"/>`).appendTo($rowInner);
		const $wrpRows = $(`<div/>`).appendTo($wrpRowsOuter);
		const rowOptions = {prop: options.prop, shortName: options.shortName, $wrpRowsOuter};

		const $wrpBtnAdd = $(`<div/>`).appendTo($rowInner);
		$(`<button class="btn btn-xs btn-default">Add ${options.shortName}</button>`)
			.appendTo($wrpBtnAdd)
			.click(() => {
				this.__$getGenericEntryInput__getEntryRow(doUpdateState, doUpdateOrder, rowOptions, entryRows).$ele.appendTo($wrpRows);
				doUpdateState();
			});

		if (options.generators) {
			options.generators.forEach(gen => {
				$(`<button class="btn btn-xs btn-default ml-2">${gen.name}</button>`)
					.appendTo($wrpBtnAdd)
					.click(async () => {
						const entry = await gen.action();
						if (entry != null) {
							this.__$getGenericEntryInput__getEntryRow(doUpdateState, doUpdateOrder, rowOptions, entryRows, entry)
								.$ele.appendTo($wrpRows);
							doUpdateState();
						}
					});
			})
		}

		if (this._state[options.prop]) this._state[options.prop].forEach(entry => this.__$getGenericEntryInput__getEntryRow(doUpdateState, doUpdateOrder, rowOptions, entryRows, entry).$ele.appendTo($wrpRows));

		return $row;
	}

	__$getGenericEntryInput__getEntryRow (doUpdateState, doUpdateOrder, options, entryRows, entry) {
		const out = {};

		const getState = () => {
			const out = {
				name: $iptName.val().trim(),
				entries: UiUtil.getTextAsEntries($iptEntries.val())
			};

			// additional state for variant inputs
			if (options.prop === "variant") out.type = "variant";
			if (sourceControls) {
				const rawSourceState = sourceControls.getState();
				if (rawSourceState) out.variantSource = rawSourceState;
			}

			if (!out.name || !out.entries || !out.entries.length) return null;

			// do post-processing
			RechargeConvert.tryConvertRecharge(out);
			DiceConvert.convertTraitActionDice(out);

			return out;
		};

		const $iptName = $(`<input class="form-control form-control--minimal input-xs" placeholder="${options.shortName} name">`)
			.change(() => doUpdateState());
		if (entry && entry.name) $iptName.val(entry.name.trim());

		const $btnUp = doUpdateOrder ? BuilderUi.$getUpButton(doUpdateOrder, entryRows, out) : null;

		const $btnDown = doUpdateOrder ? BuilderUi.$getDownButton(doUpdateOrder, entryRows, out) : null;

		const $dragOrder = doUpdateOrder ? BuilderUi.$getDragPad(doUpdateOrder, entryRows, out, {
			cbSwap: (swapee) => {
				// swap textarea dimensions to prevent flickering
				const cacheDim = {h: swapee.$iptEntries.css("height")};
				swapee.$iptEntries.css({height: out.$iptEntries.css("height")});
				out.$iptEntries.css({height: cacheDim.h});
			},
			$wrpRowsOuter: options.$wrpRowsOuter
		}) : null;

		const $iptEntries = $(`<textarea class="form-control form-control--minimal resize-vertical mb-2"/>`)
			.change(() => doUpdateState());

		if (entry && entry.entries) $iptEntries.val(UiUtil.getEntriesAsText(entry.entries));

		const $btnRemove = $(`<button class="btn btn-xs btn-danger mb-2" title="Remove ${options.shortName}"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				const currState = getState();
				if (currState && currState.entries && !confirm("Are you sure?")) return;
				entryRows.splice(entryRows.indexOf(out), 1);
				$ele.empty().remove();
				doUpdateState();
			});

		const sourceControls = options.prop === "variant" ? (() => {
			const getState = () => {
				const out = {
					source: $selVariantSource.val().unescapeQuotes(),
					page: Number($iptPage.val())
				};
				if (!out.source) return null;
				if (!out.page) delete out.page;
				return out;
			};

			const $selVariantSource = $(`<select class="form-control input-xs"><option value="">(Same as creature)</option></select>`)
				.change(() => doUpdateState());
			this._ui.allSources.forEach(srcJson => $selVariantSource.append(`<option value="${srcJson.escapeQuotes()}">${Parser.sourceJsonToFull(srcJson).escapeQuotes()}</option>`));

			const $iptPage = $(`<input type="number" class="form-control form-control--minimal input-xs" min="0">`)
				.change(() => doUpdateState());

			if (entry && entry.variantSource && BrewUtil.hasSourceJson(entry.variantSource.source)) {
				$selVariantSource.val(entry.variantSource);
				if (entry.variantSource.page) $iptPage.val(entry.variantSource.page);
			}

			(this._$eles.$selVariantSources = this._$eles.$selVariantSources || []).push($selVariantSource);

			const $ele = $$`<div class="flex-col">
			<div class="flex-v-center mb-2"><span class="mr-2 mkbru__sub-name--50">Source</span>${$selVariantSource}</div>
			<div class="flex-v-center mb-2"><span class="mr-2 mkbru__sub-name--50">Page</span>${$iptPage}</div>
			</div>`;

			return {$ele, getState};
		})() : null;

		const $ele = $$`<div class="flex-col mkbru__wrp-rows mkbru__wrp-rows--removable">
		<div class="split flex-v-center mb-2">
			${$iptName}
			<div class="flex-v-center">${$btnUp}${$btnDown}${$dragOrder}</div>
		</div>
		${sourceControls ? sourceControls.$ele : null}
		<div class="flex-v-center">${$iptEntries}</div>
		<div class="text-right">${$btnRemove}</div>
		</div>`;

		out.$ele = $ele;
		out.getState = getState;
		out.$iptEntries = $iptEntries;
		entryRows.push(out);
		return out;
	}

	__$getLegendaryGroupInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Legendary Group");

		const _GROUPS = this._legendaryGroups
			.map(({name, source}) => ({name, source}))
			.sort((a, b) => SortUtil.ascSortLower(a.name, b.name) || SortUtil.ascSortLower(a.source, b.source));

		const $selGroup = $(`<select class="form-control form-control--minimal input-xs"><option value="-1">None</option></select>`)
			.change(() => {
				const ix = Number($selGroup.val());
				if (~ix) this._state.legendaryGroup = _GROUPS[ix];
				else delete this._state.legendaryGroup;
				cb();
			})
			.appendTo($rowInner);

		_GROUPS.filter(it => it.source).forEach((g, i) => $selGroup.append(`<option value="${i}">${g.name}${g.source === SRC_MM ? "" : ` [${Parser.sourceJsonToAbv(g.source)}]`}</option>`));

		if (this._state.legendaryGroup) {
			const ix = _GROUPS.findIndex(it => it.name === this._state.legendaryGroup.name && it.source === this._state.legendaryGroup.source);
			$selGroup.val(`${ix}`);
		}

		return $row;
	}

	__$getVariantInput (cb) {
		return this.__$getGenericEntryInput(cb, {name: "Variants", shortName: "Variant", prop: "variant"});
	}

	__$getTokenInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Token Image URL");

		const $iptUrl = $(`<input class="form-control form-control--minimal input-xs mr-2">`)
			.change(() => doUpdateState())
			.val(this._state.tokenUrl || "");

		const $btnPreview = $(`<button class="btn btn-xs btn-default mr-2" title="Preview Token"><span class="glyphicon glyphicon-fullscreen"/></button>`)
			.click((evt) => {
				const val = $iptUrl.val().trim();
				if (!val) return JqueryUtil.doToast({content: "Please enter an image URL", type: "warning"});
				Renderer.hover.doOpenWindow(
					evt,
					$btnPreview[0],
					{
						type: "image",
						href: {
							type: "external",
							url: val
						},
						data: {
							hoverTitle: `Token Preview`
						}
					}
				);
			});

		const doUpdateState = () => {
			const val = $iptUrl.val().trim();
			if (val) this._state.tokenUrl = val;
			else delete this._state.tokenUrl;

			cb();
		};

		$$`<div class="flex">${$iptUrl}${$btnPreview}</div>`.appendTo($rowInner);

		return $row;
	}

	__$getFluffInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Flavour Info");

		const imageRows = [];

		const doUpdateState = () => {
			const out = {};

			const entries = UiUtil.getTextAsEntries($iptEntries.val());
			if (entries && entries.length) out.entries = entries;

			const images = imageRows.map(it => it.getState()).filter(Boolean);

			if (images.length) out.images = images;

			if (out.entries || out.images) this._state.fluff = out;
			else delete this._state.fluff;

			cb();
		};

		const doUpdateOrder = () => {
			imageRows.forEach(it => it.$ele.detach().appendTo($wrpRows));
			doUpdateState();
		};

		const $wrpRowsOuter = $(`<div class="relative"/>`);
		const $wrpRows = $(`<div class="flex-col"/>`).appendTo($wrpRowsOuter);

		const rowOptions = {$wrpRowsOuter};

		const $iptEntries = $(`<textarea class="form-control form-control--minimal resize-vertical mb-2"/>`)
			.change(() => doUpdateState());

		const $btnAddImage = $(`<button class="btn btn-xs btn-default">Add Image</button>`)
			.click(async () => {
				const url = await InputUiUtil.pGetUserString({title: "Enter a URL"});
				if (!url) return;
				CreatureBuilder.__$getFluffInput__getImageRow(doUpdateState, doUpdateOrder, rowOptions, imageRows, {href: {url: url}}).$ele.appendTo($wrpRows);
				doUpdateState();
			});

		$$`<div class="flex-col">
		${$iptEntries}
		${$wrpRowsOuter}
		<div>${$btnAddImage}</div>
		</div>`.appendTo($rowInner);

		if (this._state.fluff) {
			if (this._state.fluff.entries) $iptEntries.val(UiUtil.getEntriesAsText(this._state.fluff.entries));
			if (this._state.fluff.images) this._state.fluff.images.forEach(img => CreatureBuilder.__$getFluffInput__getImageRow(doUpdateState, doUpdateOrder, rowOptions, imageRows, img).$ele.appendTo($wrpRows));
		}

		return $row;
	}

	static __$getFluffInput__getImageRow (doUpdateState, doUpdateOrder, options, imageRows, image) {
		const out = {};

		const getState = () => {
			const rawUrl = $iptUrl.val().trim();
			return rawUrl ? {type: "image", href: {type: "external", url: rawUrl}} : null;
		};

		const $iptUrl = $(`<input class="form-control form-control--minimal input-xs mr-2">`)
			.change(() => doUpdateState());
		if (image) {
			const href = ((image || {}).href || {});
			if (href.url) $iptUrl.val(href.url);
			else if (href.path) $iptUrl.val(`${window.location.origin}${href.path}`);
		}

		const $btnPreview = $(`<button class="btn btn-xs btn-default mr-2" title="Preview Image"><span class="glyphicon glyphicon-fullscreen"/></button>`)
			.click((evt) => {
				const toRender = getState();
				if (!toRender) return JqueryUtil.doToast({content: "Please enter an image URL", type: "warning"});
				const fauxEvent = {shiftKey: true, clientX: evt.clientX};
				const data = {data: {hoverTitle: "Image Preview"}, entries: [toRender]};
				Renderer.hover.show({evt: fauxEvent, ele: $btnPreview[0], page: "hover", source: data, hash: "", isBookContent: true});
			});

		const $btnRemove = $(`<button class="btn btn-xs btn-danger" title="Remove Image"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				imageRows.splice(imageRows.indexOf(out), 1);
				$ele.empty().remove();
				doUpdateState();
			});

		const $dragOrder = BuilderUi.$getDragPad(doUpdateOrder, imageRows, out, {
			$wrpRowsOuter: options.$wrpRowsOuter
		});

		out.$ele = $$`<div class="flex-v-center mb-2 mkbru__wrp-rows--removable">${$iptUrl}${$btnPreview}${$btnRemove}${$dragOrder}</div>`;
		out.getState = getState;
		imageRows.push(out);

		return out;
	}

	__$getEnvironmentInput (cb) {
		const [$row, $rowInner] = BuilderUi.getLabelledRowTuple("Environment", {isMarked: true});

		const doUpdateState = () => {
			const raw = inputs.map(it => it.$ipt.prop("checked") ? it.getVal() : false).filter(Boolean);

			if (raw.length) this._state.environment = raw;
			else delete this._state.environment;

			cb();
		};

		const $wrpIpts = $(`<div class="flex-col w-100 mr-2"/>`);
		const inputs = [];
		Parser.ENVIRONMENTS.forEach(val => {
			const $cb = $(`<input class="mkbru__ipt-cb mkbru_mon__cb-environment" type="checkbox">`)
				.prop("checked", this._state.environment && this._state.environment.includes(val))
				.change(() => doUpdateState());
			inputs.push({$ipt: $cb, getVal: () => val});
			$$`<label class="flex-v-center split stripe-odd--faint"><span>${StrUtil.toTitleCase(val)}</span>${$cb}</label>`.appendTo($wrpIpts);
		});

		const additionalEnvs = (this._state.environment || []).filter(it => !Parser.ENVIRONMENTS.includes(it)).filter(it => it && it.trim());
		if (additionalEnvs.length) {
			additionalEnvs.forEach(it => {
				CreatureBuilder.__$getEnvironmentInput__getCustomRow(doUpdateState, inputs, it).$ele.appendTo($wrpIpts);
			});
		}

		const $btnAddCustom = $(`<button class="btn btn-default btn-xs mt-2">Add Custom Environment</button>`)
			.click(() => {
				CreatureBuilder.__$getEnvironmentInput__getCustomRow(doUpdateState, inputs).$ele.appendTo($wrpIpts);
			});

		$$`<div class="flex-col">
		${$wrpIpts}
		<div class="flex-v-center">${$btnAddCustom}</div>
		</div>`.appendTo($rowInner);

		return $row;
	}

	static __$getEnvironmentInput__getCustomRow (doUpdateState, envRows, env) {
		const $iptEnv = $(`<input class="form-control form-control--minimal input-xs">`)
			.val(env ? StrUtil.toTitleCase(env) : "")
			.change(() => doUpdateState());

		// hidden checkbox, locked to true
		const $cb = $(`<input class="mkbru__ipt-cb hidden" type="checkbox">`)
			.prop("checked", true);

		const $btnRemove = $(`<button class="btn btn-danger btn-xxs"><span class="glyphicon glyphicon-trash"/></button>`)
			.click(() => {
				out.$ele.remove();
				envRows.splice(envRows.indexOf(out), 1);
				doUpdateState();
			});

		const out = {
			$ipt: $cb,
			getVal: () => {
				const raw = $iptEnv.val().toLowerCase().trim();
				return raw || false;
			},
			$ele: $$`<label class="flex-v-center split stripe-odd--faint mt-2"><span>${$iptEnv}</span>${$cb}${$btnRemove}</label>`
		};

		envRows.push(out);
		return out;
	}

	renderOutput () {
		this._renderOutputDebounced();
		this.mutSavedButtonText();
	}

	_renderOutput () {
		const $wrp = this._ui.$wrpOutput.empty();

		// initialise tabs
		this._resetTabs("output");
		const tabs = ["Statblock", "Info", "Images", "Data"].map((it, ix) => this._getTab(ix, it, {tabGroup: "output", stateObj: this._meta, cbTabChange: this.doUiSave.bind(this)}));
		const [statTab, infoTab, imageTab, dataTab] = tabs;
		$$`<div class="flex-v-center w-100 no-shrink">${tabs.map(it => it.$btnTab)}</div>`.appendTo($wrp);
		tabs.forEach(it => it.$wrpTab.appendTo($wrp));

		// statblock
		const $tblMon = $(`<table class="stats monster"/>`).appendTo(statTab.$wrpTab);
		RenderBestiary.$getRenderedCreature(this._state, this._bestiaryMetaCache).appendTo($tblMon);

		// info
		const $tblInfo = $(`<table class="stats"/>`).appendTo(infoTab.$wrpTab);
		Renderer.utils.pBuildFluffTab(
			false,
			$tblInfo,
			this._state,
			Renderer.monster.getFluff.bind(null, this._state, this._bestiaryMetaCache)
		);

		// images
		const $tblImages = $(`<table class="stats"/>`).appendTo(imageTab.$wrpTab);
		Renderer.utils.pBuildFluffTab(
			true,
			$tblImages,
			this._state,
			Renderer.monster.getFluff.bind(null, this._state, this._bestiaryMetaCache)
		);

		const $tblData = $(`<table class="stats stats--book" style="box-shadow: none; border-left: 1px solid #ccc; border-right: 1px solid #ccc;"/>`).appendTo(dataTab.$wrpTab);
		const asCode = Renderer.get().render({
			type: "entries",
			entries: [
				{
					type: "code",
					name: `Data`,
					preformatted: JSON.stringify(DataUtil.cleanJson(MiscUtil.copy(this._state)), null, "\t")
				}
			]
		});
		$tblData.append(Renderer.utils.getBorderTr());
		$tblData.append(`<tr><td colspan="6">${asCode}</td></tr>`);
		$tblData.append(Renderer.utils.getBorderTr());
	}
}
CreatureBuilder._ALIGNMENTS = [
	["U"],
	["A"],
	null,
	["L", "G"],
	["N", "G"],
	["C", "G"],
	["L", "N"],
	["N"],
	["C", "N"],
	["L", "E"],
	["N", "E"],
	["C", "E"],
	null,
	["G"],
	["L"],
	["C"],
	["E"],
	null,
	["L", "G", "NY", "E"],
	["C", "G", "NY", "E"],
	["L", "NX", "C", "G"],
	["L", "NX", "C", "E"],
	["NX", "NY", "N"],
	null,
	["NX", "C", "G", "NY", "E"],
	["L", "NX", "C", "NY", "G"],
	["L", "NX", "C", "NY", "E"],
	["NX", "L", "G", "NY", "E"]
];
CreatureBuilder._AC_COMMON = {
	"Unarmored Defense": "unarmored defense",
	"Natural Armor": "natural armor"
};
CreatureBuilder._LANGUAGE_BLACKLIST = new Set(["CS", "X", "XX"]);
CreatureBuilder._rowSortOrder = 0;

const creatureBuilder = new CreatureBuilder();

ui.creatureBuilder = creatureBuilder;
creatureBuilder.ui = ui;

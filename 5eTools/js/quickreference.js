"use strict";const JSON_URL="data/generated/bookref-quick.json";let reference;window.onload=function(){BookUtil.renderArea=$(`#pagecontent`),BookUtil.renderArea.append(Renderer.utils.getBorderTr()),window.location.hash.length?BookUtil.renderArea.append(`<tr><td colspan="6" class="initial-message">Loading...</td></tr>`):BookUtil.renderArea.append(`<tr><td colspan="6" class="initial-message">Select a section to begin</td></tr>`),BookUtil.renderArea.append(Renderer.utils.getBorderTr()),ExcludeUtil.pInitialise(),Omnisearch.addScrollTopFloat(),DataUtil.loadJSON(JSON_URL).then(onJsonLoad)};function onJsonLoad(a){reference=[a.reference["bookref-quick"]],BookUtil.contentType="document";const b=$("ul.contents");let c="";for(let b=0;b<reference.length;b++){const a=reference[b];c+=BookUtil.getContentsItem(b,a,{book:a,addOnclick:!0})}b.append(c),BookUtil.addHeaderHandles(!1);new List("listcontainer",{valueNames:["name"],listClass:"contents"});BookUtil.baseDataUrl="data/generated/",BookUtil.bookIndex=reference,BookUtil.referenceId="bookref-quick",BookUtil.initLinkGrabbers(),window.onhashchange=BookUtil.booksHashChange,window.location.hash.length?BookUtil.booksHashChange():window.location.hash="#bookref-quick"}
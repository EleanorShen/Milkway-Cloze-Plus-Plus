document.getElementById("demo-container").oncontextmenu = function () {
  return false;
};
document.getElementById("go-down").onclick = (e) => gotobottom();
var demo = document.getElementById("demo");
function gotobottom() {
  var demo = document.getElementById("demo");
  demo.scrollIntoView();
}
var allFiller = new Object();
var fillObjs = new Array();
var all_fillObjs = [];
var wordSet = [];
var state_in_excise = false;
var reviewLocation = window.location.origin + window.location.pathname;
var excise_cheat1 = 0;
var excise_cheat2 = 1;
var remove_dup = true;
var url1 = window.location.origin + window.location.pathname;
var urlData = "data://application/json;charset=utf-8,";
function getDataString(a, l, u = urlData) {
  var eea = encodeURIComponent(encodeURIComponent(getDate() + "\n" + a));
  var eel = encodeURIComponent(encodeURIComponent(JSON.stringify(l)));
  u +=
    "?article=" +
    eea +
    "&redundant=" +
    eel +
    "&theme=" +
    window.currentThemeIndex;
  return u;
}
function loadString(search) {
  let article = search.match(/article=([^&]+)/);
  let lastExclude = search.match(/redundant=([^&]+)/);
  let theme = search.match(/theme=([^&]+)/);
  let jsonAddr = search.match(/jsonAddr=([^&]+)/);
  let styleinfo = search.match(/styleinfo=([^&]+)/);
  var res = {};
  if (jsonAddr) {
    res.jsonAddr = decodeURIComponent(jsonAddr[1]);
  } else if (styleinfo) {
    res.jsonStr = decodeURIComponent(styleinfo[1]);
  }
  if (article) {
    article = article[1];
    res.article = decodeURIComponent(article);
  } else res.article = "";
  if (lastExclude) {
    res.lastExclude = lastExclude[1];
    res.redundantList = JSON.parse(decodeURIComponent(res.lastExclude));
  } else res.redundantList = [];
  if (theme) res.theme = theme[1];
  res.submitter = function (switcharticle = true) {
    if (res.jsonAddr) {
      fetch(res.jsonAddr)
        .then((r) => r.text())
        .then((t) => loadJson(t).submitter());
      return;
    } else if (res.jsonStr) {
      loadJson(decodeURIComponent(res.jsonStr)).submitter();
    }
    if (res.article && switcharticle) {
      window.article = res.article;
      document.getElementById("maininput").value = res.article;
      sendText(false);
    }
    if (res.redundantList) {
      window.lastExclude = res.lastExclude;
      window.redundantList = [
        ...new Set([...window.redundantList, ...res.redundantList]),
      ];
      excludeRedundant();
    }
    listWords();
    if (res.theme) changeTheme(res.theme);
  };
  return res;
}
function loadJson(jsonStr) {
  var res = JSON.parse(jsonStr);
  res.submitter = function (switcharticle = true) {
    if (res.dict) {
      document.getElementById("nonsense-voting").value = res.dict;
    }
    if (res.article && switcharticle) {
      window.article = res.article;
      document.getElementById("maininput").value = res.article;
      sendText(false);
    }
    if (res.redundantList) {
      window.lastExclude = res.redundantList;
      window.redundantList = [
        ...new Set([...window.redundantList, ...res.redundantList]),
      ];
      excludeRedundant();
    }
    if (res.selected) {
      window.lastSelected = res.selected;
      window.selected = [...new Set([...window.selected, ...res.selected])];
      selected_handle(window.selected);
    }
    if (res.theme) changeTheme(res.theme);
    listWords(false);
  };
  return res;
}
function saveJson(affectSaver = true) {
  var res = {};
  res.dict = document.getElementById("nonsense-voting").value;
  res.article = document.getElementById("maininput").value;
  res.redundantList = window.redundantList;
  res.selected = window.selected;
  res.theme = window.currentThemeIndex;
  resURI = encodeURIComponent(JSON.stringify(res));
  if (affectSaver) {
    affectHead = document.getElementById("changeable-head");
    affectHead.href = urlData + resURI;
    affectHead.download = "AXV_" + getDate() + ".json";
  }
  window.cookin(JSON.stringify(res));
  return resURI;
}
var urlLoader = loadString(window.location.search);
if (urlLoader.article || urlLoader.redundantList) {
  urlLoader.submitter();
}
document.getElementById("local-loader").onclick = (e) => fReader(true);
document.getElementById("local-list").onclick = (e) => fReader(false);
function fReader(swa = true) {
  var f = document.createElement("input");
  f.type = "file";
  f.multiple = "multiple";
  f.onchange = (e) => {
    console.log("fReader 读取文件");
    Array.from(f.files).forEach((fi) => {
      let fun = fi.name.endsWith(".json") ? loadJson : loadString;
      fi.text()
        .then((t) => fun(t))
        .then((loadObj) => loadObj.submitter(swa));
    });
  };
  f.click();
}
document.getElementById("changeable-head").onclick = (e) => {
  var c = confirm("\n【以防误触】，确认导出");
  if (c) {
    refreshRedundant();
    saveJson(true);
  }
};
function refreshRedundant() {
  var redObjs = [...demo.getElementsByClassName("word-filler-done")];
  redundantList = [];
  redObjs.forEach((e) => {
    redundantList.push(elemInfo(e).voc);
  });
  var selectObjs = [...demo.getElementsByClassName("selecTcss")];
  selected = [];
  selectObjs.forEach((e) => {
    selected.push(e.innerText.replace(/\ /g, ""));
  });
}
function getDate() {
  var now = new Date();
  var dateStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .replace(/\....Z$/g, "");
  dateStr = dateStr.split("/").join("-");
  dateStr = dateStr.split(":").join("-");
  dateStr = dateStr.split(" ").join("_");
  return dateStr;
}
function refreshChangeableMilkyway() {
  var head = document.getElementById("changeable-head");
  var mainString = document.getElementById("maininput").value;
  var reviewLocation = getDataString(mainString, window.redundantList);
  head.href = reviewLocation;
  head.download = "AXV_" + getDate() + ".milkyway";
  console.log(
    decodeURIComponent(getDataString(mainString, window.redundantList, url1))
  );
  window.cookin(decodeURIComponent(reviewLocation));
}
function refreshChangeable() {
  saveJson(true);
}
function fillIn(nLast, n, l, s, label = "word-filler") {
  var insThis = document.createElement("span");
  var orgWord = s.slice(n, n + l);
  insThis.className = label;
  insThis.id = label + "-" + n;
  insThis.innerHTML = orgWord;
  var preWord = s.slice(nLast, n);
  var s1 = preWord + insThis.outerHTML;
  var res = new Object();
  res.objId = insThis.id;
  res.inText = orgWord;
  res.enlonged = s1;
  return res;
}
function fillAll(s, words) {
  var res = new Object();
  res.wordList = [];
  var sorted = words.sort((a, b) => (a[0] >= b[0] ? 1 : -1));
  var nLast = 0;
  var s1 = "";
  for (var i in sorted) {
    var n = sorted[i][0];
    var l = sorted[i][1];
    var wd = sorted[i][2];
    var iRes = fillIn(nLast, n, l, s);
    s1 = s1 + iRes.enlonged;
    delete iRes.enlonged;
    res.wordList.push(iRes);
    nLast = n + l;
  }
  res.enlonged = s1 + s.slice(nLast);
  res.enlonged = res.enlonged.split("\n").join("<br>");
  return res;
}
function fillAllLabeled(s, words) {
  var res = new Object();
  var wordList = [];
  var sorted = words.sort((a, b) => a[0] >= b[0]);
  var nLast = 0;
  var s1 = "";
  for (var i in sorted) {
    var charHead = sorted[i][0];
    var charLength = sorted[i][1];
    var voc = sorted[i][2];
    var label = sorted[i][3];
    var iRes;
    if (label) iRes = fillIn(nLast, charHead, charLength, s, label);
    else iRes = fillIn(nLast, charHead, charLength, s);
    iRes.voc = voc;
    s1 = s1 + iRes.enlonged;
    wordList.push(iRes);
    nLast = charHead + charLength;
  }
  res.enlonged = s1 + s.slice(nLast);
  res.enlonged = res.enlonged.split("\n").join("<br>");
  wordDict = new Object();
  for (w of wordList) wordDict[w.objId] = w;
  res.wordDict = wordDict;
  return res;
}
var s = document.getElementById("maininput").value;
var words1 = allWords(s);
function allWords(s) {
  var reWord = /[a-zA-Z][a-zA-Z']+/g;
  var iterAll = s.matchAll(reWord);
  var words = [];
  for (var w of iterAll) {
    words.push([w.index, w[0].length, w[0]]);
  }
  return words;
}
function useRule(s, r, st = [], last = new Object()) {
  if (!s || s.length == 0) return null;
  else if (r.length == 0) return s;
  else {
    var ss = s[s.length - 1];
    var sHead = s.slice(0, s.length - 1);
    var r0 = r[0];
    if (r0 == ";") return s;
    if (r0 == "-") {
      st.push(ss);
      last.worker = (f) => (f(ss) ? sHead : null);
      last.reader = (a) => (x) => x == a;
      return useRule(sHead, r.slice(1), st, last);
    } else if (r0 == "+") {
      last.worker = (f) => s + f();
      last.reader = (a) => () => a;
      return useRule(s, r.slice(1), st, last);
    } else if (r0 == "$") {
      if (st.length == 0) return null;
      var pp = st.pop();
      s = s + pp;
      return useRule(s, r.slice(1), st, new Object());
    } else if (r0 == "%") {
      last.reader = transSig;
      return useRule(s, r.slice(1), st, last);
    } else if (r0 == "/") {
      if (st.length == 0) return null;
      else {
        st.pop();
        return useRule(s, r.slice(1), st, {});
      }
    } else {
      s = last.worker(last.reader(r0));
      return useRule(s, r.slice(1), st, last);
    }
  }
  function transSig(a) {
    if (a == "2")
      return (x) => {
        return "bcdfghjklmnpqrstvwxyz".includes(x);
      };
    if (a == "1")
      return (x) => {
        return "aeiou".includes(x);
      };
    if (a == "s")
      return (x) => {
        return st.length > 1 && st[st.length - 1] == st[st.length - 2];
      };
    if (a == "g") return (x) => s[s.length - 1];
  }
}
function word2rules(word, rules) {
  var wordsNew = [word];
  for (var r of rules) {
    var w = useRule(word, r);
    if (w) wordsNew.push(w);
  }
  return wordsNew;
}
function wordsIter(words, rules, iter = 2) {
  if (iter <= 0) return words;
  var res = [];
  for (w of words) res = res.concat(word2rules(w, rules).slice(1));
  return words.concat(wordsIter(res, rules, iter - 1));
}
function ruleAllWords(words, rules, filterWord, label = "word-filler") {
  var res = [];
  for (var w of words) {
    var wp = w[0];
    var wl = w[1];
    var ww = w[2];
    var wNew = word2rules(ww.toLowerCase(), rules);
    var iValid = wNew.findIndex(filterWord.good);
    var iBad = wNew.findIndex(filterWord.bad);
    if (iValid >= 0 && (iValid < iBad || iBad < 0)) {
      res.push([wp, wl, wNew[iValid], label]);
    }
  }
  return res;
}
if (!JSON.parse(localStorage.getItem("badList"))) {
  localStorage.setItem("badList", JSON.stringify(badList));
}
function keywords() {
  return Object.keys(dictInUse());
}
function getSimpleFilter() {
  var dictIndices = keywords();
  var BadList = JSON.parse(localStorage.getItem("badList"));
  return {
    good: (x) => dictIndices.includes(x),
    bad: (x) => BadList.includes(x),
  };
}
function elemInfo(elem, allFiller1 = allFiller) {
  var eid = elem.id;
  var info = allFiller1.wordDict[eid];
  info.audio = getAudio(info.voc);
  return info;
}
document.getElementById("main-clicker").onclick = sendText;
document.getElementById("clear-clicker").onclick = () => {
  document.getElementById("maininput").value = "";
};
function sendText(do_jump = true, removeDup = remove_dup) {
  isSort = false;
  document.getElementById("toUPcase").innerHTML = "↑";
  setTimeout(() => {
    document.getElementById("explain-outer").scrollTop = 0;
  }, 200);
  contextList = [];
  mark_reset();
  document.getElementById("font-size").value = 25;
  document.getElementById("demo").style.fontSize = "25px";
  var s = document.getElementById("maininput").value;
  s = s.replace(/([a-zA-Z]+)+-\n([a-zA-Z]+)/g, "$1$2\n");
  if (do_jump) {
    demo.scrollIntoView();
  }
  currentFill = 0;
  last_currentFill = 0;
  state_in_excise = false;
  var words = allWords(s);
  var wordsValid = ruleAllWords(words, ruleArray, getSimpleFilter());
  allFiller = fillAllLabeled(s, wordsValid);
  demo.innerHTML = "";
  demo.innerHTML = allFiller.enlonged;
  fillObjs = [];
  Object.keys(allFiller.wordDict).forEach((e) =>
    fillObjs.push(document.getElementById(e))
  );
  all_fillObjs = fillObjs;
  if (removeDup) refineList();
  excludeRedundant();
  listWords(false);
  for (var o of document.getElementsByClassName("word-filler-dup")) {
    o.onclick = function () {
      elemExplain(this, false);
    };
  }
  if (isSpan) {
    document.getElementById("Chinese").value = "中文-默认";
    isShow = "default";
    isSpan = false;
  }
  if (document.getElementById("explain-head").childNodes.length > 0) {
    open_mask();
  }
}
function tailCover(s, head = 1, tail = 1) {
  var longtail = s.length - head;
  tail = longtail >= tail ? tail : longtail;
  var starNum = longtail - tail;
  starNum = starNum >= 0 ? starNum : 0;
  return (
    s.slice(0, head) + "_".repeat(starNum) + s.slice(s.length - tail, s.length)
  );
}
function elemCover(elem, head = 1, tail = 1) {
  var s = allFiller.wordDict[elem.id].inText;
  elem.innerHTML =
    "<span class='red-zone'>" + tailCover(s, head, tail) + "<span>";
}
function coverAll(allFiller1 = allFiller) {
  for (o of fillObjs) {
    elemCover(o);
  }
}
var currentFill = 0;
var currentElem;
var currentInput = "";
var currentExplain = "";
function excludeRedundant() {
  fillObjs.forEach((e) => {
    if (redundantList.includes(elemInfo(e).voc)) {
      elemReveal(e);
      e.className = "word-filler-done";
    }
  });
}
function word2board(w) {
  if (navigator.clipboard) navigator.clipboard.writeText(w);
}
function elemExplain(
  elem,
  cover = true,
  head = excise_cheat1,
  tail = excise_cheat2
) {
  var dictList = dictInUse();
  var info = elemInfo(elem);
  var voc = info.voc;
  var inText = info.inText;
  if (inText.toLowerCase() == voc) inText = "";
  var explain = getDef(dictList[voc], cover);
  if (cover) var explainHead = tailCover(voc, head, tail);
  else {
    var explainHead = voc + " &#8594 " + inText;
    info.audio.currentTime = 0;
    info.audio.play();
    word2board(voc);
  }
  document.getElementById("explain-area").innerHTML =
    `<div id="exp-head">${explainHead}</div>` + explain;
  showIndexInfo(currentFill, fillObjs.length);
}
function elemReveal(elem) {
  var info = elemInfo(elem);
  var inText = info.inText;
  elem.innerHTML = inText;
  elem.className = "word-filler-done";
  elem.style.color = "";
}
var elemNoter = document.createElement("span");
elemNoter.className = "current-noter-container";
var bringPreserve = demo.parentNode.getClientRects()[0].height / 3;
function elemBring(o, reserve = bringPreserve, fill = true) {
  var omo = document.getElementById(o.id);
  var t = o.offsetTop - o.parentNode.offsetTop;
  demo.parentNode.scrollTop = t - reserve * 2;
  if (fill) omo.className = "word-filler-current";
  else {
    o.prepend(elemNoter);
  }
}
function elemBringMinor(o, reserve = bringPreserve) {
  var exArea = document.getElementById("explain-area");
  var objElem = document.getElementById(o.id + "-exp");
  if (!objElem) return false;
  var t = objElem.offsetTop;
  exArea.parentNode.scrollTop = t - reserve;
  return true;
}
function elemClear(o, head = excise_cheat1, tail = excise_cheat2) {
  currentInput = "";
  elemCover(o, head, tail);
  elemBring(o);
  elemExplain(o, true);
}
function elemFill(elem, s) {
  console.log("s", s);
  var info = elemInfo(elem);
  var inText = info.inText;
  var covered = tailCover(inText);
  elem.innerHTML = s;
  if (s == inText.toLowerCase()) {
    elemModify(elem);
    elemExplain(elem, false);
  } else {
    elemExplain(elem, true);
    covered = covered.slice(s.length);
    document.getElementById("exp-head").innerHTML = s + covered;
    elem.className = "word-filler-current";
  }
}
function elemCheck(e) {
  var info = elemInfo(e);
  var inText = info.inText;
  return e.innerText.toLowerCase() == inText.toLowerCase();
}
function elemModify(e, inFilling = true) {
  if (!elemCheck(e)) {
    if (inFilling) {
      e.className = "word-filler-current";
    } else e.className = "word-filler";
    return false;
  } else {
    elemReveal(e);
    isClozeNow = false;
    return true;
  }
}
function fillCurrent() {
  var elem = fillObjs[currentFill];
  elemBring(elem);
  elemClear(elem);
}
function startFill() {
  if (state_in_excise) {
    Qmsg.warning("正在填空");
    return;
  }
  state_in_excise = true;
  [...demo.getElementsByClassName("word-filler-current")].forEach((e) => {
    e.className = "word-filler";
  });
  fillObjs = [...demo.getElementsByClassName("word-filler")];
  currentFill = 0;
  coverAll();
  if (!lastExclude)
    alert(
      "Finish the cloze using keyboard, pressing: \n ,/. to move back/forth; \n BACKSPACE/SPACE to clear the buffer;\n  1 / ENTER to show the partial / full solution of the blank."
    );
}
document.getElementById("excise-clicker").onclick = startFill;
var readState = [];
function startRead(i = currentFill) {
  var rate = document.getElementById("read-speed").value / 100.0;
  if (readState.length == 0) {
    [...demo.getElementsByClassName("word-filler-current")].forEach((e) => {
      e.className = "word-filler";
    });
    fillObjs = [...demo.getElementsByClassName("word-filler")];
  }
  if (!currentFill || currentFill < 0) currentFill = 0;
  let ti = i - currentFill;
  if (ti > 2 || ti < -2) {
    i = currentFill;
  } else {
    i = i % fillObjs.length;
    currentFill = i;
  }
  var blankLast = fillObjs[i];
  var info = elemInfo(blankLast);
  fillObjs.forEach((e) => (e.className = "word-filler"));
  elemBring(blankLast, bringPreserve, false);
  elemExplain(blankLast, false);
  readState.unshift();
  readState.push(
    setTimeout(() => startRead(i + 1), info.audio.duration * (1 + rate) * 1000)
  );
}
var isNone = false;
function fillNext(pace = 1) {
  isClozeNow = false;
  clear_current_style_1();
  clear_current_style_2();
  re_is_done();
  if (isNone) {
    var ele = fillObjs[currentFill];
    ele.className = "";
    isNone = false;
  }
  if (!elemCheck(fillObjs[last_currentFill])) {
    input_err();
    Qmsg.error("上一处 输入不正确");
  }
  currentFill = (currentFill + pace) % fillObjs.length;
  last_currentFill = currentFill;
  currentInput = "";
  var elem = fillObjs[currentFill];
  if (!elemCheck(fillObjs[currentFill])) {
    input_err();
    Qmsg.error("当前输入不正确 请输入");
    isClozeNow = true;
    elemCover(fillObjs[currentFill]);
  }
  if (document.getElementById(elem.id).className == "word-filler-done") {
    isDone = true;
  }
  if (document.getElementById(elem.id).className == "word-filler-dup") {
    isDup = true;
  }
  if (document.getElementById(elem.id).className == "") {
    isNone = true;
  }
  cloze_now(elem);
  elemBring(elem, 100);
  var elemState = true;
  elemExplain(elem, !elemState);
}
function fillPrevious(pace = 1) {
  isClozeNow = false;
  clear_current_style_1();
  clear_current_style_2();
  re_is_done();
  if (isNone) {
    var ele = fillObjs[currentFill];
    ele.className = "";
    isNone = false;
  }
  if (!elemCheck(fillObjs[last_currentFill])) {
    input_err();
    Qmsg.error("上一处 输入不正确");
  }
  currentFill =
    (((currentFill - pace) % fillObjs.length) + fillObjs.length) %
    fillObjs.length;
  last_currentFill = currentFill;
  currentInput = "";
  var elem = fillObjs[currentFill];
  if (!elemCheck(fillObjs[currentFill])) {
    input_err();
    Qmsg.error("当前输入不正确 请输入");
    isClozeNow = true;
    elemCover(fillObjs[currentFill]);
  }
  if (document.getElementById(elem.id).className == "word-filler-done") {
    isDone = true;
  }
  cloze_now(elem);
  if (document.getElementById(elem.id).className == "word-filler-dup") {
    isDup = true;
  }
  if (document.getElementById(elem.id).className == "") {
    isNone = true;
  }
  elemBring(elem);
  var elemState = true;
  if (!elemCheck(elem)) {
    elemState = false;
  }
  elemExplain(elem, !elemState);
}
function showIndexInfo(i, n) {
  var ar = document.getElementById("explain-area");
  var info = document.createElement("h5");
  info.innerHTML = " ---- " + (i + 1) + " of " + n + " ---- ";
  ar.appendChild(info);
  var listCaller = document.createElement("div");
  listCaller.className = "dark-button";
  listCaller.onclick = (e) => listWords(true);
  listCaller.innerText = "Back To Word List";
  ar.appendChild(listCaller);
}
currentElem = fillObjs[currentFill];
var partialRevealer = getRevealer();
function charAdder(c) {
  currentInput = currentInput + c;
  elemFill(fillObjs[currentFill], currentInput);
}
var spacebar = false;
var timer = null;
function transKeys(e) {
  function k2char(k) {
    return "abcdefghijklmnopqrstuvwxyz"[k - 65];
  }
  var maininput = document.getElementById("maininput");
  if (maininput !== document.activeElement) {
    if (e.ctrlKey && e.keyCode == 90) {
      e.preventDefault();
      console.log("ctrl + z");
      if (contextList.length) {
        var lsat_context = contextList[contextList.length - 1];
        if (lsat_context.id.includes("exp")) {
          document.getElementById(
            lsat_context.id.replace(/-exp/g, "")
          ).className = lsat_context.className;
        } else {
          document.getElementById(lsat_context.id).className =
            lsat_context.className;
        }
        fresh_listWords();
        contextList.pop();
        var badList_1 = JSON.parse(localStorage.getItem("badList"));
        badList_1.splice(
          badList_1.indexOf(contextList[contextList.length - 1]),
          1
        );
        localStorage.setItem("badList", JSON.stringify(badList_1));
      }
    }
  }
  if (65 <= e.keyCode && e.keyCode <= 90) {
    if (isClozeNow) charAdder(k2char(e.keyCode));
  } else if (e.keyCode == 188 || e.keyCode == 37) {
    e.stopPropagation();
    fillPrevious();
  } else if (e.keyCode == 190 || e.keyCode == 13 || e.keyCode == 39) {
    fillNext();
  } else if (e.keyCode == 8) {
    if (isClozeNow) {
      function truncate() {
        return currentInput.split("").slice(0, -1).join("");
      }
      console.log("退一位", truncate());
      elemFill(fillObjs[currentFill], truncate());
      currentInput = truncate();
    }
  } else if (e.keyCode == 32) {
    e.preventDefault();
    e.stopPropagation();
    if (!spacebar) {
      elemClear(fillObjs[currentFill]);
      elemBring(fillObjs[currentFill]);
      spacebar = true;
      isClozeNow = true;
    } else {
      var info = elemInfo(fillObjs[currentFill]);
      var inText = info.inText;
      fillObjs[currentFill].innerHTML = inText;
      fillObjs[currentFill].className = "word-filler-current";
      spacebar = false;
      isClozeNow = false;
    }
  } else if (e.keyCode == 53) {
    elemReveal(fillObjs[currentFill]);
    elemExplain(fillObjs[currentFill], false);
    fresh_listWords();
  } else if (e.keyCode == 222) elemExplain(fillObjs[currentFill], false);
  else if (e.keyCode == 49) partialRevealer();
  else if (e.keyCode == 52) {
    var o = fillObjs[currentFill];
    if (o.className != "word-filler-done") {
      elemReveal(o);
    } else o.className = "word-filler";
    fresh_listWords();
  } else if (e.keyCode == 57) fillPrevious(step);
  else if (e.keyCode == 48 || e.keyCode == 40) {
    fillNext(step);
  } else if (e.keyCode == 38) {
    e.preventDefault();
    fillPrevious(step);
  } else {
    if (
      !(
        e.keyCode == 122 ||
        e.keyCode == 123 ||
        e.keyCode == 16 ||
        e.keyCode == 17 ||
        e.keyCode == 18
      )
    ) {
      console.log(e.keyCode);
      Qmsg.warning("无效的按键");
    }
  }
}
document.body.onkeydown = (e) => transKeys(e);
document.getElementById("maininput").onkeydown = (e) => e.stopPropagation();
document.getElementById("show-answer").onclick = listWords;
document.getElementById("refill-clicker").style.display = "none";
function listWords(excludeLess = true) {
  [...demo.getElementsByClassName("word-filler-current")].forEach(
    (e) => (e.className = "word-filler")
  );
  [...demo.getElementsByClassName("word-filler-err")].forEach(
    (e) => (e.className = "word-filler")
  );
  wordSet = [];
  var dictList = dictInUse();
  if (readState && readState.length > 0) {
    readState.forEach((n) => clearTimeout(n));
    readState = [];
  }
  var words1 = [...demo.getElementsByClassName("word-filler")];
  var words2 = [...demo.getElementsByClassName("word-filler-done")];
  var words3 = [...demo.getElementsByClassName("word-filler-err")];
  if (excludeLess) {
    state_in_excise = false;
    refreshRedundant();
  }
  var words = words1.concat(words2);
  var orgElem = fillObjs[currentFill];
  document.getElementById("show-answer").value =
    "Pause: " + words1.length + "/" + (words.length + words3.length);
  res = "";
  for (w of words) {
    var r = document.createElement("p");
    var info = elemInfo(w);
    wordSet.push(info.voc);
    w.innerHTML = info.voc;
    w.id += "-exp";
    r.innerHTML = w.outerHTML + " " + getDef(dictList[info.voc]);
    w.innerHTML = info.inText;
    w.id = info.objId;
    res = res + r.outerHTML;
  }
  function ws2head(wds) {
    wds.forEach((o) => {
      var oHead = o.cloneNode();
      oHead.innerText = elemInfo(o).voc;
      headDiv.appendChild(oHead);
      headDiv.append(" ");
      oHead.onclick = () => {
        wordInfo = elemInfo(o);
        wordInfo.audio.play();
        word2board(wordInfo.voc);
        var cNew = fillObjs.findIndex((e) => e == o);
        if (cNew && cNew >= 0) {
          currentFill = cNew;
        }
        if (navigator.clipboard) navigator.clipboard.writeText(elemInfo(o).voc);
      };
    });
  }
  var headDiv = document.getElementById("explain-head");
  headDiv.innerText = "";
  ws2head(words1);
  ws2head(words2);
  document.getElementById("explain-area").innerHTML = res;
  fillObjs = [...demo.querySelectorAll(".word-filler, .word-filler-done")];
  if (orgElem) {
    var cf1 = fillObjs.findIndex((o) => o == orgElem);
    if (cf1 >= 0) currentFill = cf1;
    elemBringMinor(orgElem, 0);
  }
  var allExp = [
    ...document
      .getElementById("explain-area")
      .querySelectorAll(".word-filler,.word-filler-current, .word-filler-done"),
  ];
  allExp.forEach((o) => {
    o.onclick = () => {
      [...demo.getElementsByClassName("word-filler-current")].forEach(
        (e) => (e.className = "word-filler")
      );
      var oo = document.getElementById(o.id.replace(/-exp$/, ""));
      elemBring(oo, 175, false);
      ooInf = elemInfo(oo);
      ooInf.audio.play();
      var cNew = fillObjs.findIndex((e) => e == oo);
      if (cNew && cNew >= 0) {
        currentFill = cNew;
      }
      if (navigator.clipboard) navigator.clipboard.writeText(ooInf.voc);
    };
  });
  return res;
}
function fresh_listWords() {
  [...demo.getElementsByClassName("word-filler-current")].forEach(
    (e) => (e.className = "word-filler")
  );
  wordSet = [];
  var dictList = dictInUse();
  var words1 = [...demo.getElementsByClassName("word-filler")];
  var words2 = [...demo.getElementsByClassName("word-filler-done")];
  var words = words1.concat(words2);
  res = "";
  for (w of words) {
    var r = document.createElement("p");
    var info = elemInfo(w);
    wordSet.push(info.voc);
    w.innerHTML = info.voc;
    w.id += "-exp";
    r.innerHTML = w.outerHTML + " " + getDef(dictList[info.voc]);
    w.innerHTML = info.inText;
    w.id = info.objId;
    res = res + r.outerHTML;
  }
  document.getElementById("explain-area").innerHTML = res;
  function ws2head(wds) {
    wds.forEach((o) => {
      var oHead = o.cloneNode();
      oHead.innerText = elemInfo(o).voc;
      headDiv.appendChild(oHead);
      headDiv.append(" ");
      oHead.onclick = () => {
        [...demo.getElementsByClassName("word-filler-current")].forEach(
          (e) => (e.className = "word-filler")
        );
        wordInfo = elemInfo(o);
        wordInfo.audio.play();
        word2board(wordInfo.voc);
        var cNew = fillObjs.findIndex((e) => e == o);
        if (cNew && cNew >= 0) {
          currentFill = cNew;
        }
        if (navigator.clipboard) navigator.clipboard.writeText(elemInfo(o).voc);
      };
    });
  }
  var headDiv = document.getElementById("explain-head");
  headDiv.innerText = "";
  ws2head(words1);
  ws2head(words2);
  fillObjs = [...demo.querySelectorAll(".word-filler, .word-filler-done")];
  var allExp = [
    ...document
      .getElementById("explain-area")
      .querySelectorAll(".word-filler,.word-filler-current, .word-filler-done"),
  ];
  allExp.forEach((o) => {
    o.onclick = () => {
      [...demo.getElementsByClassName("word-filler-current")].forEach(
        (e) => (e.className = "word-filler")
      );
      var oo = document.getElementById(o.id.replace(/-exp$/, ""));
      elemBring(oo, 75, false);
      ooInf = elemInfo(oo);
      ooInf.audio.play();
      var cNew = fillObjs.findIndex((e) => e == oo);
      if (cNew && cNew >= 0) {
        currentFill = cNew;
      }
      if (navigator.clipboard) navigator.clipboard.writeText(ooInf.voc);
    };
  });
  return res;
}
function fresh_listWords_mark(o) {
  remove_o(mark_word, o);
  remove_o(mark_words_1, o);
  remove_o(mark_words_2, o);
  remove_o(mark_words_3, o);
  remove_o(mark_words_4, o);
  remove_o(mark_words_5, o);
  remove_o(mark_words_6, o);
  var headDiv = document.getElementById("explain-head");
  headDiv.innerText = "";
  no_sort_wds(mark_word);
  if (mark_words_1.length) mark_color_inner(mark_words_1, mark_color_1);
  if (mark_words_2.length) mark_color_inner(mark_words_2, mark_color_2);
  if (mark_words_3.length) mark_color_inner(mark_words_3, mark_color_3);
  if (mark_words_4.length) mark_color_inner(mark_words_4, mark_color_4);
  if (mark_words_5.length) mark_color_inner(mark_words_5, mark_color_5);
  if (mark_words_6.length) mark_color_inner(mark_words_6, mark_color_6);
  function remove_o(arr, o) {
    for (i = 0; i < arr.length; i++) {
      if (o.id == arr[i].id) {
        console.log("o.id", o.id);
        arr.splice(i, 1);
      }
    }
  }
  function no_sort_wds(wds) {
    wds.forEach((o) => {
      var oHead = o.cloneNode();
      oHead.innerText = elemInfo(o).voc;
      headDiv.appendChild(oHead);
      headDiv.append(" ");
      oHead.onclick = () => {
        wordInfo = elemInfo(o);
        wordInfo.audio.play();
        word2board(wordInfo.voc);
        var cNew = fillObjs.findIndex((e) => e == o);
        if (cNew && cNew >= 0) {
          currentFill = cNew;
        }
        if (navigator.clipboard) navigator.clipboard.writeText(elemInfo(o).voc);
      };
    });
  }
}
function refillObjs() {
  fillObjs.forEach((e) => (e.className = "word-filler"));
  return;
}
function getDef(d, cover = false) {
  var res = "";
  if (!cover && d.ipa) {
    res = res + `<span class="ipa">${d.ipa}</span>` + " <br>";
  }
  if (d.def) {
    res = res + `<span class="def">${d.def}</span>`;
  } else {
    res = res + d;
  }
  return res;
}
function refineList() {
  wordSet = [];
  for (k of Object.keys(allFiller.wordDict)) {
    w = allFiller.wordDict[k];
    if (!wordSet.includes(w.voc)) wordSet.push(w.voc);
    else {
      document.getElementById(k).className = "word-filler-dup";
    }
  }
  fillObjs = [...demo.getElementsByClassName("word-filler")];
  return wordSet;
}
function dictInUse() {
  var inuse = document.getElementById("nonsense-voting").value;
  if (typeof window[inuse] != "undefined") return window[inuse];
  else {
    res = inuse
      .split("+")
      .reduce((d1, d2key) => ({ ...window[d2key], ...d1 }), (first = {}));
    window[inuse] = res;
    return res;
  }
}
function getRevealer() {
  var currentFill_r = currentFill;
  var current_head = 1;
  return function () {
    var e = fillObjs[currentFill];
    if (currentFill != currentFill_r) {
      current_head = 1;
      currentFill_r = currentFill;
    }
    elemExplain(e, true, current_head, excise_cheat2);
    currentInput = elemInfo(e).inText.toLowerCase().slice(0, current_head);
    elemFill(e, currentInput);
    current_head += 1;
  };
}
var change = "right";
document.getElementById("main-change").onclick = (e) => {
  console.log("切换布局");
  if (change === "right") {
    var style = document.createElement("style");
    style.type = "text/css";
    style.id = "left";
    style.innerHTML =
      "#explain-container{border-right:dotted 1px grey!important;position:absolute;left:0%!important;right:78%!important}#text-container{left:22%!important;width:78%!important}";
    document.getElementsByTagName("head").item(0).appendChild(style);
    change = "left";
    console.log("单词在left");
    document.getElementById("main-change").value = "✨Left";
  } else if (change === "left") {
    document
      .getElementsByTagName("head")
      .item(0)
      .removeChild(document.getElementById("left"));
    var style = document.createElement("style");
    style.type = "text/css";
    style.id = "hidden";
    style.innerHTML =
      "#explain-container{display:none!important}#text-container{left:0%!important;width:99%!important}#demo-container {width: 101%;}";
    document.getElementsByTagName("head").item(0).appendChild(style);
    change = "hidden";
    console.log("单词hidden");
    document.getElementById("main-change").value = "✨Hidden";
  } else if (change === "hidden") {
    document
      .getElementsByTagName("head")
      .item(0)
      .removeChild(document.getElementById("hidden"));
    change = "right";
    console.log("单词在right");
    document.getElementById("main-change").value = "✨Right";
  }
};
document.getElementById("font-size").onclick = (e) => {
  var fonts = document.getElementById("font-size").value;
  document.getElementById("demo").style.fontSize = fonts + "px";
};
var isShow = "default";
var isSpan = false;
document.getElementById("Chinese").onclick = (e) => {
  if (isSpan) {
    if (isShow == "A") {
      var x = document.getElementsByClassName("zh");
      for (i = 0; i < x.length; i++) {
        x[i].style.display = "block";
      }
      document.getElementById("Chinese").value = "中文-换行";
      document.getElementById("font-size").value = 33;
      document.getElementById("demo").style.fontSize = "33px";
      isShow = "block";
    } else if (isShow == "block") {
      var x = document.getElementsByClassName("zh");
      for (i = 0; i < x.length; i++) {
        x[i].style.opacity = "0";
      }
      document.getElementById("Chinese").value = "中文-隐藏";
      isShow = "hide";
    } else if (isShow == "hide") {
      var x = document.getElementsByClassName("zh");
      for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
        x[i].style.opacity = "0";
        x[i].style.marginBottom = "0px";
      }
      document.getElementById("Chinese").value = "中文-紧凑";
      isShow = "compact";
    } else if (isShow == "compact") {
      var x = document.getElementsByClassName("zh");
      for (i = 0; i < x.length; i++) {
        x[i].style.display = "initial";
        x[i].style.opacity = "1";
      }
      document.getElementById("Chinese").value = "中文-A";
      isShow = "A";
    }
  } else {
    this.gzhspan();
    var x = document.getElementsByClassName("zh");
    if (x.length !== 0) {
      isSpan = true;
      isShow = "A";
      document.getElementById("Chinese").value = "中文-A";
    }
    var s = document.getElementById("maininput").value;
    s = s.replace(/([a-zA-Z]+)+-\n([a-zA-Z]+)/g, "$1$2\n");
    state_in_excise = false;
    var words = allWords(s);
    var wordsValid = ruleAllWords(words, ruleArray, getSimpleFilter());
    allFiller = fillAllLabeled(s, wordsValid);
    fillObjs = [];
    Object.keys(allFiller.wordDict).forEach((e) =>
      fillObjs.push(document.getElementById(e))
    );
  }
};
var audio = document.createElement("audio");
audio.style.display = "none";
function word_sound(s) {
  var audioUrl = "https://dict.youdao.com/speech?audio=";
  audio.src = audioUrl + s;
  audio.play();
}
var isClozeNow = false;
document.getElementById("demo").onclick = (e) => {
  spacebar = false;
  o = e.target;
  if (o.className == "word-filler") {
    isClozeNow = false;
    currentInput = "";
    clear_current_style_1();
    clear_current_style_2();
    elemExplain(o, false);
    if (!elemCheck(fillObjs[last_currentFill])) {
      input_err();
      Qmsg.error("上一处 输入不正确");
    }
    add_now(o);
    var index_o = IndexOf_cur(fillObjs, o);
    if (index_o !== -1) {
      currentFill = index_o;
      last_currentFill = currentFill;
    }
    if (state_in_excise) {
      var eleme = fillObjs[currentFill];
      console.log("当前输入的不正确：", eleme.innerText);
      if (!elemCheck(fillObjs[last_currentFill])) {
        isClozeNow = true;
      }
    }
  } else if (o.className == "current-noter-container") {
    elemExplain(o.parentNode, false);
  } else if (o.className == "word-filler-done") {
    elemExplain(o, false);
    clear_current_style_3();
    clear_current_style_2();
    clear_current_style_1();
    var index_o = IndexOf_cur(fillObjs, o);
    if (index_o !== -1) {
      currentFill = index_o;
      last_currentFill = currentFill;
    }
    add_now(o);
  } else if (o.className == "word-filler-dup") {
    elemExplain(o, false);
    if (!elemCheck(fillObjs[currentFill])) {
      input_err();
      Qmsg.error("上一处 输入不正确");
    }
  } else if (o.className == "red-zone") {
    isClozeNow = true;
    console.log("是填空的");
    currentInput = "";
    console.log("o", o, "e.path[1]", e.path[1]);
    o = e.path[1];
    var index_o = IndexOf_cur(fillObjs, o);
    if (index_o !== -1) currentFill = index_o;
    clear_current_style_1();
    if (!elemCheck(fillObjs[last_currentFill])) {
      input_err();
      Qmsg.error("上一处 输入不正确");
    }
    var index_o = IndexOf_cur(fillObjs, o);
    if (index_o !== -1) {
      currentFill = index_o;
      last_currentFill = currentFill;
    }
    add_now(o);
    re_is_done();
  } else if (o.className == "word-filler-err") {
    re_is_done();
    clear_current_style_3();
    clear_current_style_2();
    clear_current_style_1();
    var index_o = IndexOf_cur(fillObjs, o);
    currentFill = index_o;
    last_currentFill = currentFill;
    currentInput = document.getElementById(fillObjs[currentFill].id).innerText;
    console.log("这里错了");
    isClozeNow = true;
    var elem0 = fillObjs[currentFill];
    document.getElementById(elem0.id).className = "word-filler-current";
  } else if (e.target.className == "selecTcss") {
    fff = e.target.innerText;
    Qmsg.success("已复制,正在获取网络发音");
    word_sound(fff);
    handleCopy(fff);
  } else if (e.target.className == "zh") {
    if (isShow == "hide") {
      console.log("偷看一眼");
      if (o.style.opacity == "0") {
        o.style.opacity = "1";
      } else {
        o.style.opacity = "0";
      }
    }
  }
};
document.getElementById("demo").ondblclick = (e) => {
  if (e.target.className == "demo-area" || e.target.className == "") {
    const selection = window.getSelection();
    var selecT = selection.toString().replace(/\ /g, "");
  } else if (
    e.target.className == "word-filler" ||
    e.target.className == "current-noter-container" ||
    e.target.className == "word-filler-done"
  ) {
    var index_o = IndexOf_cur(fillObjs, e.target);
    if (index_o !== -1) {
      currentFill = index_o;
      last_currentFill = currentFill;
    }
    window.getSelection().empty();
    return;
  }
  var nowTarget = e.target.id;
  var pattern2 = new RegExp("[A-Za-z]+");
  let isEnglish = pattern2.test(selecT);
  if (nowTarget === "demo" && isEnglish) {
    word_sound(selecT);
    console.log("选中单词 处理前", selecT);
    var select2word2rules = word2rules(selecT.toLowerCase(), ruleArray);
    if (select2word2rules.length == 1) {
      console.log("处理后 ：相同");
    } else {
      console.log("selecT 变原形", select2word2rules);
    }
    const range = window.getSelection().getRangeAt(0);
    const docObj = range.extractContents();
    let dom = document.createElement("span");
    dom.className = "selecTcss";
    dom.id = "demo-" + Date.now();
    dom.appendChild(docObj);
    range.insertNode(dom);
    handleCopy(selecT);
    Qmsg.success("已复制，正在获取网络发音");
    window.getSelection().empty();
  } else if (
    e.target.className == "" &&
    e.target.id.substring(0, 4) == "demo"
  ) {
    e.target.className = "selecTcss";
    word_sound(selecT);
    handleCopy(selecT);
    Qmsg.success("已复制，正在获取网络发音");
    window.getSelection().empty();
  } else if (
    e.target.className == "" &&
    e.target.id.substring(0, 4) == "word"
  ) {
    e.target.className = "word-filler";
    window.getSelection().empty();
    elemExplain(fillObjs[currentFill], false);
    add_now(o);
    fresh_listWords();
  }
};
document.getElementById("demo").oncontextmenu = (e) => {
  o = e.target;
  console.log("o.className", o.className);
  if (o.className == "selecTcss") {
    o.className = "";
    return;
  } else if (o.className == "word-filler-done") {
    o.className = "word-filler";
    fresh_listWords();
    return;
  }
};
var contextList = [];
function add_context_item(o) {
  var demo_item = {};
  demo_item.id = o.id;
  demo_item.className = o.className;
  contextList.push(demo_item);
}
document.getElementById("explain-area").oncontextmenu = (e) => {
  o = e.target;
  if (!state_in_excise) {
    if (o.className == "word-filler" || o.className == "word-filler-done") {
      add_context_item(o);
      console.log("取消标注");
      var str = o.id.replace(/-exp/g, "");
      document.getElementById(str).className = "";
      if (is_mark) document.getElementById(str).style.color = "";
      fresh_listWords();
      var badList_1 = JSON.parse(localStorage.getItem("badList"));
      badList_1.push(o.innerText);
      localStorage.setItem("badList", JSON.stringify(badList_1));
    }
  }
};
document.getElementById("explain-head").oncontextmenu = (e) => {
  e.preventDefault();
  o = e.target;
  console.log("o.className", o.className, o.id);
  if (!state_in_excise) {
    if (o.className == "word-filler" || o.className == "word-filler-done") {
      add_context_item(o);
      console.log("取消标注");
      var str = o.id.replace(/-exp/g, "");
      document.getElementById(str).className = "";
      if (is_mark) document.getElementById(str).style.color = "";
      if (!is_to_color) {
        fresh_listWords();
      } else {
        console.log("按 等级 排序");
        fresh_listWords_mark(o);
      }
      var badList_1 = JSON.parse(localStorage.getItem("badList"));
      badList_1.push(o.innerText.toLowerCase());
      localStorage.setItem("badList", JSON.stringify(badList_1));
    }
  }
};
document
  .getElementById("text-container")
  .addEventListener("scroll", function () {
    follow_scroll();
  });
function follow_scroll() {
  var num0 = document
    .getElementById("explain-area")
    .querySelectorAll(".word-filler");
  if (num0.length) {
    var text_con_scrollTop =
      document.getElementById("text-container").scrollTop;
    var word = document
      .getElementById("demo")
      .getElementsByClassName("word-filler");
    for (i = 0; i < word.length; i++) {
      var dif_num = word[i].offsetTop - text_con_scrollTop;
      if (dif_num > -10 && dif_num < 250) {
        var word_exp_Y = document.getElementById(word[i].id + "-exp").offsetTop;
        document.getElementById("explain-container").scrollTop =
          word_exp_Y - 30;
        return;
      }
    }
  }
}
function handleCopy(text) {
  const input = document.createElement("input");
  input.style.cssText = "opacity: 0;";
  input.type = "text";
  input.value = text;
  input.id = "copy_input";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.getElementById("copy_input").remove();
}
var isCc = false;
function gzhspan() {
  var resb = document.getElementById("demo").innerHTML;
  let rega =
    /[(\u4e00-\u9fa5)(0-9)(a-zA-Z)(\。|\？|\！|\，|\、|\；|\：|\・|\“|\”|\‘|\’|\（|\）|\／|\－|\《|\》|\【|\】|\[|\]|\~|\—|\,|\;|\:|\•|\ |\/|\…|\"|\'|\\|\/|\=|\-|\％|\%)]+/g;
  var reb = resb.match(rega);
  function unique(arr) {
    return Array.from(new Set(arr));
  }
  reb = unique(reb);
  var pattern3 = new RegExp("[\u4e00-\u9fa5]+");
  var rebcc = [];
  for (i = 0; i < reb.length; i++) {
    var isC = pattern3.test(reb[i]);
    if (isC) {
      rebcc.push(reb[i].trim());
      isCc = true;
    }
  }
  if (isCc) {
    for (i = 0; i < rebcc.length; i++) {
      var searchStr = rebcc[i];
      var newStr = resb.replace(
        new RegExp(searchStr, "g"),
        `<zh class="zh"style="display:initial;">${searchStr}</zh>`
      );
      resb = newStr;
    }
    document.getElementById("demo").innerHTML = resb;
  } else {
    Qmsg.warning("当前文本【不含中文】，无需处理");
  }
}
document.getElementById("demo").onmouseover = (e) => {
  var m = e.target;
  if (m.className == "" && m.id !== "") m.style.cursor = "pointer";
};
function IndexOf_cur(arr, item) {
  return arr.indexOf(item);
}
function cancel_rep() {}
var isFullScreen = false;
document.getElementById("fullScreen").onclick = (e) => {
  if (!isFullScreen) {
    launchFullscreen(document.documentElement);
    document.getElementById("fullScreen").value = "🔍退出全屏";
    isFullScreen = true;
  } else {
    exitFullscreen();
    document.getElementById("fullScreen").value = "🔍全屏";
    isFullScreen = false;
  }
};
document.addEventListener("fullscreenchange", function (e) {
  if (document.fullscreenElement) {
    Qmsg.success("已进入全屏");
  } else {
    Qmsg.success("已退出全屏");
    document.getElementById("fullScreen").value = "🔍全屏";
    isFullScreen = false;
  }
});
function launchFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullScreen();
  }
}
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}
document.getElementById("explain-con-top").onclick = function () {
  if (word_list.childNodes.length > 0) {
    fresh_listWords();
    open_mask();
    setTimeout(() => {
      document.getElementById("explain-outer").scrollTop = 0;
    }, 200);
  } else {
    Qmsg.warning("当前还没有数据");
  }
};
document.getElementById("text-area-long").onclick = function () {
  var maininput = document.getElementById("maininput");
  maininput.style.height = "680px";
};
document.getElementById("text-area-short").onclick = function () {
  var maininput = document.getElementById("maininput");
  maininput.style.height = "200px";
};
let fontSize = 14;
document.getElementById("text-area-fontzize-add").onclick = function () {
  fontSize = fontSize + 2;
  var maininput = document.getElementById("maininput");
  maininput.style.fontSize = fontSize + "px";
  maininput.style.lineHeight = fontSize + 1 + "px";
};
document.getElementById("text-area-fontzize-minus").onclick = function () {
  fontSize = fontSize - 2;
  var maininput = document.getElementById("maininput");
  maininput.style.fontSize = fontSize + "px";
  maininput.style.lineHeight = fontSize + 1 + "px";
};
document.getElementById("in-badList").onclick = function () {
  var maininput = document.getElementById("maininput");
  var bad_input = maininput.value;
  bad_input = bad_input.replace(/[\u4e00-\u9fa5]/g, " ");
  bad_input = bad_input.replace(
    /[\,|\.|\"|\'|\?|\!|\+|\=|\，|\。|\！|\？|\（|\）|\【|\】|\(|\)|\[|\]]/g,
    " "
  );
  let bad_input_1 = bad_input.split(/[ \r\n]/);
  bad_input_1 = bad_input_1.filter(function (s) {
    return s && s.trim();
  });
  for (i = 0; i < bad_input_1.length; i++) {
    bad_input_1[i] = bad_input_1[i].toLowerCase();
  }
  bad_input_1 = Array.from(new Set(bad_input_1));
  console.log("处理后bad_input_1", bad_input_1);
  if (!bad_input_1.length) {
    alert(
      "请先在下方的文本框中输入要屏蔽的单词【熟词、基础词】，\n\n单词统一为小写；\n单词间以【空格】或【回车】隔开；\n\n可【一定程度】自动去除中文及标点符号【但不要包含特殊符号】；"
    );
  } else {
    var r = confirm(
      "\n注意：\n\n单词统一为小写；\n单词间以【空格】或【回车】隔开;\n\n应经在下方文本框中输入了要【屏蔽】的单词，确认【屏蔽】以下熟词？"
    );
    if (r == true) {
      var badList_1 = JSON.parse(localStorage.getItem("badList"));
      badList_1 = badList_1.concat(bad_input_1);
      badList_1 = Array.from(new Set(badList_1));
      localStorage.setItem("badList", JSON.stringify(badList_1));
      setTimeout(() => {
        Qmsg.success("熟词已合并【屏蔽】，将不会在下次被标注");
        maininput.value = "";
      }, 500);
    }
  }
};
document.getElementById("cancel-badList").onclick = function () {
  var maininput = document.getElementById("maininput");
  var can_input = maininput.value;
  can_input = can_input.split(/[ \r\n]/);
  can_input = can_input.filter(function (s) {
    return s && s.trim();
  });
  for (i = 0; i < can_input.length; i++) {
    can_input[i] = can_input[i].toLowerCase();
  }
  can_input = Array.from(new Set(can_input));
  if (!can_input.length) {
    alert(
      "\n请先在下方的文本框中输入要【取消屏蔽】的单词，\n\n单词统一为小写；\n单词间以【空格】或【回车】隔开；"
    );
  } else {
    var r = confirm(
      "\n注意：\n\n单词统一为小写；\n单词间以【空格】或【回车】隔开；\n\n已经在下方文本框中输入了要【取消屏蔽】的单词，确认【取消屏蔽】？"
    );
    if (r == true) {
      var badList_2 = JSON.parse(localStorage.getItem("badList"));
      const new_badList = [];
      badList_2.forEach((item) => {
        if (!can_input.includes(item)) {
          new_badList.push(item);
        }
      });
      localStorage.setItem("badList", JSON.stringify(new_badList));
      setTimeout(() => {
        Qmsg.success("已取消【屏蔽】，将会在下次被标注");
        maininput.value = "";
      }, 500);
    }
  }
};
document.getElementById("look-badList").onclick = function () {
  var maininput = document.getElementById("maininput");
  if (maininput.value) {
    var re = confirm(
      "\n当前操作将【清空】下方文本框，请注意保存【重要数据】，确定？"
    );
    if (re) look();
  } else {
    look();
  }
  function look() {
    var badList_look = JSON.parse(localStorage.getItem("badList"));
    console.log("查看已屏蔽", badList_look);
    var num = "共 " + badList_look.length + " 词";
    var str = "";
    for (var i = 0; i < badList_look.length; i++) {
      str += badList_look[i] + "\n";
    }
    maininput.value = num + "\n\n" + str;
    maininput.scrollTop = 0;
  }
};
let word_list = document.getElementById("explain-head");
let word_list_mask = document.querySelector(".explain-head-mask");
function open_mask() {
  word_list_mask.style.display = "flex";
  document.body.style.overflow = "hidden";
}
word_list_mask.onclick = function (e) {
  if (e.target == word_list_mask) {
    word_list_mask.style.display = "none";
    document.body.style.overflow = "auto";
  }
};
document.getElementById("explain-con-top").oncontextmenu = function (e) {
  e.preventDefault();
  copy_btn_f();
};
document.getElementById("btn-copy").onclick = function (e) {
  copy_btn_f();
};
function copy_btn_f() {
  if (word_list.childNodes.length > 0) {
    var word_str = word_list.innerText;
    var word_arr = word_str.split(" ").filter(function (s) {
      return s && s.trim();
    });
    var word_final = "";
    for (i = 0; i < word_arr.length; i++) {
      word_final = word_final + word_arr[i] + "\n";
    }
    navigator.clipboard.writeText(word_final);
    Qmsg.success("[生词]已经复制到剪贴板喽！");
  } else {
    Qmsg.warning("当前还没有数据");
  }
}
var isSort = false;
document.getElementById("toUPcase").onclick = function () {
  is_to_color = false;
  if (!isSort) {
    var words1 = [...demo.getElementsByClassName("word-filler")];
    var words2 = [...demo.getElementsByClassName("word-filler-done")];
    var headDiv = document.getElementById("explain-head");
    headDiv.innerHTML = "";
    sort_wds(words1);
    sort_wds(words2);
    isSort = true;
    document.getElementById("toUPcase").innerHTML = "●";
    setTimeout(() => {
      document.getElementById("explain-outer").scrollTop = 0;
    }, 200);
  } else {
    var words1 = [...demo.getElementsByClassName("word-filler")];
    var words2 = [...demo.getElementsByClassName("word-filler-done")];
    var headDiv = document.getElementById("explain-head");
    headDiv.innerHTML = "";
    no_sort_wds(words1);
    no_sort_wds(words2);
    isSort = false;
    document.getElementById("toUPcase").innerHTML = "↑";
    setTimeout(() => {
      document.getElementById("explain-outer").scrollTop = 0;
    }, 200);
  }
  function sort_wds(wds) {
    wds
      .sort((a, b) => (elemInfo(a).voc >= elemInfo(b).voc ? 1 : -1))
      .forEach((o) => {
        var oHead = o.cloneNode();
        oHead.innerText = elemInfo(o).voc;
        headDiv.appendChild(oHead);
        headDiv.append(" ");
        oHead.onclick = () => {
          wordInfo = elemInfo(o);
          wordInfo.audio.play();
          word2board(wordInfo.voc);
          var cNew = fillObjs.findIndex((e) => e == o);
          if (cNew && cNew >= 0) {
            currentFill = cNew;
          }
          if (navigator.clipboard)
            navigator.clipboard.writeText(elemInfo(o).voc);
        };
      });
  }
  function no_sort_wds(wds) {
    wds.forEach((o) => {
      var oHead = o.cloneNode();
      oHead.innerText = elemInfo(o).voc;
      headDiv.appendChild(oHead);
      headDiv.append(" ");
      oHead.onclick = () => {
        wordInfo = elemInfo(o);
        wordInfo.audio.play();
        word2board(wordInfo.voc);
        var cNew = fillObjs.findIndex((e) => e == o);
        if (cNew && cNew >= 0) {
          currentFill = cNew;
        }
        if (navigator.clipboard) navigator.clipboard.writeText(elemInfo(o).voc);
      };
    });
  }
};
function add_now(o) {
  clear_current_style_2();
  if (o.parentNode.id == "demo") {
    o.insertBefore(elemNoter, o.firstChild);
  }
}
function clear_current_style_1() {
  var elem0 = fillObjs[currentFill];
  if (elem0) {
    if (state_in_excise) {
      elemModify(elem0, false);
    } else if (elem0.className == "word-filler-current") {
      elem0.className = "word-filler";
    }
  }
}
function clear_current_style_2() {
  var red_obj = document.getElementsByClassName("current-noter-container");
  if (red_obj.length) {
    var parent = red_obj[0].parentNode;
    parent.removeChild(red_obj[0]);
  }
  var cc = document.getElementsByClassName("word-filler-current");
  for (i = 0; i < cc.length; i++) {
    cc[i].className = "word-filler";
  }
}
function clear_current_style_3() {
  var okl = document.getElementsByClassName("word-filler-current");
  if (okl.length) {
    if (!elemCheck(fillObjs[last_currentFill])) {
      input_err();
      Qmsg.error("上一处 输入不正确");
      document.getElementsByClassName("word-filler-current")[0].className =
        "word-filler-err";
    }
  }
}
function cloze_now(elem) {
  if (elem.firstChild.id == "") {
    isClozeNow = true;
  }
}
var isDone = false;
var isDup = false;
var last_currentFill = 0;
function re_is_done() {
  if (isDone) {
    var eleme = fillObjs[last_currentFill];
    eleme.className = "word-filler-done";
  }
  isDone = false;
  if (isDup) {
    var eleme = fillObjs[last_currentFill];
    eleme.className = "word-filler-dup";
  }
  isDup = false;
}
function input_err() {
  var eleme = fillObjs[last_currentFill];
  console.log("eleme 输入错误", eleme);
  eleme.className = "word-filler-err";
}
function selected_handle(s) {
  var resb = document.getElementById("demo").innerHTML;
  for (i = 0; i < s.length; i++) {
    var searchStr = s[i];
    var newStr = resb.replace(
      searchStr,
      `<span class="selecTcss">${searchStr}</span>`
    );
    resb = newStr;
  }
  for (i = 0; i < s.length; i++) {
    var searchStr = s[i];
    var newStr = resb.replace(
      `<span class="selecTcss">${searchStr}</span>`,
      `<span class="selecTcss">${searchStr}</span>`
    );
    resb = newStr;
  }
  document.getElementById("demo").innerHTML = resb;
}



(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  var nonspace = /\S/g;
  var repeat = String.prototype.repeat || function (n) { return Array(n + 1).join(this); };
  function continueComment(cm) {
    if (cm.getOption("disableInput")) return CodeMirror.Pass;
    var ranges = cm.listSelections(), mode, inserts = [];
    for (var i = 0; i < ranges.length; i++) {
      var pos = ranges[i].head
      if (!/\bcomment\b/.test(cm.getTokenTypeAt(pos))) return CodeMirror.Pass;
      var modeHere = cm.getModeAt(pos)
      if (!mode) mode = modeHere;
      else if (mode != modeHere) return CodeMirror.Pass;

      var insert = null, line, found;
      var blockStart = mode.blockCommentStart, lineCmt = mode.lineComment;
      if (blockStart && mode.blockCommentContinue) {
        line = cm.getLine(pos.line);
        var end = line.lastIndexOf(mode.blockCommentEnd, pos.ch - mode.blockCommentEnd.length);
        if (end != -1 && end == pos.ch - mode.blockCommentEnd.length ||
            lineCmt && (found = line.lastIndexOf(lineCmt, pos.ch - 1)) > -1 &&
            /\bcomment\b/.test(cm.getTokenTypeAt({line: pos.line, ch: found + 1}))) {
        } else if (pos.ch >= blockStart.length &&
                   (found = line.lastIndexOf(blockStart, pos.ch - blockStart.length)) > -1 &&
                   found > end) {
          if (nonspaceAfter(0, line) >= found) {
            insert = line.slice(0, found);
          } else {
            var tabSize = cm.options.tabSize, numTabs;
            found = CodeMirror.countColumn(line, found, tabSize);
            insert = !cm.options.indentWithTabs ? repeat.call(" ", found) :
              repeat.call("\t", (numTabs = Math.floor(found / tabSize))) +
              repeat.call(" ", found - tabSize * numTabs);
          }
        } else if ((found = line.indexOf(mode.blockCommentContinue)) > -1 &&
                   found <= pos.ch &&
                   found <= nonspaceAfter(0, line)) {
          insert = line.slice(0, found);
        }
        if (insert != null) insert += mode.blockCommentContinue
      }
      if (insert == null && lineCmt && continueLineCommentEnabled(cm)) {
        if (line == null) line = cm.getLine(pos.line);
        found = line.indexOf(lineCmt);
        if (!pos.ch && !found) insert = "";
        else if (found > -1 && nonspaceAfter(0, line) >= found) {
          insert = nonspaceAfter(pos.ch, line) > -1;
          if (!insert) {
            var next = cm.getLine(pos.line + 1) || '',
                nextFound = next.indexOf(lineCmt);
            insert = nextFound > -1 && nonspaceAfter(0, next) >= nextFound || null;
          }
          if (insert) {
            insert = line.slice(0, found) + lineCmt +
                     line.slice(found + lineCmt.length).match(/^\s*/)[0];
          }
        }
      }
      if (insert == null) return CodeMirror.Pass;
      inserts[i] = "\n" + insert;
    }

    cm.operation(function() {
      for (var i = ranges.length - 1; i >= 0; i--)
        cm.replaceRange(inserts[i], ranges[i].from(), ranges[i].to(), "+insert");
    });
  }

  function nonspaceAfter(ch, str) {
    nonspace.lastIndex = ch;
    var m = nonspace.exec(str);
    return m ? m.index : -1;
  }

  function continueLineCommentEnabled(cm) {
    var opt = cm.getOption("continueComments");
    if (opt && typeof opt == "object")
      return opt.continueLineComment !== false;
    return true;
  }

  CodeMirror.defineOption("continueComments", null, function(cm, val, prev) {
    if (prev && prev != CodeMirror.Init)
      cm.removeKeyMap("continueComment");
    if (val) {
      var key = "Enter";
      if (typeof val == "string")
        key = val;
      else if (typeof val == "object" && val.key)
        key = val.key;
      var map = {name: "continueComment"};
      map[key] = continueComment;
      cm.addKeyMap(map);
    }
  });
});

import { isAbsolute, relative, dirname, basename } from 'pathe';
import c from 'picocolors';
import { a as slash } from './base.5NT-gWu5.js';

const F_RIGHT = "\u2192";
const F_DOWN = "\u2193";
const F_DOWN_RIGHT = "\u21B3";
const F_POINTER = "\u276F";
const F_DOT = "\xB7";
const F_CHECK = "\u2713";
const F_CROSS = "\xD7";
const F_LONG_DASH = "\u23AF";

function ansiRegex({onlyFirst = false} = {}) {
	const pattern = [
	    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

const regex = ansiRegex();

function stripAnsi(string) {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
	}

	// Even though the regex is global, we don't need to reset the `.lastIndex`
	// because unlike `.exec()` and `.test()`, `.replace()` does it automatically
	// and doing it manually has a performance penalty.
	return string.replace(regex, '');
}

const spinnerMap = /* @__PURE__ */ new WeakMap();
const hookSpinnerMap = /* @__PURE__ */ new WeakMap();
const pointer = c.yellow(F_POINTER);
const skipped = c.dim(c.gray(F_DOWN));
function getCols(delta = 0) {
  var _a;
  let length = (_a = process.stdout) == null ? void 0 : _a.columns;
  if (!length || Number.isNaN(length))
    length = 30;
  return Math.max(length + delta, 0);
}
function divider(text, left, right) {
  const cols = getCols();
  if (text) {
    const textLength = stripAnsi(text).length;
    if (left == null && right != null) {
      left = cols - textLength - right;
    } else {
      left = left ?? Math.floor((cols - textLength) / 2);
      right = cols - textLength - left;
    }
    left = Math.max(0, left);
    right = Math.max(0, right);
    return `${F_LONG_DASH.repeat(left)}${text}${F_LONG_DASH.repeat(right)}`;
  }
  return F_LONG_DASH.repeat(cols);
}
function formatTestPath(root, path) {
  var _a;
  if (isAbsolute(path))
    path = relative(root, path);
  const dir = dirname(path);
  const ext = ((_a = path.match(/(\.(spec|test)\.[cm]?[tj]sx?)$/)) == null ? void 0 : _a[0]) || "";
  const base = basename(path, ext);
  return slash(c.dim(`${dir}/`) + c.bold(base)) + c.dim(ext);
}
function renderSnapshotSummary(rootDir, snapshots) {
  const summary = [];
  if (snapshots.added)
    summary.push(c.bold(c.green(`${snapshots.added} written`)));
  if (snapshots.unmatched)
    summary.push(c.bold(c.red(`${snapshots.unmatched} failed`)));
  if (snapshots.updated)
    summary.push(c.bold(c.green(`${snapshots.updated} updated `)));
  if (snapshots.filesRemoved) {
    if (snapshots.didUpdate)
      summary.push(c.bold(c.green(`${snapshots.filesRemoved} files removed `)));
    else
      summary.push(c.bold(c.yellow(`${snapshots.filesRemoved} files obsolete `)));
  }
  if (snapshots.filesRemovedList && snapshots.filesRemovedList.length) {
    const [head, ...tail] = snapshots.filesRemovedList;
    summary.push(`${c.gray(F_DOWN_RIGHT)} ${formatTestPath(rootDir, head)}`);
    tail.forEach((key) => {
      summary.push(`  ${c.gray(F_DOT)} ${formatTestPath(rootDir, key)}`);
    });
  }
  if (snapshots.unchecked) {
    if (snapshots.didUpdate)
      summary.push(c.bold(c.green(`${snapshots.unchecked} removed`)));
    else
      summary.push(c.bold(c.yellow(`${snapshots.unchecked} obsolete`)));
    snapshots.uncheckedKeysByFile.forEach((uncheckedFile) => {
      summary.push(`${c.gray(F_DOWN_RIGHT)} ${formatTestPath(rootDir, uncheckedFile.filePath)}`);
      uncheckedFile.keys.forEach((key) => summary.push(`  ${c.gray(F_DOT)} ${key}`));
    });
  }
  return summary;
}
function countTestErrors(tasks) {
  return tasks.reduce((c2, i) => {
    var _a, _b;
    return c2 + (((_b = (_a = i.result) == null ? void 0 : _a.errors) == null ? void 0 : _b.length) || 0);
  }, 0);
}
function getStateString(tasks, name = "tests", showTotal = true) {
  if (tasks.length === 0)
    return c.dim(`no ${name}`);
  const passed = tasks.filter((i) => {
    var _a;
    return ((_a = i.result) == null ? void 0 : _a.state) === "pass";
  });
  const failed = tasks.filter((i) => {
    var _a;
    return ((_a = i.result) == null ? void 0 : _a.state) === "fail";
  });
  const skipped2 = tasks.filter((i) => i.mode === "skip");
  const todo = tasks.filter((i) => i.mode === "todo");
  return [
    failed.length ? c.bold(c.red(`${failed.length} failed`)) : null,
    passed.length ? c.bold(c.green(`${passed.length} passed`)) : null,
    skipped2.length ? c.yellow(`${skipped2.length} skipped`) : null,
    todo.length ? c.gray(`${todo.length} todo`) : null
  ].filter(Boolean).join(c.dim(" | ")) + (showTotal ? c.gray(` (${tasks.length})`) : "");
}
function getStateSymbol(task) {
  var _a;
  if (task.mode === "skip" || task.mode === "todo")
    return skipped;
  if (!task.result)
    return c.gray("\xB7");
  if (task.result.state === "run") {
    if (task.type === "suite")
      return pointer;
    let spinner = spinnerMap.get(task);
    if (!spinner) {
      spinner = elegantSpinner();
      spinnerMap.set(task, spinner);
    }
    return c.yellow(spinner());
  }
  if (task.result.state === "pass") {
    return ((_a = task.meta) == null ? void 0 : _a.benchmark) ? c.green(F_DOT) : c.green(F_CHECK);
  }
  if (task.result.state === "fail") {
    return task.type === "suite" ? pointer : c.red(F_CROSS);
  }
  return " ";
}
function getHookStateSymbol(task, hookName) {
  var _a, _b;
  const state = (_b = (_a = task.result) == null ? void 0 : _a.hooks) == null ? void 0 : _b[hookName];
  if (state && state === "run") {
    let spinnerMap2 = hookSpinnerMap.get(task);
    if (!spinnerMap2) {
      spinnerMap2 = /* @__PURE__ */ new Map();
      hookSpinnerMap.set(task, spinnerMap2);
    }
    let spinner = spinnerMap2.get(hookName);
    if (!spinner) {
      spinner = elegantSpinner();
      spinnerMap2.set(hookName, spinner);
    }
    return c.yellow(spinner());
  }
}
const spinnerFrames = process.platform === "win32" ? ["-", "\\", "|", "/"] : ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
function elegantSpinner() {
  let index = 0;
  return () => {
    index = ++index % spinnerFrames.length;
    return spinnerFrames[index];
  };
}
function formatTimeString(date) {
  return date.toTimeString().split(" ")[0];
}
function formatProjectName(name, suffix = " ") {
  if (!name)
    return "";
  const index = name.split("").reduce((acc, v, idx) => acc + v.charCodeAt(0) + idx, 0);
  const colors = [
    c.blue,
    c.yellow,
    c.cyan,
    c.green,
    c.magenta
  ];
  return colors[index % colors.length](`|${name}|`) + suffix;
}

var utils = /*#__PURE__*/Object.freeze({
	__proto__: null,
	countTestErrors: countTestErrors,
	divider: divider,
	elegantSpinner: elegantSpinner,
	formatProjectName: formatProjectName,
	formatTestPath: formatTestPath,
	formatTimeString: formatTimeString,
	getCols: getCols,
	getHookStateSymbol: getHookStateSymbol,
	getStateString: getStateString,
	getStateSymbol: getStateSymbol,
	hookSpinnerMap: hookSpinnerMap,
	pointer: pointer,
	renderSnapshotSummary: renderSnapshotSummary,
	skipped: skipped,
	spinnerFrames: spinnerFrames,
	spinnerMap: spinnerMap
});

export { F_RIGHT as F, getStateString as a, formatTimeString as b, countTestErrors as c, divider as d, getCols as e, formatProjectName as f, getStateSymbol as g, getHookStateSymbol as h, F_POINTER as i, pointer as p, renderSnapshotSummary as r, stripAnsi as s, utils as u };

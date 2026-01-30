import { Writable } from 'node:stream';
import { Console } from 'node:console';
import { relative } from 'node:path';
import { getSafeTimers, getColors } from '@vitest/utils';
import { R as RealDate } from '../vendor/date.Ns1pGd_X.js';
import 'pathe';
import '@vitest/runner/utils';
import { g as getWorkerState } from '../vendor/global.CkGT_TMy.js';
import '../vendor/env.AtSIuHFg.js';
import 'std-env';

const UNKNOWN_TEST_ID = "__vitest__unknown_test__";
function getTaskIdByStack(root) {
  var _a, _b;
  const stack = (_a = new Error("STACK_TRACE_ERROR").stack) == null ? void 0 : _a.split("\n");
  if (!stack)
    return UNKNOWN_TEST_ID;
  const index = stack.findIndex((line2) => line2.includes("at Console.value"));
  const line = index === -1 ? null : stack[index + 2];
  if (!line)
    return UNKNOWN_TEST_ID;
  const filepath = (_b = line.match(/at\s(.*)\s?/)) == null ? void 0 : _b[1];
  if (filepath)
    return relative(root, filepath);
  return UNKNOWN_TEST_ID;
}
function createCustomConsole() {
  const stdoutBuffer = /* @__PURE__ */ new Map();
  const stderrBuffer = /* @__PURE__ */ new Map();
  const timers = /* @__PURE__ */ new Map();
  const { setTimeout, clearTimeout } = getSafeTimers();
  const state = () => getWorkerState();
  function schedule(taskId) {
    const timer = timers.get(taskId);
    const { stdoutTime, stderrTime } = timer;
    clearTimeout(timer.timer);
    timer.timer = setTimeout(() => {
      if (stderrTime < stdoutTime) {
        sendStderr(taskId);
        sendStdout(taskId);
      } else {
        sendStdout(taskId);
        sendStderr(taskId);
      }
    });
  }
  function sendStdout(taskId) {
    const buffer = stdoutBuffer.get(taskId);
    if (!buffer)
      return;
    const content = buffer.map((i) => String(i)).join("");
    const timer = timers.get(taskId);
    state().rpc.onUserConsoleLog({
      type: "stdout",
      content: content || "<empty line>",
      taskId,
      time: timer.stdoutTime || RealDate.now(),
      size: buffer.length
    });
    stdoutBuffer.set(taskId, []);
    timer.stdoutTime = 0;
  }
  function sendStderr(taskId) {
    const buffer = stderrBuffer.get(taskId);
    if (!buffer)
      return;
    const content = buffer.map((i) => String(i)).join("");
    const timer = timers.get(taskId);
    state().rpc.onUserConsoleLog({
      type: "stderr",
      content: content || "<empty line>",
      taskId,
      time: timer.stderrTime || RealDate.now(),
      size: buffer.length
    });
    stderrBuffer.set(taskId, []);
    timer.stderrTime = 0;
  }
  const stdout = new Writable({
    write(data, encoding, callback) {
      var _a, _b, _c;
      const s = state();
      const id = ((_a = s == null ? void 0 : s.current) == null ? void 0 : _a.id) || ((_c = (_b = s == null ? void 0 : s.current) == null ? void 0 : _b.file) == null ? void 0 : _c.id) || getTaskIdByStack(s.config.root);
      let timer = timers.get(id);
      if (timer) {
        timer.stdoutTime = timer.stdoutTime || RealDate.now();
      } else {
        timer = { stdoutTime: RealDate.now(), stderrTime: RealDate.now(), timer: 0 };
        timers.set(id, timer);
      }
      let buffer = stdoutBuffer.get(id);
      if (!buffer) {
        buffer = [];
        stdoutBuffer.set(id, buffer);
      }
      buffer.push(data);
      schedule(id);
      callback();
    }
  });
  const stderr = new Writable({
    write(data, encoding, callback) {
      var _a, _b, _c;
      const s = state();
      const id = ((_a = s == null ? void 0 : s.current) == null ? void 0 : _a.id) || ((_c = (_b = s == null ? void 0 : s.current) == null ? void 0 : _b.file) == null ? void 0 : _c.id) || getTaskIdByStack(s.config.root);
      let timer = timers.get(id);
      if (timer) {
        timer.stderrTime = timer.stderrTime || RealDate.now();
      } else {
        timer = { stderrTime: RealDate.now(), stdoutTime: RealDate.now(), timer: 0 };
        timers.set(id, timer);
      }
      let buffer = stderrBuffer.get(id);
      if (!buffer) {
        buffer = [];
        stderrBuffer.set(id, buffer);
      }
      buffer.push(data);
      schedule(id);
      callback();
    }
  });
  return new Console({
    stdout,
    stderr,
    colorMode: getColors().isColorSupported,
    groupIndentation: 2
  });
}

export { UNKNOWN_TEST_ID, createCustomConsole };

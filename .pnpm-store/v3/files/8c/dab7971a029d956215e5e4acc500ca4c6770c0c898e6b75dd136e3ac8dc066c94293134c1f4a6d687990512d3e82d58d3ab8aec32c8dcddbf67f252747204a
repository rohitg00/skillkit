'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

exports.SpecialToken = void 0;
(function (SpecialToken) {
    SpecialToken["StartOfInput"] = "\0";
    SpecialToken["EndOfInput"] = "\u0001";
    SpecialToken["EndOfPartialInput"] = "\u0002";
})(exports.SpecialToken || (exports.SpecialToken = {}));
exports.NodeType = void 0;
(function (NodeType) {
    NodeType[NodeType["InitialNode"] = 0] = "InitialNode";
    NodeType[NodeType["SuccessNode"] = 1] = "SuccessNode";
    NodeType[NodeType["ErrorNode"] = 2] = "ErrorNode";
    NodeType[NodeType["CustomNode"] = 3] = "CustomNode";
})(exports.NodeType || (exports.NodeType = {}));
const HELP_COMMAND_INDEX = -1;
const HELP_REGEX = /^(-h|--help)(?:=([0-9]+))?$/;
const OPTION_REGEX = /^(--[a-z]+(?:-[a-z]+)*|-[a-zA-Z]+)$/;
const BATCH_REGEX = /^-[a-zA-Z]{2,}$/;
const BINDING_REGEX = /^([^=]+)=([\s\S]*)$/;
const IS_DEBUG = process.env.DEBUG_CLI === `1`;

exports.BATCH_REGEX = BATCH_REGEX;
exports.BINDING_REGEX = BINDING_REGEX;
exports.HELP_COMMAND_INDEX = HELP_COMMAND_INDEX;
exports.HELP_REGEX = HELP_REGEX;
exports.IS_DEBUG = IS_DEBUG;
exports.OPTION_REGEX = OPTION_REGEX;

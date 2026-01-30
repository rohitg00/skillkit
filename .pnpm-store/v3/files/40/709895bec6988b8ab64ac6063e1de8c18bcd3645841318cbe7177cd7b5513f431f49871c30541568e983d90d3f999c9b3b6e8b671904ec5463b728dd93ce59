var SpecialToken;
(function (SpecialToken) {
    SpecialToken["StartOfInput"] = "\0";
    SpecialToken["EndOfInput"] = "\u0001";
    SpecialToken["EndOfPartialInput"] = "\u0002";
})(SpecialToken || (SpecialToken = {}));
var NodeType;
(function (NodeType) {
    NodeType[NodeType["InitialNode"] = 0] = "InitialNode";
    NodeType[NodeType["SuccessNode"] = 1] = "SuccessNode";
    NodeType[NodeType["ErrorNode"] = 2] = "ErrorNode";
    NodeType[NodeType["CustomNode"] = 3] = "CustomNode";
})(NodeType || (NodeType = {}));
const HELP_COMMAND_INDEX = -1;
const HELP_REGEX = /^(-h|--help)(?:=([0-9]+))?$/;
const OPTION_REGEX = /^(--[a-z]+(?:-[a-z]+)*|-[a-zA-Z]+)$/;
const BATCH_REGEX = /^-[a-zA-Z]{2,}$/;
const BINDING_REGEX = /^([^=]+)=([\s\S]*)$/;
const IS_DEBUG = process.env.DEBUG_CLI === `1`;

export { BATCH_REGEX, BINDING_REGEX, HELP_COMMAND_INDEX, HELP_REGEX, IS_DEBUG, NodeType, OPTION_REGEX, SpecialToken };

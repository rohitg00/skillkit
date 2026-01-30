// @bun
import {
  ASCIIFontSelectionHelper,
  ATTRIBUTE_BASE_BITS,
  ATTRIBUTE_BASE_MASK,
  BaseRenderable,
  BorderCharArrays,
  BorderChars,
  CliRenderEvents,
  CliRenderer,
  ConsolePosition,
  DataPathsManager,
  DebugOverlayCorner,
  Edge,
  ExtmarksController,
  Gutter,
  InternalKeyHandler,
  KeyEvent,
  KeyHandler,
  LayoutEvents,
  LinearScrollAccel,
  LogLevel,
  MacOSScrollAccel,
  MeasureMode,
  MouseButton,
  MouseEvent,
  MouseParser,
  OptimizedBuffer,
  PasteEvent,
  RGBA,
  Renderable,
  RenderableEvents,
  RendererControlState,
  RootRenderable,
  Selection,
  StdinBuffer,
  StyledText,
  TerminalConsole,
  TerminalPalette,
  TextAttributes,
  TextBuffer,
  TreeSitterClient,
  addDefaultParsers,
  attributesWithLink,
  bg,
  bgBlack,
  bgBlue,
  bgCyan,
  bgGreen,
  bgMagenta,
  bgRed,
  bgWhite,
  bgYellow,
  black,
  blink,
  blue,
  bold,
  borderCharsToArray,
  brightBlack,
  brightBlue,
  brightCyan,
  brightGreen,
  brightMagenta,
  brightRed,
  brightWhite,
  brightYellow,
  buildKeyBindingsMap,
  buildKittyKeyboardFlags,
  capture,
  clearEnvCache,
  convertGlobalToLocalSelection,
  coordinateToCharacterIndex,
  createCliRenderer,
  createExtmarksController,
  createTerminalPalette,
  createTextAttributes,
  cyan,
  defaultKeyAliases,
  delegate,
  dim,
  env,
  envRegistry,
  exports_src,
  extToFiletype,
  fg,
  fonts,
  generateEnvColored,
  generateEnvMarkdown,
  getBaseAttributes,
  getBorderFromSides,
  getBorderSides,
  getCharacterPositions,
  getDataPaths,
  getKeyBindingKey,
  getLinkId,
  getObjectsInViewport,
  getTreeSitterClient,
  green,
  h,
  hastToStyledText,
  hexToRgb,
  hsvToRgb,
  instantiate,
  isRenderable,
  isStyledText,
  isVNode,
  isValidBorderStyle,
  isValidPercentage,
  italic,
  link,
  magenta,
  main,
  maybeMakeRenderable,
  measureText,
  mergeKeyAliases,
  mergeKeyBindings,
  nonAlphanumericKeys,
  parseAlign,
  parseAlignItems,
  parseBorderStyle,
  parseBoxSizing,
  parseColor,
  parseDimension,
  parseDirection,
  parseDisplay,
  parseEdge,
  parseFlexDirection,
  parseGutter,
  parseJustify,
  parseKeypress,
  parseLogLevel,
  parseMeasureMode,
  parseOverflow,
  parsePositionType,
  parseUnit,
  parseWrap,
  pathToFiletype,
  red,
  registerEnvVar,
  renderFontToFrameBuffer,
  resolveRenderLib,
  reverse,
  rgbToHex,
  setRenderLibPath,
  strikethrough,
  stringToStyledText,
  t,
  treeSitterToStyledText,
  treeSitterToTextChunks,
  underline,
  visualizeRenderableTree,
  white,
  wrapWithDelegates,
  yellow
} from "./index-s0q9547t.js";
// src/text-buffer-view.ts
class TextBufferView {
  lib;
  viewPtr;
  textBuffer;
  _destroyed = false;
  constructor(lib, ptr, textBuffer) {
    this.lib = lib;
    this.viewPtr = ptr;
    this.textBuffer = textBuffer;
  }
  static create(textBuffer) {
    const lib = resolveRenderLib();
    const viewPtr = lib.createTextBufferView(textBuffer.ptr);
    return new TextBufferView(lib, viewPtr, textBuffer);
  }
  guard() {
    if (this._destroyed)
      throw new Error("TextBufferView is destroyed");
  }
  get ptr() {
    this.guard();
    return this.viewPtr;
  }
  setSelection(start, end, bgColor, fgColor) {
    this.guard();
    this.lib.textBufferViewSetSelection(this.viewPtr, start, end, bgColor || null, fgColor || null);
  }
  updateSelection(end, bgColor, fgColor) {
    this.guard();
    this.lib.textBufferViewUpdateSelection(this.viewPtr, end, bgColor || null, fgColor || null);
  }
  resetSelection() {
    this.guard();
    this.lib.textBufferViewResetSelection(this.viewPtr);
  }
  getSelection() {
    this.guard();
    return this.lib.textBufferViewGetSelection(this.viewPtr);
  }
  hasSelection() {
    this.guard();
    return this.getSelection() !== null;
  }
  setLocalSelection(anchorX, anchorY, focusX, focusY, bgColor, fgColor) {
    this.guard();
    return this.lib.textBufferViewSetLocalSelection(this.viewPtr, anchorX, anchorY, focusX, focusY, bgColor || null, fgColor || null);
  }
  updateLocalSelection(anchorX, anchorY, focusX, focusY, bgColor, fgColor) {
    this.guard();
    return this.lib.textBufferViewUpdateLocalSelection(this.viewPtr, anchorX, anchorY, focusX, focusY, bgColor || null, fgColor || null);
  }
  resetLocalSelection() {
    this.guard();
    this.lib.textBufferViewResetLocalSelection(this.viewPtr);
  }
  setWrapWidth(width) {
    this.guard();
    this.lib.textBufferViewSetWrapWidth(this.viewPtr, width ?? 0);
  }
  setWrapMode(mode) {
    this.guard();
    this.lib.textBufferViewSetWrapMode(this.viewPtr, mode);
  }
  setViewportSize(width, height) {
    this.guard();
    this.lib.textBufferViewSetViewportSize(this.viewPtr, width, height);
  }
  setViewport(x, y, width, height) {
    this.guard();
    this.lib.textBufferViewSetViewport(this.viewPtr, x, y, width, height);
  }
  get lineInfo() {
    this.guard();
    return this.lib.textBufferViewGetLineInfo(this.viewPtr);
  }
  get logicalLineInfo() {
    this.guard();
    return this.lib.textBufferViewGetLogicalLineInfo(this.viewPtr);
  }
  getSelectedText() {
    this.guard();
    const byteSize = this.textBuffer.byteSize;
    if (byteSize === 0)
      return "";
    const selectedBytes = this.lib.textBufferViewGetSelectedTextBytes(this.viewPtr, byteSize);
    if (!selectedBytes)
      return "";
    return this.lib.decoder.decode(selectedBytes);
  }
  getPlainText() {
    this.guard();
    const byteSize = this.textBuffer.byteSize;
    if (byteSize === 0)
      return "";
    const plainBytes = this.lib.textBufferViewGetPlainTextBytes(this.viewPtr, byteSize);
    if (!plainBytes)
      return "";
    return this.lib.decoder.decode(plainBytes);
  }
  setTabIndicator(indicator) {
    this.guard();
    const codePoint = typeof indicator === "string" ? indicator.codePointAt(0) ?? 0 : indicator;
    this.lib.textBufferViewSetTabIndicator(this.viewPtr, codePoint);
  }
  setTabIndicatorColor(color) {
    this.guard();
    this.lib.textBufferViewSetTabIndicatorColor(this.viewPtr, color);
  }
  setTruncate(truncate) {
    this.guard();
    this.lib.textBufferViewSetTruncate(this.viewPtr, truncate);
  }
  measureForDimensions(width, height) {
    this.guard();
    return this.lib.textBufferViewMeasureForDimensions(this.viewPtr, width, height);
  }
  getVirtualLineCount() {
    this.guard();
    return this.lib.textBufferViewGetVirtualLineCount(this.viewPtr);
  }
  destroy() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    this.lib.destroyTextBufferView(this.viewPtr);
  }
}
// src/edit-buffer.ts
import { EventEmitter } from "events";

class EditBuffer extends EventEmitter {
  static registry = new Map;
  static nativeEventsSubscribed = false;
  lib;
  bufferPtr;
  textBufferPtr;
  id;
  _destroyed = false;
  _textBytes = [];
  _singleTextBytes = null;
  _singleTextMemId = null;
  _syntaxStyle;
  constructor(lib, ptr) {
    super();
    this.lib = lib;
    this.bufferPtr = ptr;
    this.textBufferPtr = lib.editBufferGetTextBuffer(ptr);
    this.id = lib.editBufferGetId(ptr);
    EditBuffer.registry.set(this.id, this);
    EditBuffer.subscribeToNativeEvents(lib);
  }
  static create(widthMethod) {
    const lib = resolveRenderLib();
    const ptr = lib.createEditBuffer(widthMethod);
    return new EditBuffer(lib, ptr);
  }
  static subscribeToNativeEvents(lib) {
    if (EditBuffer.nativeEventsSubscribed)
      return;
    EditBuffer.nativeEventsSubscribed = true;
    lib.onAnyNativeEvent((name, data) => {
      const buffer = new Uint16Array(data);
      if (name.startsWith("eb_") && buffer.length >= 1) {
        const id = buffer[0];
        const instance = EditBuffer.registry.get(id);
        if (instance) {
          const eventName = name.slice(3);
          const eventData = data.slice(2);
          instance.emit(eventName, eventData);
        }
      }
    });
  }
  guard() {
    if (this._destroyed)
      throw new Error("EditBuffer is destroyed");
  }
  get ptr() {
    this.guard();
    return this.bufferPtr;
  }
  setText(text) {
    this.guard();
    const textBytes = this.lib.encoder.encode(text);
    if (this._singleTextMemId !== null) {
      this.lib.textBufferReplaceMemBuffer(this.textBufferPtr, this._singleTextMemId, textBytes, false);
    } else {
      this._singleTextMemId = this.lib.textBufferRegisterMemBuffer(this.textBufferPtr, textBytes, false);
    }
    this._singleTextBytes = textBytes;
    this.lib.editBufferSetTextFromMem(this.bufferPtr, this._singleTextMemId);
  }
  setTextOwned(text) {
    this.guard();
    const textBytes = this.lib.encoder.encode(text);
    this.lib.editBufferSetText(this.bufferPtr, textBytes);
  }
  replaceText(text) {
    this.guard();
    const textBytes = this.lib.encoder.encode(text);
    this._textBytes.push(textBytes);
    const memId = this.lib.textBufferRegisterMemBuffer(this.textBufferPtr, textBytes, false);
    this.lib.editBufferReplaceTextFromMem(this.bufferPtr, memId);
  }
  replaceTextOwned(text) {
    this.guard();
    const textBytes = this.lib.encoder.encode(text);
    this.lib.editBufferReplaceText(this.bufferPtr, textBytes);
  }
  getLineCount() {
    this.guard();
    return this.lib.textBufferGetLineCount(this.textBufferPtr);
  }
  getText() {
    this.guard();
    const maxSize = 1024 * 1024;
    const textBytes = this.lib.editBufferGetText(this.bufferPtr, maxSize);
    if (!textBytes)
      return "";
    return this.lib.decoder.decode(textBytes);
  }
  insertChar(char) {
    this.guard();
    this.lib.editBufferInsertChar(this.bufferPtr, char);
  }
  insertText(text) {
    this.guard();
    this.lib.editBufferInsertText(this.bufferPtr, text);
  }
  deleteChar() {
    this.guard();
    this.lib.editBufferDeleteChar(this.bufferPtr);
  }
  deleteCharBackward() {
    this.guard();
    this.lib.editBufferDeleteCharBackward(this.bufferPtr);
  }
  deleteRange(startLine, startCol, endLine, endCol) {
    this.guard();
    this.lib.editBufferDeleteRange(this.bufferPtr, startLine, startCol, endLine, endCol);
  }
  newLine() {
    this.guard();
    this.lib.editBufferNewLine(this.bufferPtr);
  }
  deleteLine() {
    this.guard();
    this.lib.editBufferDeleteLine(this.bufferPtr);
  }
  moveCursorLeft() {
    this.guard();
    this.lib.editBufferMoveCursorLeft(this.bufferPtr);
  }
  moveCursorRight() {
    this.guard();
    this.lib.editBufferMoveCursorRight(this.bufferPtr);
  }
  moveCursorUp() {
    this.guard();
    this.lib.editBufferMoveCursorUp(this.bufferPtr);
  }
  moveCursorDown() {
    this.guard();
    this.lib.editBufferMoveCursorDown(this.bufferPtr);
  }
  gotoLine(line) {
    this.guard();
    this.lib.editBufferGotoLine(this.bufferPtr, line);
  }
  setCursor(line, col) {
    this.guard();
    this.lib.editBufferSetCursor(this.bufferPtr, line, col);
  }
  setCursorToLineCol(line, col) {
    this.guard();
    this.lib.editBufferSetCursorToLineCol(this.bufferPtr, line, col);
  }
  setCursorByOffset(offset) {
    this.guard();
    this.lib.editBufferSetCursorByOffset(this.bufferPtr, offset);
  }
  getCursorPosition() {
    this.guard();
    return this.lib.editBufferGetCursorPosition(this.bufferPtr);
  }
  getNextWordBoundary() {
    this.guard();
    const boundary = this.lib.editBufferGetNextWordBoundary(this.bufferPtr);
    return {
      row: boundary.row,
      col: boundary.col,
      offset: boundary.offset
    };
  }
  getPrevWordBoundary() {
    this.guard();
    const boundary = this.lib.editBufferGetPrevWordBoundary(this.bufferPtr);
    return {
      row: boundary.row,
      col: boundary.col,
      offset: boundary.offset
    };
  }
  getEOL() {
    this.guard();
    const boundary = this.lib.editBufferGetEOL(this.bufferPtr);
    return {
      row: boundary.row,
      col: boundary.col,
      offset: boundary.offset
    };
  }
  offsetToPosition(offset) {
    this.guard();
    const result = this.lib.editBufferOffsetToPosition(this.bufferPtr, offset);
    if (!result)
      return null;
    return { row: result.row, col: result.col };
  }
  positionToOffset(row, col) {
    this.guard();
    return this.lib.editBufferPositionToOffset(this.bufferPtr, row, col);
  }
  getLineStartOffset(row) {
    this.guard();
    return this.lib.editBufferGetLineStartOffset(this.bufferPtr, row);
  }
  getTextRange(startOffset, endOffset) {
    this.guard();
    if (startOffset >= endOffset)
      return "";
    const maxSize = 1024 * 1024;
    const textBytes = this.lib.editBufferGetTextRange(this.bufferPtr, startOffset, endOffset, maxSize);
    if (!textBytes)
      return "";
    return this.lib.decoder.decode(textBytes);
  }
  getTextRangeByCoords(startRow, startCol, endRow, endCol) {
    this.guard();
    const maxSize = 1024 * 1024;
    const textBytes = this.lib.editBufferGetTextRangeByCoords(this.bufferPtr, startRow, startCol, endRow, endCol, maxSize);
    if (!textBytes)
      return "";
    return this.lib.decoder.decode(textBytes);
  }
  debugLogRope() {
    this.guard();
    this.lib.editBufferDebugLogRope(this.bufferPtr);
  }
  undo() {
    this.guard();
    const maxSize = 256;
    const metaBytes = this.lib.editBufferUndo(this.bufferPtr, maxSize);
    if (!metaBytes)
      return null;
    return this.lib.decoder.decode(metaBytes);
  }
  redo() {
    this.guard();
    const maxSize = 256;
    const metaBytes = this.lib.editBufferRedo(this.bufferPtr, maxSize);
    if (!metaBytes)
      return null;
    return this.lib.decoder.decode(metaBytes);
  }
  canUndo() {
    this.guard();
    return this.lib.editBufferCanUndo(this.bufferPtr);
  }
  canRedo() {
    this.guard();
    return this.lib.editBufferCanRedo(this.bufferPtr);
  }
  clearHistory() {
    this.guard();
    this.lib.editBufferClearHistory(this.bufferPtr);
  }
  setDefaultFg(fg2) {
    this.guard();
    this.lib.textBufferSetDefaultFg(this.textBufferPtr, fg2);
  }
  setDefaultBg(bg2) {
    this.guard();
    this.lib.textBufferSetDefaultBg(this.textBufferPtr, bg2);
  }
  setDefaultAttributes(attributes) {
    this.guard();
    this.lib.textBufferSetDefaultAttributes(this.textBufferPtr, attributes);
  }
  resetDefaults() {
    this.guard();
    this.lib.textBufferResetDefaults(this.textBufferPtr);
  }
  setSyntaxStyle(style) {
    this.guard();
    this._syntaxStyle = style ?? undefined;
    this.lib.textBufferSetSyntaxStyle(this.textBufferPtr, style?.ptr ?? null);
  }
  getSyntaxStyle() {
    this.guard();
    return this._syntaxStyle ?? null;
  }
  addHighlight(lineIdx, highlight) {
    this.guard();
    this.lib.textBufferAddHighlight(this.textBufferPtr, lineIdx, highlight);
  }
  addHighlightByCharRange(highlight) {
    this.guard();
    this.lib.textBufferAddHighlightByCharRange(this.textBufferPtr, highlight);
  }
  removeHighlightsByRef(hlRef) {
    this.guard();
    this.lib.textBufferRemoveHighlightsByRef(this.textBufferPtr, hlRef);
  }
  clearLineHighlights(lineIdx) {
    this.guard();
    this.lib.textBufferClearLineHighlights(this.textBufferPtr, lineIdx);
  }
  clearAllHighlights() {
    this.guard();
    this.lib.textBufferClearAllHighlights(this.textBufferPtr);
  }
  getLineHighlights(lineIdx) {
    this.guard();
    return this.lib.textBufferGetLineHighlights(this.textBufferPtr, lineIdx);
  }
  clear() {
    this.guard();
    this.lib.editBufferClear(this.bufferPtr);
  }
  destroy() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    EditBuffer.registry.delete(this.id);
    this.lib.destroyEditBuffer(this.bufferPtr);
  }
}
// src/editor-view.ts
class EditorView {
  lib;
  viewPtr;
  editBuffer;
  _destroyed = false;
  _extmarksController;
  _textBufferViewPtr;
  constructor(lib, ptr, editBuffer) {
    this.lib = lib;
    this.viewPtr = ptr;
    this.editBuffer = editBuffer;
  }
  static create(editBuffer, viewportWidth, viewportHeight) {
    const lib = resolveRenderLib();
    const viewPtr = lib.createEditorView(editBuffer.ptr, viewportWidth, viewportHeight);
    return new EditorView(lib, viewPtr, editBuffer);
  }
  guard() {
    if (this._destroyed)
      throw new Error("EditorView is destroyed");
  }
  get ptr() {
    this.guard();
    return this.viewPtr;
  }
  setViewportSize(width, height) {
    this.guard();
    this.lib.editorViewSetViewportSize(this.viewPtr, width, height);
  }
  setViewport(x, y, width, height, moveCursor = true) {
    this.guard();
    this.lib.editorViewSetViewport(this.viewPtr, x, y, width, height, moveCursor);
  }
  getViewport() {
    this.guard();
    return this.lib.editorViewGetViewport(this.viewPtr);
  }
  setScrollMargin(margin) {
    this.guard();
    this.lib.editorViewSetScrollMargin(this.viewPtr, margin);
  }
  setWrapMode(mode) {
    this.guard();
    this.lib.editorViewSetWrapMode(this.viewPtr, mode);
  }
  getVirtualLineCount() {
    this.guard();
    return this.lib.editorViewGetVirtualLineCount(this.viewPtr);
  }
  getTotalVirtualLineCount() {
    this.guard();
    return this.lib.editorViewGetTotalVirtualLineCount(this.viewPtr);
  }
  setSelection(start, end, bgColor, fgColor) {
    this.guard();
    this.lib.editorViewSetSelection(this.viewPtr, start, end, bgColor || null, fgColor || null);
  }
  updateSelection(end, bgColor, fgColor) {
    this.guard();
    this.lib.editorViewUpdateSelection(this.viewPtr, end, bgColor || null, fgColor || null);
  }
  resetSelection() {
    this.guard();
    this.lib.editorViewResetSelection(this.viewPtr);
  }
  getSelection() {
    this.guard();
    return this.lib.editorViewGetSelection(this.viewPtr);
  }
  hasSelection() {
    this.guard();
    return this.getSelection() !== null;
  }
  setLocalSelection(anchorX, anchorY, focusX, focusY, bgColor, fgColor, updateCursor, followCursor) {
    this.guard();
    return this.lib.editorViewSetLocalSelection(this.viewPtr, anchorX, anchorY, focusX, focusY, bgColor || null, fgColor || null, updateCursor ?? false, followCursor ?? false);
  }
  updateLocalSelection(anchorX, anchorY, focusX, focusY, bgColor, fgColor, updateCursor, followCursor) {
    this.guard();
    return this.lib.editorViewUpdateLocalSelection(this.viewPtr, anchorX, anchorY, focusX, focusY, bgColor || null, fgColor || null, updateCursor ?? false, followCursor ?? false);
  }
  resetLocalSelection() {
    this.guard();
    this.lib.editorViewResetLocalSelection(this.viewPtr);
  }
  getSelectedText() {
    this.guard();
    const maxLength = 1024 * 1024;
    const selectedBytes = this.lib.editorViewGetSelectedTextBytes(this.viewPtr, maxLength);
    if (!selectedBytes)
      return "";
    return this.lib.decoder.decode(selectedBytes);
  }
  getCursor() {
    this.guard();
    return this.lib.editorViewGetCursor(this.viewPtr);
  }
  getText() {
    this.guard();
    const maxLength = 1024 * 1024;
    const textBytes = this.lib.editorViewGetText(this.viewPtr, maxLength);
    if (!textBytes)
      return "";
    return this.lib.decoder.decode(textBytes);
  }
  getVisualCursor() {
    this.guard();
    return this.lib.editorViewGetVisualCursor(this.viewPtr);
  }
  moveUpVisual() {
    this.guard();
    this.lib.editorViewMoveUpVisual(this.viewPtr);
  }
  moveDownVisual() {
    this.guard();
    this.lib.editorViewMoveDownVisual(this.viewPtr);
  }
  deleteSelectedText() {
    this.guard();
    this.lib.editorViewDeleteSelectedText(this.viewPtr);
  }
  setCursorByOffset(offset) {
    this.guard();
    this.lib.editorViewSetCursorByOffset(this.viewPtr, offset);
  }
  getNextWordBoundary() {
    this.guard();
    return this.lib.editorViewGetNextWordBoundary(this.viewPtr);
  }
  getPrevWordBoundary() {
    this.guard();
    return this.lib.editorViewGetPrevWordBoundary(this.viewPtr);
  }
  getEOL() {
    this.guard();
    return this.lib.editorViewGetEOL(this.viewPtr);
  }
  getVisualSOL() {
    this.guard();
    return this.lib.editorViewGetVisualSOL(this.viewPtr);
  }
  getVisualEOL() {
    this.guard();
    return this.lib.editorViewGetVisualEOL(this.viewPtr);
  }
  getLineInfo() {
    this.guard();
    return this.lib.editorViewGetLineInfo(this.viewPtr);
  }
  getLogicalLineInfo() {
    this.guard();
    return this.lib.editorViewGetLogicalLineInfo(this.viewPtr);
  }
  get extmarks() {
    if (!this._extmarksController) {
      this._extmarksController = createExtmarksController(this.editBuffer, this);
    }
    return this._extmarksController;
  }
  setPlaceholderStyledText(chunks) {
    this.guard();
    this.lib.editorViewSetPlaceholderStyledText(this.viewPtr, chunks);
  }
  setTabIndicator(indicator) {
    this.guard();
    const codePoint = typeof indicator === "string" ? indicator.codePointAt(0) ?? 0 : indicator;
    this.lib.editorViewSetTabIndicator(this.viewPtr, codePoint);
  }
  setTabIndicatorColor(color) {
    this.guard();
    this.lib.editorViewSetTabIndicatorColor(this.viewPtr, color);
  }
  measureForDimensions(width, height) {
    this.guard();
    if (!this._textBufferViewPtr) {
      this._textBufferViewPtr = this.lib.editorViewGetTextBufferView(this.viewPtr);
    }
    return this.lib.textBufferViewMeasureForDimensions(this._textBufferViewPtr, width, height);
  }
  destroy() {
    if (this._destroyed)
      return;
    if (this._extmarksController) {
      this._extmarksController.destroy();
      this._extmarksController = undefined;
    }
    this._destroyed = true;
    this.lib.destroyEditorView(this.viewPtr);
  }
}
// src/syntax-style.ts
function convertThemeToStyles(theme) {
  const flatStyles = {};
  for (const tokenStyle of theme) {
    const styleDefinition = {};
    if (tokenStyle.style.foreground) {
      styleDefinition.fg = parseColor(tokenStyle.style.foreground);
    }
    if (tokenStyle.style.background) {
      styleDefinition.bg = parseColor(tokenStyle.style.background);
    }
    if (tokenStyle.style.bold !== undefined) {
      styleDefinition.bold = tokenStyle.style.bold;
    }
    if (tokenStyle.style.italic !== undefined) {
      styleDefinition.italic = tokenStyle.style.italic;
    }
    if (tokenStyle.style.underline !== undefined) {
      styleDefinition.underline = tokenStyle.style.underline;
    }
    if (tokenStyle.style.dim !== undefined) {
      styleDefinition.dim = tokenStyle.style.dim;
    }
    for (const scope of tokenStyle.scope) {
      flatStyles[scope] = styleDefinition;
    }
  }
  return flatStyles;
}

class SyntaxStyle {
  lib;
  stylePtr;
  _destroyed = false;
  nameCache = new Map;
  styleDefs = new Map;
  mergedCache = new Map;
  constructor(lib, ptr) {
    this.lib = lib;
    this.stylePtr = ptr;
  }
  static create() {
    const lib = resolveRenderLib();
    const ptr = lib.createSyntaxStyle();
    return new SyntaxStyle(lib, ptr);
  }
  static fromTheme(theme) {
    const style = SyntaxStyle.create();
    const flatStyles = convertThemeToStyles(theme);
    for (const [name, styleDef] of Object.entries(flatStyles)) {
      style.registerStyle(name, styleDef);
    }
    return style;
  }
  static fromStyles(styles) {
    const style = SyntaxStyle.create();
    for (const [name, styleDef] of Object.entries(styles)) {
      style.registerStyle(name, styleDef);
    }
    return style;
  }
  guard() {
    if (this._destroyed)
      throw new Error("NativeSyntaxStyle is destroyed");
  }
  registerStyle(name, style) {
    this.guard();
    const attributes = createTextAttributes({
      bold: style.bold,
      italic: style.italic,
      underline: style.underline,
      dim: style.dim
    });
    const id = this.lib.syntaxStyleRegister(this.stylePtr, name, style.fg || null, style.bg || null, attributes);
    this.nameCache.set(name, id);
    this.styleDefs.set(name, style);
    return id;
  }
  resolveStyleId(name) {
    this.guard();
    const cached = this.nameCache.get(name);
    if (cached !== undefined)
      return cached;
    const id = this.lib.syntaxStyleResolveByName(this.stylePtr, name);
    if (id !== null) {
      this.nameCache.set(name, id);
    }
    return id;
  }
  getStyleId(name) {
    this.guard();
    const id = this.resolveStyleId(name);
    if (id !== null)
      return id;
    if (name.includes(".")) {
      const baseName = name.split(".")[0];
      return this.resolveStyleId(baseName);
    }
    return null;
  }
  get ptr() {
    this.guard();
    return this.stylePtr;
  }
  getStyleCount() {
    this.guard();
    return this.lib.syntaxStyleGetStyleCount(this.stylePtr);
  }
  clearNameCache() {
    this.nameCache.clear();
  }
  getStyle(name) {
    this.guard();
    if (Object.prototype.hasOwnProperty.call(this.styleDefs, name)) {
      return;
    }
    const style = this.styleDefs.get(name);
    if (style)
      return style;
    if (name.includes(".")) {
      const baseName = name.split(".")[0];
      if (Object.prototype.hasOwnProperty.call(this.styleDefs, baseName)) {
        return;
      }
      return this.styleDefs.get(baseName);
    }
    return;
  }
  mergeStyles(...styleNames) {
    this.guard();
    const cacheKey = styleNames.join(":");
    const cached = this.mergedCache.get(cacheKey);
    if (cached)
      return cached;
    const styleDefinition = {};
    for (const name of styleNames) {
      const style = this.getStyle(name);
      if (!style)
        continue;
      if (style.fg)
        styleDefinition.fg = style.fg;
      if (style.bg)
        styleDefinition.bg = style.bg;
      if (style.bold !== undefined)
        styleDefinition.bold = style.bold;
      if (style.italic !== undefined)
        styleDefinition.italic = style.italic;
      if (style.underline !== undefined)
        styleDefinition.underline = style.underline;
      if (style.dim !== undefined)
        styleDefinition.dim = style.dim;
    }
    const attributes = createTextAttributes({
      bold: styleDefinition.bold,
      italic: styleDefinition.italic,
      underline: styleDefinition.underline,
      dim: styleDefinition.dim
    });
    const merged = {
      fg: styleDefinition.fg,
      bg: styleDefinition.bg,
      attributes
    };
    this.mergedCache.set(cacheKey, merged);
    return merged;
  }
  clearCache() {
    this.guard();
    this.mergedCache.clear();
  }
  getCacheSize() {
    this.guard();
    return this.mergedCache.size;
  }
  getAllStyles() {
    this.guard();
    return new Map(this.styleDefs);
  }
  getRegisteredNames() {
    this.guard();
    return Array.from(this.styleDefs.keys());
  }
  destroy() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    this.nameCache.clear();
    this.styleDefs.clear();
    this.mergedCache.clear();
    this.lib.destroySyntaxStyle(this.stylePtr);
  }
}
// src/post/filters.ts
function applyScanlines(buffer, strength = 0.8, step = 2) {
  const width = buffer.width;
  const height = buffer.height;
  const bg2 = buffer.buffers.bg;
  for (let y = 0;y < height; y += step) {
    for (let x = 0;x < width; x++) {
      const colorIndex = (y * width + x) * 4;
      bg2[colorIndex] *= strength;
      bg2[colorIndex + 1] *= strength;
      bg2[colorIndex + 2] *= strength;
    }
  }
}
function applyGrayscale(buffer) {
  const size = buffer.width * buffer.height;
  const fg2 = buffer.buffers.fg;
  const bg2 = buffer.buffers.bg;
  for (let i = 0;i < size; i++) {
    const colorIndex = i * 4;
    const fgR = fg2[colorIndex];
    const fgG = fg2[colorIndex + 1];
    const fgB = fg2[colorIndex + 2];
    const fgLum = 0.299 * fgR + 0.587 * fgG + 0.114 * fgB;
    fg2[colorIndex] = fgLum;
    fg2[colorIndex + 1] = fgLum;
    fg2[colorIndex + 2] = fgLum;
    const bgR = bg2[colorIndex];
    const bgG = bg2[colorIndex + 1];
    const bgB = bg2[colorIndex + 2];
    const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
    bg2[colorIndex] = bgLum;
    bg2[colorIndex + 1] = bgLum;
    bg2[colorIndex + 2] = bgLum;
  }
}
function applySepia(buffer) {
  const size = buffer.width * buffer.height;
  const fg2 = buffer.buffers.fg;
  const bg2 = buffer.buffers.bg;
  for (let i = 0;i < size; i++) {
    const colorIndex = i * 4;
    let fgR = fg2[colorIndex];
    let fgG = fg2[colorIndex + 1];
    let fgB = fg2[colorIndex + 2];
    let newFgR = Math.min(1, fgR * 0.393 + fgG * 0.769 + fgB * 0.189);
    let newFgG = Math.min(1, fgR * 0.349 + fgG * 0.686 + fgB * 0.168);
    let newFgB = Math.min(1, fgR * 0.272 + fgG * 0.534 + fgB * 0.131);
    fg2[colorIndex] = newFgR;
    fg2[colorIndex + 1] = newFgG;
    fg2[colorIndex + 2] = newFgB;
    let bgR = bg2[colorIndex];
    let bgG = bg2[colorIndex + 1];
    let bgB = bg2[colorIndex + 2];
    let newBgR = Math.min(1, bgR * 0.393 + bgG * 0.769 + bgB * 0.189);
    let newBgG = Math.min(1, bgR * 0.349 + bgG * 0.686 + bgB * 0.168);
    let newBgB = Math.min(1, bgR * 0.272 + bgG * 0.534 + bgB * 0.131);
    bg2[colorIndex] = newBgR;
    bg2[colorIndex + 1] = newBgG;
    bg2[colorIndex + 2] = newBgB;
  }
}
function applyInvert(buffer) {
  const size = buffer.width * buffer.height;
  const fg2 = buffer.buffers.fg;
  const bg2 = buffer.buffers.bg;
  for (let i = 0;i < size; i++) {
    const colorIndex = i * 4;
    fg2[colorIndex] = 1 - fg2[colorIndex];
    fg2[colorIndex + 1] = 1 - fg2[colorIndex + 1];
    fg2[colorIndex + 2] = 1 - fg2[colorIndex + 2];
    bg2[colorIndex] = 1 - bg2[colorIndex];
    bg2[colorIndex + 1] = 1 - bg2[colorIndex + 1];
    bg2[colorIndex + 2] = 1 - bg2[colorIndex + 2];
  }
}
function applyNoise(buffer, strength = 0.1) {
  const size = buffer.width * buffer.height;
  const fg2 = buffer.buffers.fg;
  const bg2 = buffer.buffers.bg;
  for (let i = 0;i < size; i++) {
    const colorIndex = i * 4;
    const noise = (Math.random() - 0.5) * strength;
    fg2[colorIndex] = Math.max(0, Math.min(1, fg2[colorIndex] + noise));
    fg2[colorIndex + 1] = Math.max(0, Math.min(1, fg2[colorIndex + 1] + noise));
    fg2[colorIndex + 2] = Math.max(0, Math.min(1, fg2[colorIndex + 2] + noise));
    bg2[colorIndex] = Math.max(0, Math.min(1, bg2[colorIndex] + noise));
    bg2[colorIndex + 1] = Math.max(0, Math.min(1, bg2[colorIndex + 1] + noise));
    bg2[colorIndex + 2] = Math.max(0, Math.min(1, bg2[colorIndex + 2] + noise));
  }
}
function applyChromaticAberration(buffer, strength = 1) {
  const width = buffer.width;
  const height = buffer.height;
  const srcFg = Float32Array.from(buffer.buffers.fg);
  const destFg = buffer.buffers.fg;
  const centerX = width / 2;
  const centerY = height / 2;
  for (let y = 0;y < height; y++) {
    for (let x = 0;x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const offset = Math.round(Math.sqrt(dx * dx + dy * dy) / Math.max(centerX, centerY) * strength);
      const rX = Math.max(0, Math.min(width - 1, x - offset));
      const bX = Math.max(0, Math.min(width - 1, x + offset));
      const rIndex = (y * width + rX) * 4;
      const gIndex = (y * width + x) * 4;
      const bIndex = (y * width + bX) * 4;
      const destIndex = (y * width + x) * 4;
      destFg[destIndex] = srcFg[rIndex];
      destFg[destIndex + 1] = srcFg[gIndex + 1];
      destFg[destIndex + 2] = srcFg[bIndex + 2];
    }
  }
}
function applyAsciiArt(buffer, ramp = " .:-=+*#%@") {
  const width = buffer.width;
  const height = buffer.height;
  const chars = buffer.buffers.char;
  const bg2 = buffer.buffers.bg;
  const rampLength = ramp.length;
  for (let y = 0;y < height; y++) {
    for (let x = 0;x < width; x++) {
      const index = y * width + x;
      const colorIndex = index * 4;
      const bgR = bg2[colorIndex];
      const bgG = bg2[colorIndex + 1];
      const bgB = bg2[colorIndex + 2];
      const lum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
      const rampIndex = Math.min(rampLength - 1, Math.floor(lum * rampLength));
      chars[index] = ramp[rampIndex].charCodeAt(0);
    }
  }
}

class DistortionEffect {
  glitchChancePerSecond = 0.5;
  maxGlitchLines = 3;
  minGlitchDuration = 0.05;
  maxGlitchDuration = 0.2;
  maxShiftAmount = 10;
  shiftFlipRatio = 0.6;
  colorGlitchChance = 0.2;
  lastGlitchTime = 0;
  glitchDuration = 0;
  activeGlitches = [];
  constructor(options) {
    if (options) {
      Object.assign(this, options);
    }
  }
  apply(buffer, deltaTime) {
    const width = buffer.width;
    const height = buffer.height;
    const buf = buffer.buffers;
    this.lastGlitchTime += deltaTime;
    if (this.activeGlitches.length > 0 && this.lastGlitchTime >= this.glitchDuration) {
      this.activeGlitches = [];
      this.glitchDuration = 0;
    }
    if (this.activeGlitches.length === 0 && Math.random() < this.glitchChancePerSecond * deltaTime) {
      this.lastGlitchTime = 0;
      this.glitchDuration = this.minGlitchDuration + Math.random() * (this.maxGlitchDuration - this.minGlitchDuration);
      const numGlitches = 1 + Math.floor(Math.random() * this.maxGlitchLines);
      for (let i = 0;i < numGlitches; i++) {
        const y = Math.floor(Math.random() * height);
        let type;
        let amount = 0;
        const typeRoll = Math.random();
        if (typeRoll < this.colorGlitchChance) {
          type = "color";
        } else {
          const shiftRoll = (typeRoll - this.colorGlitchChance) / (1 - this.colorGlitchChance);
          if (shiftRoll < this.shiftFlipRatio) {
            type = "shift";
            amount = Math.floor((Math.random() - 0.5) * 2 * this.maxShiftAmount);
          } else {
            type = "flip";
          }
        }
        if (!this.activeGlitches.some((g) => g.y === y)) {
          this.activeGlitches.push({ y, type, amount });
        }
      }
    }
    if (this.activeGlitches.length > 0) {
      let tempChar = null;
      let tempFg = null;
      let tempBg = null;
      let tempAttr = null;
      for (const glitch of this.activeGlitches) {
        const y = glitch.y;
        if (y < 0 || y >= height)
          continue;
        const baseIndex = y * width;
        if (glitch.type === "shift" || glitch.type === "flip") {
          if (!tempChar) {
            tempChar = new Uint32Array(width);
            tempFg = new Float32Array(width * 4);
            tempBg = new Float32Array(width * 4);
            tempAttr = new Uint8Array(width);
          }
          try {
            tempChar.set(buf.char.subarray(baseIndex, baseIndex + width));
            tempFg.set(buf.fg.subarray(baseIndex * 4, (baseIndex + width) * 4));
            tempBg.set(buf.bg.subarray(baseIndex * 4, (baseIndex + width) * 4));
            tempAttr.set(buf.attributes.subarray(baseIndex, baseIndex + width));
          } catch (e) {
            console.error(`Error copying row ${y} for distortion:`, e);
            continue;
          }
          if (glitch.type === "shift") {
            const shift = glitch.amount;
            for (let x = 0;x < width; x++) {
              const srcX = (x - shift + width) % width;
              const destIndex = baseIndex + x;
              const srcTempIndex = srcX;
              buf.char[destIndex] = tempChar[srcTempIndex];
              buf.attributes[destIndex] = tempAttr[srcTempIndex];
              const destColorIndex = destIndex * 4;
              const srcTempColorIndex = srcTempIndex * 4;
              buf.fg.set(tempFg.subarray(srcTempColorIndex, srcTempColorIndex + 4), destColorIndex);
              buf.bg.set(tempBg.subarray(srcTempColorIndex, srcTempColorIndex + 4), destColorIndex);
            }
          } else {
            for (let x = 0;x < width; x++) {
              const srcX = width - 1 - x;
              const destIndex = baseIndex + x;
              const srcTempIndex = srcX;
              buf.char[destIndex] = tempChar[srcTempIndex];
              buf.attributes[destIndex] = tempAttr[srcTempIndex];
              const destColorIndex = destIndex * 4;
              const srcTempColorIndex = srcTempIndex * 4;
              buf.fg.set(tempFg.subarray(srcTempColorIndex, srcTempColorIndex + 4), destColorIndex);
              buf.bg.set(tempBg.subarray(srcTempColorIndex, srcTempColorIndex + 4), destColorIndex);
            }
          }
        } else if (glitch.type === "color") {
          const glitchStart = Math.floor(Math.random() * width);
          const maxPossibleLength = width - glitchStart;
          let glitchLength = Math.floor(Math.random() * maxPossibleLength) + 1;
          if (Math.random() < 0.2) {
            glitchLength = Math.floor(Math.random() * (width / 4)) + 1;
          }
          glitchLength = Math.min(glitchLength, maxPossibleLength);
          for (let x = glitchStart;x < glitchStart + glitchLength; x++) {
            if (x >= width)
              break;
            const destIndex = baseIndex + x;
            const destColorIndex = destIndex * 4;
            let rFg, gFg, bFg, rBg, gBg, bBg;
            const colorMode = Math.random();
            if (colorMode < 0.33) {
              rFg = Math.random();
              gFg = Math.random();
              bFg = Math.random();
              rBg = Math.random();
              gBg = Math.random();
              bBg = Math.random();
            } else if (colorMode < 0.66) {
              const emphasis = Math.random();
              if (emphasis < 0.25) {
                rFg = Math.random();
                gFg = 0;
                bFg = 0;
              } else if (emphasis < 0.5) {
                rFg = 0;
                gFg = Math.random();
                bFg = 0;
              } else if (emphasis < 0.75) {
                rFg = 0;
                gFg = 0;
                bFg = Math.random();
              } else {
                const glitchColorRoll = Math.random();
                if (glitchColorRoll < 0.33) {
                  rFg = 1;
                  gFg = 0;
                  bFg = 1;
                } else if (glitchColorRoll < 0.66) {
                  rFg = 0;
                  gFg = 1;
                  bFg = 1;
                } else {
                  rFg = 1;
                  gFg = 1;
                  bFg = 0;
                }
              }
              if (Math.random() < 0.5) {
                rBg = 1 - rFg;
                gBg = 1 - gFg;
                bBg = 1 - bFg;
              } else {
                rBg = rFg * (Math.random() * 0.5 + 0.2);
                gBg = gFg * (Math.random() * 0.5 + 0.2);
                bBg = bFg * (Math.random() * 0.5 + 0.2);
              }
            } else {
              rFg = Math.random() > 0.5 ? 1 : 0;
              gFg = Math.random() > 0.5 ? 1 : 0;
              bFg = Math.random() > 0.5 ? 1 : 0;
              rBg = 1 - rFg;
              gBg = 1 - gFg;
              bBg = 1 - bFg;
            }
            buf.fg[destColorIndex] = rFg;
            buf.fg[destColorIndex + 1] = gFg;
            buf.fg[destColorIndex + 2] = bFg;
            buf.bg[destColorIndex] = rBg;
            buf.bg[destColorIndex + 1] = gBg;
            buf.bg[destColorIndex + 2] = bBg;
          }
        }
      }
    }
  }
}

class VignetteEffect {
  _strength;
  precomputedBaseAttenuation = null;
  cachedWidth = -1;
  cachedHeight = -1;
  constructor(strength = 0.5) {
    this._strength = strength;
  }
  set strength(newStrength) {
    this._strength = Math.max(0, newStrength);
  }
  get strength() {
    return this._strength;
  }
  _computeFactors(width, height) {
    this.precomputedBaseAttenuation = new Float32Array(width * height);
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistSq = centerX * centerX + centerY * centerY;
    const safeMaxDistSq = maxDistSq === 0 ? 1 : maxDistSq;
    for (let y = 0;y < height; y++) {
      const dy = y - centerY;
      const dySq = dy * dy;
      for (let x = 0;x < width; x++) {
        const dx = x - centerX;
        const distSq = dx * dx + dySq;
        const baseAttenuation = Math.min(1, distSq / safeMaxDistSq);
        const index = y * width + x;
        this.precomputedBaseAttenuation[index] = baseAttenuation;
      }
    }
    this.cachedWidth = width;
    this.cachedHeight = height;
  }
  apply(buffer) {
    const width = buffer.width;
    const height = buffer.height;
    const buf = buffer.buffers;
    const size = width * height;
    if (width !== this.cachedWidth || height !== this.cachedHeight || !this.precomputedBaseAttenuation) {
      this._computeFactors(width, height);
    }
    for (let i = 0;i < size; i++) {
      const factor = Math.max(0, 1 - this.precomputedBaseAttenuation[i] * this._strength);
      const colorIndex = i * 4;
      buf.fg[colorIndex] *= factor;
      buf.fg[colorIndex + 1] *= factor;
      buf.fg[colorIndex + 2] *= factor;
      buf.bg[colorIndex] *= factor;
      buf.bg[colorIndex + 1] *= factor;
      buf.bg[colorIndex + 2] *= factor;
    }
  }
}

class BrightnessEffect {
  _brightness;
  constructor(brightness = 1) {
    this._brightness = Math.max(0, brightness);
  }
  set brightness(newBrightness) {
    this._brightness = Math.max(0, newBrightness);
  }
  get brightness() {
    return this._brightness;
  }
  apply(buffer) {
    const size = buffer.width * buffer.height;
    const fg2 = buffer.buffers.fg;
    const bg2 = buffer.buffers.bg;
    const factor = this._brightness;
    if (factor === 1) {
      return;
    }
    for (let i = 0;i < size; i++) {
      const colorIndex = i * 4;
      fg2[colorIndex] = Math.min(1, fg2[colorIndex] * factor);
      fg2[colorIndex + 1] = Math.min(1, fg2[colorIndex + 1] * factor);
      fg2[colorIndex + 2] = Math.min(1, fg2[colorIndex + 2] * factor);
      bg2[colorIndex] = Math.min(1, bg2[colorIndex] * factor);
      bg2[colorIndex + 1] = Math.min(1, bg2[colorIndex + 1] * factor);
      bg2[colorIndex + 2] = Math.min(1, bg2[colorIndex + 2] * factor);
    }
  }
}

class BlurEffect {
  _radius;
  constructor(radius = 1) {
    this._radius = Math.max(0, Math.round(radius));
  }
  set radius(newRadius) {
    this._radius = Math.max(0, Math.round(newRadius));
  }
  get radius() {
    return this._radius;
  }
  apply(buffer) {
    const radius = this._radius;
    if (radius <= 0)
      return;
    const width = buffer.width;
    const height = buffer.height;
    const buf = buffer.buffers;
    const srcFg = buf.fg;
    const srcBg = buf.bg;
    const destFg = buf.fg;
    const destBg = buf.bg;
    const chars = buf.char;
    const size = width * height;
    const numChannels = 4;
    const tempBufferFg = new Float32Array(size * numChannels);
    const tempBufferBg = new Float32Array(size * numChannels);
    const windowSize = radius * 2 + 1;
    for (let y = 0;y < height; y++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
      const baseRowIndex = y * width;
      for (let x = -radius;x <= radius; x++) {
        const sampleX = Math.max(0, Math.min(width - 1, x));
        const srcIndex = (baseRowIndex + sampleX) * numChannels;
        sumR += srcFg[srcIndex];
        sumG += srcFg[srcIndex + 1];
        sumB += srcFg[srcIndex + 2];
        sumA += srcFg[srcIndex + 3];
      }
      for (let x = 0;x < width; x++) {
        const destIndex = (baseRowIndex + x) * numChannels;
        tempBufferFg[destIndex] = sumR / windowSize;
        tempBufferFg[destIndex + 1] = sumG / windowSize;
        tempBufferFg[destIndex + 2] = sumB / windowSize;
        tempBufferFg[destIndex + 3] = sumA / windowSize;
        const leavingX = Math.max(0, Math.min(width - 1, x - radius));
        const leavingIndex = (baseRowIndex + leavingX) * numChannels;
        sumR -= srcFg[leavingIndex];
        sumG -= srcFg[leavingIndex + 1];
        sumB -= srcFg[leavingIndex + 2];
        sumA -= srcFg[leavingIndex + 3];
        const enteringX = Math.max(0, Math.min(width - 1, x + radius + 1));
        const enteringIndex = (baseRowIndex + enteringX) * numChannels;
        sumR += srcFg[enteringIndex];
        sumG += srcFg[enteringIndex + 1];
        sumB += srcFg[enteringIndex + 2];
        sumA += srcFg[enteringIndex + 3];
      }
    }
    for (let y = 0;y < height; y++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
      const baseRowIndex = y * width;
      for (let x = -radius;x <= radius; x++) {
        const sampleX = Math.max(0, Math.min(width - 1, x));
        const srcIndex = (baseRowIndex + sampleX) * numChannels;
        sumR += srcBg[srcIndex];
        sumG += srcBg[srcIndex + 1];
        sumB += srcBg[srcIndex + 2];
        sumA += srcBg[srcIndex + 3];
      }
      for (let x = 0;x < width; x++) {
        const destIndex = (baseRowIndex + x) * numChannels;
        tempBufferBg[destIndex] = sumR / windowSize;
        tempBufferBg[destIndex + 1] = sumG / windowSize;
        tempBufferBg[destIndex + 2] = sumB / windowSize;
        tempBufferBg[destIndex + 3] = sumA / windowSize;
        const leavingX = Math.max(0, Math.min(width - 1, x - radius));
        const leavingIndex = (baseRowIndex + leavingX) * numChannels;
        sumR -= srcBg[leavingIndex];
        sumG -= srcBg[leavingIndex + 1];
        sumB -= srcBg[leavingIndex + 2];
        sumA -= srcBg[leavingIndex + 3];
        const enteringX = Math.max(0, Math.min(width - 1, x + radius + 1));
        const enteringIndex = (baseRowIndex + enteringX) * numChannels;
        sumR += srcBg[enteringIndex];
        sumG += srcBg[enteringIndex + 1];
        sumB += srcBg[enteringIndex + 2];
        sumA += srcBg[enteringIndex + 3];
      }
    }
    for (let x = 0;x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
      for (let y = -radius;y <= radius; y++) {
        const sampleY = Math.max(0, Math.min(height - 1, y));
        const srcIndex = (sampleY * width + x) * numChannels;
        sumR += tempBufferFg[srcIndex];
        sumG += tempBufferFg[srcIndex + 1];
        sumB += tempBufferFg[srcIndex + 2];
        sumA += tempBufferFg[srcIndex + 3];
      }
      for (let y = 0;y < height; y++) {
        const destIndex = (y * width + x) * numChannels;
        destFg[destIndex] = sumR / windowSize;
        destFg[destIndex + 1] = sumG / windowSize;
        destFg[destIndex + 2] = sumB / windowSize;
        destFg[destIndex + 3] = sumA / windowSize;
        const leavingY = Math.max(0, Math.min(height - 1, y - radius));
        const leavingIndex = (leavingY * width + x) * numChannels;
        sumR -= tempBufferFg[leavingIndex];
        sumG -= tempBufferFg[leavingIndex + 1];
        sumB -= tempBufferFg[leavingIndex + 2];
        sumA -= tempBufferFg[leavingIndex + 3];
        const enteringY = Math.max(0, Math.min(height - 1, y + radius + 1));
        const enteringIndex = (enteringY * width + x) * numChannels;
        sumR += tempBufferFg[enteringIndex];
        sumG += tempBufferFg[enteringIndex + 1];
        sumB += tempBufferFg[enteringIndex + 2];
        sumA += tempBufferFg[enteringIndex + 3];
      }
    }
    for (let x = 0;x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
      for (let y = -radius;y <= radius; y++) {
        const sampleY = Math.max(0, Math.min(height - 1, y));
        const srcIndex = (sampleY * width + x) * numChannels;
        sumR += tempBufferBg[srcIndex];
        sumG += tempBufferBg[srcIndex + 1];
        sumB += tempBufferBg[srcIndex + 2];
        sumA += tempBufferBg[srcIndex + 3];
      }
      for (let y = 0;y < height; y++) {
        const destIndex = (y * width + x) * numChannels;
        destBg[destIndex] = sumR / windowSize;
        destBg[destIndex + 1] = sumG / windowSize;
        destBg[destIndex + 2] = sumB / windowSize;
        destBg[destIndex + 3] = sumA / windowSize;
        const leavingY = Math.max(0, Math.min(height - 1, y - radius));
        const leavingIndex = (leavingY * width + x) * numChannels;
        sumR -= tempBufferBg[leavingIndex];
        sumG -= tempBufferBg[leavingIndex + 1];
        sumB -= tempBufferBg[leavingIndex + 2];
        sumA -= tempBufferBg[leavingIndex + 3];
        const enteringY = Math.max(0, Math.min(height - 1, y + radius + 1));
        const enteringIndex = (enteringY * width + x) * numChannels;
        sumR += tempBufferBg[enteringIndex];
        sumG += tempBufferBg[enteringIndex + 1];
        sumB += tempBufferBg[enteringIndex + 2];
        sumA += tempBufferBg[enteringIndex + 3];
      }
    }
    const charRamp = [" ", "\u2591", "\u2592", "\u2593", " "];
    const rampLength = charRamp.length;
    for (let i = 0;i < size; i++) {
      const alphaIndex = i * numChannels + 3;
      const fgAlpha = destFg[alphaIndex];
      const clampedAlpha = Math.max(0, Math.min(1, fgAlpha));
      const rampIndex = Math.min(rampLength - 1, Math.floor(clampedAlpha * rampLength));
      chars[i] = charRamp[rampIndex].charCodeAt(0);
    }
  }
}

class BloomEffect {
  _threshold;
  _strength;
  _radius;
  constructor(threshold = 0.8, strength = 0.2, radius = 2) {
    this._threshold = Math.max(0, Math.min(1, threshold));
    this._strength = Math.max(0, strength);
    this._radius = Math.max(0, Math.round(radius));
  }
  set threshold(newThreshold) {
    this._threshold = Math.max(0, Math.min(1, newThreshold));
  }
  get threshold() {
    return this._threshold;
  }
  set strength(newStrength) {
    this._strength = Math.max(0, newStrength);
  }
  get strength() {
    return this._strength;
  }
  set radius(newRadius) {
    this._radius = Math.max(0, Math.round(newRadius));
  }
  get radius() {
    return this._radius;
  }
  apply(buffer) {
    const threshold = this._threshold;
    const strength = this._strength;
    const radius = this._radius;
    if (strength <= 0 || radius <= 0)
      return;
    const width = buffer.width;
    const height = buffer.height;
    const srcFg = Float32Array.from(buffer.buffers.fg);
    const srcBg = Float32Array.from(buffer.buffers.bg);
    const destFg = buffer.buffers.fg;
    const destBg = buffer.buffers.bg;
    const brightPixels = [];
    for (let y = 0;y < height; y++) {
      for (let x = 0;x < width; x++) {
        const index = (y * width + x) * 4;
        const fgLum = 0.299 * srcFg[index] + 0.587 * srcFg[index + 1] + 0.114 * srcFg[index + 2];
        const bgLum = 0.299 * srcBg[index] + 0.587 * srcBg[index + 1] + 0.114 * srcBg[index + 2];
        const lum = Math.max(fgLum, bgLum);
        if (lum > threshold) {
          const intensity = (lum - threshold) / (1 - threshold + 0.000001);
          brightPixels.push({ x, y, intensity: Math.max(0, intensity) });
        }
      }
    }
    if (brightPixels.length === 0)
      return;
    destFg.set(srcFg);
    destBg.set(srcBg);
    for (const bright of brightPixels) {
      for (let ky = -radius;ky <= radius; ky++) {
        for (let kx = -radius;kx <= radius; kx++) {
          if (kx === 0 && ky === 0)
            continue;
          const sampleX = bright.x + kx;
          const sampleY = bright.y + ky;
          if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
            const distSq = kx * kx + ky * ky;
            const radiusSq = radius * radius;
            if (distSq <= radiusSq) {
              const falloff = 1 - distSq / radiusSq;
              const bloomAmount = bright.intensity * strength * falloff;
              const destIndex = (sampleY * width + sampleX) * 4;
              destFg[destIndex] = Math.min(1, destFg[destIndex] + bloomAmount);
              destFg[destIndex + 1] = Math.min(1, destFg[destIndex + 1] + bloomAmount);
              destFg[destIndex + 2] = Math.min(1, destFg[destIndex + 2] + bloomAmount);
              destBg[destIndex] = Math.min(1, destBg[destIndex] + bloomAmount);
              destBg[destIndex + 1] = Math.min(1, destBg[destIndex + 1] + bloomAmount);
              destBg[destIndex + 2] = Math.min(1, destBg[destIndex + 2] + bloomAmount);
            }
          }
        }
      }
    }
  }
}
// src/animation/Timeline.ts
var easingFunctions = {
  linear: (t2) => t2,
  inQuad: (t2) => t2 * t2,
  outQuad: (t2) => t2 * (2 - t2),
  inOutQuad: (t2) => t2 < 0.5 ? 2 * t2 * t2 : -1 + (4 - 2 * t2) * t2,
  inExpo: (t2) => t2 === 0 ? 0 : Math.pow(2, 10 * (t2 - 1)),
  outExpo: (t2) => t2 === 1 ? 1 : 1 - Math.pow(2, -10 * t2),
  inOutSine: (t2) => -(Math.cos(Math.PI * t2) - 1) / 2,
  outBounce: (t2) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t2 < 1 / d1) {
      return n1 * t2 * t2;
    } else if (t2 < 2 / d1) {
      return n1 * (t2 -= 1.5 / d1) * t2 + 0.75;
    } else if (t2 < 2.5 / d1) {
      return n1 * (t2 -= 2.25 / d1) * t2 + 0.9375;
    } else {
      return n1 * (t2 -= 2.625 / d1) * t2 + 0.984375;
    }
  },
  outElastic: (t2) => {
    const c4 = 2 * Math.PI / 3;
    return t2 === 0 ? 0 : t2 === 1 ? 1 : Math.pow(2, -10 * t2) * Math.sin((t2 * 10 - 0.75) * c4) + 1;
  },
  inBounce: (t2) => 1 - easingFunctions.outBounce(1 - t2),
  inCirc: (t2) => 1 - Math.sqrt(1 - t2 * t2),
  outCirc: (t2) => Math.sqrt(1 - Math.pow(t2 - 1, 2)),
  inOutCirc: (t2) => {
    if ((t2 *= 2) < 1)
      return -0.5 * (Math.sqrt(1 - t2 * t2) - 1);
    return 0.5 * (Math.sqrt(1 - (t2 -= 2) * t2) + 1);
  },
  inBack: (t2, s = 1.70158) => t2 * t2 * ((s + 1) * t2 - s),
  outBack: (t2, s = 1.70158) => --t2 * t2 * ((s + 1) * t2 + s) + 1,
  inOutBack: (t2, s = 1.70158) => {
    s *= 1.525;
    if ((t2 *= 2) < 1)
      return 0.5 * (t2 * t2 * ((s + 1) * t2 - s));
    return 0.5 * ((t2 -= 2) * t2 * ((s + 1) * t2 + s) + 2);
  }
};
function captureInitialValues(item) {
  if (!item.properties)
    return;
  if (!item.initialValues || item.initialValues.length === 0) {
    const initialValues = [];
    for (let i = 0;i < item.target.length; i++) {
      const target = item.target[i];
      const targetInitialValues = {};
      for (const key of Object.keys(item.properties)) {
        if (typeof target[key] === "number") {
          targetInitialValues[key] = target[key];
        }
      }
      initialValues.push(targetInitialValues);
    }
    item.initialValues = initialValues;
  }
}
function applyAnimationAtProgress(item, progress, reversed, timelineTime, deltaTime = 0) {
  if (!item.properties || !item.initialValues)
    return;
  const easingFn = easingFunctions[item.ease || "linear"] || easingFunctions.linear;
  const easedProgress = easingFn(Math.max(0, Math.min(1, progress)));
  const finalProgress = reversed ? 1 - easedProgress : easedProgress;
  for (let i = 0;i < item.target.length; i++) {
    const target = item.target[i];
    const targetInitialValues = item.initialValues[i];
    if (!targetInitialValues)
      continue;
    for (const [key, endValue] of Object.entries(item.properties)) {
      const startValue = targetInitialValues[key];
      const newValue = startValue + (endValue - startValue) * finalProgress;
      target[key] = newValue;
    }
  }
  if (item.onUpdate) {
    const animation = {
      targets: item.target,
      progress: easedProgress,
      currentTime: timelineTime,
      deltaTime
    };
    item.onUpdate(animation);
  }
}
function evaluateAnimation(item, timelineTime, deltaTime = 0) {
  if (timelineTime < item.startTime) {
    return;
  }
  const animationTime = timelineTime - item.startTime;
  const duration = item.duration || 0;
  if (timelineTime >= item.startTime && !item.started) {
    captureInitialValues(item);
    if (item.onStart) {
      item.onStart();
    }
    item.started = true;
  }
  if (duration === 0) {
    if (!item.completed) {
      applyAnimationAtProgress(item, 1, false, timelineTime, deltaTime);
      if (item.onComplete) {
        item.onComplete();
      }
      item.completed = true;
    }
    return;
  }
  const maxLoops = !item.loop || item.loop === 1 ? 1 : typeof item.loop === "number" ? item.loop : Infinity;
  const loopDelay = item.loopDelay || 0;
  const cycleTime = duration + loopDelay;
  let currentCycle = Math.floor(animationTime / cycleTime);
  let timeInCycle = animationTime % cycleTime;
  if (item.onLoop && item.currentLoop !== undefined && currentCycle > item.currentLoop && currentCycle < maxLoops) {
    item.onLoop();
  }
  item.currentLoop = currentCycle;
  if (item.onComplete && !item.completed && currentCycle === maxLoops - 1 && timeInCycle >= duration) {
    const finalLoopReversed = (item.alternate || false) && currentCycle % 2 === 1;
    applyAnimationAtProgress(item, 1, finalLoopReversed, timelineTime, deltaTime);
    item.onComplete();
    item.completed = true;
    return;
  }
  if (currentCycle >= maxLoops) {
    if (!item.completed) {
      const finalReversed = (item.alternate || false) && (maxLoops - 1) % 2 === 1;
      applyAnimationAtProgress(item, 1, finalReversed, timelineTime, deltaTime);
      if (item.onComplete) {
        item.onComplete();
      }
      item.completed = true;
    }
    return;
  }
  if (timeInCycle === 0 && animationTime > 0 && currentCycle < maxLoops) {
    currentCycle = currentCycle - 1;
    timeInCycle = cycleTime;
  }
  if (timeInCycle >= duration) {
    const isReversed2 = (item.alternate || false) && currentCycle % 2 === 1;
    applyAnimationAtProgress(item, 1, isReversed2, timelineTime, deltaTime);
    return;
  }
  const progress = timeInCycle / duration;
  const isReversed = (item.alternate || false) && currentCycle % 2 === 1;
  applyAnimationAtProgress(item, progress, isReversed, timelineTime, deltaTime);
}
function evaluateCallback(item, timelineTime) {
  if (!item.executed && timelineTime >= item.startTime && item.callback) {
    item.callback();
    item.executed = true;
  }
}
function evaluateTimelineSync(item, timelineTime, deltaTime = 0) {
  if (!item.timeline)
    return;
  if (timelineTime < item.startTime) {
    return;
  }
  if (!item.timelineStarted) {
    item.timelineStarted = true;
    item.timeline.play();
    const overshoot = timelineTime - item.startTime;
    item.timeline.update(overshoot);
    return;
  }
  item.timeline.update(deltaTime);
}
function evaluateItem(item, timelineTime, deltaTime = 0) {
  if (item.type === "animation") {
    evaluateAnimation(item, timelineTime, deltaTime);
  } else if (item.type === "callback") {
    evaluateCallback(item, timelineTime);
  }
}

class Timeline {
  items = [];
  subTimelines = [];
  currentTime = 0;
  isPlaying = false;
  isComplete = false;
  duration;
  loop;
  synced = false;
  autoplay;
  onComplete;
  onPause;
  stateChangeListeners = [];
  constructor(options = {}) {
    this.duration = options.duration || 1000;
    this.loop = options.loop === true;
    this.autoplay = options.autoplay !== false;
    this.onComplete = options.onComplete;
    this.onPause = options.onPause;
  }
  addStateChangeListener(listener) {
    this.stateChangeListeners.push(listener);
  }
  removeStateChangeListener(listener) {
    this.stateChangeListeners = this.stateChangeListeners.filter((l) => l !== listener);
  }
  notifyStateChange() {
    for (const listener of this.stateChangeListeners) {
      listener(this);
    }
  }
  add(target, properties, startTime = 0) {
    const resolvedStartTime = typeof startTime === "string" ? 0 : startTime;
    const animationProperties = {};
    for (const key in properties) {
      if (!["duration", "ease", "onUpdate", "onComplete", "onStart", "onLoop", "loop", "loopDelay", "alternate"].includes(key)) {
        if (typeof properties[key] === "number") {
          animationProperties[key] = properties[key];
        }
      }
    }
    this.items.push({
      type: "animation",
      startTime: resolvedStartTime,
      target: Array.isArray(target) ? target : [target],
      properties: animationProperties,
      initialValues: [],
      duration: properties.duration !== undefined ? properties.duration : 1000,
      ease: properties.ease || "linear",
      loop: properties.loop,
      loopDelay: properties.loopDelay || 0,
      alternate: properties.alternate || false,
      onUpdate: properties.onUpdate,
      onComplete: properties.onComplete,
      onStart: properties.onStart,
      onLoop: properties.onLoop,
      completed: false,
      started: false,
      currentLoop: 0,
      once: properties.once ?? false
    });
    return this;
  }
  once(target, properties) {
    this.add(target, {
      ...properties,
      once: true
    }, this.currentTime);
    return this;
  }
  call(callback, startTime = 0) {
    const resolvedStartTime = typeof startTime === "string" ? 0 : startTime;
    this.items.push({
      type: "callback",
      startTime: resolvedStartTime,
      callback,
      executed: false
    });
    return this;
  }
  sync(timeline, startTime = 0) {
    if (timeline.synced) {
      throw new Error("Timeline already synced");
    }
    this.subTimelines.push({
      type: "timeline",
      startTime,
      timeline
    });
    timeline.synced = true;
    return this;
  }
  play() {
    if (this.isComplete) {
      return this.restart();
    }
    this.subTimelines.forEach((subTimeline) => {
      if (subTimeline.timelineStarted) {
        subTimeline.timeline.play();
      }
    });
    this.isPlaying = true;
    this.notifyStateChange();
    return this;
  }
  pause() {
    this.subTimelines.forEach((subTimeline) => {
      subTimeline.timeline.pause();
    });
    this.isPlaying = false;
    if (this.onPause) {
      this.onPause();
    }
    this.notifyStateChange();
    return this;
  }
  resetItems() {
    this.items.forEach((item) => {
      if (item.type === "callback") {
        item.executed = false;
      } else if (item.type === "animation") {
        item.completed = false;
        item.started = false;
        item.currentLoop = 0;
      }
    });
    this.subTimelines.forEach((subTimeline) => {
      subTimeline.timelineStarted = false;
      if (subTimeline.timeline) {
        subTimeline.timeline.restart();
        subTimeline.timeline.pause();
      }
    });
  }
  restart() {
    this.isComplete = false;
    this.currentTime = 0;
    this.isPlaying = true;
    this.resetItems();
    this.notifyStateChange();
    return this;
  }
  update(deltaTime) {
    for (const subTimeline of this.subTimelines) {
      evaluateTimelineSync(subTimeline, this.currentTime + deltaTime, deltaTime);
    }
    if (!this.isPlaying)
      return;
    this.currentTime += deltaTime;
    for (const item of this.items) {
      evaluateItem(item, this.currentTime, deltaTime);
    }
    for (let i = this.items.length - 1;i >= 0; i--) {
      const item = this.items[i];
      if (item.type === "animation" && item.once && item.completed) {
        this.items.splice(i, 1);
      }
    }
    if (this.loop && this.currentTime >= this.duration) {
      const overshoot = this.currentTime % this.duration;
      this.resetItems();
      this.currentTime = 0;
      if (overshoot > 0) {
        this.update(overshoot);
      }
    } else if (!this.loop && this.currentTime >= this.duration) {
      this.currentTime = this.duration;
      this.isPlaying = false;
      this.isComplete = true;
      if (this.onComplete) {
        this.onComplete();
      }
      this.notifyStateChange();
    }
  }
}

class TimelineEngine {
  timelines = new Set;
  renderer = null;
  frameCallback = null;
  isLive = false;
  defaults = {
    frameRate: 60
  };
  attach(renderer) {
    if (this.renderer) {
      this.detach();
    }
    this.renderer = renderer;
    this.frameCallback = async (deltaTime) => {
      this.update(deltaTime);
    };
    renderer.setFrameCallback(this.frameCallback);
  }
  detach() {
    if (this.renderer && this.frameCallback) {
      this.renderer.removeFrameCallback(this.frameCallback);
      if (this.isLive) {
        this.renderer.dropLive();
        this.isLive = false;
      }
    }
    this.renderer = null;
    this.frameCallback = null;
  }
  updateLiveState() {
    if (!this.renderer)
      return;
    const hasRunningTimelines = Array.from(this.timelines).some((timeline) => !timeline.synced && timeline.isPlaying && !timeline.isComplete);
    if (hasRunningTimelines && !this.isLive) {
      this.renderer.requestLive();
      this.isLive = true;
    } else if (!hasRunningTimelines && this.isLive) {
      this.renderer.dropLive();
      this.isLive = false;
    }
  }
  onTimelineStateChange = (timeline) => {
    this.updateLiveState();
  };
  register(timeline) {
    if (!this.timelines.has(timeline)) {
      this.timelines.add(timeline);
      timeline.addStateChangeListener(this.onTimelineStateChange);
      this.updateLiveState();
    }
  }
  unregister(timeline) {
    if (this.timelines.has(timeline)) {
      this.timelines.delete(timeline);
      timeline.removeStateChangeListener(this.onTimelineStateChange);
      this.updateLiveState();
    }
  }
  clear() {
    for (const timeline of this.timelines) {
      timeline.removeStateChangeListener(this.onTimelineStateChange);
    }
    this.timelines.clear();
    this.updateLiveState();
  }
  update(deltaTime) {
    for (const timeline of this.timelines) {
      if (!timeline.synced) {
        timeline.update(deltaTime);
      }
    }
  }
}
var engine = new TimelineEngine;
function createTimeline(options = {}) {
  const timeline = new Timeline(options);
  if (options.autoplay !== false) {
    timeline.play();
  }
  engine.register(timeline);
  return timeline;
}
// src/renderables/FrameBuffer.ts
class FrameBufferRenderable extends Renderable {
  frameBuffer;
  respectAlpha;
  constructor(ctx, options) {
    super(ctx, options);
    this.respectAlpha = options.respectAlpha || false;
    this.frameBuffer = OptimizedBuffer.create(options.width, options.height, this._ctx.widthMethod, {
      respectAlpha: this.respectAlpha,
      id: options.id || `framebufferrenderable-${this.id}`
    });
  }
  onResize(width, height) {
    if (width <= 0 || height <= 0) {
      throw new Error(`Invalid resize dimensions for FrameBufferRenderable ${this.id}: ${width}x${height}`);
    }
    this.frameBuffer.resize(width, height);
    super.onResize(width, height);
    this.requestRender();
  }
  renderSelf(buffer) {
    if (!this.visible || this.isDestroyed)
      return;
    buffer.drawFrameBuffer(this.x, this.y, this.frameBuffer);
  }
  destroySelf() {
    this.frameBuffer?.destroy();
    super.destroySelf();
  }
}

// src/renderables/ASCIIFont.ts
class ASCIIFontRenderable extends FrameBufferRenderable {
  selectable = true;
  static _defaultOptions = {
    text: "",
    font: "tiny",
    color: "#FFFFFF",
    backgroundColor: "transparent",
    selectionBg: undefined,
    selectionFg: undefined,
    selectable: true
  };
  _text;
  _font;
  _color;
  _backgroundColor;
  _selectionBg;
  _selectionFg;
  lastLocalSelection = null;
  selectionHelper;
  constructor(ctx, options) {
    const defaultOptions = ASCIIFontRenderable._defaultOptions;
    const font = options.font || defaultOptions.font;
    const text = options.text || defaultOptions.text;
    const measurements = measureText({ text, font });
    super(ctx, {
      flexShrink: 0,
      ...options,
      width: measurements.width || 1,
      height: measurements.height || 1,
      respectAlpha: true
    });
    this._text = text;
    this._font = font;
    this._color = options.color || defaultOptions.color;
    this._backgroundColor = options.backgroundColor || defaultOptions.backgroundColor;
    this._selectionBg = options.selectionBg ? parseColor(options.selectionBg) : undefined;
    this._selectionFg = options.selectionFg ? parseColor(options.selectionFg) : undefined;
    this.selectable = options.selectable ?? true;
    this.selectionHelper = new ASCIIFontSelectionHelper(() => this._text, () => this._font);
    this.renderFontToBuffer();
  }
  get text() {
    return this._text;
  }
  set text(value) {
    this._text = value;
    this.updateDimensions();
    if (this.lastLocalSelection) {
      this.selectionHelper.onLocalSelectionChanged(this.lastLocalSelection, this.width, this.height);
    }
    this.renderFontToBuffer();
    this.requestRender();
  }
  get font() {
    return this._font;
  }
  set font(value) {
    this._font = value;
    this.updateDimensions();
    if (this.lastLocalSelection) {
      this.selectionHelper.onLocalSelectionChanged(this.lastLocalSelection, this.width, this.height);
    }
    this.renderFontToBuffer();
    this.requestRender();
  }
  get color() {
    return this._color;
  }
  set color(value) {
    this._color = value;
    this.renderFontToBuffer();
    this.requestRender();
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(value) {
    this._backgroundColor = value;
    this.renderFontToBuffer();
    this.requestRender();
  }
  updateDimensions() {
    const measurements = measureText({ text: this._text, font: this._font });
    this.width = measurements.width;
    this.height = measurements.height;
  }
  shouldStartSelection(x, y) {
    const localX = x - this.x;
    const localY = y - this.y;
    return this.selectionHelper.shouldStartSelection(localX, localY, this.width, this.height);
  }
  onSelectionChanged(selection) {
    const localSelection = convertGlobalToLocalSelection(selection, this.x, this.y);
    this.lastLocalSelection = localSelection;
    const changed = this.selectionHelper.onLocalSelectionChanged(localSelection, this.width, this.height);
    if (changed) {
      this.renderFontToBuffer();
      this.requestRender();
    }
    return changed;
  }
  getSelectedText() {
    const selection = this.selectionHelper.getSelection();
    if (!selection)
      return "";
    return this._text.slice(selection.start, selection.end);
  }
  hasSelection() {
    return this.selectionHelper.hasSelection();
  }
  onResize(width, height) {
    super.onResize(width, height);
    this.renderFontToBuffer();
  }
  renderFontToBuffer() {
    if (this.isDestroyed)
      return;
    this.frameBuffer.clear(parseColor(this._backgroundColor));
    renderFontToFrameBuffer(this.frameBuffer, {
      text: this._text,
      x: 0,
      y: 0,
      color: this.color,
      backgroundColor: this._backgroundColor,
      font: this._font
    });
    const selection = this.selectionHelper.getSelection();
    if (selection && (this._selectionBg || this._selectionFg)) {
      this.renderSelectionHighlight(selection);
    }
  }
  renderSelectionHighlight(selection) {
    if (!this._selectionBg && !this._selectionFg)
      return;
    const selectedText = this._text.slice(selection.start, selection.end);
    if (!selectedText)
      return;
    const positions = getCharacterPositions(this._text, this._font);
    const startX = positions[selection.start] || 0;
    const endX = selection.end < positions.length ? positions[selection.end] : measureText({ text: this._text, font: this._font }).width;
    if (this._selectionBg) {
      this.frameBuffer.fillRect(startX, 0, endX - startX, this.height, parseColor(this._selectionBg));
    }
    if (this._selectionFg || this._selectionBg) {
      renderFontToFrameBuffer(this.frameBuffer, {
        text: selectedText,
        x: startX,
        y: 0,
        color: this._selectionFg ? this._selectionFg : this._color,
        backgroundColor: this._selectionBg ? this._selectionBg : this._backgroundColor,
        font: this._font
      });
    }
  }
}
// src/renderables/Box.ts
function isGapType(value) {
  if (value === undefined) {
    return true;
  }
  if (typeof value === "number" && !Number.isNaN(value)) {
    return true;
  }
  return isValidPercentage(value);
}

class BoxRenderable extends Renderable {
  _backgroundColor;
  _border;
  _borderStyle;
  _borderColor;
  _focusedBorderColor;
  _customBorderCharsObj;
  _customBorderChars;
  borderSides;
  shouldFill;
  _title;
  _titleAlignment;
  _defaultOptions = {
    backgroundColor: "transparent",
    borderStyle: "single",
    border: false,
    borderColor: "#FFFFFF",
    shouldFill: true,
    titleAlignment: "left",
    focusedBorderColor: "#00AAFF"
  };
  constructor(ctx, options) {
    super(ctx, options);
    this._backgroundColor = parseColor(options.backgroundColor || this._defaultOptions.backgroundColor);
    this._border = options.border ?? this._defaultOptions.border;
    if (!options.border && (options.borderStyle || options.borderColor || options.focusedBorderColor || options.customBorderChars)) {
      this._border = true;
    }
    this._borderStyle = parseBorderStyle(options.borderStyle, this._defaultOptions.borderStyle);
    this._borderColor = parseColor(options.borderColor || this._defaultOptions.borderColor);
    this._focusedBorderColor = parseColor(options.focusedBorderColor || this._defaultOptions.focusedBorderColor);
    this._customBorderCharsObj = options.customBorderChars;
    this._customBorderChars = this._customBorderCharsObj ? borderCharsToArray(this._customBorderCharsObj) : undefined;
    this.borderSides = getBorderSides(this._border);
    this.shouldFill = options.shouldFill ?? this._defaultOptions.shouldFill;
    this._title = options.title;
    this._titleAlignment = options.titleAlignment || this._defaultOptions.titleAlignment;
    this.applyYogaBorders();
    const hasInitialGapProps = options.gap !== undefined || options.rowGap !== undefined || options.columnGap !== undefined;
    if (hasInitialGapProps) {
      this.applyYogaGap(options);
    }
  }
  initializeBorder() {
    if (this._border === false) {
      this._border = true;
      this.borderSides = getBorderSides(this._border);
      this.applyYogaBorders();
    }
  }
  get customBorderChars() {
    return this._customBorderCharsObj;
  }
  set customBorderChars(value) {
    this._customBorderCharsObj = value;
    this._customBorderChars = value ? borderCharsToArray(value) : undefined;
    this.requestRender();
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.backgroundColor);
    if (this._backgroundColor !== newColor) {
      this._backgroundColor = newColor;
      this.requestRender();
    }
  }
  get border() {
    return this._border;
  }
  set border(value) {
    if (this._border !== value) {
      this._border = value;
      this.borderSides = getBorderSides(value);
      this.applyYogaBorders();
      this.requestRender();
    }
  }
  get borderStyle() {
    return this._borderStyle;
  }
  set borderStyle(value) {
    const _value = parseBorderStyle(value, this._defaultOptions.borderStyle);
    if (this._borderStyle !== _value || !this._border) {
      this._borderStyle = _value;
      this._customBorderChars = undefined;
      this.initializeBorder();
      this.requestRender();
    }
  }
  get borderColor() {
    return this._borderColor;
  }
  set borderColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.borderColor);
    if (this._borderColor !== newColor) {
      this._borderColor = newColor;
      this.initializeBorder();
      this.requestRender();
    }
  }
  get focusedBorderColor() {
    return this._focusedBorderColor;
  }
  set focusedBorderColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.focusedBorderColor);
    if (this._focusedBorderColor !== newColor) {
      this._focusedBorderColor = newColor;
      this.initializeBorder();
      if (this._focused) {
        this.requestRender();
      }
    }
  }
  get title() {
    return this._title;
  }
  set title(value) {
    if (this._title !== value) {
      this._title = value;
      this.requestRender();
    }
  }
  get titleAlignment() {
    return this._titleAlignment;
  }
  set titleAlignment(value) {
    if (this._titleAlignment !== value) {
      this._titleAlignment = value;
      this.requestRender();
    }
  }
  renderSelf(buffer) {
    const currentBorderColor = this._focused ? this._focusedBorderColor : this._borderColor;
    buffer.drawBox({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      borderStyle: this._borderStyle,
      customBorderChars: this._customBorderChars,
      border: this._border,
      borderColor: currentBorderColor,
      backgroundColor: this._backgroundColor,
      shouldFill: this.shouldFill,
      title: this._title,
      titleAlignment: this._titleAlignment
    });
  }
  getScissorRect() {
    const baseRect = super.getScissorRect();
    if (!this.borderSides.top && !this.borderSides.right && !this.borderSides.bottom && !this.borderSides.left) {
      return baseRect;
    }
    const leftInset = this.borderSides.left ? 1 : 0;
    const rightInset = this.borderSides.right ? 1 : 0;
    const topInset = this.borderSides.top ? 1 : 0;
    const bottomInset = this.borderSides.bottom ? 1 : 0;
    return {
      x: baseRect.x + leftInset,
      y: baseRect.y + topInset,
      width: Math.max(0, baseRect.width - leftInset - rightInset),
      height: Math.max(0, baseRect.height - topInset - bottomInset)
    };
  }
  applyYogaBorders() {
    const node = this.yogaNode;
    node.setBorder(Edge.Left, this.borderSides.left ? 1 : 0);
    node.setBorder(Edge.Right, this.borderSides.right ? 1 : 0);
    node.setBorder(Edge.Top, this.borderSides.top ? 1 : 0);
    node.setBorder(Edge.Bottom, this.borderSides.bottom ? 1 : 0);
    this.requestRender();
  }
  applyYogaGap(options) {
    const node = this.yogaNode;
    if (isGapType(options.gap)) {
      node.setGap(Gutter.All, options.gap);
    }
    if (isGapType(options.rowGap)) {
      node.setGap(Gutter.Row, options.rowGap);
    }
    if (isGapType(options.columnGap)) {
      node.setGap(Gutter.Column, options.columnGap);
    }
  }
  set gap(gap) {
    if (isGapType(gap)) {
      this.yogaNode.setGap(Gutter.All, gap);
      this.requestRender();
    }
  }
  set rowGap(rowGap) {
    if (isGapType(rowGap)) {
      this.yogaNode.setGap(Gutter.Row, rowGap);
      this.requestRender();
    }
  }
  set columnGap(columnGap) {
    if (isGapType(columnGap)) {
      this.yogaNode.setGap(Gutter.Column, columnGap);
      this.requestRender();
    }
  }
}
// src/renderables/TextBufferRenderable.ts
class TextBufferRenderable extends Renderable {
  selectable = true;
  _defaultFg;
  _defaultBg;
  _defaultAttributes;
  _selectionBg;
  _selectionFg;
  _wrapMode = "word";
  lastLocalSelection = null;
  _tabIndicator;
  _tabIndicatorColor;
  _scrollX = 0;
  _scrollY = 0;
  _truncate = false;
  textBuffer;
  textBufferView;
  _defaultOptions = {
    fg: RGBA.fromValues(1, 1, 1, 1),
    bg: RGBA.fromValues(0, 0, 0, 0),
    selectionBg: undefined,
    selectionFg: undefined,
    selectable: true,
    attributes: 0,
    wrapMode: "word",
    tabIndicator: undefined,
    tabIndicatorColor: undefined,
    truncate: false
  };
  constructor(ctx, options) {
    super(ctx, options);
    this._defaultFg = parseColor(options.fg ?? this._defaultOptions.fg);
    this._defaultBg = parseColor(options.bg ?? this._defaultOptions.bg);
    this._defaultAttributes = options.attributes ?? this._defaultOptions.attributes;
    this._selectionBg = options.selectionBg ? parseColor(options.selectionBg) : this._defaultOptions.selectionBg;
    this._selectionFg = options.selectionFg ? parseColor(options.selectionFg) : this._defaultOptions.selectionFg;
    this.selectable = options.selectable ?? this._defaultOptions.selectable;
    this._wrapMode = options.wrapMode ?? this._defaultOptions.wrapMode;
    this._tabIndicator = options.tabIndicator ?? this._defaultOptions.tabIndicator;
    this._tabIndicatorColor = options.tabIndicatorColor ? parseColor(options.tabIndicatorColor) : this._defaultOptions.tabIndicatorColor;
    this._truncate = options.truncate ?? this._defaultOptions.truncate;
    this.textBuffer = TextBuffer.create(this._ctx.widthMethod);
    this.textBufferView = TextBufferView.create(this.textBuffer);
    const style = SyntaxStyle.create();
    this.textBuffer.setSyntaxStyle(style);
    this.textBufferView.setWrapMode(this._wrapMode);
    this.setupMeasureFunc();
    this.textBuffer.setDefaultFg(this._defaultFg);
    this.textBuffer.setDefaultBg(this._defaultBg);
    this.textBuffer.setDefaultAttributes(this._defaultAttributes);
    if (this._tabIndicator !== undefined) {
      this.textBufferView.setTabIndicator(this._tabIndicator);
    }
    if (this._tabIndicatorColor !== undefined) {
      this.textBufferView.setTabIndicatorColor(this._tabIndicatorColor);
    }
    if (this._wrapMode !== "none" && this.width > 0) {
      this.textBufferView.setWrapWidth(this.width);
    }
    if (this.width > 0 && this.height > 0) {
      this.textBufferView.setViewport(this._scrollX, this._scrollY, this.width, this.height);
    }
    this.textBufferView.setTruncate(this._truncate);
    this.updateTextInfo();
  }
  onMouseEvent(event) {
    if (event.type === "scroll") {
      this.handleScroll(event);
    }
  }
  handleScroll(event) {
    if (!event.scroll)
      return;
    const { direction, delta } = event.scroll;
    if (direction === "up") {
      this.scrollY -= delta;
    } else if (direction === "down") {
      this.scrollY += delta;
    }
    if (this._wrapMode === "none") {
      if (direction === "left") {
        this.scrollX -= delta;
      } else if (direction === "right") {
        this.scrollX += delta;
      }
    }
  }
  get lineInfo() {
    return this.textBufferView.logicalLineInfo;
  }
  get lineCount() {
    return this.textBuffer.getLineCount();
  }
  get virtualLineCount() {
    return this.textBufferView.getVirtualLineCount();
  }
  get scrollY() {
    return this._scrollY;
  }
  set scrollY(value) {
    const maxScrollY = Math.max(0, this.scrollHeight - this.height);
    const clamped = Math.max(0, Math.min(value, maxScrollY));
    if (this._scrollY !== clamped) {
      this._scrollY = clamped;
      this.updateViewportOffset();
      this.requestRender();
    }
  }
  get scrollX() {
    return this._scrollX;
  }
  set scrollX(value) {
    const maxScrollX = Math.max(0, this.scrollWidth - this.width);
    const clamped = Math.max(0, Math.min(value, maxScrollX));
    if (this._scrollX !== clamped) {
      this._scrollX = clamped;
      this.updateViewportOffset();
      this.requestRender();
    }
  }
  get scrollWidth() {
    return this.lineInfo.maxLineWidth;
  }
  get scrollHeight() {
    return this.lineInfo.lineStarts.length;
  }
  get maxScrollY() {
    return Math.max(0, this.scrollHeight - this.height);
  }
  get maxScrollX() {
    return Math.max(0, this.scrollWidth - this.width);
  }
  updateViewportOffset() {
    if (this.width > 0 && this.height > 0) {
      this.textBufferView.setViewport(this._scrollX, this._scrollY, this.width, this.height);
    }
  }
  get plainText() {
    return this.textBuffer.getPlainText();
  }
  get textLength() {
    return this.textBuffer.length;
  }
  get fg() {
    return this._defaultFg;
  }
  set fg(value) {
    const newColor = parseColor(value ?? this._defaultOptions.fg);
    if (this._defaultFg !== newColor) {
      this._defaultFg = newColor;
      this.textBuffer.setDefaultFg(this._defaultFg);
      this.onFgChanged(newColor);
      this.requestRender();
    }
  }
  get selectionBg() {
    return this._selectionBg;
  }
  set selectionBg(value) {
    const newColor = value ? parseColor(value) : this._defaultOptions.selectionBg;
    if (this._selectionBg !== newColor) {
      this._selectionBg = newColor;
      if (this.lastLocalSelection) {
        this.updateLocalSelection(this.lastLocalSelection);
      }
      this.requestRender();
    }
  }
  get selectionFg() {
    return this._selectionFg;
  }
  set selectionFg(value) {
    const newColor = value ? parseColor(value) : this._defaultOptions.selectionFg;
    if (this._selectionFg !== newColor) {
      this._selectionFg = newColor;
      if (this.lastLocalSelection) {
        this.updateLocalSelection(this.lastLocalSelection);
      }
      this.requestRender();
    }
  }
  get bg() {
    return this._defaultBg;
  }
  set bg(value) {
    const newColor = parseColor(value ?? this._defaultOptions.bg);
    if (this._defaultBg !== newColor) {
      this._defaultBg = newColor;
      this.textBuffer.setDefaultBg(this._defaultBg);
      this.onBgChanged(newColor);
      this.requestRender();
    }
  }
  get attributes() {
    return this._defaultAttributes;
  }
  set attributes(value) {
    if (this._defaultAttributes !== value) {
      this._defaultAttributes = value;
      this.textBuffer.setDefaultAttributes(this._defaultAttributes);
      this.onAttributesChanged(value);
      this.requestRender();
    }
  }
  get wrapMode() {
    return this._wrapMode;
  }
  set wrapMode(value) {
    if (this._wrapMode !== value) {
      this._wrapMode = value;
      this.textBufferView.setWrapMode(this._wrapMode);
      if (value !== "none" && this.width > 0) {
        this.textBufferView.setWrapWidth(this.width);
      }
      this.yogaNode.markDirty();
      this.requestRender();
    }
  }
  get tabIndicator() {
    return this._tabIndicator;
  }
  set tabIndicator(value) {
    if (this._tabIndicator !== value) {
      this._tabIndicator = value;
      if (value !== undefined) {
        this.textBufferView.setTabIndicator(value);
      }
      this.requestRender();
    }
  }
  get tabIndicatorColor() {
    return this._tabIndicatorColor;
  }
  set tabIndicatorColor(value) {
    const newColor = value ? parseColor(value) : undefined;
    if (this._tabIndicatorColor !== newColor) {
      this._tabIndicatorColor = newColor;
      if (newColor !== undefined) {
        this.textBufferView.setTabIndicatorColor(newColor);
      }
      this.requestRender();
    }
  }
  get truncate() {
    return this._truncate;
  }
  set truncate(value) {
    if (this._truncate !== value) {
      this._truncate = value;
      this.textBufferView.setTruncate(value);
      this.requestRender();
    }
  }
  onResize(width, height) {
    this.textBufferView.setViewport(this._scrollX, this._scrollY, width, height);
    this.yogaNode.markDirty();
    this.requestRender();
    this.emit("line-info-change");
  }
  refreshLocalSelection() {
    if (this.lastLocalSelection) {
      return this.updateLocalSelection(this.lastLocalSelection);
    }
    return false;
  }
  updateLocalSelection(localSelection) {
    if (!localSelection?.isActive) {
      this.textBufferView.resetLocalSelection();
      return true;
    }
    return this.textBufferView.setLocalSelection(localSelection.anchorX, localSelection.anchorY, localSelection.focusX, localSelection.focusY, this._selectionBg, this._selectionFg);
  }
  updateTextInfo() {
    if (this.lastLocalSelection) {
      this.updateLocalSelection(this.lastLocalSelection);
    }
    this.yogaNode.markDirty();
    this.requestRender();
    this.emit("line-info-change");
  }
  setupMeasureFunc() {
    const measureFunc = (width, widthMode, height, heightMode) => {
      let effectiveWidth;
      if (widthMode === MeasureMode.Undefined || isNaN(width)) {
        effectiveWidth = 0;
      } else {
        effectiveWidth = width;
      }
      const effectiveHeight = isNaN(height) ? 1 : height;
      const measureResult = this.textBufferView.measureForDimensions(Math.floor(effectiveWidth), Math.floor(effectiveHeight));
      const measuredWidth = measureResult ? Math.max(1, measureResult.maxWidth) : 1;
      const measuredHeight = measureResult ? Math.max(1, measureResult.lineCount) : 1;
      if (widthMode === MeasureMode.AtMost && this._positionType !== "absolute") {
        return {
          width: Math.min(effectiveWidth, measuredWidth),
          height: Math.min(effectiveHeight, measuredHeight)
        };
      }
      return {
        width: measuredWidth,
        height: measuredHeight
      };
    };
    this.yogaNode.setMeasureFunc(measureFunc);
  }
  shouldStartSelection(x, y) {
    if (!this.selectable)
      return false;
    const localX = x - this.x;
    const localY = y - this.y;
    return localX >= 0 && localX < this.width && localY >= 0 && localY < this.height;
  }
  onSelectionChanged(selection) {
    const localSelection = convertGlobalToLocalSelection(selection, this.x, this.y);
    this.lastLocalSelection = localSelection;
    let changed;
    if (!localSelection?.isActive) {
      this.textBufferView.resetLocalSelection();
      changed = true;
    } else if (selection?.isStart) {
      changed = this.textBufferView.setLocalSelection(localSelection.anchorX, localSelection.anchorY, localSelection.focusX, localSelection.focusY, this._selectionBg, this._selectionFg);
    } else {
      changed = this.textBufferView.updateLocalSelection(localSelection.anchorX, localSelection.anchorY, localSelection.focusX, localSelection.focusY, this._selectionBg, this._selectionFg);
    }
    if (changed) {
      this.requestRender();
    }
    return this.hasSelection();
  }
  getSelectedText() {
    return this.textBufferView.getSelectedText();
  }
  hasSelection() {
    return this.textBufferView.hasSelection();
  }
  getSelection() {
    return this.textBufferView.getSelection();
  }
  render(buffer, deltaTime) {
    if (!this.visible)
      return;
    this.markClean();
    this._ctx.addToHitGrid(this.x, this.y, this.width, this.height, this.num);
    this.renderSelf(buffer);
    if (this.buffered && this.frameBuffer) {
      buffer.drawFrameBuffer(this.x, this.y, this.frameBuffer);
    }
  }
  renderSelf(buffer) {
    if (this.textBuffer.ptr) {
      buffer.drawTextBuffer(this.textBufferView, this.x, this.y);
    }
  }
  destroy() {
    this.textBufferView.destroy();
    this.textBuffer.destroy();
    super.destroy();
  }
  onFgChanged(newColor) {}
  onBgChanged(newColor) {}
  onAttributesChanged(newAttributes) {}
}

// src/renderables/Code.ts
class CodeRenderable extends TextBufferRenderable {
  _content;
  _filetype;
  _syntaxStyle;
  _isHighlighting = false;
  _treeSitterClient;
  _highlightsDirty = false;
  _highlightSnapshotId = 0;
  _conceal;
  _drawUnstyledText;
  _shouldRenderTextBuffer = true;
  _streaming;
  _hadInitialContent = false;
  _lastHighlights = [];
  _onHighlight;
  _contentDefaultOptions = {
    content: "",
    conceal: true,
    drawUnstyledText: true,
    streaming: false
  };
  constructor(ctx, options) {
    super(ctx, options);
    this._content = options.content ?? this._contentDefaultOptions.content;
    this._filetype = options.filetype;
    this._syntaxStyle = options.syntaxStyle;
    this._treeSitterClient = options.treeSitterClient ?? getTreeSitterClient();
    this._conceal = options.conceal ?? this._contentDefaultOptions.conceal;
    this._drawUnstyledText = options.drawUnstyledText ?? this._contentDefaultOptions.drawUnstyledText;
    this._streaming = options.streaming ?? this._contentDefaultOptions.streaming;
    this._onHighlight = options.onHighlight;
    if (this._content.length > 0) {
      this.textBuffer.setText(this._content);
      this.updateTextInfo();
      this._shouldRenderTextBuffer = this._drawUnstyledText || !this._filetype;
    }
    this._highlightsDirty = this._content.length > 0;
  }
  get content() {
    return this._content;
  }
  set content(value) {
    if (this._content !== value) {
      this._content = value;
      this._highlightsDirty = true;
      this._highlightSnapshotId++;
      if (this._streaming && !this._drawUnstyledText && this._filetype) {
        return;
      }
      this.textBuffer.setText(value);
      this.updateTextInfo();
    }
  }
  get filetype() {
    return this._filetype;
  }
  set filetype(value) {
    if (this._filetype !== value) {
      this._filetype = value;
      this._highlightsDirty = true;
    }
  }
  get syntaxStyle() {
    return this._syntaxStyle;
  }
  set syntaxStyle(value) {
    if (this._syntaxStyle !== value) {
      this._syntaxStyle = value;
      this._highlightsDirty = true;
    }
  }
  get conceal() {
    return this._conceal;
  }
  set conceal(value) {
    if (this._conceal !== value) {
      this._conceal = value;
      this._highlightsDirty = true;
    }
  }
  get drawUnstyledText() {
    return this._drawUnstyledText;
  }
  set drawUnstyledText(value) {
    if (this._drawUnstyledText !== value) {
      this._drawUnstyledText = value;
      this._highlightsDirty = true;
    }
  }
  get streaming() {
    return this._streaming;
  }
  set streaming(value) {
    if (this._streaming !== value) {
      this._streaming = value;
      this._hadInitialContent = false;
      this._lastHighlights = [];
      this._highlightsDirty = true;
    }
  }
  get treeSitterClient() {
    return this._treeSitterClient;
  }
  set treeSitterClient(value) {
    if (this._treeSitterClient !== value) {
      this._treeSitterClient = value;
      this._highlightsDirty = true;
    }
  }
  get onHighlight() {
    return this._onHighlight;
  }
  set onHighlight(value) {
    if (this._onHighlight !== value) {
      this._onHighlight = value;
      this._highlightsDirty = true;
    }
  }
  get isHighlighting() {
    return this._isHighlighting;
  }
  ensureVisibleTextBeforeHighlight() {
    if (this.isDestroyed)
      return;
    const content = this._content;
    if (!this._filetype) {
      this._shouldRenderTextBuffer = true;
      return;
    }
    const isInitialContent = this._streaming && !this._hadInitialContent;
    const shouldDrawUnstyledNow = this._streaming ? isInitialContent && this._drawUnstyledText : this._drawUnstyledText;
    if (this._streaming && !isInitialContent) {
      this._shouldRenderTextBuffer = true;
    } else if (shouldDrawUnstyledNow) {
      this.textBuffer.setText(content);
      this._shouldRenderTextBuffer = true;
    } else {
      this._shouldRenderTextBuffer = false;
    }
  }
  async startHighlight() {
    const content = this._content;
    const filetype = this._filetype;
    const snapshotId = ++this._highlightSnapshotId;
    if (!filetype)
      return;
    const isInitialContent = this._streaming && !this._hadInitialContent;
    if (isInitialContent) {
      this._hadInitialContent = true;
    }
    this._isHighlighting = true;
    try {
      const result = await this._treeSitterClient.highlightOnce(content, filetype);
      if (snapshotId !== this._highlightSnapshotId) {
        return;
      }
      if (this.isDestroyed)
        return;
      let highlights = result.highlights ?? [];
      if (this._onHighlight && highlights.length >= 0) {
        const context = {
          content,
          filetype,
          syntaxStyle: this._syntaxStyle
        };
        const modified = await this._onHighlight(highlights, context);
        if (modified !== undefined) {
          highlights = modified;
        }
      }
      if (snapshotId !== this._highlightSnapshotId) {
        return;
      }
      if (this.isDestroyed)
        return;
      if (highlights.length > 0) {
        if (this._streaming) {
          this._lastHighlights = highlights;
        }
        const chunks = treeSitterToTextChunks(content, highlights, this._syntaxStyle, {
          enabled: this._conceal
        });
        const styledText = new StyledText(chunks);
        this.textBuffer.setStyledText(styledText);
      } else {
        this.textBuffer.setText(content);
      }
      this._shouldRenderTextBuffer = true;
      this._isHighlighting = false;
      this._highlightsDirty = false;
      this.updateTextInfo();
      this.requestRender();
    } catch (error) {
      if (snapshotId !== this._highlightSnapshotId) {
        return;
      }
      console.warn("Code highlighting failed, falling back to plain text:", error);
      if (this.isDestroyed)
        return;
      this.textBuffer.setText(content);
      this._shouldRenderTextBuffer = true;
      this._isHighlighting = false;
      this._highlightsDirty = false;
      this.updateTextInfo();
      this.requestRender();
    }
  }
  getLineHighlights(lineIdx) {
    return this.textBuffer.getLineHighlights(lineIdx);
  }
  renderSelf(buffer) {
    if (this._highlightsDirty) {
      if (this.isDestroyed)
        return;
      if (this._content.length === 0) {
        this._shouldRenderTextBuffer = false;
        this._highlightsDirty = false;
      } else if (!this._filetype) {
        this._shouldRenderTextBuffer = true;
        this._highlightsDirty = false;
      } else {
        this.ensureVisibleTextBeforeHighlight();
        this._highlightsDirty = false;
        this.startHighlight();
      }
    }
    if (!this._shouldRenderTextBuffer)
      return;
    super.renderSelf(buffer);
  }
}
// src/renderables/TextNode.ts
var BrandedTextNodeRenderable = Symbol.for("@opentui/core/TextNodeRenderable");
function isTextNodeRenderable(obj) {
  return !!obj?.[BrandedTextNodeRenderable];
}
function styledTextToTextNodes(styledText) {
  return styledText.chunks.map((chunk) => {
    const node = new TextNodeRenderable({
      fg: chunk.fg,
      bg: chunk.bg,
      attributes: chunk.attributes,
      link: chunk.link
    });
    node.add(chunk.text);
    return node;
  });
}

class TextNodeRenderable extends BaseRenderable {
  [BrandedTextNodeRenderable] = true;
  _fg;
  _bg;
  _attributes;
  _link;
  _children = [];
  parent = null;
  constructor(options) {
    super(options);
    this._fg = options.fg ? parseColor(options.fg) : undefined;
    this._bg = options.bg ? parseColor(options.bg) : undefined;
    this._attributes = options.attributes ?? 0;
    this._link = options.link;
  }
  get children() {
    return this._children;
  }
  set children(children) {
    this._children = children;
    this.requestRender();
  }
  requestRender() {
    this.markDirty();
    this.parent?.requestRender();
  }
  add(obj, index) {
    if (typeof obj === "string") {
      if (index !== undefined) {
        this._children.splice(index, 0, obj);
        this.requestRender();
        return index;
      }
      const insertIndex = this._children.length;
      this._children.push(obj);
      this.requestRender();
      return insertIndex;
    }
    if (isTextNodeRenderable(obj)) {
      if (index !== undefined) {
        this._children.splice(index, 0, obj);
        obj.parent = this;
        this.requestRender();
        return index;
      }
      const insertIndex = this._children.length;
      this._children.push(obj);
      obj.parent = this;
      this.requestRender();
      return insertIndex;
    }
    if (isStyledText(obj)) {
      const textNodes = styledTextToTextNodes(obj);
      if (index !== undefined) {
        this._children.splice(index, 0, ...textNodes);
        textNodes.forEach((node) => node.parent = this);
        this.requestRender();
        return index;
      }
      const insertIndex = this._children.length;
      this._children.push(...textNodes);
      textNodes.forEach((node) => node.parent = this);
      this.requestRender();
      return insertIndex;
    }
    throw new Error("TextNodeRenderable only accepts strings, TextNodeRenderable instances, or StyledText instances");
  }
  replace(obj, index) {
    this._children[index] = obj;
    if (typeof obj !== "string") {
      obj.parent = this;
    }
    this.requestRender();
  }
  insertBefore(child, anchorNode) {
    if (!anchorNode || !isTextNodeRenderable(anchorNode)) {
      throw new Error("Anchor must be a TextNodeRenderable");
    }
    const anchorIndex = this._children.indexOf(anchorNode);
    if (anchorIndex === -1) {
      throw new Error("Anchor node not found in children");
    }
    if (typeof child === "string") {
      this._children.splice(anchorIndex, 0, child);
    } else if (isTextNodeRenderable(child)) {
      this._children.splice(anchorIndex, 0, child);
      child.parent = this;
    } else if (child instanceof StyledText) {
      const textNodes = styledTextToTextNodes(child);
      this._children.splice(anchorIndex, 0, ...textNodes);
      textNodes.forEach((node) => node.parent = this);
    } else {
      throw new Error("Child must be a string, TextNodeRenderable, or StyledText instance");
    }
    this.requestRender();
    return this;
  }
  remove(id) {
    const childIndex = this.getRenderableIndex(id);
    if (childIndex === -1) {
      throw new Error("Child not found in children");
    }
    const child = this._children[childIndex];
    this._children.splice(childIndex, 1);
    child.parent = null;
    this.requestRender();
    return this;
  }
  clear() {
    this._children = [];
    this.requestRender();
  }
  mergeStyles(parentStyle) {
    return {
      fg: this._fg ?? parentStyle.fg,
      bg: this._bg ?? parentStyle.bg,
      attributes: this._attributes | parentStyle.attributes,
      link: this._link ?? parentStyle.link
    };
  }
  gatherWithInheritedStyle(parentStyle = {
    fg: undefined,
    bg: undefined,
    attributes: 0
  }) {
    const currentStyle = this.mergeStyles(parentStyle);
    const chunks = [];
    for (const child of this._children) {
      if (typeof child === "string") {
        chunks.push({
          __isChunk: true,
          text: child,
          fg: currentStyle.fg,
          bg: currentStyle.bg,
          attributes: currentStyle.attributes,
          link: currentStyle.link
        });
      } else {
        const childChunks = child.gatherWithInheritedStyle(currentStyle);
        chunks.push(...childChunks);
      }
    }
    this.markClean();
    return chunks;
  }
  static fromString(text, options = {}) {
    const node = new TextNodeRenderable(options);
    node.add(text);
    return node;
  }
  static fromNodes(nodes, options = {}) {
    const node = new TextNodeRenderable(options);
    for (const childNode of nodes) {
      node.add(childNode);
    }
    return node;
  }
  toChunks(parentStyle = {
    fg: undefined,
    bg: undefined,
    attributes: 0
  }) {
    return this.gatherWithInheritedStyle(parentStyle);
  }
  getChildren() {
    return this._children.filter((child) => typeof child !== "string");
  }
  getChildrenCount() {
    return this._children.length;
  }
  getRenderable(id) {
    return this._children.find((child) => typeof child !== "string" && child.id === id);
  }
  getRenderableIndex(id) {
    return this._children.findIndex((child) => isTextNodeRenderable(child) && child.id === id);
  }
  get fg() {
    return this._fg;
  }
  set fg(fg2) {
    if (!fg2) {
      this._fg = undefined;
      this.requestRender();
      return;
    }
    this._fg = parseColor(fg2);
    this.requestRender();
  }
  set bg(bg2) {
    if (!bg2) {
      this._bg = undefined;
      this.requestRender();
      return;
    }
    this._bg = parseColor(bg2);
    this.requestRender();
  }
  get bg() {
    return this._bg;
  }
  set attributes(attributes) {
    this._attributes = attributes;
    this.requestRender();
  }
  get attributes() {
    return this._attributes;
  }
  set link(link2) {
    this._link = link2;
    this.requestRender();
  }
  get link() {
    return this._link;
  }
  findDescendantById(id) {
    return;
  }
}

class RootTextNodeRenderable extends TextNodeRenderable {
  ctx;
  textParent;
  constructor(ctx, options, textParent) {
    super(options);
    this.ctx = ctx;
    this.textParent = textParent;
  }
  requestRender() {
    this.markDirty();
    this.ctx.requestRender();
  }
}

// src/renderables/composition/constructs.ts
function Generic(props, ...children) {
  return h(VRenderable, props || {}, ...children);
}
function Box(props, ...children) {
  return h(BoxRenderable, props || {}, ...children);
}
function Text(props, ...children) {
  return h(TextRenderable, props || {}, ...children);
}
function ASCIIFont(props, ...children) {
  return h(ASCIIFontRenderable, props || {}, ...children);
}
function Input(props, ...children) {
  return h(InputRenderable, props || {}, ...children);
}
function Select(props, ...children) {
  return h(SelectRenderable, props || {}, ...children);
}
function TabSelect(props, ...children) {
  return h(TabSelectRenderable, props || {}, ...children);
}
function FrameBuffer(props, ...children) {
  return h(FrameBufferRenderable, props, ...children);
}
function Code(props, ...children) {
  return h(CodeRenderable, props, ...children);
}
function ScrollBox(props, ...children) {
  return h(ScrollBoxRenderable, props || {}, ...children);
}
function StyledText2(props, ...children) {
  const styledProps = props;
  const textNodeOptions = {
    ...styledProps,
    attributes: styledProps?.attributes ?? 0
  };
  const textNode = new TextNodeRenderable(textNodeOptions);
  for (const child of children) {
    textNode.add(child);
  }
  return textNode;
}
var vstyles = {
  bold: (...children) => StyledText2({ attributes: TextAttributes.BOLD }, ...children),
  italic: (...children) => StyledText2({ attributes: TextAttributes.ITALIC }, ...children),
  underline: (...children) => StyledText2({ attributes: TextAttributes.UNDERLINE }, ...children),
  dim: (...children) => StyledText2({ attributes: TextAttributes.DIM }, ...children),
  blink: (...children) => StyledText2({ attributes: TextAttributes.BLINK }, ...children),
  inverse: (...children) => StyledText2({ attributes: TextAttributes.INVERSE }, ...children),
  hidden: (...children) => StyledText2({ attributes: TextAttributes.HIDDEN }, ...children),
  strikethrough: (...children) => StyledText2({ attributes: TextAttributes.STRIKETHROUGH }, ...children),
  boldItalic: (...children) => StyledText2({ attributes: TextAttributes.BOLD | TextAttributes.ITALIC }, ...children),
  boldUnderline: (...children) => StyledText2({ attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE }, ...children),
  italicUnderline: (...children) => StyledText2({ attributes: TextAttributes.ITALIC | TextAttributes.UNDERLINE }, ...children),
  boldItalicUnderline: (...children) => StyledText2({ attributes: TextAttributes.BOLD | TextAttributes.ITALIC | TextAttributes.UNDERLINE }, ...children),
  color: (color, ...children) => StyledText2({ fg: color }, ...children),
  bgColor: (bgColor, ...children) => StyledText2({ bg: bgColor }, ...children),
  fg: (color, ...children) => StyledText2({ fg: color }, ...children),
  bg: (bgColor, ...children) => StyledText2({ bg: bgColor }, ...children),
  styled: (attributes = 0, ...children) => StyledText2({ attributes }, ...children)
};
// src/renderables/composition/VRenderable.ts
class VRenderable extends Renderable {
  options;
  constructor(ctx, options) {
    super(ctx, options);
    this.options = options;
  }
  renderSelf(buffer, deltaTime) {
    if (this.options.render) {
      this.options.render.call(this.options, buffer, deltaTime, this);
    }
  }
}
// src/renderables/LineNumberRenderable.ts
class GutterRenderable extends Renderable {
  target;
  _fg;
  _bg;
  _minWidth;
  _paddingRight;
  _lineColorsGutter;
  _lineColorsContent;
  _lineSigns;
  _lineNumberOffset;
  _hideLineNumbers;
  _lineNumbers;
  _maxBeforeWidth = 0;
  _maxAfterWidth = 0;
  _lastKnownLineCount = 0;
  _lastKnownScrollY = 0;
  constructor(ctx, target, options) {
    super(ctx, {
      id: options.id,
      width: "auto",
      height: "auto",
      flexGrow: 0,
      flexShrink: 0,
      buffered: options.buffered
    });
    this.target = target;
    this._fg = options.fg;
    this._bg = options.bg;
    this._minWidth = options.minWidth;
    this._paddingRight = options.paddingRight;
    this._lineColorsGutter = options.lineColorsGutter;
    this._lineColorsContent = options.lineColorsContent;
    this._lineSigns = options.lineSigns;
    this._lineNumberOffset = options.lineNumberOffset;
    this._hideLineNumbers = options.hideLineNumbers;
    this._lineNumbers = options.lineNumbers ?? new Map;
    this._lastKnownLineCount = this.target.virtualLineCount;
    this._lastKnownScrollY = this.target.scrollY;
    this.calculateSignWidths();
    this.setupMeasureFunc();
    this.onLifecyclePass = () => {
      const currentLineCount = this.target.virtualLineCount;
      if (currentLineCount !== this._lastKnownLineCount) {
        this._lastKnownLineCount = currentLineCount;
        this.yogaNode.markDirty();
        this.requestRender();
      }
    };
  }
  setupMeasureFunc() {
    const measureFunc = (width, widthMode, height, heightMode) => {
      const gutterWidth = this.calculateWidth();
      const gutterHeight = this.target.virtualLineCount;
      return {
        width: gutterWidth,
        height: gutterHeight
      };
    };
    this.yogaNode.setMeasureFunc(measureFunc);
  }
  remeasure() {
    this.yogaNode.markDirty();
  }
  setLineNumberOffset(offset) {
    if (this._lineNumberOffset !== offset) {
      this._lineNumberOffset = offset;
      this.yogaNode.markDirty();
      this.requestRender();
    }
  }
  setHideLineNumbers(hideLineNumbers) {
    this._hideLineNumbers = hideLineNumbers;
    this.yogaNode.markDirty();
    this.requestRender();
  }
  setLineNumbers(lineNumbers) {
    this._lineNumbers = lineNumbers;
    this.yogaNode.markDirty();
    this.requestRender();
  }
  calculateSignWidths() {
    this._maxBeforeWidth = 0;
    this._maxAfterWidth = 0;
    for (const sign of this._lineSigns.values()) {
      if (sign.before) {
        const width = Bun.stringWidth(sign.before);
        this._maxBeforeWidth = Math.max(this._maxBeforeWidth, width);
      }
      if (sign.after) {
        const width = Bun.stringWidth(sign.after);
        this._maxAfterWidth = Math.max(this._maxAfterWidth, width);
      }
    }
  }
  calculateWidth() {
    const totalLines = this.target.virtualLineCount;
    let maxLineNumber = totalLines + this._lineNumberOffset;
    if (this._lineNumbers.size > 0) {
      for (const customLineNum of this._lineNumbers.values()) {
        maxLineNumber = Math.max(maxLineNumber, customLineNum);
      }
    }
    const digits = maxLineNumber > 0 ? Math.floor(Math.log10(maxLineNumber)) + 1 : 1;
    const baseWidth = Math.max(this._minWidth, digits + this._paddingRight + 1);
    return baseWidth + this._maxBeforeWidth + this._maxAfterWidth;
  }
  setLineColors(lineColorsGutter, lineColorsContent) {
    this._lineColorsGutter = lineColorsGutter;
    this._lineColorsContent = lineColorsContent;
    this.requestRender();
  }
  getLineColors() {
    return {
      gutter: this._lineColorsGutter,
      content: this._lineColorsContent
    };
  }
  setLineSigns(lineSigns) {
    const oldMaxBefore = this._maxBeforeWidth;
    const oldMaxAfter = this._maxAfterWidth;
    this._lineSigns = lineSigns;
    this.calculateSignWidths();
    if (this._maxBeforeWidth !== oldMaxBefore || this._maxAfterWidth !== oldMaxAfter) {
      this.yogaNode.markDirty();
    }
    this.requestRender();
  }
  getLineSigns() {
    return this._lineSigns;
  }
  renderSelf(buffer) {
    const currentScrollY = this.target.scrollY;
    const scrollChanged = currentScrollY !== this._lastKnownScrollY;
    if (this.buffered && !this.isDirty && !scrollChanged) {
      return;
    }
    this._lastKnownScrollY = currentScrollY;
    this.refreshFrameBuffer(buffer);
  }
  refreshFrameBuffer(buffer) {
    const startX = this.buffered ? 0 : this.x;
    const startY = this.buffered ? 0 : this.y;
    if (this.buffered) {
      buffer.clear(this._bg);
    } else if (this._bg.a > 0) {
      buffer.fillRect(startX, startY, this.width, this.height, this._bg);
    }
    const lineInfo = this.target.lineInfo;
    if (!lineInfo || !lineInfo.lineSources)
      return;
    const sources = lineInfo.lineSources;
    let lastSource = -1;
    const startLine = this.target.scrollY;
    if (startLine >= sources.length)
      return;
    lastSource = startLine > 0 ? sources[startLine - 1] : -1;
    for (let i = 0;i < this.height; i++) {
      const visualLineIndex = startLine + i;
      if (visualLineIndex >= sources.length)
        break;
      const logicalLine = sources[visualLineIndex];
      const lineBg = this._lineColorsGutter.get(logicalLine) ?? this._bg;
      if (lineBg !== this._bg) {
        buffer.fillRect(startX, startY + i, this.width, 1, lineBg);
      }
      if (logicalLine === lastSource) {} else {
        let currentX = startX;
        const sign = this._lineSigns.get(logicalLine);
        if (sign?.before) {
          const beforeWidth = Bun.stringWidth(sign.before);
          const padding = this._maxBeforeWidth - beforeWidth;
          currentX += padding;
          const beforeColor = sign.beforeColor ? parseColor(sign.beforeColor) : this._fg;
          buffer.drawText(sign.before, currentX, startY + i, beforeColor, lineBg);
          currentX += beforeWidth;
        } else if (this._maxBeforeWidth > 0) {
          currentX += this._maxBeforeWidth;
        }
        if (!this._hideLineNumbers.has(logicalLine)) {
          const customLineNum = this._lineNumbers.get(logicalLine);
          const lineNum = customLineNum !== undefined ? customLineNum : logicalLine + 1 + this._lineNumberOffset;
          const lineNumStr = lineNum.toString();
          const lineNumWidth = lineNumStr.length;
          const availableSpace = this.width - this._maxBeforeWidth - this._maxAfterWidth - this._paddingRight;
          const lineNumX = startX + this._maxBeforeWidth + 1 + availableSpace - lineNumWidth - 1;
          if (lineNumX >= startX + this._maxBeforeWidth + 1) {
            buffer.drawText(lineNumStr, lineNumX, startY + i, this._fg, lineBg);
          }
        }
        if (sign?.after) {
          const afterX = startX + this.width - this._paddingRight - this._maxAfterWidth;
          const afterColor = sign.afterColor ? parseColor(sign.afterColor) : this._fg;
          buffer.drawText(sign.after, afterX, startY + i, afterColor, lineBg);
        }
      }
      lastSource = logicalLine;
    }
  }
}
function darkenColor(color) {
  return RGBA.fromValues(color.r * 0.8, color.g * 0.8, color.b * 0.8, color.a);
}

class LineNumberRenderable extends Renderable {
  gutter = null;
  target = null;
  _lineColorsGutter;
  _lineColorsContent;
  _lineSigns;
  _fg;
  _bg;
  _minWidth;
  _paddingRight;
  _lineNumberOffset;
  _hideLineNumbers;
  _lineNumbers;
  _isDestroying = false;
  handleLineInfoChange = () => {
    this.gutter?.remeasure();
    this.requestRender();
  };
  parseLineColor(line, color) {
    if (typeof color === "object" && "gutter" in color) {
      const config = color;
      if (config.gutter) {
        this._lineColorsGutter.set(line, parseColor(config.gutter));
      }
      if (config.content) {
        this._lineColorsContent.set(line, parseColor(config.content));
      } else if (config.gutter) {
        this._lineColorsContent.set(line, darkenColor(parseColor(config.gutter)));
      }
    } else {
      const parsedColor = parseColor(color);
      this._lineColorsGutter.set(line, parsedColor);
      this._lineColorsContent.set(line, darkenColor(parsedColor));
    }
  }
  constructor(ctx, options) {
    super(ctx, {
      ...options,
      flexDirection: "row",
      height: "auto"
    });
    this._fg = parseColor(options.fg ?? "#888888");
    this._bg = parseColor(options.bg ?? "transparent");
    this._minWidth = options.minWidth ?? 3;
    this._paddingRight = options.paddingRight ?? 1;
    this._lineNumberOffset = options.lineNumberOffset ?? 0;
    this._hideLineNumbers = options.hideLineNumbers ?? new Set;
    this._lineNumbers = options.lineNumbers ?? new Map;
    this._lineColorsGutter = new Map;
    this._lineColorsContent = new Map;
    if (options.lineColors) {
      for (const [line, color] of options.lineColors) {
        this.parseLineColor(line, color);
      }
    }
    this._lineSigns = new Map;
    if (options.lineSigns) {
      for (const [line, sign] of options.lineSigns) {
        this._lineSigns.set(line, sign);
      }
    }
    if (options.target) {
      this.setTarget(options.target);
    }
  }
  setTarget(target) {
    if (this.target === target)
      return;
    if (this.target) {
      this.target.off("line-info-change", this.handleLineInfoChange);
      super.remove(this.target.id);
    }
    if (this.gutter) {
      super.remove(this.gutter.id);
      this.gutter = null;
    }
    this.target = target;
    this.target.on("line-info-change", this.handleLineInfoChange);
    this.gutter = new GutterRenderable(this.ctx, this.target, {
      fg: this._fg,
      bg: this._bg,
      minWidth: this._minWidth,
      paddingRight: this._paddingRight,
      lineColorsGutter: this._lineColorsGutter,
      lineColorsContent: this._lineColorsContent,
      lineSigns: this._lineSigns,
      lineNumberOffset: this._lineNumberOffset,
      hideLineNumbers: this._hideLineNumbers,
      lineNumbers: this._lineNumbers,
      id: this.id ? `${this.id}-gutter` : undefined,
      buffered: true
    });
    super.add(this.gutter);
    super.add(this.target);
  }
  add(child) {
    if (!this.target && "lineInfo" in child && "lineCount" in child && "virtualLineCount" in child && "scrollY" in child) {
      this.setTarget(child);
      return this.getChildrenCount() - 1;
    }
    return -1;
  }
  remove(id) {
    if (this._isDestroying) {
      super.remove(id);
      return;
    }
    if (this.gutter && id === this.gutter.id) {
      throw new Error("LineNumberRenderable: Cannot remove gutter directly.");
    }
    if (this.target && id === this.target.id) {
      throw new Error("LineNumberRenderable: Cannot remove target directly. Use clearTarget() instead.");
    }
    super.remove(id);
  }
  destroyRecursively() {
    this._isDestroying = true;
    if (this.target) {
      this.target.off("line-info-change", this.handleLineInfoChange);
    }
    super.destroyRecursively();
    this.gutter = null;
    this.target = null;
  }
  clearTarget() {
    if (this.target) {
      this.target.off("line-info-change", this.handleLineInfoChange);
      super.remove(this.target.id);
      this.target = null;
    }
    if (this.gutter) {
      super.remove(this.gutter.id);
      this.gutter = null;
    }
  }
  renderSelf(buffer) {
    if (!this.target || !this.gutter)
      return;
    const lineInfo = this.target.lineInfo;
    if (!lineInfo || !lineInfo.lineSources)
      return;
    const sources = lineInfo.lineSources;
    const startLine = this.target.scrollY;
    if (startLine >= sources.length)
      return;
    const gutterWidth = this.gutter.visible ? this.gutter.width : 0;
    const contentWidth = this.width - gutterWidth;
    for (let i = 0;i < this.height; i++) {
      const visualLineIndex = startLine + i;
      if (visualLineIndex >= sources.length)
        break;
      const logicalLine = sources[visualLineIndex];
      const lineBg = this._lineColorsContent.get(logicalLine);
      if (lineBg) {
        buffer.fillRect(this.x + gutterWidth, this.y + i, contentWidth, 1, lineBg);
      }
    }
  }
  set showLineNumbers(value) {
    if (this.gutter) {
      this.gutter.visible = value;
    }
  }
  get showLineNumbers() {
    return this.gutter?.visible ?? false;
  }
  setLineColor(line, color) {
    this.parseLineColor(line, color);
    if (this.gutter) {
      this.gutter.setLineColors(this._lineColorsGutter, this._lineColorsContent);
    }
  }
  clearLineColor(line) {
    this._lineColorsGutter.delete(line);
    this._lineColorsContent.delete(line);
    if (this.gutter) {
      this.gutter.setLineColors(this._lineColorsGutter, this._lineColorsContent);
    }
  }
  clearAllLineColors() {
    this._lineColorsGutter.clear();
    this._lineColorsContent.clear();
    if (this.gutter) {
      this.gutter.setLineColors(this._lineColorsGutter, this._lineColorsContent);
    }
  }
  setLineColors(lineColors) {
    this._lineColorsGutter.clear();
    this._lineColorsContent.clear();
    for (const [line, color] of lineColors) {
      this.parseLineColor(line, color);
    }
    if (this.gutter) {
      this.gutter.setLineColors(this._lineColorsGutter, this._lineColorsContent);
    }
  }
  getLineColors() {
    return {
      gutter: this._lineColorsGutter,
      content: this._lineColorsContent
    };
  }
  setLineSign(line, sign) {
    this._lineSigns.set(line, sign);
    if (this.gutter) {
      this.gutter.setLineSigns(this._lineSigns);
    }
  }
  clearLineSign(line) {
    this._lineSigns.delete(line);
    if (this.gutter) {
      this.gutter.setLineSigns(this._lineSigns);
    }
  }
  clearAllLineSigns() {
    this._lineSigns.clear();
    if (this.gutter) {
      this.gutter.setLineSigns(this._lineSigns);
    }
  }
  setLineSigns(lineSigns) {
    this._lineSigns.clear();
    for (const [line, sign] of lineSigns) {
      this._lineSigns.set(line, sign);
    }
    if (this.gutter) {
      this.gutter.setLineSigns(this._lineSigns);
    }
  }
  getLineSigns() {
    return this._lineSigns;
  }
  set lineNumberOffset(value) {
    if (this._lineNumberOffset !== value) {
      this._lineNumberOffset = value;
      if (this.gutter) {
        this.gutter.setLineNumberOffset(value);
      }
    }
  }
  get lineNumberOffset() {
    return this._lineNumberOffset;
  }
  setHideLineNumbers(hideLineNumbers) {
    this._hideLineNumbers = hideLineNumbers;
    if (this.gutter) {
      this.gutter.setHideLineNumbers(hideLineNumbers);
    }
  }
  getHideLineNumbers() {
    return this._hideLineNumbers;
  }
  setLineNumbers(lineNumbers) {
    this._lineNumbers = lineNumbers;
    if (this.gutter) {
      this.gutter.setLineNumbers(lineNumbers);
    }
  }
  getLineNumbers() {
    return this._lineNumbers;
  }
}

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/diff/base.js
class Diff {
  diff(oldStr, newStr, options = {}) {
    let callback;
    if (typeof options === "function") {
      callback = options;
      options = {};
    } else if ("callback" in options) {
      callback = options.callback;
    }
    const oldString = this.castInput(oldStr, options);
    const newString = this.castInput(newStr, options);
    const oldTokens = this.removeEmpty(this.tokenize(oldString, options));
    const newTokens = this.removeEmpty(this.tokenize(newString, options));
    return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
  }
  diffWithOptionsObj(oldTokens, newTokens, options, callback) {
    var _a;
    const done = (value) => {
      value = this.postProcess(value, options);
      if (callback) {
        setTimeout(function() {
          callback(value);
        }, 0);
        return;
      } else {
        return value;
      }
    };
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let editLength = 1;
    let maxEditLength = newLen + oldLen;
    if (options.maxEditLength != null) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    const maxExecutionTime = (_a = options.timeout) !== null && _a !== undefined ? _a : Infinity;
    const abortAfterTimestamp = Date.now() + maxExecutionTime;
    const bestPath = [{ oldPos: -1, lastComponent: undefined }];
    let newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
    if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
      return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
    }
    let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
    const execEditLength = () => {
      for (let diagonalPath = Math.max(minDiagonalToConsider, -editLength);diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
        let basePath;
        const removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
        if (removePath) {
          bestPath[diagonalPath - 1] = undefined;
        }
        let canAdd = false;
        if (addPath) {
          const addPathNewPos = addPath.oldPos - diagonalPath;
          canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
        }
        const canRemove = removePath && removePath.oldPos + 1 < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = undefined;
          continue;
        }
        if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) {
          basePath = this.addToPath(addPath, true, false, 0, options);
        } else {
          basePath = this.addToPath(removePath, false, true, 1, options);
        }
        newPos = this.extractCommon(basePath, newTokens, oldTokens, diagonalPath, options);
        if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
          return done(this.buildValues(basePath.lastComponent, newTokens, oldTokens)) || true;
        } else {
          bestPath[diagonalPath] = basePath;
          if (basePath.oldPos + 1 >= oldLen) {
            maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
          }
          if (newPos + 1 >= newLen) {
            minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
          }
        }
      }
      editLength++;
    };
    if (callback) {
      (function exec() {
        setTimeout(function() {
          if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) {
            return callback(undefined);
          }
          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
        const ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    }
  }
  addToPath(path, added, removed, oldPosInc, options) {
    const last = path.lastComponent;
    if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: last.count + 1, added, removed, previousComponent: last.previousComponent }
      };
    } else {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: 1, added, removed, previousComponent: last }
      };
    }
  }
  extractCommon(basePath, newTokens, oldTokens, diagonalPath, options) {
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1], options)) {
      newPos++;
      oldPos++;
      commonCount++;
      if (options.oneChangePerToken) {
        basePath.lastComponent = { count: 1, previousComponent: basePath.lastComponent, added: false, removed: false };
      }
    }
    if (commonCount && !options.oneChangePerToken) {
      basePath.lastComponent = { count: commonCount, previousComponent: basePath.lastComponent, added: false, removed: false };
    }
    basePath.oldPos = oldPos;
    return newPos;
  }
  equals(left, right, options) {
    if (options.comparator) {
      return options.comparator(left, right);
    } else {
      return left === right || !!options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  }
  removeEmpty(array) {
    const ret = [];
    for (let i = 0;i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  }
  castInput(value, options) {
    return value;
  }
  tokenize(value, options) {
    return Array.from(value);
  }
  join(chars) {
    return chars.join("");
  }
  postProcess(changeObjects, options) {
    return changeObjects;
  }
  get useLongestToken() {
    return false;
  }
  buildValues(lastComponent, newTokens, oldTokens) {
    const components = [];
    let nextComponent;
    while (lastComponent) {
      components.push(lastComponent);
      nextComponent = lastComponent.previousComponent;
      delete lastComponent.previousComponent;
      lastComponent = nextComponent;
    }
    components.reverse();
    const componentLen = components.length;
    let componentPos = 0, newPos = 0, oldPos = 0;
    for (;componentPos < componentLen; componentPos++) {
      const component = components[componentPos];
      if (!component.removed) {
        if (!component.added && this.useLongestToken) {
          let value = newTokens.slice(newPos, newPos + component.count);
          value = value.map(function(value2, i) {
            const oldValue = oldTokens[oldPos + i];
            return oldValue.length > value2.length ? oldValue : value2;
          });
          component.value = this.join(value);
        } else {
          component.value = this.join(newTokens.slice(newPos, newPos + component.count));
        }
        newPos += component.count;
        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        component.value = this.join(oldTokens.slice(oldPos, oldPos + component.count));
        oldPos += component.count;
      }
    }
    return components;
  }
}

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/diff/character.js
class CharacterDiff extends Diff {
}
var characterDiff = new CharacterDiff;

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/util/string.js
function longestCommonPrefix(str1, str2) {
  let i;
  for (i = 0;i < str1.length && i < str2.length; i++) {
    if (str1[i] != str2[i]) {
      return str1.slice(0, i);
    }
  }
  return str1.slice(0, i);
}
function longestCommonSuffix(str1, str2) {
  let i;
  if (!str1 || !str2 || str1[str1.length - 1] != str2[str2.length - 1]) {
    return "";
  }
  for (i = 0;i < str1.length && i < str2.length; i++) {
    if (str1[str1.length - (i + 1)] != str2[str2.length - (i + 1)]) {
      return str1.slice(-i);
    }
  }
  return str1.slice(-i);
}
function replacePrefix(string, oldPrefix, newPrefix) {
  if (string.slice(0, oldPrefix.length) != oldPrefix) {
    throw Error(`string ${JSON.stringify(string)} doesn't start with prefix ${JSON.stringify(oldPrefix)}; this is a bug`);
  }
  return newPrefix + string.slice(oldPrefix.length);
}
function replaceSuffix(string, oldSuffix, newSuffix) {
  if (!oldSuffix) {
    return string + newSuffix;
  }
  if (string.slice(-oldSuffix.length) != oldSuffix) {
    throw Error(`string ${JSON.stringify(string)} doesn't end with suffix ${JSON.stringify(oldSuffix)}; this is a bug`);
  }
  return string.slice(0, -oldSuffix.length) + newSuffix;
}
function removePrefix(string, oldPrefix) {
  return replacePrefix(string, oldPrefix, "");
}
function removeSuffix(string, oldSuffix) {
  return replaceSuffix(string, oldSuffix, "");
}
function maximumOverlap(string1, string2) {
  return string2.slice(0, overlapCount(string1, string2));
}
function overlapCount(a, b) {
  let startA = 0;
  if (a.length > b.length) {
    startA = a.length - b.length;
  }
  let endB = b.length;
  if (a.length < b.length) {
    endB = a.length;
  }
  const map = Array(endB);
  let k = 0;
  map[0] = 0;
  for (let j = 1;j < endB; j++) {
    if (b[j] == b[k]) {
      map[j] = map[k];
    } else {
      map[j] = k;
    }
    while (k > 0 && b[j] != b[k]) {
      k = map[k];
    }
    if (b[j] == b[k]) {
      k++;
    }
  }
  k = 0;
  for (let i = startA;i < a.length; i++) {
    while (k > 0 && a[i] != b[k]) {
      k = map[k];
    }
    if (a[i] == b[k]) {
      k++;
    }
  }
  return k;
}
function trailingWs(string) {
  let i;
  for (i = string.length - 1;i >= 0; i--) {
    if (!string[i].match(/\s/)) {
      break;
    }
  }
  return string.substring(i + 1);
}
function leadingWs(string) {
  const match = string.match(/^\s*/);
  return match ? match[0] : "";
}

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/diff/word.js
var extendedWordChars = "a-zA-Z0-9_\\u{C0}-\\u{FF}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}";
var tokenizeIncludingWhitespace = new RegExp(`[${extendedWordChars}]+|\\s+|[^${extendedWordChars}]`, "ug");

class WordDiff extends Diff {
  equals(left, right, options) {
    if (options.ignoreCase) {
      left = left.toLowerCase();
      right = right.toLowerCase();
    }
    return left.trim() === right.trim();
  }
  tokenize(value, options = {}) {
    let parts;
    if (options.intlSegmenter) {
      const segmenter = options.intlSegmenter;
      if (segmenter.resolvedOptions().granularity != "word") {
        throw new Error('The segmenter passed must have a granularity of "word"');
      }
      parts = Array.from(segmenter.segment(value), (segment) => segment.segment);
    } else {
      parts = value.match(tokenizeIncludingWhitespace) || [];
    }
    const tokens = [];
    let prevPart = null;
    parts.forEach((part) => {
      if (/\s/.test(part)) {
        if (prevPart == null) {
          tokens.push(part);
        } else {
          tokens.push(tokens.pop() + part);
        }
      } else if (prevPart != null && /\s/.test(prevPart)) {
        if (tokens[tokens.length - 1] == prevPart) {
          tokens.push(tokens.pop() + part);
        } else {
          tokens.push(prevPart + part);
        }
      } else {
        tokens.push(part);
      }
      prevPart = part;
    });
    return tokens;
  }
  join(tokens) {
    return tokens.map((token, i) => {
      if (i == 0) {
        return token;
      } else {
        return token.replace(/^\s+/, "");
      }
    }).join("");
  }
  postProcess(changes, options) {
    if (!changes || options.oneChangePerToken) {
      return changes;
    }
    let lastKeep = null;
    let insertion = null;
    let deletion = null;
    changes.forEach((change) => {
      if (change.added) {
        insertion = change;
      } else if (change.removed) {
        deletion = change;
      } else {
        if (insertion || deletion) {
          dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, change);
        }
        lastKeep = change;
        insertion = null;
        deletion = null;
      }
    });
    if (insertion || deletion) {
      dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, null);
    }
    return changes;
  }
}
var wordDiff = new WordDiff;
function dedupeWhitespaceInChangeObjects(startKeep, deletion, insertion, endKeep) {
  if (deletion && insertion) {
    const oldWsPrefix = leadingWs(deletion.value);
    const oldWsSuffix = trailingWs(deletion.value);
    const newWsPrefix = leadingWs(insertion.value);
    const newWsSuffix = trailingWs(insertion.value);
    if (startKeep) {
      const commonWsPrefix = longestCommonPrefix(oldWsPrefix, newWsPrefix);
      startKeep.value = replaceSuffix(startKeep.value, newWsPrefix, commonWsPrefix);
      deletion.value = removePrefix(deletion.value, commonWsPrefix);
      insertion.value = removePrefix(insertion.value, commonWsPrefix);
    }
    if (endKeep) {
      const commonWsSuffix = longestCommonSuffix(oldWsSuffix, newWsSuffix);
      endKeep.value = replacePrefix(endKeep.value, newWsSuffix, commonWsSuffix);
      deletion.value = removeSuffix(deletion.value, commonWsSuffix);
      insertion.value = removeSuffix(insertion.value, commonWsSuffix);
    }
  } else if (insertion) {
    if (startKeep) {
      const ws = leadingWs(insertion.value);
      insertion.value = insertion.value.substring(ws.length);
    }
    if (endKeep) {
      const ws = leadingWs(endKeep.value);
      endKeep.value = endKeep.value.substring(ws.length);
    }
  } else if (startKeep && endKeep) {
    const newWsFull = leadingWs(endKeep.value), delWsStart = leadingWs(deletion.value), delWsEnd = trailingWs(deletion.value);
    const newWsStart = longestCommonPrefix(newWsFull, delWsStart);
    deletion.value = removePrefix(deletion.value, newWsStart);
    const newWsEnd = longestCommonSuffix(removePrefix(newWsFull, newWsStart), delWsEnd);
    deletion.value = removeSuffix(deletion.value, newWsEnd);
    endKeep.value = replacePrefix(endKeep.value, newWsFull, newWsEnd);
    startKeep.value = replaceSuffix(startKeep.value, newWsFull, newWsFull.slice(0, newWsFull.length - newWsEnd.length));
  } else if (endKeep) {
    const endKeepWsPrefix = leadingWs(endKeep.value);
    const deletionWsSuffix = trailingWs(deletion.value);
    const overlap = maximumOverlap(deletionWsSuffix, endKeepWsPrefix);
    deletion.value = removeSuffix(deletion.value, overlap);
  } else if (startKeep) {
    const startKeepWsSuffix = trailingWs(startKeep.value);
    const deletionWsPrefix = leadingWs(deletion.value);
    const overlap = maximumOverlap(startKeepWsSuffix, deletionWsPrefix);
    deletion.value = removePrefix(deletion.value, overlap);
  }
}

class WordsWithSpaceDiff extends Diff {
  tokenize(value) {
    const regex = new RegExp(`(\\r?\\n)|[${extendedWordChars}]+|[^\\S\\n\\r]+|[^${extendedWordChars}]`, "ug");
    return value.match(regex) || [];
  }
}
var wordsWithSpaceDiff = new WordsWithSpaceDiff;

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/diff/line.js
class LineDiff extends Diff {
  constructor() {
    super(...arguments);
    this.tokenize = tokenize;
  }
  equals(left, right, options) {
    if (options.ignoreWhitespace) {
      if (!options.newlineIsToken || !left.includes(`
`)) {
        left = left.trim();
      }
      if (!options.newlineIsToken || !right.includes(`
`)) {
        right = right.trim();
      }
    } else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
      if (left.endsWith(`
`)) {
        left = left.slice(0, -1);
      }
      if (right.endsWith(`
`)) {
        right = right.slice(0, -1);
      }
    }
    return super.equals(left, right, options);
  }
}
var lineDiff = new LineDiff;
function tokenize(value, options) {
  if (options.stripTrailingCr) {
    value = value.replace(/\r\n/g, `
`);
  }
  const retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  }
  for (let i = 0;i < linesAndNewlines.length; i++) {
    const line = linesAndNewlines[i];
    if (i % 2 && !options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      retLines.push(line);
    }
  }
  return retLines;
}

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/diff/sentence.js
function isSentenceEndPunct(char) {
  return char == "." || char == "!" || char == "?";
}

class SentenceDiff extends Diff {
  tokenize(value) {
    var _a;
    const result = [];
    let tokenStartI = 0;
    for (let i = 0;i < value.length; i++) {
      if (i == value.length - 1) {
        result.push(value.slice(tokenStartI));
        break;
      }
      if (isSentenceEndPunct(value[i]) && value[i + 1].match(/\s/)) {
        result.push(value.slice(tokenStartI, i + 1));
        i = tokenStartI = i + 1;
        while ((_a = value[i + 1]) === null || _a === undefined ? undefined : _a.match(/\s/)) {
          i++;
        }
        result.push(value.slice(tokenStartI, i + 1));
        tokenStartI = i + 1;
      }
    }
    return result;
  }
}
var sentenceDiff = new SentenceDiff;

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/diff/css.js
class CssDiff extends Diff {
  tokenize(value) {
    return value.split(/([{}:;,]|\s+)/);
  }
}
var cssDiff = new CssDiff;

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/diff/json.js
class JsonDiff extends Diff {
  constructor() {
    super(...arguments);
    this.tokenize = tokenize;
  }
  get useLongestToken() {
    return true;
  }
  castInput(value, options) {
    const { undefinedReplacement, stringifyReplacer = (k, v) => typeof v === "undefined" ? undefinedReplacement : v } = options;
    return typeof value === "string" ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), null, "  ");
  }
  equals(left, right, options) {
    return super.equals(left.replace(/,([\r\n])/g, "$1"), right.replace(/,([\r\n])/g, "$1"), options);
  }
}
var jsonDiff = new JsonDiff;
function canonicalize(obj, stack, replacementStack, replacer, key) {
  stack = stack || [];
  replacementStack = replacementStack || [];
  if (replacer) {
    obj = replacer(key === undefined ? "" : key, obj);
  }
  let i;
  for (i = 0;i < stack.length; i += 1) {
    if (stack[i] === obj) {
      return replacementStack[i];
    }
  }
  let canonicalizedObj;
  if (Object.prototype.toString.call(obj) === "[object Array]") {
    stack.push(obj);
    canonicalizedObj = new Array(obj.length);
    replacementStack.push(canonicalizedObj);
    for (i = 0;i < obj.length; i += 1) {
      canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, String(i));
    }
    stack.pop();
    replacementStack.pop();
    return canonicalizedObj;
  }
  if (obj && obj.toJSON) {
    obj = obj.toJSON();
  }
  if (typeof obj === "object" && obj !== null) {
    stack.push(obj);
    canonicalizedObj = {};
    replacementStack.push(canonicalizedObj);
    const sortedKeys = [];
    let key2;
    for (key2 in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key2)) {
        sortedKeys.push(key2);
      }
    }
    sortedKeys.sort();
    for (i = 0;i < sortedKeys.length; i += 1) {
      key2 = sortedKeys[i];
      canonicalizedObj[key2] = canonicalize(obj[key2], stack, replacementStack, replacer, key2);
    }
    stack.pop();
    replacementStack.pop();
  } else {
    canonicalizedObj = obj;
  }
  return canonicalizedObj;
}

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/diff/array.js
class ArrayDiff extends Diff {
  tokenize(value) {
    return value.slice();
  }
  join(value) {
    return value;
  }
  removeEmpty(value) {
    return value;
  }
}
var arrayDiff = new ArrayDiff;

// ../../node_modules/.bun/diff@8.0.2/node_modules/diff/libesm/patch/parse.js
function parsePatch(uniDiff) {
  const diffstr = uniDiff.split(/\n/), list = [];
  let i = 0;
  function parseIndex() {
    const index = {};
    list.push(index);
    while (i < diffstr.length) {
      const line = diffstr[i];
      if (/^(---|\+\+\+|@@)\s/.test(line)) {
        break;
      }
      const header = /^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/.exec(line);
      if (header) {
        index.index = header[1];
      }
      i++;
    }
    parseFileHeader(index);
    parseFileHeader(index);
    index.hunks = [];
    while (i < diffstr.length) {
      const line = diffstr[i];
      if (/^(Index:\s|diff\s|---\s|\+\+\+\s|===================================================================)/.test(line)) {
        break;
      } else if (/^@@/.test(line)) {
        index.hunks.push(parseHunk());
      } else if (line) {
        throw new Error("Unknown line " + (i + 1) + " " + JSON.stringify(line));
      } else {
        i++;
      }
    }
  }
  function parseFileHeader(index) {
    const fileHeader = /^(---|\+\+\+)\s+(.*)\r?$/.exec(diffstr[i]);
    if (fileHeader) {
      const data = fileHeader[2].split("\t", 2), header = (data[1] || "").trim();
      let fileName = data[0].replace(/\\\\/g, "\\");
      if (/^".*"$/.test(fileName)) {
        fileName = fileName.substr(1, fileName.length - 2);
      }
      if (fileHeader[1] === "---") {
        index.oldFileName = fileName;
        index.oldHeader = header;
      } else {
        index.newFileName = fileName;
        index.newHeader = header;
      }
      i++;
    }
  }
  function parseHunk() {
    var _a;
    const chunkHeaderIndex = i, chunkHeaderLine = diffstr[i++], chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    const hunk = {
      oldStart: +chunkHeader[1],
      oldLines: typeof chunkHeader[2] === "undefined" ? 1 : +chunkHeader[2],
      newStart: +chunkHeader[3],
      newLines: typeof chunkHeader[4] === "undefined" ? 1 : +chunkHeader[4],
      lines: []
    };
    if (hunk.oldLines === 0) {
      hunk.oldStart += 1;
    }
    if (hunk.newLines === 0) {
      hunk.newStart += 1;
    }
    let addCount = 0, removeCount = 0;
    for (;i < diffstr.length && (removeCount < hunk.oldLines || addCount < hunk.newLines || ((_a = diffstr[i]) === null || _a === undefined ? undefined : _a.startsWith("\\"))); i++) {
      const operation = diffstr[i].length == 0 && i != diffstr.length - 1 ? " " : diffstr[i][0];
      if (operation === "+" || operation === "-" || operation === " " || operation === "\\") {
        hunk.lines.push(diffstr[i]);
        if (operation === "+") {
          addCount++;
        } else if (operation === "-") {
          removeCount++;
        } else if (operation === " ") {
          addCount++;
          removeCount++;
        }
      } else {
        throw new Error(`Hunk at line ${chunkHeaderIndex + 1} contained invalid line ${diffstr[i]}`);
      }
    }
    if (!addCount && hunk.newLines === 1) {
      hunk.newLines = 0;
    }
    if (!removeCount && hunk.oldLines === 1) {
      hunk.oldLines = 0;
    }
    if (addCount !== hunk.newLines) {
      throw new Error("Added line count did not match for hunk at line " + (chunkHeaderIndex + 1));
    }
    if (removeCount !== hunk.oldLines) {
      throw new Error("Removed line count did not match for hunk at line " + (chunkHeaderIndex + 1));
    }
    return hunk;
  }
  while (i < diffstr.length) {
    parseIndex();
  }
  return list;
}

// src/renderables/Text.ts
class TextRenderable extends TextBufferRenderable {
  _text;
  _hasManualStyledText = false;
  rootTextNode;
  _contentDefaultOptions = {
    content: ""
  };
  constructor(ctx, options) {
    super(ctx, options);
    const content = options.content ?? this._contentDefaultOptions.content;
    const styledText = typeof content === "string" ? stringToStyledText(content) : content;
    this._text = styledText;
    this._hasManualStyledText = options.content !== undefined && content !== "";
    this.rootTextNode = new RootTextNodeRenderable(ctx, {
      id: `${this.id}-root`,
      fg: this._defaultFg,
      bg: this._defaultBg,
      attributes: this._defaultAttributes
    }, this);
    this.updateTextBuffer(styledText);
  }
  updateTextBuffer(styledText) {
    this.textBuffer.setStyledText(styledText);
    this.clearChunks(styledText);
  }
  clearChunks(styledText) {}
  get content() {
    return this._text;
  }
  get chunks() {
    return this._text.chunks;
  }
  get textNode() {
    return this.rootTextNode;
  }
  set content(value) {
    this._hasManualStyledText = true;
    const styledText = typeof value === "string" ? stringToStyledText(value) : value;
    if (this._text !== styledText) {
      this._text = styledText;
      this.updateTextBuffer(styledText);
      this.updateTextInfo();
    }
  }
  updateTextFromNodes() {
    if (this.rootTextNode.isDirty && !this._hasManualStyledText) {
      const chunks = this.rootTextNode.gatherWithInheritedStyle({
        fg: this._defaultFg,
        bg: this._defaultBg,
        attributes: this._defaultAttributes,
        link: undefined
      });
      this.textBuffer.setStyledText(new StyledText(chunks));
      this.refreshLocalSelection();
      this.yogaNode.markDirty();
    }
  }
  add(obj, index) {
    return this.rootTextNode.add(obj, index);
  }
  remove(id) {
    this.rootTextNode.remove(id);
  }
  insertBefore(obj, anchor) {
    this.rootTextNode.insertBefore(obj, anchor);
    return this.rootTextNode.children.indexOf(obj);
  }
  getTextChildren() {
    return this.rootTextNode.getChildren();
  }
  clear() {
    this.rootTextNode.clear();
    const emptyStyledText = stringToStyledText("");
    this._text = emptyStyledText;
    this.updateTextBuffer(emptyStyledText);
    this.updateTextInfo();
    this.requestRender();
  }
  onLifecyclePass = () => {
    this.updateTextFromNodes();
  };
  onFgChanged(newColor) {
    this.rootTextNode.fg = newColor;
  }
  onBgChanged(newColor) {
    this.rootTextNode.bg = newColor;
  }
  onAttributesChanged(newAttributes) {
    this.rootTextNode.attributes = newAttributes;
  }
  destroy() {
    this.rootTextNode.children.length = 0;
    super.destroy();
  }
}

// src/renderables/Diff.ts
class DiffRenderable extends Renderable {
  _diff;
  _view;
  _parsedDiff = null;
  _parseError = null;
  _fg;
  _filetype;
  _syntaxStyle;
  _wrapMode;
  _conceal;
  _selectionBg;
  _selectionFg;
  _treeSitterClient;
  _showLineNumbers;
  _lineNumberFg;
  _lineNumberBg;
  _addedBg;
  _removedBg;
  _contextBg;
  _addedContentBg;
  _removedContentBg;
  _contextContentBg;
  _addedSignColor;
  _removedSignColor;
  _addedLineNumberBg;
  _removedLineNumberBg;
  leftSide = null;
  rightSide = null;
  leftSideAdded = false;
  rightSideAdded = false;
  leftCodeRenderable = null;
  rightCodeRenderable = null;
  pendingRebuild = false;
  _lastWidth = 0;
  errorTextRenderable = null;
  errorCodeRenderable = null;
  _waitingForHighlight = false;
  _lineInfoChangeHandler = null;
  constructor(ctx, options) {
    super(ctx, {
      ...options,
      flexDirection: options.view === "split" ? "row" : "column"
    });
    this._diff = options.diff ?? "";
    this._view = options.view ?? "unified";
    this._fg = options.fg ? parseColor(options.fg) : undefined;
    this._filetype = options.filetype;
    this._syntaxStyle = options.syntaxStyle;
    this._wrapMode = options.wrapMode;
    this._conceal = options.conceal ?? false;
    this._selectionBg = options.selectionBg ? parseColor(options.selectionBg) : undefined;
    this._selectionFg = options.selectionFg ? parseColor(options.selectionFg) : undefined;
    this._treeSitterClient = options.treeSitterClient;
    this._showLineNumbers = options.showLineNumbers ?? true;
    this._lineNumberFg = parseColor(options.lineNumberFg ?? "#888888");
    this._lineNumberBg = parseColor(options.lineNumberBg ?? "transparent");
    this._addedBg = parseColor(options.addedBg ?? "#1a4d1a");
    this._removedBg = parseColor(options.removedBg ?? "#4d1a1a");
    this._contextBg = parseColor(options.contextBg ?? "transparent");
    this._addedContentBg = options.addedContentBg ? parseColor(options.addedContentBg) : null;
    this._removedContentBg = options.removedContentBg ? parseColor(options.removedContentBg) : null;
    this._contextContentBg = options.contextContentBg ? parseColor(options.contextContentBg) : null;
    this._addedSignColor = parseColor(options.addedSignColor ?? "#22c55e");
    this._removedSignColor = parseColor(options.removedSignColor ?? "#ef4444");
    this._addedLineNumberBg = parseColor(options.addedLineNumberBg ?? "transparent");
    this._removedLineNumberBg = parseColor(options.removedLineNumberBg ?? "transparent");
    if (this._diff) {
      this.parseDiff();
      this.buildView();
    }
  }
  parseDiff() {
    if (!this._diff) {
      this._parsedDiff = null;
      this._parseError = null;
      return;
    }
    try {
      const patches = parsePatch(this._diff);
      if (patches.length === 0) {
        this._parsedDiff = null;
        this._parseError = null;
        return;
      }
      this._parsedDiff = patches[0];
      this._parseError = null;
    } catch (error) {
      this._parsedDiff = null;
      this._parseError = error instanceof Error ? error : new Error(String(error));
    }
  }
  buildView() {
    if (this._parseError) {
      this.buildErrorView();
      return;
    }
    if (!this._parsedDiff || this._parsedDiff.hunks.length === 0) {
      return;
    }
    if (this._view === "unified") {
      this.buildUnifiedView();
    } else {
      this.buildSplitView();
    }
  }
  onResize(width, height) {
    super.onResize(width, height);
    if (this._view === "split" && this._wrapMode !== "none" && this._wrapMode !== undefined) {
      if (this._lastWidth !== width) {
        this._lastWidth = width;
        this.requestRebuild();
      }
    }
  }
  requestRebuild() {
    if (this.pendingRebuild) {
      return;
    }
    this.pendingRebuild = true;
    queueMicrotask(() => {
      if (!this.isDestroyed && this.pendingRebuild) {
        this.pendingRebuild = false;
        this.buildView();
        this.requestRender();
      }
    });
  }
  rebuildView() {
    if (this._view === "split") {
      this.requestRebuild();
    } else {
      this.buildView();
    }
  }
  handleLineInfoChange = () => {
    if (!this._waitingForHighlight)
      return;
    if (!this.leftCodeRenderable || !this.rightCodeRenderable)
      return;
    const leftIsHighlighting = this.leftCodeRenderable.isHighlighting;
    const rightIsHighlighting = this.rightCodeRenderable.isHighlighting;
    if (!leftIsHighlighting && !rightIsHighlighting) {
      this._waitingForHighlight = false;
      this.requestRebuild();
    }
  };
  attachLineInfoListeners() {
    if (this._lineInfoChangeHandler)
      return;
    if (!this.leftCodeRenderable || !this.rightCodeRenderable)
      return;
    this._lineInfoChangeHandler = this.handleLineInfoChange;
    this.leftCodeRenderable.on("line-info-change", this._lineInfoChangeHandler);
    this.rightCodeRenderable.on("line-info-change", this._lineInfoChangeHandler);
  }
  detachLineInfoListeners() {
    if (!this._lineInfoChangeHandler)
      return;
    if (this.leftCodeRenderable) {
      this.leftCodeRenderable.off("line-info-change", this._lineInfoChangeHandler);
    }
    if (this.rightCodeRenderable) {
      this.rightCodeRenderable.off("line-info-change", this._lineInfoChangeHandler);
    }
    this._lineInfoChangeHandler = null;
  }
  destroyRecursively() {
    this.detachLineInfoListeners();
    this.pendingRebuild = false;
    this.leftSideAdded = false;
    this.rightSideAdded = false;
    super.destroyRecursively();
  }
  buildErrorView() {
    this.flexDirection = "column";
    if (this.leftSide && this.leftSideAdded) {
      super.remove(this.leftSide.id);
      this.leftSideAdded = false;
    }
    if (this.rightSide && this.rightSideAdded) {
      super.remove(this.rightSide.id);
      this.rightSideAdded = false;
    }
    const errorMessage = `Error parsing diff: ${this._parseError?.message || "Unknown error"}
`;
    if (!this.errorTextRenderable) {
      this.errorTextRenderable = new TextRenderable(this.ctx, {
        id: this.id ? `${this.id}-error-text` : undefined,
        content: errorMessage,
        fg: "#ef4444",
        width: "100%",
        flexShrink: 0
      });
      super.add(this.errorTextRenderable);
    } else {
      this.errorTextRenderable.content = errorMessage;
      const errorTextIndex = this.getChildren().indexOf(this.errorTextRenderable);
      if (errorTextIndex === -1) {
        super.add(this.errorTextRenderable);
      }
    }
    if (!this.errorCodeRenderable) {
      this.errorCodeRenderable = new CodeRenderable(this.ctx, {
        id: this.id ? `${this.id}-error-code` : undefined,
        content: this._diff,
        filetype: "diff",
        syntaxStyle: this._syntaxStyle ?? SyntaxStyle.create(),
        wrapMode: this._wrapMode,
        conceal: this._conceal,
        width: "100%",
        flexGrow: 1,
        flexShrink: 1,
        ...this._treeSitterClient !== undefined && { treeSitterClient: this._treeSitterClient }
      });
      super.add(this.errorCodeRenderable);
    } else {
      this.errorCodeRenderable.content = this._diff;
      this.errorCodeRenderable.wrapMode = this._wrapMode ?? "none";
      if (this._syntaxStyle) {
        this.errorCodeRenderable.syntaxStyle = this._syntaxStyle;
      }
      const errorCodeIndex = this.getChildren().indexOf(this.errorCodeRenderable);
      if (errorCodeIndex === -1) {
        super.add(this.errorCodeRenderable);
      }
    }
  }
  createOrUpdateCodeRenderable(side, content, wrapMode, drawUnstyledText) {
    const existingRenderable = side === "left" ? this.leftCodeRenderable : this.rightCodeRenderable;
    if (!existingRenderable) {
      const codeOptions = {
        id: this.id ? `${this.id}-${side}-code` : undefined,
        content,
        filetype: this._filetype,
        wrapMode,
        conceal: this._conceal,
        syntaxStyle: this._syntaxStyle ?? SyntaxStyle.create(),
        width: "100%",
        height: "100%",
        ...this._fg !== undefined && { fg: this._fg },
        ...drawUnstyledText !== undefined && { drawUnstyledText },
        ...this._selectionBg !== undefined && { selectionBg: this._selectionBg },
        ...this._selectionFg !== undefined && { selectionFg: this._selectionFg },
        ...this._treeSitterClient !== undefined && { treeSitterClient: this._treeSitterClient }
      };
      const newRenderable = new CodeRenderable(this.ctx, codeOptions);
      if (side === "left") {
        this.leftCodeRenderable = newRenderable;
      } else {
        this.rightCodeRenderable = newRenderable;
      }
      return newRenderable;
    } else {
      existingRenderable.content = content;
      existingRenderable.wrapMode = wrapMode ?? "none";
      existingRenderable.conceal = this._conceal;
      if (drawUnstyledText !== undefined) {
        existingRenderable.drawUnstyledText = drawUnstyledText;
      }
      if (this._filetype !== undefined) {
        existingRenderable.filetype = this._filetype;
      }
      if (this._syntaxStyle !== undefined) {
        existingRenderable.syntaxStyle = this._syntaxStyle;
      }
      if (this._selectionBg !== undefined) {
        existingRenderable.selectionBg = this._selectionBg;
      }
      if (this._selectionFg !== undefined) {
        existingRenderable.selectionFg = this._selectionFg;
      }
      if (this._fg !== undefined) {
        existingRenderable.fg = this._fg;
      }
      return existingRenderable;
    }
  }
  createOrUpdateSide(side, target, lineColors, lineSigns, lineNumbers, hideLineNumbers, width) {
    const sideRef = side === "left" ? this.leftSide : this.rightSide;
    const addedFlag = side === "left" ? this.leftSideAdded : this.rightSideAdded;
    if (!sideRef) {
      const newSide = new LineNumberRenderable(this.ctx, {
        id: this.id ? `${this.id}-${side}` : undefined,
        target,
        fg: this._lineNumberFg,
        bg: this._lineNumberBg,
        lineColors,
        lineSigns,
        lineNumbers,
        lineNumberOffset: 0,
        hideLineNumbers,
        width,
        height: "100%"
      });
      newSide.showLineNumbers = this._showLineNumbers;
      super.add(newSide);
      if (side === "left") {
        this.leftSide = newSide;
        this.leftSideAdded = true;
      } else {
        this.rightSide = newSide;
        this.rightSideAdded = true;
      }
    } else {
      sideRef.width = width;
      sideRef.setLineColors(lineColors);
      sideRef.setLineSigns(lineSigns);
      sideRef.setLineNumbers(lineNumbers);
      sideRef.setHideLineNumbers(hideLineNumbers);
      if (!addedFlag) {
        super.add(sideRef);
        if (side === "left") {
          this.leftSideAdded = true;
        } else {
          this.rightSideAdded = true;
        }
      }
    }
  }
  buildUnifiedView() {
    if (!this._parsedDiff)
      return;
    this.flexDirection = "column";
    if (this.errorTextRenderable) {
      const errorTextIndex = this.getChildren().indexOf(this.errorTextRenderable);
      if (errorTextIndex !== -1) {
        super.remove(this.errorTextRenderable.id);
      }
    }
    if (this.errorCodeRenderable) {
      const errorCodeIndex = this.getChildren().indexOf(this.errorCodeRenderable);
      if (errorCodeIndex !== -1) {
        super.remove(this.errorCodeRenderable.id);
      }
    }
    const contentLines = [];
    const lineColors = new Map;
    const lineSigns = new Map;
    const lineNumbers = new Map;
    let lineIndex = 0;
    for (const hunk of this._parsedDiff.hunks) {
      let oldLineNum = hunk.oldStart;
      let newLineNum = hunk.newStart;
      for (const line of hunk.lines) {
        const firstChar = line[0];
        const content2 = line.slice(1);
        if (firstChar === "+") {
          contentLines.push(content2);
          const config = {
            gutter: this._addedLineNumberBg
          };
          if (this._addedContentBg) {
            config.content = this._addedContentBg;
          } else {
            config.content = this._addedBg;
          }
          lineColors.set(lineIndex, config);
          lineSigns.set(lineIndex, {
            after: " +",
            afterColor: this._addedSignColor
          });
          lineNumbers.set(lineIndex, newLineNum);
          newLineNum++;
          lineIndex++;
        } else if (firstChar === "-") {
          contentLines.push(content2);
          const config = {
            gutter: this._removedLineNumberBg
          };
          if (this._removedContentBg) {
            config.content = this._removedContentBg;
          } else {
            config.content = this._removedBg;
          }
          lineColors.set(lineIndex, config);
          lineSigns.set(lineIndex, {
            after: " -",
            afterColor: this._removedSignColor
          });
          lineNumbers.set(lineIndex, oldLineNum);
          oldLineNum++;
          lineIndex++;
        } else if (firstChar === " ") {
          contentLines.push(content2);
          const config = {
            gutter: this._lineNumberBg
          };
          if (this._contextContentBg) {
            config.content = this._contextContentBg;
          } else {
            config.content = this._contextBg;
          }
          lineColors.set(lineIndex, config);
          lineNumbers.set(lineIndex, newLineNum);
          oldLineNum++;
          newLineNum++;
          lineIndex++;
        }
      }
    }
    const content = contentLines.join(`
`);
    const codeRenderable = this.createOrUpdateCodeRenderable("left", content, this._wrapMode);
    this.createOrUpdateSide("left", codeRenderable, lineColors, lineSigns, lineNumbers, new Set, "100%");
    if (this.rightSide && this.rightSideAdded) {
      super.remove(this.rightSide.id);
      this.rightSideAdded = false;
    }
  }
  buildSplitView() {
    if (!this._parsedDiff)
      return;
    this.flexDirection = "row";
    if (this.errorTextRenderable) {
      const errorTextIndex = this.getChildren().indexOf(this.errorTextRenderable);
      if (errorTextIndex !== -1) {
        super.remove(this.errorTextRenderable.id);
      }
    }
    if (this.errorCodeRenderable) {
      const errorCodeIndex = this.getChildren().indexOf(this.errorCodeRenderable);
      if (errorCodeIndex !== -1) {
        super.remove(this.errorCodeRenderable.id);
      }
    }
    const leftLogicalLines = [];
    const rightLogicalLines = [];
    for (const hunk of this._parsedDiff.hunks) {
      let oldLineNum = hunk.oldStart;
      let newLineNum = hunk.newStart;
      let i = 0;
      while (i < hunk.lines.length) {
        const line = hunk.lines[i];
        const firstChar = line[0];
        if (firstChar === " ") {
          const content = line.slice(1);
          leftLogicalLines.push({
            content,
            lineNum: oldLineNum,
            color: this._contextBg,
            type: "context"
          });
          rightLogicalLines.push({
            content,
            lineNum: newLineNum,
            color: this._contextBg,
            type: "context"
          });
          oldLineNum++;
          newLineNum++;
          i++;
        } else if (firstChar === "\\") {
          i++;
        } else {
          const removes = [];
          const adds = [];
          while (i < hunk.lines.length) {
            const currentLine = hunk.lines[i];
            const currentChar = currentLine[0];
            if (currentChar === " " || currentChar === "\\") {
              break;
            }
            const content = currentLine.slice(1);
            if (currentChar === "-") {
              removes.push({ content, lineNum: oldLineNum });
              oldLineNum++;
            } else if (currentChar === "+") {
              adds.push({ content, lineNum: newLineNum });
              newLineNum++;
            }
            i++;
          }
          const maxLength = Math.max(removes.length, adds.length);
          for (let j = 0;j < maxLength; j++) {
            if (j < removes.length) {
              leftLogicalLines.push({
                content: removes[j].content,
                lineNum: removes[j].lineNum,
                color: this._removedBg,
                sign: {
                  after: " -",
                  afterColor: this._removedSignColor
                },
                type: "remove"
              });
            } else {
              leftLogicalLines.push({
                content: "",
                hideLineNumber: true,
                type: "empty"
              });
            }
            if (j < adds.length) {
              rightLogicalLines.push({
                content: adds[j].content,
                lineNum: adds[j].lineNum,
                color: this._addedBg,
                sign: {
                  after: " +",
                  afterColor: this._addedSignColor
                },
                type: "add"
              });
            } else {
              rightLogicalLines.push({
                content: "",
                hideLineNumber: true,
                type: "empty"
              });
            }
          }
        }
      }
    }
    const canDoWrapAlignment = this.width > 0 && (this._wrapMode === "word" || this._wrapMode === "char");
    const preLeftContent = leftLogicalLines.map((l) => l.content).join(`
`);
    const preRightContent = rightLogicalLines.map((l) => l.content).join(`
`);
    const needsConsistentConcealing = (this._wrapMode === "word" || this._wrapMode === "char") && this._conceal && this._filetype;
    const drawUnstyledText = !needsConsistentConcealing;
    const leftCodeRenderable = this.createOrUpdateCodeRenderable("left", preLeftContent, this._wrapMode, drawUnstyledText);
    const rightCodeRenderable = this.createOrUpdateCodeRenderable("right", preRightContent, this._wrapMode, drawUnstyledText);
    let finalLeftLines;
    let finalRightLines;
    const leftIsHighlighting = leftCodeRenderable.isHighlighting;
    const rightIsHighlighting = rightCodeRenderable.isHighlighting;
    const highlightingInProgress = needsConsistentConcealing && (leftIsHighlighting || rightIsHighlighting);
    if (highlightingInProgress) {
      this._waitingForHighlight = true;
      this.attachLineInfoListeners();
    }
    const shouldDoAlignment = canDoWrapAlignment && !highlightingInProgress;
    if (shouldDoAlignment) {
      const leftLineInfo = leftCodeRenderable.lineInfo;
      const rightLineInfo = rightCodeRenderable.lineInfo;
      const leftSources = leftLineInfo.lineSources || [];
      const rightSources = rightLineInfo.lineSources || [];
      const leftVisualCounts = new Map;
      const rightVisualCounts = new Map;
      for (const logicalLine of leftSources) {
        leftVisualCounts.set(logicalLine, (leftVisualCounts.get(logicalLine) || 0) + 1);
      }
      for (const logicalLine of rightSources) {
        rightVisualCounts.set(logicalLine, (rightVisualCounts.get(logicalLine) || 0) + 1);
      }
      finalLeftLines = [];
      finalRightLines = [];
      let leftVisualPos = 0;
      let rightVisualPos = 0;
      for (let i = 0;i < leftLogicalLines.length; i++) {
        const leftLine = leftLogicalLines[i];
        const rightLine = rightLogicalLines[i];
        const leftVisualCount = leftVisualCounts.get(i) || 1;
        const rightVisualCount = rightVisualCounts.get(i) || 1;
        if (leftVisualPos < rightVisualPos) {
          const pad = rightVisualPos - leftVisualPos;
          for (let p = 0;p < pad; p++) {
            finalLeftLines.push({ content: "", hideLineNumber: true, type: "empty" });
          }
          leftVisualPos += pad;
        } else if (rightVisualPos < leftVisualPos) {
          const pad = leftVisualPos - rightVisualPos;
          for (let p = 0;p < pad; p++) {
            finalRightLines.push({ content: "", hideLineNumber: true, type: "empty" });
          }
          rightVisualPos += pad;
        }
        finalLeftLines.push(leftLine);
        finalRightLines.push(rightLine);
        leftVisualPos += leftVisualCount;
        rightVisualPos += rightVisualCount;
      }
      if (leftVisualPos < rightVisualPos) {
        const pad = rightVisualPos - leftVisualPos;
        for (let p = 0;p < pad; p++) {
          finalLeftLines.push({ content: "", hideLineNumber: true, type: "empty" });
        }
      } else if (rightVisualPos < leftVisualPos) {
        const pad = leftVisualPos - rightVisualPos;
        for (let p = 0;p < pad; p++) {
          finalRightLines.push({ content: "", hideLineNumber: true, type: "empty" });
        }
      }
    } else {
      finalLeftLines = leftLogicalLines;
      finalRightLines = rightLogicalLines;
    }
    const leftLineColors = new Map;
    const rightLineColors = new Map;
    const leftLineSigns = new Map;
    const rightLineSigns = new Map;
    const leftHideLineNumbers = new Set;
    const rightHideLineNumbers = new Set;
    const leftLineNumbers = new Map;
    const rightLineNumbers = new Map;
    finalLeftLines.forEach((line, index) => {
      if (line.lineNum !== undefined) {
        leftLineNumbers.set(index, line.lineNum);
      }
      if (line.hideLineNumber) {
        leftHideLineNumbers.add(index);
      }
      if (line.type === "remove") {
        const config = {
          gutter: this._removedLineNumberBg
        };
        if (this._removedContentBg) {
          config.content = this._removedContentBg;
        } else {
          config.content = this._removedBg;
        }
        leftLineColors.set(index, config);
      } else if (line.type === "context") {
        const config = {
          gutter: this._lineNumberBg
        };
        if (this._contextContentBg) {
          config.content = this._contextContentBg;
        } else {
          config.content = this._contextBg;
        }
        leftLineColors.set(index, config);
      }
      if (line.sign) {
        leftLineSigns.set(index, line.sign);
      }
    });
    finalRightLines.forEach((line, index) => {
      if (line.lineNum !== undefined) {
        rightLineNumbers.set(index, line.lineNum);
      }
      if (line.hideLineNumber) {
        rightHideLineNumbers.add(index);
      }
      if (line.type === "add") {
        const config = {
          gutter: this._addedLineNumberBg
        };
        if (this._addedContentBg) {
          config.content = this._addedContentBg;
        } else {
          config.content = this._addedBg;
        }
        rightLineColors.set(index, config);
      } else if (line.type === "context") {
        const config = {
          gutter: this._lineNumberBg
        };
        if (this._contextContentBg) {
          config.content = this._contextContentBg;
        } else {
          config.content = this._contextBg;
        }
        rightLineColors.set(index, config);
      }
      if (line.sign) {
        rightLineSigns.set(index, line.sign);
      }
    });
    const leftContentFinal = finalLeftLines.map((l) => l.content).join(`
`);
    const rightContentFinal = finalRightLines.map((l) => l.content).join(`
`);
    leftCodeRenderable.content = leftContentFinal;
    rightCodeRenderable.content = rightContentFinal;
    this.createOrUpdateSide("left", leftCodeRenderable, leftLineColors, leftLineSigns, leftLineNumbers, leftHideLineNumbers, "50%");
    this.createOrUpdateSide("right", rightCodeRenderable, rightLineColors, rightLineSigns, rightLineNumbers, rightHideLineNumbers, "50%");
  }
  get diff() {
    return this._diff;
  }
  set diff(value) {
    if (this._diff !== value) {
      this._diff = value;
      this._waitingForHighlight = false;
      this.parseDiff();
      this.rebuildView();
    }
  }
  get view() {
    return this._view;
  }
  set view(value) {
    if (this._view !== value) {
      this._view = value;
      this.flexDirection = value === "split" ? "row" : "column";
      this.buildView();
    }
  }
  get filetype() {
    return this._filetype;
  }
  set filetype(value) {
    if (this._filetype !== value) {
      this._filetype = value;
      this.rebuildView();
    }
  }
  get syntaxStyle() {
    return this._syntaxStyle;
  }
  set syntaxStyle(value) {
    if (this._syntaxStyle !== value) {
      this._syntaxStyle = value;
      this.rebuildView();
    }
  }
  get wrapMode() {
    return this._wrapMode;
  }
  set wrapMode(value) {
    if (this._wrapMode !== value) {
      this._wrapMode = value;
      if (this._view === "unified" && this.leftCodeRenderable) {
        this.leftCodeRenderable.wrapMode = value ?? "none";
      } else if (this._view === "split") {
        this.requestRebuild();
      }
    }
  }
  get showLineNumbers() {
    return this._showLineNumbers;
  }
  set showLineNumbers(value) {
    if (this._showLineNumbers !== value) {
      this._showLineNumbers = value;
      if (this.leftSide) {
        this.leftSide.showLineNumbers = value;
      }
      if (this.rightSide) {
        this.rightSide.showLineNumbers = value;
      }
    }
  }
  get addedBg() {
    return this._addedBg;
  }
  set addedBg(value) {
    const parsed = parseColor(value);
    if (this._addedBg !== parsed) {
      this._addedBg = parsed;
      this.rebuildView();
    }
  }
  get removedBg() {
    return this._removedBg;
  }
  set removedBg(value) {
    const parsed = parseColor(value);
    if (this._removedBg !== parsed) {
      this._removedBg = parsed;
      this.rebuildView();
    }
  }
  get contextBg() {
    return this._contextBg;
  }
  set contextBg(value) {
    const parsed = parseColor(value);
    if (this._contextBg !== parsed) {
      this._contextBg = parsed;
      this.rebuildView();
    }
  }
  get addedSignColor() {
    return this._addedSignColor;
  }
  set addedSignColor(value) {
    const parsed = parseColor(value);
    if (this._addedSignColor !== parsed) {
      this._addedSignColor = parsed;
      this.rebuildView();
    }
  }
  get removedSignColor() {
    return this._removedSignColor;
  }
  set removedSignColor(value) {
    const parsed = parseColor(value);
    if (this._removedSignColor !== parsed) {
      this._removedSignColor = parsed;
      this.rebuildView();
    }
  }
  get addedLineNumberBg() {
    return this._addedLineNumberBg;
  }
  set addedLineNumberBg(value) {
    const parsed = parseColor(value);
    if (this._addedLineNumberBg !== parsed) {
      this._addedLineNumberBg = parsed;
      this.rebuildView();
    }
  }
  get removedLineNumberBg() {
    return this._removedLineNumberBg;
  }
  set removedLineNumberBg(value) {
    const parsed = parseColor(value);
    if (this._removedLineNumberBg !== parsed) {
      this._removedLineNumberBg = parsed;
      this.rebuildView();
    }
  }
  get lineNumberFg() {
    return this._lineNumberFg;
  }
  set lineNumberFg(value) {
    const parsed = parseColor(value);
    if (this._lineNumberFg !== parsed) {
      this._lineNumberFg = parsed;
      this.rebuildView();
    }
  }
  get lineNumberBg() {
    return this._lineNumberBg;
  }
  set lineNumberBg(value) {
    const parsed = parseColor(value);
    if (this._lineNumberBg !== parsed) {
      this._lineNumberBg = parsed;
      this.rebuildView();
    }
  }
  get addedContentBg() {
    return this._addedContentBg;
  }
  set addedContentBg(value) {
    const parsed = value ? parseColor(value) : null;
    if (this._addedContentBg !== parsed) {
      this._addedContentBg = parsed;
      this.rebuildView();
    }
  }
  get removedContentBg() {
    return this._removedContentBg;
  }
  set removedContentBg(value) {
    const parsed = value ? parseColor(value) : null;
    if (this._removedContentBg !== parsed) {
      this._removedContentBg = parsed;
      this.rebuildView();
    }
  }
  get contextContentBg() {
    return this._contextContentBg;
  }
  set contextContentBg(value) {
    const parsed = value ? parseColor(value) : null;
    if (this._contextContentBg !== parsed) {
      this._contextContentBg = parsed;
      this.rebuildView();
    }
  }
  get selectionBg() {
    return this._selectionBg;
  }
  set selectionBg(value) {
    const parsed = value ? parseColor(value) : undefined;
    if (this._selectionBg !== parsed) {
      this._selectionBg = parsed;
      if (this.leftCodeRenderable) {
        this.leftCodeRenderable.selectionBg = parsed;
      }
      if (this.rightCodeRenderable) {
        this.rightCodeRenderable.selectionBg = parsed;
      }
    }
  }
  get selectionFg() {
    return this._selectionFg;
  }
  set selectionFg(value) {
    const parsed = value ? parseColor(value) : undefined;
    if (this._selectionFg !== parsed) {
      this._selectionFg = parsed;
      if (this.leftCodeRenderable) {
        this.leftCodeRenderable.selectionFg = parsed;
      }
      if (this.rightCodeRenderable) {
        this.rightCodeRenderable.selectionFg = parsed;
      }
    }
  }
  get conceal() {
    return this._conceal;
  }
  set conceal(value) {
    if (this._conceal !== value) {
      this._conceal = value;
      this.rebuildView();
    }
  }
  get fg() {
    return this._fg;
  }
  set fg(value) {
    const parsed = value ? parseColor(value) : undefined;
    if (this._fg !== parsed) {
      this._fg = parsed;
      if (this.leftCodeRenderable) {
        this.leftCodeRenderable.fg = parsed;
      }
      if (this.rightCodeRenderable) {
        this.rightCodeRenderable.fg = parsed;
      }
    }
  }
}
// src/renderables/EditBufferRenderable.ts
class EditBufferRenderable extends Renderable {
  _focusable = true;
  selectable = true;
  _textColor;
  _backgroundColor;
  _defaultAttributes;
  _selectionBg;
  _selectionFg;
  _wrapMode = "word";
  _scrollMargin = 0.2;
  _showCursor = true;
  _cursorColor;
  _cursorStyle;
  lastLocalSelection = null;
  _tabIndicator;
  _tabIndicatorColor;
  _cursorChangeListener = undefined;
  _contentChangeListener = undefined;
  _autoScrollVelocity = 0;
  _autoScrollAccumulator = 0;
  _scrollSpeed = 16;
  _keyboardSelectionActive = false;
  editBuffer;
  editorView;
  _defaultOptions = {
    textColor: RGBA.fromValues(1, 1, 1, 1),
    backgroundColor: "transparent",
    selectionBg: undefined,
    selectionFg: undefined,
    selectable: true,
    attributes: 0,
    wrapMode: "word",
    scrollMargin: 0.2,
    scrollSpeed: 16,
    showCursor: true,
    cursorColor: RGBA.fromValues(1, 1, 1, 1),
    cursorStyle: {
      style: "block",
      blinking: true
    },
    tabIndicator: undefined,
    tabIndicatorColor: undefined
  };
  constructor(ctx, options) {
    super(ctx, options);
    this._textColor = parseColor(options.textColor ?? this._defaultOptions.textColor);
    this._backgroundColor = parseColor(options.backgroundColor ?? this._defaultOptions.backgroundColor);
    this._defaultAttributes = options.attributes ?? this._defaultOptions.attributes;
    this._selectionBg = options.selectionBg ? parseColor(options.selectionBg) : this._defaultOptions.selectionBg;
    this._selectionFg = options.selectionFg ? parseColor(options.selectionFg) : this._defaultOptions.selectionFg;
    this.selectable = options.selectable ?? this._defaultOptions.selectable;
    this._wrapMode = options.wrapMode ?? this._defaultOptions.wrapMode;
    this._scrollMargin = options.scrollMargin ?? this._defaultOptions.scrollMargin;
    this._scrollSpeed = options.scrollSpeed ?? this._defaultOptions.scrollSpeed;
    this._showCursor = options.showCursor ?? this._defaultOptions.showCursor;
    this._cursorColor = parseColor(options.cursorColor ?? this._defaultOptions.cursorColor);
    this._cursorStyle = options.cursorStyle ?? this._defaultOptions.cursorStyle;
    this._tabIndicator = options.tabIndicator ?? this._defaultOptions.tabIndicator;
    this._tabIndicatorColor = options.tabIndicatorColor ? parseColor(options.tabIndicatorColor) : this._defaultOptions.tabIndicatorColor;
    this.editBuffer = EditBuffer.create(this._ctx.widthMethod);
    this.editorView = EditorView.create(this.editBuffer, this.width || 80, this.height || 24);
    this.editorView.setWrapMode(this._wrapMode);
    this.editorView.setScrollMargin(this._scrollMargin);
    this.editBuffer.setDefaultFg(this._textColor);
    this.editBuffer.setDefaultBg(this._backgroundColor);
    this.editBuffer.setDefaultAttributes(this._defaultAttributes);
    if (options.syntaxStyle) {
      this.editBuffer.setSyntaxStyle(options.syntaxStyle);
    }
    if (this._tabIndicator !== undefined) {
      this.editorView.setTabIndicator(this._tabIndicator);
    }
    if (this._tabIndicatorColor !== undefined) {
      this.editorView.setTabIndicatorColor(this._tabIndicatorColor);
    }
    this.setupMeasureFunc();
    this.setupEventListeners(options);
  }
  get lineInfo() {
    return this.editorView.getLogicalLineInfo();
  }
  setupEventListeners(options) {
    this._cursorChangeListener = options.onCursorChange;
    this._contentChangeListener = options.onContentChange;
    this.editBuffer.on("cursor-changed", () => {
      if (this._cursorChangeListener) {
        const cursor = this.editBuffer.getCursorPosition();
        this._cursorChangeListener({
          line: cursor.row,
          visualColumn: cursor.col
        });
      }
    });
    this.editBuffer.on("content-changed", () => {
      this.yogaNode.markDirty();
      this.requestRender();
      this.emit("line-info-change");
      if (this._contentChangeListener) {
        this._contentChangeListener({});
      }
    });
  }
  get lineCount() {
    return this.editBuffer.getLineCount();
  }
  get virtualLineCount() {
    return this.editorView.getVirtualLineCount();
  }
  get scrollY() {
    return this.editorView.getViewport().offsetY;
  }
  get plainText() {
    return this.editBuffer.getText();
  }
  get logicalCursor() {
    return this.editBuffer.getCursorPosition();
  }
  get visualCursor() {
    return this.editorView.getVisualCursor();
  }
  get cursorOffset() {
    return this.editorView.getVisualCursor().offset;
  }
  set cursorOffset(offset) {
    this.editorView.setCursorByOffset(offset);
    this.requestRender();
  }
  get textColor() {
    return this._textColor;
  }
  set textColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.textColor);
    if (this._textColor !== newColor) {
      this._textColor = newColor;
      this.editBuffer.setDefaultFg(newColor);
      this.requestRender();
    }
  }
  get selectionBg() {
    return this._selectionBg;
  }
  set selectionBg(value) {
    const newColor = value ? parseColor(value) : this._defaultOptions.selectionBg;
    if (this._selectionBg !== newColor) {
      this._selectionBg = newColor;
      if (this.lastLocalSelection) {
        this.updateLocalSelection(this.lastLocalSelection);
      }
      this.requestRender();
    }
  }
  get selectionFg() {
    return this._selectionFg;
  }
  set selectionFg(value) {
    const newColor = value ? parseColor(value) : this._defaultOptions.selectionFg;
    if (this._selectionFg !== newColor) {
      this._selectionFg = newColor;
      if (this.lastLocalSelection) {
        this.updateLocalSelection(this.lastLocalSelection);
      }
      this.requestRender();
    }
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.backgroundColor);
    if (this._backgroundColor !== newColor) {
      this._backgroundColor = newColor;
      this.editBuffer.setDefaultBg(newColor);
      this.requestRender();
    }
  }
  get attributes() {
    return this._defaultAttributes;
  }
  set attributes(value) {
    if (this._defaultAttributes !== value) {
      this._defaultAttributes = value;
      this.editBuffer.setDefaultAttributes(value);
      this.requestRender();
    }
  }
  get wrapMode() {
    return this._wrapMode;
  }
  set wrapMode(value) {
    if (this._wrapMode !== value) {
      this._wrapMode = value;
      this.editorView.setWrapMode(value);
      this.yogaNode.markDirty();
      this.requestRender();
    }
  }
  get showCursor() {
    return this._showCursor;
  }
  set showCursor(value) {
    if (this._showCursor !== value) {
      this._showCursor = value;
      if (!value && this._focused) {
        this._ctx.setCursorPosition(0, 0, false);
      }
      this.requestRender();
    }
  }
  get cursorColor() {
    return this._cursorColor;
  }
  set cursorColor(value) {
    const newColor = parseColor(value);
    if (this._cursorColor !== newColor) {
      this._cursorColor = newColor;
      if (this._focused) {
        this.requestRender();
      }
    }
  }
  get cursorStyle() {
    return this._cursorStyle;
  }
  set cursorStyle(style) {
    const newStyle = style;
    if (this.cursorStyle.style !== newStyle.style || this.cursorStyle.blinking !== newStyle.blinking) {
      this._cursorStyle = newStyle;
      if (this._focused) {
        this.requestRender();
      }
    }
  }
  get tabIndicator() {
    return this._tabIndicator;
  }
  set tabIndicator(value) {
    if (this._tabIndicator !== value) {
      this._tabIndicator = value;
      if (value !== undefined) {
        this.editorView.setTabIndicator(value);
      }
      this.requestRender();
    }
  }
  get tabIndicatorColor() {
    return this._tabIndicatorColor;
  }
  set tabIndicatorColor(value) {
    const newColor = value ? parseColor(value) : undefined;
    if (this._tabIndicatorColor !== newColor) {
      this._tabIndicatorColor = newColor;
      if (newColor !== undefined) {
        this.editorView.setTabIndicatorColor(newColor);
      }
      this.requestRender();
    }
  }
  get scrollSpeed() {
    return this._scrollSpeed;
  }
  set scrollSpeed(value) {
    this._scrollSpeed = Math.max(0, value);
  }
  onMouseEvent(event) {
    if (event.type === "scroll") {
      this.handleScroll(event);
    }
  }
  handleScroll(event) {
    if (!event.scroll)
      return;
    const { direction, delta } = event.scroll;
    const viewport = this.editorView.getViewport();
    if (direction === "up") {
      const newOffsetY = Math.max(0, viewport.offsetY - delta);
      this.editorView.setViewport(viewport.offsetX, newOffsetY, viewport.width, viewport.height, true);
      this.requestRender();
    } else if (direction === "down") {
      const totalVirtualLines = this.editorView.getTotalVirtualLineCount();
      const maxOffsetY = Math.max(0, totalVirtualLines - viewport.height);
      const newOffsetY = Math.min(viewport.offsetY + delta, maxOffsetY);
      this.editorView.setViewport(viewport.offsetX, newOffsetY, viewport.width, viewport.height, true);
      this.requestRender();
    }
    if (this._wrapMode === "none") {
      if (direction === "left") {
        const newOffsetX = Math.max(0, viewport.offsetX - delta);
        this.editorView.setViewport(newOffsetX, viewport.offsetY, viewport.width, viewport.height, true);
        this.requestRender();
      } else if (direction === "right") {
        const newOffsetX = viewport.offsetX + delta;
        this.editorView.setViewport(newOffsetX, viewport.offsetY, viewport.width, viewport.height, true);
        this.requestRender();
      }
    }
  }
  onResize(width, height) {
    this.editorView.setViewportSize(width, height);
  }
  refreshLocalSelection() {
    if (this.lastLocalSelection) {
      return this.updateLocalSelection(this.lastLocalSelection);
    }
    return false;
  }
  updateLocalSelection(localSelection) {
    if (!localSelection?.isActive) {
      this.editorView.resetLocalSelection();
      return true;
    }
    return this.editorView.setLocalSelection(localSelection.anchorX, localSelection.anchorY, localSelection.focusX, localSelection.focusY, this._selectionBg, this._selectionFg, false);
  }
  shouldStartSelection(x, y) {
    if (!this.selectable)
      return false;
    const localX = x - this.x;
    const localY = y - this.y;
    return localX >= 0 && localX < this.width && localY >= 0 && localY < this.height;
  }
  onSelectionChanged(selection) {
    const localSelection = convertGlobalToLocalSelection(selection, this.x, this.y);
    this.lastLocalSelection = localSelection;
    const updateCursor = true;
    const followCursor = this._keyboardSelectionActive;
    let changed;
    if (!localSelection?.isActive) {
      this._keyboardSelectionActive = false;
      this.editorView.resetLocalSelection();
      changed = true;
    } else if (selection?.isStart) {
      changed = this.editorView.setLocalSelection(localSelection.anchorX, localSelection.anchorY, localSelection.focusX, localSelection.focusY, this._selectionBg, this._selectionFg, updateCursor, followCursor);
    } else {
      changed = this.editorView.updateLocalSelection(localSelection.anchorX, localSelection.anchorY, localSelection.focusX, localSelection.focusY, this._selectionBg, this._selectionFg, updateCursor, followCursor);
    }
    if (changed && localSelection?.isActive && selection?.isSelecting) {
      const viewport = this.editorView.getViewport();
      const focusY = localSelection.focusY;
      const scrollMargin = Math.max(1, Math.floor(viewport.height * this._scrollMargin));
      if (focusY < scrollMargin) {
        this._autoScrollVelocity = -this._scrollSpeed;
      } else if (focusY >= viewport.height - scrollMargin) {
        this._autoScrollVelocity = this._scrollSpeed;
      } else {
        this._autoScrollVelocity = 0;
      }
    } else {
      this._keyboardSelectionActive = false;
      this._autoScrollVelocity = 0;
      this._autoScrollAccumulator = 0;
    }
    if (changed) {
      this.requestRender();
    }
    return this.hasSelection();
  }
  onUpdate(deltaTime) {
    super.onUpdate(deltaTime);
    if (this._autoScrollVelocity !== 0 && this.hasSelection()) {
      const deltaSeconds = deltaTime / 1000;
      this._autoScrollAccumulator += this._autoScrollVelocity * deltaSeconds;
      const linesToScroll = Math.floor(Math.abs(this._autoScrollAccumulator));
      if (linesToScroll > 0) {
        const direction = this._autoScrollVelocity > 0 ? 1 : -1;
        const viewport = this.editorView.getViewport();
        const totalVirtualLines = this.editorView.getTotalVirtualLineCount();
        const maxOffsetY = Math.max(0, totalVirtualLines - viewport.height);
        const newOffsetY = Math.max(0, Math.min(viewport.offsetY + direction * linesToScroll, maxOffsetY));
        if (newOffsetY !== viewport.offsetY) {
          this.editorView.setViewport(viewport.offsetX, newOffsetY, viewport.width, viewport.height, false);
          this._ctx.requestSelectionUpdate();
        }
        this._autoScrollAccumulator -= direction * linesToScroll;
      }
    }
  }
  getSelectedText() {
    return this.editorView.getSelectedText();
  }
  hasSelection() {
    return this.editorView.hasSelection();
  }
  getSelection() {
    return this.editorView.getSelection();
  }
  setupMeasureFunc() {
    const measureFunc = (width, widthMode, height, heightMode) => {
      let effectiveWidth;
      if (widthMode === MeasureMode.Undefined || isNaN(width)) {
        effectiveWidth = 0;
      } else {
        effectiveWidth = width;
      }
      const effectiveHeight = isNaN(height) ? 1 : height;
      const measureResult = this.editorView.measureForDimensions(Math.floor(effectiveWidth), Math.floor(effectiveHeight));
      const measuredWidth = measureResult ? Math.max(1, measureResult.maxWidth) : 1;
      const measuredHeight = measureResult ? Math.max(1, measureResult.lineCount) : 1;
      if (widthMode === MeasureMode.AtMost && this._positionType !== "absolute") {
        return {
          width: Math.min(effectiveWidth, measuredWidth),
          height: Math.min(effectiveHeight, measuredHeight)
        };
      }
      return {
        width: measuredWidth,
        height: measuredHeight
      };
    };
    this.yogaNode.setMeasureFunc(measureFunc);
  }
  render(buffer, deltaTime) {
    if (!this.visible)
      return;
    if (this.isDestroyed)
      return;
    this.markClean();
    this._ctx.addToHitGrid(this.x, this.y, this.width, this.height, this.num);
    this.renderSelf(buffer);
    this.renderCursor(buffer);
  }
  renderSelf(buffer) {
    buffer.drawEditorView(this.editorView, this.x, this.y);
  }
  renderCursor(buffer) {
    if (!this._showCursor || !this._focused)
      return;
    const visualCursor = this.editorView.getVisualCursor();
    const cursorX = this.x + visualCursor.visualCol + 1;
    const cursorY = this.y + visualCursor.visualRow + 1;
    this._ctx.setCursorPosition(cursorX, cursorY, true);
    this._ctx.setCursorColor(this._cursorColor);
    this._ctx.setCursorStyle(this._cursorStyle.style, this._cursorStyle.blinking);
  }
  focus() {
    super.focus();
    this._ctx.setCursorStyle(this._cursorStyle.style, this._cursorStyle.blinking);
    this._ctx.setCursorColor(this._cursorColor);
    this.requestRender();
  }
  blur() {
    super.blur();
    this._ctx.setCursorPosition(0, 0, false);
    this.requestRender();
  }
  onRemove() {
    if (this._focused) {
      this._ctx.setCursorPosition(0, 0, false);
    }
  }
  destroy() {
    if (this.isDestroyed)
      return;
    if (this._focused) {
      this._ctx.setCursorPosition(0, 0, false);
      this.blur();
    }
    this.editorView.destroy();
    this.editBuffer.destroy();
    super.destroy();
  }
  set onCursorChange(handler) {
    this._cursorChangeListener = handler;
  }
  get onCursorChange() {
    return this._cursorChangeListener;
  }
  set onContentChange(handler) {
    this._contentChangeListener = handler;
  }
  get onContentChange() {
    return this._contentChangeListener;
  }
  get syntaxStyle() {
    return this.editBuffer.getSyntaxStyle();
  }
  set syntaxStyle(style) {
    this.editBuffer.setSyntaxStyle(style);
    this.requestRender();
  }
  addHighlight(lineIdx, highlight) {
    this.editBuffer.addHighlight(lineIdx, highlight);
    this.requestRender();
  }
  addHighlightByCharRange(highlight) {
    this.editBuffer.addHighlightByCharRange(highlight);
    this.requestRender();
  }
  removeHighlightsByRef(hlRef) {
    this.editBuffer.removeHighlightsByRef(hlRef);
    this.requestRender();
  }
  clearLineHighlights(lineIdx) {
    this.editBuffer.clearLineHighlights(lineIdx);
    this.requestRender();
  }
  clearAllHighlights() {
    this.editBuffer.clearAllHighlights();
    this.requestRender();
  }
  getLineHighlights(lineIdx) {
    return this.editBuffer.getLineHighlights(lineIdx);
  }
  setText(text) {
    this.editBuffer.setText(text);
    this.yogaNode.markDirty();
    this.requestRender();
  }
  replaceText(text) {
    this.editBuffer.replaceText(text);
    this.yogaNode.markDirty();
    this.requestRender();
  }
  clear() {
    this.editBuffer.clear();
    this.editBuffer.clearAllHighlights();
    this.yogaNode.markDirty();
    this.requestRender();
  }
  deleteRange(startLine, startCol, endLine, endCol) {
    this.editBuffer.deleteRange(startLine, startCol, endLine, endCol);
    this.yogaNode.markDirty();
    this.requestRender();
  }
  insertText(text) {
    this.editBuffer.insertText(text);
    this.yogaNode.markDirty();
    this.requestRender();
  }
  getTextRange(startOffset, endOffset) {
    return this.editBuffer.getTextRange(startOffset, endOffset);
  }
  getTextRangeByCoords(startRow, startCol, endRow, endCol) {
    return this.editBuffer.getTextRangeByCoords(startRow, startCol, endRow, endCol);
  }
  updateSelectionForMovement(shiftPressed, isBeforeMovement) {
    if (!this.selectable)
      return;
    if (!shiftPressed) {
      this._keyboardSelectionActive = false;
      this._ctx.clearSelection();
      return;
    }
    this._keyboardSelectionActive = true;
    const visualCursor = this.editorView.getVisualCursor();
    const cursorX = this.x + visualCursor.visualCol;
    const cursorY = this.y + visualCursor.visualRow;
    if (isBeforeMovement) {
      if (!this._ctx.hasSelection) {
        this._ctx.startSelection(this, cursorX, cursorY);
      }
      return;
    }
    this._ctx.updateSelection(this, cursorX, cursorY);
  }
}

// src/renderables/Textarea.ts
var defaultTextareaKeybindings = [
  { name: "left", action: "move-left" },
  { name: "right", action: "move-right" },
  { name: "up", action: "move-up" },
  { name: "down", action: "move-down" },
  { name: "left", shift: true, action: "select-left" },
  { name: "right", shift: true, action: "select-right" },
  { name: "up", shift: true, action: "select-up" },
  { name: "down", shift: true, action: "select-down" },
  { name: "home", action: "buffer-home" },
  { name: "end", action: "buffer-end" },
  { name: "home", shift: true, action: "select-buffer-home" },
  { name: "end", shift: true, action: "select-buffer-end" },
  { name: "a", ctrl: true, action: "line-home" },
  { name: "e", ctrl: true, action: "line-end" },
  { name: "a", ctrl: true, shift: true, action: "select-line-home" },
  { name: "e", ctrl: true, shift: true, action: "select-line-end" },
  { name: "a", meta: true, action: "visual-line-home" },
  { name: "e", meta: true, action: "visual-line-end" },
  { name: "a", meta: true, shift: true, action: "select-visual-line-home" },
  { name: "e", meta: true, shift: true, action: "select-visual-line-end" },
  { name: "f", ctrl: true, action: "move-right" },
  { name: "b", ctrl: true, action: "move-left" },
  { name: "w", ctrl: true, action: "delete-word-backward" },
  { name: "backspace", ctrl: true, action: "delete-word-backward" },
  { name: "d", meta: true, action: "delete-word-forward" },
  { name: "delete", meta: true, action: "delete-word-forward" },
  { name: "delete", ctrl: true, action: "delete-word-forward" },
  { name: "d", ctrl: true, shift: true, action: "delete-line" },
  { name: "k", ctrl: true, action: "delete-to-line-end" },
  { name: "u", ctrl: true, action: "delete-to-line-start" },
  { name: "backspace", action: "backspace" },
  { name: "backspace", shift: true, action: "backspace" },
  { name: "d", ctrl: true, action: "delete" },
  { name: "delete", action: "delete" },
  { name: "delete", shift: true, action: "delete" },
  { name: "return", action: "newline" },
  { name: "linefeed", action: "newline" },
  { name: "return", meta: true, action: "submit" },
  { name: "-", ctrl: true, action: "undo" },
  { name: ".", ctrl: true, action: "redo" },
  { name: "z", super: true, action: "undo" },
  { name: "z", super: true, shift: true, action: "redo" },
  { name: "f", meta: true, action: "word-forward" },
  { name: "b", meta: true, action: "word-backward" },
  { name: "right", meta: true, action: "word-forward" },
  { name: "left", meta: true, action: "word-backward" },
  { name: "right", ctrl: true, action: "word-forward" },
  { name: "left", ctrl: true, action: "word-backward" },
  { name: "f", meta: true, shift: true, action: "select-word-forward" },
  { name: "b", meta: true, shift: true, action: "select-word-backward" },
  { name: "right", meta: true, shift: true, action: "select-word-forward" },
  { name: "left", meta: true, shift: true, action: "select-word-backward" },
  { name: "backspace", meta: true, action: "delete-word-backward" },
  { name: "left", super: true, action: "visual-line-home" },
  { name: "right", super: true, action: "visual-line-end" },
  { name: "up", super: true, action: "buffer-home" },
  { name: "down", super: true, action: "buffer-end" },
  { name: "left", super: true, shift: true, action: "select-visual-line-home" },
  { name: "right", super: true, shift: true, action: "select-visual-line-end" },
  { name: "up", super: true, shift: true, action: "select-buffer-home" },
  { name: "down", super: true, shift: true, action: "select-buffer-end" }
];

class TextareaRenderable extends EditBufferRenderable {
  _placeholder;
  _placeholderColor;
  _unfocusedBackgroundColor;
  _unfocusedTextColor;
  _focusedBackgroundColor;
  _focusedTextColor;
  _keyBindingsMap;
  _keyAliasMap;
  _keyBindings;
  _actionHandlers;
  _initialValueSet = false;
  _submitListener = undefined;
  static defaults = {
    backgroundColor: "transparent",
    textColor: "#FFFFFF",
    focusedBackgroundColor: "transparent",
    focusedTextColor: "#FFFFFF",
    placeholder: null,
    placeholderColor: "#666666"
  };
  constructor(ctx, options) {
    const defaults = TextareaRenderable.defaults;
    const baseOptions = {
      ...options,
      backgroundColor: options.backgroundColor || defaults.backgroundColor,
      textColor: options.textColor || defaults.textColor
    };
    super(ctx, baseOptions);
    this._unfocusedBackgroundColor = parseColor(options.backgroundColor || defaults.backgroundColor);
    this._unfocusedTextColor = parseColor(options.textColor || defaults.textColor);
    this._focusedBackgroundColor = parseColor(options.focusedBackgroundColor || options.backgroundColor || defaults.focusedBackgroundColor);
    this._focusedTextColor = parseColor(options.focusedTextColor || options.textColor || defaults.focusedTextColor);
    this._placeholder = options.placeholder ?? defaults.placeholder;
    this._placeholderColor = parseColor(options.placeholderColor ?? defaults.placeholderColor);
    this._keyAliasMap = mergeKeyAliases(defaultKeyAliases, options.keyAliasMap || {});
    this._keyBindings = options.keyBindings || [];
    const mergedBindings = mergeKeyBindings(defaultTextareaKeybindings, this._keyBindings);
    this._keyBindingsMap = buildKeyBindingsMap(mergedBindings, this._keyAliasMap);
    this._actionHandlers = this.buildActionHandlers();
    this._submitListener = options.onSubmit;
    if (options.initialValue) {
      this.setText(options.initialValue);
      this._initialValueSet = true;
    }
    this.updateColors();
    this.applyPlaceholder(this._placeholder);
  }
  applyPlaceholder(placeholder) {
    if (placeholder === null) {
      this.editorView.setPlaceholderStyledText([]);
      return;
    }
    if (typeof placeholder === "string") {
      const colorStyle = fg(this._placeholderColor);
      const chunks = [colorStyle(placeholder)];
      this.editorView.setPlaceholderStyledText(chunks);
    } else {
      this.editorView.setPlaceholderStyledText(placeholder.chunks);
    }
  }
  buildActionHandlers() {
    return new Map([
      ["move-left", () => this.moveCursorLeft()],
      ["move-right", () => this.moveCursorRight()],
      ["move-up", () => this.moveCursorUp()],
      ["move-down", () => this.moveCursorDown()],
      ["select-left", () => this.moveCursorLeft({ select: true })],
      ["select-right", () => this.moveCursorRight({ select: true })],
      ["select-up", () => this.moveCursorUp({ select: true })],
      ["select-down", () => this.moveCursorDown({ select: true })],
      ["line-home", () => this.gotoLineHome()],
      ["line-end", () => this.gotoLineEnd()],
      ["select-line-home", () => this.gotoLineHome({ select: true })],
      ["select-line-end", () => this.gotoLineEnd({ select: true })],
      ["visual-line-home", () => this.gotoVisualLineHome()],
      ["visual-line-end", () => this.gotoVisualLineEnd()],
      ["select-visual-line-home", () => this.gotoVisualLineHome({ select: true })],
      ["select-visual-line-end", () => this.gotoVisualLineEnd({ select: true })],
      ["select-buffer-home", () => this.gotoBufferHome({ select: true })],
      ["select-buffer-end", () => this.gotoBufferEnd({ select: true })],
      ["buffer-home", () => this.gotoBufferHome()],
      ["buffer-end", () => this.gotoBufferEnd()],
      ["delete-line", () => this.deleteLine()],
      ["delete-to-line-end", () => this.deleteToLineEnd()],
      ["delete-to-line-start", () => this.deleteToLineStart()],
      ["backspace", () => this.deleteCharBackward()],
      ["delete", () => this.deleteChar()],
      ["newline", () => this.newLine()],
      ["undo", () => this.undo()],
      ["redo", () => this.redo()],
      ["word-forward", () => this.moveWordForward()],
      ["word-backward", () => this.moveWordBackward()],
      ["select-word-forward", () => this.moveWordForward({ select: true })],
      ["select-word-backward", () => this.moveWordBackward({ select: true })],
      ["delete-word-forward", () => this.deleteWordForward()],
      ["delete-word-backward", () => this.deleteWordBackward()],
      ["submit", () => this.submit()]
    ]);
  }
  handlePaste(event) {
    this.insertText(event.text);
  }
  handleKeyPress(key) {
    const bindingKey = getKeyBindingKey({
      name: key.name,
      ctrl: key.ctrl,
      shift: key.shift,
      meta: key.meta,
      super: key.super,
      action: "move-left"
    });
    const action = this._keyBindingsMap.get(bindingKey);
    if (action) {
      const handler = this._actionHandlers.get(action);
      if (handler) {
        return handler();
      }
    }
    if (!key.ctrl && !key.meta && !key.super && !key.hyper) {
      if (key.name === "space") {
        this.insertText(" ");
        return true;
      }
      if (key.sequence) {
        const firstCharCode = key.sequence.charCodeAt(0);
        if (firstCharCode < 32) {
          return false;
        }
        if (firstCharCode === 127) {
          return false;
        }
        this.insertText(key.sequence);
        return true;
      }
    }
    return false;
  }
  updateColors() {
    const effectiveBg = this._focused ? this._focusedBackgroundColor : this._unfocusedBackgroundColor;
    const effectiveFg = this._focused ? this._focusedTextColor : this._unfocusedTextColor;
    super.backgroundColor = effectiveBg;
    super.textColor = effectiveFg;
  }
  insertChar(char) {
    if (this.hasSelection()) {
      this.deleteSelectedText();
    }
    this.editBuffer.insertChar(char);
    this.requestRender();
  }
  insertText(text) {
    if (this.hasSelection()) {
      this.deleteSelectedText();
    }
    this.editBuffer.insertText(text);
    this.requestRender();
  }
  deleteChar() {
    if (this.hasSelection()) {
      this.deleteSelectedText();
      return true;
    }
    this._ctx.clearSelection();
    this.editBuffer.deleteChar();
    this.requestRender();
    return true;
  }
  deleteCharBackward() {
    if (this.hasSelection()) {
      this.deleteSelectedText();
      return true;
    }
    this._ctx.clearSelection();
    this.editBuffer.deleteCharBackward();
    this.requestRender();
    return true;
  }
  deleteSelectedText() {
    this.editorView.deleteSelectedText();
    this._ctx.clearSelection();
    this.requestRender();
  }
  newLine() {
    this._ctx.clearSelection();
    this.editBuffer.newLine();
    this.requestRender();
    return true;
  }
  deleteLine() {
    this._ctx.clearSelection();
    this.editBuffer.deleteLine();
    this.requestRender();
    return true;
  }
  moveCursorLeft(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    this.editBuffer.moveCursorLeft();
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  moveCursorRight(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    this.editBuffer.moveCursorRight();
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  moveCursorUp(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    this.editorView.moveUpVisual();
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  moveCursorDown(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    this.editorView.moveDownVisual();
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  gotoLine(line) {
    this.editBuffer.gotoLine(line);
    this.requestRender();
  }
  gotoLineHome(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    const cursor = this.editorView.getCursor();
    if (cursor.col === 0 && cursor.row > 0) {
      this.editBuffer.setCursor(cursor.row - 1, 0);
      const prevLineEol = this.editBuffer.getEOL();
      this.editBuffer.setCursor(prevLineEol.row, prevLineEol.col);
    } else {
      this.editBuffer.setCursor(cursor.row, 0);
    }
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  gotoLineEnd(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    const cursor = this.editorView.getCursor();
    const eol = this.editBuffer.getEOL();
    const lineCount = this.editBuffer.getLineCount();
    if (cursor.col === eol.col && cursor.row < lineCount - 1) {
      this.editBuffer.setCursor(cursor.row + 1, 0);
    } else {
      this.editBuffer.setCursor(eol.row, eol.col);
    }
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  gotoVisualLineHome(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    const sol = this.editorView.getVisualSOL();
    this.editBuffer.setCursor(sol.logicalRow, sol.logicalCol);
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  gotoVisualLineEnd(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    const eol = this.editorView.getVisualEOL();
    this.editBuffer.setCursor(eol.logicalRow, eol.logicalCol);
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  gotoBufferHome(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    this.editBuffer.setCursor(0, 0);
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  gotoBufferEnd(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    this.editBuffer.gotoLine(999999);
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  deleteToLineEnd() {
    const cursor = this.editorView.getCursor();
    const eol = this.editBuffer.getEOL();
    if (eol.col > cursor.col) {
      this.editBuffer.deleteRange(cursor.row, cursor.col, eol.row, eol.col);
    }
    this.requestRender();
    return true;
  }
  deleteToLineStart() {
    const cursor = this.editorView.getCursor();
    if (cursor.col > 0) {
      this.editBuffer.deleteRange(cursor.row, 0, cursor.row, cursor.col);
    }
    this.requestRender();
    return true;
  }
  undo() {
    this._ctx.clearSelection();
    this.editBuffer.undo();
    this.requestRender();
    return true;
  }
  redo() {
    this._ctx.clearSelection();
    this.editBuffer.redo();
    this.requestRender();
    return true;
  }
  moveWordForward(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    const nextWord = this.editBuffer.getNextWordBoundary();
    this.editBuffer.setCursorByOffset(nextWord.offset);
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  moveWordBackward(options) {
    const select = options?.select ?? false;
    this.updateSelectionForMovement(select, true);
    const prevWord = this.editBuffer.getPrevWordBoundary();
    this.editBuffer.setCursorByOffset(prevWord.offset);
    this.updateSelectionForMovement(select, false);
    this.requestRender();
    return true;
  }
  deleteWordForward() {
    if (this.hasSelection()) {
      this.deleteSelectedText();
      return true;
    }
    const currentCursor = this.editBuffer.getCursorPosition();
    const nextWord = this.editBuffer.getNextWordBoundary();
    if (nextWord.offset > currentCursor.offset) {
      this.editBuffer.deleteRange(currentCursor.row, currentCursor.col, nextWord.row, nextWord.col);
    }
    this._ctx.clearSelection();
    this.requestRender();
    return true;
  }
  deleteWordBackward() {
    if (this.hasSelection()) {
      this.deleteSelectedText();
      return true;
    }
    const currentCursor = this.editBuffer.getCursorPosition();
    const prevWord = this.editBuffer.getPrevWordBoundary();
    if (prevWord.offset < currentCursor.offset) {
      this.editBuffer.deleteRange(prevWord.row, prevWord.col, currentCursor.row, currentCursor.col);
    }
    this._ctx.clearSelection();
    this.requestRender();
    return true;
  }
  focus() {
    super.focus();
    this.updateColors();
  }
  blur() {
    super.blur();
    if (!this.isDestroyed) {
      this.updateColors();
    }
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(value) {
    if (this._placeholder !== value) {
      this._placeholder = value;
      this.applyPlaceholder(value);
      this.requestRender();
    }
  }
  get placeholderColor() {
    return this._placeholderColor;
  }
  set placeholderColor(value) {
    const newColor = parseColor(value ?? TextareaRenderable.defaults.placeholderColor);
    if (this._placeholderColor !== newColor) {
      this._placeholderColor = newColor;
      this.applyPlaceholder(this._placeholder);
      this.requestRender();
    }
  }
  get backgroundColor() {
    return this._unfocusedBackgroundColor;
  }
  set backgroundColor(value) {
    const newColor = parseColor(value ?? TextareaRenderable.defaults.backgroundColor);
    if (this._unfocusedBackgroundColor !== newColor) {
      this._unfocusedBackgroundColor = newColor;
      this.updateColors();
    }
  }
  get textColor() {
    return this._unfocusedTextColor;
  }
  set textColor(value) {
    const newColor = parseColor(value ?? TextareaRenderable.defaults.textColor);
    if (this._unfocusedTextColor !== newColor) {
      this._unfocusedTextColor = newColor;
      this.updateColors();
    }
  }
  set focusedBackgroundColor(value) {
    const newColor = parseColor(value ?? TextareaRenderable.defaults.focusedBackgroundColor);
    if (this._focusedBackgroundColor !== newColor) {
      this._focusedBackgroundColor = newColor;
      this.updateColors();
    }
  }
  set focusedTextColor(value) {
    const newColor = parseColor(value ?? TextareaRenderable.defaults.focusedTextColor);
    if (this._focusedTextColor !== newColor) {
      this._focusedTextColor = newColor;
      this.updateColors();
    }
  }
  set initialValue(value) {
    if (!this._initialValueSet) {
      this.setText(value);
      this._initialValueSet = true;
    }
  }
  submit() {
    if (this._submitListener) {
      this._submitListener({});
    }
    return true;
  }
  set onSubmit(handler) {
    this._submitListener = handler;
  }
  get onSubmit() {
    return this._submitListener;
  }
  set keyBindings(bindings) {
    this._keyBindings = bindings;
    const mergedBindings = mergeKeyBindings(defaultTextareaKeybindings, bindings);
    this._keyBindingsMap = buildKeyBindingsMap(mergedBindings, this._keyAliasMap);
  }
  set keyAliasMap(aliases) {
    this._keyAliasMap = mergeKeyAliases(defaultKeyAliases, aliases);
    const mergedBindings = mergeKeyBindings(defaultTextareaKeybindings, this._keyBindings);
    this._keyBindingsMap = buildKeyBindingsMap(mergedBindings, this._keyAliasMap);
  }
  get extmarks() {
    return this.editorView.extmarks;
  }
}

// src/renderables/Input.ts
var InputRenderableEvents;
((InputRenderableEvents2) => {
  InputRenderableEvents2["INPUT"] = "input";
  InputRenderableEvents2["CHANGE"] = "change";
  InputRenderableEvents2["ENTER"] = "enter";
})(InputRenderableEvents ||= {});

class InputRenderable extends TextareaRenderable {
  _maxLength;
  _lastCommittedValue = "";
  static defaultOptions = {
    placeholder: "",
    maxLength: 1000,
    value: ""
  };
  constructor(ctx, options) {
    const defaults = InputRenderable.defaultOptions;
    const maxLength = options.maxLength ?? defaults.maxLength;
    const rawValue = options.value ?? defaults.value;
    const initialValue = rawValue.replace(/[\n\r]/g, "").substring(0, maxLength);
    super(ctx, {
      ...options,
      placeholder: options.placeholder ?? defaults.placeholder,
      initialValue,
      height: 1,
      wrapMode: "none",
      keyBindings: [
        { name: "return", action: "submit" },
        { name: "linefeed", action: "submit" },
        ...options.keyBindings || []
      ]
    });
    this._maxLength = maxLength;
    this._lastCommittedValue = this.plainText;
    if (initialValue) {
      this.cursorOffset = initialValue.length;
    }
  }
  newLine() {
    return false;
  }
  handlePaste(event) {
    const sanitized = event.text.replace(/[\n\r]/g, "");
    if (sanitized) {
      this.insertText(sanitized);
    }
  }
  insertText(text) {
    const sanitized = text.replace(/[\n\r]/g, "");
    if (!sanitized)
      return;
    const currentLength = this.plainText.length;
    const remaining = this._maxLength - currentLength;
    if (remaining <= 0)
      return;
    const toInsert = sanitized.substring(0, remaining);
    super.insertText(toInsert);
    this.emit("input" /* INPUT */, this.plainText);
  }
  get value() {
    return this.plainText;
  }
  set value(value) {
    const newValue = value.substring(0, this._maxLength).replace(/[\n\r]/g, "");
    const currentValue = this.plainText;
    if (currentValue !== newValue) {
      this.setText(newValue);
      this.cursorOffset = newValue.length;
      this.emit("input" /* INPUT */, newValue);
    }
  }
  focus() {
    super.focus();
    this._lastCommittedValue = this.plainText;
  }
  blur() {
    if (!this.isDestroyed) {
      const currentValue = this.plainText;
      if (currentValue !== this._lastCommittedValue) {
        this._lastCommittedValue = currentValue;
        this.emit("change" /* CHANGE */, currentValue);
      }
    }
    super.blur();
  }
  submit() {
    const currentValue = this.plainText;
    if (currentValue !== this._lastCommittedValue) {
      this._lastCommittedValue = currentValue;
      this.emit("change" /* CHANGE */, currentValue);
    }
    this.emit("enter" /* ENTER */, currentValue);
    return true;
  }
  deleteCharBackward() {
    const result = super.deleteCharBackward();
    this.emit("input" /* INPUT */, this.plainText);
    return result;
  }
  deleteChar() {
    const result = super.deleteChar();
    this.emit("input" /* INPUT */, this.plainText);
    return result;
  }
  deleteCharacter(direction) {
    if (direction === "backward") {
      this.deleteCharBackward();
    } else {
      this.deleteChar();
    }
  }
  set maxLength(maxLength) {
    this._maxLength = maxLength;
    const currentValue = this.plainText;
    if (currentValue.length > maxLength) {
      this.setText(currentValue.substring(0, maxLength));
    }
  }
  get maxLength() {
    return this._maxLength;
  }
  set placeholder(placeholder) {
    super.placeholder = placeholder;
  }
  get placeholder() {
    const p = super.placeholder;
    return typeof p === "string" ? p : "";
  }
  set initialValue(value) {}
}
// ../../node_modules/.bun/marked@17.0.1/node_modules/marked/lib/marked.esm.js
function L() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var T = L();
function Z(u) {
  T = u;
}
var C = { exec: () => null };
function k(u, e = "") {
  let t2 = typeof u == "string" ? u : u.source, n = { replace: (r, i) => {
    let s = typeof i == "string" ? i : i.source;
    return s = s.replace(m.caret, "$1"), t2 = t2.replace(r, s), n;
  }, getRegex: () => new RegExp(t2, e) };
  return n;
}
var me = (() => {
  try {
    return !!new RegExp("(?<=1)(?<!1)");
  } catch {
    return false;
  }
})();
var m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceTabs: /^\t+/, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (u) => new RegExp(`^( {0,3}${u})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), hrRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), fencesBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}(?:\`\`\`|~~~)`), headingBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}#`), htmlBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}<(?:[a-z].*>|!--)`, "i") };
var xe = /^(?:[ \t]*(?:\n|$))+/;
var be = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var Re = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var I = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var Te = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var N = /(?:[*+-]|\d{1,9}[.)])/;
var re = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var se = k(re).replace(/bull/g, N).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var Oe = k(re).replace(/bull/g, N).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var Q = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var we = /^[^\n]+/;
var F = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
var ye = k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", F).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var Pe = k(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, N).getRegex();
var v = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var j = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var Se = k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))", "i").replace("comment", j).replace("tag", v).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var ie = k(Q).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex();
var $e = k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", ie).getRegex();
var U = { blockquote: $e, code: be, def: ye, fences: Re, heading: Te, hr: I, html: Se, lheading: se, list: Pe, newline: xe, paragraph: ie, table: C, text: we };
var te = k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}\t)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex();
var _e = { ...U, lheading: Oe, table: te, paragraph: k(Q).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", te).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex() };
var Le = { ...U, html: k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", j).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: C, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: k(Q).replace("hr", I).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", se).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Me = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var ze = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var oe = /^( {2,}|\\)\n(?!\s*$)/;
var Ae = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var D = /[\p{P}\p{S}]/u;
var K = /[\s\p{P}\p{S}]/u;
var ae = /[^\s\p{P}\p{S}]/u;
var Ce = k(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, K).getRegex();
var le = /(?!~)[\p{P}\p{S}]/u;
var Ie = /(?!~)[\s\p{P}\p{S}]/u;
var Ee = /(?:[^\s\p{P}\p{S}]|~)/u;
var Be = k(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", me ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var ue = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
var qe = k(ue, "u").replace(/punct/g, D).getRegex();
var ve = k(ue, "u").replace(/punct/g, le).getRegex();
var pe = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var De = k(pe, "gu").replace(/notPunctSpace/g, ae).replace(/punctSpace/g, K).replace(/punct/g, D).getRegex();
var He = k(pe, "gu").replace(/notPunctSpace/g, Ee).replace(/punctSpace/g, Ie).replace(/punct/g, le).getRegex();
var Ze = k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, ae).replace(/punctSpace/g, K).replace(/punct/g, D).getRegex();
var Ge = k(/\\(punct)/, "gu").replace(/punct/g, D).getRegex();
var Ne = k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var Qe = k(j).replace("(?:-->|$)", "-->").getRegex();
var Fe = k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Qe).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var q = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/;
var je = k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", q).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var ce = k(/^!?\[(label)\]\[(ref)\]/).replace("label", q).replace("ref", F).getRegex();
var he = k(/^!?\[(ref)\](?:\[\])?/).replace("ref", F).getRegex();
var Ue = k("reflink|nolink(?!\\()", "g").replace("reflink", ce).replace("nolink", he).getRegex();
var ne = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var W = { _backpedal: C, anyPunctuation: Ge, autolink: Ne, blockSkip: Be, br: oe, code: ze, del: C, emStrongLDelim: qe, emStrongRDelimAst: De, emStrongRDelimUnd: Ze, escape: Me, link: je, nolink: he, punctuation: Ce, reflink: ce, reflinkSearch: Ue, tag: Fe, text: Ae, url: C };
var Ke = { ...W, link: k(/^!?\[(label)\]\((.*?)\)/).replace("label", q).getRegex(), reflink: k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", q).getRegex() };
var G = { ...W, emStrongRDelimAst: He, emStrongLDelim: ve, url: k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ne).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: k(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ne).getRegex() };
var We = { ...G, br: k(oe).replace("{2,}", "*").getRegex(), text: k(G.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var E = { normal: U, gfm: _e, pedantic: Le };
var M = { normal: W, gfm: G, breaks: We, pedantic: Ke };
var Xe = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var ke = (u) => Xe[u];
function w(u, e) {
  if (e) {
    if (m.escapeTest.test(u))
      return u.replace(m.escapeReplace, ke);
  } else if (m.escapeTestNoEncode.test(u))
    return u.replace(m.escapeReplaceNoEncode, ke);
  return u;
}
function X(u) {
  try {
    u = encodeURI(u).replace(m.percentDecode, "%");
  } catch {
    return null;
  }
  return u;
}
function J(u, e) {
  let t2 = u.replace(m.findPipe, (i, s, a) => {
    let o = false, l = s;
    for (;--l >= 0 && a[l] === "\\"; )
      o = !o;
    return o ? "|" : " |";
  }), n = t2.split(m.splitPipe), r = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e)
    if (n.length > e)
      n.splice(e);
    else
      for (;n.length < e; )
        n.push("");
  for (;r < n.length; r++)
    n[r] = n[r].trim().replace(m.slashPipe, "|");
  return n;
}
function z(u, e, t2) {
  let n = u.length;
  if (n === 0)
    return "";
  let r = 0;
  for (;r < n; ) {
    let i = u.charAt(n - r - 1);
    if (i === e && !t2)
      r++;
    else if (i !== e && t2)
      r++;
    else
      break;
  }
  return u.slice(0, n - r);
}
function de(u, e) {
  if (u.indexOf(e[1]) === -1)
    return -1;
  let t2 = 0;
  for (let n = 0;n < u.length; n++)
    if (u[n] === "\\")
      n++;
    else if (u[n] === e[0])
      t2++;
    else if (u[n] === e[1] && (t2--, t2 < 0))
      return n;
  return t2 > 0 ? -2 : -1;
}
function ge(u, e, t2, n, r) {
  let i = e.href, s = e.title || null, a = u[1].replace(r.other.outputLinkReplace, "$1");
  n.state.inLink = true;
  let o = { type: u[0].charAt(0) === "!" ? "image" : "link", raw: t2, href: i, title: s, text: a, tokens: n.inlineTokens(a) };
  return n.state.inLink = false, o;
}
function Je(u, e, t2) {
  let n = u.match(t2.other.indentCodeCompensation);
  if (n === null)
    return e;
  let r = n[1];
  return e.split(`
`).map((i) => {
    let s = i.match(t2.other.beginningSpace);
    if (s === null)
      return i;
    let [a] = s;
    return a.length >= r.length ? i.slice(r.length) : i;
  }).join(`
`);
}
var y = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    let t2 = this.rules.block.newline.exec(e);
    if (t2 && t2[0].length > 0)
      return { type: "space", raw: t2[0] };
  }
  code(e) {
    let t2 = this.rules.block.code.exec(e);
    if (t2) {
      let n = t2[0].replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: t2[0], codeBlockStyle: "indented", text: this.options.pedantic ? n : z(n, `
`) };
    }
  }
  fences(e) {
    let t2 = this.rules.block.fences.exec(e);
    if (t2) {
      let n = t2[0], r = Je(n, t2[3] || "", this.rules);
      return { type: "code", raw: n, lang: t2[2] ? t2[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t2[2], text: r };
    }
  }
  heading(e) {
    let t2 = this.rules.block.heading.exec(e);
    if (t2) {
      let n = t2[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let r = z(n, "#");
        (this.options.pedantic || !r || this.rules.other.endingSpaceChar.test(r)) && (n = r.trim());
      }
      return { type: "heading", raw: t2[0], depth: t2[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t2 = this.rules.block.hr.exec(e);
    if (t2)
      return { type: "hr", raw: z(t2[0], `
`) };
  }
  blockquote(e) {
    let t2 = this.rules.block.blockquote.exec(e);
    if (t2) {
      let n = z(t2[0], `
`).split(`
`), r = "", i = "", s = [];
      for (;n.length > 0; ) {
        let a = false, o = [], l;
        for (l = 0;l < n.length; l++)
          if (this.rules.other.blockquoteStart.test(n[l]))
            o.push(n[l]), a = true;
          else if (!a)
            o.push(n[l]);
          else
            break;
        n = n.slice(l);
        let p = o.join(`
`), c = p.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        r = r ? `${r}
${p}` : p, i = i ? `${i}
${c}` : c;
        let g = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(c, s, true), this.lexer.state.top = g, n.length === 0)
          break;
        let h2 = s.at(-1);
        if (h2?.type === "code")
          break;
        if (h2?.type === "blockquote") {
          let R = h2, f = R.raw + `
` + n.join(`
`), O = this.blockquote(f);
          s[s.length - 1] = O, r = r.substring(0, r.length - R.raw.length) + O.raw, i = i.substring(0, i.length - R.text.length) + O.text;
          break;
        } else if (h2?.type === "list") {
          let R = h2, f = R.raw + `
` + n.join(`
`), O = this.list(f);
          s[s.length - 1] = O, r = r.substring(0, r.length - h2.raw.length) + O.raw, i = i.substring(0, i.length - R.raw.length) + O.raw, n = f.substring(s.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: r, tokens: s, text: i };
    }
  }
  list(e) {
    let t2 = this.rules.block.list.exec(e);
    if (t2) {
      let n = t2[1].trim(), r = n.length > 1, i = { type: "list", raw: "", ordered: r, start: r ? +n.slice(0, -1) : "", loose: false, items: [] };
      n = r ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = r ? n : "[*+-]");
      let s = this.rules.other.listItemRegex(n), a = false;
      for (;e; ) {
        let l = false, p = "", c = "";
        if (!(t2 = s.exec(e)) || this.rules.block.hr.test(e))
          break;
        p = t2[0], e = e.substring(p.length);
        let g = t2[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (O) => " ".repeat(3 * O.length)), h2 = e.split(`
`, 1)[0], R = !g.trim(), f = 0;
        if (this.options.pedantic ? (f = 2, c = g.trimStart()) : R ? f = t2[1].length + 1 : (f = t2[2].search(this.rules.other.nonSpaceChar), f = f > 4 ? 1 : f, c = g.slice(f), f += t2[1].length), R && this.rules.other.blankLine.test(h2) && (p += h2 + `
`, e = e.substring(h2.length + 1), l = true), !l) {
          let O = this.rules.other.nextBulletRegex(f), V = this.rules.other.hrRegex(f), Y = this.rules.other.fencesBeginRegex(f), ee = this.rules.other.headingBeginRegex(f), fe = this.rules.other.htmlBeginRegex(f);
          for (;e; ) {
            let H = e.split(`
`, 1)[0], A;
            if (h2 = H, this.options.pedantic ? (h2 = h2.replace(this.rules.other.listReplaceNesting, "  "), A = h2) : A = h2.replace(this.rules.other.tabCharGlobal, "    "), Y.test(h2) || ee.test(h2) || fe.test(h2) || O.test(h2) || V.test(h2))
              break;
            if (A.search(this.rules.other.nonSpaceChar) >= f || !h2.trim())
              c += `
` + A.slice(f);
            else {
              if (R || g.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || Y.test(g) || ee.test(g) || V.test(g))
                break;
              c += `
` + h2;
            }
            !R && !h2.trim() && (R = true), p += H + `
`, e = e.substring(H.length + 1), g = A.slice(f);
          }
        }
        i.loose || (a ? i.loose = true : this.rules.other.doubleBlankLine.test(p) && (a = true)), i.items.push({ type: "list_item", raw: p, task: !!this.options.gfm && this.rules.other.listIsTask.test(c), loose: false, text: c, tokens: [] }), i.raw += p;
      }
      let o = i.items.at(-1);
      if (o)
        o.raw = o.raw.trimEnd(), o.text = o.text.trimEnd();
      else
        return;
      i.raw = i.raw.trimEnd();
      for (let l of i.items) {
        if (this.lexer.state.top = false, l.tokens = this.lexer.blockTokens(l.text, []), l.task) {
          if (l.text = l.text.replace(this.rules.other.listReplaceTask, ""), l.tokens[0]?.type === "text" || l.tokens[0]?.type === "paragraph") {
            l.tokens[0].raw = l.tokens[0].raw.replace(this.rules.other.listReplaceTask, ""), l.tokens[0].text = l.tokens[0].text.replace(this.rules.other.listReplaceTask, "");
            for (let c = this.lexer.inlineQueue.length - 1;c >= 0; c--)
              if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[c].src)) {
                this.lexer.inlineQueue[c].src = this.lexer.inlineQueue[c].src.replace(this.rules.other.listReplaceTask, "");
                break;
              }
          }
          let p = this.rules.other.listTaskCheckbox.exec(l.raw);
          if (p) {
            let c = { type: "checkbox", raw: p[0] + " ", checked: p[0] !== "[ ]" };
            l.checked = c.checked, i.loose ? l.tokens[0] && ["paragraph", "text"].includes(l.tokens[0].type) && "tokens" in l.tokens[0] && l.tokens[0].tokens ? (l.tokens[0].raw = c.raw + l.tokens[0].raw, l.tokens[0].text = c.raw + l.tokens[0].text, l.tokens[0].tokens.unshift(c)) : l.tokens.unshift({ type: "paragraph", raw: c.raw, text: c.raw, tokens: [c] }) : l.tokens.unshift(c);
          }
        }
        if (!i.loose) {
          let p = l.tokens.filter((g) => g.type === "space"), c = p.length > 0 && p.some((g) => this.rules.other.anyLine.test(g.raw));
          i.loose = c;
        }
      }
      if (i.loose)
        for (let l of i.items) {
          l.loose = true;
          for (let p of l.tokens)
            p.type === "text" && (p.type = "paragraph");
        }
      return i;
    }
  }
  html(e) {
    let t2 = this.rules.block.html.exec(e);
    if (t2)
      return { type: "html", block: true, raw: t2[0], pre: t2[1] === "pre" || t2[1] === "script" || t2[1] === "style", text: t2[0] };
  }
  def(e) {
    let t2 = this.rules.block.def.exec(e);
    if (t2) {
      let n = t2[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), r = t2[2] ? t2[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", i = t2[3] ? t2[3].substring(1, t2[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t2[3];
      return { type: "def", tag: n, raw: t2[0], href: r, title: i };
    }
  }
  table(e) {
    let t2 = this.rules.block.table.exec(e);
    if (!t2 || !this.rules.other.tableDelimiter.test(t2[2]))
      return;
    let n = J(t2[1]), r = t2[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t2[3]?.trim() ? t2[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], s = { type: "table", raw: t2[0], header: [], align: [], rows: [] };
    if (n.length === r.length) {
      for (let a of r)
        this.rules.other.tableAlignRight.test(a) ? s.align.push("right") : this.rules.other.tableAlignCenter.test(a) ? s.align.push("center") : this.rules.other.tableAlignLeft.test(a) ? s.align.push("left") : s.align.push(null);
      for (let a = 0;a < n.length; a++)
        s.header.push({ text: n[a], tokens: this.lexer.inline(n[a]), header: true, align: s.align[a] });
      for (let a of i)
        s.rows.push(J(a, s.header.length).map((o, l) => ({ text: o, tokens: this.lexer.inline(o), header: false, align: s.align[l] })));
      return s;
    }
  }
  lheading(e) {
    let t2 = this.rules.block.lheading.exec(e);
    if (t2)
      return { type: "heading", raw: t2[0], depth: t2[2].charAt(0) === "=" ? 1 : 2, text: t2[1], tokens: this.lexer.inline(t2[1]) };
  }
  paragraph(e) {
    let t2 = this.rules.block.paragraph.exec(e);
    if (t2) {
      let n = t2[1].charAt(t2[1].length - 1) === `
` ? t2[1].slice(0, -1) : t2[1];
      return { type: "paragraph", raw: t2[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t2 = this.rules.block.text.exec(e);
    if (t2)
      return { type: "text", raw: t2[0], text: t2[0], tokens: this.lexer.inline(t2[0]) };
  }
  escape(e) {
    let t2 = this.rules.inline.escape.exec(e);
    if (t2)
      return { type: "escape", raw: t2[0], text: t2[1] };
  }
  tag(e) {
    let t2 = this.rules.inline.tag.exec(e);
    if (t2)
      return !this.lexer.state.inLink && this.rules.other.startATag.test(t2[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t2[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t2[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t2[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t2[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t2[0] };
  }
  link(e) {
    let t2 = this.rules.inline.link.exec(e);
    if (t2) {
      let n = t2[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n))
          return;
        let s = z(n.slice(0, -1), "\\");
        if ((n.length - s.length) % 2 === 0)
          return;
      } else {
        let s = de(t2[2], "()");
        if (s === -2)
          return;
        if (s > -1) {
          let o = (t2[0].indexOf("!") === 0 ? 5 : 4) + t2[1].length + s;
          t2[2] = t2[2].substring(0, s), t2[0] = t2[0].substring(0, o).trim(), t2[3] = "";
        }
      }
      let r = t2[2], i = "";
      if (this.options.pedantic) {
        let s = this.rules.other.pedanticHrefTitle.exec(r);
        s && (r = s[1], i = s[3]);
      } else
        i = t2[3] ? t2[3].slice(1, -1) : "";
      return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? r = r.slice(1) : r = r.slice(1, -1)), ge(t2, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: i && i.replace(this.rules.inline.anyPunctuation, "$1") }, t2[0], this.lexer, this.rules);
    }
  }
  reflink(e, t2) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let r = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), i = t2[r.toLowerCase()];
      if (!i) {
        let s = n[0].charAt(0);
        return { type: "text", raw: s, text: s };
      }
      return ge(n, i, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t2, n = "") {
    let r = this.rules.inline.emStrongLDelim.exec(e);
    if (!r || r[3] && n.match(this.rules.other.unicodeAlphaNumeric))
      return;
    if (!(r[1] || r[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let s = [...r[0]].length - 1, a, o, l = s, p = 0, c = r[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t2 = t2.slice(-1 * e.length + s);(r = c.exec(t2)) != null; ) {
        if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a)
          continue;
        if (o = [...a].length, r[3] || r[4]) {
          l += o;
          continue;
        } else if ((r[5] || r[6]) && s % 3 && !((s + o) % 3)) {
          p += o;
          continue;
        }
        if (l -= o, l > 0)
          continue;
        o = Math.min(o, o + l + p);
        let g = [...r[0]][0].length, h2 = e.slice(0, s + r.index + g + o);
        if (Math.min(s, o) % 2) {
          let f = h2.slice(1, -1);
          return { type: "em", raw: h2, text: f, tokens: this.lexer.inlineTokens(f) };
        }
        let R = h2.slice(2, -2);
        return { type: "strong", raw: h2, text: R, tokens: this.lexer.inlineTokens(R) };
      }
    }
  }
  codespan(e) {
    let t2 = this.rules.inline.code.exec(e);
    if (t2) {
      let n = t2[2].replace(this.rules.other.newLineCharGlobal, " "), r = this.rules.other.nonSpaceChar.test(n), i = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return r && i && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t2[0], text: n };
    }
  }
  br(e) {
    let t2 = this.rules.inline.br.exec(e);
    if (t2)
      return { type: "br", raw: t2[0] };
  }
  del(e) {
    let t2 = this.rules.inline.del.exec(e);
    if (t2)
      return { type: "del", raw: t2[0], text: t2[2], tokens: this.lexer.inlineTokens(t2[2]) };
  }
  autolink(e) {
    let t2 = this.rules.inline.autolink.exec(e);
    if (t2) {
      let n, r;
      return t2[2] === "@" ? (n = t2[1], r = "mailto:" + n) : (n = t2[1], r = n), { type: "link", raw: t2[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t2;
    if (t2 = this.rules.inline.url.exec(e)) {
      let n, r;
      if (t2[2] === "@")
        n = t2[0], r = "mailto:" + n;
      else {
        let i;
        do
          i = t2[0], t2[0] = this.rules.inline._backpedal.exec(t2[0])?.[0] ?? "";
        while (i !== t2[0]);
        n = t2[0], t2[1] === "www." ? r = "http://" + t2[0] : r = t2[0];
      }
      return { type: "link", raw: t2[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t2 = this.rules.inline.text.exec(e);
    if (t2) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t2[0], text: t2[0], escaped: n };
    }
  }
};
var x = class u {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(e) {
    this.tokens = [], this.tokens.links = Object.create(null), this.options = e || T, this.options.tokenizer = this.options.tokenizer || new y, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t2 = { other: m, block: E.normal, inline: M.normal };
    this.options.pedantic ? (t2.block = E.pedantic, t2.inline = M.pedantic) : this.options.gfm && (t2.block = E.gfm, this.options.breaks ? t2.inline = M.breaks : t2.inline = M.gfm), this.tokenizer.rules = t2;
  }
  static get rules() {
    return { block: E, inline: M };
  }
  static lex(e, t2) {
    return new u(t2).lex(e);
  }
  static lexInline(e, t2) {
    return new u(t2).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t2 = 0;t2 < this.inlineQueue.length; t2++) {
      let n = this.inlineQueue[t2];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t2 = [], n = false) {
    for (this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));e; ) {
      let r;
      if (this.options.extensions?.block?.some((s) => (r = s.call({ lexer: this }, e, t2)) ? (e = e.substring(r.raw.length), t2.push(r), true) : false))
        continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let s = t2.at(-1);
        r.raw.length === 1 && s !== undefined ? s.raw += `
` : t2.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let s = t2.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.at(-1).src = s.text) : t2.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t2.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t2.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t2.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t2.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t2.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t2.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let s = t2.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.raw, this.inlineQueue.at(-1).src = s.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t2.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t2.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t2.push(r);
        continue;
      }
      let i = e;
      if (this.options.extensions?.startBlock) {
        let s = 1 / 0, a = e.slice(1), o;
        this.options.extensions.startBlock.forEach((l) => {
          o = l.call({ lexer: this }, a), typeof o == "number" && o >= 0 && (s = Math.min(s, o));
        }), s < 1 / 0 && s >= 0 && (i = e.substring(0, s + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(i))) {
        let s = t2.at(-1);
        n && s?.type === "paragraph" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t2.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let s = t2.at(-1);
        s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t2.push(r);
        continue;
      }
      if (e) {
        let s = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(s);
          break;
        } else
          throw new Error(s);
      }
    }
    return this.state.top = true, t2;
  }
  inline(e, t2 = []) {
    return this.inlineQueue.push({ src: e, tokens: t2 }), t2;
  }
  inlineTokens(e, t2 = []) {
    let n = e, r = null;
    if (this.tokens.links) {
      let o = Object.keys(this.tokens.links);
      if (o.length > 0)
        for (;(r = this.tokenizer.rules.inline.reflinkSearch.exec(n)) != null; )
          o.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (n = n.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (;(r = this.tokenizer.rules.inline.anyPunctuation.exec(n)) != null; )
      n = n.slice(0, r.index) + "++" + n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let i;
    for (;(r = this.tokenizer.rules.inline.blockSkip.exec(n)) != null; )
      i = r[2] ? r[2].length : 0, n = n.slice(0, r.index + i) + "[" + "a".repeat(r[0].length - i - 2) + "]" + n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let s = false, a = "";
    for (;e; ) {
      s || (a = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((p) => (o = p.call({ lexer: this }, e, t2)) ? (e = e.substring(o.raw.length), t2.push(o), true) : false))
        continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), t2.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), t2.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), t2.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let p = t2.at(-1);
        o.type === "text" && p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : t2.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, n, a)) {
        e = e.substring(o.raw.length), t2.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), t2.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), t2.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e)) {
        e = e.substring(o.raw.length), t2.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), t2.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), t2.push(o);
        continue;
      }
      let l = e;
      if (this.options.extensions?.startInline) {
        let p = 1 / 0, c = e.slice(1), g;
        this.options.extensions.startInline.forEach((h2) => {
          g = h2.call({ lexer: this }, c), typeof g == "number" && g >= 0 && (p = Math.min(p, g));
        }), p < 1 / 0 && p >= 0 && (l = e.substring(0, p + 1));
      }
      if (o = this.tokenizer.inlineText(l)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (a = o.raw.slice(-1)), s = true;
        let p = t2.at(-1);
        p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : t2.push(o);
        continue;
      }
      if (e) {
        let p = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(p);
          break;
        } else
          throw new Error(p);
      }
    }
    return t2;
  }
};
var P = class {
  options;
  parser;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t2, escaped: n }) {
    let r = (t2 || "").match(m.notSpaceStart)?.[0], i = e.replace(m.endingNewline, "") + `
`;
    return r ? '<pre><code class="language-' + w(r) + '">' + (n ? i : w(i, true)) + `</code></pre>
` : "<pre><code>" + (n ? i : w(i, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t2 }) {
    return `<h${t2}>${this.parser.parseInline(e)}</h${t2}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let { ordered: t2, start: n } = e, r = "";
    for (let a = 0;a < e.items.length; a++) {
      let o = e.items[a];
      r += this.listitem(o);
    }
    let i = t2 ? "ol" : "ul", s = t2 && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + i + s + `>
` + r + "</" + i + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t2 = "", n = "";
    for (let i = 0;i < e.header.length; i++)
      n += this.tablecell(e.header[i]);
    t2 += this.tablerow({ text: n });
    let r = "";
    for (let i = 0;i < e.rows.length; i++) {
      let s = e.rows[i];
      n = "";
      for (let a = 0;a < s.length; a++)
        n += this.tablecell(s[a]);
      r += this.tablerow({ text: n });
    }
    return r && (r = `<tbody>${r}</tbody>`), `<table>
<thead>
` + t2 + `</thead>
` + r + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t2 = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t2 + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${w(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t2, tokens: n }) {
    let r = this.parser.parseInline(n), i = X(e);
    if (i === null)
      return r;
    e = i;
    let s = '<a href="' + e + '"';
    return t2 && (s += ' title="' + w(t2) + '"'), s += ">" + r + "</a>", s;
  }
  image({ href: e, title: t2, text: n, tokens: r }) {
    r && (n = this.parser.parseInline(r, this.parser.textRenderer));
    let i = X(e);
    if (i === null)
      return w(n);
    e = i;
    let s = `<img src="${e}" alt="${n}"`;
    return t2 && (s += ` title="${w(t2)}"`), s += ">", s;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : ("escaped" in e) && e.escaped ? e.text : w(e.text);
  }
};
var $ = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
};
var b = class u2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || T, this.options.renderer = this.options.renderer || new P, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new $;
  }
  static parse(e, t2) {
    return new u2(t2).parse(e);
  }
  static parseInline(e, t2) {
    return new u2(t2).parseInline(e);
  }
  parse(e) {
    let t2 = "";
    for (let n = 0;n < e.length; n++) {
      let r = e[n];
      if (this.options.extensions?.renderers?.[r.type]) {
        let s = r, a = this.options.extensions.renderers[s.type].call({ parser: this }, s);
        if (a !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(s.type)) {
          t2 += a || "";
          continue;
        }
      }
      let i = r;
      switch (i.type) {
        case "space": {
          t2 += this.renderer.space(i);
          break;
        }
        case "hr": {
          t2 += this.renderer.hr(i);
          break;
        }
        case "heading": {
          t2 += this.renderer.heading(i);
          break;
        }
        case "code": {
          t2 += this.renderer.code(i);
          break;
        }
        case "table": {
          t2 += this.renderer.table(i);
          break;
        }
        case "blockquote": {
          t2 += this.renderer.blockquote(i);
          break;
        }
        case "list": {
          t2 += this.renderer.list(i);
          break;
        }
        case "checkbox": {
          t2 += this.renderer.checkbox(i);
          break;
        }
        case "html": {
          t2 += this.renderer.html(i);
          break;
        }
        case "def": {
          t2 += this.renderer.def(i);
          break;
        }
        case "paragraph": {
          t2 += this.renderer.paragraph(i);
          break;
        }
        case "text": {
          t2 += this.renderer.text(i);
          break;
        }
        default: {
          let s = 'Token with "' + i.type + '" type was not found.';
          if (this.options.silent)
            return console.error(s), "";
          throw new Error(s);
        }
      }
    }
    return t2;
  }
  parseInline(e, t2 = this.renderer) {
    let n = "";
    for (let r = 0;r < e.length; r++) {
      let i = e[r];
      if (this.options.extensions?.renderers?.[i.type]) {
        let a = this.options.extensions.renderers[i.type].call({ parser: this }, i);
        if (a !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(i.type)) {
          n += a || "";
          continue;
        }
      }
      let s = i;
      switch (s.type) {
        case "escape": {
          n += t2.text(s);
          break;
        }
        case "html": {
          n += t2.html(s);
          break;
        }
        case "link": {
          n += t2.link(s);
          break;
        }
        case "image": {
          n += t2.image(s);
          break;
        }
        case "checkbox": {
          n += t2.checkbox(s);
          break;
        }
        case "strong": {
          n += t2.strong(s);
          break;
        }
        case "em": {
          n += t2.em(s);
          break;
        }
        case "codespan": {
          n += t2.codespan(s);
          break;
        }
        case "br": {
          n += t2.br(s);
          break;
        }
        case "del": {
          n += t2.del(s);
          break;
        }
        case "text": {
          n += t2.text(s);
          break;
        }
        default: {
          let a = 'Token with "' + s.type + '" type was not found.';
          if (this.options.silent)
            return console.error(a), "";
          throw new Error(a);
        }
      }
    }
    return n;
  }
};
var S = class {
  options;
  block;
  constructor(e) {
    this.options = e || T;
  }
  static passThroughHooks = new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer() {
    return this.block ? x.lex : x.lexInline;
  }
  provideParser() {
    return this.block ? b.parse : b.parseInline;
  }
};
var B = class {
  defaults = L();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = b;
  Renderer = P;
  TextRenderer = $;
  Lexer = x;
  Tokenizer = y;
  Hooks = S;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t2) {
    let n = [];
    for (let r of e)
      switch (n = n.concat(t2.call(this, r)), r.type) {
        case "table": {
          let i = r;
          for (let s of i.header)
            n = n.concat(this.walkTokens(s.tokens, t2));
          for (let s of i.rows)
            for (let a of s)
              n = n.concat(this.walkTokens(a.tokens, t2));
          break;
        }
        case "list": {
          let i = r;
          n = n.concat(this.walkTokens(i.items, t2));
          break;
        }
        default: {
          let i = r;
          this.defaults.extensions?.childTokens?.[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((s) => {
            let a = i[s].flat(1 / 0);
            n = n.concat(this.walkTokens(a, t2));
          }) : i.tokens && (n = n.concat(this.walkTokens(i.tokens, t2)));
        }
      }
    return n;
  }
  use(...e) {
    let t2 = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let r = { ...n };
      if (r.async = this.defaults.async || r.async || false, n.extensions && (n.extensions.forEach((i) => {
        if (!i.name)
          throw new Error("extension name required");
        if ("renderer" in i) {
          let s = t2.renderers[i.name];
          s ? t2.renderers[i.name] = function(...a) {
            let o = i.renderer.apply(this, a);
            return o === false && (o = s.apply(this, a)), o;
          } : t2.renderers[i.name] = i.renderer;
        }
        if ("tokenizer" in i) {
          if (!i.level || i.level !== "block" && i.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          let s = t2[i.level];
          s ? s.unshift(i.tokenizer) : t2[i.level] = [i.tokenizer], i.start && (i.level === "block" ? t2.startBlock ? t2.startBlock.push(i.start) : t2.startBlock = [i.start] : i.level === "inline" && (t2.startInline ? t2.startInline.push(i.start) : t2.startInline = [i.start]));
        }
        "childTokens" in i && i.childTokens && (t2.childTokens[i.name] = i.childTokens);
      }), r.extensions = t2), n.renderer) {
        let i = this.defaults.renderer || new P(this.defaults);
        for (let s in n.renderer) {
          if (!(s in i))
            throw new Error(`renderer '${s}' does not exist`);
          if (["options", "parser"].includes(s))
            continue;
          let a = s, o = n.renderer[a], l = i[a];
          i[a] = (...p) => {
            let c = o.apply(i, p);
            return c === false && (c = l.apply(i, p)), c || "";
          };
        }
        r.renderer = i;
      }
      if (n.tokenizer) {
        let i = this.defaults.tokenizer || new y(this.defaults);
        for (let s in n.tokenizer) {
          if (!(s in i))
            throw new Error(`tokenizer '${s}' does not exist`);
          if (["options", "rules", "lexer"].includes(s))
            continue;
          let a = s, o = n.tokenizer[a], l = i[a];
          i[a] = (...p) => {
            let c = o.apply(i, p);
            return c === false && (c = l.apply(i, p)), c;
          };
        }
        r.tokenizer = i;
      }
      if (n.hooks) {
        let i = this.defaults.hooks || new S;
        for (let s in n.hooks) {
          if (!(s in i))
            throw new Error(`hook '${s}' does not exist`);
          if (["options", "block"].includes(s))
            continue;
          let a = s, o = n.hooks[a], l = i[a];
          S.passThroughHooks.has(s) ? i[a] = (p) => {
            if (this.defaults.async && S.passThroughHooksRespectAsync.has(s))
              return (async () => {
                let g = await o.call(i, p);
                return l.call(i, g);
              })();
            let c = o.call(i, p);
            return l.call(i, c);
          } : i[a] = (...p) => {
            if (this.defaults.async)
              return (async () => {
                let g = await o.apply(i, p);
                return g === false && (g = await l.apply(i, p)), g;
              })();
            let c = o.apply(i, p);
            return c === false && (c = l.apply(i, p)), c;
          };
        }
        r.hooks = i;
      }
      if (n.walkTokens) {
        let i = this.defaults.walkTokens, s = n.walkTokens;
        r.walkTokens = function(a) {
          let o = [];
          return o.push(s.call(this, a)), i && (o = o.concat(i.call(this, a))), o;
        };
      }
      this.defaults = { ...this.defaults, ...r };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t2) {
    return x.lex(e, t2 ?? this.defaults);
  }
  parser(e, t2) {
    return b.parse(e, t2 ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, r) => {
      let i = { ...r }, s = { ...this.defaults, ...i }, a = this.onError(!!s.silent, !!s.async);
      if (this.defaults.async === true && i.async === false)
        return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null)
        return a(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string")
        return a(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (s.hooks && (s.hooks.options = s, s.hooks.block = e), s.async)
        return (async () => {
          let o = s.hooks ? await s.hooks.preprocess(n) : n, p = await (s.hooks ? await s.hooks.provideLexer() : e ? x.lex : x.lexInline)(o, s), c = s.hooks ? await s.hooks.processAllTokens(p) : p;
          s.walkTokens && await Promise.all(this.walkTokens(c, s.walkTokens));
          let h2 = await (s.hooks ? await s.hooks.provideParser() : e ? b.parse : b.parseInline)(c, s);
          return s.hooks ? await s.hooks.postprocess(h2) : h2;
        })().catch(a);
      try {
        s.hooks && (n = s.hooks.preprocess(n));
        let l = (s.hooks ? s.hooks.provideLexer() : e ? x.lex : x.lexInline)(n, s);
        s.hooks && (l = s.hooks.processAllTokens(l)), s.walkTokens && this.walkTokens(l, s.walkTokens);
        let c = (s.hooks ? s.hooks.provideParser() : e ? b.parse : b.parseInline)(l, s);
        return s.hooks && (c = s.hooks.postprocess(c)), c;
      } catch (o) {
        return a(o);
      }
    };
  }
  onError(e, t2) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let r = "<p>An error occurred:</p><pre>" + w(n.message + "", true) + "</pre>";
        return t2 ? Promise.resolve(r) : r;
      }
      if (t2)
        return Promise.reject(n);
      throw n;
    };
  }
};
var _ = new B;
function d(u3, e) {
  return _.parse(u3, e);
}
d.options = d.setOptions = function(u3) {
  return _.setOptions(u3), d.defaults = _.defaults, Z(d.defaults), d;
};
d.getDefaults = L;
d.defaults = T;
d.use = function(...u3) {
  return _.use(...u3), d.defaults = _.defaults, Z(d.defaults), d;
};
d.walkTokens = function(u3, e) {
  return _.walkTokens(u3, e);
};
d.parseInline = _.parseInline;
d.Parser = b;
d.parser = b.parse;
d.Renderer = P;
d.TextRenderer = $;
d.Lexer = x;
d.lexer = x.lex;
d.Tokenizer = y;
d.Hooks = S;
d.parse = d;
var Dt = d.options;
var Ht = d.setOptions;
var Zt = d.use;
var Gt = d.walkTokens;
var Nt = d.parseInline;
var Ft = b.parse;
var jt = x.lex;

// src/renderables/markdown-parser.ts
function parseMarkdownIncremental(newContent, prevState, trailingUnstable = 2) {
  if (!prevState || prevState.tokens.length === 0) {
    try {
      const tokens = x.lex(newContent, { gfm: true });
      return { content: newContent, tokens };
    } catch {
      return { content: newContent, tokens: [] };
    }
  }
  let offset = 0;
  let reuseCount = 0;
  for (const token of prevState.tokens) {
    const tokenEnd = offset + token.raw.length;
    if (tokenEnd <= newContent.length && newContent.slice(offset, tokenEnd) === token.raw) {
      reuseCount++;
      offset = tokenEnd;
    } else {
      break;
    }
  }
  reuseCount = Math.max(0, reuseCount - trailingUnstable);
  offset = 0;
  for (let i = 0;i < reuseCount; i++) {
    offset += prevState.tokens[i].raw.length;
  }
  const stableTokens = prevState.tokens.slice(0, reuseCount);
  const remainingContent = newContent.slice(offset);
  if (!remainingContent) {
    return { content: newContent, tokens: stableTokens };
  }
  try {
    const newTokens = x.lex(remainingContent, { gfm: true });
    return { content: newContent, tokens: [...stableTokens, ...newTokens] };
  } catch {
    return { content: newContent, tokens: stableTokens };
  }
}

// src/renderables/Markdown.ts
class MarkdownRenderable extends Renderable {
  _content = "";
  _syntaxStyle;
  _conceal;
  _treeSitterClient;
  _renderNode;
  _parseState = null;
  _streaming = false;
  _blockStates = [];
  _styleDirty = false;
  _contentDefaultOptions = {
    content: "",
    conceal: true,
    streaming: false
  };
  constructor(ctx, options) {
    super(ctx, {
      ...options,
      flexDirection: "column"
    });
    this._syntaxStyle = options.syntaxStyle;
    this._conceal = options.conceal ?? this._contentDefaultOptions.conceal;
    this._content = options.content ?? this._contentDefaultOptions.content;
    this._treeSitterClient = options.treeSitterClient;
    this._renderNode = options.renderNode;
    this._streaming = options.streaming ?? this._contentDefaultOptions.streaming;
    this.updateBlocks();
  }
  get content() {
    return this._content;
  }
  set content(value) {
    if (this._content !== value) {
      this._content = value;
      this.updateBlocks();
      this.requestRender();
    }
  }
  get syntaxStyle() {
    return this._syntaxStyle;
  }
  set syntaxStyle(value) {
    if (this._syntaxStyle !== value) {
      this._syntaxStyle = value;
      this._styleDirty = true;
    }
  }
  get conceal() {
    return this._conceal;
  }
  set conceal(value) {
    if (this._conceal !== value) {
      this._conceal = value;
      this._styleDirty = true;
    }
  }
  get streaming() {
    return this._streaming;
  }
  set streaming(value) {
    if (this._streaming !== value) {
      this._streaming = value;
      this.updateBlocks();
      this.requestRender();
    }
  }
  getStyle(group) {
    let style = this._syntaxStyle.getStyle(group);
    if (!style && group.includes(".")) {
      const baseName = group.split(".")[0];
      style = this._syntaxStyle.getStyle(baseName);
    }
    return style;
  }
  createChunk(text, group) {
    const style = this.getStyle(group) || this.getStyle("default");
    return {
      __isChunk: true,
      text,
      fg: style?.fg,
      bg: style?.bg,
      attributes: style ? createTextAttributes({
        bold: style.bold,
        italic: style.italic,
        underline: style.underline,
        dim: style.dim
      }) : 0
    };
  }
  createDefaultChunk(text) {
    return this.createChunk(text, "default");
  }
  renderInlineContent(tokens, chunks) {
    for (const token of tokens) {
      this.renderInlineToken(token, chunks);
    }
  }
  renderInlineToken(token, chunks) {
    switch (token.type) {
      case "text":
        chunks.push(this.createDefaultChunk(token.text));
        break;
      case "escape":
        chunks.push(this.createDefaultChunk(token.text));
        break;
      case "codespan":
        if (this._conceal) {
          chunks.push(this.createChunk(token.text, "markup.raw"));
        } else {
          chunks.push(this.createChunk("`", "markup.raw"));
          chunks.push(this.createChunk(token.text, "markup.raw"));
          chunks.push(this.createChunk("`", "markup.raw"));
        }
        break;
      case "strong":
        if (!this._conceal) {
          chunks.push(this.createChunk("**", "markup.strong"));
        }
        for (const child of token.tokens) {
          this.renderInlineTokenWithStyle(child, chunks, "markup.strong");
        }
        if (!this._conceal) {
          chunks.push(this.createChunk("**", "markup.strong"));
        }
        break;
      case "em":
        if (!this._conceal) {
          chunks.push(this.createChunk("*", "markup.italic"));
        }
        for (const child of token.tokens) {
          this.renderInlineTokenWithStyle(child, chunks, "markup.italic");
        }
        if (!this._conceal) {
          chunks.push(this.createChunk("*", "markup.italic"));
        }
        break;
      case "del":
        if (!this._conceal) {
          chunks.push(this.createChunk("~~", "markup.strikethrough"));
        }
        for (const child of token.tokens) {
          this.renderInlineTokenWithStyle(child, chunks, "markup.strikethrough");
        }
        if (!this._conceal) {
          chunks.push(this.createChunk("~~", "markup.strikethrough"));
        }
        break;
      case "link":
        if (this._conceal) {
          for (const child of token.tokens) {
            this.renderInlineTokenWithStyle(child, chunks, "markup.link.label");
          }
          chunks.push(this.createChunk(" (", "markup.link"));
          chunks.push(this.createChunk(token.href, "markup.link.url"));
          chunks.push(this.createChunk(")", "markup.link"));
        } else {
          chunks.push(this.createChunk("[", "markup.link"));
          for (const child of token.tokens) {
            this.renderInlineTokenWithStyle(child, chunks, "markup.link.label");
          }
          chunks.push(this.createChunk("](", "markup.link"));
          chunks.push(this.createChunk(token.href, "markup.link.url"));
          chunks.push(this.createChunk(")", "markup.link"));
        }
        break;
      case "image":
        if (this._conceal) {
          chunks.push(this.createChunk(token.text || "image", "markup.link.label"));
        } else {
          chunks.push(this.createChunk("![", "markup.link"));
          chunks.push(this.createChunk(token.text || "", "markup.link.label"));
          chunks.push(this.createChunk("](", "markup.link"));
          chunks.push(this.createChunk(token.href, "markup.link.url"));
          chunks.push(this.createChunk(")", "markup.link"));
        }
        break;
      case "br":
        chunks.push(this.createDefaultChunk(`
`));
        break;
      default:
        if ("tokens" in token && Array.isArray(token.tokens)) {
          this.renderInlineContent(token.tokens, chunks);
        } else if ("text" in token && typeof token.text === "string") {
          chunks.push(this.createDefaultChunk(token.text));
        }
        break;
    }
  }
  renderInlineTokenWithStyle(token, chunks, styleGroup) {
    switch (token.type) {
      case "text":
        chunks.push(this.createChunk(token.text, styleGroup));
        break;
      case "escape":
        chunks.push(this.createChunk(token.text, styleGroup));
        break;
      case "codespan":
        if (this._conceal) {
          chunks.push(this.createChunk(token.text, "markup.raw"));
        } else {
          chunks.push(this.createChunk("`", "markup.raw"));
          chunks.push(this.createChunk(token.text, "markup.raw"));
          chunks.push(this.createChunk("`", "markup.raw"));
        }
        break;
      default:
        this.renderInlineToken(token, chunks);
        break;
    }
  }
  renderHeadingChunks(token) {
    const chunks = [];
    const group = `markup.heading.${token.depth}`;
    const marker = "#".repeat(token.depth) + " ";
    if (!this._conceal) {
      chunks.push(this.createChunk(marker, group));
    }
    for (const child of token.tokens) {
      this.renderInlineTokenWithStyle(child, chunks, group);
    }
    return chunks;
  }
  renderParagraphChunks(token) {
    const chunks = [];
    this.renderInlineContent(token.tokens, chunks);
    return chunks;
  }
  renderBlockquoteChunks(token) {
    const chunks = [];
    for (const child of token.tokens) {
      chunks.push(this.createChunk("> ", "punctuation.special"));
      const childChunks = this.renderTokenToChunks(child);
      chunks.push(...childChunks);
      chunks.push(this.createDefaultChunk(`
`));
    }
    return chunks;
  }
  renderListChunks(token) {
    const chunks = [];
    let index = typeof token.start === "number" ? token.start : 1;
    for (const item of token.items) {
      if (token.ordered) {
        chunks.push(this.createChunk(`${index}. `, "markup.list"));
        index++;
      } else {
        chunks.push(this.createChunk("- ", "markup.list"));
      }
      for (let i = 0;i < item.tokens.length; i++) {
        const child = item.tokens[i];
        if (child.type === "text" && i === 0 && "tokens" in child && child.tokens) {
          this.renderInlineContent(child.tokens, chunks);
          chunks.push(this.createDefaultChunk(`
`));
        } else if (child.type === "paragraph" && i === 0) {
          this.renderInlineContent(child.tokens, chunks);
          chunks.push(this.createDefaultChunk(`
`));
        } else {
          const childChunks = this.renderTokenToChunks(child);
          chunks.push(...childChunks);
          chunks.push(this.createDefaultChunk(`
`));
        }
      }
    }
    return chunks;
  }
  renderThematicBreakChunks() {
    return [this.createChunk("---", "punctuation.special")];
  }
  renderTokenToChunks(token) {
    switch (token.type) {
      case "heading":
        return this.renderHeadingChunks(token);
      case "paragraph":
        return this.renderParagraphChunks(token);
      case "blockquote":
        return this.renderBlockquoteChunks(token);
      case "list":
        return this.renderListChunks(token);
      case "hr":
        return this.renderThematicBreakChunks();
      case "space":
        return [];
      default:
        if ("raw" in token && token.raw) {
          return [this.createDefaultChunk(token.raw)];
        }
        return [];
    }
  }
  createTextRenderable(chunks, id, marginBottom = 0) {
    return new TextRenderable(this.ctx, {
      id,
      content: new StyledText(chunks),
      width: "100%",
      marginBottom
    });
  }
  createCodeRenderable(token, id, marginBottom = 0) {
    return new CodeRenderable(this.ctx, {
      id,
      content: token.text,
      filetype: token.lang || undefined,
      syntaxStyle: this._syntaxStyle,
      conceal: this._conceal,
      treeSitterClient: this._treeSitterClient,
      width: "100%",
      marginBottom
    });
  }
  updateTableRenderable(tableBox, table, marginBottom) {
    tableBox.marginBottom = marginBottom;
    const borderColor = this.getStyle("conceal")?.fg ?? "#888888";
    const headingStyle = this.getStyle("markup.heading") || this.getStyle("default");
    const rowsToRender = this._streaming && table.rows.length > 0 ? table.rows.slice(0, -1) : table.rows;
    const colCount = table.header.length;
    const columns = tableBox._childrenInLayoutOrder;
    for (let col = 0;col < colCount; col++) {
      const columnBox = columns[col];
      if (!columnBox)
        continue;
      if (columnBox instanceof BoxRenderable) {
        columnBox.borderColor = borderColor;
      }
      const columnChildren = columnBox._childrenInLayoutOrder;
      const headerBox = columnChildren[0];
      if (headerBox instanceof BoxRenderable) {
        headerBox.borderColor = borderColor;
        const headerChildren = headerBox._childrenInLayoutOrder;
        const headerText = headerChildren[0];
        if (headerText instanceof TextRenderable) {
          const headerCell = table.header[col];
          const headerChunks = [];
          this.renderInlineContent(headerCell.tokens, headerChunks);
          const styledHeaderChunks = headerChunks.map((chunk) => ({
            ...chunk,
            fg: headingStyle?.fg ?? chunk.fg,
            bg: headingStyle?.bg ?? chunk.bg,
            attributes: headingStyle ? createTextAttributes({
              bold: headingStyle.bold,
              italic: headingStyle.italic,
              underline: headingStyle.underline,
              dim: headingStyle.dim
            }) : chunk.attributes
          }));
          headerText.content = new StyledText(styledHeaderChunks);
        }
      }
      for (let row = 0;row < rowsToRender.length; row++) {
        const childIndex = row + 1;
        const cellContainer = columnChildren[childIndex];
        let cellText;
        if (cellContainer instanceof BoxRenderable) {
          cellContainer.borderColor = borderColor;
          const cellChildren = cellContainer._childrenInLayoutOrder;
          cellText = cellChildren[0];
        } else if (cellContainer instanceof TextRenderable) {
          cellText = cellContainer;
        }
        if (cellText) {
          const cell = rowsToRender[row][col];
          const cellChunks = [];
          if (cell) {
            this.renderInlineContent(cell.tokens, cellChunks);
          }
          cellText.content = new StyledText(cellChunks.length > 0 ? cellChunks : [this.createDefaultChunk(" ")]);
        }
      }
    }
  }
  createTableRenderable(table, id, marginBottom = 0) {
    const colCount = table.header.length;
    const rowsToRender = this._streaming && table.rows.length > 0 ? table.rows.slice(0, -1) : table.rows;
    if (colCount === 0 || rowsToRender.length === 0) {
      return this.createTextRenderable([this.createDefaultChunk(table.raw)], id, marginBottom);
    }
    const tableBox = new BoxRenderable(this.ctx, {
      id,
      flexDirection: "row",
      marginBottom
    });
    const borderColor = this.getStyle("conceal")?.fg ?? "#888888";
    for (let col = 0;col < colCount; col++) {
      const isFirstCol = col === 0;
      const isLastCol = col === colCount - 1;
      const columnBox = new BoxRenderable(this.ctx, {
        id: `${id}-col-${col}`,
        flexDirection: "column",
        border: isLastCol ? true : ["top", "bottom", "left"],
        borderColor,
        customBorderChars: isFirstCol ? undefined : {
          topLeft: "\u252C",
          topRight: "\u2510",
          bottomLeft: "\u2534",
          bottomRight: "\u2518",
          horizontal: "\u2500",
          vertical: "\u2502",
          topT: "\u252C",
          bottomT: "\u2534",
          leftT: "\u251C",
          rightT: "\u2524",
          cross: "\u253C"
        }
      });
      const headerCell = table.header[col];
      const headerChunks = [];
      this.renderInlineContent(headerCell.tokens, headerChunks);
      const headingStyle = this.getStyle("markup.heading") || this.getStyle("default");
      const styledHeaderChunks = headerChunks.map((chunk) => ({
        ...chunk,
        fg: headingStyle?.fg ?? chunk.fg,
        bg: headingStyle?.bg ?? chunk.bg,
        attributes: headingStyle ? createTextAttributes({
          bold: headingStyle.bold,
          italic: headingStyle.italic,
          underline: headingStyle.underline,
          dim: headingStyle.dim
        }) : chunk.attributes
      }));
      const headerBox = new BoxRenderable(this.ctx, {
        id: `${id}-col-${col}-header-box`,
        border: ["bottom"],
        borderColor
      });
      headerBox.add(new TextRenderable(this.ctx, {
        id: `${id}-col-${col}-header`,
        content: new StyledText(styledHeaderChunks),
        height: 1,
        overflow: "hidden",
        paddingLeft: 1,
        paddingRight: 1
      }));
      columnBox.add(headerBox);
      for (let row = 0;row < rowsToRender.length; row++) {
        const cell = rowsToRender[row][col];
        const cellChunks = [];
        if (cell) {
          this.renderInlineContent(cell.tokens, cellChunks);
        }
        const isLastRow = row === rowsToRender.length - 1;
        const cellText = new TextRenderable(this.ctx, {
          id: `${id}-col-${col}-row-${row}`,
          content: new StyledText(cellChunks.length > 0 ? cellChunks : [this.createDefaultChunk(" ")]),
          height: 1,
          overflow: "hidden",
          paddingLeft: 1,
          paddingRight: 1
        });
        if (isLastRow) {
          columnBox.add(cellText);
        } else {
          const cellBox = new BoxRenderable(this.ctx, {
            id: `${id}-col-${col}-row-${row}-box`,
            border: ["bottom"],
            borderColor
          });
          cellBox.add(cellText);
          columnBox.add(cellBox);
        }
      }
      tableBox.add(columnBox);
    }
    return tableBox;
  }
  createDefaultRenderable(token, index, hasNextToken = false) {
    const id = `${this.id}-block-${index}`;
    const marginBottom = hasNextToken ? 1 : 0;
    if (token.type === "code") {
      return this.createCodeRenderable(token, id, marginBottom);
    }
    if (token.type === "table") {
      return this.createTableRenderable(token, id, marginBottom);
    }
    if (token.type === "space") {
      return null;
    }
    const chunks = this.renderTokenToChunks(token);
    if (chunks.length === 0) {
      return null;
    }
    return this.createTextRenderable(chunks, id, marginBottom);
  }
  updateBlockRenderable(state, token, index, hasNextToken) {
    const marginBottom = hasNextToken ? 1 : 0;
    if (token.type === "code") {
      const codeRenderable = state.renderable;
      const codeToken = token;
      codeRenderable.content = codeToken.text;
      if (codeToken.lang) {
        codeRenderable.filetype = codeToken.lang;
      }
      codeRenderable.marginBottom = marginBottom;
      return;
    }
    if (token.type === "table") {
      const prevTable = state.token;
      const newTable = token;
      if (this._streaming) {
        const prevCompleteRows = Math.max(0, prevTable.rows.length - 1);
        const newCompleteRows = Math.max(0, newTable.rows.length - 1);
        const prevIsRawFallback = prevTable.header.length === 0 || prevCompleteRows === 0;
        const newIsRawFallback = newTable.header.length === 0 || newCompleteRows === 0;
        if (prevCompleteRows === newCompleteRows && prevTable.header.length === newTable.header.length) {
          if (prevIsRawFallback && newIsRawFallback && prevTable.raw !== newTable.raw) {
            const textRenderable2 = state.renderable;
            textRenderable2.content = new StyledText([this.createDefaultChunk(newTable.raw)]);
            textRenderable2.marginBottom = marginBottom;
          }
          return;
        }
      }
      this.remove(state.renderable.id);
      const newRenderable = this.createTableRenderable(newTable, `${this.id}-block-${index}`, marginBottom);
      this.add(newRenderable);
      state.renderable = newRenderable;
      return;
    }
    const textRenderable = state.renderable;
    const chunks = this.renderTokenToChunks(token);
    textRenderable.content = new StyledText(chunks);
    textRenderable.marginBottom = marginBottom;
  }
  updateBlocks() {
    if (!this._content) {
      for (const state of this._blockStates) {
        this.remove(state.renderable.id);
      }
      this._blockStates = [];
      this._parseState = null;
      return;
    }
    const trailingUnstable = this._streaming ? 2 : 0;
    this._parseState = parseMarkdownIncremental(this._content, this._parseState, trailingUnstable);
    const tokens = this._parseState.tokens;
    if (tokens.length === 0 && this._content.length > 0) {
      for (const state of this._blockStates) {
        this.remove(state.renderable.id);
      }
      const text = this.createTextRenderable([this.createDefaultChunk(this._content)], `${this.id}-fallback`);
      this.add(text);
      this._blockStates = [
        {
          token: { type: "text", raw: this._content, text: this._content },
          tokenRaw: this._content,
          renderable: text
        }
      ];
      return;
    }
    const blockTokens = [];
    for (let i = 0;i < tokens.length; i++) {
      if (tokens[i].type !== "space") {
        blockTokens.push({ token: tokens[i], originalIndex: i });
      }
    }
    const lastBlockIndex = blockTokens.length - 1;
    let blockIndex = 0;
    for (let i = 0;i < blockTokens.length; i++) {
      const { token } = blockTokens[i];
      const hasNextToken = i < lastBlockIndex;
      const existing = this._blockStates[blockIndex];
      if (existing && existing.token === token) {
        blockIndex++;
        continue;
      }
      if (existing && existing.tokenRaw === token.raw && existing.token.type === token.type) {
        existing.token = token;
        blockIndex++;
        continue;
      }
      if (existing && existing.token.type === token.type) {
        this.updateBlockRenderable(existing, token, blockIndex, hasNextToken);
        existing.token = token;
        existing.tokenRaw = token.raw;
        blockIndex++;
        continue;
      }
      if (existing) {
        this.remove(existing.renderable.id);
      }
      let renderable;
      if (this._renderNode) {
        const context = {
          syntaxStyle: this._syntaxStyle,
          conceal: this._conceal,
          treeSitterClient: this._treeSitterClient,
          defaultRender: () => this.createDefaultRenderable(token, blockIndex, hasNextToken)
        };
        const custom = this._renderNode(token, context);
        if (custom) {
          renderable = custom;
        }
      }
      if (!renderable) {
        renderable = this.createDefaultRenderable(token, blockIndex, hasNextToken) ?? undefined;
      }
      if (renderable) {
        this.add(renderable);
        this._blockStates[blockIndex] = {
          token,
          tokenRaw: token.raw,
          renderable
        };
      }
      blockIndex++;
    }
    while (this._blockStates.length > blockIndex) {
      const removed = this._blockStates.pop();
      this.remove(removed.renderable.id);
    }
  }
  clearBlockStates() {
    for (const state of this._blockStates) {
      this.remove(state.renderable.id);
    }
    this._blockStates = [];
  }
  rerenderBlocks() {
    for (let i = 0;i < this._blockStates.length; i++) {
      const state = this._blockStates[i];
      const hasNextToken = i < this._blockStates.length - 1;
      if (state.token.type === "code") {
        const codeRenderable = state.renderable;
        codeRenderable.syntaxStyle = this._syntaxStyle;
        codeRenderable.conceal = this._conceal;
      } else if (state.token.type === "table") {
        const marginBottom = hasNextToken ? 1 : 0;
        this.updateTableRenderable(state.renderable, state.token, marginBottom);
      } else {
        const textRenderable = state.renderable;
        const chunks = this.renderTokenToChunks(state.token);
        if (chunks.length > 0) {
          textRenderable.content = new StyledText(chunks);
        }
      }
    }
  }
  clearCache() {
    this._parseState = null;
    this.clearBlockStates();
    this.updateBlocks();
    this.requestRender();
  }
  renderSelf(buffer, deltaTime) {
    if (this._styleDirty) {
      this._styleDirty = false;
      this.rerenderBlocks();
    }
    super.renderSelf(buffer, deltaTime);
  }
}
// src/renderables/Slider.ts
var defaultThumbBackgroundColor = RGBA.fromHex("#9a9ea3");
var defaultTrackBackgroundColor = RGBA.fromHex("#252527");

class SliderRenderable extends Renderable {
  orientation;
  _value;
  _min;
  _max;
  _viewPortSize;
  _backgroundColor;
  _foregroundColor;
  _onChange;
  constructor(ctx, options) {
    super(ctx, { flexShrink: 0, ...options });
    this.orientation = options.orientation;
    this._min = options.min ?? 0;
    this._max = options.max ?? 100;
    this._value = options.value ?? this._min;
    this._viewPortSize = options.viewPortSize ?? Math.max(1, (this._max - this._min) * 0.1);
    this._onChange = options.onChange;
    this._backgroundColor = options.backgroundColor ? parseColor(options.backgroundColor) : defaultTrackBackgroundColor;
    this._foregroundColor = options.foregroundColor ? parseColor(options.foregroundColor) : defaultThumbBackgroundColor;
    this.setupMouseHandling();
  }
  get value() {
    return this._value;
  }
  set value(newValue) {
    const clamped = Math.max(this._min, Math.min(this._max, newValue));
    if (clamped !== this._value) {
      this._value = clamped;
      this._onChange?.(clamped);
      this.emit("change", { value: clamped });
      this.requestRender();
    }
  }
  get min() {
    return this._min;
  }
  set min(newMin) {
    if (newMin !== this._min) {
      this._min = newMin;
      if (this._value < newMin) {
        this.value = newMin;
      }
      this.requestRender();
    }
  }
  get max() {
    return this._max;
  }
  set max(newMax) {
    if (newMax !== this._max) {
      this._max = newMax;
      if (this._value > newMax) {
        this.value = newMax;
      }
      this.requestRender();
    }
  }
  set viewPortSize(size) {
    const clampedSize = Math.max(0.01, Math.min(size, this._max - this._min));
    if (clampedSize !== this._viewPortSize) {
      this._viewPortSize = clampedSize;
      this.requestRender();
    }
  }
  get viewPortSize() {
    return this._viewPortSize;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(value) {
    this._backgroundColor = parseColor(value);
    this.requestRender();
  }
  get foregroundColor() {
    return this._foregroundColor;
  }
  set foregroundColor(value) {
    this._foregroundColor = parseColor(value);
    this.requestRender();
  }
  calculateDragOffsetVirtual(event) {
    const trackStart = this.orientation === "vertical" ? this.y : this.x;
    const mousePos = (this.orientation === "vertical" ? event.y : event.x) - trackStart;
    const virtualMousePos = Math.max(0, Math.min((this.orientation === "vertical" ? this.height : this.width) * 2, mousePos * 2));
    const virtualThumbStart = this.getVirtualThumbStart();
    const virtualThumbSize = this.getVirtualThumbSize();
    return Math.max(0, Math.min(virtualThumbSize, virtualMousePos - virtualThumbStart));
  }
  setupMouseHandling() {
    let isDragging = false;
    let dragOffsetVirtual = 0;
    this.onMouseDown = (event) => {
      event.stopPropagation();
      event.preventDefault();
      const thumb = this.getThumbRect();
      const inThumb = event.x >= thumb.x && event.x < thumb.x + thumb.width && event.y >= thumb.y && event.y < thumb.y + thumb.height;
      if (inThumb) {
        isDragging = true;
        dragOffsetVirtual = this.calculateDragOffsetVirtual(event);
      } else {
        this.updateValueFromMouseDirect(event);
        isDragging = true;
        dragOffsetVirtual = this.calculateDragOffsetVirtual(event);
      }
    };
    this.onMouseDrag = (event) => {
      if (!isDragging)
        return;
      event.stopPropagation();
      this.updateValueFromMouseWithOffset(event, dragOffsetVirtual);
    };
    this.onMouseUp = (event) => {
      if (isDragging) {
        this.updateValueFromMouseWithOffset(event, dragOffsetVirtual);
      }
      isDragging = false;
    };
  }
  updateValueFromMouseDirect(event) {
    const trackStart = this.orientation === "vertical" ? this.y : this.x;
    const trackSize = this.orientation === "vertical" ? this.height : this.width;
    const mousePos = this.orientation === "vertical" ? event.y : event.x;
    const relativeMousePos = mousePos - trackStart;
    const clampedMousePos = Math.max(0, Math.min(trackSize, relativeMousePos));
    const ratio = trackSize === 0 ? 0 : clampedMousePos / trackSize;
    const range = this._max - this._min;
    const newValue = this._min + ratio * range;
    this.value = newValue;
  }
  updateValueFromMouseWithOffset(event, offsetVirtual) {
    const trackStart = this.orientation === "vertical" ? this.y : this.x;
    const trackSize = this.orientation === "vertical" ? this.height : this.width;
    const mousePos = this.orientation === "vertical" ? event.y : event.x;
    const virtualTrackSize = trackSize * 2;
    const relativeMousePos = mousePos - trackStart;
    const clampedMousePos = Math.max(0, Math.min(trackSize, relativeMousePos));
    const virtualMousePos = clampedMousePos * 2;
    const virtualThumbSize = this.getVirtualThumbSize();
    const maxThumbStart = Math.max(0, virtualTrackSize - virtualThumbSize);
    let desiredThumbStart = virtualMousePos - offsetVirtual;
    desiredThumbStart = Math.max(0, Math.min(maxThumbStart, desiredThumbStart));
    const ratio = maxThumbStart === 0 ? 0 : desiredThumbStart / maxThumbStart;
    const range = this._max - this._min;
    const newValue = this._min + ratio * range;
    this.value = newValue;
  }
  getThumbRect() {
    const virtualThumbSize = this.getVirtualThumbSize();
    const virtualThumbStart = this.getVirtualThumbStart();
    const realThumbStart = Math.floor(virtualThumbStart / 2);
    const realThumbSize = Math.ceil((virtualThumbStart + virtualThumbSize) / 2) - realThumbStart;
    if (this.orientation === "vertical") {
      return {
        x: this.x,
        y: this.y + realThumbStart,
        width: this.width,
        height: Math.max(1, realThumbSize)
      };
    } else {
      return {
        x: this.x + realThumbStart,
        y: this.y,
        width: Math.max(1, realThumbSize),
        height: this.height
      };
    }
  }
  renderSelf(buffer) {
    if (this.orientation === "horizontal") {
      this.renderHorizontal(buffer);
    } else {
      this.renderVertical(buffer);
    }
  }
  renderHorizontal(buffer) {
    const virtualThumbSize = this.getVirtualThumbSize();
    const virtualThumbStart = this.getVirtualThumbStart();
    const virtualThumbEnd = virtualThumbStart + virtualThumbSize;
    buffer.fillRect(this.x, this.y, this.width, this.height, this._backgroundColor);
    const realStartCell = Math.floor(virtualThumbStart / 2);
    const realEndCell = Math.ceil(virtualThumbEnd / 2) - 1;
    const startX = Math.max(0, realStartCell);
    const endX = Math.min(this.width - 1, realEndCell);
    for (let realX = startX;realX <= endX; realX++) {
      const virtualCellStart = realX * 2;
      const virtualCellEnd = virtualCellStart + 2;
      const thumbStartInCell = Math.max(virtualThumbStart, virtualCellStart);
      const thumbEndInCell = Math.min(virtualThumbEnd, virtualCellEnd);
      const coverage = thumbEndInCell - thumbStartInCell;
      let char = " ";
      if (coverage >= 2) {
        char = "\u2588";
      } else {
        const isLeftHalf = thumbStartInCell === virtualCellStart;
        if (isLeftHalf) {
          char = "\u258C";
        } else {
          char = "\u2590";
        }
      }
      for (let y2 = 0;y2 < this.height; y2++) {
        buffer.setCellWithAlphaBlending(this.x + realX, this.y + y2, char, this._foregroundColor, this._backgroundColor);
      }
    }
  }
  renderVertical(buffer) {
    const virtualThumbSize = this.getVirtualThumbSize();
    const virtualThumbStart = this.getVirtualThumbStart();
    const virtualThumbEnd = virtualThumbStart + virtualThumbSize;
    buffer.fillRect(this.x, this.y, this.width, this.height, this._backgroundColor);
    const realStartCell = Math.floor(virtualThumbStart / 2);
    const realEndCell = Math.ceil(virtualThumbEnd / 2) - 1;
    const startY = Math.max(0, realStartCell);
    const endY = Math.min(this.height - 1, realEndCell);
    for (let realY = startY;realY <= endY; realY++) {
      const virtualCellStart = realY * 2;
      const virtualCellEnd = virtualCellStart + 2;
      const thumbStartInCell = Math.max(virtualThumbStart, virtualCellStart);
      const thumbEndInCell = Math.min(virtualThumbEnd, virtualCellEnd);
      const coverage = thumbEndInCell - thumbStartInCell;
      let char = " ";
      if (coverage >= 2) {
        char = "\u2588";
      } else if (coverage > 0) {
        const virtualPositionInCell = thumbStartInCell - virtualCellStart;
        if (virtualPositionInCell === 0) {
          char = "\u2580";
        } else {
          char = "\u2584";
        }
      }
      for (let x2 = 0;x2 < this.width; x2++) {
        buffer.setCellWithAlphaBlending(this.x + x2, this.y + realY, char, this._foregroundColor, this._backgroundColor);
      }
    }
  }
  getVirtualThumbSize() {
    const virtualTrackSize = this.orientation === "vertical" ? this.height * 2 : this.width * 2;
    const range = this._max - this._min;
    if (range === 0)
      return virtualTrackSize;
    const viewportSize = Math.max(1, this._viewPortSize);
    const contentSize = range + viewportSize;
    if (contentSize <= viewportSize)
      return virtualTrackSize;
    const thumbRatio = viewportSize / contentSize;
    const calculatedSize = Math.floor(virtualTrackSize * thumbRatio);
    return Math.max(1, Math.min(calculatedSize, virtualTrackSize));
  }
  getVirtualThumbStart() {
    const virtualTrackSize = this.orientation === "vertical" ? this.height * 2 : this.width * 2;
    const range = this._max - this._min;
    if (range === 0)
      return 0;
    const valueRatio = (this._value - this._min) / range;
    const virtualThumbSize = this.getVirtualThumbSize();
    return Math.round(valueRatio * (virtualTrackSize - virtualThumbSize));
  }
}

// src/renderables/ScrollBar.ts
class ScrollBarRenderable extends Renderable {
  slider;
  startArrow;
  endArrow;
  orientation;
  _focusable = true;
  _scrollSize = 0;
  _scrollPosition = 0;
  _viewportSize = 0;
  _showArrows = false;
  _manualVisibility = false;
  _onChange;
  scrollStep = null;
  get visible() {
    return super.visible;
  }
  set visible(value) {
    this._manualVisibility = true;
    super.visible = value;
  }
  resetVisibilityControl() {
    this._manualVisibility = false;
    this.recalculateVisibility();
  }
  get scrollSize() {
    return this._scrollSize;
  }
  get scrollPosition() {
    return this._scrollPosition;
  }
  get viewportSize() {
    return this._viewportSize;
  }
  set scrollSize(value) {
    if (value === this.scrollSize)
      return;
    this._scrollSize = value;
    this.recalculateVisibility();
    this.updateSliderFromScrollState();
    this.scrollPosition = this.scrollPosition;
  }
  set scrollPosition(value) {
    const newPosition = Math.round(Math.min(Math.max(0, value), this.scrollSize - this.viewportSize));
    if (newPosition !== this._scrollPosition) {
      this._scrollPosition = newPosition;
      this.updateSliderFromScrollState();
    }
  }
  set viewportSize(value) {
    if (value === this.viewportSize)
      return;
    this._viewportSize = value;
    this.slider.viewPortSize = Math.max(1, this._viewportSize);
    this.recalculateVisibility();
    this.updateSliderFromScrollState();
    this.scrollPosition = this.scrollPosition;
  }
  get showArrows() {
    return this._showArrows;
  }
  set showArrows(value) {
    if (value === this._showArrows)
      return;
    this._showArrows = value;
    this.startArrow.visible = value;
    this.endArrow.visible = value;
  }
  constructor(ctx, { trackOptions, arrowOptions, orientation, showArrows = false, ...options }) {
    super(ctx, {
      flexDirection: orientation === "vertical" ? "column" : "row",
      alignSelf: "stretch",
      alignItems: "stretch",
      ...options
    });
    this._onChange = options.onChange;
    this.orientation = orientation;
    this._showArrows = showArrows;
    const scrollRange = Math.max(0, this._scrollSize - this._viewportSize);
    const defaultStepSize = Math.max(1, this._viewportSize);
    const stepSize = trackOptions?.viewPortSize ?? defaultStepSize;
    this.slider = new SliderRenderable(ctx, {
      orientation,
      min: 0,
      max: scrollRange,
      value: this._scrollPosition,
      viewPortSize: stepSize,
      onChange: (value) => {
        this._scrollPosition = Math.round(value);
        this._onChange?.(this._scrollPosition);
        this.emit("change", { position: this._scrollPosition });
      },
      ...orientation === "vertical" ? {
        width: Math.max(1, Math.min(2, this.width)),
        height: "100%",
        marginLeft: "auto"
      } : {
        width: "100%",
        height: 1,
        marginTop: "auto"
      },
      flexGrow: 1,
      flexShrink: 1,
      ...trackOptions
    });
    this.updateSliderFromScrollState();
    const arrowOpts = arrowOptions ? {
      foregroundColor: arrowOptions.backgroundColor,
      backgroundColor: arrowOptions.backgroundColor,
      attributes: arrowOptions.attributes,
      ...arrowOptions
    } : {};
    this.startArrow = new ArrowRenderable(ctx, {
      alignSelf: "center",
      visible: this.showArrows,
      direction: this.orientation === "vertical" ? "up" : "left",
      height: this.orientation === "vertical" ? 1 : 1,
      ...arrowOpts
    });
    this.endArrow = new ArrowRenderable(ctx, {
      alignSelf: "center",
      visible: this.showArrows,
      direction: this.orientation === "vertical" ? "down" : "right",
      height: this.orientation === "vertical" ? 1 : 1,
      ...arrowOpts
    });
    this.add(this.startArrow);
    this.add(this.slider);
    this.add(this.endArrow);
    let startArrowMouseTimeout = undefined;
    let endArrowMouseTimeout = undefined;
    this.startArrow.onMouseDown = (event) => {
      event.stopPropagation();
      event.preventDefault();
      this.scrollBy(-0.5, "viewport");
      startArrowMouseTimeout = setTimeout(() => {
        this.scrollBy(-0.5, "viewport");
        startArrowMouseTimeout = setInterval(() => {
          this.scrollBy(-0.2, "viewport");
        }, 200);
      }, 500);
    };
    this.startArrow.onMouseUp = (event) => {
      event.stopPropagation();
      clearInterval(startArrowMouseTimeout);
    };
    this.endArrow.onMouseDown = (event) => {
      event.stopPropagation();
      event.preventDefault();
      this.scrollBy(0.5, "viewport");
      endArrowMouseTimeout = setTimeout(() => {
        this.scrollBy(0.5, "viewport");
        endArrowMouseTimeout = setInterval(() => {
          this.scrollBy(0.2, "viewport");
        }, 200);
      }, 500);
    };
    this.endArrow.onMouseUp = (event) => {
      event.stopPropagation();
      clearInterval(endArrowMouseTimeout);
    };
  }
  set arrowOptions(options) {
    Object.assign(this.startArrow, options);
    Object.assign(this.endArrow, options);
    this.requestRender();
  }
  set trackOptions(options) {
    Object.assign(this.slider, options);
    this.requestRender();
  }
  updateSliderFromScrollState() {
    const scrollRange = Math.max(0, this._scrollSize - this._viewportSize);
    this.slider.min = 0;
    this.slider.max = scrollRange;
    this.slider.value = Math.min(this._scrollPosition, scrollRange);
  }
  scrollBy(delta, unit = "absolute") {
    const multiplier = unit === "viewport" ? this.viewportSize : unit === "content" ? this.scrollSize : unit === "step" ? this.scrollStep ?? 1 : 1;
    const resolvedDelta = multiplier * delta;
    this.scrollPosition += resolvedDelta;
  }
  recalculateVisibility() {
    if (!this._manualVisibility) {
      const sizeRatio = this.scrollSize <= this.viewportSize ? 1 : this.viewportSize / this.scrollSize;
      super.visible = sizeRatio < 1;
    }
  }
  handleKeyPress(key) {
    switch (key.name) {
      case "left":
      case "h":
        if (this.orientation !== "horizontal")
          return false;
        this.scrollBy(-1 / 5, "viewport");
        return true;
      case "right":
      case "l":
        if (this.orientation !== "horizontal")
          return false;
        this.scrollBy(1 / 5, "viewport");
        return true;
      case "up":
      case "k":
        if (this.orientation !== "vertical")
          return false;
        this.scrollBy(-1 / 5, "viewport");
        return true;
      case "down":
      case "j":
        if (this.orientation !== "vertical")
          return false;
        this.scrollBy(1 / 5, "viewport");
        return true;
      case "pageup":
        this.scrollBy(-1 / 2, "viewport");
        return true;
      case "pagedown":
        this.scrollBy(1 / 2, "viewport");
        return true;
      case "home":
        this.scrollBy(-1, "content");
        return true;
      case "end":
        this.scrollBy(1, "content");
        return true;
    }
    return false;
  }
}

class ArrowRenderable extends Renderable {
  _direction;
  _foregroundColor;
  _backgroundColor;
  _attributes;
  _arrowChars;
  constructor(ctx, options) {
    super(ctx, options);
    this._direction = options.direction;
    this._foregroundColor = options.foregroundColor ? parseColor(options.foregroundColor) : RGBA.fromValues(1, 1, 1, 1);
    this._backgroundColor = options.backgroundColor ? parseColor(options.backgroundColor) : RGBA.fromValues(0, 0, 0, 0);
    this._attributes = options.attributes ?? 0;
    this._arrowChars = {
      up: "\u25B2",
      down: "\u25BC",
      left: "\u25C0",
      right: "\u25B6",
      ...options.arrowChars
    };
    if (!options.width) {
      this.width = Bun.stringWidth(this.getArrowChar());
    }
  }
  get direction() {
    return this._direction;
  }
  set direction(value) {
    if (this._direction !== value) {
      this._direction = value;
      this.requestRender();
    }
  }
  get foregroundColor() {
    return this._foregroundColor;
  }
  set foregroundColor(value) {
    if (this._foregroundColor !== value) {
      this._foregroundColor = parseColor(value);
      this.requestRender();
    }
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(value) {
    if (this._backgroundColor !== value) {
      this._backgroundColor = parseColor(value);
      this.requestRender();
    }
  }
  get attributes() {
    return this._attributes;
  }
  set attributes(value) {
    if (this._attributes !== value) {
      this._attributes = value;
      this.requestRender();
    }
  }
  set arrowChars(value) {
    this._arrowChars = {
      ...this._arrowChars,
      ...value
    };
    this.requestRender();
  }
  renderSelf(buffer) {
    const char = this.getArrowChar();
    buffer.drawText(char, this.x, this.y, this._foregroundColor, this._backgroundColor, this._attributes);
  }
  getArrowChar() {
    switch (this._direction) {
      case "up":
        return this._arrowChars.up;
      case "down":
        return this._arrowChars.down;
      case "left":
        return this._arrowChars.left;
      case "right":
        return this._arrowChars.right;
      default:
        return "?";
    }
  }
}
// src/renderables/ScrollBox.ts
class ContentRenderable extends BoxRenderable {
  viewport;
  _viewportCulling;
  constructor(ctx, viewport, viewportCulling, options) {
    super(ctx, options);
    this.viewport = viewport;
    this._viewportCulling = viewportCulling;
  }
  get viewportCulling() {
    return this._viewportCulling;
  }
  set viewportCulling(value) {
    this._viewportCulling = value;
  }
  _getVisibleChildren() {
    if (this._viewportCulling) {
      return getObjectsInViewport(this.viewport, this.getChildrenSortedByPrimaryAxis(), this.primaryAxis, 0).map((child) => child.num);
    }
    return this.getChildrenSortedByPrimaryAxis().map((child) => child.num);
  }
}

class ScrollBoxRenderable extends BoxRenderable {
  static idCounter = 0;
  internalId = 0;
  wrapper;
  viewport;
  content;
  horizontalScrollBar;
  verticalScrollBar;
  _focusable = true;
  selectionListener;
  autoScrollMouseX = 0;
  autoScrollMouseY = 0;
  autoScrollThresholdVertical = 3;
  autoScrollThresholdHorizontal = 3;
  autoScrollSpeedSlow = 6;
  autoScrollSpeedMedium = 36;
  autoScrollSpeedFast = 72;
  isAutoScrolling = false;
  cachedAutoScrollSpeed = 3;
  autoScrollAccumulatorX = 0;
  autoScrollAccumulatorY = 0;
  scrollAccumulatorX = 0;
  scrollAccumulatorY = 0;
  _stickyScroll;
  _stickyScrollTop = false;
  _stickyScrollBottom = false;
  _stickyScrollLeft = false;
  _stickyScrollRight = false;
  _stickyStart;
  _hasManualScroll = false;
  _isApplyingStickyScroll = false;
  scrollAccel;
  get stickyScroll() {
    return this._stickyScroll;
  }
  set stickyScroll(value) {
    this._stickyScroll = value;
    this.updateStickyState();
  }
  get stickyStart() {
    return this._stickyStart;
  }
  set stickyStart(value) {
    this._stickyStart = value;
    this.updateStickyState();
  }
  get scrollTop() {
    return this.verticalScrollBar.scrollPosition;
  }
  set scrollTop(value) {
    this.verticalScrollBar.scrollPosition = value;
    if (!this._isApplyingStickyScroll) {
      const maxScrollTop = Math.max(0, this.scrollHeight - this.viewport.height);
      if (!this.isAtStickyPosition() && maxScrollTop > 1) {
        this._hasManualScroll = true;
      }
    }
    this.updateStickyState();
  }
  get scrollLeft() {
    return this.horizontalScrollBar.scrollPosition;
  }
  set scrollLeft(value) {
    this.horizontalScrollBar.scrollPosition = value;
    if (!this._isApplyingStickyScroll) {
      const maxScrollLeft = Math.max(0, this.scrollWidth - this.viewport.width);
      if (!this.isAtStickyPosition() && maxScrollLeft > 1) {
        this._hasManualScroll = true;
      }
    }
    this.updateStickyState();
  }
  get scrollWidth() {
    return this.horizontalScrollBar.scrollSize;
  }
  get scrollHeight() {
    return this.verticalScrollBar.scrollSize;
  }
  updateStickyState() {
    if (!this._stickyScroll)
      return;
    const maxScrollTop = Math.max(0, this.scrollHeight - this.viewport.height);
    const maxScrollLeft = Math.max(0, this.scrollWidth - this.viewport.width);
    if (this.scrollTop <= 0) {
      this._stickyScrollTop = true;
      this._stickyScrollBottom = false;
      if (this._stickyStart === "top" || this._stickyStart === "bottom" && maxScrollTop === 0) {
        this._hasManualScroll = false;
      }
    } else if (this.scrollTop >= maxScrollTop) {
      this._stickyScrollTop = false;
      this._stickyScrollBottom = true;
      if (this._stickyStart === "bottom") {
        this._hasManualScroll = false;
      }
    } else {
      this._stickyScrollTop = false;
      this._stickyScrollBottom = false;
    }
    if (this.scrollLeft <= 0) {
      this._stickyScrollLeft = true;
      this._stickyScrollRight = false;
      if (this._stickyStart === "left" || this._stickyStart === "right" && maxScrollLeft === 0) {
        this._hasManualScroll = false;
      }
    } else if (this.scrollLeft >= maxScrollLeft) {
      this._stickyScrollLeft = false;
      this._stickyScrollRight = true;
      if (this._stickyStart === "right") {
        this._hasManualScroll = false;
      }
    } else {
      this._stickyScrollLeft = false;
      this._stickyScrollRight = false;
    }
  }
  applyStickyStart(stickyStart) {
    this._isApplyingStickyScroll = true;
    switch (stickyStart) {
      case "top":
        this._stickyScrollTop = true;
        this._stickyScrollBottom = false;
        this.verticalScrollBar.scrollPosition = 0;
        break;
      case "bottom":
        this._stickyScrollTop = false;
        this._stickyScrollBottom = true;
        this.verticalScrollBar.scrollPosition = Math.max(0, this.scrollHeight - this.viewport.height);
        break;
      case "left":
        this._stickyScrollLeft = true;
        this._stickyScrollRight = false;
        this.horizontalScrollBar.scrollPosition = 0;
        break;
      case "right":
        this._stickyScrollLeft = false;
        this._stickyScrollRight = true;
        this.horizontalScrollBar.scrollPosition = Math.max(0, this.scrollWidth - this.viewport.width);
        break;
    }
    this._isApplyingStickyScroll = false;
  }
  constructor(ctx, {
    wrapperOptions,
    viewportOptions,
    contentOptions,
    rootOptions,
    scrollbarOptions,
    verticalScrollbarOptions,
    horizontalScrollbarOptions,
    stickyScroll = false,
    stickyStart,
    scrollX = false,
    scrollY = true,
    scrollAcceleration,
    viewportCulling = true,
    ...options
  }) {
    super(ctx, {
      flexDirection: "row",
      alignItems: "stretch",
      ...options,
      ...rootOptions
    });
    this.internalId = ScrollBoxRenderable.idCounter++;
    this._stickyScroll = stickyScroll;
    this._stickyStart = stickyStart;
    this.scrollAccel = scrollAcceleration ?? new LinearScrollAccel;
    this.wrapper = new BoxRenderable(ctx, {
      flexDirection: "column",
      flexGrow: 1,
      ...wrapperOptions,
      id: `scroll-box-wrapper-${this.internalId}`
    });
    super.add(this.wrapper);
    this.viewport = new BoxRenderable(ctx, {
      flexDirection: "column",
      flexGrow: 1,
      overflow: "hidden",
      onSizeChange: () => {
        this.recalculateBarProps();
      },
      ...viewportOptions,
      id: `scroll-box-viewport-${this.internalId}`
    });
    this.wrapper.add(this.viewport);
    this.content = new ContentRenderable(ctx, this.viewport, viewportCulling, {
      alignSelf: "flex-start",
      flexShrink: 0,
      ...scrollX ? { minWidth: "100%" } : { minWidth: "100%", maxWidth: "100%" },
      ...scrollY ? { minHeight: "100%" } : { minHeight: "100%", maxHeight: "100%" },
      onSizeChange: () => {
        this.recalculateBarProps();
      },
      ...contentOptions,
      id: `scroll-box-content-${this.internalId}`
    });
    this.viewport.add(this.content);
    this.verticalScrollBar = new ScrollBarRenderable(ctx, {
      ...scrollbarOptions,
      ...verticalScrollbarOptions,
      arrowOptions: {
        ...scrollbarOptions?.arrowOptions,
        ...verticalScrollbarOptions?.arrowOptions
      },
      id: `scroll-box-vertical-scrollbar-${this.internalId}`,
      orientation: "vertical",
      onChange: (position) => {
        this.content.translateY = -position;
        if (!this._isApplyingStickyScroll) {
          const maxScrollTop = Math.max(0, this.scrollHeight - this.viewport.height);
          if (!this.isAtStickyPosition() && maxScrollTop > 1) {
            this._hasManualScroll = true;
          }
        }
        this.updateStickyState();
      }
    });
    super.add(this.verticalScrollBar);
    this.horizontalScrollBar = new ScrollBarRenderable(ctx, {
      ...scrollbarOptions,
      ...horizontalScrollbarOptions,
      arrowOptions: {
        ...scrollbarOptions?.arrowOptions,
        ...horizontalScrollbarOptions?.arrowOptions
      },
      id: `scroll-box-horizontal-scrollbar-${this.internalId}`,
      orientation: "horizontal",
      onChange: (position) => {
        this.content.translateX = -position;
        if (!this._isApplyingStickyScroll) {
          const maxScrollLeft = Math.max(0, this.scrollWidth - this.viewport.width);
          if (!this.isAtStickyPosition() && maxScrollLeft > 1) {
            this._hasManualScroll = true;
          }
        }
        this.updateStickyState();
      }
    });
    this.wrapper.add(this.horizontalScrollBar);
    this.recalculateBarProps();
    if (stickyStart && stickyScroll) {
      this.applyStickyStart(stickyStart);
    }
    this.selectionListener = () => {
      const selection = this._ctx.getSelection();
      if (!selection || !selection.isSelecting) {
        this.stopAutoScroll();
      }
    };
    this._ctx.on("selection", this.selectionListener);
  }
  onUpdate(deltaTime) {
    this.handleAutoScroll(deltaTime);
  }
  scrollBy(delta, unit = "absolute") {
    if (typeof delta === "number") {
      this.verticalScrollBar.scrollBy(delta, unit);
    } else {
      this.verticalScrollBar.scrollBy(delta.y, unit);
      this.horizontalScrollBar.scrollBy(delta.x, unit);
    }
  }
  scrollTo(position) {
    if (typeof position === "number") {
      this.scrollTop = position;
    } else {
      this.scrollTop = position.y;
      this.scrollLeft = position.x;
    }
  }
  isAtStickyPosition() {
    if (!this._stickyScroll || !this._stickyStart) {
      return false;
    }
    const maxScrollTop = Math.max(0, this.scrollHeight - this.viewport.height);
    const maxScrollLeft = Math.max(0, this.scrollWidth - this.viewport.width);
    switch (this._stickyStart) {
      case "top":
        return this.scrollTop === 0;
      case "bottom":
        return this.scrollTop >= maxScrollTop;
      case "left":
        return this.scrollLeft === 0;
      case "right":
        return this.scrollLeft >= maxScrollLeft;
      default:
        return false;
    }
  }
  add(obj, index) {
    return this.content.add(obj, index);
  }
  insertBefore(obj, anchor) {
    return this.content.insertBefore(obj, anchor);
  }
  remove(id) {
    this.content.remove(id);
  }
  getChildren() {
    return this.content.getChildren();
  }
  onMouseEvent(event) {
    if (event.type === "scroll") {
      let dir = event.scroll?.direction;
      if (event.modifiers.shift)
        dir = dir === "up" ? "left" : dir === "down" ? "right" : dir === "right" ? "down" : "up";
      const baseDelta = event.scroll?.delta ?? 0;
      const now = Date.now();
      const multiplier = this.scrollAccel.tick(now);
      const scrollAmount = baseDelta * multiplier;
      if (dir === "up") {
        this.scrollAccumulatorY -= scrollAmount;
        const integerScroll = Math.trunc(this.scrollAccumulatorY);
        if (integerScroll !== 0) {
          this.scrollTop += integerScroll;
          this.scrollAccumulatorY -= integerScroll;
        }
      } else if (dir === "down") {
        this.scrollAccumulatorY += scrollAmount;
        const integerScroll = Math.trunc(this.scrollAccumulatorY);
        if (integerScroll !== 0) {
          this.scrollTop += integerScroll;
          this.scrollAccumulatorY -= integerScroll;
        }
      } else if (dir === "left") {
        this.scrollAccumulatorX -= scrollAmount;
        const integerScroll = Math.trunc(this.scrollAccumulatorX);
        if (integerScroll !== 0) {
          this.scrollLeft += integerScroll;
          this.scrollAccumulatorX -= integerScroll;
        }
      } else if (dir === "right") {
        this.scrollAccumulatorX += scrollAmount;
        const integerScroll = Math.trunc(this.scrollAccumulatorX);
        if (integerScroll !== 0) {
          this.scrollLeft += integerScroll;
          this.scrollAccumulatorX -= integerScroll;
        }
      }
      const maxScrollTop = Math.max(0, this.scrollHeight - this.viewport.height);
      const maxScrollLeft = Math.max(0, this.scrollWidth - this.viewport.width);
      if (maxScrollTop > 1 || maxScrollLeft > 1) {
        this._hasManualScroll = true;
      }
    }
    if (event.type === "drag" && event.isSelecting) {
      this.updateAutoScroll(event.x, event.y);
    } else if (event.type === "up") {
      this.stopAutoScroll();
    }
  }
  handleKeyPress(key) {
    if (this.verticalScrollBar.handleKeyPress(key)) {
      this._hasManualScroll = true;
      this.scrollAccel.reset();
      this.resetScrollAccumulators();
      return true;
    }
    if (this.horizontalScrollBar.handleKeyPress(key)) {
      this._hasManualScroll = true;
      this.scrollAccel.reset();
      this.resetScrollAccumulators();
      return true;
    }
    return false;
  }
  resetScrollAccumulators() {
    this.scrollAccumulatorX = 0;
    this.scrollAccumulatorY = 0;
  }
  startAutoScroll(mouseX, mouseY) {
    this.stopAutoScroll();
    this.autoScrollMouseX = mouseX;
    this.autoScrollMouseY = mouseY;
    this.cachedAutoScrollSpeed = this.getAutoScrollSpeed(mouseX, mouseY);
    this.isAutoScrolling = true;
    if (!this.live) {
      this.live = true;
    }
  }
  updateAutoScroll(mouseX, mouseY) {
    this.autoScrollMouseX = mouseX;
    this.autoScrollMouseY = mouseY;
    this.cachedAutoScrollSpeed = this.getAutoScrollSpeed(mouseX, mouseY);
    const scrollX = this.getAutoScrollDirectionX(mouseX);
    const scrollY = this.getAutoScrollDirectionY(mouseY);
    if (scrollX === 0 && scrollY === 0) {
      this.stopAutoScroll();
    } else if (!this.isAutoScrolling) {
      this.startAutoScroll(mouseX, mouseY);
    }
  }
  stopAutoScroll() {
    const wasAutoScrolling = this.isAutoScrolling;
    this.isAutoScrolling = false;
    this.autoScrollAccumulatorX = 0;
    this.autoScrollAccumulatorY = 0;
    if (wasAutoScrolling && !this.hasOtherLiveReasons()) {
      this.live = false;
    }
  }
  hasOtherLiveReasons() {
    return false;
  }
  handleAutoScroll(deltaTime) {
    if (!this.isAutoScrolling)
      return;
    const scrollX = this.getAutoScrollDirectionX(this.autoScrollMouseX);
    const scrollY = this.getAutoScrollDirectionY(this.autoScrollMouseY);
    const scrollAmount = this.cachedAutoScrollSpeed * (deltaTime / 1000);
    let scrolled = false;
    if (scrollX !== 0) {
      this.autoScrollAccumulatorX += scrollX * scrollAmount;
      const integerScrollX = Math.trunc(this.autoScrollAccumulatorX);
      if (integerScrollX !== 0) {
        this.scrollLeft += integerScrollX;
        this.autoScrollAccumulatorX -= integerScrollX;
        scrolled = true;
      }
    }
    if (scrollY !== 0) {
      this.autoScrollAccumulatorY += scrollY * scrollAmount;
      const integerScrollY = Math.trunc(this.autoScrollAccumulatorY);
      if (integerScrollY !== 0) {
        this.scrollTop += integerScrollY;
        this.autoScrollAccumulatorY -= integerScrollY;
        scrolled = true;
      }
    }
    if (scrolled) {
      this._ctx.requestSelectionUpdate();
    }
    if (scrollX === 0 && scrollY === 0) {
      this.stopAutoScroll();
    }
  }
  getAutoScrollDirectionX(mouseX) {
    const relativeX = mouseX - this.x;
    const distToLeft = relativeX;
    const distToRight = this.width - relativeX;
    if (distToLeft <= this.autoScrollThresholdHorizontal) {
      return this.scrollLeft > 0 ? -1 : 0;
    } else if (distToRight <= this.autoScrollThresholdHorizontal) {
      const maxScrollLeft = this.scrollWidth - this.viewport.width;
      return this.scrollLeft < maxScrollLeft ? 1 : 0;
    }
    return 0;
  }
  getAutoScrollDirectionY(mouseY) {
    const relativeY = mouseY - this.y;
    const distToTop = relativeY;
    const distToBottom = this.height - relativeY;
    if (distToTop <= this.autoScrollThresholdVertical) {
      return this.scrollTop > 0 ? -1 : 0;
    } else if (distToBottom <= this.autoScrollThresholdVertical) {
      const maxScrollTop = this.scrollHeight - this.viewport.height;
      return this.scrollTop < maxScrollTop ? 1 : 0;
    }
    return 0;
  }
  getAutoScrollSpeed(mouseX, mouseY) {
    const relativeX = mouseX - this.x;
    const relativeY = mouseY - this.y;
    const distToLeft = relativeX;
    const distToRight = this.width - relativeX;
    const distToTop = relativeY;
    const distToBottom = this.height - relativeY;
    const minDistance = Math.min(distToLeft, distToRight, distToTop, distToBottom);
    if (minDistance <= 1) {
      return this.autoScrollSpeedFast;
    } else if (minDistance <= 2) {
      return this.autoScrollSpeedMedium;
    } else {
      return this.autoScrollSpeedSlow;
    }
  }
  recalculateBarProps() {
    const wasApplyingStickyScroll = this._isApplyingStickyScroll;
    this._isApplyingStickyScroll = true;
    this.verticalScrollBar.scrollSize = this.content.height;
    this.verticalScrollBar.viewportSize = this.viewport.height;
    this.horizontalScrollBar.scrollSize = this.content.width;
    this.horizontalScrollBar.viewportSize = this.viewport.width;
    if (this._stickyScroll) {
      const newMaxScrollTop = Math.max(0, this.scrollHeight - this.viewport.height);
      const newMaxScrollLeft = Math.max(0, this.scrollWidth - this.viewport.width);
      if (this._stickyStart && !this._hasManualScroll) {
        this.applyStickyStart(this._stickyStart);
      } else {
        if (this._stickyScrollTop) {
          this.scrollTop = 0;
        } else if (this._stickyScrollBottom && newMaxScrollTop > 0) {
          this.scrollTop = newMaxScrollTop;
        }
        if (this._stickyScrollLeft) {
          this.scrollLeft = 0;
        } else if (this._stickyScrollRight && newMaxScrollLeft > 0) {
          this.scrollLeft = newMaxScrollLeft;
        }
      }
    }
    this._isApplyingStickyScroll = wasApplyingStickyScroll;
    process.nextTick(() => {
      this.requestRender();
    });
  }
  set rootOptions(options) {
    Object.assign(this, options);
    this.requestRender();
  }
  set wrapperOptions(options) {
    Object.assign(this.wrapper, options);
    this.requestRender();
  }
  set viewportOptions(options) {
    Object.assign(this.viewport, options);
    this.requestRender();
  }
  set contentOptions(options) {
    Object.assign(this.content, options);
    this.requestRender();
  }
  set scrollbarOptions(options) {
    Object.assign(this.verticalScrollBar, options);
    Object.assign(this.horizontalScrollBar, options);
    this.requestRender();
  }
  set verticalScrollbarOptions(options) {
    Object.assign(this.verticalScrollBar, options);
    this.requestRender();
  }
  set horizontalScrollbarOptions(options) {
    Object.assign(this.horizontalScrollBar, options);
    this.requestRender();
  }
  get scrollAcceleration() {
    return this.scrollAccel;
  }
  set scrollAcceleration(value) {
    this.scrollAccel = value;
  }
  get viewportCulling() {
    return this.content.viewportCulling;
  }
  set viewportCulling(value) {
    this.content.viewportCulling = value;
    this.requestRender();
  }
  destroySelf() {
    if (this.selectionListener) {
      this._ctx.off("selection", this.selectionListener);
      this.selectionListener = undefined;
    }
    super.destroySelf();
  }
}
// src/renderables/Select.ts
var defaultSelectKeybindings = [
  { name: "up", action: "move-up" },
  { name: "k", action: "move-up" },
  { name: "down", action: "move-down" },
  { name: "j", action: "move-down" },
  { name: "up", shift: true, action: "move-up-fast" },
  { name: "down", shift: true, action: "move-down-fast" },
  { name: "return", action: "select-current" },
  { name: "linefeed", action: "select-current" }
];
var SelectRenderableEvents;
((SelectRenderableEvents2) => {
  SelectRenderableEvents2["SELECTION_CHANGED"] = "selectionChanged";
  SelectRenderableEvents2["ITEM_SELECTED"] = "itemSelected";
})(SelectRenderableEvents ||= {});

class SelectRenderable extends Renderable {
  _focusable = true;
  _options = [];
  _selectedIndex = 0;
  scrollOffset = 0;
  maxVisibleItems;
  _backgroundColor;
  _textColor;
  _focusedBackgroundColor;
  _focusedTextColor;
  _selectedBackgroundColor;
  _selectedTextColor;
  _descriptionColor;
  _selectedDescriptionColor;
  _showScrollIndicator;
  _wrapSelection;
  _showDescription;
  _font;
  _itemSpacing;
  linesPerItem;
  fontHeight;
  _fastScrollStep;
  _keyBindingsMap;
  _keyAliasMap;
  _keyBindings;
  _defaultOptions = {
    backgroundColor: "transparent",
    textColor: "#FFFFFF",
    focusedBackgroundColor: "#1a1a1a",
    focusedTextColor: "#FFFFFF",
    selectedBackgroundColor: "#334455",
    selectedTextColor: "#FFFF00",
    selectedIndex: 0,
    descriptionColor: "#888888",
    selectedDescriptionColor: "#CCCCCC",
    showScrollIndicator: false,
    wrapSelection: false,
    showDescription: true,
    itemSpacing: 0,
    fastScrollStep: 5
  };
  constructor(ctx, options) {
    super(ctx, { ...options, buffered: true });
    this._options = options.options || [];
    const requestedIndex = options.selectedIndex ?? this._defaultOptions.selectedIndex;
    this._selectedIndex = this._options.length > 0 ? Math.min(requestedIndex, this._options.length - 1) : 0;
    this._backgroundColor = parseColor(options.backgroundColor || this._defaultOptions.backgroundColor);
    this._textColor = parseColor(options.textColor || this._defaultOptions.textColor);
    this._focusedBackgroundColor = parseColor(options.focusedBackgroundColor || this._defaultOptions.focusedBackgroundColor);
    this._focusedTextColor = parseColor(options.focusedTextColor || this._defaultOptions.focusedTextColor);
    this._showScrollIndicator = options.showScrollIndicator ?? this._defaultOptions.showScrollIndicator;
    this._wrapSelection = options.wrapSelection ?? this._defaultOptions.wrapSelection;
    this._showDescription = options.showDescription ?? this._defaultOptions.showDescription;
    this._font = options.font;
    this._itemSpacing = options.itemSpacing || this._defaultOptions.itemSpacing;
    this.fontHeight = this._font ? measureText({ text: "A", font: this._font }).height : 1;
    this.linesPerItem = this._showDescription ? this._font ? this.fontHeight + 1 : 2 : this._font ? this.fontHeight : 1;
    this.linesPerItem += this._itemSpacing;
    this.maxVisibleItems = Math.max(1, Math.floor(this.height / this.linesPerItem));
    this._selectedBackgroundColor = parseColor(options.selectedBackgroundColor || this._defaultOptions.selectedBackgroundColor);
    this._selectedTextColor = parseColor(options.selectedTextColor || this._defaultOptions.selectedTextColor);
    this._descriptionColor = parseColor(options.descriptionColor || this._defaultOptions.descriptionColor);
    this._selectedDescriptionColor = parseColor(options.selectedDescriptionColor || this._defaultOptions.selectedDescriptionColor);
    this._fastScrollStep = options.fastScrollStep || this._defaultOptions.fastScrollStep;
    this._keyAliasMap = mergeKeyAliases(defaultKeyAliases, options.keyAliasMap || {});
    this._keyBindings = options.keyBindings || [];
    const mergedBindings = mergeKeyBindings(defaultSelectKeybindings, this._keyBindings);
    this._keyBindingsMap = buildKeyBindingsMap(mergedBindings, this._keyAliasMap);
    this.requestRender();
  }
  renderSelf(buffer, deltaTime) {
    if (!this.visible || !this.frameBuffer)
      return;
    if (this.isDirty) {
      this.refreshFrameBuffer();
    }
  }
  refreshFrameBuffer() {
    if (!this.frameBuffer || this._options.length === 0)
      return;
    const bgColor = this._focused ? this._focusedBackgroundColor : this._backgroundColor;
    this.frameBuffer.clear(bgColor);
    const contentX = 0;
    const contentY = 0;
    const contentWidth = this.width;
    const contentHeight = this.height;
    const visibleOptions = this._options.slice(this.scrollOffset, this.scrollOffset + this.maxVisibleItems);
    for (let i = 0;i < visibleOptions.length; i++) {
      const actualIndex = this.scrollOffset + i;
      const option = visibleOptions[i];
      const isSelected = actualIndex === this._selectedIndex;
      const itemY = contentY + i * this.linesPerItem;
      if (itemY + this.linesPerItem - 1 >= contentY + contentHeight)
        break;
      if (isSelected) {
        const contentHeight2 = this.linesPerItem - this._itemSpacing;
        this.frameBuffer.fillRect(contentX, itemY, contentWidth, contentHeight2, this._selectedBackgroundColor);
      }
      const nameContent = `${isSelected ? "\u25B6 " : "  "}${option.name}`;
      const baseTextColor = this._focused ? this._focusedTextColor : this._textColor;
      const nameColor = isSelected ? this._selectedTextColor : baseTextColor;
      let descX = contentX + 3;
      if (this._font) {
        const indicator = isSelected ? "\u25B6 " : "  ";
        this.frameBuffer.drawText(indicator, contentX + 1, itemY, nameColor);
        const indicatorWidth = 2;
        renderFontToFrameBuffer(this.frameBuffer, {
          text: option.name,
          x: contentX + 1 + indicatorWidth,
          y: itemY,
          color: nameColor,
          backgroundColor: isSelected ? this._selectedBackgroundColor : bgColor,
          font: this._font
        });
        descX = contentX + 1 + indicatorWidth;
      } else {
        this.frameBuffer.drawText(nameContent, contentX + 1, itemY, nameColor);
      }
      if (this._showDescription && itemY + this.fontHeight < contentY + contentHeight) {
        const descColor = isSelected ? this._selectedDescriptionColor : this._descriptionColor;
        this.frameBuffer.drawText(option.description, descX, itemY + this.fontHeight, descColor);
      }
    }
    if (this._showScrollIndicator && this._options.length > this.maxVisibleItems) {
      this.renderScrollIndicatorToFrameBuffer(contentX, contentY, contentWidth, contentHeight);
    }
  }
  renderScrollIndicatorToFrameBuffer(contentX, contentY, contentWidth, contentHeight) {
    if (!this.frameBuffer)
      return;
    const scrollPercent = this._selectedIndex / Math.max(1, this._options.length - 1);
    const indicatorHeight = Math.max(1, contentHeight - 2);
    const indicatorY = contentY + 1 + Math.floor(scrollPercent * indicatorHeight);
    const indicatorX = contentX + contentWidth - 1;
    this.frameBuffer.drawText("\u2588", indicatorX, indicatorY, parseColor("#666666"));
  }
  get options() {
    return this._options;
  }
  set options(options) {
    this._options = options;
    this._selectedIndex = Math.min(this._selectedIndex, Math.max(0, options.length - 1));
    this.updateScrollOffset();
    this.requestRender();
  }
  getSelectedOption() {
    return this._options[this._selectedIndex] || null;
  }
  getSelectedIndex() {
    return this._selectedIndex;
  }
  moveUp(steps = 1) {
    const newIndex = this._selectedIndex - steps;
    if (newIndex >= 0) {
      this._selectedIndex = newIndex;
    } else if (this._wrapSelection && this._options.length > 0) {
      this._selectedIndex = this._options.length - 1;
    } else {
      this._selectedIndex = 0;
    }
    this.updateScrollOffset();
    this.requestRender();
    this.emit("selectionChanged" /* SELECTION_CHANGED */, this._selectedIndex, this.getSelectedOption());
  }
  moveDown(steps = 1) {
    const newIndex = this._selectedIndex + steps;
    if (newIndex < this._options.length) {
      this._selectedIndex = newIndex;
    } else if (this._wrapSelection && this._options.length > 0) {
      this._selectedIndex = 0;
    } else {
      this._selectedIndex = this._options.length - 1;
    }
    this.updateScrollOffset();
    this.requestRender();
    this.emit("selectionChanged" /* SELECTION_CHANGED */, this._selectedIndex, this.getSelectedOption());
  }
  selectCurrent() {
    const selected = this.getSelectedOption();
    if (selected) {
      this.emit("itemSelected" /* ITEM_SELECTED */, this._selectedIndex, selected);
    }
  }
  setSelectedIndex(index) {
    if (index >= 0 && index < this._options.length) {
      this._selectedIndex = index;
      this.updateScrollOffset();
      this.requestRender();
      this.emit("selectionChanged" /* SELECTION_CHANGED */, this._selectedIndex, this.getSelectedOption());
    }
  }
  updateScrollOffset() {
    if (!this._options)
      return;
    const halfVisible = Math.floor(this.maxVisibleItems / 2);
    const newScrollOffset = Math.max(0, Math.min(this._selectedIndex - halfVisible, this._options.length - this.maxVisibleItems));
    if (newScrollOffset !== this.scrollOffset) {
      this.scrollOffset = newScrollOffset;
      this.requestRender();
    }
  }
  onResize(width, height) {
    this.maxVisibleItems = Math.max(1, Math.floor(height / this.linesPerItem));
    this.updateScrollOffset();
    this.requestRender();
  }
  handleKeyPress(key) {
    const bindingKey = getKeyBindingKey({
      name: key.name,
      ctrl: key.ctrl,
      shift: key.shift,
      meta: key.meta,
      super: key.super,
      action: "move-up"
    });
    const action = this._keyBindingsMap.get(bindingKey);
    if (action) {
      switch (action) {
        case "move-up":
          this.moveUp(1);
          return true;
        case "move-down":
          this.moveDown(1);
          return true;
        case "move-up-fast":
          this.moveUp(this._fastScrollStep);
          return true;
        case "move-down-fast":
          this.moveDown(this._fastScrollStep);
          return true;
        case "select-current":
          this.selectCurrent();
          return true;
      }
    }
    return false;
  }
  get showScrollIndicator() {
    return this._showScrollIndicator;
  }
  set showScrollIndicator(show) {
    this._showScrollIndicator = show;
    this.requestRender();
  }
  get showDescription() {
    return this._showDescription;
  }
  set showDescription(show) {
    if (this._showDescription !== show) {
      this._showDescription = show;
      this.linesPerItem = this._showDescription ? this._font ? this.fontHeight + 1 : 2 : this._font ? this.fontHeight : 1;
      this.linesPerItem += this._itemSpacing;
      this.maxVisibleItems = Math.max(1, Math.floor(this.height / this.linesPerItem));
      this.updateScrollOffset();
      this.requestRender();
    }
  }
  get wrapSelection() {
    return this._wrapSelection;
  }
  set wrapSelection(wrap) {
    this._wrapSelection = wrap;
  }
  set backgroundColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.backgroundColor);
    if (this._backgroundColor !== newColor) {
      this._backgroundColor = newColor;
      this.requestRender();
    }
  }
  set textColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.textColor);
    if (this._textColor !== newColor) {
      this._textColor = newColor;
      this.requestRender();
    }
  }
  set focusedBackgroundColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.focusedBackgroundColor);
    if (this._focusedBackgroundColor !== newColor) {
      this._focusedBackgroundColor = newColor;
      this.requestRender();
    }
  }
  set focusedTextColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.focusedTextColor);
    if (this._focusedTextColor !== newColor) {
      this._focusedTextColor = newColor;
      this.requestRender();
    }
  }
  set selectedBackgroundColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.selectedBackgroundColor);
    if (this._selectedBackgroundColor !== newColor) {
      this._selectedBackgroundColor = newColor;
      this.requestRender();
    }
  }
  set selectedTextColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.selectedTextColor);
    if (this._selectedTextColor !== newColor) {
      this._selectedTextColor = newColor;
      this.requestRender();
    }
  }
  set descriptionColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.descriptionColor);
    if (this._descriptionColor !== newColor) {
      this._descriptionColor = newColor;
      this.requestRender();
    }
  }
  set selectedDescriptionColor(value) {
    const newColor = parseColor(value ?? this._defaultOptions.selectedDescriptionColor);
    if (this._selectedDescriptionColor !== newColor) {
      this._selectedDescriptionColor = newColor;
      this.requestRender();
    }
  }
  set font(font) {
    this._font = font;
    this.fontHeight = measureText({ text: "A", font: this._font }).height;
    this.linesPerItem = this._showDescription ? this._font ? this.fontHeight + 1 : 2 : this._font ? this.fontHeight : 1;
    this.linesPerItem += this._itemSpacing;
    this.maxVisibleItems = Math.max(1, Math.floor(this.height / this.linesPerItem));
    this.updateScrollOffset();
    this.requestRender();
  }
  set itemSpacing(spacing) {
    this._itemSpacing = spacing;
    this.linesPerItem = this._showDescription ? this._font ? this.fontHeight + 1 : 2 : this._font ? this.fontHeight : 1;
    this.linesPerItem += this._itemSpacing;
    this.maxVisibleItems = Math.max(1, Math.floor(this.height / this.linesPerItem));
    this.updateScrollOffset();
    this.requestRender();
  }
  set fastScrollStep(step) {
    this._fastScrollStep = step;
  }
  set keyBindings(bindings) {
    this._keyBindings = bindings;
    const mergedBindings = mergeKeyBindings(defaultSelectKeybindings, bindings);
    this._keyBindingsMap = buildKeyBindingsMap(mergedBindings, this._keyAliasMap);
  }
  set keyAliasMap(aliases) {
    this._keyAliasMap = mergeKeyAliases(defaultKeyAliases, aliases);
    const mergedBindings = mergeKeyBindings(defaultSelectKeybindings, this._keyBindings);
    this._keyBindingsMap = buildKeyBindingsMap(mergedBindings, this._keyAliasMap);
  }
  set selectedIndex(value) {
    const newIndex = value ?? this._defaultOptions.selectedIndex;
    const clampedIndex = this._options.length > 0 ? Math.min(Math.max(0, newIndex), this._options.length - 1) : 0;
    if (this._selectedIndex !== clampedIndex) {
      this._selectedIndex = clampedIndex;
      this.updateScrollOffset();
      this.requestRender();
    }
  }
}
// src/renderables/TabSelect.ts
var defaultTabSelectKeybindings = [
  { name: "left", action: "move-left" },
  { name: "[", action: "move-left" },
  { name: "right", action: "move-right" },
  { name: "]", action: "move-right" },
  { name: "return", action: "select-current" },
  { name: "linefeed", action: "select-current" }
];
var TabSelectRenderableEvents;
((TabSelectRenderableEvents2) => {
  TabSelectRenderableEvents2["SELECTION_CHANGED"] = "selectionChanged";
  TabSelectRenderableEvents2["ITEM_SELECTED"] = "itemSelected";
})(TabSelectRenderableEvents ||= {});
function calculateDynamicHeight(showUnderline, showDescription) {
  let height = 1;
  if (showUnderline) {
    height += 1;
  }
  if (showDescription) {
    height += 1;
  }
  return height;
}

class TabSelectRenderable extends Renderable {
  _focusable = true;
  _options = [];
  selectedIndex = 0;
  scrollOffset = 0;
  _tabWidth;
  maxVisibleTabs;
  _backgroundColor;
  _textColor;
  _focusedBackgroundColor;
  _focusedTextColor;
  _selectedBackgroundColor;
  _selectedTextColor;
  _selectedDescriptionColor;
  _showScrollArrows;
  _showDescription;
  _showUnderline;
  _wrapSelection;
  _keyBindingsMap;
  _keyAliasMap;
  _keyBindings;
  constructor(ctx, options) {
    const calculatedHeight = calculateDynamicHeight(options.showUnderline ?? true, options.showDescription ?? true);
    super(ctx, { ...options, height: calculatedHeight, buffered: true });
    this._backgroundColor = parseColor(options.backgroundColor || "transparent");
    this._textColor = parseColor(options.textColor || "#FFFFFF");
    this._focusedBackgroundColor = parseColor(options.focusedBackgroundColor || options.backgroundColor || "#1a1a1a");
    this._focusedTextColor = parseColor(options.focusedTextColor || options.textColor || "#FFFFFF");
    this._options = options.options || [];
    this._tabWidth = options.tabWidth || 20;
    this._showDescription = options.showDescription ?? true;
    this._showUnderline = options.showUnderline ?? true;
    this._showScrollArrows = options.showScrollArrows ?? true;
    this._wrapSelection = options.wrapSelection ?? false;
    this.maxVisibleTabs = Math.max(1, Math.floor(this.width / this._tabWidth));
    this._selectedBackgroundColor = parseColor(options.selectedBackgroundColor || "#334455");
    this._selectedTextColor = parseColor(options.selectedTextColor || "#FFFF00");
    this._selectedDescriptionColor = parseColor(options.selectedDescriptionColor || "#CCCCCC");
    this._keyAliasMap = mergeKeyAliases(defaultKeyAliases, options.keyAliasMap || {});
    this._keyBindings = options.keyBindings || [];
    const mergedBindings = mergeKeyBindings(defaultTabSelectKeybindings, this._keyBindings);
    this._keyBindingsMap = buildKeyBindingsMap(mergedBindings, this._keyAliasMap);
  }
  calculateDynamicHeight() {
    return calculateDynamicHeight(this._showUnderline, this._showDescription);
  }
  renderSelf(buffer, deltaTime) {
    if (!this.visible || !this.frameBuffer)
      return;
    if (this.isDirty) {
      this.refreshFrameBuffer();
    }
  }
  refreshFrameBuffer() {
    if (!this.frameBuffer)
      return;
    const bgColor = this._focused ? this._focusedBackgroundColor : this._backgroundColor;
    this.frameBuffer.clear(bgColor);
    if (this._options.length === 0)
      return;
    const contentX = 0;
    const contentY = 0;
    const contentWidth = this.width;
    const contentHeight = this.height;
    const visibleOptions = this._options.slice(this.scrollOffset, this.scrollOffset + this.maxVisibleTabs);
    for (let i = 0;i < visibleOptions.length; i++) {
      const actualIndex = this.scrollOffset + i;
      const option = visibleOptions[i];
      const isSelected = actualIndex === this.selectedIndex;
      const tabX = contentX + i * this._tabWidth;
      if (tabX >= contentX + contentWidth)
        break;
      const actualTabWidth = Math.min(this._tabWidth, contentWidth - i * this._tabWidth);
      if (isSelected) {
        this.frameBuffer.fillRect(tabX, contentY, actualTabWidth, 1, this._selectedBackgroundColor);
      }
      const baseTextColor = this._focused ? this._focusedTextColor : this._textColor;
      const nameColor = isSelected ? this._selectedTextColor : baseTextColor;
      const nameContent = this.truncateText(option.name, actualTabWidth - 2);
      this.frameBuffer.drawText(nameContent, tabX + 1, contentY, nameColor);
      if (isSelected && this._showUnderline && contentHeight >= 2) {
        const underlineY = contentY + 1;
        const underlineBg = isSelected ? this._selectedBackgroundColor : bgColor;
        this.frameBuffer.drawText("\u25AC".repeat(actualTabWidth), tabX, underlineY, nameColor, underlineBg);
      }
    }
    if (this._showDescription && contentHeight >= (this._showUnderline ? 3 : 2)) {
      const selectedOption = this.getSelectedOption();
      if (selectedOption) {
        const descriptionY = contentY + (this._showUnderline ? 2 : 1);
        const descColor = this._selectedDescriptionColor;
        const descContent = this.truncateText(selectedOption.description, contentWidth - 2);
        this.frameBuffer.drawText(descContent, contentX + 1, descriptionY, descColor);
      }
    }
    if (this._showScrollArrows && this._options.length > this.maxVisibleTabs) {
      this.renderScrollArrowsToFrameBuffer(contentX, contentY, contentWidth, contentHeight);
    }
  }
  truncateText(text, maxWidth) {
    if (text.length <= maxWidth)
      return text;
    return text.substring(0, Math.max(0, maxWidth - 1)) + "\u2026";
  }
  renderScrollArrowsToFrameBuffer(contentX, contentY, contentWidth, contentHeight) {
    if (!this.frameBuffer)
      return;
    const hasMoreLeft = this.scrollOffset > 0;
    const hasMoreRight = this.scrollOffset + this.maxVisibleTabs < this._options.length;
    if (hasMoreLeft) {
      this.frameBuffer.drawText("\u2039", contentX, contentY, parseColor("#AAAAAA"));
    }
    if (hasMoreRight) {
      this.frameBuffer.drawText("\u203A", contentX + contentWidth - 1, contentY, parseColor("#AAAAAA"));
    }
  }
  setOptions(options) {
    this._options = options;
    this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, options.length - 1));
    this.updateScrollOffset();
    this.requestRender();
  }
  getSelectedOption() {
    return this._options[this.selectedIndex] || null;
  }
  getSelectedIndex() {
    return this.selectedIndex;
  }
  moveLeft() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else if (this._wrapSelection && this._options.length > 0) {
      this.selectedIndex = this._options.length - 1;
    } else {
      return;
    }
    this.updateScrollOffset();
    this.requestRender();
    this.emit("selectionChanged" /* SELECTION_CHANGED */, this.selectedIndex, this.getSelectedOption());
  }
  moveRight() {
    if (this.selectedIndex < this._options.length - 1) {
      this.selectedIndex++;
    } else if (this._wrapSelection && this._options.length > 0) {
      this.selectedIndex = 0;
    } else {
      return;
    }
    this.updateScrollOffset();
    this.requestRender();
    this.emit("selectionChanged" /* SELECTION_CHANGED */, this.selectedIndex, this.getSelectedOption());
  }
  selectCurrent() {
    const selected = this.getSelectedOption();
    if (selected) {
      this.emit("itemSelected" /* ITEM_SELECTED */, this.selectedIndex, selected);
    }
  }
  setSelectedIndex(index) {
    if (index >= 0 && index < this._options.length) {
      this.selectedIndex = index;
      this.updateScrollOffset();
      this.requestRender();
      this.emit("selectionChanged" /* SELECTION_CHANGED */, this.selectedIndex, this.getSelectedOption());
    }
  }
  updateScrollOffset() {
    const halfVisible = Math.floor(this.maxVisibleTabs / 2);
    const newScrollOffset = Math.max(0, Math.min(this.selectedIndex - halfVisible, this._options.length - this.maxVisibleTabs));
    if (newScrollOffset !== this.scrollOffset) {
      this.scrollOffset = newScrollOffset;
      this.requestRender();
    }
  }
  onResize(width, height) {
    this.maxVisibleTabs = Math.max(1, Math.floor(width / this._tabWidth));
    this.updateScrollOffset();
    this.requestRender();
  }
  setTabWidth(tabWidth) {
    if (this._tabWidth === tabWidth)
      return;
    this._tabWidth = tabWidth;
    this.maxVisibleTabs = Math.max(1, Math.floor(this.width / this._tabWidth));
    this.updateScrollOffset();
    this.requestRender();
  }
  getTabWidth() {
    return this._tabWidth;
  }
  handleKeyPress(key) {
    const bindingKey = getKeyBindingKey({
      name: key.name,
      ctrl: key.ctrl,
      shift: key.shift,
      meta: key.meta,
      super: key.super,
      action: "move-left"
    });
    const action = this._keyBindingsMap.get(bindingKey);
    if (action) {
      switch (action) {
        case "move-left":
          this.moveLeft();
          return true;
        case "move-right":
          this.moveRight();
          return true;
        case "select-current":
          this.selectCurrent();
          return true;
      }
    }
    return false;
  }
  get options() {
    return this._options;
  }
  set options(options) {
    this._options = options;
    this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, options.length - 1));
    this.updateScrollOffset();
    this.requestRender();
  }
  set backgroundColor(color) {
    this._backgroundColor = parseColor(color);
    this.requestRender();
  }
  set textColor(color) {
    this._textColor = parseColor(color);
    this.requestRender();
  }
  set focusedBackgroundColor(color) {
    this._focusedBackgroundColor = parseColor(color);
    this.requestRender();
  }
  set focusedTextColor(color) {
    this._focusedTextColor = parseColor(color);
    this.requestRender();
  }
  set selectedBackgroundColor(color) {
    this._selectedBackgroundColor = parseColor(color);
    this.requestRender();
  }
  set selectedTextColor(color) {
    this._selectedTextColor = parseColor(color);
    this.requestRender();
  }
  set selectedDescriptionColor(color) {
    this._selectedDescriptionColor = parseColor(color);
    this.requestRender();
  }
  get showDescription() {
    return this._showDescription;
  }
  set showDescription(show) {
    if (this._showDescription !== show) {
      this._showDescription = show;
      const newHeight = this.calculateDynamicHeight();
      this.height = newHeight;
      this.requestRender();
    }
  }
  get showUnderline() {
    return this._showUnderline;
  }
  set showUnderline(show) {
    if (this._showUnderline !== show) {
      this._showUnderline = show;
      const newHeight = this.calculateDynamicHeight();
      this.height = newHeight;
      this.requestRender();
    }
  }
  get showScrollArrows() {
    return this._showScrollArrows;
  }
  set showScrollArrows(show) {
    if (this._showScrollArrows !== show) {
      this._showScrollArrows = show;
      this.requestRender();
    }
  }
  get wrapSelection() {
    return this._wrapSelection;
  }
  set wrapSelection(wrap) {
    this._wrapSelection = wrap;
  }
  get tabWidth() {
    return this._tabWidth;
  }
  set tabWidth(tabWidth) {
    if (this._tabWidth === tabWidth)
      return;
    this._tabWidth = tabWidth;
    this.maxVisibleTabs = Math.max(1, Math.floor(this.width / this._tabWidth));
    this.updateScrollOffset();
    this.requestRender();
  }
  set keyBindings(bindings) {
    this._keyBindings = bindings;
    const mergedBindings = mergeKeyBindings(defaultTabSelectKeybindings, bindings);
    this._keyBindingsMap = buildKeyBindingsMap(mergedBindings, this._keyAliasMap);
  }
  set keyAliasMap(aliases) {
    this._keyAliasMap = mergeKeyAliases(defaultKeyAliases, aliases);
    const mergedBindings = mergeKeyBindings(defaultTabSelectKeybindings, this._keyBindings);
    this._keyBindingsMap = buildKeyBindingsMap(mergedBindings, this._keyAliasMap);
  }
}
export {
  yellow,
  wrapWithDelegates,
  white,
  vstyles,
  visualizeRenderableTree,
  main as updateAssets,
  underline,
  treeSitterToTextChunks,
  treeSitterToStyledText,
  t,
  stringToStyledText,
  strikethrough,
  setRenderLibPath,
  rgbToHex,
  reverse,
  resolveRenderLib,
  renderFontToFrameBuffer,
  registerEnvVar,
  red,
  pathToFiletype,
  parseWrap,
  parseUnit,
  parsePositionType,
  parseOverflow,
  parseMeasureMode,
  parseLogLevel,
  parseKeypress,
  parseJustify,
  parseGutter,
  parseFlexDirection,
  parseEdge,
  parseDisplay,
  parseDirection,
  parseDimension,
  parseColor,
  parseBoxSizing,
  parseBorderStyle,
  parseAlignItems,
  parseAlign,
  nonAlphanumericKeys,
  measureText,
  maybeMakeRenderable,
  magenta,
  link,
  italic,
  isValidBorderStyle,
  isVNode,
  isTextNodeRenderable,
  isStyledText,
  isRenderable,
  instantiate,
  hsvToRgb,
  hexToRgb,
  hastToStyledText,
  h,
  green,
  getTreeSitterClient,
  getLinkId,
  getDataPaths,
  getCharacterPositions,
  getBorderSides,
  getBorderFromSides,
  getBaseAttributes,
  generateEnvMarkdown,
  generateEnvColored,
  fonts,
  fg,
  extToFiletype,
  envRegistry,
  env,
  engine,
  dim,
  delegate,
  cyan,
  createTimeline,
  createTextAttributes,
  createTerminalPalette,
  createExtmarksController,
  createCliRenderer,
  coordinateToCharacterIndex,
  convertThemeToStyles,
  convertGlobalToLocalSelection,
  clearEnvCache,
  capture,
  buildKittyKeyboardFlags,
  brightYellow,
  brightWhite,
  brightRed,
  brightMagenta,
  brightGreen,
  brightCyan,
  brightBlue,
  brightBlack,
  borderCharsToArray,
  bold,
  blue,
  blink,
  black,
  bgYellow,
  bgWhite,
  bgRed,
  bgMagenta,
  bgGreen,
  bgCyan,
  bgBlue,
  bgBlack,
  bg,
  attributesWithLink,
  applySepia,
  applyScanlines,
  applyNoise,
  applyInvert,
  applyGrayscale,
  applyChromaticAberration,
  applyAsciiArt,
  addDefaultParsers,
  exports_src as Yoga,
  VignetteEffect,
  VRenderable,
  TreeSitterClient,
  Timeline,
  TextareaRenderable,
  TextRenderable,
  TextNodeRenderable,
  TextBufferView,
  TextBufferRenderable,
  TextBuffer,
  TextAttributes,
  Text,
  TerminalPalette,
  TerminalConsole,
  TabSelectRenderableEvents,
  TabSelectRenderable,
  TabSelect,
  SyntaxStyle,
  StyledText,
  StdinBuffer,
  SliderRenderable,
  Selection,
  SelectRenderableEvents,
  SelectRenderable,
  Select,
  ScrollBoxRenderable,
  ScrollBox,
  ScrollBarRenderable,
  RootTextNodeRenderable,
  RootRenderable,
  RendererControlState,
  RenderableEvents,
  Renderable,
  RGBA,
  PasteEvent,
  OptimizedBuffer,
  MouseParser,
  MouseEvent,
  MouseButton,
  MarkdownRenderable,
  MacOSScrollAccel,
  LogLevel,
  LinearScrollAccel,
  LineNumberRenderable,
  LayoutEvents,
  KeyHandler,
  KeyEvent,
  InternalKeyHandler,
  InputRenderableEvents,
  InputRenderable,
  Input,
  Generic,
  FrameBufferRenderable,
  FrameBuffer,
  ExtmarksController,
  EditorView,
  EditBuffer,
  DistortionEffect,
  DiffRenderable,
  DebugOverlayCorner,
  DataPathsManager,
  ConsolePosition,
  CodeRenderable,
  Code,
  CliRenderer,
  CliRenderEvents,
  BrightnessEffect,
  BoxRenderable,
  Box,
  BorderChars,
  BorderCharArrays,
  BlurEffect,
  BloomEffect,
  BaseRenderable,
  ArrowRenderable,
  ATTRIBUTE_BASE_MASK,
  ATTRIBUTE_BASE_BITS,
  ASCIIFontSelectionHelper,
  ASCIIFontRenderable,
  ASCIIFont
};

//# debugId=44880C3E480C3BFB64756E2164756E21
//# sourceMappingURL=index.js.map

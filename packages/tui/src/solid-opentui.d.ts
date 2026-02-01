import 'solid-js';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      box: BoxProps;
      text: TextProps;
      span: SpanProps;
    }

    interface BoxProps {
      children?: Element | Element[];
      flexDirection?: 'row' | 'column';
      flexGrow?: number;
      flexShrink?: number;
      flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
      justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
      alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
      alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
      gap?: number;
      width?: number | string;
      height?: number | string;
      minWidth?: number;
      minHeight?: number;
      maxWidth?: number;
      maxHeight?: number;
      padding?: number;
      paddingTop?: number;
      paddingBottom?: number;
      paddingLeft?: number;
      paddingRight?: number;
      paddingX?: number;
      paddingY?: number;
      margin?: number;
      marginTop?: number;
      marginBottom?: number;
      marginLeft?: number;
      marginRight?: number;
      marginX?: number;
      marginY?: number;
      borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic';
      borderColor?: string;
      borderTop?: boolean;
      borderBottom?: boolean;
      borderLeft?: boolean;
      borderRight?: boolean;
      backgroundColor?: string;
      overflow?: 'visible' | 'hidden';
      position?: 'relative' | 'absolute';
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    }

    interface TextProps {
      children?: Element | Element[] | string | number;
      fg?: string;
      bg?: string;
      color?: string;
      backgroundColor?: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      dimmed?: boolean;
      inverse?: boolean;
      wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end';
      width?: number;
    }

    interface SpanProps extends TextProps {}
  }
}

declare module '@opentui/solid' {
  import { CliRenderer, CliRendererConfig } from '@opentui/core';

  export function render(
    component: () => JSX.Element,
    rendererOrConfig?: CliRenderer | CliRendererConfig
  ): Promise<void>;

  export function useKeyboard(
    handler: (key: {
      name?: string;
      ctrl?: boolean;
      shift?: boolean;
      alt?: boolean;
      meta?: boolean;
      sequence?: string;
    }) => void
  ): void;

  export function useStdout(): {
    write: (text: string) => void;
  };

  export function useStdin(): {
    setRawMode: (mode: boolean) => void;
  };

  export function useFocus(): {
    isFocused: boolean;
    focus: () => void;
    blur: () => void;
  };
}

declare module '@opentui/core' {
  export interface CliRenderer {
    readonly stdin: NodeJS.ReadStream;
    readonly stdout: NodeJS.WriteStream;
  }

  export interface CliRendererConfig {
    exitOnCtrlC?: boolean;
    stdin?: NodeJS.ReadStream;
    stdout?: NodeJS.WriteStream;
  }

  export function createCliRenderer(options?: CliRendererConfig): Promise<CliRenderer>;
}

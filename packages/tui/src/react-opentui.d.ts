/**
 * Type declarations for OpenTUI React JSX elements
 * Overrides React's JSX namespace to include OpenTUI elements
 */
import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: React.PropsWithChildren<{
        flexDirection?: 'row' | 'column';
        flexGrow?: number;
        alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
        justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
        width?: number | string;
        height?: number | string;
        padding?: number;
        paddingLeft?: number;
        paddingRight?: number;
        paddingTop?: number;
        paddingBottom?: number;
        paddingX?: number;
        paddingY?: number;
        margin?: number;
        marginLeft?: number;
        marginRight?: number;
        marginTop?: number;
        marginBottom?: number;
        marginX?: number;
        marginY?: number;
        gap?: number;
        border?: boolean;
        borderStyle?: 'single' | 'double' | 'rounded';
        borderColor?: string;
        backgroundColor?: string;
        color?: string;
        bold?: boolean;
        dim?: boolean;
        title?: string;
        style?: Record<string, unknown>;
        key?: React.Key;
      }>;
      text: React.PropsWithChildren<{
        color?: string;
        bold?: boolean;
        dim?: boolean;
        attributes?: number;
        width?: number;
        key?: React.Key;
      }>;
    }
  }
}

export {};

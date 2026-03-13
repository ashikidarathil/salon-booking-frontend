import * as React from 'react';

export type UIProps = {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
} & React.AriaAttributes;

import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps, ReactNode } from 'react';
import { Platform, Pressable, StyleProp, TextStyle } from 'react-native';

type Props = {
  href: string;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
} & Omit<ComponentProps<typeof Link>, 'href' | 'children' | 'style'>;

export function ExternalLink({ href, children, style, ...rest }: Props) {
  if (Platform.OS === 'web') {
    return (
      <Link target="_blank" href={href} style={style} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Pressable
      style={style}
      onPress={() => {
        WebBrowser.openBrowserAsync(href);
      }}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

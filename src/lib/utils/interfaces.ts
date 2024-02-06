export interface ChildNavigationLink {
  i18nKey: string;
  url: string;
}

export interface NavigationLink {
  i18nKey: string;
  url: string;
  hasChildren?: boolean;
  children?: ChildNavigationLink[];
}

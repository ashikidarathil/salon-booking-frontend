import { API_ROUTES } from '../constants/api.routes';

type RouteParams = Record<string, string | number>;
type RouteValue = string | ((id: string) => string);

export const getTabId = (): string => {
  let tabId = sessionStorage.getItem('tab_id');
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tab_id', tabId);
  }
  return tabId;
};

// export const buildUrl = (template: string, params: Record<string, string | number>): string => {
//   return Object.entries(params).reduce(
//     (url, [key, value]) => url.replace(`:${key}`, String(value)),
//     template,
//   );
// };

export const buildUrl = (route: RouteValue, params?: RouteParams): string => {
  if (typeof route === 'function') {
    if (!params || !params.userId) {
      throw new Error('buildUrl: userId is required for function routes');
    }
    return route(String(params.userId));
  }

  if (!params) return route;

  let finalUrl = route;
  for (const key in params) {
    finalUrl = finalUrl.replace(`:${key}`, String(params[key]));
  }

  return finalUrl;
};

/*
export const getApiUrl = (routeKey: string, params?: Record<string, string | number>): string => {
  const keys = routeKey.split('.');
  let route: unknown = API_ROUTES;

  for (const key of keys) {
    if (typeof route === 'object' && route !== null && key in route) {
      route = (route as Record<string, unknown>)[key];
    } else {
      throw new Error(`Route ${routeKey} not found in API_ROUTES`);
    }
  }

  if (typeof route !== 'string') {
    throw new Error(`Route ${routeKey} is not a string`);
  }

  return params ? buildUrl(route, params) : route;
};
*/

export const getApiUrl = (routeKey: string, params?: RouteParams): string => {
  const keys = routeKey.split('.');
  let current: unknown = API_ROUTES;

  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      throw new Error(`API route not found: ${routeKey}`);
    }
  }

  if (typeof current !== 'string' && typeof current !== 'function') {
    throw new Error(`Invalid API route type for: ${routeKey}`);
  }

  return buildUrl(current as RouteValue, params);
};

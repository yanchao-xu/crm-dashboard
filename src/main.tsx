import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";
import type { MountParams, MountReturn } from "../icp-extension.types";

export default function mount<T>(
  element: HTMLElement,
  { params, formApi, messageApi, restApi, i18nApi, routerApi }: MountParams<T>,
): MountReturn<T> {
  const root = createRoot(element);
  // 将 restApi 传递给 App 组件
  root.render(<App restApi={restApi} />);

  return () => {
    root.unmount();
  };
}

// TODO: 这是用于开发环境的 mock REST API，生产环境应该使用真实的 restApi
// uncomment to provide mock REST API only for form designer preview
/*
export const mockRestApi = {
  get: async  () => {}
  put: async  () => {}
  post: async  () => {}
  delete: async  () => {}
}
*/

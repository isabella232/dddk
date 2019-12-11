import * as api from "./api";

export type Component = (container: Container) => void;

export interface WidgetWrapper {
  type: "wrapper";
  component?: api.WidgetDefinition;
}

export type WidgetDefinition = api.WidgetDefinition | WidgetWrapper;

export interface Container {
  addWidget(name: string, widget: WidgetDefinition);
}

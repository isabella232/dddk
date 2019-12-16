/**
 * These are the raw types expected by the datadog api, and a client for interacting with it.
 */

import got, { Method } from "got";

export class Client {
  private readonly apiKey: string;
  private readonly applicationKey: string;

  constructor(apiKey: string, applicationKey: string) {
    this.apiKey = apiKey;
    this.applicationKey = applicationKey;
  }

  async getDashboards() {
    const res = await this.do<{ dashboards: DashboardSummary[] }>(
      "GET",
      "/v1/dashboard"
    );
    return res.dashboards;
  }

  async createDashboard(dashboard: Dashboard) {
    return this.do<any>("POST", "/v1/dashboard", dashboard);
  }

  async updateDashboard(id: string, dashboard: Dashboard) {
    return this.do<any>("PUT", `/v1/dashboard/${id}`, dashboard);
  }

  async getMonitors() {
    return await this.do<Monitor[]>("GET", "/v1/monitor");
  }

  async createMonitor(monitor: Monitor) {
    return this.do<any>("POST", `/v1/monitor`, monitor);
  }

  async updateMonitor(id: number, monitor: Monitor) {
    return this.do<{ data: Monitor }>("PUT", `/v1/monitor/${id}`, monitor);
  }

  async getSLOs(query: string = "") {
    if (query) {
      query = "&query=" + encodeURIComponent(`"${query}"`);
    }

    const res = await this.do<{
      data: SLO[];
      error?: any;
    }>("GET", "/v1/slo?limit=1000" + query);

    if (res.error) {
      throw res.error;
    }

    return res.data;
  }

  async createSLO(slo: SLO) {
    const res = await this.do<{ data: Monitor }>("POST", `/v1/slo`, slo);
    return res.data;
  }

  async updateSLO(id: string, slo: SLO) {
    const res = await this.do<{ data: Monitor }>("PUT", `/v1/slo/${id}`, slo);
    return res.data;
  }

  private async do<T>(method: Method, url: string, body?: any): Promise<T> {
    try {
      const resp = await got("https://api.datadoghq.com/api" + url, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "github.com/99designs/ddac",
          "DD-API-KEY": this.apiKey,
          "DD-APPLICATION-KEY": this.applicationKey
        },
        method: method,
        body: body ? JSON.stringify(body, null, " ") : undefined
      });
      return JSON.parse(resp.body) as T;
    } catch (error) {
      if (error.response && error.response.body) {
        throw "error calling datadog api: " + error.response.body;
      } else {
        throw error;
      }
    }
  }
}

export interface QueryMonitor {
  id?: number;
  type: "query alert";
  query: string;
  name?: string;
  message: string;
  tags?: string[];
  options: MonitorOptions;
}

export interface MetricMonitor {
  id?: number;
  type: "metric alert";
  query: string;
  name?: string;
  message: string;
  tags?: string[];
  options: MonitorOptions;
}

export interface MonitorOptions {
  notify_audit?: boolean;
  locked?: boolean;
  timeout_h?: number;
  silenced?: any;
  include_tags?: boolean;
  no_data_timeframe?: number;
  require_full_window?: boolean;
  new_host_delay?: number;
  evaluation_delay?: number;
  notify_no_data?: boolean;
  renotify_interval?: number;
  escalation_message?: string;
  thresholds?: {
    critical?: number;
    warning?: number;
  };
}

export type Monitor = QueryMonitor | MetricMonitor;

export interface Threshold {
  timeframe: string;
  target: number;
  target_display?: string;
  warning?: number;
  warning_display?: string;
}

export interface MonitorSLO {
  id?: string;
  name?: string;
  description: string;
  tags?: string[];
  thresholds: Threshold[];
  type: "monitor";
  monitor_ids: number[];
  groups?: string[];
  created?: Date;
  modified?: Date;
}

export type SLO = MonitorSLO;

export interface TimeSeries {
  type: "timeseries";
  requests: (Request | ApmRequest)[];
  yaxis?: Axis;
  events?: Event[];
  markers?: Marker[];
  title?: string;
}

export interface TopList {
  type: "toplist";
  requests: (Request | ApmRequest)[];
  title?: string;
}

export interface Group {
  type: "group";
  layout_type: "ordered";
  title?: string;
  widgets: Widget[];
}

export type WidgetDefinition = TimeSeries | TopList | Group;

export interface Widget {
  definition: WidgetDefinition;
  id?: number;
  layout?: Layout;
}

export interface Layout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Request {
  q: string;
  style?: Style;
  metadata?: Metadata[];
  display_type?: "area" | "bars" | "line";
}

export interface ApmRequest {
  apm_query: ApmQuery;
  style?: Style;
  metadata?: Metadata[];
  display_type?: "area" | "bars" | "line";
}

export interface ApmQuery {
  index: string;
  search: {
    query: string;
  };
  group_by: [
    {
      facet: string;
      limit: number;
      sort: {
        order: string;
        aggregation: string;
        facet?: string;
      };
    }
  ];
  compute: {
    aggregation: string;
    facet?: string;
  };
}

export interface Event {
  q: string;
}

export interface Style {
  palette?: "purple" | "dog_classic" | "cool" | "warm" | "orange" | "grey";
  line_type?: "dashed" | "dotted" | "solid";
  line_width?: "normal" | "thick" | "thin";
}

export interface Metadata {
  expression: string;
  alias_name?: string;
}

export interface Marker {
  value: string;
  display_type?: "info dashed" | "warning dashed" | "error dashed";
  label?: string;
}

export interface Axis {
  scale?: string;
  min?: string;
  max?: string;
  include_zero?: boolean;
}

export interface Dashboard {
  id?: string;
  title: string;
  widgets: Widget[];
  layout_type: "ordered" | "free";
  description?: string;
  is_read_only?: boolean;
  notify_list?: string[];
  template_variables?: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  default?: string;
  prefix?: string;
}

export interface DashboardSummary {
  created_at: string;
  is_read_only: boolean;
  description: string;
  title: string;
  url: string;
  layout_type: string;
  modified_at: string;
  author_handle: string;
  id: string;
}

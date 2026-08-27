import { supabase } from "./supabase";

const configuredApiUrl = import.meta.env.VITE_ADMIN_API_URL?.trim();
const apiUrl = configuredApiUrl?.replace(/\/$/, "") ?? "";

export const isAdminApiConfigured = Boolean(apiUrl);

if (isAdminApiConfigured && supabase) {
  void supabase.auth.signOut({ scope: "local" });
}

type ApiError = Error & { status?: number };
type Filter = {
  operator: "eq" | "in";
  column: string;
  value: unknown;
};
type SelectOptions = { count?: "exact"; head?: boolean };

let csrfToken: string | null = null;
let currentUser: { id: string; email: string | null } | null = null;
const authListeners = new Set<(event: string, session: unknown) => void>();

function createError(message: string, status?: number) {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

function emitAuth(event: string, user = currentUser) {
  const session = user ? { user } : null;
  authListeners.forEach((listener) => listener(event, session));
}

async function readResponse(response: Response) {
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw createError(body?.error || "Não foi possível concluir esta operação.", response.status);
  }
  return body;
}

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${apiUrl}/api/auth/csrf`, { credentials: "include" });
  const data = await readResponse(response);
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set("x-csrf-token", await getCsrfToken());
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  return readResponse(response);
}

class AdminQueryBuilder {
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private columns?: string;
  private values?: Record<string, unknown> | Record<string, unknown>[];
  private filters: Filter[] = [];
  private orderBy?: { column: string; ascending?: boolean };
  private resultLimit?: number;
  private resultMode?: "single" | "maybeSingle";
  private selectOptions?: SelectOptions;

  constructor(private table: string) {}

  select(columns = "*", options?: SelectOptions) {
    this.columns = columns;
    this.selectOptions = options;
    return this;
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = "insert";
    this.values = values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.operation = "update";
    this.values = values;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ operator: "eq", column, value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ operator: "in", column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending };
    return this;
  }

  limit(value: number) {
    this.resultLimit = value;
    return this;
  }

  single() {
    this.resultMode = "single";
    return this;
  }

  maybeSingle() {
    this.resultMode = "maybeSingle";
    return this;
  }

  async execute() {
    try {
      const result = await apiFetch("/api/admin/query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          table: this.table,
          operation: this.operation,
          columns: this.columns,
          values: this.values,
          filters: this.filters,
          order: this.orderBy,
          limit: this.resultLimit,
          single: this.resultMode,
          count: this.selectOptions?.count,
          head: this.selectOptions?.head,
        }),
      });
      return { data: result.data ?? null, error: null, count: result.count ?? null };
    } catch (error) {
      return { data: null, error, count: null };
    }
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

function createSecureAdminClient() {
  return {
    from: (table: string) => new AdminQueryBuilder(table),
    rpc: async (name: string, args?: Record<string, unknown>) => {
      try {
        const result = await apiFetch(`/api/admin/rpc/${encodeURIComponent(name)}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(args ?? {}),
        });
        return { data: result.data ?? null, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    storage: {
      from(bucket: string) {
        return {
          async upload(path: string, file: File, _options?: { contentType?: string; upsert?: boolean }) {
            try {
              const formData = new FormData();
              formData.append("bucket", bucket);
              formData.append("folder", path.split("/")[0] || "");
              formData.append("file", file);
              const result = await apiFetch("/api/admin/storage/upload", {
                method: "POST",
                body: formData,
              });
              return { data: { path: result.path }, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
          async remove(paths: string[]) {
            try {
              await apiFetch("/api/admin/storage/remove", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ bucket, paths }),
              });
              return { data: paths, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
        };
      },
    },
    auth: {
      async signInWithPassword({
        email,
        password,
        remember = true,
      }: {
        email: string;
        password: string;
        remember?: boolean;
      }) {
        try {
          const result = await apiFetch("/api/auth/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password, remember }),
          });
          currentUser = result.user;
          emitAuth("SIGNED_IN");
          return { data: { session: { user: currentUser }, user: currentUser }, error: null };
        } catch (error) {
          return { data: { session: null, user: null }, error };
        }
      },
      async getSession() {
        try {
          const result = await apiFetch("/api/auth/session");
          currentUser = result.user;
          return { data: { session: { user: currentUser } }, error: null };
        } catch (error) {
          currentUser = null;
          return { data: { session: null }, error };
        }
      },
      async getUser() {
        const { data, error } = await this.getSession();
        return { data: { user: data.session?.user ?? null }, error };
      },
      async signOut() {
        try {
          await apiFetch("/api/auth/logout", { method: "POST" });
          currentUser = null;
          emitAuth("SIGNED_OUT", null);
          return { error: null };
        } catch (error) {
          return { error };
        }
      },
      onAuthStateChange(callback: (event: string, session: unknown) => void) {
        authListeners.add(callback);
        return { data: { subscription: { unsubscribe: () => authListeners.delete(callback) } } };
      },
    },
  };
}

export const adminSupabase: any = isAdminApiConfigured
  ? createSecureAdminClient()
  : supabase;

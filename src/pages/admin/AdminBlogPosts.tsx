import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowUp, ArrowDown, Trash2, Plus, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  published_at: string;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  data: Json | null;
};

const emptyPost = (): BlogRow => ({
  id: "",
  slug: "",
  title: "",
  published_at: new Date().toISOString(),
  is_published: false,
  is_featured: false,
  display_order: 0,
  data: {},
});

const AdminBlogPosts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [rows, setRows] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<BlogRow | null>(null);
  const [dataText, setDataText] = useState("");
  const [dataError, setDataError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthChecked(true);
      if (!session) navigate("/admin/login", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      setAuthChecked(true);
      if (!data.session) navigate("/admin/login", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,slug,title,published_at,is_published,is_featured,display_order,data")
      .order("display_order", { ascending: true })
      .order("published_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Load failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data ?? []) as BlogRow[]);
  }, [toast]);

  useEffect(() => { if (authChecked) load(); }, [authChecked, load]);

  const patchRow = async (id: string, patch: Partial<Omit<BlogRow, "data">> & { data?: Json }) => {
    const prev = rows;
    setRows(rows.map(r => r.id === id ? { ...r, ...patch } : r));
    const { error } = await supabase.from("blog_posts").update(patch).eq("id", id);
    if (error) {
      setRows(prev);
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const other = idx + dir;
    if (other < 0 || other >= rows.length) return;
    const a = rows[idx], b = rows[other];
    // Swap display_order values
    await Promise.all([
      supabase.from("blog_posts").update({ display_order: b.display_order }).eq("id", a.id),
      supabase.from("blog_posts").update({ display_order: a.display_order }).eq("id", b.id),
    ]);
    load();
  };

  const remove = async (row: BlogRow) => {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", row.id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    toast({ title: "Deleted", description: row.title });
    load();
  };

  const openEdit = (row: BlogRow | null) => {
    const target = row ?? emptyPost();
    setEditing(target);
    setDataText(JSON.stringify(target.data ?? {}, null, 2));
    setDataError(null);
  };

  const save = async () => {
    if (!editing) return;
    let parsed: Json;
    try {
      parsed = JSON.parse(dataText || "{}") as Json;
    } catch (e) {
      setDataError((e as Error).message);
      return;
    }
    if (!editing.slug || !editing.title) {
      toast({ title: "Slug and title required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      slug: editing.slug,
      title: editing.title,
      published_at: editing.published_at,
      is_published: editing.is_published,
      is_featured: editing.is_featured,
      display_order: editing.display_order,
      data: parsed,
    };
    const query = editing.id
      ? supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : supabase.from("blog_posts").insert(payload);
    const { error } = await query;
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing.id ? "Updated" : "Created", description: editing.title });
    setEditing(null);
    load();
  };

  if (!authChecked) {
    return <Layout><div className="p-8"><Loader2 className="animate-spin" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Blog Posts</h1>
            <p className="text-sm text-muted-foreground">
              Manage published posts, featured status, and display order. Source of truth for sitemap/RSS.
            </p>
          </div>
          <Button onClick={() => openEdit(null)}>
            <Plus className="w-4 h-4 mr-2" /> New post
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Order</TableHead>
                <TableHead>Title / Slug</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-center">Live</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={6}><Loader2 className="animate-spin mx-auto my-6" /></TableCell></TableRow>
              )}
              {!loading && rows.map((row, i) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">/{row.slug}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(row.published_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={row.is_published}
                      onCheckedChange={(v) => patchRow(row.id, { is_published: v })}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={row.is_featured}
                      onCheckedChange={(v) => patchRow(row.id, { is_featured: v })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openEdit(row)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(row)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {editing && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto p-6">
            <div className="bg-background border rounded-lg w-full max-w-3xl p-6 my-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{editing.id ? "Edit post" : "New post"}</h2>
                <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <Input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Published at (ISO)</label>
                    <Input
                      value={editing.published_at}
                      onChange={e => setEditing({ ...editing, published_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Display order</label>
                    <Input
                      type="number"
                      value={editing.display_order}
                      onChange={e => setEditing({ ...editing, display_order: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={editing.is_published}
                      onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} /> Published
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={editing.is_featured}
                      onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} /> Featured
                  </label>
                </div>
                <div>
                  <label className="text-sm font-medium">Post data (JSON)</label>
                  <Textarea
                    className="font-mono text-xs h-72"
                    value={dataText}
                    onChange={e => { setDataText(e.target.value); setDataError(null); }}
                  />
                  {dataError && <p className="text-xs text-destructive mt-1">{dataError}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Full BlogPost shape (excerpt, metaDescription, category, imageKey/image, richContent, faqs, cta, etc.).
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button onClick={save} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminBlogPosts;
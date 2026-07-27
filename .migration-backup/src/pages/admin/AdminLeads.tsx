import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Loader2, LogOut, Search, ChevronLeft, ChevronRight, RefreshCw, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  trade: string;
  city: string;
  message: string;
  source: string;
  created_at: string;
};

const PAGE_SIZE = 20;

const AdminLeads = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  // Auth gate
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      setAuthChecked(true);
      if (!session) navigate("/admin/login", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setAuthChecked(true);
      if (!data.session) navigate("/admin/login", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load leads
  const load = async () => {
    if (!authed) return;
    setLoading(true);
    let q = supabase
      .from("leads")
      .select("id,name,email,phone,trade,city,message,source,created_at", { count: "exact" })
      .order("created_at", { ascending: false });
    if (search) {
      const esc = search.replace(/[%_,]/g, (c) => `\\${c}`);
      const like = `%${esc}%`;
      q = q.or(
        `name.ilike.${like},email.ilike.${like},phone.ilike.${like},city.ilike.${like},trade.ilike.${like},message.ilike.${like}`
      );
    }
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count: c, error } = await q.range(from, to);
    if (error) {
      toast({ title: "Failed to load leads", description: error.message, variant: "destructive" });
    } else {
      setLeads((data as Lead[]) ?? []);
      setCount(c ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, page, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (!authChecked) {
    return (
      <Layout>
        <div className="py-24 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 bg-background min-h-[70vh]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-foreground">Leads</h1>
              <p className="text-muted-foreground text-sm mt-1">{count} total submission{count === 1 ? "" : "s"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/proposals">
                  <Target className="w-4 h-4 mr-2" />SEO proposals
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />Sign out
              </Button>
            </div>
          </div>

          <div className="relative mb-4 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search name, email, city, trade, message..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-card border-border pl-9"
            />
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin inline-block text-primary" />
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {search ? "No leads match your search." : "No leads yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((l) => (
                    <TableRow key={l.id} className="cursor-pointer" onClick={() => setSelected(l)}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell>
                        <a href={`mailto:${l.email}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          {l.email}
                        </a>
                      </TableCell>
                      <TableCell>{l.phone ?? "—"}</TableCell>
                      <TableCell>{l.city}</TableCell>
                      <TableCell>{l.trade}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">{l.message}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                <ChevronLeft className="w-4 h-4 mr-1" />Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                Next<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display text-3xl text-foreground">{selected.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span className="text-muted-foreground">Email:</span> <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></div>
              <div><span className="text-muted-foreground">Phone:</span> {selected.phone ?? "—"}</div>
              <div><span className="text-muted-foreground">City:</span> {selected.city}</div>
              <div><span className="text-muted-foreground">Trade:</span> {selected.trade}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Source:</span> {selected.source}</div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">Message</p>
              <p className="whitespace-pre-wrap text-foreground">{selected.message}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminLeads;
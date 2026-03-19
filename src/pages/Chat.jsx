import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageCircle, Plus, Send, Link2, X, ChevronRight,
  Calendar, CheckSquare, Baby, Search, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";

// ─── Utilidades ──────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?";
}

const avatarColors = [
  "bg-teal-100 text-teal-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
];

function colorFor(str = "") {
  let hash = 0;
  for (const c of str) hash += c.charCodeAt(0);
  return avatarColors[hash % avatarColors.length];
}

function timeLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return format(d, "HH:mm");
  if (diffDays === 1) return "Ontem";
  return format(d, "d MMM", { locale: ptBR });
}

// ─── Bolha de mensagem ────────────────────────────────────────────────────────

function MessageBubble({ msg, isOwn, tasks, events }) {
  const linkedTask = msg.linked_task_id ? tasks.find(t => t.id === msg.linked_task_id) : null;
  const linkedEvent = msg.linked_event_id ? events.find(e => e.id === msg.linked_event_id) : null;

  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"} items-end`}>
      {!isOwn && (
        <Avatar className="w-7 h-7 flex-shrink-0 mb-0.5">
          <AvatarFallback className={`text-[10px] font-bold ${colorFor(msg.sender_email)}`}>
            {getInitials(msg.sender_name || msg.sender_email)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <span className="text-[11px] text-slate-400 px-1">{msg.sender_name || msg.sender_email}</span>
        )}
        <div className={`rounded-2xl px-3.5 py-2.5 ${
          isOwn
            ? "bg-teal-600 text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        </div>

        {/* Vínculo com tarefa/evento */}
        {(linkedTask || linkedEvent) && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border max-w-full ${
            isOwn
              ? "bg-teal-50 border-teal-200 text-teal-700"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}>
            {linkedTask && (
              <><CheckSquare className="w-3 h-3 flex-shrink-0" /><span className="truncate">{linkedTask.title}</span></>
            )}
            {linkedEvent && (
              <><Calendar className="w-3 h-3 flex-shrink-0" /><span className="truncate">{linkedEvent.title}</span></>
            )}
          </div>
        )}

        <span className="text-[10px] text-slate-400 px-1">
          {timeLabel(msg.created_date)}
        </span>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Chat() {
  const [selectedConv, setSelectedConv] = useState(null);
  const [text, setText] = useState("");
  const [linkMode, setLinkMode] = useState(false);
  const [linkedTask, setLinkedTask] = useState(null);
  const [linkedEvent, setLinkedEvent] = useState(null);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newChildId, setNewChildId] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();
  const [me, setMe] = useState(null);

  useEffect(() => { api.auth.me().then(setMe).catch(() => {}); }, []);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.conversations.list(100),
    refetchInterval: 15000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConv?.id],
    queryFn: () => api.messages.listByConversation(selectedConv.id, 200),
    enabled: !!selectedConv,
    refetchInterval: 5000,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.tasks.list(100),
  });
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => api.events.list(100),
  });
  const { data: children = [] } = useQuery({
    queryKey: ["children"],
    queryFn: () => api.children.list(),
  });

  const childMap = Object.fromEntries(children.map(c => [c.id, c.name]));

  // Auto-scroll ao chegarem novas mensagens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sem WebSocket por enquanto; usamos apenas refetchInterval nas queries.

  const sendMessage = useMutation({
    mutationFn: async (payload) => {
      const msg = await api.messages.create(payload);
      await api.conversations.update(selectedConv.id, {
        last_message: payload.text.slice(0, 80),
        last_message_at: new Date().toISOString(),
        last_message_by: me?.email,
      });
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConv.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setText("");
      setLinkedTask(null);
      setLinkedEvent(null);
      setLinkMode(false);
    },
  });

  const createConversation = useMutation({
    mutationFn: (data) => api.conversations.create(data),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedConv(conv);
      setShowNewConv(false);
      setNewTitle("");
      setNewChildId("");
    },
  });

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim() || !selectedConv) return;
    sendMessage.mutate({
      conversation_id: selectedConv.id,
      text: text.trim(),
      sender_email: me?.email || "desconhecido",
      sender_name: me?.full_name || me?.email || "Você",
      linked_task_id: linkedTask || undefined,
      linked_event_id: linkedEvent || undefined,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredConvs = conversations.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] -m-4 md:-m-8">
      <PageHeader
        title="Chat"
        description="Mensagens da rede de apoio"
        action={
          <Button onClick={() => setShowNewConv(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" /> Nova Conversa
          </Button>
        }
      />

      <div className="flex flex-1 min-h-0 gap-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mx-0">

        {/* ── Sidebar de conversas ─────────────────────────────────────── */}
        <div className={`flex flex-col border-r border-slate-100 bg-slate-50 ${selectedConv ? "hidden lg:flex w-72" : "flex w-full lg:w-72"}`}>
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Buscar conversas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="Nenhuma conversa"
                description="Crie uma nova conversa para começar"
              />
            ) : (
              filteredConvs.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-white transition-colors border-b border-slate-100 ${
                    selectedConv?.id === conv.id ? "bg-white border-l-2 border-l-teal-500" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-slate-800 truncate">{conv.title}</span>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{timeLabel(conv.last_message_at)}</span>
                      )}
                    </div>
                    {conv.child_id && childMap[conv.child_id] && (
                      <p className="text-[11px] text-teal-600 font-medium flex items-center gap-1 mt-0.5">
                        <Baby className="w-3 h-3" />{childMap[conv.child_id]}
                      </p>
                    )}
                    {conv.last_message && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Área de mensagens ────────────────────────────────────────── */}
        <div className={`flex flex-col flex-1 min-w-0 ${!selectedConv ? "hidden lg:flex" : "flex"}`}>
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageCircle}
                title="Selecione uma conversa"
                description="Escolha uma conversa na lista ou crie uma nova"
              />
            </div>
          ) : (
            <>
              {/* Header da conversa */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-white">
                <button
                  className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg"
                  onClick={() => setSelectedConv(null)}
                >
                  <ChevronRight className="w-4 h-4 rotate-180 text-slate-500" />
                </button>
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{selectedConv.title}</p>
                  {selectedConv.child_id && childMap[selectedConv.child_id] && (
                    <p className="text-[11px] text-teal-600 flex items-center gap-1">
                      <Baby className="w-3 h-3" />{childMap[selectedConv.child_id]}
                    </p>
                  )}
                </div>
                <Users className="w-4 h-4 text-slate-400" />
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                    <MessageCircle className="w-8 h-8 text-slate-300" />
                    <p className="text-sm text-slate-400">Nenhuma mensagem ainda. Diga olá! 👋</p>
                  </div>
                )}
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.sender_email === me?.email}
                    tasks={tasks}
                    events={events}
                  />
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Barra de vínculo (tarefa/evento) */}
              {linkMode && (
                <div className="px-4 py-2 bg-teal-50 border-t border-teal-100 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-1 flex-wrap gap-2">
                    <span className="text-xs font-medium text-teal-700 flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5" /> Vincular a:
                    </span>

                    <Select value={linkedTask || ""} onValueChange={v => { setLinkedTask(v || null); setLinkedEvent(null); }}>
                      <SelectTrigger className="h-7 text-xs w-44 bg-white border-teal-200">
                        <SelectValue placeholder="Tarefa..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Nenhuma tarefa</SelectItem>
                        {tasks.filter(t => t.status !== "concluida").map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={linkedEvent || ""} onValueChange={v => { setLinkedEvent(v || null); setLinkedTask(null); }}>
                      <SelectTrigger className="h-7 text-xs w-44 bg-white border-teal-200">
                        <SelectValue placeholder="Evento..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Nenhum evento</SelectItem>
                        {events.slice(0, 20).map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <button onClick={() => { setLinkMode(false); setLinkedTask(null); setLinkedEvent(null); }}>
                    <X className="w-4 h-4 text-teal-500 hover:text-teal-700" />
                  </button>
                </div>
              )}

              {/* Indicador de vínculo selecionado */}
              {(linkedTask || linkedEvent) && (
                <div className="px-4 py-1.5 bg-teal-50 border-t border-teal-100 flex items-center gap-2">
                  {linkedTask && (
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-[11px] flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" />
                      {tasks.find(t => t.id === linkedTask)?.title}
                    </Badge>
                  )}
                  {linkedEvent && (
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {events.find(e => e.id === linkedEvent)?.title}
                    </Badge>
                  )}
                </div>
              )}

              {/* Input de mensagem */}
              <form onSubmit={handleSend} className="px-4 py-3 bg-white border-t border-slate-100 flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => setLinkMode(prev => !prev)}
                  className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
                    linkMode || linkedTask || linkedEvent
                      ? "bg-teal-100 text-teal-700"
                      : "hover:bg-slate-100 text-slate-400"
                  }`}
                  title="Vincular tarefa ou evento"
                >
                  <Link2 className="w-4 h-4" />
                </button>

                <Textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma mensagem... (Enter para enviar)"
                  className="flex-1 resize-none min-h-[40px] max-h-32 text-sm py-2.5"
                  rows={1}
                />

                <Button
                  type="submit"
                  disabled={!text.trim() || sendMessage.isPending}
                  className="bg-teal-600 hover:bg-teal-700 flex-shrink-0 h-10 w-10 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── Modal nova conversa ────────────────────────────────────────── */}
      <Dialog open={showNewConv} onOpenChange={setShowNewConv}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Nova Conversa</DialogTitle></DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              createConversation.mutate({
                title: newTitle,
                child_id: newChildId || undefined,
                last_message_at: new Date().toISOString(),
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label>Nome da conversa *</Label>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ex: Rotina da semana"
                required
              />
            </div>
            <div>
              <Label>Criança relacionada</Label>
              <Select value={newChildId} onValueChange={setNewChildId}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhuma</SelectItem>
                  {children.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={createConversation.isPending}>
              {createConversation.isPending ? "Criando..." : "Criar Conversa"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
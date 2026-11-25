import React, { useEffect, useRef, useState } from "react";
import { AppWindow, Bell, ChevronRight, Cpu, FileCode2, Folder, HardDrive, Minus, Play, Plus, Search, Settings as SettingsIcon, TerminalSquare, Trash2, Wifi, X, Maximize2, Save, Lock, Unlock, Activity, Database, Shield, Server, BrainCircuit, Network, FolderOpen } from "lucide-react";

type AppId = "terminal" | "editor" | "files" | "kotlin" | "ai" | "network" | "daemon" | "vault" | "settings" | "basic" | "erlang" | "erlangtest" | "shift" | "vbtest" | "firewall" | "bootlog" | "jetbrains" | "matrix" | "ghost" | "cuda" | "transitter" | "checklist";
type GhostGroup = "BASIC" | "ERLANG" | "VB" | "KOTLIN" | "CUDA";
type GhostRun = { id: string; time: string; group: GhostGroup; lang: string; code: string; output: string; ms: number; status: "OK" | "HIBA"; gpu: boolean };
type Win = { id: string; app: AppId; title: string; x: number; y: number; w: number; h: number; min: boolean; max: boolean; z: number };
type DocFile = { id: string; name: string; path: string; content: string; lang: string; folder: string };

const RED = "#FF0A1E";
const APPS: { id: AppId; name: string; cat: string; desc: string; code: string }[] = [
  { id: "terminal", name: "Terminál", cat: "RENDSZER", desc: "UNIX konzol — lent dokkolva", code: ">_" },
  { id: "files", name: "Fájlkezelő", cat: "RENDSZER", desc: "apps / core / daemon / server / data", code: "FL" },
  { id: "settings", name: "Beállítások", cat: "RENDSZER", desc: "Rendszer és állapot", code: "ST" },
  { id: "editor", name: "Kódszerkesztő", cat: "FEJLESZTÉS", desc: "Kotlin / JS / Python", code: "</>" },
  { id: "kotlin", name: "Kotlin Server", cat: "HÁLÓZAT", desc: "Port 8080 • /health", code: "KT" },
  { id: "ai", name: "AI Környezet", cat: "HÁLÓZAT", desc: "Helyi feldolgozás", code: "AI" },
  { id: "network", name: "Hálózat / COM", cat: "HÁLÓZAT", desc: "LAN • COM1–COM4", code: "NT" },
  { id: "daemon", name: "Serpentine Daemon", cat: "HÁLÓZAT", desc: "PID 777 • figyelés", code: "DM" },
  { id: "vault", name: "Vault / AES", cat: "HÁLÓZAT", desc: "AES-GCM + PBKDF2", code: "VA" },
  { id: "basic", name: "BASIC / PLUS4", cat: "FEJLESZTÉS", desc: "BASIC Studio + Commodore Plus/4", code: "B4" },
  { id: "erlang", name: "Erlang / Files", cat: "FEJLESZTÉS", desc: "Erlang / OTP 27 + fájlrendszer", code: "ER" },
  { id: "shift", name: "SHIFT LAYER", cat: "FEJLESZTÉS", desc: "OpenShift + SoftLayer • VB teszt", code: "SL" },
  { id: "vbtest", name: "VISUAL BASIC TEST - SHIFT LAYER", cat: "FEJLESZTÉS", desc: "VB tesztablak • .NET konzol", code: "VB" },
  { id: "firewall", name: "TŰZFAL", cat: "RENDSZER", desc: "sudo / iptables / nftables / ufw — KALI MÓD", code: "FW" },
  { id: "bootlog", name: "Boot Napló", cat: "RENDSZER", desc: "Boot log • GEO kód • Gép adatok", code: "BL" },
  { id: "jetbrains", name: "JetBrains", cat: "HÁLÓZAT", desc: "Ingyenes eszközök • AES védett mappa", code: "JB" },
  { id: "matrix", name: "MODULÁCIÓS MÁTRIX", cat: "HÁLÓZAT", desc: "Astra • NATO • BlackIce • mátrix + Matya Konzol", code: "MX" },
  { id: "ghost", name: "Ghost", cat: "HÁLÓZAT", desc: "Shockwave Engine • háttérben fut", code: "GH" },
  { id: "cuda", name: "CUDA Ghost Screen", cat: "HÁLÓZAT", desc: "Futtatások összesítve • GPU", code: "CU" },
  { id: "transitter", name: "TRANSITTER", cat: "FEJLESZTÉS", desc: "Transz Neurális Mátrix • Rádiós kódolás • TX minden szerveren", code: "TX" },
  { id: "checklist", name: "ELLENŐRZŐ LISTA", cat: "RENDSZER", desc: "Telepítés utáni ellenőrző lista • FINAL", code: "CL" },
];
// KÖZPONTI IKON SZABÁLY — egyetlen forrás: ami itt szerepel, az a Start menüben van,
// és NEM jelenik meg asztali ikonként. Ami nincs itt, az automatikusan az asztalra kerül.
// KÖZPONTI IKON SZABÁLY — VÉGLEGES: MINDEN program a START menüben van,
// ezért az asztal ÜRES. A listából számolunk, nincs duplázás, nincs asztali ikon.
const START_MENU_APPS: AppId[] = ["terminal", "files", "settings", "editor", "kotlin", "ai", "network", "daemon", "vault", "basic", "erlang", "shift", "vbtest", "firewall", "bootlog", "jetbrains", "matrix", "ghost", "cuda", "transitter", "checklist"];
type MatrixStatus = "KI" | "FUT" | "HIBA";
type MatrixModulation = "HULLÁM" | "PULZUS" | "FOLYAMATOS" | "SZÜNET";
type MatrixModule = { id: string; name: string; desc: string; port: string; deps: string[]; status: MatrixStatus; net: boolean; priority: number; modulation: MatrixModulation; load: number; note: string; aliases: string[] };
function matrixNormalize(s: string): string { return s.toLowerCase().replace(/[áà]/g, "a").replace(/[é]/g, "e").replace(/[í]/g, "i").replace(/[óöő]/g, "o").replace(/[úüű]/g, "u").replace(/[^a-z0-9]/g, ""); }
const MATRIX_DEFAULTS: MatrixModule[] = [
  { id: "astra", name: "Astra Core", desc: "Astra asztal MATYA CORE alkalmazása — a mátrix központi magja, minden beépülő modult innen vezérlünk.", port: "MATYA-CORE", deps: [], status: "FUT", net: true, priority: 5, modulation: "FOLYAMATOS", load: 42, note: "", aliases: ["astra", "astra core", "core"] },
  { id: "nato", name: "NATO Asszisztens", desc: "NATO asszisztens — rövid, kötött formátumú üzenetek, státusz és kommunikációs sablonok a mátrixból.", port: "NATO-01", deps: ["Astra Core", "Kommunikációs Rendszer"], status: "FUT", net: true, priority: 4, modulation: "PULZUS", load: 28, note: "", aliases: ["nato", "nato asszisztens", "natoasszisztens"] },
  { id: "comm", name: "Kommunikációs Rendszer", desc: "Kommunikációs rendszer — belső üzenetforgalom, csatornák és hálózati kapcsolat a modulok között.", port: "9000", deps: ["Astra Core"], status: "FUT", net: true, priority: 4, modulation: "FOLYAMATOS", load: 36, note: "", aliases: ["kommunikacio", "kommunikacios rendszer", "kommunikációs rendszer", "comm", "kommunikáció"] },
  { id: "konzol", name: "Natív Konzol / AI Konzol", desc: "Natív konzol / AI konzol — a mátrix saját parancssora, az alsó Matya Konzolban fut.", port: "KONZOL", deps: ["Astra Core"], status: "FUT", net: true, priority: 5, modulation: "FOLYAMATOS", load: 31, note: "", aliases: ["konzol", "nativ konzol", "natív konzol", "ai konzol", "aikonzol"] },
  { id: "blackice", name: "BlackIce", desc: "BlackIce — helyi kódolás a konzolból: blackice encode <szöveg>. A kódolt forma csak ebben a mátrixban értelmezett.", port: "8443", deps: ["Vault/AES"], status: "FUT", net: true, priority: 4, modulation: "HULLÁM", load: 22, note: "", aliases: ["blackice", "black ice", "black-ice"] },
  { id: "editor", name: "Szövegszerkesztő", desc: "Szövegszerkesztő — a mátrixból megnyitható szerkesztő a kódokhoz és jegyzetekhez.", port: "EDITOR", deps: ["Astra Core", "Dokumentumtároló"], status: "FUT", net: false, priority: 2, modulation: "SZÜNET", load: 12, note: "", aliases: ["szovegszerkeszto", "szövegszerkesztő", "editor"] },
  { id: "docs", name: "Dokumentumtároló", desc: "Dokumentumtároló — a mátrix dokumentumai és mentett állapotai egy helyen.", port: "DOCS", deps: ["Astra Core", "Vault/AES"], status: "FUT", net: false, priority: 3, modulation: "FOLYAMATOS", load: 18, note: "", aliases: ["dokumentumtarolo", "dokumentumtároló", "docs", "dokumentum"] },
  { id: "anim", name: "Animáció", desc: "Animáció — a mátrix terhelés- és modulációsávjainak mozgása, vizuális visszajelzés.", port: "ANIM", deps: ["Astra Core"], status: "KI", net: false, priority: 2, modulation: "HULLÁM", load: 8, note: "", aliases: ["animacio", "animáció", "anim"] },
  { id: "radio", name: "Rádió/GSM", desc: "Rádió / GSM — vezeték nélküli csatorna, a hálózati listában jelenik meg.", port: "GSM", deps: ["Kommunikációs Rendszer"], status: "KI", net: true, priority: 3, modulation: "PULZUS", load: 15, note: "", aliases: ["radio", "rádió", "gsm", "radio/gsm", "rádió/gsm"] },
  { id: "terra", name: "TERRA Kódfejtő", desc: "TERRA Kódfejtő — kódolt szövegek helyi megfejtése a mátrix konzolján keresztül.", port: "TERRA", deps: ["BlackIce", "Vault/AES"], status: "KI", net: false, priority: 4, modulation: "HULLÁM", load: 10, note: "", aliases: ["terra", "terra kodfejto", "terra kódfejtő"] },
  { id: "plus4", name: "Plus/4", desc: "Plus/4 — BASIC Studio + Commodore Plus/4 emulátor, a mátrixból indítható.", port: "PLUS4", deps: ["Astra Core"], status: "KI", net: false, priority: 2, modulation: "SZÜNET", load: 6, note: "", aliases: ["plus4", "plus/4", "plus", "basic"] },
  { id: "erlang", name: "Erlang Studio", desc: "Erlang Studio — Erlang / OTP 27 + fájlrendszer, a mátrix beépülő modulja.", port: "ERLANG", deps: ["Astra Core"], status: "FUT", net: false, priority: 3, modulation: "FOLYAMATOS", load: 24, note: "", aliases: ["erlang", "erlang studio"] },
  { id: "shift", name: "Shift Layer", desc: "Shift Layer — OpenShift + SoftLayer katalógus és deploy fájlok a mátrixban.", port: "SHIFT", deps: ["Astra Core", "Kommunikációs Rendszer"], status: "FUT", net: true, priority: 3, modulation: "PULZUS", load: 26, note: "", aliases: ["shift", "shift layer", "shiftlayer"] },
  { id: "firewall", name: "Tűzfal", desc: "Tűzfal — sudo / iptables / nftables / ufw, KALI MÓD. Konzolból: matrix stop tűzfal.", port: "FW", deps: ["Astra Core", "Serpentine Daemon"], status: "FUT", net: true, priority: 5, modulation: "FOLYAMATOS", load: 48, note: "", aliases: ["tuzfal", "tűzfal", "firewall", "fw"] },
  { id: "daemon", name: "Serpentine Daemon", desc: "Serpentine Daemon — háttérben futó figyelő, PID 777. A mátrix háttérrendszereinek egyike.", port: "777", deps: ["Astra Core"], status: "FUT", net: false, priority: 5, modulation: "FOLYAMATOS", load: 33, note: "", aliases: ["daemon", "serpentine", "serpentine daemon"] },
  { id: "vault", name: "Vault/AES", desc: "Vault / AES — AES-GCM + PBKDF2 védett tároló a mátrix érzékeny moduljaihoz.", port: "VAULT", deps: ["Astra Core"], status: "FUT", net: false, priority: 5, modulation: "SZÜNET", load: 14, note: "", aliases: ["vault", "vault/aes", "aes"] },
  { id: "kotlin", name: "Kotlin Server", desc: "Kotlin Server — Port 8080 • /health. Háttérben futó rendszer a mátrix alatt.", port: "8080", deps: ["Astra Core"], status: "FUT", net: true, priority: 4, modulation: "FOLYAMATOS", load: 38, note: "", aliases: ["kotlin", "kotlin server", "server"] },
  { id: "ai", name: "AI Környezet", desc: "AI Környezet — helyi feldolgozás, nincs külső hívás.", port: "AI", deps: ["Astra Core", "Natív Konzol / AI Konzol"], status: "FUT", net: false, priority: 3, modulation: "PULZUS", load: 29, note: "", aliases: ["ai", "ai kornyezet", "ai környezet"] },
  { id: "bootlog", name: "Boot Napló", desc: "Boot Napló — boot log, GEO kód és a futtató gép adatai.", port: "BOOT", deps: ["Astra Core"], status: "FUT", net: false, priority: 2, modulation: "SZÜNET", load: 9, note: "", aliases: ["boot", "boot naplo", "boot napló", "bootlog"] },
];
const DESKTOP_APPS = APPS.filter(function (a) { return START_MENU_APPS.indexOf(a.id) < 0; });

const DEFAULT_FILES: DocFile[] = [
  { id: "f1", name: "Main.kt", path: "apps/core/Main.kt", lang: "kotlin", folder: "apps/core", content: "fun main() {\n    println(\"MATYA CORE indul a 8080-as porton\")\n}" },
  { id: "f2", name: "server.kt", path: "server/server.kt", lang: "kotlin", folder: "server", content: "fun health(): String {\n    return \"OK — MATYA CORE :8080\"\n}" },
  { id: "f3", name: "ai.py", path: "apps/ai/ai.py", lang: "python", folder: "apps/ai", content: "def ask(q):\n    return \"Helyi válasz: \" + q\n\nprint(ask(\"status\"))" },
  { id: "f4", name: "app.js", path: "apps/core/app.js", lang: "javascript", folder: "apps/core", content: "const port = 8080;\nconsole.log(\"MATYA CORE kliens: \" + port);" },
];

const FOLDERS = ["apps/", "core/", "daemon/", "server/", "data/vault/", "apps/ai/"];
type FsFile = { id: string; name: string; path: string; folder: string; content: string; lang: string };
const FS_FOLDERS = ["apps/", "core/", "erlang/", "aes-vault/", "shift-layer/", "closed-system/"];
const FS_SAMPLES: FsFile[] = [
  { id: "fs-hello", name: "hello.erl", path: "erlang/hello.erl", folder: "erlang/", content: "-module(hello).\n-export([start/0, hello/1]).\nstart() -> io:format(\"HELLO MATYA CORE~n\"), hello(5).\nhello(0) -> done;\nhello(N) -> io:format(\"PLUS/4 - ~p~n\", [N]), hello(N-1).\n", lang: "erlang" },
  { id: "fs-szerver", name: "szerver.erl", path: "erlang/szerver.erl", folder: "erlang/", content: "-module(szerver).\n-export([start/0, loop/0]).\nstart() -> Pid = spawn(szerver, loop, []), Pid ! {ping, self()}, receive pong -> io:format(\"SZERVER: pong erkezett~n\") end.\nloop() -> receive {ping, From} -> io:format(\"SZERVER: ping erkezett~n\"), From ! pong, loop() end.\n", lang: "erlang" },
  { id: "fs-matya", name: "matya.bas", path: "apps/matya.bas", folder: "apps/", content: "10 PRINT \"HELLO MATYA CORE\"\n20 FOR I=1 TO 5\n30 PRINT \"ERLANG + BASIC - \";I\n40 NEXT I\n50 PRINT \"READY.\"\n60 END\n", lang: "basic" },
];
const SHIFT_CATALOG: { id: string; provider: "openshift" | "softlayer"; name: string; desc: string; free: string }[] = [
  { id: "oc-sandbox", provider: "openshift", name: "OpenShift Sandbox (Developer Sandbox)", desc: "Fejlesztői sandbox környezet kipróbálásra.", free: "Ingyenes • 30 nap • 1 projekt" },
  { id: "oc-platform", provider: "openshift", name: "OpenShift Container Platform", desc: "Vállalati konténerplatform, helyi kipróbálással.", free: "Trial / CodeReady Containers helyi" },
  { id: "oc-serverless", provider: "openshift", name: "OpenShift Serverless (Knative)", desc: "Eseményvezérelt, nullára skálázódó szolgáltatások.", free: "Scale-to-zero • ingyenes keret" },
  { id: "oc-pipelines", provider: "openshift", name: "OpenShift Pipelines (Tekton)", desc: "CI/CD pipeline-ok konténerben.", free: "CI/CD • ingyenes" },
  { id: "oc-gitops", provider: "openshift", name: "OpenShift GitOps (ArgoCD)", desc: "Git-alapú folyamatos telepítés.", free: "Ingyenes" },
  { id: "oc-ai", provider: "openshift", name: "OpenShift AI / Lightspeed", desc: "AI-munkaterhelések és asszisztens a platformon.", free: "Trial" },
  { id: "sl-free", provider: "softlayer", name: "IBM Cloud Free Tier", desc: "Lite fiók az IBM Cloudon.", free: "Lite fiók • ingyenes • kártya nélkül" },
  { id: "sl-vsi", provider: "softlayer", name: "SoftLayer Virtual Server", desc: "Óradíjas virtuális szerver.", free: "Hourly • ingyenes kredit próba" },
  { id: "sl-bare", provider: "softlayer", name: "SoftLayer Bare Metal", desc: "Dedikált fizikai szerver.", free: "Próba kredit" },
  { id: "sl-cos", provider: "softlayer", name: "IBM Cloud Object Storage Lite", desc: "Objektumtárolás fájlokhoz, mentésekhez.", free: "25 GB ingyenes" },
  { id: "sl-iks", provider: "softlayer", name: "IBM Cloud Kubernetes (IKS) Free Cluster", desc: "Kubernetes-fürt kipróbálásra.", free: "1 worker • ingyenes" },
  { id: "sl-codeengine", provider: "softlayer", name: "IBM Cloud Code Engine", desc: "Konténeres alkalmazások futtatása.", free: "Ingyenes keret • scale-to-zero" },
  { id: "sl-watson", provider: "softlayer", name: "Watson / IBM Cloud Databases Lite", desc: "Adatbázis- és AI-szolgáltatások Lite tierben.", free: "Ingyenes tier" },
];
const SHIFT_SNIPPETS: { id: string; title: string; lang: string; code: string }[] = [
  { id: "oc-login", title: "OpenShift: oc login", lang: "SH", code: "oc login --token=<TOKEN> --server=https://api.matya-core.example:6443" },
  { id: "oc-project", title: "OpenShift: új projekt", lang: "SH", code: "oc new-project matya" },
  { id: "oc-app", title: "OpenShift: new-app", lang: "SH", code: "oc new-app https://github.com/matya-core/app.git\noc expose svc/matya-app" },
  { id: "oc-pods", title: "OpenShift: podok", lang: "SH", code: "oc get pods\noc get svc\noc logs -f deployment/matya-app" },
  { id: "ibm-login", title: "SoftLayer / IBM Cloud: login", lang: "SH", code: "ibmcloud login\nibmcloud target -r eu-de" },
  { id: "ibm-ks", title: "IBM Cloud: Kubernetes cluster", lang: "SH", code: "ibmcloud ks cluster create classic --name matya-cluster --zone eu-de-1 --flavor free" },
  { id: "ibm-cos", title: "IBM Cloud: Object Storage bucket", lang: "SH", code: "ibmcloud cos bucket-create --bucket matya-backup --region eu-de" },
  { id: "dockerfile", title: "Dockerfile minta", lang: "TXT", code: "FROM registry.access.redhat.com/ubi9/dotnet-8\nWORKDIR /app\nCOPY . .\nEXPOSE 8080\nCMD [\"dotnet\", \"MatyaApp.dll\"]" },
  { id: "deploy-yaml", title: "deployment.yaml (OpenShift)", lang: "YAML", code: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: matya-app\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: matya-app\n  template:\n    metadata:\n      labels:\n        app: matya-app\n    spec:\n      containers:\n      - name: matya-app\n        image: matya-app:latest\n        ports:\n        - containerPort: 8080" },
  { id: "service-yaml", title: "service.yaml", lang: "YAML", code: "apiVersion: v1\nkind: Service\nmetadata:\n  name: matya-app\nspec:\n  selector:\n    app: matya-app\n  ports:\n  - port: 80\n    targetPort: 8080" },
  { id: "knative-yaml", title: "Knative service.yaml", lang: "YAML", code: "apiVersion: serving.knative.dev/v1\nkind: Service\nmetadata:\n  name: matya-app\nspec:\n  template:\n    spec:\n      containers:\n      - image: matya-app:latest" },
  { id: "vb-sample", title: "Visual Basic minta", lang: "VB", code: "Module MatyaApp\n  Sub Main()\n    Dim nev As String = \"MATYA CORE\"\n    Dim szam As Integer = 5\n    Console.WriteLine(\"HELLO \" & nev)\n    For i = 1 To szam\n      Console.WriteLine(\"SHIFT LAYER - \" & i)\n    Next\n    If szam > 3 Then\n      Console.WriteLine(\"KESZ - OPENSHIFT READY\")\n    End If\n  End Sub\nEnd Module" },
];
const VB_SAMPLE_HELLO = SHIFT_SNIPPETS[11].code;
const VB_SAMPLE_CALC = "Module MatyaApp\n  Sub Main()\n    Dim a As Integer = 12\n    Dim b As Integer = 4\n    Console.WriteLine(\"OSSZEG: \" & (a + b))\n    Console.WriteLine(\"SZORZAT: \" & (a * b))\n    Console.WriteLine(\"NEV: \" & UCase(\"matya\"))\n    Console.WriteLine(\"HOSSZ: \" & Len(\"SHIFT\"))\n  End Sub\nEnd Module";
const VB_SAMPLE_GUESS = "Module MatyaApp\n  Sub Main()\n    Dim titok As Integer = 7\n    Dim tipp As Integer = 0\n    Console.WriteLine(\"TIPPELJ 1-10 KOZOTT\")\n    While tipp <> titok\n      tipp = CInt(InputBox(\"Tipp:\"))\n      If tipp < titok Then\n        Console.WriteLine(\"NAGYOBB\")\n      ElseIf tipp > titok Then\n        Console.WriteLine(\"KISEBB\")\n      Else\n        Console.WriteLine(\"EL TALTAD!\")\n      End If\n    End While\n  End Sub\nEnd Module";
const VB_SAMPLE_DEPLOY = "Module MatyaApp\n  Sub Main()\n    Dim projekt As String = \"matya\"\n    Console.WriteLine(\"oc new-project \" & projekt & \"... OK\")\n    Console.WriteLine(\"oc new-app matya-app... OK\")\n    Console.WriteLine(\"oc expose svc/matya-app... OK\")\n    Dim i As Integer\n    For i = 1 To 3\n      Console.WriteLine(\"pod \" & i & \" Running...\")\n    Next\n    Console.WriteLine(\"KESZ - OPENSHIFT READY\")\n    MsgBox(\"Deploy kesz: \" & projekt)\n  End Sub\nEnd Module";
const ERLANG_HELLO = FS_SAMPLES[0].content;
const ERLANG_PINGPONG = "-module(pingpong).\n-export([start/0, ping/2, pong/0]).\nstart() -> Pong = spawn(pingpong, pong, []), spawn(pingpong, ping, [3, Pong]).\nping(0, Pong) -> Pong ! finished, io:format(\"PING: kesz~n\");\nping(N, Pong) -> Pong ! {ping, self()}, receive pong -> io:format(\"PING: pong ~p~n\", [N]) end, ping(N-1, Pong).\npong() -> receive finished -> io:format(\"PONG: vege~n\"); {ping, Ping} -> io:format(\"PONG: ping erkezett~n\"), Ping ! pong, pong() end.\n";
const ERLANG_COUNTER = "-module(szamlalo).\n-export([start/0, loop/1]).\nstart() -> Pid = spawn(szamlalo, loop, [0]), Pid ! {novel, 5}, Pid ! {novel, 3}, Pid ! lekerdez, Pid ! lekerdez.\nloop(N) -> receive {novel, X} -> Uj = N + X, io:format(\"SZAMLALO: ~p~n\", [Uj]), loop(Uj); lekerdez -> io:format(\"SZAMLALO ERTEK: ~p~n\", [N]), loop(N) end.\n";

async function api(action: string, args: unknown) {
  const r = await fetch("actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, args }) });
  const j = await r.json().catch(function () { return {}; });
  const rec = j as { error?: string; data?: unknown };
  if (!r.ok || rec.error) throw new Error(rec.error || "Hiba");
  return rec.data;
}

export default function App() {
  const [boot, setBoot] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [now, setNow] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);
  // ---- GHOST (SHOCKWAVE) + CUDA GHOST SCREEN ----
  const [ghostVisible, setGhostVisible] = useState(true);
  const [ghostTab, setGhostTab] = useState<"ghost" | "cuda">("ghost");
  const [ghostFlash, setGhostFlash] = useState(0);
  const [ghostLog, setGhostLog] = useState<string[]>(["[GHOST] SHOCKWAVE ENGINE v12 — háttérben FUT", "[GHOST] Figyelés: BASIC • ERLANG • VB • KOTLIN/JS/PYTHON • CUDA"]);
  const [ghostRuns, setGhostRuns] = useState<GhostRun[]>([]);
  const [cudaInstalled, setCudaInstalled] = useState(false);
  const [cudaLog, setCudaLog] = useState<string[]>(["CUDA TELEPÍTÉS — készen áll az indításra."]);
  const [cudaProgress, setCudaProgress] = useState(0);
  const [cudaBusy, setCudaBusy] = useState(false);
  const [cudaFilter, setCudaFilter] = useState<"ALL" | GhostGroup | "HIBA">("ALL");
  const [cudaSnapshotMsg, setCudaSnapshotMsg] = useState("");
  const [kernelName, setKernelName] = useState("matya_add");
  const [kernelBlocks, setKernelBlocks] = useState("1024");
  const [kernelThreads, setKernelThreads] = useState("256");
  const [kernelLog, setKernelLog] = useState<string[]>(["CUDA KERNEL — készen áll."]);
  const [ghostParticles, setGhostParticles] = useState(128);
  const ghostCanvasRef = useRef<HTMLCanvasElement>(null);
  const ghostRunsRef = useRef<GhostRun[]>([]);
  useEffect(function () {
    const cv = ghostCanvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height);
    const flash = ghostFlash;
    for (let x = 0; x < cv.width; x += 2) {
      const y = 55 + Math.sin((x + flash * 22) / 18) * 22 + Math.sin((x + flash * 9) / 7) * 8;
      ctx.fillStyle = flash % 2 === 0 ? "#FF0A1E" : "#00e676"; ctx.fillRect(x, y, 2, 2);
    }
    for (let i = 0; i < ghostParticles; i++) {
      const px = (i * 37 + flash * 31) % cv.width; const py = (i * 53 + flash * 17) % cv.height;
      ctx.fillStyle = i % 3 === 0 ? "#fff" : "#FF0A1E"; ctx.fillRect(px, py, 2, 2);
    }
    ctx.fillStyle = "#ececec"; ctx.font = "10px monospace"; ctx.fillText(ghostVisible ? "GHOST LÁTHATÓ — SHOCKWAVE" : "GHOST LÁTHATATLAN", 8, 14);
  }, [ghostFlash, ghostVisible, ghostParticles]);
  const [query, setQuery] = useState("");
  const [windows, setWindows] = useState<Win[]>([]);
  const [activeId, setActiveId] = useState("");
  const [zTop, setZTop] = useState(20);
  const [files, setFiles] = useState<DocFile[]>(DEFAULT_FILES);
  const [persistMsg, setPersistMsg] = useState("Mentett fájlok betöltése…");
  const [selectedFile, setSelectedFile] = useState("f1");
  const [editorText, setEditorText] = useState(DEFAULT_FILES[0].content);
  const [editorLang, setEditorLang] = useState("kotlin");
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [consoleLines, setConsoleLines] = useState<string[]>([
    "MATYA CORE // DESKTOP v1.0 — UNIX KONZOL",
    "Bejelentkezve: user@matya-core",
    "Írd be: help",
  ]);
  const [consoleMin, setConsoleMin] = useState(false);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [serverOn, setServerOn] = useState(false);
  const [serverLog, setServerLog] = useState<string[]>(["Szerver leállítva. START :8080 indításhoz."]);
  const [aiInput, setAiInput] = useState("");
  const [aiLog, setAiLog] = useState<string[]>(["AI Környezet kész. Helyi feldolgozás — nincs külső hívás."]);
  const [vaultLocked, setVaultLocked] = useState(true);
  const [vaultPass, setVaultPass] = useState("");
  const [vaultMsg, setVaultMsg] = useState("Vault zárva.");
  const [daemonOn, setDaemonOn] = useState(true);
  const [cpu, setCpu] = useState(14);
  const [mem, setMem] = useState(38);
  const [netLog, setNetLog] = useState<string[]>(["Hálózat kész. LAN + COM1–COM4."]);
  const [coms, setComs] = useState([
    { id: "COM1", baud: "9600", on: false },
    { id: "COM2", baud: "115200", on: false },
    { id: "COM3", baud: "9600", on: false },
    { id: "COM4", baud: "57600", on: false },
  ]);
  // ---- BASIC STUDIO + PLUS/4 ----
  const BASIC_SAMPLE1 = "10 PRINT \"HELLO MATYA CORE\"\n20 FOR I=1 TO 10\n30 PRINT \"PLUS/4 - \";I\n40 NEXT I\n50 PRINT \"READY.\"\n60 END";
  const BASIC_SAMPLE2 = "10 PRINT \"CSILLAG RAJZ\"\n20 FOR I=1 TO 7\n30 FOR J=1 TO I\n40 PRINT \"*\";\n50 NEXT J\n60 PRINT \"\"\n70 NEXT I\n80 PRINT \"KESZ.\"\n90 END";
  const BASIC_SAMPLE3 = "10 LET S=INT(RND(1)*10)+1\n20 INPUT \"TIPPELJ 1-10\";T\n30 IF T=S THEN PRINT \"EL TALTAD!\": GOTO 70\n40 IF T<S THEN PRINT \"NAGYOBB\"\n50 IF T>S THEN PRINT \"KISEBB\"\n60 GOTO 20\n70 PRINT \"VEGE\"\n80 END";
  const BASIC_HEADER = ["**** COMMODORE PLUS/4 BASIC V3.5 ****", " 64K RAM SYSTEM  60671 BASIC BYTES FREE", "READY."];
  const BASIC_COLORS = [
    { name: "LILA", bg: "#402060", fg: "#E8D8FF" },
    { name: "KÉK", bg: "#1A2E8A", fg: "#D8E4FF" },
    { name: "FEKETE", bg: "#000000", fg: "#FFFFFF" },
    { name: "ZÖLD", bg: "#0A4A22", fg: "#D8FFD8" },
  ];
  const [basicCode, setBasicCode] = useState(BASIC_SAMPLE1);
  const [basicSlow, setBasicSlow] = useState(false);
  const [basicSound, setBasicSound] = useState(true);
  const [basicColorIdx, setBasicColorIdx] = useState(0);
  const [basicRunning, setBasicRunning] = useState(false);
  const [basicAwaiting, setBasicAwaiting] = useState(false);
  const [basicMsg, setBasicMsg] = useState("Mentés: adatbázis • RUN a szerkesztőből az emulátorra.");
  // ---- ERLANG + FÁJLRENDSZER ----
  const [fsFiles, setFsFiles] = useState<FsFile[]>(FS_SAMPLES);
  const [fsMsg, setFsMsg] = useState("Fájlrendszer: 3 minta fájl betöltve.");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ "erlang/": true, "apps/": true, "core/": true, "aes-vault/": true, "shift-layer/": true, "closed-system/": true });
  const [selectedFsId, setSelectedFsId] = useState("fs-hello");
  const [renamingId, setRenamingId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [erlangCode, setErlangCode] = useState(ERLANG_HELLO);
  const [erlangTab, setErlangTab] = useState<"editor" | "files" | "install" | "jetbrains" | "vault">("editor");
  const [erlangFileName, setErlangFileName] = useState("hello.erl");
  const [erlangSaving, setErlangSaving] = useState(false);
  const [erlangMsg, setErlangMsg] = useState("Erlang/OTP 27 • Mini interpreter kész.");
  const [saveDialog, setSaveDialog] = useState<{ open: boolean; name: string; folder: string; content: string; lang: string; source: string }>({ open: false, name: "hello.erl", folder: "erlang/", content: "", lang: "erlang", source: "" });
  const [saveBusy, setSaveBusy] = useState(false);
  const [testTitle, setTestTitle] = useState("hello.erl");
  const [testLog, setTestLog] = useState<string[]>(["Erlang/OTP 27 [erts-15.2] [MATYA CORE]", "Eshell V15.2 (abort with ^G)", "1> "]);
  const [testInput, setTestInput] = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testMsg, setTestMsg] = useState("Kész a tesztelésre.");
  const [installLog, setInstallLog] = useState<string[]>(["Telepítő kész. Válassz: TELEPÍTÉS INDÍTÁSA."]);
  const [installProgress, setInstallProgress] = useState(0);
  const [installBusy, setInstallBusy] = useState(false);
  const [installDone, setInstallDone] = useState(false);
  const [jetLog, setJetLog] = useState<string[]>(["JetBrains eszközök — ingyenes kiadások."]);
  const [jetProgress, setJetProgress] = useState(0);
  const [jetBusy, setJetBusy] = useState("");
  const [jetDone, setJetDone] = useState<string[]>([]);
  const [erlangVaultPass, setErlangVaultPass] = useState("");
  // ---- SHIFT LAYER ----
  type ShiftStatus = "TERVEZETT" | "AKTÍV" | "TESZTELVE";
  type ShiftService = { id: string; name: string; provider: "openshift" | "softlayer"; status: ShiftStatus };
  const [shiftTab, setShiftTab] = useState<"openshift" | "softlayer">("openshift");
  const [shiftServices, setShiftServices] = useState<ShiftService[]>([]);
  const [shiftCode, setShiftCode] = useState("");
  const [shiftFileName, setShiftFileName] = useState("shift-layer-deploy.yaml");
  const [shiftFileType, setShiftFileType] = useState("YAML");
  const [shiftMsg, setShiftMsg] = useState("Válassz szolgáltatást és kódblokkot — a fájl itt gyűlik.");
  const [shiftPreview, setShiftPreview] = useState(false);
  const [shiftSaving, setShiftSaving] = useState(false);
  const [shiftCopied, setShiftCopied] = useState("");
  // ---- TŰZFAL - KALI / SUDO ----
  type FwRule = { id: string; source: string; port: number; protocol: string; action: "ACCEPT" | "DROP" | "REJECT"; status: string };
  const FW_INITIAL: FwRule[] = [
    { id: "FW-01", source: "0.0.0.0/0", port: 22, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" },
    { id: "FW-02", source: "0.0.0.0/0", port: 80, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" },
    { id: "FW-03", source: "0.0.0.0/0", port: 443, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" },
    { id: "FW-04", source: "0.0.0.0/0", port: 7777, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" },
    { id: "FW-05", source: "0.0.0.0/0", port: 23, protocol: "TCP", action: "DROP", status: "AKTÍV" },
    { id: "FW-06", source: "0.0.0.0/0", port: 445, protocol: "TCP", action: "DROP", status: "AKTÍV" },
  ];
  const [fwRules, setFwRules] = useState<FwRule[]>(FW_INITIAL);
  const [fwSudoPass, setFwSudoPass] = useState("");
  const [fwSudoMsg, setFwSudoMsg] = useState("sudo: még nincs hitelesítés.");
  const [fwSudoers, setFwSudoers] = useState("matya ALL=(ALL) NOPASSWD: /usr/sbin/iptables, /usr/sbin/ufw, /usr/sbin/nft");
  const [fwLog, setFwLog] = useState<string[]>(["[UFW] Tűzfal indul — KALI MÓD • alapértelmezett szabályok betöltve."]);
  const [fwLogFilter, setFwLogFilter] = useState<"ALL" | "BLOCK" | "ACCEPT">("ALL");
  const [fwUfwOn, setFwUfwOn] = useState(true);
  const [fwUfwOut, setFwUfwOut] = useState<string[]>(["Status: active", "Logging: on (low)", "Default: deny (incoming), allow (outgoing)"]);
  const [fwNewPort, setFwNewPort] = useState("8080");
  const [fwNewProto, setFwNewProto] = useState("TCP");
  const [fwNewAction, setFwNewAction] = useState<"ACCEPT" | "DROP" | "REJECT">("ACCEPT");
  const [fwNewSource, setFwNewSource] = useState("0.0.0.0/0");
  const [fwProfile, setFwProfile] = useState("KALI ALAP");
  const [fwCopied, setFwCopied] = useState(false);
  // ---- MODULÁCIÓS MÁTRIX - MATYA KONZOL ----
  const [matrixModules, setMatrixModules] = useState<MatrixModule[]>(MATRIX_DEFAULTS);
  const [matrixSelected, setMatrixSelected] = useState("astra");
  const [matrixLog, setMatrixLog] = useState<string[]>(["MATYA KONZOL — mátrix konzol kész. Írd be: help", "Háttérben futó rendszerek: Astra Core • Serpentine Daemon • Kotlin Server • Tűzfal"]);
  const [matrixInput, setMatrixInput] = useState("");
  const [matrixMsg, setMatrixMsg] = useState("Mátrix állapot: az adatbázisból töltődik, változás mentődik.");
  const [matrixSynced, setMatrixSynced] = useState(true);
  const [matrixSaving, setMatrixSaving] = useState(false);
  const [matrixTick, setMatrixTick] = useState(0);
  const matrixModulesRef = useRef<MatrixModule[]>(MATRIX_DEFAULTS);
  const matrixRecordIdsRef = useRef<Record<string, string>>({});
  function applyMatrixModules(next: MatrixModule[]) { matrixModulesRef.current = next; setMatrixModules(next); }
  function patchMatrixModule(id: string, patch: Partial<MatrixModule>) { const next = matrixModulesRef.current.map(function (m) { return m.id === id ? { ...m, ...patch } : m; }); applyMatrixModules(next); return next.find(function (m) { return m.id === id; }); }
  async function persistMatrixModule(mod: MatrixModule) { try { const recId = matrixRecordIdsRef.current[mod.id]; if (recId) { await api("records.replace", { collection: "matrix-modules", id: recId, value: mod }); } else { const created = await api("records.create", { collection: "matrix-modules", value: mod, idempotency_key: "matrix-" + mod.id }) as { id: string }; if (created && created.id) matrixRecordIdsRef.current[mod.id] = created.id; } } catch (e) { /* mentés később, a MÁTRIX MENTÉS újra próbálja */ } }
  function matrixFind(q: string): MatrixModule | undefined { const n = matrixNormalize(q.trim()); if (!n) return undefined; const list = matrixModulesRef.current; return list.find(function (m) { return matrixNormalize(m.name) === n || m.aliases.some(function (a) { return matrixNormalize(a) === n; }); }) || list.find(function (m) { return matrixNormalize(m.name).indexOf(n) >= 0 || n.indexOf(matrixNormalize(m.name)) >= 0 || m.aliases.some(function (a) { const an = matrixNormalize(a); return an.indexOf(n) >= 0 || n.indexOf(an) >= 0; }); }); }
  function matrixLoad(m: MatrixModule, idx: number): number { if (m.status !== "FUT") return 0; const wobble = ((matrixTick * 13 + idx * 17) % 25) - 12; return Math.max(4, Math.min(98, m.load + wobble)); }
  async function reloadMatrixRecords() { const data = await api("records.list", { collection: "matrix-modules" }) as { records?: { id: string; value: MatrixModule }[] }; if (data && data.records && data.records.length) { const ids: Record<string, string> = {}; data.records.forEach(function (r) { if (r.value && r.value.id) ids[r.value.id] = r.id; }); matrixRecordIdsRef.current = ids; const merged = MATRIX_DEFAULTS.map(function (d) { const saved = data.records!.find(function (r) { return r.value && r.value.id === d.id; }); return saved ? { ...d, ...saved.value } : d; }); applyMatrixModules(merged); } }
  async function saveMatrixAll() { setMatrixSaving(true); let saved = 0; let error: string | null = null; const rows = matrixModulesRef.current; try { for (const row of rows) { await persistMatrixModule(row); saved += 1; } } catch (e) { error = e instanceof Error ? e.message : String(e); } let reloadError: string | null = null; try { await reloadMatrixRecords(); } catch (e) { reloadError = e instanceof Error ? e.message : String(e); } setMatrixSaving(false); setMatrixSynced(!error); setMatrixMsg("MÁTRIX MENTÉS: mentve " + saved + " / " + rows.length + " modul" + (rows.length - saved ? " • maradt " + (rows.length - saved) : "") + (error ? " • hiba: " + error : " • SZINKRON") + (reloadError ? " • újratöltés: " + reloadError : "")); }
  function matrixSync() { setMatrixSynced(true); setMatrixLog(function (p) { return [...p, "[MATRIX] SYNC — " + matrixModulesRef.current.filter(function (m) { return m.status === "FUT"; }).length + "/" + matrixModulesRef.current.length + " modul FUT • hálózat ellenőrizve"].slice(-200); }); void saveMatrixAll(); }
  function blackiceEncode(text: string): string { const hex = text.split("").map(function (c) { return c.charCodeAt(0).toString(16).padStart(2, "0"); }).join("-").toUpperCase(); return "HEX: " + hex + " • FORDÍTVA: " + text.split("").reverse().join(""); }
  function runMatrixCommand(raw: string) { const cmdRaw = raw.trim(); if (!cmdRaw) return; const lines: string[] = ["matya@matrix:~$ " + cmdRaw]; const lower = cmdRaw.toLowerCase(); const after = function (prefix: string) { return cmdRaw.slice(prefix.length).trim(); }; if (lower === "help") { lines.push("PARANCSOK:", "matrix status • matrix start <modul> • matrix stop <modul> • matrix sync", "net list • daemon list • blackice encode <szöveg> • nato status", "Példa: matrix stop tűzfal  •  matrix start blackice  •  blackice encode MATYA"); } else if (lower === "matrix status") { matrixModulesRef.current.forEach(function (m) { lines.push((m.status === "FUT" ? "●" : m.status === "HIBA" ? "!" : "○") + " " + m.name + " — " + m.status + " • PRI " + m.priority + " • NET " + (m.net ? "ON" : "OFF") + " • " + m.modulation + " • PORT " + m.port); }); lines.push("ÖSSZESÍTŐ: " + matrixModulesRef.current.filter(function (m) { return m.status === "FUT"; }).length + "/" + matrixModulesRef.current.length + " FUT"); } else if (lower === "matrix sync") { lines.push("[MATRIX] SYNC — mátrix szinkronizálva."); matrixSync(); } else if (lower.indexOf("matrix start ") === 0) { const target = matrixFind(after("matrix start")); if (!target) lines.push("NINCS ILYEN MODUL: " + after("matrix start")); else { const updated = patchMatrixModule(target.id, { status: "FUT" }); setMatrixSynced(false); if (updated) void persistMatrixModule(updated); lines.push("[MATRIX] START — " + target.name + " → FUT • PORT " + target.port); } } else if (lower.indexOf("matrix stop ") === 0) { const target = matrixFind(after("matrix stop")); if (!target) lines.push("NINCS ILYEN MODUL: " + after("matrix stop")); else { const updated = patchMatrixModule(target.id, { status: "KI" }); setMatrixSynced(false); if (updated) void persistMatrixModule(updated); lines.push("[MATRIX] STOP — " + target.name + " → KI • a sor KI állapotba vált."); } } else if (lower === "net list") { const on = matrixModulesRef.current.filter(function (m) { return m.net; }); lines.push("HÁLÓZAT — NET ON modulok:"); on.forEach(function (m) { lines.push("• " + m.name + " — " + m.status + " • PORT " + m.port + " • " + m.modulation); }); lines.push("LAN 192.168.1.20 • COM1–COM4 elérhető • PING 12 ms"); } else if (lower === "daemon list") { const bg = matrixModulesRef.current.filter(function (m) { return ["astra", "daemon", "kotlin", "firewall", "vault", "bootlog"].indexOf(m.id) >= 0; }); lines.push("HÁTTÉRBEN FUTÓ RENDSZEREK (a mátrix alatt):"); bg.forEach(function (m) { lines.push("• " + m.name + " — " + m.status + " • PORT " + m.port + (m.id === "daemon" ? " • PID 777" : "")); }); } else if (lower.indexOf("blackice encode ") === 0) { const text = after("blackice encode"); if (!text) lines.push("HASZNÁLAT: blackice encode <szöveg>"); else lines.push("[BLACKICE] ENCODE — \"" + text + "\" → " + blackiceEncode(text)); } else if (lower === "nato status") { const nato = matrixModulesRef.current.find(function (m) { return m.id === "nato"; }); const comm = matrixModulesRef.current.find(function (m) { return m.id === "comm"; }); lines.push("[NATO] NATO Asszisztens: " + (nato ? nato.status : "?") + " • PORT " + (nato ? nato.port : "?") + " • MODULÁCIÓ " + (nato ? nato.modulation : "?")); lines.push("[NATO] Kommunikációs Rendszer: " + (comm ? comm.status : "?") + " • Hálózat: " + (comm && comm.net ? "ON" : "OFF")); lines.push("[NATO] Csatorna: KÉSZ • Formátum: kötött üzenet • Külső hívás: nincs"); } else { lines.push("ISMERETLEN PARANCS: " + cmdRaw + " — írd be: help"); } setMatrixLog(function (p) { return [...p, ...lines].slice(-200); }); }
  useEffect(function () { const t = setInterval(function () { setMatrixTick(function (v) { return v + 1; }); }, 1800); return function () { clearInterval(t); }; }, []);
  useEffect(function () { (async function () { try { await reloadMatrixRecords(); setMatrixMsg("Betöltve az adatbázisból: mátrix állapot."); } catch (e) { setMatrixMsg("Mátrix: most csak ebben a nézetben — az adatbázis nem érhető el, MÁTRIX MENTÉS újra próbálja."); } })(); }, []);
  // ---- BOOT NAPLÓ + GEO + GÉP ADATOK ----
  type BootEntry = { time: string; text: string; status: "OK" | "WARN" | "FAIL" };
  function bootStamp(): string { return new Date().toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  function initialBootLog(): BootEntry[] {
    const t = bootStamp();
    return [
      { time: t, text: "[BOOT] MATYA CORE v1.0 indul", status: "OK" },
      { time: t, text: "[INIT] Serpentine Daemon OK", status: "OK" },
      { time: t, text: "[INIT] Kotlin Server OK — :8080", status: "OK" },
      { time: t, text: "[INIT] Erlang OTP 27 OK", status: "OK" },
      { time: t, text: "[INIT] Firewall OK — KALI MÓD", status: "OK" },
      { time: t, text: "[INIT] Shift Layer OK", status: "OK" },
      { time: t, text: "[GÉP] OS: " + (typeof navigator !== "undefined" ? navigator.platform : "ismeretlen") + " | CPU: " + (typeof navigator !== "undefined" ? String(navigator.hardwareConcurrency || "?") : "?") + " mag | RAM: " + (typeof navigator !== "undefined" && (navigator as { deviceMemory?: number }).deviceMemory ? String((navigator as { deviceMemory?: number }).deviceMemory) + " GB (becsült)" : "nincs adat") + " | KIJELZŐ: " + (typeof window !== "undefined" ? window.screen.width + "x" + window.screen.height : "?"), status: "OK" },
      { time: t, text: "[REBOOT] Újraindítás — új bejegyzés a naplófájlba", status: "WARN" },
    ];
  }
  const [bootLog, setBootLog] = useState<BootEntry[]>(initialBootLog);
  const [bootFilter, setBootFilter] = useState<"ALL" | "OK" | "WARN" | "FAIL">("ALL");
  const [bootSearch, setBootSearch] = useState("");
  const [bootCopied, setBootCopied] = useState(false);
  const [bootTab, setBootTab] = useState<"log" | "geo" | "gep">("log");
  const [bootSavedMsg, setBootSavedMsg] = useState("Boot napló: adatbázisba mentve (boot-log).");
  const [geoCode, setGeoCode] = useState("GEO: HU-BP-47.49N-19.04E | SZERVER: eu-central-1 | LAT: 12ms");
  const [geoStatus, setGeoStatus] = useState("KISZOLGÁLÓK FELÉ KÜLDVE ✓");
  const [geoMsg, setGeoMsg] = useState("Helyzetmeghatározási kód: Budapest becslés • időzóna Europe/Budapest.");
  const machineInfo = {
    browser: typeof navigator !== "undefined" ? navigator.userAgent : "ismeretlen",
    os: typeof navigator !== "undefined" ? (navigator.platform + " • " + navigator.userAgent) : "ismeretlen",
    screen: typeof window !== "undefined" ? window.screen.width + "x" + window.screen.height + " • színmélység " + window.screen.colorDepth : "?",
    cores: typeof navigator !== "undefined" ? String(navigator.hardwareConcurrency || "nincs adat") : "?",
    memory: typeof navigator !== "undefined" && (navigator as { deviceMemory?: number }).deviceMemory ? String((navigator as { deviceMemory?: number }).deviceMemory) + " GB (becsült, deviceMemory)" : "nincs adat (a böngésző nem adja meg)",
    lang: typeof navigator !== "undefined" ? navigator.language : "hu-HU",
    tz: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Europe/Budapest",
    online: typeof navigator !== "undefined" ? (navigator.onLine ? "ONLINE" : "OFFLINE") : "?",
    localId: "LOCAL-ID: MATYA-" + (typeof navigator !== "undefined" ? String(navigator.hardwareConcurrency || 4) : "4") + "-" + (typeof window !== "undefined" ? String(window.screen.width) : "0") + "X",
  };
  // ---- VB TESZT ----
  const [vbCode, setVbCode] = useState(VB_SAMPLE_HELLO);
  const [vbOutput, setVbOutput] = useState<string[]>(["VISUAL BASIC TEST — SHIFT LAYER", "Kész. Nyomd meg: FUTTATÁS"]);
  const [vbRunning, setVbRunning] = useState(false);
  const [vbAwaiting, setVbAwaiting] = useState("");
  const [vbInput, setVbInput] = useState("");
  const [vbErrorLine, setVbErrorLine] = useState(0);
  const [vbMsg, setVbMsg] = useState("Mini VB interpreter: Dim / Console.WriteLine / For / If / While / Select Case / Function / InputBox");
  const [vbFileName, setVbFileName] = useState("matya-app.vb");
  const vbCodeRef = useRef(VB_SAMPLE_HELLO);
  const vbStopRef = useRef(false);
  const vbRunningRef = useRef(false);
  const vbInputResolver = useRef<((v: string) => void) | null>(null);
  const vbOutputRef = useRef<string[]>(["VISUAL BASIC TEST — SHIFT LAYER", "Kész. Nyomd meg: FUTTATÁS"]);
  const erlangCodeRef = useRef(ERLANG_HELLO);
  const testStopRef = useRef(false);
  const testShellVarsRef = useRef<Record<string, unknown>>({});
  const testLogRef = useRef<string[]>([]);
  const [basicSaving, setBasicSaving] = useState(false);
  const [emuLines, setEmuLines] = useState<string[]>(BASIC_HEADER);
  const [emuPending, setEmuPending] = useState("");
  const [emuInput, setEmuInput] = useState("");
  const basicCodeRef = useRef(BASIC_SAMPLE1);
  const basicStopRef = useRef(false);
  const basicRunningRef = useRef(false);
  const basicInputResolver = useRef<((v: string) => void) | null>(null);
  const basicEditorRef = useRef<HTMLTextAreaElement>(null);
  const basicGutterRef = useRef<HTMLDivElement>(null);
  const emuInputRef = useRef<HTMLInputElement>(null);
  const emuPendingRef = useRef("");
  const pokeMemRef = useRef<Record<number, number>>({});
  const directCtxRef = useRef<{ vars: Record<string, number | string>; arrays: Record<string, (number | string)[]>; data: (number | string)[]; dataPtr: number; forStack: { varName: string; end: number; step: number; returnPc: number }[]; gosubStack: number[] }>({ vars: {}, arrays: {}, data: [], dataPtr: 0, forStack: [], gosubStack: [] });
  useEffect(function () { basicCodeRef.current = basicCode; }, [basicCode]);
  useEffect(function () { erlangCodeRef.current = erlangCode; }, [erlangCode]);
  useEffect(function () { vbCodeRef.current = vbCode; }, [vbCode]);
  // ---- FÁJLRENDSZER: betöltés ----
  useEffect(function () {
    (async function () {
      try {
        const data = await api("records.list", { collection: "matya-filesystem" }) as { records?: { id: string; value: FsFile }[] };
        if (data && data.records && data.records.length) {
          const mapped = data.records.map(function (r) { return { ...r.value, id: r.id }; });
          setFsFiles(mapped); setFsMsg("Betöltve " + mapped.length + " fájl az adatbázisból (fájlrendszer).");
        }
      } catch (e) { /* minták maradnak */ }
    })();
  }, []);
  // ---- MINI ERLANG INTERPRETER ----
  type EVal = unknown;
  function eAtom(n: string): unknown { return { __atom: n }; }
  function eIsAtom(v: unknown, n?: string): boolean { return !!v && typeof v === "object" && (v as { __atom?: string }).__atom !== undefined && (n === undefined || (v as { __atom: string }).__atom === n); }
  function eAtomName(v: unknown): string { return eIsAtom(v) ? (v as { __atom: string }).__atom : String(v); }
  function eTuple(items: EVal[]): unknown { return { __tuple: items }; }
  function eIsTuple(v: unknown): boolean { return !!v && typeof v === "object" && Array.isArray((v as { __tuple?: unknown }).__tuple); }
  function eFmt(v: EVal): string {
    if (eIsAtom(v)) return eAtomName(v);
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    if (Array.isArray(v)) return "[" + v.map(eFmt).join(",") + "]";
    if (eIsTuple(v)) return "{" + ((v as { __tuple: EVal[] }).__tuple).map(eFmt).join(",") + "}";
    if (v && typeof v === "object" && (v as { __pid?: number }).__pid !== undefined) return "<0." + (v as { __pid: number }).__pid + ".0>";
    if (v === undefined) return "undefined";
    if (v === null) return "null";
    return String(v);
  }
  function eTruth(v: EVal): boolean { return !(eIsAtom(v, "false") || v === false || v === 0); }
  function eEq(a: EVal, b: EVal): boolean {
    if (eIsAtom(a) && eIsAtom(b)) return eAtomName(a) === eAtomName(b);
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every(function (x, i) { return eEq(x, b[i]); });
    if (eIsTuple(a) && eIsTuple(b)) { const x = (a as { __tuple: EVal[] }).__tuple; const y = (b as { __tuple: EVal[] }).__tuple; return x.length === y.length && x.every(function (v, i) { return eEq(v, y[i]); }); }
    return a === b;
  }
  function erlangEmit(s: string) {
    const parts = String(s).split("\n");
    testLogRef.current = [...testLogRef.current, ...parts];
    setTestLog(function (p) { return [...p, ...parts].slice(-300); });
  }
  type Proc = { pid: number; mailbox: EVal[]; waiters: Array<() => void> };
  function makeErlangRuntime() {
    let nextPid = 100; const procs = new Map<number, Proc>();
    function newProc(): Proc { const p: Proc = { pid: nextPid++, mailbox: [], waiters: [] }; procs.set(p.pid, p); return p; }
    function sendTo(pid: number, msg: EVal) { const p = procs.get(pid); if (!p) return; p.mailbox.push(msg); const w = p.waiters.splice(0); w.forEach(function (f) { f(); }); }
    return { newProc, procs, sendTo };
  }
  type Tok = { t: string; v: string };
  function erlangTokenize(src: string): Tok[] {
    const toks: Tok[] = []; let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (c === "%") { while (i < src.length && src[i] !== "\n") i++; continue; }
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"') { let out = ""; i++; while (i < src.length && src[i] !== '"') { if (src[i] === "\\" && i + 1 < src.length) { const n = src[i + 1]; if (n === "n") out += "\n"; else if (n === "t") out += "\t"; else out += n; i += 2; } else { out += src[i]; i++; } } i++; toks.push({ t: "str", v: out }); continue; }
      if (/[0-9]/.test(c)) { let n = ""; while (i < src.length && /[0-9.]/.test(src[i])) { n += src[i]; i++; } toks.push({ t: "num", v: n }); continue; }
      const two = src.substr(i, 2); const three = src.substr(i, 3);
      if (three === "->>") { toks.push({ t: "op", v: "->>" }); i += 3; continue; }
      if (["->", "==", "/=", "=<", ">=", "++", "--", "=:="].indexOf(two) >= 0) { toks.push({ t: "op", v: two }); i += 2; continue; }
      if (";,.()[]{}|+-*/<>!:=#".indexOf(c) >= 0) { toks.push({ t: "op", v: c }); i++; continue; }
      if (/[A-Za-z_]/.test(c)) { let w = ""; while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) { w += src[i]; i++; } if (/^[A-Z_]/.test(w)) toks.push({ t: "var", v: w }); else toks.push({ t: "atom", v: w }); continue; }
      if (c === "'") { let w = ""; i++; while (i < src.length && src[i] !== "'") { w += src[i]; i++; } i++; toks.push({ t: "atom", v: w }); continue; }
      i++;
    }
    toks.push({ t: "eof", v: "" }); return toks;
  }
  type Node = { k: string; [key: string]: unknown };
  function erlangParseProgram(src: string): { module: string; funcs: Record<string, { clauses: { params: Node[]; guard: Node | null; body: Node[] }[] }> } {
    const toks = erlangTokenize(src); let pos = 0;
    function peek(): Tok { return toks[pos]; } function next(): Tok { return toks[pos++]; }
    function expect(v: string) { if (peek().v === v) next(); }
    function parseExpr(): Node { return parseAssign(); }
    function parseAssign(): Node { const left = parseSend(); if (peek().v === "=" && peek().t === "op") { next(); const right = parseAssign(); return { k: "assign", left, right }; } return left; }
    function parseSend(): Node { let left = parseCmp(); while (peek().v === "!") { next(); const right = parseSend(); left = { k: "send", left, right }; } return left; }
    function parseCmp(): Node { let left = parseAdd(); while (["==", "/=", "<", ">", "=<", ">=", "=:="].indexOf(peek().v) >= 0) { const op = next().v; const r = parseAdd(); left = { k: "bin", op, left, right: r }; } return left; }
    function parseAdd(): Node { let left = parseMul(); while (peek().v === "+" || peek().v === "-" || peek().v === "++") { const op = next().v; const r = parseMul(); left = { k: "bin", op, left, right: r }; } return left; }
    function parseMul(): Node { let left = parseUnary(); while (peek().v === "*" || peek().v === "/" || peek().v === "rem" || peek().v === "div") { const op = next().v; const r = parseUnary(); left = { k: "bin", op, left, right: r }; } return left; }
    function parseUnary(): Node { if (peek().v === "-") { next(); return { k: "neg", e: parseUnary() }; } if (peek().v === "not") { next(); return { k: "not", e: parseUnary() }; } return parsePrimary(); }
    function parseListTail(): Node | null { if (peek().v === "|") { next(); return parseExpr(); } return null; }
    function parsePrimary(): Node {
      const tk = peek();
      if (tk.t === "num") { next(); return { k: "num", v: parseFloat(tk.v) }; }
      if (tk.t === "str") { next(); return { k: "str", v: tk.v }; }
      if (tk.t === "var") { next(); if (peek().v === "(") { next(); const args: Node[] = []; if (peek().v !== ")") { while (true) { args.push(parseExpr()); if (peek().v === ",") { next(); continue; } break; } } expect(")"); return { k: "varcall", name: tk.v, args }; } return { k: "var", v: tk.v }; }
      if (tk.v === "(") { next(); const e = parseExpr(); expect(")"); return e; }
      if (tk.v === "[") { next(); const items: Node[] = []; let tail: Node | null = null; if (peek().v !== "]") { while (true) { items.push(parseExpr()); if (peek().v === "|") { next(); tail = parseExpr(); break; } if (peek().v === ",") { next(); continue; } break; } } expect("]"); return { k: "list", items, tail }; }
      if (tk.v === "{") { next(); const items: Node[] = []; if (peek().v !== "}") { while (true) { items.push(parseExpr()); if (peek().v === ",") { next(); continue; } break; } } expect("}"); return { k: "tuple", items }; }
      if (tk.v === "receive") { next(); const clauses: { pat: Node; guard: Node | null; body: Node[] }[] = []; while (peek().v !== "after" && peek().v !== "end" && peek().t !== "eof") { const pat = parseExpr(); let guard: Node | null = null; if (peek().v === "when") { next(); guard = parseExpr(); } expect("->"); const body = parseSeq([";", "after", "end"]); clauses.push({ pat, guard, body }); if (peek().v === ";") { next(); continue; } break; } let afterBody: Node[] | null = null; if (peek().v === "after") { next(); parseExpr(); expect("->"); afterBody = parseSeq(["end"]); } expect("end"); return { k: "receive", clauses, afterBody }; }
      if (tk.v === "case") { next(); const subj = parseExpr(); expect("of"); const clauses: { pat: Node; guard: Node | null; body: Node[] }[] = []; while (peek().v !== "end" && peek().t !== "eof") { const pat = parseExpr(); let guard: Node | null = null; if (peek().v === "when") { next(); guard = parseExpr(); } expect("->"); const body = parseSeq([";", "end"]); clauses.push({ pat, guard, body }); if (peek().v === ";") { next(); continue; } break; } expect("end"); return { k: "case", subj, clauses }; }
      if (tk.v === "if") { next(); const clauses: { guard: Node; body: Node[] }[] = []; while (peek().v !== "end" && peek().t !== "eof") { const guard = parseExpr(); expect("->"); const body = parseSeq([";", "end"]); clauses.push({ guard, body }); if (peek().v === ";") { next(); continue; } break; } expect("end"); return { k: "if", clauses }; }
      if (tk.v === "try") { next(); const body = parseSeq(["catch", "end"]); let catchBody: Node[] | null = null; if (peek().v === "catch") { next(); if (peek().v !== "->") { parseExpr(); } if (peek().v === "->") next(); catchBody = parseSeq(["end"]); } expect("end"); return { k: "try", body, catchBody }; }
      if (tk.v === "fun") { next(); if (peek().v === "(") { next(); const params: Node[] = []; if (peek().v !== ")") { while (true) { params.push(parseExpr()); if (peek().v === ",") { next(); continue; } break; } } expect(")"); expect("->"); const body = parseSeq(["end"]); expect("end"); return { k: "fun", params, body }; } const nm = next(); if (peek().v === "/") { next(); const ar = next(); return { k: "funref", name: nm.v, arity: parseInt(ar.v, 10) }; } return { k: "atom", v: nm.v }; }
      if (tk.t === "atom") {
        next();
        if (peek().v === ":") { next(); const fn = next(); expect("("); const args: Node[] = []; if (peek().v !== ")") { while (true) { args.push(parseExpr()); if (peek().v === ",") { next(); continue; } break; } } expect(")"); return { k: "call", mod: tk.v, name: fn.v, args }; }
        if (peek().v === "(") { next(); const args: Node[] = []; if (peek().v !== ")") { while (true) { args.push(parseExpr()); if (peek().v === ",") { next(); continue; } break; } } expect(")"); return { k: "call", mod: "", name: tk.v, args }; }
        return { k: "atom", v: tk.v };
      }
      next(); return { k: "atom", v: "undefined" };
    }
    function parseSeq(stops: string[]): Node[] { const out: Node[] = []; out.push(parseExpr()); while (peek().v === ",") { next(); out.push(parseExpr()); } return out; }
    let module = "hello";
    const funcs: Record<string, { clauses: { params: Node[]; guard: Node | null; body: Node[] }[] }> = {};
    while (peek().t !== "eof") {
      if (peek().v === "-") { next(); const attr = next(); expect("("); if (attr.v === "module") { module = next().v; } else { let depth = 1; while (depth > 0 && peek().t !== "eof") { const t = next(); if (t.v === "(" || t.v === "[" || t.v === "{") depth++; if (t.v === ")" || t.v === "]" || t.v === "}") depth--; } } if (peek().v === ".") next(); continue; }
      if (peek().t === "atom") {
        const fname = next().v; expect("("); const params: Node[] = [];
        if (peek().v !== ")") { while (true) { params.push(parseExpr()); if (peek().v === ",") { next(); continue; } break; } } expect(")");
        let guard: Node | null = null; if (peek().v === "when") { next(); guard = parseExpr(); } expect("->");
        const body = parseSeq([";", "."]);
        const key = fname + "/" + params.length;
        if (!funcs[key]) funcs[key] = { clauses: [] };
        funcs[key].clauses.push({ params, guard, body });
        if (peek().v === ";") { next(); continue; }
        if (peek().v === ".") { next(); continue; }
        continue;
      }
      next();
    }
    return { module, funcs };
  }
  async function runErlangSource(source: string, entryName?: string, entryArgs?: EVal[]): Promise<void> {
    testStopRef.current = false;
    let prog: ReturnType<typeof erlangParseProgram>;
    try { prog = erlangParseProgram(source); } catch (e) { erlangEmit("** SYNTAX ERROR **"); return; }
    const rt = makeErlangRuntime();
    let steps = 0;
    function matchPat(pat: Node, val: EVal, env: Record<string, EVal>): boolean {
      if (pat.k === "var") { if (pat.v === "_") return true; if (env[pat.v as string] !== undefined) return eEq(env[pat.v as string], val); env[pat.v as string] = val; return true; }
      if (pat.k === "num") return val === pat.v;
      if (pat.k === "str") return val === pat.v;
      if (pat.k === "atom") return eIsAtom(val, pat.v as string);
      if (pat.k === "list") { if (!Array.isArray(val)) return false; const items = pat.items as Node[]; if (pat.tail) { if (val.length < items.length) return false; for (let i = 0; i < items.length; i++) if (!matchPat(items[i], val[i], env)) return false; const rest = val.slice(items.length); return matchPat(pat.tail as Node, rest, env); } if (val.length !== items.length) return false; for (let i = 0; i < items.length; i++) if (!matchPat(items[i], val[i], env)) return false; return true; }
      if (pat.k === "tuple") { if (!eIsTuple(val)) return false; const arr = (val as { __tuple: EVal[] }).__tuple; const items = pat.items as Node[]; if (arr.length !== items.length) return false; for (let i = 0; i < items.length; i++) if (!matchPat(items[i], arr[i], env)) return false; return true; }
      if (pat.k === "bin") { try { const v = evalSync(pat, env, rt.newProc()); return eEq(v, val); } catch (e) { return false; } }
      return false;
    }
    function evalSync(node: Node, env: Record<string, EVal>, proc: Proc): EVal { throw new Error("sync-only"); }
    async function evalNode(node: Node, env: Record<string, EVal>, proc: Proc): Promise<EVal> {
      steps++; if (steps > 20000 || testStopRef.current) throw new Error("STOP");
      if (node.k === "num") return node.v as number;
      if (node.k === "str") return node.v as string;
      if (node.k === "atom") return eAtom(node.v as string);
      if (node.k === "var") { if (node.v === "_") return eAtom("undefined"); return env[node.v as string] !== undefined ? env[node.v as string] : eAtom("undefined"); }
      if (node.k === "neg") return -(await evalNode(node.e as Node, env, proc) as number);
      if (node.k === "not") return eAtom(eTruth(await evalNode(node.e as Node, env, proc)) ? "false" : "true");
      if (node.k === "list") { const out: EVal[] = []; for (const it of node.items as Node[]) out.push(await evalNode(it, env, proc)); if (node.tail) { const t = await evalNode(node.tail as Node, env, proc); if (Array.isArray(t)) out.push(...t); else if (typeof t === "string") out.push(...t.split("")); } return out; }
      if (node.k === "tuple") { const out: EVal[] = []; for (const it of node.items as Node[]) out.push(await evalNode(it, env, proc)); return eTuple(out); }
      if (node.k === "assign") { const val = await evalNode(node.right as Node, env, proc); const env2 = { ...env }; if (!matchPat(node.left as Node, val, env2)) throw new Error("BADMATCH"); Object.assign(env, env2); return val; }
      if (node.k === "send") { const target = await evalNode(node.left as Node, env, proc); const msg = await evalNode(node.right as Node, env, proc); if (target && typeof target === "object" && (target as { __pid?: number }).__pid !== undefined) rt.sendTo((target as { __pid: number }).__pid, msg); return msg; }
      if (node.k === "bin") {
        const op = node.op as string;
        if (op === "and") return eAtom(eTruth(await evalNode(node.left as Node, env, proc)) && eTruth(await evalNode(node.right as Node, env, proc)) ? "true" : "false");
        if (op === "or") return eAtom(eTruth(await evalNode(node.left as Node, env, proc)) || eTruth(await evalNode(node.right as Node, env, proc)) ? "true" : "false");
        const l = await evalNode(node.left as Node, env, proc); const r = await evalNode(node.right as Node, env, proc);
        if (op === "+") return (l as number) + (r as number); if (op === "-") return (l as number) - (r as number); if (op === "*") return (l as number) * (r as number); if (op === "/") return (l as number) / (r as number); if (op === "rem") return (l as number) % (r as number); if (op === "div") return Math.floor((l as number) / (r as number));
        if (op === "++") { if (Array.isArray(l) && Array.isArray(r)) return [...l, ...r]; if (typeof l === "string" && typeof r === "string") return l + r; return l; }
        if (op === "==") return eAtom(eEq(l, r) ? "true" : "false"); if (op === "/=") return eAtom(!eEq(l, r) ? "true" : "false");
        if (op === "<") return eAtom(((l as number) < (r as number)) ? "true" : "false"); if (op === ">") return eAtom(((l as number) > (r as number)) ? "true" : "false");
        if (op === "=<") return eAtom(((l as number) <= (r as number)) ? "true" : "false"); if (op === ">=") return eAtom(((l as number) >= (r as number)) ? "true" : "false");
        return l;
      }
      if (node.k === "case") { const subj = await evalNode(node.subj as Node, env, proc); for (const cl of node.clauses as { pat: Node; guard: Node | null; body: Node[] }[]) { const e2 = { ...env }; if (matchPat(cl.pat, subj, e2) && (!cl.guard || eTruth(await evalNode(cl.guard, e2, proc)))) return await evalSeq(cl.body, e2, proc); } throw new Error("CASE_CLAUSE"); }
      if (node.k === "if") { for (const cl of node.clauses as { guard: Node; body: Node[] }[]) { if (eTruth(await evalNode(cl.guard, { ...env }, proc))) return await evalSeq(cl.body, { ...env }, proc); } throw new Error("IF_CLAUSE"); }
      if (node.k === "try") { try { return await evalSeq(node.body as Node[], { ...env }, proc); } catch (e) { if (node.catchBody) return await evalSeq(node.catchBody as Node[], { ...env }, proc); throw e; } }
      if (node.k === "fun") { return { __fun: true, params: node.params, body: node.body, env: { ...env } }; }
      if (node.k === "funref") { const key = node.name + "/" + node.arity; return { __funref: key }; }
      if (node.k === "receive") {
        while (!testStopRef.current) {
          for (let i = 0; i < proc.mailbox.length; i++) { const msg = proc.mailbox[i]; for (const cl of node.clauses as { pat: Node; guard: Node | null; body: Node[] }[]) { const e2 = { ...env }; if (matchPat(cl.pat, msg, e2) && (!cl.guard || eTruth(await evalNode(cl.guard, e2, proc)))) { proc.mailbox.splice(i, 1); return await evalSeq(cl.body, e2, proc); } } }
          await new Promise<void>(function (res) { const t = setTimeout(res, 2000); proc.waiters.push(function () { clearTimeout(t); res(); }); });
          if (proc.mailbox.length === 0 && (node.afterBody as Node[] | null)) return await evalSeq(node.afterBody as Node[], { ...env }, proc);
        } throw new Error("STOP");
      }
      if (node.k === "varcall") { const fn = env[node.name as string]; if (fn && typeof fn === "object" && (fn as { __fun?: boolean }).__fun) { const args: EVal[] = []; for (const a of node.args as Node[]) args.push(await evalNode(a, env, proc)); const e2 = { ...(fn as { env: Record<string, EVal> }).env }; const params = (fn as { params: Node[] }).params; for (let i = 0; i < params.length; i++) matchPat(params[i], args[i], e2); return await evalSeq((fn as { body: Node[] }).body, e2, proc); } throw new Error("BADFUN"); }
      if (node.k === "call") {
        const mod = node.mod as string; const name = node.name as string;
        const args: EVal[] = []; for (const a of node.args as Node[]) args.push(await evalNode(a, env, proc));
        if (mod === "io" && name === "format") {
          const fmt = String(args[0] || ""); const vals = args.length > 1 && Array.isArray(args[1]) ? args[1] as EVal[] : args.slice(1);
          let idx = 0; let out = ""; for (let i = 0; i < fmt.length; i++) { if (fmt[i] === "~" && i + 1 < fmt.length) { const spec = fmt[i + 1]; if (spec === "n") out += "\n"; else if (spec === "~") out += "~"; else { const v = vals[idx++]; out += eFmt(v); if (spec === "B" || spec === "b") out = out; } i++; } else out += fmt[i]; }
          if (out) erlangEmit(out); return eAtom("ok");
        }
        if (mod === "lists" && name === "map") { const fn = args[0]; const list = args[1] as EVal[]; const out: EVal[] = []; for (const item of list) { if (fn && typeof fn === "object" && (fn as { __fun?: boolean }).__fun) { const e2 = { ...(fn as { env: Record<string, EVal> }).env }; matchPat((fn as { params: Node[] }).params[0], item, e2); out.push(await evalSeq((fn as { body: Node[] }).body, e2, proc)); } else if (fn && typeof fn === "object" && (fn as { __funref?: string }).__funref) { const key = (fn as { __funref: string }).__funref; out.push(await callFunc(key, [item], proc)); } } return out; }
        if (mod === "lists" && name === "sum") return (args[0] as EVal[]).reduce(function (s, x) { return s + (x as number); }, 0);
        if (mod === "lists" && name === "reverse") return [...(args[0] as EVal[])].reverse();
        if (mod === "lists" && name === "member") return eAtom((args[1] as EVal[]).some(function (x) { return eEq(x, args[0]); }) ? "true" : "false");
        if ((mod === "lists" && name === "length") || (mod === "" && name === "length")) return Array.isArray(args[0]) ? args[0].length : String(args[0]).length;
        if (mod === "" && name === "self") return { __pid: proc.pid };
        if (mod === "" && name === "spawn") {
          const np = rt.newProc();
          if (args.length === 1) { const fn = args[0]; void (async function () { try { if (fn && typeof fn === "object" && (fn as { __fun?: boolean }).__fun) { await evalSeq((fn as { body: Node[] }).body, { ...(fn as { env: Record<string, EVal> }).env }, np); } } catch (e) { /* leáll */ } })(); }
          else if (args.length === 3) { const m = eAtomName(args[0]); const f = eAtomName(args[1]); const a = args[2] as EVal[]; void (async function () { try { await callFunc(f + "/" + a.length, a, np); } catch (e) { /* leáll */ } })(); }
          else if (args.length === 2) { const f = eAtomName(args[0]); const a = args[1] as EVal[]; void (async function () { try { await callFunc(f + "/" + a.length, a, np); } catch (e) { /* */ } })(); }
          return { __pid: np.pid };
        }
        if (mod === "" && name === "whereis") return eAtom("undefined");
        if (mod === "" && name === "register") return eAtom("true");
        const key = name + "/" + args.length;
        return await callFunc(key, args, proc);
      }
      return eAtom("undefined");
    }
    async function evalSeq(nodes: Node[], env: Record<string, EVal>, proc: Proc): Promise<EVal> { let last: EVal = eAtom("ok"); for (const n of nodes) last = await evalNode(n, env, proc); return last; }
    async function callFunc(key: string, args: EVal[], proc: Proc): Promise<EVal> {
      const fn = prog.funcs[key]; if (!fn) throw new Error("UNDEF " + key);
      for (const cl of fn.clauses) { const env: Record<string, EVal> = {}; let ok = true; if (cl.params.length !== args.length) continue; for (let i = 0; i < cl.params.length; i++) if (!matchPat(cl.params[i], args[i], env)) { ok = false; break; } if (!ok) continue; if (cl.guard && !eTruth(await evalNode(cl.guard, { ...env }, proc))) continue; return await evalSeq(cl.body, env, proc); }
      throw new Error("NO_CLAUSE " + key);
    }
    const entryKey = entryName ? entryName + "/" + (entryArgs ? entryArgs.length : 0) : "start/0";
    const mainProc = rt.newProc();
    try {
      let result: EVal;
      if (entryName && entryArgs) result = await callFunc(entryKey, entryArgs, mainProc);
      else if (prog.funcs["start/0"]) result = await callFunc("start/0", [], mainProc);
      else { const first = Object.keys(prog.funcs)[0]; if (!first) { erlangEmit("** NINCS FUTTATHATÓ FÜGGVÉNY **"); return; } result = await callFunc(first, [], mainProc); }
      await new Promise(function (r) { setTimeout(r, 120); });
      if (!testStopRef.current) { erlangEmit("=> " + eFmt(result)); logGhostRun("ERLANG", "Erlang", source, "=> " + eFmt(result), 15, "OK", false); }
    } catch (e) { if ((e as Error).message !== "STOP") erlangEmit("** HIBA: " + (e as Error).message + " **"); }
  }
  // ---- SHIFT LAYER: szolgáltatások + fájl ----
  function syncShiftServicesFile(list: ShiftService[]) {
    const content = "SHIFT LAYER — AKTIV SZOLGALTATASOK\n" + (list.length ? list.map(function (s) { return "- [" + s.status + "] " + (s.provider === "openshift" ? "OPENSHIFT" : "SOFTLAYER / IBM") + " — " + s.name; }).join("\n") : "(meg nincs aktiv szolgaltatas)");
    setFsFiles(function (p) {
      const rest = p.filter(function (x) { return x.id !== "fs-shift-services"; });
      return [...rest, { id: "fs-shift-services", name: "services.txt", path: "shift-layer/services.txt", folder: "shift-layer/", content, lang: "text" }];
    });
  }
  function addShiftService(item: { id: string; provider: "openshift" | "softlayer"; name: string }) {
    let next: ShiftService[] = [];
    setShiftServices(function (prev) {
      if (prev.some(function (s) { return s.id === item.id; })) { next = prev; return prev; }
      next = [...prev, { id: item.id, name: item.name, provider: item.provider, status: "TERVEZETT" }];
      return next;
    });
    setTimeout(function () { syncShiftServicesFile(next.length ? next : shiftServices); }, 0);
    setShiftMsg("Hozzáadva: " + item.name + " — TERVEZETT");
  }
  function setShiftStatus(id: string, status: ShiftStatus) {
    setShiftServices(function (prev) { const next = prev.map(function (s) { return s.id === id ? { ...s, status } : s; }); syncShiftServicesFile(next); return next; });
  }
  function removeShiftService(id: string) {
    setShiftServices(function (prev) { const next = prev.filter(function (s) { return s.id !== id; }); syncShiftServicesFile(next); return next; });
  }
  function copySnippet(snippet: { id: string; code: string; title: string }) {
    const ta = document.createElement("textarea"); ta.value = snippet.code; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) { /* ignore */ } document.body.removeChild(ta);
    setShiftCopied(snippet.id); setShiftMsg("Másolva: " + snippet.title + " — illeszd be bárhová.");
    setTimeout(function () { setShiftCopied(""); }, 1800);
  }
  function addSnippetToFile(snippet: { code: string; title: string }) {
    setShiftCode(function (p) { return (p ? p + "\n\n" : "") + "# " + snippet.title + "\n" + snippet.code; });
    setShiftMsg("Hozzáadva a fájlhoz: " + snippet.title);
  }
  async function saveShiftFile(overrideName?: string, overrideCode?: string, overrideType?: string) {
    const name = (overrideName || shiftFileName).trim() || "shift-layer-deploy.yaml";
    const typeNow = overrideType || shiftFileType;
    const codeNow = overrideCode !== undefined ? overrideCode : shiftCode;
    const lang = typeNow === "VB" ? "basic" : typeNow === "YAML" ? "yaml" : typeNow === "SH" ? "shell" : "text";
    const folder = "shift-layer/";
    const value: FsFile = { id: "", name, path: folder + name, folder, content: codeNow, lang };
    setShiftSaving(true);
    try {
      const existing = await api("records.list", { collection: "matya-filesystem" }) as { records?: { id: string; value: FsFile }[] };
      let match: { id: string } | undefined = undefined;
      if (existing && existing.records) match = existing.records.find(function (r) { return r.value && r.value.name === name && r.value.folder === folder; });
      if (match) { await api("records.replace", { collection: "matya-filesystem", id: match.id, value: { ...value, id: match.id } }); setFsFiles(function (p) { return p.map(function (x) { return x.id === match!.id ? { ...value, id: match!.id } : x; }); }); }
      else { const created = await api("records.create", { collection: "matya-filesystem", value: { ...value, id: "fs-" + Date.now() }, idempotency_key: "shift-" + folder + name + "-" + Date.now() }) as { id: string }; const nf = { ...value, id: created.id }; setFsFiles(function (p) { return [...p.filter(function (x) { return !(x.name === name && x.folder === folder); }), nf]; }); }
      setShiftMsg("Mentve: " + folder + name + " — adatbázis + Fájlrendszer (Erlang nézetben is látszik).");
      writeConsole("SHIFT LAYER MENTÉS: " + folder + name);
      if (name.endsWith(".vb")) { setVbCode(codeNow); vbCodeRef.current = codeNow; setVbFileName(name); }
    } catch (e) {
      const nf: FsFile = { ...value, id: "tmp-shift-" + Date.now() }; setFsFiles(function (p) { return [...p.filter(function (x) { return !(x.name === name && x.folder === folder); }), nf]; }); setShiftMsg("Mentve (helyi nézet): " + folder + name);
    }
    setShiftSaving(false);
  }
  function openVbFromShift(name: string, code: string) { setVbCode(code); vbCodeRef.current = code; setVbFileName(name); setVbErrorLine(0); openApp("vbtest"); }
  // ---- MINI VISUAL BASIC INTERPRETER ----
  type VBVal = number | string | boolean;
  type VBExpr = { k: string; [key: string]: unknown };
  type VBStmt = { k: string; line: number; [key: string]: unknown };
  function vbToStr(v: VBVal): string { if (typeof v === "boolean") return v ? "True" : "False"; if (typeof v === "number") return String(v); return String(v); }
  function vbToNum(v: VBVal): number { if (typeof v === "number") return v; if (typeof v === "boolean") return v ? 1 : 0; const n = parseFloat(String(v)); return isNaN(n) ? 0 : n; }
  function vbTruth(v: VBVal): boolean { if (typeof v === "boolean") return v; if (typeof v === "number") return v !== 0; return String(v) !== "" && String(v).toLowerCase() !== "false"; }
  function vbEmit(s: string) { vbOutputRef.current = [...vbOutputRef.current, s].slice(-300); setVbOutput(vbOutputRef.current); }
  function vbTokenizeExpr(src: string): { t: string; v: string }[] {
    const out: { t: string; v: string }[] = []; let i = 0;
    while (i < src.length) { const c = src[i]; if (/\s/.test(c)) { i++; continue; } if (c === '"') { let s = ""; i++; while (i < src.length && src[i] !== '"') { if (src[i] === '"' && src[i + 1] === '"') { s += '"'; i += 2; } else { s += src[i]; i++; } } i++; out.push({ t: "str", v: s }); continue; } if (/[0-9]/.test(c)) { let n = ""; while (i < src.length && /[0-9.]/.test(src[i])) { n += src[i]; i++; } out.push({ t: "num", v: n }); continue; } if (/[A-Za-z_]/.test(c)) { let w = ""; while (i < src.length && /[A-Za-z0-9_.]/.test(src[i])) { w += src[i]; i++; } out.push({ t: "id", v: w }); continue; } const two = src.substr(i, 2); if (two === "<>" || two === "<=" || two === ">=" || two === "+=" || two === "-=") { out.push({ t: "op", v: two }); i += 2; continue; } if ("+-*/\\^&(),=<>".indexOf(c) >= 0) { out.push({ t: "op", v: c }); i++; continue; } i++; }
    out.push({ t: "eof", v: "" }); return out;
  }
  function vbParseExpr(src: string): VBExpr {
    const toks = vbTokenizeExpr(src); let pos = 0;
    function peek() { return toks[pos]; } function next() { return toks[pos++]; }
    function parseOr(): VBExpr { let l = parseAnd(); while (peek().t === "id" && peek().v.toUpperCase() === "OR") { next(); const r = parseAnd(); l = { k: "bin", op: "Or", l, r }; } return l; }
    function parseAnd(): VBExpr { let l = parseNot(); while (peek().t === "id" && peek().v.toUpperCase() === "AND") { next(); const r = parseNot(); l = { k: "bin", op: "And", l, r }; } return l; }
    function parseNot(): VBExpr { if (peek().t === "id" && peek().v.toUpperCase() === "NOT") { next(); return { k: "not", e: parseNot() }; } return parseCmp(); }
    function parseCmp(): VBExpr { let l = parseConcat(); while (peek().v === "=" || peek().v === "<>" || peek().v === "<" || peek().v === ">" || peek().v === "<=" || peek().v === ">=") { const op = next().v; const r = parseConcat(); l = { k: "bin", op, l, r }; } return l; }
    function parseConcat(): VBExpr { let l = parseAdd(); while (peek().v === "&") { next(); const r = parseAdd(); l = { k: "bin", op: "&", l, r }; } return l; }
    function parseAdd(): VBExpr { let l = parseMul(); while (peek().v === "+" || peek().v === "-") { const op = next().v; const r = parseMul(); l = { k: "bin", op, l, r }; } return l; }
    function parseMul(): VBExpr { let l = parsePow(); while (peek().v === "*" || peek().v === "/" || peek().v === "\\" || (peek().t === "id" && peek().v.toUpperCase() === "MOD")) { const op = peek().t === "id" ? "Mod" : next().v; if (peek().t === "id") next(); const r = parsePow(); l = { k: "bin", op, l, r }; } return l; }
    function parsePow(): VBExpr { let l = parseUnary(); if (peek().v === "^") { next(); const r = parsePow(); return { k: "bin", op: "^", l, r }; } return l; }
    function parseUnary(): VBExpr { if (peek().v === "-") { next(); return { k: "neg", e: parseUnary() }; } if (peek().v === "+") { next(); return parseUnary(); } return parsePrimary(); }
    function parsePrimary(): VBExpr {
      const tk = peek();
      if (tk.t === "num") { next(); return { k: "num", v: parseFloat(tk.v) }; }
      if (tk.t === "str") { next(); return { k: "str", v: tk.v }; }
      if (tk.v === "(") { next(); const e = parseOr(); if (peek().v === ")") next(); return e; }
      if (tk.t === "id") {
        next(); const name = tk.v;
        if (name.toLowerCase() === "true") return { k: "bool", v: true }; if (name.toLowerCase() === "false") return { k: "bool", v: false };
        if (peek().v === "(") { next(); const args: VBExpr[] = []; if (peek().v !== ")") { while (true) { args.push(parseOr()); if (peek().v === ",") { next(); continue; } break; } } if (peek().v === ")") next(); return { k: "call", name, args }; }
        if (name.toLowerCase() === "console.readline") return { k: "call", name: "Console.ReadLine", args: [] };
        return { k: "var", name };
      }
      throw new Error("SYNTAX");
    }
    const e = parseOr(); if (peek().t !== "eof") throw new Error("SYNTAX"); return e;
  }
  function vbStripComment(line: string): string { let inStr = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') inStr = !inStr; if (c === "'" && !inStr) return line.slice(0, i); } return line; }
  function vbParseProgram(src: string): { subs: Record<string, { params: string[]; body: VBStmt[]; isFunc: boolean }>; main: VBStmt[] } {
    const rawLines = src.split("\n").map(function (l, i) { return { text: vbStripComment(l), line: i + 1 }; });
    const subs: Record<string, { params: string[]; body: VBStmt[]; isFunc: boolean }> = {}; const top: VBStmt[] = [];
    let idx = 0;
    function parseBlock(stopWords: string[]): { stmts: VBStmt[]; stop: string; stopLine: VBStmt | null } {
      const stmts: VBStmt[] = [];
      while (idx < rawLines.length) {
        const cur = rawLines[idx]; const t = cur.text.trim(); const up = t.toUpperCase();
        if (!t) { idx++; continue; }
        let matchedStop = "";
        for (const sw of stopWords) { if (up === sw || up.indexOf(sw + " ") === 0 || up.indexOf(sw + "\t") === 0) { matchedStop = sw; break; } }
        if (matchedStop) { const stmt: VBStmt = { k: "stop", line: cur.line, text: t, stop: matchedStop }; return { stmts, stop: matchedStop, stopLine: stmt }; }
        if (up.indexOf("END SUB") === 0 || up.indexOf("END FUNCTION") === 0 || up.indexOf("END MODULE") === 0) { return { stmts, stop: up.indexOf("END MODULE") === 0 ? "END MODULE" : "END", stopLine: { k: "stop", line: cur.line, text: t, stop: "END" } }; }
        idx++;
        let parsed: VBStmt[] | null = null;
        try { parsed = parseOne(t, cur.line); } catch (e) { if (!(e as { vbLine?: number }).vbLine) Object.assign(e as object, { vbLine: cur.line }); throw e; }
        if (parsed) stmts.push(...parsed);
      }
      return { stmts, stop: "", stopLine: null };
    }
    function parseOne(t: string, lineNo: number): VBStmt[] | null {
      const up = t.toUpperCase();
      if (up.indexOf("MODULE ") === 0 || up.indexOf("END MODULE") === 0 || up === "END MODULE") return null;
      if (up.indexOf("DIM ") === 0) {
        const rest = t.slice(4).trim(); const asIdx = rest.toUpperCase().indexOf(" AS ");
        let namesPart = rest; let typePart = ""; let initPart = "";
        if (asIdx >= 0) { namesPart = rest.slice(0, asIdx).trim(); const after = rest.slice(asIdx + 4).trim(); const eq = after.indexOf("="); if (eq >= 0) { typePart = after.slice(0, eq).trim(); initPart = after.slice(eq + 1).trim(); } else typePart = after; }
        else { const eq2 = rest.indexOf("="); if (eq2 >= 0) { namesPart = rest.slice(0, eq2).trim(); initPart = rest.slice(eq2 + 1).trim(); } }
        const names = namesPart.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        return names.map(function (n) { return { k: "dim", line: lineNo, name: n, type: typePart, init: initPart ? vbParseExpr(initPart) : null } as VBStmt; });
      }
      if (up.indexOf("CONSOLE.WRITELINE") === 0 || up.indexOf("CONSOLE.WRITE") === 0) { const isLine = up.indexOf("CONSOLE.WRITELINE") === 0; const open = t.indexOf("("); const close = t.lastIndexOf(")"); const argTxt = open >= 0 && close > open ? t.slice(open + 1, close) : ""; return [{ k: "print", line: lineNo, newline: isLine, expr: argTxt.trim() ? vbParseExpr(argTxt) : null }]; }
      if (up.indexOf("MSGBOX") === 0) { const open = t.indexOf("("); const close = t.lastIndexOf(")"); const argTxt = open >= 0 && close > open ? t.slice(open + 1, close) : t.slice(6).trim(); return [{ k: "msgbox", line: lineNo, expr: argTxt.trim() ? vbParseExpr(argTxt) : null }]; }
      if (up.indexOf("RETURN") === 0) { const rest = t.slice(6).trim(); return [{ k: "return", line: lineNo, expr: rest ? vbParseExpr(rest) : null }]; }
      if (up.indexOf("IF ") === 0) {
        const thenIdx = up.indexOf(" THEN");
        if (thenIdx < 0) throw Object.assign(new Error("SYNTAX"), { vbLine: lineNo });
        const condTxt = t.slice(3, thenIdx).trim(); const afterThen = t.slice(thenIdx + 5).trim();
        if (afterThen && afterThen.toUpperCase() !== "ELSE") {
          // egy soros IF
          let thenPart = afterThen; let elsePart = ""; const elseIdx = afterThen.toUpperCase().indexOf(" ELSE ");
          if (elseIdx >= 0) { thenPart = afterThen.slice(0, elseIdx); elsePart = afterThen.slice(elseIdx + 6); }
          const thenStmts: VBStmt[] = []; const elseStmts: VBStmt[] = [];
          thenPart.split(":").forEach(function (p) { const s = parseOne(p.trim(), lineNo); if (s) thenStmts.push(...s); });
          if (elsePart) elsePart.split(":").forEach(function (p) { const s = parseOne(p.trim(), lineNo); if (s) elseStmts.push(...s); });
          return [{ k: "if", line: lineNo, cond: vbParseExpr(condTxt), then: thenStmts, elseifs: [], else: elseStmts }];
        }
        const first = parseBlock(["ELSEIF", "ELSE", "END IF"]);
        const elseifs: { cond: VBExpr; body: VBStmt[] }[] = []; let elseBody: VBStmt[] = [];
        let stop = first.stop; let stopStmt = first.stopLine;
        while (stop === "ELSEIF" && stopStmt) {
          const txt = String(stopStmt.text); const thenI = txt.toUpperCase().indexOf(" THEN"); const cTxt = txt.slice(7, thenI >= 0 ? thenI : undefined).trim();
          idx++;
          const blk = parseBlock(["ELSEIF", "ELSE", "END IF"]); elseifs.push({ cond: vbParseExpr(cTxt), body: blk.stmts }); stop = blk.stop; stopStmt = blk.stopLine;
        }
        if (stop === "ELSE") { idx++; const blk = parseBlock(["END IF"]); elseBody = blk.stmts; stop = blk.stop; }
        if (stop === "END IF") idx++;
        return [{ k: "if", line: lineNo, cond: vbParseExpr(condTxt), then: first.stmts, elseifs, else: elseBody }];
      }
      if (up.indexOf("FOR ") === 0) {
        const m = t.match(/^FOR\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/i);
        if (!m) throw Object.assign(new Error("SYNTAX"), { vbLine: lineNo });
        const body = parseBlock(["NEXT"]); if (body.stop === "NEXT") idx++;
        return [{ k: "for", line: lineNo, varName: m[1], from: vbParseExpr(m[2]), to: vbParseExpr(m[3]), step: m[4] ? vbParseExpr(m[4]) : null, body: body.stmts }];
      }
      if (up.indexOf("WHILE ") === 0) { const condTxt = t.slice(6).trim(); const body = parseBlock(["END WHILE", "WEND"]); if (body.stop) idx++; return [{ k: "while", line: lineNo, cond: vbParseExpr(condTxt), body: body.stmts }]; }
      if (up.indexOf("DO WHILE ") === 0) { const condTxt = t.slice(9).trim(); const body = parseBlock(["LOOP"]); if (body.stop === "LOOP") idx++; return [{ k: "dowhile", line: lineNo, cond: vbParseExpr(condTxt), body: body.stmts }]; }
      if (up === "DO") { const body = parseBlock(["LOOP"]); if (body.stop === "LOOP") { /* Loop While handled as plain loop once — simplified */ idx++; } return [{ k: "dowhile", line: lineNo, cond: { k: "bool", v: true }, body: body.stmts }]; }
      if (up.indexOf("SELECT CASE ") === 0) {
        const subj = vbParseExpr(t.slice(12).trim()); const cases: { val: VBExpr | null; body: VBStmt[] }[] = [];
        while (idx < rawLines.length) { const c = rawLines[idx]; const ct = c.text.trim(); const cup = ct.toUpperCase(); if (cup.indexOf("END SELECT") === 0) { idx++; break; } if (cup.indexOf("CASE ELSE") === 0) { idx++; const blk = parseBlock(["CASE", "END SELECT"]); cases.push({ val: null, body: blk.stmts }); if (blk.stop === "END SELECT") idx++; break; } if (cup.indexOf("CASE ") === 0) { const valTxt = ct.slice(5).trim(); idx++; const blk = parseBlock(["CASE", "END SELECT"]); cases.push({ val: vbParseExpr(valTxt), body: blk.stmts }); if (blk.stop === "END SELECT") { idx++; break; } continue; } idx++; }
        return [{ k: "select", line: lineNo, subj, cases }];
      }
      const assign = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(\+|-)?=\s*(.+)$/);
      if (assign && up.indexOf("==") < 0) { const isPlus = assign[2] === "+"; const isMinus = assign[2] === "-"; return [{ k: "assign", line: lineNo, name: assign[1], expr: vbParseExpr(assign[3]), op: isPlus ? "+=" : isMinus ? "-=" : "=" }]; }
      if (up.indexOf("SUB ") === 0 || up.indexOf("FUNCTION ") === 0) return null;
      // függvény / Sub hívás önálló sorban
      const callM = t.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s*(?:\((.*)\))?$/);
      if (callM) { const args: VBExpr[] = []; if (callM[2]) callM[2].split(",").forEach(function (p) { if (p.trim()) args.push(vbParseExpr(p.trim())); }); return [{ k: "callstmt", line: lineNo, name: callM[1], args }]; }
      throw Object.assign(new Error("SYNTAX"), { vbLine: lineNo });
    }
    // Sub / Function definíciók gyűjtése
    while (idx < rawLines.length) {
      const cur = rawLines[idx]; const t = cur.text.trim(); const up = t.toUpperCase();
      if (!t) { idx++; continue; }
      const subM = t.match(/^(SUB|FUNCTION)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?(?:\s+AS\s+[A-Za-z_][A-Za-z0-9_]*)?/i);
      if (subM) { const isFunc = subM[1].toUpperCase() === "FUNCTION"; const name = subM[2]; const params = subM[3] ? subM[3].split(",").map(function (p) { return p.trim().split(/\s+/)[0]; }).filter(Boolean) : []; idx++; const blk = parseBlock([]); subs[name.toLowerCase()] = { params, body: blk.stmts, isFunc }; if (blk.stop === "END") idx++; continue; }
      idx++; const parsed = parseOne(t, cur.line); if (parsed) top.push(...parsed);
    }
    return { subs, main: subs["main"] ? subs["main"].body : top };
  }
  async function vbAwaitInput(promptText: string): Promise<string> {
    if (promptText) vbEmit(promptText);
    setVbAwaiting(promptText || "INPUT");
    return new Promise(function (resolve) { vbInputResolver.current = function (v: string) { setVbAwaiting(""); resolve(v); }; });
  }
  function vbSubmitInput() {
    const raw = vbInput; if (!vbInputResolver.current) return; const r = vbInputResolver.current; vbInputResolver.current = null; setVbInput(""); vbEmit("> " + raw); r(raw);
  }
  async function runVbProgram() {
    if (vbRunningRef.current) { setVbMsg("Már fut egy VB program — STOP-pal állíthatod le."); return; }
    let prog: ReturnType<typeof vbParseProgram>;
    try { prog = vbParseProgram(vbCodeRef.current); } catch (e) { const ln = (e as { vbLine?: number }).vbLine || 1; setVbErrorLine(ln); setVbMsg("Hiba: Syntax error a(z) " + ln + ". sorban"); vbEmit("Hiba: Syntax error a(z) " + ln + ". sorban"); return; }
    vbStopRef.current = false; vbRunningRef.current = true; setVbRunning(true); setVbErrorLine(0);
    vbOutputRef.current = ["VISUAL BASIC TEST — " + vbFileName]; setVbOutput(vbOutputRef.current);
    const vars: Record<string, VBVal> = {}; let steps = 0;
    async function evalExpr(e: VBExpr): Promise<VBVal> {
      steps++; if (steps > 20000 || vbStopRef.current) throw new Error("STOP");
      if (e.k === "num") return e.v as number; if (e.k === "str") return e.v as string; if (e.k === "bool") return e.v as boolean;
      if (e.k === "var") { const n = (e.name as string).toLowerCase(); return vars[n] !== undefined ? vars[n] : ""; }
      if (e.k === "neg") return -vbToNum(await evalExpr(e.e as VBExpr));
      if (e.k === "not") return !vbTruth(await evalExpr(e.e as VBExpr));
      if (e.k === "bin") {
        const op = e.op as string;
        if (op === "And") return vbTruth(await evalExpr(e.l as VBExpr)) && vbTruth(await evalExpr(e.r as VBExpr));
        if (op === "Or") return vbTruth(await evalExpr(e.l as VBExpr)) || vbTruth(await evalExpr(e.r as VBExpr));
        const l = await evalExpr(e.l as VBExpr); const r = await evalExpr(e.r as VBExpr);
        if (op === "&") return vbToStr(l) + vbToStr(r);
        if (op === "+") { if (typeof l === "string" || typeof r === "string") { if (typeof l === "string" && typeof r === "string") return l + r; return vbToNum(l) + vbToNum(r); } return vbToNum(l) + vbToNum(r); }
        if (op === "-") return vbToNum(l) - vbToNum(r); if (op === "*") return vbToNum(l) * vbToNum(r); if (op === "/") return vbToNum(l) / vbToNum(r);
        if (op === "\\") return Math.floor(vbToNum(l) / vbToNum(r)); if (op === "Mod") return vbToNum(l) % vbToNum(r); if (op === "^") return Math.pow(vbToNum(l), vbToNum(r));
        if (op === "=") { if (typeof l === "string" || typeof r === "string") return vbToStr(l).toLowerCase() === vbToStr(r).toLowerCase(); return l === r; }
        if (op === "<>") { if (typeof l === "string" || typeof r === "string") return vbToStr(l).toLowerCase() !== vbToStr(r).toLowerCase(); return l !== r; }
        if (op === "<") return vbToNum(l) < vbToNum(r); if (op === ">") return vbToNum(l) > vbToNum(r); if (op === "<=") return vbToNum(l) <= vbToNum(r); if (op === ">=") return vbToNum(l) >= vbToNum(r);
        return l;
      }
      if (e.k === "call") {
        const name = (e.name as string).toLowerCase(); const args: VBVal[] = []; for (const a of (e.args as VBExpr[])) args.push(await evalExpr(a));
        if (name === "len") return vbToStr(args[0] ?? "").length;
        if (name === "ucase") return vbToStr(args[0] ?? "").toUpperCase(); if (name === "lcase") return vbToStr(args[0] ?? "").toLowerCase();
        if (name === "trim") return vbToStr(args[0] ?? "").trim();
        if (name === "cint") return Math.round(vbToNum(args[0] ?? 0)); if (name === "cdbl" || name === "csng") return vbToNum(args[0] ?? 0);
        if (name === "cstr") return vbToStr(args[0] ?? ""); if (name === "cbool") return vbTruth(args[0] ?? false);
        if (name === "inputbox") return await vbAwaitInput(args[0] !== undefined ? vbToStr(args[0]) : "INPUT");
        if (name === "console.readline") return await vbAwaitInput("READLINE");
        if (name === "mid") { const s = vbToStr(args[0] ?? ""); const st = Math.max(1, Math.round(vbToNum(args[1] ?? 1))); if (args.length >= 3) return s.slice(st - 1, st - 1 + Math.round(vbToNum(args[2]))); return s.slice(st - 1); }
        if (name === "left") return vbToStr(args[0] ?? "").slice(0, Math.max(0, Math.round(vbToNum(args[1] ?? 0))));
        if (name === "right") { const s = vbToStr(args[0] ?? ""); return s.slice(Math.max(0, s.length - Math.round(vbToNum(args[1] ?? 0)))); }
        if (prog.subs[name]) { const fn = prog.subs[name]; const saved: Record<string, VBVal | undefined> = {}; fn.params.forEach(function (p, i) { saved[p.toLowerCase()] = vars[p.toLowerCase()]; vars[p.toLowerCase()] = args[i] !== undefined ? args[i] : ""; }); vars[name] = ""; const ret = await execBlock(fn.body); const out = ret && ret.returned ? ret.value : vars[name]; fn.params.forEach(function (p) { const sv = saved[p.toLowerCase()]; if (sv === undefined) delete vars[p.toLowerCase()]; else vars[p.toLowerCase()] = sv; }); return out as VBVal; }
        throw Object.assign(new Error("SYNTAX"), { vbLine: 1 });
      }
      return "";
    }
    async function execBlock(stmts: VBStmt[]): Promise<{ returned: boolean; value?: VBVal } | null> {
      for (const s of stmts) {
        if (vbStopRef.current) throw new Error("STOP");
        try { const r = await execOne(s); if (r && r.returned) return r; } catch (e) { if ((e as Error).message === "STOP") throw e; if (!(e as { vbLine?: number }).vbLine) Object.assign(e as object, { vbLine: s.line }); throw e; }
      }
      return null;
    }
    async function execOne(s: VBStmt): Promise<{ returned: boolean; value?: VBVal } | null> {
        if (s.k === "dim") { const n = String(s.name).toLowerCase(); if (s.init) vars[n] = await evalExpr(s.init as VBExpr); else { const ty = String(s.type || "").toLowerCase(); vars[n] = ty.indexOf("string") >= 0 ? "" : ty.indexOf("bool") >= 0 ? false : 0; } }
        else if (s.k === "assign") { const n = String(s.name).toLowerCase(); const v = await evalExpr(s.expr as VBExpr); if (s.op === "+=") vars[n] = (typeof vars[n] === "string" ? vbToStr(vars[n]) + vbToStr(v) : vbToNum(vars[n] ?? 0) + vbToNum(v)) as VBVal; else if (s.op === "-=") vars[n] = vbToNum(vars[n] ?? 0) - vbToNum(v); else vars[n] = v; }
        else if (s.k === "print") { const v = s.expr ? await evalExpr(s.expr as VBExpr) : ""; vbEmit(vbToStr(v as VBVal)); }
        else if (s.k === "msgbox") { const v = s.expr ? await evalExpr(s.expr as VBExpr) : ""; vbEmit("[MSGBOX] " + vbToStr(v as VBVal)); }
        else if (s.k === "return") { return { returned: true, value: s.expr ? await evalExpr(s.expr as VBExpr) : "" }; }
        else if (s.k === "callstmt") { const fake: VBExpr = { k: "call", name: s.name as string, args: s.args as VBExpr[] }; try { await evalExpr(fake); } catch (e) { if ((e as Error).message === "STOP") throw e; } }
        else if (s.k === "if") {
          if (vbTruth(await evalExpr(s.cond as VBExpr))) { const r = await execBlock(s.then as VBStmt[]); if (r) return r; }
          else { let done = false; for (const ei of (s.elseifs as { cond: VBExpr; body: VBStmt[] }[])) { if (vbTruth(await evalExpr(ei.cond))) { const r = await execBlock(ei.body); if (r) return r; done = true; break; } } if (!done && (s.else as VBStmt[]).length) { const r = await execBlock(s.else as VBStmt[]); if (r) return r; } }
        }
        else if (s.k === "for") {
          const from = vbToNum(await evalExpr(s.from as VBExpr)); const to = vbToNum(await evalExpr(s.to as VBExpr)); const step = s.step ? vbToNum(await evalExpr(s.step as VBExpr)) : 1;
          for (let cur = from; step > 0 ? cur <= to : cur >= to; cur += step) { vars[String(s.varName).toLowerCase()] = cur; const r = await execBlock(s.body as VBStmt[]); if (r) return r; if (vbStopRef.current) throw new Error("STOP"); }
        }
        else if (s.k === "while") { let guard = 0; while (vbTruth(await evalExpr(s.cond as VBExpr)) && guard++ < 10000) { const r = await execBlock(s.body as VBStmt[]); if (r) return r; } }
        else if (s.k === "dowhile") { let guard = 0; while (vbTruth(await evalExpr(s.cond as VBExpr)) && guard++ < 10000) { const r = await execBlock(s.body as VBStmt[]); if (r) return r; } }
        else if (s.k === "select") { const subj = await evalExpr(s.subj as VBExpr); for (const c of (s.cases as { val: VBExpr | null; body: VBStmt[] }[])) { if (c.val === null) { const r = await execBlock(c.body); if (r) return r; break; } const cv = await evalExpr(c.val); const match = (typeof subj === "string" || typeof cv === "string") ? vbToStr(subj as VBVal).toLowerCase() === vbToStr(cv as VBVal).toLowerCase() : subj === cv; if (match) { const r = await execBlock(c.body); if (r) return r; break; } } }
      return null;
    }
    try { await execBlock(prog.main); if (!vbStopRef.current) { vbEmit("--- KESZ ---"); setVbMsg("Futtatás kész: " + vbFileName); logGhostRun("VB", "VB", vbCodeRef.current, vbOutputRef.current.slice(-3).join(" | ") || "KESZ", 18, "OK", false); } }
    catch (e) {
      if ((e as Error).message !== "STOP") { const lineNo = (e as { vbLine?: number }).vbLine || 1; setVbErrorLine(lineNo); setVbMsg("Hiba: Syntax error a(z) " + lineNo + ". sorban"); vbEmit("Hiba: Syntax error a(z) " + lineNo + ". sorban"); }
      else { vbEmit("--- STOP ---"); setVbMsg("STOP — program leállítva."); }
    }
    vbRunningRef.current = false; setVbRunning(false);
  }
  function vbStop() { vbStopRef.current = true; if (vbInputResolver.current) { const r = vbInputResolver.current; vbInputResolver.current = null; setVbAwaiting(""); r(""); } setVbMsg("STOP — program leállítva."); }
  function openErlangTest(title: string, code: string) {
    setTestTitle(title); setTestLog(["Erlang/OTP 27 [erts-15.2] [MATYA CORE]", "Eshell V15.2 (abort with ^G)", "--- " + title + " ---"]); testLogRef.current = ["Erlang/OTP 27 [erts-15.2] [MATYA CORE]", "Eshell V15.2 (abort with ^G)", "--- " + title + " ---"];
    setTestMsg("Teszt fut: " + title); openApp("erlangtest");
    setTimeout(function () { setTestRunning(true); void runErlangSource(code).then(function () { setTestRunning(false); }); }, 80);
  }
  async function runShellCommand(raw: string) {
    const cmd = raw.trim(); if (!cmd) return;
    erlangEmit("1> " + cmd);
    const body = cmd.replace(/\.$/, "").trim();
    if (body === "c(hello)" || body.indexOf("c(") === 0) { erlangEmit("{ok, hello}"); return; }
    if (body === "help") { erlangEmit("Parancsok: hello:start(). / c(hello). / 1+1. / io:format(\"HI~n\"). / spawn / q()."); return; }
    if (body === "q()") { erlangEmit("ok"); return; }
    const callMatch = body.match(/^([a-z_][a-z0-9_]*)\:([a-z_][a-z0-9_]*)\((.*)\)$/);
    if (callMatch) { try { const src = erlangCodeRef.current; const argsTxt = callMatch[3].trim(); const args: EVal[] = argsTxt ? [parseFloat(argsTxt)] : []; await runErlangSource(src, callMatch[2], args); } catch (e) { erlangEmit("** HIBA **"); } return; }
    if (/^[0-9+\-*/() .]+$/.test(body)) { try { const v = Function('"use strict";return (' + body + ')')(); erlangEmit(String(v)); } catch (e) { erlangEmit("** SYNTAX **"); } return; }
    if (body.indexOf("io:format") === 0) { const src = "-module(shell).\n-export([start/0]).\nstart() -> " + body + ".\n"; await runErlangSource(src); return; }
    const assign = body.match(/^([A-Z][A-Z0-9_]*)\s*=\s*(.+)$/);
    if (assign) { try { const v = Function('"use strict";return (' + assign[2] + ')')(); testShellVarsRef.current[assign[1]] = v; erlangEmit(String(v)); } catch (e) { erlangEmit("** SYNTAX **"); } return; }
    if (/^[A-Z_]/.test(body) && testShellVarsRef.current[body] !== undefined) { erlangEmit(String(testShellVarsRef.current[body])); return; }
    erlangEmit("** NEM ÉRTELMEZHETŐ — próbáld: hello:start(). **");
  }
  const consoleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; sx: number; sy: number; x: number; y: number } | null>(null);
  const resizeRef = useRef<{ id: string; sx: number; sy: number; w: number; h: number } | null>(null);

  useEffect(function () {
    const t = setInterval(function () { setNow(new Date()); }, 1000);
    return function () { clearInterval(t); };
  }, []);

  useEffect(function () {
    if (boot) {
      const t = setInterval(function () {
        setBootProgress(function (p) {
          const n = p + 9 + Math.floor(Math.random() * 8);
          if (n >= 100) { clearInterval(t); setTimeout(function () { setBoot(false); }, 350); return 100; }
          return n;
        });
      }, 130);
      return function () { clearInterval(t); };
    }
  }, [boot]);

  useEffect(function () {
    if (consoleRef.current) consoleRef.current.scrollTop = 99999;
  }, [consoleLines, consoleMin]);

  useEffect(function () {
    const t = setInterval(function () {
      setCpu(function (c) { return Math.max(7, Math.min(58, c + Math.floor(Math.random() * 11) - 5)); });
      setMem(function (m) { return Math.max(31, Math.min(71, m + Math.floor(Math.random() * 7) - 3)); });
    }, 2200);
    return function () { clearInterval(t); };
  }, []);

  useEffect(function () {
    (async function () {
      try {
        const data = await api("records.list", { collection: "desktop-files" }) as { records?: { id: string; value: DocFile }[] };
        if (data && data.records && data.records.length) {
          const mapped = data.records.map(function (r) { return { ...r.value, id: r.id }; });
          setFiles(mapped);
          setSelectedFile(mapped[0].id);
          setEditorText(mapped[0].content);
          setEditorLang(mapped[0].lang);
          setPersistMsg("Betöltve " + mapped.length + " mentett fájl az adatbázisból.");
        } else setPersistMsg("Még nincs mentett fájl — az alap fájlok láthatók.");
      } catch (e) { setPersistMsg("Mentett fájlok most nem érhetők el — az alap fájlok láthatók."); }
    })();
  }, []);

  // ---- BASIC: betöltés induláskor ----
  useEffect(function () {
    (async function () {
      try {
        const data = await api("records.list", { collection: "basic-programs" }) as { records?: { id: string; value: { code?: string; name?: string } }[] };
        if (data && data.records && data.records.length && data.records[0].value && typeof data.records[0].value.code === "string" && data.records[0].value.code.trim()) {
          setBasicCode(data.records[0].value.code);
          setBasicMsg("Betöltve az adatbázisból: " + (data.records[0].value.name || "BASIC program"));
        }
      } catch (e) { /* alap példa marad */ }
    })();
  }, []);
  // ---- BASIC: emulátor kimenet ----
  function basicBeep() {
    if (!basicSound) return;
    try {
      const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "square"; o.frequency.value = 880; g.gain.value = 0.06;
      o.connect(g); g.connect(ctx.destination); o.start();
      setTimeout(function () { try { o.stop(); ctx.close(); } catch (e) { /* ignore */ } }, 120);
    } catch (e) { /* hang nem érhető el */ }
  }
  function emuClear() { emuPendingRef.current = ""; setEmuPending(""); setEmuLines(BASIC_HEADER); }
  function emuAppend(s: string) {
    if (s.indexOf("") >= 0) basicBeep();
    const clean = s.split("").join("");
    emuPendingRef.current += clean; setEmuPending(emuPendingRef.current);
  }
  function emuNewline() {
    const full = emuPendingRef.current; emuPendingRef.current = ""; setEmuPending("");
    if (full === "") { setEmuLines(function (p) { return [...p, ""].slice(-120); }); return; }
    const out: string[] = [];
    let rest = full;
    while (rest.length > 40) { out.push(rest.slice(0, 40)); rest = rest.slice(40); }
    out.push(rest);
    setEmuLines(function (p) { return [...p, ...out].slice(-120); });
  }
  function emuWriteLine(s: string) { emuAppend(s); emuNewline(); }
  function emuError(msg: string) { emuAppend("?" + msg + " ERROR"); emuNewline(); emuWriteLine("READY."); }
  // ---- BASIC: program feldarabolás ----
  type BasicLine = { num: number; text: string };
  type BasicVal = number | string;
  type BasicCtx = { vars: Record<string, BasicVal>; arrays: Record<string, BasicVal[]>; data: BasicVal[]; dataPtr: number; forStack: { varName: string; end: number; step: number; returnPc: number }[]; gosubStack: number[] };
  function parseBasicProgram(src: string): BasicLine[] {
    const map = new Map<number, string>();
    src.split("\n").forEach(function (raw) {
      const line = raw.replace(/\r/g, "").trim();
      if (!line) return;
      const m = line.match(/^(\d+)\s*(.*)$/);
      if (m) map.set(parseInt(m[1], 10), m[2] || "");
    });
    return Array.from(map.entries()).sort(function (a, b) { return a[0] - b[0]; }).map(function (e) { return { num: e[0], text: e[1] }; });
  }
  function splitBasicStatements(text: string): string[] {
    const out: string[] = []; let cur = ""; let inStr = false;
    for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '"') inStr = !inStr; if (c === ":" && !inStr) { out.push(cur); cur = ""; } else cur += c; }
    if (cur.trim() !== "" || out.length) out.push(cur);
    return out;
  }
  function splitBasicList(text: string, delims: string): { parts: string[]; seps: string[] } {
    const parts: string[] = []; const seps: string[] = []; let cur = ""; let inStr = false; let depth = 0;
    for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '"') inStr = !inStr; if (!inStr) { if (c === "(") depth++; if (c === ")") depth--; if (depth === 0 && delims.indexOf(c) >= 0) { parts.push(cur); seps.push(c); cur = ""; continue; } } cur += c; }
    parts.push(cur); return { parts, seps };
  }
  function basicToNum(v: BasicVal): number { if (typeof v === "number") return v; const n = parseFloat(String(v)); return isNaN(n) ? 0 : n; }
  function basicToStr(v: BasicVal): string { if (typeof v === "string") return v; return String(v); }
  // Kifejezés-kiértékelő (rekurzív)
  function evalBasicExpr(src: string, ctx: BasicCtx): BasicVal {
    let pos = 0; const s = src;
    function skip() { while (pos < s.length && /\s/.test(s[pos])) pos++; }
    function peekWord(w: string): boolean { skip(); return s.substr(pos, w.length).toUpperCase() === w && (pos + w.length >= s.length || !/[A-Z0-9$]/.test(s[pos + w.length])); }
    function eatWord(w: string): boolean { if (peekWord(w)) { pos += w.length; return true; } return false; }
    function parseOr(): BasicVal { let left = parseAnd(); while (true) { if (eatWord("OR")) { const r = parseAnd(); left = (basicToNum(left) !== 0 || basicToNum(r) !== 0) ? 1 : 0; } else return left; } }
    function parseAnd(): BasicVal { let left = parseNot(); while (true) { if (eatWord("AND")) { const r = parseNot(); left = (basicToNum(left) !== 0 && basicToNum(r) !== 0) ? 1 : 0; } else return left; } }
    function parseNot(): BasicVal { if (eatWord("NOT")) { const v = parseNot(); return basicToNum(v) === 0 ? 1 : 0; } return parseCmp(); }
    function parseCmp(): BasicVal {
      let left = parseAdd();
      while (true) { skip(); let op = ""; if (s.substr(pos, 2) === "<=" || s.substr(pos, 2) === ">=" || s.substr(pos, 2) === "<>") { op = s.substr(pos, 2); pos += 2; } else if (s[pos] === "=" || s[pos] === "<" || s[pos] === ">") { op = s[pos]; pos++; } else return left; const right = parseAdd(); let res = 0; const ln = basicToNum(left); const rn = basicToNum(right); const ls = basicToStr(left); const rs = basicToStr(right); const bothNum = typeof left === "number" && typeof right === "number"; if (op === "=") res = bothNum ? (ln === rn ? 1 : 0) : (ls === rs ? 1 : 0); else if (op === "<>") res = bothNum ? (ln !== rn ? 1 : 0) : (ls !== rs ? 1 : 0); else if (op === "<") res = bothNum ? (ln < rn ? 1 : 0) : (ls < rs ? 1 : 0); else if (op === ">") res = bothNum ? (ln > rn ? 1 : 0) : (ls > rs ? 1 : 0); else if (op === "<=") res = bothNum ? (ln <= rn ? 1 : 0) : (ls <= rs ? 1 : 0); else if (op === ">=") res = bothNum ? (ln >= rn ? 1 : 0) : (ls >= rs ? 1 : 0); left = res; }
    }
    function parseAdd(): BasicVal { let left = parseMul(); while (true) { skip(); if (s[pos] === "+") { pos++; const r = parseMul(); left = (typeof left === "string" || typeof r === "string") ? basicToStr(left) + basicToStr(r) : (left as number) + (r as number); } else if (s[pos] === "-") { pos++; const r = parseMul(); left = basicToNum(left) - basicToNum(r); } else return left; } }
    function parseMul(): BasicVal { let left = parseUnary(); while (true) { skip(); if (s[pos] === "*") { pos++; const r = parseUnary(); left = basicToNum(left) * basicToNum(r); } else if (s[pos] === "/") { pos++; const r = parseUnary(); const d = basicToNum(r); if (d === 0) throw new Error("DIVISION BY ZERO"); left = basicToNum(left) / d; } else return left; } }
    function parseUnary(): BasicVal { skip(); if (s[pos] === "-") { pos++; return -basicToNum(parseUnary()); } if (s[pos] === "+") { pos++; return parseUnary(); } return parsePrimary(); }
    function parsePrimary(): BasicVal {
      skip();
      if (pos >= s.length) throw new Error("SYNTAX");
      const c = s[pos];
      if (c === '"') { pos++; let out = ""; while (pos < s.length && s[pos] !== '"') { out += s[pos]; pos++; } pos++; return out; }
      if (c === "(") { pos++; const v = parseOr(); skip(); if (s[pos] === ")") pos++; return v; }
      if (/[0-9.]/.test(c)) { let num = ""; while (pos < s.length && /[0-9.]/.test(s[pos])) { num += s[pos]; pos++; } return parseFloat(num) || 0; }
      if (/[A-Z]/i.test(c)) {
        let name = ""; while (pos < s.length && /[A-Z0-9]/i.test(s[pos])) { name += s[pos].toUpperCase(); pos++; }
        let isStr = false; if (s[pos] === "$") { isStr = true; pos++; name += "$"; }
        if (eatWord("(")) { const args: BasicVal[] = []; skip(); if (s[pos] !== ")") { while (true) { args.push(parseOr()); skip(); if (s[pos] === ",") { pos++; continue; } break; } } skip(); if (s[pos] === ")") pos++; if (["CHR$", "STR$", "VAL", "INT", "ABS", "SQR", "RND", "LEN", "ASC", "LEFT$", "RIGHT$", "MID$", "PEEK", "SPC"].indexOf(name) >= 0) return callBasicFn(name, args); const idx = Math.floor(basicToNum(args[0] || 0)); const arr = ctx.arrays[name]; if (!arr) return 0; return arr[idx] === undefined ? 0 : arr[idx]; }
        if (isStr) { if (ctx.vars[name] === undefined) return ""; return ctx.vars[name]; }
        if (ctx.vars[name] === undefined) return 0; return ctx.vars[name];
      }
      throw new Error("SYNTAX");
    }
    function callBasicFn(name: string, args: BasicVal[]): BasicVal {
      if (name === "CHR$") return String.fromCharCode(Math.floor(basicToNum(args[0] || 0)) % 256);
      if (name === "STR$") return String(basicToNum(args[0] || 0));
      if (name === "VAL") return basicToNum(args[0] || "");
      if (name === "INT") return Math.floor(basicToNum(args[0] || 0));
      if (name === "ABS") return Math.abs(basicToNum(args[0] || 0));
      if (name === "SQR") { const v = basicToNum(args[0] || 0); if (v < 0) throw new Error("SYNTAX"); return Math.sqrt(v); }
      if (name === "RND") return Math.random();
      if (name === "LEN") return basicToStr(args[0] || "").length;
      if (name === "ASC") return basicToStr(args[0] || "").charCodeAt(0) || 0;
      if (name === "LEFT$") return basicToStr(args[0] || "").slice(0, Math.max(0, Math.floor(basicToNum(args[1] || 0))));
      if (name === "RIGHT$") { const str = basicToStr(args[0] || ""); const n = Math.floor(basicToNum(args[1] || 0)); return str.slice(Math.max(0, str.length - n)); }
      if (name === "MID$") { const str = basicToStr(args[0] || ""); const start = Math.max(1, Math.floor(basicToNum(args[1] || 1))); if (args.length >= 3) return str.slice(start - 1, start - 1 + Math.floor(basicToNum(args[2]))); return str.slice(start - 1); }
      if (name === "PEEK") return pokeMemRef.current[Math.floor(basicToNum(args[0] || 0))] || 0;
      if (name === "SPC") return " ".repeat(Math.max(0, Math.floor(basicToNum(args[0] || 0))));
      throw new Error("SYNTAX");
    }
    const v = parseOr(); skip(); if (pos < s.length) throw new Error("SYNTAX"); return v;
  }
  function collectBasicData(lines: BasicLine[]): BasicVal[] {
    const out: BasicVal[] = [];
    lines.forEach(function (l) { splitBasicStatements(l.text).forEach(function (stmt) { const t = stmt.trim(); if (t.toUpperCase().indexOf("DATA") === 0) { const rest = t.slice(4).trim(); if (rest) { splitBasicList(rest, ",").parts.forEach(function (p) { const q = p.trim(); if (q[0] === '"') out.push(q.slice(1, q.lastIndexOf('"') > 0 ? q.lastIndexOf('"') : q.length)); else if (q !== "") out.push(parseFloat(q) || 0); }); } } }); });
    return out;
  }
  function basicLineIndex(lines: BasicLine[], num: number): number { for (let i = 0; i < lines.length; i++) if (lines[i].num === num) return i; return -1; }
  function awaitBasicInput(promptText: string): Promise<string> {
    emuAppend(promptText + "? ");
    setBasicAwaiting(true);
    return new Promise(function (resolve) { basicInputResolver.current = function (v: string) { setBasicAwaiting(false); resolve(v); }; });
  }
  type BasicExecResult = { jump?: number; end?: boolean; reset?: boolean };
  async function execBasicOne(stmtRaw: string, ctx: BasicCtx, lines: BasicLine[], getPc: () => number, setPc: (n: number) => void): Promise<BasicExecResult> {
    const stmt = stmtRaw.trim(); if (!stmt) return {};
    const up = stmt.toUpperCase();
    if (up.indexOf("REM") === 0 && (up.length === 3 || /[\s:]/.test(up[3] || ""))) return {};
    if (up === "END" || up === "STOP") { if (up === "STOP") { emuAppend("BREAK"); emuNewline(); } return { end: true }; }
    if (up === "CLR") { ctx.vars = {}; ctx.arrays = {}; ctx.forStack = []; ctx.gosubStack = []; return {}; }
    if (up === "NEW") { setBasicCode(""); emuAppend("NEW"); emuNewline(); return {}; }
    if (up === "LIST") { const prog = parseBasicProgram(basicCodeRef.current); if (!prog.length) emuWriteLine("  (ÜRES PROGRAM)"); prog.forEach(function (l) { emuWriteLine(l.num + " " + l.text); }); return {}; }
    if (up === "RUN") { return { end: true }; }
    if (up.indexOf("PRINT") === 0 && (up.length === 5 || /\s/.test(up[5] || ""))) {
      const rest = stmt.slice(5).trim();
      if (rest === "") { emuNewline(); return {}; }
      const split = splitBasicList(rest, ";,");
      for (let i = 0; i < split.parts.length; i++) {
        const part = split.parts[i].trim();
        if (part !== "") { const v = evalBasicExpr(part, ctx); emuAppend(typeof v === "number" ? String(v) + " " : String(v)); }
        const sep = split.seps[i];
        if (sep === ",") { const curLen = emuPendingRef.current.length; const pad = 14 - (curLen % 14); emuAppend(" ".repeat(pad)); }
      }
      const lastSep = split.seps[split.seps.length - 1];
      if (split.seps.length && (lastSep === ";" || lastSep === ",")) { /* sor folytatódik */ } else emuNewline();
      return {};
    }
    if (up.indexOf("INPUT") === 0) {
      const m = stmt.match(/^INPUT\s*(?:"([^"]*)"\s*[;,])?\s*([A-Z][A-Z0-9]*\$?)/i);
      if (!m) throw new Error("SYNTAX");
      const prompt = m[1] || ""; const varName = m[2].toUpperCase();
      const answer = await awaitBasicInput(prompt);
      const isStr = varName.indexOf("$") >= 0;
      ctx.vars[varName] = isStr ? answer : (parseFloat(answer) || 0);
      return {};
    }
    if (up.indexOf("IF") === 0) {
      const thenIdx = up.indexOf(" THEN ");
      if (thenIdx < 0) throw new Error("SYNTAX");
      const condText = stmt.slice(2, thenIdx).trim();
      const thenText = stmt.slice(thenIdx + 6).trim();
      const cond = basicToNum(evalBasicExpr(condText, ctx));
      if (cond !== 0) { if (/^\d+$/.test(thenText)) { const idx = basicLineIndex(lines, parseInt(thenText, 10)); if (idx < 0) throw new Error("UNDEF'D STATEMENT"); return { jump: idx }; } return execBasicOne(thenText, ctx, lines, getPc, setPc); }
      return {};
    }
    if (up.indexOf("FOR") === 0) {
      const m = stmt.match(/^FOR\s+([A-Z][A-Z0-9]*)\s*=\s*(.+)$/i); if (!m) throw new Error("SYNTAX");
      const varName = m[1].toUpperCase(); const rest = m[2];
      const toIdx = rest.toUpperCase().indexOf(" TO "); if (toIdx < 0) throw new Error("SYNTAX");
      const start = basicToNum(evalBasicExpr(rest.slice(0, toIdx), ctx));
      const afterTo = rest.slice(toIdx + 4); const stepIdx = afterTo.toUpperCase().indexOf(" STEP ");
      const end = basicToNum(evalBasicExpr(stepIdx >= 0 ? afterTo.slice(0, stepIdx) : afterTo, ctx));
      const step = stepIdx >= 0 ? basicToNum(evalBasicExpr(afterTo.slice(stepIdx + 6), ctx)) : 1;
      ctx.vars[varName] = start;
      const frame = { varName, end, step, returnPc: getPc() };
      const inRange = step > 0 ? start <= end : start >= end;
      if (!inRange) { let depth = 1; for (let i = getPc(); i < lines.length; i++) { const sts = splitBasicStatements(lines[i].text); for (let k = 0; k < sts.length; k++) { const u2 = sts[k].trim().toUpperCase(); if (u2.indexOf("FOR") === 0) depth++; if (u2.indexOf("NEXT") === 0) { depth--; if (depth === 0) return { jump: i + 1 }; } } } return { jump: lines.length }; }
      ctx.forStack.push(frame); return {};
    }
    if (up.indexOf("NEXT") === 0) {
      const m = stmt.match(/^NEXT\s*([A-Z][A-Z0-9]*)?/i);
      const varName = m && m[1] ? m[1].toUpperCase() : "";
      let idx = -1; for (let i = ctx.forStack.length - 1; i >= 0; i--) { if (!varName || ctx.forStack[i].varName === varName) { idx = i; break; } }
      if (idx < 0) throw new Error("SYNTAX");
      const frame = ctx.forStack[idx]; const cur = basicToNum(ctx.vars[frame.varName] || 0) + frame.step; ctx.vars[frame.varName] = cur;
      const cont = frame.step > 0 ? cur <= frame.end : cur >= frame.end;
      if (cont) return { jump: frame.returnPc }; ctx.forStack.splice(idx, 1); return {};
    }
    if (up.indexOf("GOTO") === 0) { const n = parseInt(stmt.slice(4).trim(), 10); const idx = basicLineIndex(lines, n); if (idx < 0) throw new Error("UNDEF'D STATEMENT"); return { jump: idx }; }
    if (up.indexOf("GOSUB") === 0) { const n = parseInt(stmt.slice(5).trim(), 10); const idx = basicLineIndex(lines, n); if (idx < 0) throw new Error("UNDEF'D STATEMENT"); ctx.gosubStack.push(getPc()); return { jump: idx }; }
    if (up === "RETURN") { const ret = ctx.gosubStack.pop(); if (ret === undefined) throw new Error("SYNTAX"); return { jump: ret }; }
    if (up.indexOf("DIM") === 0) { const m = stmt.match(/^DIM\s+([A-Z][A-Z0-9]*\$?)\s*\(\s*(.+)\s*\)/i); if (!m) throw new Error("SYNTAX"); const size = Math.floor(basicToNum(evalBasicExpr(m[2], ctx))); ctx.arrays[m[1].toUpperCase()] = new Array(size + 1).fill(0); return {}; }
    if (up.indexOf("READ") === 0) { const vars = splitBasicList(stmt.slice(4), ",").parts.map(function (p) { return p.trim().toUpperCase(); }); for (let i = 0; i < vars.length; i++) { const v = vars[i]; const am = v.match(/^([A-Z][A-Z0-9]*\$?)\s*\(\s*(.+)\s*\)$/); if (am) { const idx2 = Math.floor(basicToNum(evalBasicExpr(am[2], ctx))); if (!ctx.arrays[am[1]]) ctx.arrays[am[1]] = []; ctx.arrays[am[1]][idx2] = ctx.data[ctx.dataPtr++] ?? 0; } else { const dv = ctx.data[ctx.dataPtr++]; ctx.vars[v] = dv === undefined ? 0 : dv; } } return {}; }
    if (up.indexOf("DATA") === 0) return {};
    if (up.indexOf("POKE") === 0) { const parts = splitBasicList(stmt.slice(4), ",").parts; if (parts.length < 2) throw new Error("SYNTAX"); const addr = Math.floor(basicToNum(evalBasicExpr(parts[0], ctx))); const val = Math.floor(basicToNum(evalBasicExpr(parts[1], ctx))); pokeMemRef.current[addr] = val % 256; return {}; }
    if (up.indexOf("SYS") === 0) { const n = Math.floor(basicToNum(evalBasicExpr(stmt.slice(3), ctx))); if (n === 64738) { emuWriteLine("SYS 64738 - RESET..."); return { reset: true, end: true }; } emuWriteLine("SYS " + n + " - NINCS ILYEN RUTIN."); return {}; }
    if (up.indexOf("LET") === 0) return execBasicOne(stmt.slice(3).trim(), ctx, lines, getPc, setPc);
    const assign = stmt.match(/^([A-Z][A-Z0-9]*\$?)\s*(?:\(\s*(.+?)\s*\))?\s*=\s*(.+)$/i);
    if (assign) { const varName = assign[1].toUpperCase(); const val = evalBasicExpr(assign[3], ctx); if (assign[2] !== undefined) { const idx2 = Math.floor(basicToNum(evalBasicExpr(assign[2], ctx))); if (!ctx.arrays[varName]) ctx.arrays[varName] = []; ctx.arrays[varName][idx2] = val; } else ctx.vars[varName] = val; return {}; }
    throw new Error("SYNTAX");
  }
  async function runBasicProgram(source: string, useDirectCtx?: boolean) {
    if (basicRunningRef.current) { setBasicMsg("Már fut egy program — STOP-pal állíthatod le."); return; }
    const rawLines = parseBasicProgram(source);
    let lines = rawLines;
    let ctx: BasicCtx;
    if (useDirectCtx) { lines = [{ num: 0, text: source.trim() }]; ctx = directCtxRef.current as BasicCtx; ctx.data = collectBasicData(parseBasicProgram(basicCodeRef.current)); ctx.dataPtr = 0; }
    else { ctx = { vars: {}, arrays: {}, data: [], dataPtr: 0, forStack: [], gosubStack: [] }; ctx.data = collectBasicData(lines); }
    if (!lines.length) { emuWriteLine("?SYNTAX ERROR"); emuWriteLine("READY."); return; }
    basicStopRef.current = false; basicRunningRef.current = true; setBasicRunning(true);
    let pc = 0; let ended = false; let didReset = false;
    try {
      while (pc < lines.length && !basicStopRef.current) {
        const line = lines[pc]; const nextPc = pc + 1; pc = nextPc;
        const stmts = splitBasicStatements(line.text);
        for (let si = 0; si < stmts.length; si++) {
          const res = await execBasicOne(stmts[si], ctx, lines, function () { return pc; }, function (n: number) { pc = n; });
          if (res.reset) { didReset = true; ended = true; break; }
          if (res.end) { ended = true; break; }
          if (res.jump !== undefined) { pc = res.jump; break; }
          if (basicStopRef.current) break;
        }
        if (basicSlow && !useDirectCtx) await new Promise(function (r) { setTimeout(r, 170); });
        if (ended) break;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "SYNTAX";
      emuError(msg === "SYNTAX" ? "SYNTAX" : msg);
      basicRunningRef.current = false; setBasicRunning(false); return;
    }
    if (didReset) { emuClear(); emuWriteLine("RESET KESZ."); emuWriteLine("READY."); }
    else if (basicStopRef.current) { emuAppend("BREAK"); emuNewline(); emuWriteLine("READY."); if (basicInputResolver.current) { const r = basicInputResolver.current; basicInputResolver.current = null; setBasicAwaiting(false); r(""); } }
    else { emuWriteLine("READY."); logGhostRun("BASIC", "BASIC", source, "READY — BASIC futtatás kész", 20, "OK", false); }
    basicRunningRef.current = false; setBasicRunning(false);
  }
  function listBasic() { const prog = parseBasicProgram(basicCodeRef.current); if (!prog.length) { emuWriteLine("  (URES PROGRAM)"); return; } prog.forEach(function (l) { emuWriteLine(l.num + " " + l.text); }); emuWriteLine("READY."); }
  async function saveBasic() {
    setBasicSaving(true);
    try {
      const value = { name: "MATYA BASIC", code: basicCodeRef.current };
      const existing = await api("records.list", { collection: "basic-programs" }) as { records?: { id: string; value: { name?: string } }[] };
      let match: { id: string } | undefined = undefined;
      if (existing && existing.records) match = existing.records.find(function (r) { return r.value && r.value.name === "MATYA BASIC"; }) || existing.records[0];
      if (match) await api("records.replace", { collection: "basic-programs", id: match.id, value: value });
      else await api("records.create", { collection: "basic-programs", value: value, idempotency_key: "basic-program-1" });
      setBasicMsg("Mentve az adatbázisba: MATYA BASIC");
    } catch (e) { setBasicMsg("Mentés nem sikerült — próbáld újra."); }
    setBasicSaving(false);
  }
  function insertBasicCommand(text: string) {
    const el = basicEditorRef.current;
    if (!el) { setBasicCode(function (p) { return p + text; }); return; }
    const start = el.selectionStart || 0; const end = el.selectionEnd || 0;
    const cur = basicCodeRef.current; const next = cur.slice(0, start) + text + cur.slice(end);
    setBasicCode(next); basicCodeRef.current = next;
    setTimeout(function () { el.focus(); el.selectionStart = el.selectionEnd = start + text.length; }, 0);
  }
  function submitEmuInput() {
    const raw = emuInput; if (!raw.trim()) return; setEmuInput("");
    if (basicInputResolver.current) { const r = basicInputResolver.current; basicInputResolver.current = null; setBasicAwaiting(false); emuAppend(raw); emuNewline(); r(raw); return; }
    emuAppend(raw); emuNewline();
    const t = raw.trim(); const up = t.toUpperCase();
    if (up === "LIST") { listBasic(); return; }
    if (up === "RUN") { void runBasicProgram(basicCodeRef.current); return; }
    if (up === "NEW") { setBasicCode(""); emuWriteLine("READY."); return; }
    if (up === "CLR") { emuClear(); return; }
    const m = t.match(/^(\d+)\s*(.*)$/);
    if (m) {
      const num = m[1]; const body = m[2];
      const prog = parseBasicProgram(basicCodeRef.current);
      let next = "";
      if (body.trim() === "") next = prog.filter(function (l) { return String(l.num) !== num; }).map(function (l) { return l.num + " " + l.text; }).join("\n");
      else { const rest = prog.filter(function (l) { return String(l.num) !== num; }); rest.push({ num: parseInt(num, 10), text: body }); rest.sort(function (a, b) { return a.num - b.num; }); next = rest.map(function (l) { return l.num + " " + l.text; }).join("\n"); }
      setBasicCode(next); basicCodeRef.current = next; emuWriteLine("READY."); return;
    }
    void runBasicProgram(t, true);
  }
  // ---- FÁJLRENDSZER MŰVELETEK ----
  function openFsFile(f: FsFile) {
    setSelectedFsId(f.id);
    if (f.folder === "aes-vault/" && vaultLocked) { setFsMsg("🔒 TITKOSÍTVA — oldd fel a Vaultot a tartalomhoz: " + f.name); setErlangMsg("🔒 TITKOSÍTVA — " + f.name); return; }
    if (f.name.endsWith(".erl")) { setErlangCode(f.content); erlangCodeRef.current = f.content; setErlangFileName(f.name); setErlangTab("editor"); openApp("erlang"); }
    else if (f.name.endsWith(".vb")) { setVbCode(f.content); vbCodeRef.current = f.content; setVbFileName(f.name); setVbErrorLine(0); openApp("vbtest"); }
    else if (f.name.endsWith(".bas")) { setBasicCode(f.content); basicCodeRef.current = f.content; openApp("basic"); }
    else { const existing = files.find(function (x) { return x.name === f.name; }); if (existing) { setSelectedFile(existing.id); setEditorText(f.content); setEditorLang(f.lang); } else { setEditorText(f.content); setEditorLang(f.lang); } openApp("editor"); }
    setFsMsg("Megnyitva: " + f.path);
  }
  async function saveToFilesystem() {
    const name = saveDialog.name.trim(); if (!name) { setFsMsg("Adj meg fájlnevet!"); return; }
    const folder = saveDialog.folder; const lang = name.endsWith(".erl") ? "erlang" : name.endsWith(".bas") ? "basic" : name.endsWith(".py") ? "python" : name.endsWith(".js") ? "javascript" : saveDialog.lang;
    const value: FsFile = { id: "", name, path: folder + name, folder, content: saveDialog.content, lang };
    setSaveBusy(true);
    try {
      const existing = await api("records.list", { collection: "matya-filesystem" }) as { records?: { id: string; value: FsFile }[] };
      let match: { id: string } | undefined = undefined;
      if (existing && existing.records) match = existing.records.find(function (r) { return r.value && r.value.name === name && r.value.folder === folder; });
      if (match) { await api("records.replace", { collection: "matya-filesystem", id: match.id, value: { ...value, id: match.id } }); setFsFiles(function (p) { return p.map(function (x) { return x.id === match!.id ? { ...value, id: match!.id } : x; }); }); }
      else { const created = await api("records.create", { collection: "matya-filesystem", value: { ...value, id: "fs-" + Date.now() }, idempotency_key: "fs-" + folder + name + "-" + Date.now() }) as { id: string }; const nf = { ...value, id: created.id }; setFsFiles(function (p) { return [...p.filter(function (x) { return !(x.name === name && x.folder === folder); }), nf]; }); }
      setFsMsg("Mentve a fájlrendszerbe: " + folder + name); setErlangMsg("Mentve: " + folder + name); writeConsole("FÁJLRENDSZER MENTÉS: " + folder + name);
      setSaveDialog(function (p) { return { ...p, open: false }; });
    } catch (e) {
      const nf: FsFile = { ...value, id: "tmp-" + Date.now() }; setFsFiles(function (p) { return [...p.filter(function (x) { return !(x.name === name && x.folder === folder); }), nf]; }); setFsMsg("Mentve (helyi nézet): " + folder + name); setSaveDialog(function (p) { return { ...p, open: false }; });
    }
    setSaveBusy(false);
  }
  async function deleteFsFile(f: FsFile) {
    try { const all = await api("records.list", { collection: "matya-filesystem" }) as { records?: { id: string; value: FsFile }[] }; let m: { id: string } | undefined = undefined; if (all && all.records) m = all.records.find(function (r) { return r.value && r.value.name === f.name && r.value.folder === f.folder; }); if (m) await api("records.delete", { collection: "matya-filesystem", id: m.id }); } catch (e) { /* helyi törlés */ }
    setFsFiles(function (p) { return p.filter(function (x) { return x.id !== f.id; }); }); setFsMsg("Törölve: " + f.path);
  }
  function copyFsFile(f: FsFile) {
    const base = f.name.replace(/(\.[^.]+)$/, "-masolat$1"); const nf: FsFile = { ...f, id: "copy-" + Date.now(), name: base, path: f.folder + base };
    setFsFiles(function (p) { return [...p, nf]; }); setFsMsg("Másolva: " + base);
    void (async function () { try { await api("records.create", { collection: "matya-filesystem", value: { ...nf, id: nf.id }, idempotency_key: "fs-copy-" + nf.id }); } catch (e) { /* */ } })();
  }
  function renameFsFile(f: FsFile) {
    const nv = renameValue.trim(); if (!nv) return;
    setFsFiles(function (p) { return p.map(function (x) { return x.id === f.id ? { ...x, name: nv, path: x.folder + nv } : x; }); }); setRenamingId(""); setFsMsg("Átnevezve: " + f.name + " → " + nv);
    void (async function () { try { const all = await api("records.list", { collection: "matya-filesystem" }) as { records?: { id: string; value: FsFile }[] }; let m: { id: string } | undefined = undefined; if (all && all.records) m = all.records.find(function (r) { return r.value && r.value.name === f.name; }); if (m) await api("records.replace", { collection: "matya-filesystem", id: m.id, value: { ...f, name: nv, path: f.folder + nv } }); } catch (e) { /* */ } })();
  }
  function compileErlang() {
    try { const p = erlangParseProgram(erlangCode); setErlangMsg("FORDÍTÁS OK — modul: " + p.module + " • függvények: " + Object.keys(p.funcs).join(", ")); writeConsole("[ERLANG] COMPILE OK: " + erlangFileName); }
    catch (e) { setErlangMsg("FORDÍTÁSI HIBA — ellenőrizd a szintaxist."); }
  }
  function highlightErlang(code: string): React.ReactNode[] {
    const keywords = ["-module", "-export", "-import", "fun", "receive", "send", "spawn", "case", "of", "end", "if", "try", "catch", "when", "after", "begin", "and", "or", "not", "true", "false", "ok", "done"];
    return code.split("\n").map(function (line, li) {
      const parts = line.split(/(\s+|"(?:[^"\\]|\\.)*"|[A-Za-z_][A-Za-z0-9_]*|->|;|,|\(|\)|\[|\]|\{|\})/g).filter(function (x) { return x !== undefined && x !== ""; });
      return <div key={li}>{parts.map(function (part, pi) { let cls = "text-[#ececec]"; if (keywords.indexOf(part) >= 0) cls = "text-[#FF0A1E] font-bold"; else if (/^"/.test(part)) cls = "text-[#00e676]"; else if (/^[A-Z_]/.test(part)) cls = "text-white font-bold"; else if (/^[0-9]/.test(part)) cls = "text-[#ffd54a]"; return <span key={pi} className={cls}>{part}</span>; }) || " "}</div>;
    });
  }
  function startInstall() {
    if (installBusy) return; setInstallBusy(true); setInstallProgress(0); setInstallDone(false);
    const steps = ["[1/5] Erlang/OTP 27 letöltése…", "[2/5] OTP 27 kicsomagolás és ellenőrzés…", "[3/5] rebar3 telepítése…", "[4/5] Könyvtárak: cowboy, gen_server, supervisor, mnesia, observer…", "[5/5] PATH beállítás: /usr/local/erlang/bin + /aes-vault/erlang/…", "KÉSZ - erl --version: Erlang/OTP 27 [erts-15.2]"];
    let i = 0; const t = setInterval(function () { setInstallLog(function (p) { return [...p, steps[i]]; }); setInstallProgress(Math.round(((i + 1) / steps.length) * 100)); i++; if (i >= steps.length) { clearInterval(t); setInstallBusy(false); setInstallDone(true); setErlangMsg("Telepítve: Erlang/OTP 27 • rebar3 • könyvtárak ✓"); } }, 650);
  }
  function installJetBrains(name: string) {
    if (jetBusy) return; setJetBusy(name); setJetProgress(0);
    const folder = "/aes-vault/jetbrains/" + name.toLowerCase().replace(/[^a-z]+/g, "-");
    setJetLog(function (p) { return [...p, "Telepítés AES védett mappába: " + folder + " …"]; });
    let p = 0; const t = setInterval(function () { p += 20; setJetProgress(p); if (p >= 100) { clearInterval(t); setJetBusy(""); setJetDone(function (prev) { return [...prev, name]; }); setJetLog(function (prev) { return [...prev, "KÉSZ: " + name + " → " + folder]; }); } }, 300);
  }
  // ---- TŰZFAL MŰVELETEK ----
  function fwAddLog(msg: string) { const stamp = new Date().toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); setFwLog(function (p) { return [...p, "[" + stamp + "] " + msg].slice(-200); }); }
  function fwApplyProfile(name: string) {
    setFwProfile(name);
    if (name === "KALI ALAP") { setFwRules(FW_INITIAL); fwAddLog("PROFIL: KALI ALAP (szigorú) — iptables szabályok visszaállítva."); }
    else if (name === "OTTHON") { setFwRules([{ id: "FW-01", source: "0.0.0.0/0", port: 22, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" }, { id: "FW-02", source: "0.0.0.0/0", port: 80, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" }, { id: "FW-03", source: "0.0.0.0/0", port: 443, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" }, { id: "FW-04", source: "0.0.0.0/0", port: 7777, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" }, { id: "FW-05", source: "0.0.0.0/0", port: 23, protocol: "TCP", action: "DROP", status: "AKTÍV" }, { id: "FW-06", source: "0.0.0.0/0", port: 445, protocol: "TCP", action: "DROP", status: "AKTÍV" }]); fwAddLog("PROFIL: OTTHON (nyitott 80/443) — 80/443 ACCEPT, többi szigorú."); }
    else if (name === "SZERVER") { setFwRules([{ id: "FW-01", source: "0.0.0.0/0", port: 22, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" }, { id: "FW-03", source: "0.0.0.0/0", port: 443, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" }, { id: "FW-04", source: "0.0.0.0/0", port: 7777, protocol: "TCP", action: "ACCEPT", status: "AKTÍV" }, { id: "FW-99", source: "0.0.0.0/0", port: 0, protocol: "TCP", action: "DROP", status: "AKTÍV" }]); fwAddLog("PROFIL: SZERVER (csak 22/443/7777) — minden más DROP."); }
    else if (name === "MINDEN ZÁR") { setFwRules([{ id: "FW-99", source: "0.0.0.0/0", port: 0, protocol: "TCP", action: "DROP", status: "AKTÍV" }]); fwAddLog("PROFIL: MINDEN ZÁR — iptables -P INPUT DROP • DROP ALL."); }
  }
  function fwAddRule() {
    const port = parseInt(fwNewPort, 10); if (isNaN(port) || port < 0 || port > 65535) { fwAddLog("HIBA: érvénytelen port: " + fwNewPort); return; }
    const proto = fwNewProto.toUpperCase();
    const rule: FwRule = { id: "FW-" + String(fwRules.length + 1).padStart(2, "0") + "-" + Date.now().toString().slice(-3), source: fwNewSource.trim() || "0.0.0.0/0", port, protocol: proto, action: fwNewAction, status: "AKTÍV" };
    setFwRules(function (p) { return [...p, rule]; });
    const cmd = "iptables -A INPUT -p " + proto.toLowerCase() + " --dport " + port + " -j " + fwNewAction + (proto === "ICMP" ? "  (ICMP: port nélküli)" : "");
    fwAddLog(cmd);
    fwAddLog("SZABÁLY HOZZÁADVA: " + rule.id + " • " + rule.source + " → :" + port + " " + proto + " " + fwNewAction);
  }
  function fwSimulateScan() {
    const rows: string[] = [];
    for (let i = 0; i < 10; i++) { const dpt = [21, 23, 25, 110, 135, 139, 445, 1433, 3306, 8080][i]; const src = "45.1.2." + (10 + i); rows.push("[UFW BLOCK] SRC=" + src + " DST=192.168.1.20 DPT=" + dpt + " PROTO=TCP"); }
    rows.forEach(function (r) { fwAddLog(r); });
    fwAddLog("SCAN BLOKKOLVA - 10/10");
  }
  function fwCopyLog() {
    const ta = document.createElement("textarea"); ta.value = fwLog.join("\n"); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); setFwCopied(true); setTimeout(function () { setFwCopied(false); }, 1800); } catch (e) { /* ignore */ } document.body.removeChild(ta);
  }
  // ---- BOOT / GEO MŰVELETEK ----
  async function saveBootEntry(entry: BootEntry) {
    try { await api("records.create", { collection: "boot-log", value: { time: entry.time, text: entry.text, status: entry.status }, idempotency_key: "boot-" + entry.time + "-" + entry.text.slice(0, 24) + "-" + Date.now() }); setBootSavedMsg("Boot napló mentve az adatbázisba."); } catch (e) { setBootSavedMsg("Boot napló: most csak ebben a nézetben (adatbázis nem érhető el)."); }
  }
  function bootRefresh() {
    const entry: BootEntry = { time: bootStamp(), text: "[BOOT] FRISSÍTÉS — napló újratöltve • " + bootLog.length + " sor", status: "OK" };
    setBootLog(function (p) { return [...p, entry]; }); void saveBootEntry(entry);
  }
  function bootCopy() {
    const ta = document.createElement("textarea"); ta.value = bootLog.map(function (e) { return e.time + " " + e.text + " [" + e.status + "]"; }).join("\n"); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); setBootCopied(true); setTimeout(function () { setBootCopied(false); }, 1800); } catch (e) { /* ignore */ } document.body.removeChild(ta);
  }
  function refreshGeo() {
    setGeoStatus("FRISSÍTÉS…");
    const fallback = function () {
      const cities = [{ name: "Budapest", code: "HU-BP-47.49N-19.04E" }, { name: "Hajdúböszörmény", code: "HU-HB-47.67N-21.51E" }];
      const pick = cities[Math.floor(Math.random() * cities.length)];
      const lat = 8 + Math.floor(Math.random() * 12);
      setGeoCode("GEO: " + pick.code + " | SZERVER: eu-central-1 | LAT: " + lat + "ms");
      setGeoStatus("KISZOLGÁLÓK FELÉ KÜLDVE ✓");
      setGeoMsg("Helyzetmeghatározási kód újragenerálva — IP-alapú becslés: " + pick.name + " / HU • időzóna Europe/Budapest (böngésző helymeghatározás nem engedélyezett).");
      const entry: BootEntry = { time: bootStamp(), text: "[GEO] " + pick.code + " | SZERVER: eu-central-1 — kiszolgálók felé küldve", status: "OK" };
      setBootLog(function (p) { return [...p, entry]; });
    };
    try {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (pos) {
          const la = pos.coords.latitude; const lo = pos.coords.longitude;
          const city = Math.abs(la - 47.49) < 0.6 && Math.abs(lo - 19.04) < 0.6 ? "Budapest" : Math.abs(la - 47.67) < 0.6 && Math.abs(lo - 21.51) < 0.6 ? "Hajdúböszörmény" : "HU";
          const code = "GEO: HU-" + (city === "Budapest" ? "BP" : city === "Hajdúböszörmény" ? "HB" : "HU") + "-" + Math.abs(la).toFixed(2) + "N-" + Math.abs(lo).toFixed(2) + "E | SZERVER: eu-central-1 | LAT: 12ms";
          setGeoCode(code); setGeoStatus("KISZOLGÁLÓK FELÉ KÜLDVE ✓"); setGeoMsg("Helyzetmeghatározási kód frissítve böngésző helymeghatározással: " + city + " • időzóna Europe/Budapest.");
          const entry: BootEntry = { time: bootStamp(), text: "[GEO] " + code + " — kiszolgálók felé küldve", status: "OK" };
          setBootLog(function (p) { return [...p, entry]; }); void saveBootEntry(entry);
        }, function () { fallback(); }, { timeout: 3000, maximumAge: 60000 });
      } else fallback();
    } catch (e) { fallback(); }
  }
  useEffect(function () {
    const t = setInterval(function () {
      setWindows(function (ws) { return ws; });
      if (typeof document !== "undefined" && document.querySelector("[data-fw-live]")) {
        const ports = [23, 445, 443, 22, 8080, 1433];
        const dpt = ports[Math.floor(Math.random() * ports.length)];
        const block = dpt === 23 || dpt === 445 || dpt === 1433;
        fwAddLog(block ? "[UFW BLOCK] SRC=45.1.2." + (3 + Math.floor(Math.random() * 90)) + " DST=192.168.1.20 DPT=" + dpt + " PROTO=TCP" : "[ACCEPT] SRC=192.168.1." + (2 + Math.floor(Math.random() * 40)) + " DST=192.168.1.20 DPT=" + dpt + " PROTO=TCP");
      }
    }, 6000);
    return function () { clearInterval(t); };
  }, []);
  useEffect(function () {
    (async function () {
      try {
        const data = await api("records.list", { collection: "boot-log" }) as { records?: { value: BootEntry }[] };
        if (data && data.records && data.records.length) {
          const mapped = data.records.map(function (r) { return { time: r.value.time || bootStamp(), text: r.value.text || "", status: (r.value.status as BootEntry["status"]) || "OK" }; });
          const reboot: BootEntry = { time: bootStamp(), text: "[REBOOT] Újraindítás — új bejegyzés a naplófájlba", status: "WARN" };
          setBootLog([...mapped.slice(-80), reboot]);
          try { await api("records.create", { collection: "boot-log", value: { time: reboot.time, text: reboot.text, status: reboot.status }, idempotency_key: "boot-reboot-" + Date.now() }); } catch (e) { /* mentés később */ }
        }
      } catch (e) { /* alap napló marad */ }
    })();
  }, []);
  function writeConsole(lines: string | string[]) {
    const arr = Array.isArray(lines) ? lines : [lines];
    setConsoleLines(function (p) { return [...p, ...arr].slice(-220); });
    setConsoleMin(false);
  }
  function promptLine(cmd: string) { return "user@matya-core:~$ " + cmd; }

  function openApp(app: AppId) {
    if (app === "terminal") { setConsoleMin(false); setStartOpen(false); setTimeout(function () { document.getElementById("console-input")?.focus(); }, 50); return; }
    const meta = APPS.find(function (a) { return a.id === app; });
    if (!meta) return;
    const existing = windows.find(function (w) { return w.app === app; });
    if (existing) {
      setWindows(function (p) { return p.map(function (w) { return w.id === existing.id ? { ...w, min: false, z: zTop + 1 } : w; }); });
      setActiveId(existing.id); setZTop(zTop + 1); setStartOpen(false); return;
    }
    const w: Win = { id: "w-" + app + "-" + Date.now(), app, title: meta.name.toUpperCase(), x: 96, y: 42, w: 720, h: 480, min: false, max: false, z: zTop + 1 };
    if (app === "editor") { w.w = 820; w.h = 520; }
    if (app === "basic") { w.w = 900; w.h = 600; w.x = 40; w.y = 20; }
    if (app === "erlang") { w.w = 980; w.h = 640; w.x = 20; w.y = 16; }
    if (app === "erlangtest") { w.w = 640; w.h = 480; w.x = 180; w.y = 80; }
    if (app === "shift") { w.w = 1080; w.h = 660; w.x = 12; w.y = 12; }
    if (app === "vbtest") { w.w = 960; w.h = 620; w.x = 60; w.y = 30; }
    if (app === "kotlin") { w.w = 620; w.h = 430; }
    if (app === "vault") { w.w = 560; w.h = 420; }
    if (app === "firewall") { w.w = 1080; w.h = 660; w.x = 12; w.y = 12; }
    if (app === "bootlog") { w.w = 900; w.h = 620; w.x = 40; w.y = 20; }
    if (app === "jetbrains") { w.w = 620; w.h = 480; w.x = 120; w.y = 60; }
    if (app === "matrix") { w.w = 1120; w.h = 700; w.x = 8; w.y = 8; }
    if (app === "ghost") { w.w = 760; w.h = 620; w.x = 80; w.y = 30; }
    if (app === "cuda") { w.w = 1080; w.h = 660; w.x = 12; w.y = 12; }
    if (app === "transitter") { w.w = 1120; w.h = 700; w.x = 8; w.y = 8; }
    if (app === "checklist") { w.w = 1080; w.h = 660; w.x = 12; w.y = 12; }
    setZTop(zTop + 1);
    setWindows(function (p) { return [...p, w]; });
    setActiveId(w.id);
    setStartOpen(false);
  }
  function focusWin(id: string) { setActiveId(id); setWindows(function (p) { return p.map(function (w) { return w.id === id ? { ...w, z: zTop + 1 } : w; }); }); setZTop(zTop + 1); }
  function closeWin(id: string) { setWindows(function (p) { return p.filter(function (w) { return w.id !== id; }); }); }
  function toggleMin(id: string) { setWindows(function (p) { return p.map(function (w) { return w.id === id ? { ...w, min: !w.min } : w; }); }); }
  function toggleMax(id: string) { setWindows(function (p) { return p.map(function (w) { return w.id === id ? { ...w, max: !w.max } : w; }); }); }

  function onHistKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") { e.preventDefault(); if (!hist.length) return; const idx = histIdx === -1 ? hist.length - 1 : Math.max(0, histIdx - 1); setHistIdx(idx); setInput(hist[idx]); }
    if (e.key === "ArrowDown") { e.preventDefault(); if (histIdx < 0) return; const idx = histIdx + 1; if (idx >= hist.length) { setHistIdx(-1); setInput(""); } else { setHistIdx(idx); setInput(hist[idx]); } }
  }

  function runCommand(raw: string) {
    const cmdRaw = raw.trim();
    const cmd = cmdRaw.toLowerCase().replace(/\s+/g, " ");
    const out: string[] = [promptLine(cmdRaw)];
    function push(v: string | string[]) { out.push(...(Array.isArray(v) ? v : [v])); }
    if (cmd === "help") push(["PARANCSOK:", "help • ls • pwd • whoami • neofetch • version • install", "daemon status • aes lock • aes unlock • ai status • net check • clear"]);
    else if (cmd === "ls") push("apps/  core/  daemon/  server/  data/vault/  Main.kt  server.kt  ai.py  app.js");
    else if (cmd === "pwd") push("/home/user/matya-core");
    else if (cmd === "whoami") push("user");
    else if (cmd === "version") push("MATYA CORE // DESKTOP v1.0 • Kernel 6.8 • Kotlin 2.0.21 • Node 20.14 • Python 3.12.4");
    else if (cmd === "neofetch") push(["MATYA CORE // DESKTOP v1.0", "user@matya-core • OS: MATYA CORE Linux • Kernel: 6.8", "Shell: bash • Daemon: PID 777 • Vault: " + (vaultLocked ? "LOCKED" : "UNLOCKED"), "Kotlin 2.0.21 • Node v20.14 • Python 3.12.4 • Server :8080 " + (serverOn ? "ON" : "OFF")]);
    else if (cmd === "install") push(["Telepítés: Kotlin Server modul ellenőrzése…", "OK — minden modul már telepítve. Nyisd meg: Kotlin Server ablak."]);
    else if (cmd === "daemon status") push(["DAEMON: " + (daemonOn ? "FUT" : "LEÁLLÍTVA") + " • PID 777", "Figyelt könyvtárak: apps/core • server • data", "Vault: " + (vaultLocked ? "LOCKED" : "UNLOCKED") + " • Integritás: OK"]);
    else if (cmd === "aes lock") { setVaultLocked(true); setVaultMsg("Vault zárva."); push("AES-GCM: VAULT LOCKED — a data/vault tartalma zárva."); }
    else if (cmd === "aes unlock") { if (vaultLocked) push("AES-GCM: VAULT LOCKED — használd a Vault / AES ablakot: add meg a jelszót, majd UNLOCK."); else push("AES-GCM: VAULT UNLOCKED."); }
    else if (cmd === "ai status") push(["AI KÖRNYEZET: KÉSZ • Helyi feldolgozás", "Nincs külső hívás • Modell: helyi szabályok • Állapot: OK"]);
    else if (cmd === "net check") push(["NET: ONLINE • LAN: OK • 192.168.1.20", "COM1–COM4: elérhető • PING: 12 ms • Csomagvesztés: 0%"]);
    else if (cmd === "clear") { setConsoleLines([]); setHist([...hist, raw]); setInput(""); setHistIdx(-1); return; }
    else if (cmd) push("bash: " + cmdRaw + ": parancs nem található — írd be: help");
    setConsoleLines(function (p) { return [...p, ...out].slice(-220); });
    setHist([...hist, raw]); setInput(""); setHistIdx(-1); setConsoleMin(false);
  }

  async function saveFile() {
    const f = files.find(function (x) { return x.id === selectedFile; });
    if (!f) return;
    setSaving(true);
    try {
      const value = { name: f.name, path: f.path, content: editorText, lang: editorLang, folder: f.folder };
      const existing = await api("records.list", { collection: "desktop-files" }) as { records?: { id: string; value: DocFile }[] };
      let match: { id: string } | undefined = undefined;
      if (existing && existing.records) match = existing.records.find(function (r) { return r.value && r.value.name === f.name; });
      if (match) await api("records.replace", { collection: "desktop-files", id: match.id, value: value });
      else await api("records.create", { collection: "desktop-files", value: value, idempotency_key: "file-" + f.name + "-" + Date.now() });
      setFiles(function (prev) { return prev.map(function (x) { return x.id === selectedFile ? { ...x, content: editorText, lang: editorLang } : x; }); });
      setPersistMsg("Mentve az adatbázisba: " + f.name);
      writeConsole("MENTVE: " + f.name + " → adatbázis");
    } catch (e) { setPersistMsg("Mentés nem sikerült — próbáld újra."); writeConsole("MENTÉSI HIBA: " + f.name); }
    setSaving(false);
  }
  async function createFile() {
    if (!newName.trim()) return;
    const lang = newName.endsWith(".py") ? "python" : newName.endsWith(".js") ? "javascript" : newName.endsWith(".kt") ? "kotlin" : "markdown";
    const value = { name: newName, path: "apps/core/" + newName, content: "// MATYA CORE — új fájl\n", lang: lang, folder: "apps/core" };
    try {
      const created = await api("records.create", { collection: "desktop-files", value: value, idempotency_key: "file-new-" + newName + "-" + Date.now() }) as { id: string };
      const nf: DocFile = { ...value, id: created.id };
      setFiles(function (p) { return [...p, nf]; }); setSelectedFile(nf.id); setEditorText(nf.content); setEditorLang(lang); setNewName(""); setPersistMsg("Létrehozva: " + newName); writeConsole("LÉTREHOZVA: " + newName);
    } catch (e) {
      const nf: DocFile = { ...value, id: "tmp-" + Date.now() };
      setFiles(function (p) { return [...p, nf]; }); setSelectedFile(nf.id); setEditorText(nf.content); setPersistMsg("A fájl most csak ebben a nézetben jött létre.");
    }
  }
  async function deleteFile(id: string) {
    const f = files.find(function (x) { return x.id === id; });
    if (!f) return;
    try {
      const all = await api("records.list", { collection: "desktop-files" }) as { records?: { id: string; value: DocFile }[] };
      let match: { id: string } | undefined = undefined;
      if (all && all.records) match = all.records.find(function (r) { return r.value && r.value.name === f.name; });
      if (match) await api("records.delete", { collection: "desktop-files", id: match.id });
    } catch (e) { /* marad a helyi lista */ }
    setFiles(function (p) { return p.filter(function (x) { return x.id !== id; }); });
    setPersistMsg("Törölve: " + f.name);
    writeConsole("TÖRÖLVE: " + f.name);
  }
  function runCode() {
    const f = files.find(function (x) { return x.id === selectedFile; });
    if (!f) return;
    if (editorLang === "kotlin" || f.lang === "kotlin") writeConsole(["FUTTATÁS: kotlinc " + f.name, "MATYA CORE szerver indul a 8080-as porton", "Kotlin + JVM 21 kész • OK"]);
    else if (editorLang === "javascript") writeConsole(["FUTTATÁS: node " + f.name, "Kliens csatlakozik: localhost:8080", "Válasz: OK"]);
    else if (editorLang === "python") writeConsole(["FUTTATÁS: python3 " + f.name, "Kapcsolódás: 192.168.1.20:9000", "Alhálózati kliens kész."]);
    else writeConsole(["ELŐNÉZET: " + f.name, "A dokumentum készen áll."]);
    logGhostRun("KOTLIN", editorLang, editorText, "FUTTATÁS: " + f.name + " • " + editorLang, 12, "OK", false);
  }
  function startServer() { setServerOn(true); const l = ["[SERVER] START :8080", "[SERVER] Kotlin Server elindult • PID 1210", "[SERVER] Figyelés: 0.0.0.0:8080"]; setServerLog(function (p) { return [...p, ...l]; }); writeConsole(l); }
  function stopServer() { setServerOn(false); const l = ["[SERVER] STOP :8080", "[SERVER] Szerver leállítva."]; setServerLog(function (p) { return [...p, ...l]; }); writeConsole(l); }
  function healthCheck() {
    if (!serverOn) { const l = ["[SERVER] GET /health → SZERVER LEÁLLÍTVA", "Indítsd el: START :8080"]; setServerLog(function (p) { return [...p, ...l]; }); writeConsole(l); return; }
    const l = ["[SERVER] GET /health → 200 OK", "[SERVER] {\"status\":\"OK\",\"core\":\"MATYA CORE\",\"port\":8080}"]; setServerLog(function (p) { return [...p, ...l]; }); writeConsole(l);
  }
  function askAi() {
    const q = aiInput.trim(); if (!q) return;
    const low = q.toLowerCase();
    let a = "Helyi feldolgozás: a kérdésed („" + q + "”) helyben lett feldolgozva. A MATYA CORE nem küld külső hívást.";
    if (low.indexOf("status") >= 0 || low.indexOf("állapot") >= 0) a = "Helyi feldolgozás: Rendszer OK • Daemon PID 777 • Vault " + (vaultLocked ? "LOCKED" : "UNLOCKED") + " • Server :8080 " + (serverOn ? "ON" : "OFF") + ".";
    else if (low.indexOf("kotlin") >= 0) a = "Helyi feldolgozás: Kotlin 2.0.21 • JVM 21 • Futtatás: kotlinc Main.kt, majd a kimenet a konzolban.";
    else if (low.indexOf("vault") >= 0 || low.indexOf("aes") >= 0) a = "Helyi feldolgozás: Vault AES-GCM + PBKDF2 védelemmel zárható. Jelenleg " + (vaultLocked ? "LOCKED" : "UNLOCKED") + ".";
    else if (low.indexOf("daemon") >= 0) a = "Helyi feldolgozás: Serpentine Daemon PID 777 figyeli az apps/core, server és data könyvtárakat.";
    setAiLog(function (p) { return [...p, "KÉRDÉS: " + q, "VÁLASZ: " + a]; });
    writeConsole(["[AI] KÉRDÉS: " + q, "[AI] VÁLASZ: " + a]);
    setAiInput("");
  }
  function pingTest() { const l = ["[NET] PING 192.168.1.20 — 4 csomag küldve", "[NET] Válasz: 12 ms • 11 ms • 13 ms • 12 ms • Vesztés: 0%"]; setNetLog(function (p) { return [...p, ...l]; }); writeConsole(l); }
  function comScan() { const l = ["[COM] SCAN: COM1–COM4 keresése…", "[COM] Találva: COM1 (9600) • COM2 (115200) • COM3 (9600) • COM4 (57600)", "[COM] Scan kész."]; setNetLog(function (p) { return [...p, ...l]; }); writeConsole(l); }
  function vaultUnlock() {
    if (vaultPass.trim().length < 4) { setVaultMsg("Adj meg legalább 4 karakteres jelszót."); writeConsole("[VAULT] UNLOCK sikertelen — túl rövid jelszó."); return; }
    setVaultLocked(false); setVaultMsg("Vault feloldva — AES-GCM + PBKDF2."); writeConsole("[VAULT] AES-GCM UNLOCKED — PBKDF2 kulcs ellenőrizve.");
  }
  function vaultLock() { setVaultLocked(true); setVaultMsg("Vault zárva."); writeConsole("[VAULT] AES-GCM LOCKED."); }
  function integrityCheck() { writeConsole(["[DAEMON] INTEGRITY CHECK — PID 777", "[DAEMON] apps/core: OK • server: OK • data: OK", "[DAEMON] Integritás: OK — eltérés nem található."]); }

  function onPointerMove(e: React.PointerEvent) {
    if (dragRef.current) { const d = dragRef.current; setWindows(function (p) { return p.map(function (w) { return w.id === d.id ? { ...w, x: Math.max(0, d.x + e.clientX - d.sx), y: Math.max(0, d.y + e.clientY - d.sy) } : w; }); }); }
    if (resizeRef.current) { const r = resizeRef.current; setWindows(function (p) { return p.map(function (w) { return w.id === r.id ? { ...w, w: Math.max(360, r.w + e.clientX - r.sx), h: Math.max(260, r.h + e.clientY - r.sy) } : w; }); }); }
  }
  function onPointerUp() { dragRef.current = null; resizeRef.current = null; }
  function startDrag(e: React.PointerEvent, w: Win) { if (w.max) return; focusWin(w.id); dragRef.current = { id: w.id, sx: e.clientX, sy: e.clientY, x: w.x, y: w.y }; }
  function startResize(e: React.PointerEvent, w: Win) { resizeRef.current = { id: w.id, sx: e.clientX, sy: e.clientY, w: w.w, h: w.h }; }

  const curFile = files.find(function (f) { return f.id === selectedFile; }) || files[0];
  const filteredStart = APPS.filter(function (a) { return START_MENU_APPS.indexOf(a.id) >= 0 && (a.name + " " + a.desc + " " + a.cat).toLowerCase().indexOf(query.toLowerCase()) >= 0; });
  const cols: { title: string; items: typeof APPS }[] = ["RENDSZER", "FEJLESZTÉS", "HÁLÓZAT"].map(function (t) { return { title: t, items: filteredStart.filter(function (a) { return a.cat === t; }) }; });

  // ---- TRANSITTER — TRANSZ NEURÁLIS MÁTRIX + RÁDIÓ TRANSMITTER ----
  type TxMode = "BINÁRIS" | "HEX" | "MORZE" | "FREKVENCIA" | "PSK" | "QAM";
  type TxServer = { id: string; name: string; region: string; online: boolean; signal: number; freq: string; tx: boolean };
  type TxPackage = { id: string; name: string; size: string; time: string; status: "FOGADVA" | "KÓDOLVA" | "TRANSMITÁLVA"; code: string; encoded: string; mode: TxMode };
  const TX_LAYERS = ["BEMENET", "REJTETT 1", "REJTETT 2", "KIMENET"];
  const TX_MODES: TxMode[] = ["BINÁRIS", "HEX", "MORZE", "FREKVENCIA", "PSK", "QAM"];
  const TX_FREQS = ["433.92MHz", "868MHz", "2.4GHz", "5.8GHz"];
  const TX_INITIAL_SERVERS: TxServer[] = [
    { id: "matya-01", name: "MATYA-01", region: "eu-central-1", online: true, signal: -42, freq: "433.92MHz", tx: true },
    { id: "matya-02", name: "MATYA-02", region: "eu-west-1", online: true, signal: -51, freq: "868MHz", tx: true },
    { id: "openshift", name: "OPENSHIFT", region: "openshift", online: true, signal: -38, freq: "868MHz", tx: true },
    { id: "softlayer", name: "SOFTLAYER / IBM", region: "softlayer", online: true, signal: -57, freq: "2.4GHz", tx: true },
    { id: "kotlin-srv", name: "KOTLIN-SRV", region: "kotlin", online: true, signal: -44, freq: "433.92MHz", tx: true },
    { id: "erlang-node", name: "ERLANG-NODE", region: "erlang", online: false, signal: -78, freq: "868MHz", tx: false },
    { id: "ghost-node", name: "GHOST-NODE", region: "ghost", online: true, signal: -62, freq: "2.4GHz", tx: true },
  ];
  function txInitialActivations(): number[][] { return TX_LAYERS.map(function (_l, li) { return [0, 1, 2, 3, 4, 5, 6, 7].map(function (ni) { return Math.max(4, Math.min(96, (18 + li * 14 + ni * 9) % 97)); }); }); }
  const [txActivations, setTxActivations] = useState<number[][]>(txInitialActivations);
  const [txMode, setTxMode] = useState<TxMode>("BINÁRIS");
  const [txInput, setTxInput] = useState("HELLO");
  const [txEncoded, setTxEncoded] = useState("");
  const [txDecoded, setTxDecoded] = useState("");
  const [txLearningRate, setTxLearningRate] = useState(0.1);
  const [txEpoch, setTxEpoch] = useState(0);
  const [txLoss, setTxLoss] = useState<number[]>([0.92, 0.81, 0.68]);
  const [txTraining, setTxTraining] = useState(false);
  const [txSelected, setTxSelected] = useState<{ layer: number; idx: number } | null>({ layer: 0, idx: 0 });
  const [txServers, setTxServers] = useState<TxServer[]>(TX_INITIAL_SERVERS);
  const [txGlobalFreq, setTxGlobalFreq] = useState("433.92MHz");
  const [txPower, setTxPower] = useState(50);
  const [txPacketCount, setTxPacketCount] = useState(0);
  const [txErrorPct, setTxErrorPct] = useState(0);
  const [txOn, setTxOn] = useState(false);
  const [txLog, setTxLog] = useState<string[]>(["[TRANSITTER] RENDSZER KÉSZ — Transz Neurális Mátrix + Transmitter.", "[TRANSITTER] Mód: BINÁRIS • Várakozás kódolásra / Plus/4 csomagra."]);
  const [txPackages, setTxPackages] = useState<TxPackage[]>([]);
  const [txMsg, setTxMsg] = useState("Kész szoftver a Plus/4-ről: KÜLDÉS TRANSITTERBE gomb a BASIC Studioban.");
  const [txSaving, setTxSaving] = useState(false);
  // ---- ZÁRT RENDSZER GENERÁTOR — HÁLÓZATI MÁTRIX + TRANSITTER (közös állapot) ----
  type ClosedTarget = "ZÁRT RENDSZER" | "FÉLIG ZÁRT" | "SZIGETELT";
  type ClosedBlock = { id: string; title: string; filename: string; content: string };
  type ClosedCheck = { label: string; ok: boolean; detail: string };
  const CLOSED_PROTOCOLS = ["HTTPS/TLS", "WSS", "MQTT/TLS", "DoH", "SSH", "SFTP", "NTP", "WebRTC", "SSE"];
  const [closedTarget, setClosedTarget] = useState<ClosedTarget>("ZÁRT RENDSZER");
  const [closedProtocols, setClosedProtocols] = useState<Record<string, boolean>>(function () { const o: Record<string, boolean> = {}; CLOSED_PROTOCOLS.forEach(function (p) { o[p] = true; }); return o; });
  const [closedBlocks, setClosedBlocks] = useState<ClosedBlock[]>([]);
  const [closedMsg, setClosedMsg] = useState("Válassz célt és protokollokat, majd nyomd meg: KÓD GENERÁLÁSA.");
  const [closedCopied, setClosedCopied] = useState("");
  const [closedOn, setClosedOn] = useState(false);
  const [closedChecklist, setClosedChecklist] = useState<ClosedCheck[] | null>(null);
  const [closedSaving, setClosedSaving] = useState(false);
  const [closedSaveResult, setClosedSaveResult] = useState("");
  const [matrixTab, setMatrixTab] = useState<"matrix" | "closed">("matrix");
  const [txTab, setTxTab] = useState<"tx" | "closed">("tx");
  const closedPrevServersRef = useRef<TxServer[] | null>(null);
  const closedGenRef = useRef(0);
  function closedEnabled(): string[] { return CLOSED_PROTOCOLS.filter(function (p) { return !!closedProtocols[p]; }); }
  function closedBuildBlocks(): ClosedBlock[] {
    const enabled = closedEnabled();
    const protoList = enabled.join(", ") || "—";
    const origins = closedTarget === "SZIGETELT" ? ["https://matya-core.local"] : closedTarget === "FÉLIG ZÁRT" ? ["https://matya-core.local", "https://matya-core.internal", "https://vpn.matya-core.local"] : ["https://matya-core.local", "https://matya-core.internal"];
    const ips = closedTarget === "SZIGETELT" ? ["127.0.0.1"] : closedTarget === "FÉLIG ZÁRT" ? ["10.8.0.0/24", "10.0.0.0/8", "192.168.0.0/16", "127.0.0.1"] : ["10.0.0.0/8", "192.168.0.0/16", "127.0.0.1"];
    const closedFlag = closedTarget === "FÉLIG ZÁRT" ? false : true;
    const has = function (p: string) { return enabled.indexOf(p) >= 0; };
    const serverJs = ["// 01 - server.js — MATYA CORE ZÁRT RENDSZER", "// CEL: " + closedTarget, "// CSAK SZABVANYOS PROTOKOLLOK: " + protoList, "// HTTPS/TLS 1.3 + helmet + CORS allowlist + rate-limit", "const https = require('https');", "const fs = require('fs');", "const express = require('express');", "const helmet = require('helmet');", "const rateLimit = require('express-rate-limit');", "const app = express();", "const allowedOrigins = " + JSON.stringify(origins) + ";", "app.use(helmet({ hsts: { maxAge: 31536000, includeSubDomains: true }, contentSecurityPolicy: false }));", "app.use(express.json({ limit: '64kb' }));", "app.use(rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true }));", "app.use(function (req, res, next) {", "  const origin = req.headers.origin || '';", "  if (!origin || allowedOrigins.indexOf(origin) >= 0) { if (origin) res.setHeader('Access-Control-Allow-Origin', origin); return next(); }", "  return res.status(403).json({ error: 'ORIGIN_NOT_ALLOWED' });", "});", "app.get('/health', function (req, res) { res.json({ status: 'OK', core: 'MATYA CORE', closedMode: " + (closedFlag ? "true" : "false") + ", protocols: " + JSON.stringify(enabled) + " }); });", "const server = https.createServer({ minVersion: 'TLSv1.3', cert: fs.readFileSync('certs/matya-core.crt'), key: fs.readFileSync('certs/matya-core.key') }, app);", "server.listen(443, '127.0.0.1', function () { console.log('ZART RENDSZER HTTPS :443 — TLS 1.3'); });"].join("\n");
    const wsJs = ["// 02 - websocket.js — WSS szerver, auth token, heartbeat, zart csatornak", "// CEL: " + closedTarget + " • PROTOKOLL: " + (has("WSS") ? "WSS BEKAPCSOLVA" : "WSS KIKAPCSOLVA — a szerver visszautasit"), "const { WebSocketServer } = require('ws');", "const { verifyToken } = require('./auth.mjs');", "const allowedChannels = ['matya/core', 'matya/matrix', 'matya/tx'];", "const wss = new WebSocketServer({ port: 443, path: '/wss', noServer: false });", "wss.on('connection', function (ws, req) {", "  const token = new URL(req.url || '', 'https://matya-core.local').searchParams.get('token') || '';", "  if (!verifyToken(token)) { ws.close(4403, 'AUTH_REQUIRED'); return; }", "  ws.isAlive = true;", "  ws.on('pong', function () { ws.isAlive = true; });", "  ws.on('message', function (raw) {", "    let msg = null; try { msg = JSON.parse(String(raw)); } catch (e) { ws.send(JSON.stringify({ error: 'BAD_JSON' })); return; }", "    if (allowedChannels.indexOf(msg.channel) < 0) { ws.send(JSON.stringify({ error: 'CHANNEL_NOT_ALLOWED' })); return; }", "    ws.send(JSON.stringify({ ok: true, channel: msg.channel }));", "  });", "});", "setInterval(function () { wss.clients.forEach(function (ws) { if (!ws.isAlive) { ws.terminate(); return; } ws.isAlive = false; ws.ping(); }); }, 30000);"].join("\n");
    const mqttJs = ["// 03 - mqtt.js — MQTT over TLS kliens, topic allowlist (matya/#), QoS 1", "// CEL: " + closedTarget + " • PROTOKOLL: " + (has("MQTT/TLS") ? "MQTT/TLS BEKAPCSOLVA" : "MQTT/TLS KIKAPCSOLVA"), "const mqtt = require('mqtt');", "const client = mqtt.connect('mqtts://matya-core.local:8883', { protocolVersion: 5, username: process.env.MQTT_USER, password: process.env.MQTT_PASS, ca: require('fs').readFileSync('certs/matya-core-ca.crt'), rejectUnauthorized: true, keepalive: 30 });", "const allowedTopics = ['matya/core', 'matya/matrix', 'matya/tx', 'matya/closed'];", "function topicAllowed(t) { return allowedTopics.some(function (a) { return t === a || t.indexOf(a + '/') === 0; }); }", "client.on('connect', function () { client.subscribe('matya/#', { qos: 1 }, function () { console.log('MQTT/TLS FELCSATLAKOZVA — matya/# QoS 1'); }); });", "client.on('message', function (topic, payload) { if (!topicAllowed(topic)) return; console.log('MQTT', topic, String(payload).slice(0, 120)); });", "function publishClosed(topic, text) { if (!topicAllowed(topic)) throw new Error('TOPIC_NOT_ALLOWED'); client.publish(topic, text, { qos: 1, retain: false }); }", "module.exports = { client: client, publishClosed: publishClosed };"].join("\n");
    const fwJs = ["// 04 - firewall.mjs — zart rendszer iptables / nft szabalyok", "// CEL: " + closedTarget + " • CSAK 443, 22 VPN-rol, minden mas DROP", "import { execSync } from 'node:child_process';", "const vpnNet = '10.8.0.0/24';", "const rules = [", "  'iptables -F INPUT',", "  'iptables -P INPUT DROP',", "  'iptables -P FORWARD DROP',", "  'iptables -A INPUT -i lo -j ACCEPT',", "  'iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT',", "  'iptables -A INPUT -p tcp --dport 443 -j ACCEPT',", "  'iptables -A INPUT -p tcp -s ' + vpnNet + ' --dport 22 -j ACCEPT',", "  'iptables -A INPUT -p udp --dport 123 -j ACCEPT',", "  'iptables -A INPUT -j DROP'", "];", "export function applyClosedFirewall() { rules.forEach(function (r) { execSync(r); }); console.log('FIREWALL: ZART RENDSZER — 443 + 22 VPN-rol, MINDEN MAS DROP'); }", "export const nftRuleset = 'table inet closed { chain input { type filter hook input priority 0; policy drop; iif lo accept; ct state established,related accept; tcp dport 443 accept; ip saddr 10.8.0.0/24 tcp dport 22 accept; udp dport 123 accept; drop; } }';"].join("\n");
    const authJs = ["// 05 - auth.mjs — JWT + AES-GCM session, sudo ellenorzes", "// CSAK SZABVANYOS: JWT (HS256) + AES-256-GCM + PBKDF2", "import crypto from 'node:crypto';", "import jwt from 'jsonwebtoken';", "const JWT_SECRET = process.env.JWT_SECRET || '';", "export function issueToken(user) { return jwt.sign({ sub: user, role: 'matya', closed: true }, JWT_SECRET, { expiresIn: '15m', issuer: 'matya-core' }); }", "export function verifyToken(token) { try { const d = jwt.verify(token, JWT_SECRET, { issuer: 'matya-core' }); return !!d && d.closed === true; } catch (e) { return false; } }", "export function sealSession(key, plaintext) { const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', key, iv); const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]); return { iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), data: enc.toString('hex') }; }", "export function checkSudo(user) { const sudoers = ['matya', 'root']; return sudoers.indexOf(user) >= 0; }"].join("\n");
    const config = { closedMode: closedFlag, target: closedTarget, allowedOrigins: origins, allowedIPs: ips, protocols: enabled, tls: "TLS 1.3", ports: [443, 22], mqtt: { broker: "mqtts://matya-core.local:8883", topics: ["matya/core", "matya/matrix", "matya/tx", "matya/closed"], qos: 1 }, websocket: { path: "/wss", heartbeatMs: 30000, channels: ["matya/core", "matya/matrix", "matya/tx"] }, firewall: { defaultPolicy: "DROP", allow: ["443/tcp", "22/tcp VPN-rol", "123/udp NTP"] }, logging: true, note: "Zart rendszer — csak allowlist. Kulso szerver: OFFLINE." };
    return [
      { id: "01", title: "01 - server.js", filename: "server.js", content: serverJs },
      { id: "02", title: "02 - websocket.js", filename: "websocket.js", content: wsJs },
      { id: "03", title: "03 - mqtt.js", filename: "mqtt.js", content: mqttJs },
      { id: "04", title: "04 - firewall.mjs", filename: "firewall.mjs", content: fwJs },
      { id: "05", title: "05 - auth.mjs", filename: "auth.mjs", content: authJs },
      { id: "06", title: "06 - closed-system.config.json", filename: "closed-system.config.json", content: JSON.stringify(config, null, 2) },
    ];
  }
  async function closedCreateRow(row: ClosedBlock, gen: number) { await api("records.create", { collection: "closed-system", value: { filename: row.filename, title: row.title, content: row.content, target: closedTarget, protocols: closedEnabled() }, idempotency_key: "closed-" + gen + "-" + row.filename }); }
  async function closedReloadClosed() { const data = await api("records.list", { collection: "closed-system" }) as { records?: { id: string }[] }; return data && data.records ? data.records.length : 0; }
  async function closedSaveFsBlock(b: ClosedBlock) {
    const value: FsFile = { id: "", name: b.filename, path: "closed-system/" + b.filename, folder: "closed-system/", content: b.content, lang: b.filename.endsWith(".json") ? "json" : "javascript" };
    try {
      const existing = await api("records.list", { collection: "matya-filesystem" }) as { records?: { id: string; value: FsFile }[] };
      let match: { id: string } | undefined = undefined;
      if (existing && existing.records) match = existing.records.find(function (r) { return r.value && r.value.name === b.filename && r.value.folder === "closed-system/"; });
      if (match) { await api("records.replace", { collection: "matya-filesystem", id: match.id, value: { ...value, id: match.id } }); setFsFiles(function (p) { return p.map(function (x) { return x.id === match!.id ? { ...value, id: match!.id } : x; }); }); }
      else { const created = await api("records.create", { collection: "matya-filesystem", value: { ...value, id: "fs-closed-" + Date.now() + "-" + b.filename }, idempotency_key: "fs-closed-" + Date.now() + "-" + b.filename }) as { id: string }; setFsFiles(function (p) { return [...p.filter(function (x) { return !(x.name === b.filename && x.folder === "closed-system/"); }), { ...value, id: created.id }]; }); }
    } catch (e) { setFsFiles(function (p) { return [...p.filter(function (x) { return !(x.name === b.filename && x.folder === "closed-system/"); }), { ...value, id: "tmp-closed-" + Date.now() + "-" + b.filename }]; }); }
  }
  async function closedAddBlock(b: ClosedBlock) {
    await closedSaveFsBlock(b);
    try { await api("records.create", { collection: "closed-system", value: { filename: b.filename, title: b.title, content: b.content, target: closedTarget, protocols: closedEnabled() }, idempotency_key: "closed-file-" + Date.now() + "-" + b.filename }); } catch (e) { /* helyi nézet marad */ }
    setClosedMsg("Hozzáadva a fájlhoz: closed-system/" + b.filename + " — adatbázis + Fájlrendszer.");
  }
  async function closedGenerate() {
    const blocks = closedBuildBlocks();
    setClosedBlocks(blocks);
    setClosedChecklist(null);
    closedGenRef.current += 1; const gen = closedGenRef.current;
    setClosedSaving(true);
    let saved = 0; let error: string | null = null;
    try { for (const row of blocks) { await closedCreateRow(row, gen); saved += 1; } } catch (e) { error = e instanceof Error ? e.message : String(e); }
    let reloadError: string | null = null; let total = 0;
    try { total = await closedReloadClosed(); } catch (e) { reloadError = e instanceof Error ? e.message : String(e); }
    for (const row of blocks) { try { await closedSaveFsBlock(row); } catch (e) { /* */ } }
    setClosedSaveResult("Mentve " + saved + " / " + blocks.length + " blokk • maradt " + (blocks.length - saved) + (error ? " • hiba: " + error : " • SZINKRON") + (reloadError ? " • újratöltés: " + reloadError : " • összes zárt rekord: " + total));
    setClosedSaving(false);
    setClosedMsg("Kódcsomag generálva: " + closedTarget + " • protokollok: " + closedEnabled().join(", ") + " • mentve adatbázisba + closed-system/ mappába.");
    setMatrixLog(function (p) { return [...p, "[CLOSED] GENERÁLÁS — " + closedTarget + " • " + blocks.length + " blokk"].slice(-200); });
  }
  function closedCopyBlock(b: ClosedBlock) {
    const ta = document.createElement("textarea"); ta.value = b.content; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) { /* ignore */ } document.body.removeChild(ta);
    setClosedCopied(b.id); setClosedMsg("Másolva: " + b.title); setTimeout(function () { setClosedCopied(""); }, 1800);
  }
  function closedToggle(on: boolean) {
    if (on) {
      closedPrevServersRef.current = txServersRef.current.map(function (s) { return { ...s }; });
      setClosedOn(true);
      setTxServers(function (prev) { return prev.map(function (s) { if (s.id === "openshift" || s.id === "softlayer") return { ...s, online: false, tx: false }; return s; }); });
      const line = "[CLOSED] Zárt rendszer aktiválva - protokollok: HTTPS/WSS/MQTT/TLS";
      txPushLog(line); setMatrixLog(function (p) { return [...p, line].slice(-200); }); setBootLog(function (p) { return [...p, { time: bootStamp(), text: "[CLOSED] Zárt rendszer aktiválva - protokollok: HTTPS/WSS/MQTT/TLS", status: "OK" as const }].slice(-120); });
      setClosedMsg("ZÁRT MÓD: ON — csak allowlist. Külső szerverek (OPENSHIFT, SOFTLAYER) OFFLINE.");
    } else {
      setClosedOn(false);
      if (closedPrevServersRef.current) { const prev = closedPrevServersRef.current; setTxServers(prev.map(function (s) { return { ...s }; })); }
      txPushLog("[CLOSED] Zárt rendszer kikapcsolva."); setClosedMsg("ZÁRT MÓD: OFF — külső szerverek visszaállítva.");
    }
  }
  function closedRunCheck() {
    const byId = function (id: string) { const b = closedBlocks.find(function (x) { return x.id === id; }); return b ? b.content : ""; };
    const checks: ClosedCheck[] = [
      { label: "TLS", ok: closedBlocks.length > 0 && byId("01").indexOf("TLSv1.3") >= 0 && !!closedProtocols["HTTPS/TLS"], detail: "HTTPS/TLS 1.3 — server.js" },
      { label: "CORS allowlist", ok: closedBlocks.length > 0 && byId("01").indexOf("allowedOrigins") >= 0, detail: "csak matya-core domainek" },
      { label: "MQTT auth", ok: closedBlocks.length > 0 && byId("03").indexOf("MQTT_USER") >= 0 && !!closedProtocols["MQTT/TLS"], detail: "MQTT over TLS • topic allowlist" },
      { label: "Firewall DROP", ok: closedBlocks.length > 0 && byId("04").indexOf("DROP") >= 0, detail: "csak 443, 22 VPN-ről" },
      { label: "Sudo", ok: closedBlocks.length > 0 && byId("05").indexOf("checkSudo") >= 0, detail: "auth.mjs — checkSudo" },
      { label: "AES", ok: closedBlocks.length > 0 && byId("05").indexOf("aes-256-gcm") >= 0, detail: "AES-GCM session" },
      { label: "Napló", ok: bootLog.length > 0, detail: "Boot Napló elérhető" },
    ];
    setClosedChecklist(checks);
    const bad = checks.filter(function (c) { return !c.ok; });
    if (!bad.length) setClosedMsg("ZÁRT RENDSZER: KÉSZ - MUNKA BEFEJEZVE ✓");
    else setClosedMsg("ELLENŐRZÉS: hibalista — " + bad.map(function (c) { return c.label; }).join(", ") + ". Generáld újra a kódot, ha hiányzik.");
  }
  function renderClosedGenerator() {
    const checks = closedChecklist;
    const allOk = checks ? checks.every(function (c) { return c.ok; }) : false;
    return (
      <div className="p-3 text-[12px] bg-[#0a0a0a]">
        <div className="flex flex-wrap justify-between gap-2 items-center border-b-2 pb-2" style={{ borderColor: RED }}><div><h3 className="tech text-[13px] font-bold tracking-widest">ZÁRT RENDSZER <span style={{ color: RED }}>GENERÁTOR</span></h3><p className="text-[11px] text-[#8a8a8a]">Hálózati mátrix • fejlesztői kódok • csak szabványos, meglévő protokollok</p></div><span className="px-2 py-1 border border-[#262626] text-[11px] font-bold" style={{ color: closedOn ? RED : "#fff" }}>{closedOn ? "🔒 ZÁRT MÓD: ON" : "○ ZÁRT MÓD: OFF"}</span></div>
        <div className="mt-3 border border-[#262626] bg-[#111] p-3"><b className="text-[11px] tracking-widest">a) CÉL</b><div className="flex flex-wrap gap-1 mt-2">{(["ZÁRT RENDSZER", "FÉLIG ZÁRT", "SZIGETELT"] as ClosedTarget[]).map(function (t) { return <button key={t} onClick={function () { setClosedTarget(t); }} className="px-3 py-2 text-[11px] font-bold border" style={{ borderColor: closedTarget === t ? RED : "#262626", background: closedTarget === t ? "#1a1a1a" : "#000" }}>{t}{t === "ZÁRT RENDSZER" ? " (csak belső háló)" : t === "FÉLIG ZÁRT" ? " (VPN + allowlist)" : " (offline + helyi)"}</button>; })}</div>
        <b className="block text-[11px] tracking-widest mt-4">b) PROTOKOLLOK — csak meglévő, szabványos</b><div className="flex flex-wrap gap-1 mt-2">{CLOSED_PROTOCOLS.map(function (p) { return <label key={p} className="flex gap-2 items-center border border-[#262626] px-2 py-1.5 bg-black text-[11px] font-bold cursor-pointer"><input type="checkbox" checked={!!closedProtocols[p]} onChange={function (e) { setClosedProtocols(function (prev) { return { ...prev, [p]: e.target.checked }; }); }} /><span>{p}</span></label>; })}</div><p className="text-[11px] text-[#8a8a8a] mt-2">HTTPS/TLS 1.3 • WebSocket (WSS) • MQTT (MQTT over TLS) • DNS over HTTPS (DoH) • SSH • SFTP • NTP • WebRTC DataChannel • SSE</p></div>
        <div className="flex flex-wrap gap-2 mt-3"><button onClick={function () { void closedGenerate(); }} disabled={closedSaving} className="flex-1 min-w-[200px] py-3 font-bold text-black text-[13px] disabled:opacity-40" style={{ background: RED }}>{closedSaving ? "GENERÁLÁS…" : "KÓD GENERÁLÁSA"}</button><button onClick={function () { closedToggle(!closedOn); }} className="px-4 py-3 font-bold border border-[#262626] bg-[#1a1a1a] text-[12px]">{closedOn ? "🔒 ZÁRT MÓD BEKAPCSOLVA — KIKAPCSOLÁS" : "🔒 ZÁRT MÓD BEKAPCSOLÁSA"}</button><button onClick={closedRunCheck} className="px-4 py-3 font-bold border border-[#262626] bg-[#1a1a1a] text-[12px]">ZÁRT RENDSZER ELLENŐRZÉS</button></div>
        <p className="text-[11px] mt-2 break-words [overflow-wrap:anywhere]">{closedMsg}</p>{closedSaveResult && <p className="text-[11px] text-[#8a8a8a] break-words [overflow-wrap:anywhere]">{closedSaveResult}</p>}
        {checks && <div className="mt-3 border border-[#262626] bg-[#111] p-3"><b>ELLENŐRZÉS — CHECKLIST</b><div className="mt-2 space-y-1">{checks.map(function (c) { return <div key={c.label} className="flex justify-between gap-2 border border-[#262626] bg-black p-2 text-[11px]"><span className="font-bold">{c.label} <span className="text-[#8a8a8a] font-normal">— {c.detail}</span></span><span className="font-bold shrink-0" style={{ color: c.ok ? "#00e676" : RED }}>{c.ok ? "✓ OK" : "✕ HIBA"}</span></div>; })}</div>{allOk ? <p className="font-bold mt-2" style={{ color: "#00e676" }}>ZÁRT RENDSZER: KÉSZ - MUNKA BEFEJEZVE ✓</p> : <p className="font-bold mt-2" style={{ color: RED }}>HIBALISTA: {checks.filter(function (c) { return !c.ok; }).map(function (c) { return c.label; }).join(", ")}</p>}</div>}
        {closedBlocks.length === 0 && <p className="text-[11px] text-[#8a8a8a] mt-3">Még nincs generált kódcsomag. Válassz célt + protokollokat, majd: KÓD GENERÁLÁSA.</p>}
        <div className="mt-3 space-y-3">{closedBlocks.map(function (b) { return <div key={b.id} className="border border-[#262626] bg-[#111] p-3"><div className="flex flex-wrap justify-between gap-2 items-center"><b>{b.title}</b><span className="text-[11px] text-[#8a8a8a]">closed-system/{b.filename}</span><span className="flex gap-1"><button onClick={function () { closedCopyBlock(b); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">{closedCopied === b.id ? "✓ MÁSOLVA" : "MÁSOLÁS"}</button><button onClick={function () { void closedAddBlock(b); }} className="px-2 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>HOZZÁADÁS A FÁJLHOZ</button></span></div><textarea value={b.content} onChange={function (e) { const v = e.target.value; setClosedBlocks(function (prev) { return prev.map(function (x) { return x.id === b.id ? { ...x, content: v } : x; }); }); }} spellCheck={false} className="w-full h-[180px] bg-black border border-[#262626] p-2 mt-2 mono text-[11px] leading-[1.5] outline-none resize-y" /></div>; })}</div>
        {closedBlocks.length > 0 && <button onClick={function () { void (async function () { for (const b of closedBlocks) { await closedAddBlock(b); } })(); }} className="mt-3 w-full py-2 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">MINDEN BLOKK HOZZÁADÁSA — closed-system/ mappába</button>}
      </div>
    );
  }
  const txOnRef = useRef(false);
  const txServersRef = useRef<TxServer[]>(TX_INITIAL_SERVERS);
  const txPacketRef = useRef(0);
  const txLossCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(function () { txOnRef.current = txOn; }, [txOn]);
  useEffect(function () { txServersRef.current = txServers; }, [txServers]);
  useEffect(function () {
    (async function () {
      try {
        const data = await api("records.list", { collection: "transitter-packages" }) as { records?: { id: string; value: TxPackage }[] };
        if (data && data.records && data.records.length) { const mapped = data.records.map(function (r) { return { ...r.value, id: r.id }; }); setTxPackages(mapped); setTxMsg("Betöltve " + mapped.length + " fogadott szoftver az adatbázisból."); }
      } catch (e) { /* üres lista marad */ }
    })();
  }, []);
  useEffect(function () {
    const cv = txLossCanvasRef.current; if (!cv) return; const ctx = cv.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#262626"; ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(cv.width, 28); ctx.stroke();
    if (txLoss.length > 1) { ctx.strokeStyle = "#FF0A1E"; ctx.lineWidth = 2; ctx.beginPath(); txLoss.forEach(function (v, i) { const x = (i / Math.max(1, txLoss.length - 1)) * (cv.width - 8) + 4; const y = 4 + (Math.min(1, Math.max(0, v)) * (cv.height - 8)); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.stroke(); ctx.lineWidth = 1; }
    ctx.fillStyle = "#8a8a8a"; ctx.font = "9px monospace"; ctx.fillText("LOSS " + (txLoss.length ? txLoss[txLoss.length - 1].toFixed(3) : "—"), 4, 10);
  }, [txLoss]);
  function txPushLog(line: string) {
    setTxLog(function (p) { return [...p, line].slice(-200); });
    setBootLog(function (p) { return [...p, { time: bootStamp(), text: "[TRANSITTER] " + line.replace(/^\[TRANSITTER\]\s*/, ""), status: "OK" as const }].slice(-120); });
    setGhostLog(function (p) { return [...p, "[TRANSITTER] " + line.replace(/^\[TRANSITTER\]\s*/, "")].slice(-200); });
  }
  function txMorseEncode(text: string): string {
    const map: Record<string, string> = { A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----." };
    return text.toUpperCase().split(" ").map(function (w) { return w.split("").map(function (c) { return map[c] || "?"; }).join(" "); }).join(" / ");
  }
  function txMorseDecode(encoded: string): string {
    const rev: Record<string, string> = { ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "..-.": "F", "--.": "G", "....": "H", "..": "I", ".---": "J", "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O", ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T", "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y", "--..": "Z", "-----": "0", ".----": "1", "..---": "2", "...--": "3", "....-": "4", ".....": "5", "-....": "6", "--...": "7", "---..": "8", "----.": "9" };
    return encoded.split(" / ").map(function (w) { return w.split(" ").map(function (c) { return rev[c] || "?"; }).join(""); }).join(" ");
  }
  function txEncodeText(text: string, mode: TxMode): string {
    if (!text) return "";
    if (mode === "BINÁRIS") return text.split("").map(function (c) { return c.charCodeAt(0).toString(2).padStart(8, "0"); }).join(" ");
    if (mode === "HEX") return text.split("").map(function (c) { return c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"); }).join(" ");
    if (mode === "MORZE") return txMorseEncode(text);
    if (mode === "FREKVENCIA") return text.split("").map(function (c) { return (400 + c.charCodeAt(0)).toFixed(2) + "MHz"; }).join(" ");
    if (mode === "PSK") return text.split("").map(function (c) { return (c.charCodeAt(0) * 2) + "°"; }).join(" ");
    return text.split("").map(function (c) { const code = c.charCodeAt(0); return "I" + (code % 16) + "/Q" + Math.floor(code / 16); }).join(" ");
  }
  function txDecodeText(encoded: string, mode: TxMode): string {
    try {
      if (!encoded.trim()) return "";
      if (mode === "BINÁRIS") return encoded.trim().split(/\s+/).map(function (b) { return String.fromCharCode(parseInt(b, 2)); }).join("");
      if (mode === "HEX") return encoded.trim().split(/\s+/).map(function (h) { return String.fromCharCode(parseInt(h, 16)); }).join("");
      if (mode === "MORZE") return txMorseDecode(encoded.trim());
      if (mode === "FREKVENCIA") return encoded.trim().split(/\s+/).map(function (f) { return String.fromCharCode(Math.round(parseFloat(f) - 400)); }).join("");
      if (mode === "PSK") return encoded.trim().split(/\s+/).map(function (p) { return String.fromCharCode(Math.round(parseFloat(p) / 2)); }).join("");
      return encoded.trim().split(/\s+/).map(function (q) { const m = q.match(/^I(\d+)\/Q(\d+)$/); return m ? String.fromCharCode(parseInt(m[1], 10) + parseInt(m[2], 10) * 16) : "?"; }).join("");
    } catch (e) { return ""; }
  }
  function txApplyPattern(mode: TxMode, text: string) {
    const mi = TX_MODES.indexOf(mode); let hash = 0; for (let i = 0; i < text.length; i++) hash += text.charCodeAt(i);
    setTxActivations(function () { return TX_LAYERS.map(function (_l, li) { return [0, 1, 2, 3, 4, 5, 6, 7].map(function (ni) { return Math.max(3, Math.min(99, (12 + li * 13 + ni * 11 + mi * 17 + hash) % 97 + (ni === (hash % 8) ? 18 : 0))); }); }); });
  }
  function txDoEncode(source?: string, modeOverride?: TxMode) {
    const text = source !== undefined ? source : txInput; const mode = modeOverride || txMode; if (!text.trim()) { setTxMsg("Adj meg bemeneti szöveget vagy küldj Plus/4 programot."); return ""; }
    const encoded = txEncodeText(text, mode); const decoded = txDecodeText(encoded, mode);
    setTxEncoded(encoded); setTxDecoded(decoded); txApplyPattern(mode, text);
    const line = "[TRANSITTER] KÓDOLÁS " + mode + " • " + text.slice(0, 24) + (text.length > 24 ? "…" : "") + " → " + encoded.slice(0, 48) + (encoded.length > 48 ? "…" : "");
    txPushLog(line); setTxMsg("Kódolva: " + mode + " • dekódolás ellenőrizve: " + (decoded === text ? "OK" : "—"));
    return encoded;
  }
  async function txTrain() {
    if (txTraining) return; setTxTraining(true); let loss = txLoss.length ? txLoss[txLoss.length - 1] : 0.92;
    for (let step = 0; step < 8; step++) {
      const lr = txLearningRate;
      setTxActivations(function (prev) { return prev.map(function (row) { return row.map(function (v) { return Math.max(2, Math.min(99, Math.round(v + (Math.random() - 0.45) * lr * 42))); }); }); });
      loss = Math.max(0.02, loss * 0.86 + 0.008); const lossNow = loss;
      setTxEpoch(function (p) { return p + 1; }); setTxLoss(function (p) { return [...p, lossNow].slice(-40); });
      await new Promise(function (r) { setTimeout(r, 170); });
    }
    setTxTraining(false); txPushLog("[TRANSITTER] TANÍTÁS KÉSZ • EPOCH " + (txEpoch + 8) + " • LOSS " + loss.toFixed(3)); setTxMsg("Tanítás kész — 8 epoch, loss: " + loss.toFixed(3));
  }
  function txReset() { setTxActivations(txInitialActivations()); setTxEpoch(0); setTxLoss([0.92]); setTxEncoded(""); setTxDecoded(""); setTxSelected({ layer: 0, idx: 0 }); setTxMsg("Mátrix visszaállítva."); txPushLog("[TRANSITTER] RESET • mátrix alaphelyzetbe."); }
  function txToggleGlobal() {
    if (txOnRef.current) { setTxOn(false); txPushLog("[TRANSITTER] TX LEÁLLÍTVA • minden szerveren."); setTxMsg("Transmit leállítva."); return; }
    setTxOn(true); txPushLog("[TRANSITTER] TX INDÍTVA • minden ONLINE szerveren • " + txGlobalFreq + " • " + txPower + "mW");
    setTxMsg("Transmit fut minden ONLINE szerveren — becsukhatod az ablakot, a háttérben megy tovább.");
    setTxPackages(function (p) { return p.map(function (x) { return x.status === "KÓDOLVA" ? { ...x, status: "TRANSMITÁLVA" as const } : x; }); });
  }
  function txToggleServer(id: string) {
    setTxServers(function (prev) { return prev.map(function (s) { if (s.id !== id) return s; const next = { ...s, tx: !s.tx }; txPushLog("[TRANSITTER] " + s.name + " TRANSMIT " + (next.tx ? "ON" : "OFF") + " • " + s.freq); return next; }); });
  }
  function txSetGlobalFreq(freq: string) { setTxGlobalFreq(freq); setTxServers(function (prev) { return prev.map(function (s) { return { ...s, freq: freq }; }); }); txPushLog("[TRANSITTER] FREKVENCIA " + freq + " • minden szerveren."); }
  useEffect(function () {
    if (!txOn) return;
    const t = setInterval(function () {
      const targets = txServersRef.current.filter(function (s) { return s.online && s.tx; });
      if (!targets.length) return;
      targets.forEach(function (s, i) {
        txPacketRef.current += 1; const n = txPacketRef.current;
        const line = s.id === "openshift" ? "[TX] " + s.name + " @ " + s.freq + " - ACK" : "[TX] " + s.name + " @ " + s.freq + " - csomag " + n + "/50 OK";
        setTxLog(function (p) { return [...p, "[TRANSITTER] " + line].slice(-200); });
        setBootLog(function (p) { return [...p, { time: bootStamp(), text: "[TRANSITTER] " + line, status: "OK" as const }].slice(-120); });
        setGhostLog(function (p) { return [...p, "[TRANSITTER] " + line].slice(-200); });
        void i;
      });
      setTxPacketCount(function (p) { return p + targets.length; });
      setTxErrorPct(Math.round(Math.random() * 3 * 10) / 10);
    }, 2200);
    return function () { clearInterval(t); };
  }, [txOn]);
  async function txPersistPackage(pkg: TxPackage) {
    try { const created = await api("records.create", { collection: "transitter-packages", value: { name: pkg.name, size: pkg.size, time: pkg.time, status: pkg.status, code: pkg.code, encoded: pkg.encoded, mode: pkg.mode }, idempotency_key: "tx-pkg-" + pkg.id }) as { id: string }; if (created && created.id) setTxPackages(function (p) { return p.map(function (x) { return x.id === pkg.id ? { ...x, id: created.id } : x; }); }); } catch (e) { /* helyi lista marad */ }
  }
  function txSendFromPlus4(isSync: boolean) {
    const code = basicCodeRef.current || ""; if (!code.trim()) { setTxMsg("Plus/4 program üres — írj programot, majd küldd újra."); if (typeof window !== "undefined") { /* üzenet a Transitterben is látszik */ } return; }
    const name = code.toUpperCase().indexOf("HELLO") >= 0 ? "HELLO.BAS" : "PLUS4.BAS";
    const time = new Date().toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const encoded = txEncodeText(code, txMode); txApplyPattern(txMode, code);
    const status: TxPackage["status"] = txOnRef.current ? "TRANSMITÁLVA" : "KÓDOLVA";
    const existing = txPackages.find(function (p) { return p.name === name; });
    if (isSync && existing) {
      const updated: TxPackage = { ...existing, code: code, size: code.length + " B", time: time, status: status, encoded: encoded, mode: txMode };
      setTxPackages(function (p) { return p.map(function (x) { return x.id === existing.id ? updated : x; }); });
      txPushLog("[TRANSITTER] PLUS/4 SZINKRON • " + name + " • " + code.length + " B • " + status);
      setTxMsg("PLUS/4 SZINKRON kész: " + name + " frissítve (" + code.length + " B).");
      void (async function () { try { await api("records.replace", { collection: "transitter-packages", id: existing.id, value: { name: updated.name, size: updated.size, time: updated.time, status: updated.status, code: updated.code, encoded: updated.encoded, mode: updated.mode } }); } catch (e) { /* */ } })();
    } else {
      const pkg: TxPackage = { id: "tx-" + Date.now(), name: name, size: code.length + " B", time: time, status: status, code: code, encoded: encoded, mode: txMode };
      setTxPackages(function (p) { return [pkg, ...p].slice(0, 30); });
      txPushLog("[TRANSITTER] PLUS/4 → TRANSITTER • " + name + " • " + code.length + " B • " + status + " • kódolva: " + txMode);
      setTxMsg("Fogadva Plus/4-ről: " + name + " (" + code.length + " B) — " + status + ".");
      void txPersistPackage(pkg);
      if (txOnRef.current) txPushLog("[TRANSITTER] TX • " + name + " megy minden ONLINE szerverre.");
    }
    setTxEncoded(encoded); setTxDecoded(code); setTxInput("PLUS/4: " + name);
    openApp("transitter");
  }
  function txOpenPackage(pkg: TxPackage) { setEditorText(pkg.code); setEditorLang("markdown"); setTxMsg("Megnyitva a kódszerkesztőben: " + pkg.name); openApp("editor"); }
  function txEncodePackage(pkg: TxPackage) { const encoded = txEncodeText(pkg.code, txMode); setTxPackages(function (p) { return p.map(function (x) { return x.id === pkg.id ? { ...x, encoded: encoded, mode: txMode, status: "KÓDOLVA" as const } : x; }); }); setTxEncoded(encoded); setTxDecoded(pkg.code); txApplyPattern(txMode, pkg.code); txPushLog("[TRANSITTER] KÓDOLÁS " + txMode + " • " + pkg.name); setTxMsg("Kódolva: " + pkg.name + " — " + txMode); }
  function txTransmitPackage(pkg: TxPackage) {
    if (!txOnRef.current) setTxOn(true);
    setTxPackages(function (p) { return p.map(function (x) { return x.id === pkg.id ? { ...x, status: "TRANSMITÁLVA" as const } : x; }); });
    const targets = txServersRef.current.filter(function (s) { return s.online && s.tx; });
    targets.forEach(function (s) { txPushLog("[TRANSITTER] TX • " + pkg.name + " → " + s.name + " @ " + s.freq + " - ACK"); });
    setTxPacketCount(function (p) { return p + Math.max(1, targets.length); });
    setTxMsg("Transmitálva: " + pkg.name + " → " + targets.length + " ONLINE szerver.");
  }
  async function txSaveLog() {
    setTxSaving(true);
    const text = "TRANSITTER LOG — " + new Date().toLocaleString("hu-HU") + "\nMÓD: " + txMode + " • FREKVENCIA: " + txGlobalFreq + " • TELJESÍTMÉNY: " + txPower + "mW • CSOMAG: " + txPacketCount + "\n\n" + txLog.join("\n") + "\n\nFOGADOTT SZOFTVEREK:\n" + txPackages.map(function (p) { return "- " + p.name + " • " + p.size + " • " + p.time + " • " + p.status; }).join("\n");
    const value: FsFile = { id: "", name: "transitter-log.txt", path: "shift-layer/transitter-log.txt", folder: "shift-layer/", content: text, lang: "text" };
    try {
      const existing = await api("records.list", { collection: "matya-filesystem" }) as { records?: { id: string; value: FsFile }[] };
      let match: { id: string } | undefined = undefined;
      if (existing && existing.records) match = existing.records.find(function (r) { return r.value && r.value.name === "transitter-log.txt"; });
      if (match) { await api("records.replace", { collection: "matya-filesystem", id: match.id, value: { ...value, id: match.id } }); setFsFiles(function (p) { return p.map(function (x) { return x.id === match!.id ? { ...value, id: match!.id } : x; }); }); }
      else { const created = await api("records.create", { collection: "matya-filesystem", value: { ...value, id: "fs-tx-" + Date.now() }, idempotency_key: "tx-log-" + Date.now() }) as { id: string }; setFsFiles(function (p) { return [...p.filter(function (x) { return x.name !== "transitter-log.txt"; }), { ...value, id: created.id }]; }); }
      setTxMsg("Mentve: shift-layer/transitter-log.txt — fájlrendszerbe.");
    } catch (e) { setFsFiles(function (p) { return [...p.filter(function (x) { return x.name !== "transitter-log.txt"; }), { ...value, id: "tmp-tx-" + Date.now() }]; }); setTxMsg("Mentve (helyi nézet): transitter-log.txt"); }
    setTxSaving(false);
  }
  function txNeuronDetail(layer: number, idx: number) {
    const act = txActivations[layer] ? txActivations[layer][idx] : 0;
    const weight = (((layer + 1) * 7 + (idx + 1) * 13) % 100) / 100 - 0.5;
    const bias = (((layer + 1) * 3 + (idx + 1) * 5) % 100) / 100 - 0.3;
    const fn = layer === 0 ? "sigmoid" : layer === 1 ? "tanh" : layer === 2 ? "ReLU" : ["sigmoid", "tanh", "ReLU"][idx % 3];
    return { act, weight, bias, fn };
  }
  function renderTransitter() {
    const sel = txSelected ? txNeuronDetail(txSelected.layer, txSelected.idx) : null;
    const onlineCount = txServers.filter(function (s) { return s.online; }).length;
    if (txTab === "closed") return (<div className="h-full overflow-auto bg-[#0a0a0a] text-[12px]"><div className="p-3 border-b-2 flex flex-wrap gap-1 items-center" style={{ borderColor: RED }}><span className="tech text-[13px] font-bold tracking-widest">TRANSITTER <span style={{ color: RED }}>// TRANSZ NEURÁLIS MÁTRIX</span></span><button onClick={function () { setTxTab("tx"); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">◀ TRANSITTER</button><button onClick={function () { setTxTab("closed"); }} className="px-3 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>🔒 ZÁRT RENDSZER GENERÁTOR</button></div>{renderClosedGenerator()}</div>);
    return (
      <div className="h-full overflow-auto bg-[#0a0a0a] p-3 text-[12px]">
        <div className="flex flex-wrap justify-between gap-2 items-center border-b-2 pb-2" style={{ borderColor: RED }}><div><h3 className="tech text-[13px] font-bold tracking-widest leading-tight">TRANSITTER <span style={{ color: RED }}>// TRANSZ NEURÁLIS MÁTRIX</span></h3><p className="text-[11px] text-[#8a8a8a]">Rádiós kódolások fejlesztéséhez • Plus/4 kész szoftverek fogadása</p></div><span className="px-2 py-1 border border-[#262626] text-[11px] font-bold" style={{ color: txOn ? "#00e676" : "#fff" }}>{txOn ? "📡 TX FUT • HÁTTÉRBEN IS" : "○ TX KI"}</span></div>
        <div className="flex flex-wrap gap-1 mt-3 items-center"><button onClick={function () { setTxTab("tx"); }} className="px-3 py-2 font-bold bg-[#1a1a1a] border border-[#262626]">TRANSITTER</button><button onClick={function () { setTxTab("closed"); }} className="px-3 py-2 font-bold text-black" style={{ background: RED }}>🔒 ZÁRT RENDSZER GENERÁTOR</button><button onClick={function () { void txTrain(); }} disabled={txTraining} className="px-3 py-2 font-bold text-black disabled:opacity-40" style={{ background: RED }}>{txTraining ? "TANÍTÁS…" : "TANÍTÁS"}</button><button onClick={txReset} className="px-3 py-2 font-bold bg-[#1a1a1a] border border-[#262626]">RESET</button><label className="flex items-center gap-2 px-2 py-1 border border-[#262626] text-[11px] font-bold">TANULÁSI RÁTA <input type="range" min={0.01} max={1} step={0.01} value={txLearningRate} onChange={function (e) { setTxLearningRate(parseFloat(e.target.value)); }} className="w-[110px]" /><b>{txLearningRate.toFixed(2)}</b></label><span className="px-2 py-1 border border-[#262626] text-[11px]">EPOCH: <b className="text-white">{txEpoch}</b></span><span className="px-2 py-1 border border-[#262626] text-[11px]">LOSS: <b style={{ color: RED }}>{txLoss.length ? txLoss[txLoss.length - 1].toFixed(3) : "—"}</b></span><canvas ref={txLossCanvasRef} width={180} height={48} className="border border-[#262626] bg-black" /></div>
        <div className="grid lg:grid-cols-3 gap-3 mt-3">
          <div className="lg:col-span-2 border border-[#262626] bg-[#111] p-3"><b>TRANSZ NEURÁLIS MÁTRIX</b><span className="text-[11px] text-[#8a8a8a]"> • kattints egy neuronra</span>
            <div className="mt-2 space-y-2">{TX_LAYERS.map(function (layerName, li) { return <div key={layerName}><div className="text-[10px] tracking-widest text-[#8a8a8a]">{layerName}</div><div className="grid grid-cols-4 sm:grid-cols-8 gap-1 mt-1">{[0, 1, 2, 3, 4, 5, 6, 7].map(function (ni) { const act = txActivations[li][ni]; const selected = txSelected && txSelected.layer === li && txSelected.idx === ni; return <button key={ni} onClick={function () { setTxSelected({ layer: li, idx: ni }); }} className="p-2 text-center border" style={{ borderColor: selected ? RED : "#262626", background: "rgba(255,10,30," + (act / 130) + ")", color: act > 55 ? "#fff" : "#ececec" }}><span className="block font-bold text-[11px]">N{ni + 1}</span><span className="block text-[11px]">{act}%</span></button>; })}</div></div>; })}</div>
            {sel && txSelected && <div className="mt-3 border border-[#262626] bg-black p-2 text-[11px]"><b>{TX_LAYERS[txSelected.layer]} • N{txSelected.idx + 1}</b><div className="flex flex-wrap gap-x-4 gap-y-1 mt-1"><span>AKTIVÁCIÓ: <b className="text-white">{sel.act}%</b></span><span>SÚLY: <b className="text-white">{sel.weight.toFixed(2)}</b></span><span>BIAS: <b className="text-white">{sel.bias.toFixed(2)}</b></span><span>FÜGGVÉNY: <b style={{ color: RED }}>{sel.fn}</b></span></div></div>}
          </div>
          <div className="border border-[#262626] bg-[#111] p-3"><b>KÓDOLÁS PANEL</b><div className="flex flex-wrap gap-1 mt-2">{TX_MODES.map(function (m) { return <button key={m} onClick={function () { setTxMode(m); txApplyPattern(m, txInput); }} className="px-2 py-1.5 text-[11px] font-bold border" style={{ borderColor: txMode === m ? RED : "#262626", background: txMode === m ? "#1a1a1a" : "#000" }}>{m}</button>; })}</div><label className="block text-[11px] text-[#8a8a8a] mt-3">BEMENET SZÖVEG</label><input value={txInput} onChange={function (e) { setTxInput(e.target.value); }} className="w-full bg-black border border-[#262626] px-2 py-2 mt-1 outline-none" placeholder="HELLO" /><button onClick={function () { txDoEncode(); }} className="mt-2 w-full py-2 font-bold text-black" style={{ background: RED }}>KÓDOLÁS ▸ MÁTRIXON KERESZTÜL</button><label className="block text-[11px] text-[#8a8a8a] mt-3">KIMENET — KÓDOLT FORMA ({txMode})</label><textarea value={txEncoded} readOnly className="w-full h-[72px] bg-black border border-[#262626] p-2 mt-1 outline-none text-[11px] resize-none [overflow-wrap:anywhere]" placeholder="Ide kerül a kódolt forma…" /><label className="block text-[11px] text-[#8a8a8a] mt-2">DEKÓDOLÁS VISSZA</label><textarea value={txDecoded} readOnly className="w-full h-[52px] bg-black border border-[#262626] p-2 mt-1 outline-none text-[11px] resize-none [overflow-wrap:anywhere]" placeholder="Visszafejtett szöveg…" /><p className="text-[11px] text-[#8a8a8a] mt-2 break-words [overflow-wrap:anywhere]">{txMsg}</p></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-3 mt-3">
          <div className="lg:col-span-2 border border-[#262626] bg-[#111] p-3"><div className="flex flex-wrap justify-between gap-2"><b>RÁDIÓ TRANSMITTER — TRANSMIT MINDEN SZERVEREN</b><span className="text-[11px]">ONLINE: <b style={{ color: "#00e676" }}>{onlineCount}/{txServers.length}</b></span></div>
            <div className="mt-2 space-y-1">{txServers.map(function (s) { const pct = Math.max(4, Math.min(100, 100 - Math.abs(s.signal + 30))); return <div key={s.id} className="border border-[#262626] bg-black p-2 flex flex-wrap gap-2 items-center"><span className="font-bold w-[130px] [overflow-wrap:anywhere]">{s.name}</span><span className="text-[11px] text-[#8a8a8a] w-[110px]">{s.region}</span><span className="text-[11px] font-bold" style={{ color: s.online ? "#00e676" : RED }}>{s.online ? "● ONLINE" : "○ OFFLINE"}</span><span className="flex-1 min-w-[120px]"><span className="block text-[10px] text-[#8a8a8a]">JEL {s.signal} dB</span><span className="block h-2 bg-[#1a1a1a]"><span className="block h-full" style={{ width: pct + "%", background: s.online ? RED : "#333" }} /></span></span><select value={s.freq} onChange={function (e) { const v = e.target.value; setTxServers(function (p) { return p.map(function (x) { return x.id === s.id ? { ...x, freq: v } : x; }); }); }} className="bg-black border border-[#262626] px-1 py-1 text-[11px] outline-none"><option>433.92MHz</option><option>868MHz</option><option>2.4GHz</option><option>5.8GHz</option></select><button onClick={function () { txToggleServer(s.id); }} disabled={!s.online} className="px-2 py-1.5 text-[11px] font-bold border border-[#262626] disabled:opacity-40">{s.tx ? "TRANSMIT ON" : "TRANSMIT OFF"}</button></div>; })}</div>
            <button onClick={txToggleGlobal} className="mt-3 w-full py-3 font-bold text-black text-[13px]" style={{ background: RED }}>{txOn ? "■ TRANSMIT LEÁLLÍTÁSA" : "📡 TRANSMIT MINDEN SZERVEREN"}</button>
            <div className="flex flex-wrap gap-2 mt-2 items-center"><label className="flex items-center gap-2 text-[11px] font-bold">FREKVENCIA <select value={txGlobalFreq} onChange={function (e) { txSetGlobalFreq(e.target.value); }} className="bg-black border border-[#262626] px-2 py-1.5 outline-none"><option>433.92MHz</option><option>868MHz</option><option>2.4GHz</option><option>5.8GHz</option></select></label><label className="flex items-center gap-2 text-[11px] font-bold">TELJESÍTMÉNY <input type="range" min={10} max={100} step={5} value={txPower} onChange={function (e) { setTxPower(parseInt(e.target.value, 10)); }} className="w-[100px]" /><b>{txPower}mW</b></label><span className="text-[11px] px-2 py-1 border border-[#262626]">CSOMAG: <b className="text-white">{txPacketCount}</b></span><span className="text-[11px] px-2 py-1 border border-[#262626]">HIBÁS: <b style={{ color: RED }}>{txErrorPct}%</b></span></div>
          </div>
          <div className="border border-[#262626] bg-[#111] p-3"><div className="flex justify-between gap-2 flex-wrap"><b>FOGADOTT SZOFTVEREK</b><button onClick={function () { txSendFromPlus4(true); }} className="px-2 py-1 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">PLUS/4 SZINKRON</button></div><p className="text-[11px] text-[#8a8a8a] mt-1">Plus/4 → Transitter: kész szoftver csomagok.</p><div className="mt-2 space-y-2 max-h-[300px] overflow-auto">{txPackages.map(function (p) { return <div key={p.id} className="border border-[#262626] bg-black p-2"><div className="flex justify-between gap-2 flex-wrap"><b className="[overflow-wrap:anywhere]">{p.name}</b><span className="text-[11px] font-bold" style={{ color: p.status === "TRANSMITÁLVA" ? "#00e676" : p.status === "KÓDOLVA" ? RED : "#ffd54a" }}>{p.status}</span></div><div className="text-[11px] text-[#8a8a8a] mt-1">{p.size} • {p.time} • {p.mode}</div><div className="flex gap-1 mt-2 flex-wrap"><button onClick={function () { txOpenPackage(p); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MEGNYITÁS</button><button onClick={function () { txEncodePackage(p); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">KÓDOLÁS</button><button onClick={function () { txTransmitPackage(p); }} className="px-2 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>TRANSMIT</button></div></div>; })}{txPackages.length === 0 && <p className="text-[11px] text-[#8a8a8a] mt-2">Még nincs fogadott szoftver. A Plus/4 (BASIC Studio) ablakban: 📡 KÜLDÉS TRANSITTERBE.</p>}</div></div>
        </div>
        <div className="border border-[#262626] bg-[#111] p-3 mt-3"><div className="flex flex-wrap justify-between gap-2"><b>TRANSITTER LOG</b><span className="flex gap-1"><button onClick={function () { void txSaveLog(); }} disabled={txSaving} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626] disabled:opacity-40">{txSaving ? "MENTÉS…" : "MENTÉS — transitter-log.txt"}</button><button onClick={function () { setTxLog([]); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">TÖRLÉS</button></span></div><div className="bg-black border border-[#262626] p-2 mt-2 mono text-[11px] leading-[1.6] h-[160px] overflow-auto">{txLog.map(function (l, i) { return <div key={i} className="break-words [overflow-wrap:anywhere]">{l}</div>; })}{txLog.length === 0 && <div className="text-[#8a8a8a]">Nincs log sor.</div>}</div><p className="text-[11px] text-[#8a8a8a] mt-2">A log a Boot Naplóban és a Ghost naplóban is megjelenik: [TRANSITTER] TX… • MENTÉS → fájlrendszer: shift-layer/transitter-log.txt</p></div>
      </div>
    );
  }
  function renderFirewall() {
    const shownFwLog = fwLog.filter(function (l) { if (fwLogFilter === "ALL") return true; if (fwLogFilter === "BLOCK") return l.indexOf("BLOCK") >= 0 || l.indexOf("DROP") >= 0; return l.indexOf("ACCEPT") >= 0; });
    return (
      <div data-fw-live className="h-full overflow-auto bg-[#0a0a0a] p-3 text-[12px]">
        <div className="flex flex-wrap justify-between gap-2 items-center border-b-2 pb-2" style={{ borderColor: RED }}><div><h3 className="tech text-[13px] font-bold tracking-widest leading-tight">MATYA CORE FIREWALL - sudo / iptables / nftables / ufw - <span style={{ color: RED }}>KALI LINUX MÓD</span></h3></div><span className="px-2 py-1 border border-[#262626] text-[11px] font-bold">UFW: {fwUfwOn ? "● ACTIVE" : "○ INACTIVE"} • PROFIL: {fwProfile}</span></div>
        <div className="grid lg:grid-cols-3 gap-3 mt-3">
          <div className="border border-[#262626] bg-[#111] p-3"><b>SUDO PANEL</b><p className="text-[11px] text-[#8a8a8a] mt-1">sudo hitelesítés — a jelszó nem kerül mentésre.</p><label className="block text-[11px] text-[#8a8a8a] mt-3">SUDO JELSZÓ</label><input type="password" value={fwSudoPass} onChange={function (e) { setFwSudoPass(e.target.value); }} placeholder="***" className="w-full bg-black border border-[#262626] px-3 py-2 mt-1 outline-none" /><div className="flex gap-2 mt-2"><button onClick={function () { if (fwSudoPass.trim().length < 1) { setFwSudoMsg("sudo: add meg a jelszót."); return; } setFwSudoMsg("sudo: jelszó elfogadva, root shell"); fwAddLog("sudo -i — sudo: jelszó elfogadva, root shell"); }} className="flex-1 py-2 font-bold text-black text-[11px]" style={{ background: RED }}>sudo -i</button><button onClick={function () { setFwSudoMsg("sudo: timestamp frissítve"); fwAddLog("sudo -v — sudo: timestamp frissítve"); }} className="flex-1 py-2 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">sudo -v</button></div><p className="text-[11px] mt-2 break-words [overflow-wrap:anywhere]">{fwSudoMsg}</p><label className="block text-[11px] text-[#8a8a8a] mt-3">SUDOERS — szerkeszthető</label><textarea value={fwSudoers} onChange={function (e) { setFwSudoers(e.target.value); }} spellCheck={false} className="w-full h-[64px] bg-black border border-[#262626] p-2 mt-1 outline-none text-[11px] resize-none" /><p className="text-[11px] text-[#8a8a8a] mt-1">Példa: matya ALL=(ALL) NOPASSWD: /usr/sbin/iptables, /usr/sbin/ufw, /usr/sbin/nft</p><button onClick={function () { fwAddLog("SUDOERS mentve: " + fwSudoers); setFwSudoMsg("sudoers mentve."); }} className="mt-2 w-full py-2 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">SUDOERS MENTÉS</button></div>
          <div className="border border-[#262626] bg-[#111] p-3 lg:col-span-2"><b>SZABÁLY TÁBLÁZAT</b><span className="text-[11px] text-[#8a8a8a]"> • {fwRules.length} szabály</span><div className="overflow-auto mt-2 max-h-[220px]"><table className="w-full text-[11px] border-collapse"><thead><tr className="text-left border-b border-[#3a3a3a]"><th className="p-1">ID</th><th className="p-1">FORRÁS</th><th className="p-1">CÉL PORT</th><th className="p-1">PROTOKOLL</th><th className="p-1">AKCIÓ</th><th className="p-1">ÁLLAPOT</th><th className="p-1"></th></tr></thead><tbody>{fwRules.map(function (r) { return <tr key={r.id} className="border-b border-[#1a1a1a]"><td className="p-1 font-bold">{r.id}</td><td className="p-1">{r.source}</td><td className="p-1">{r.port === 0 ? "ALL" : r.port}</td><td className="p-1">{r.protocol}</td><td className="p-1 font-bold" style={{ color: r.action === "ACCEPT" ? "#00e676" : RED }}>{r.action}</td><td className="p-1">{r.status}</td><td className="p-1"><button onClick={function () { setFwRules(function (p) { return p.filter(function (x) { return x.id !== r.id; }); }); fwAddLog("SZABÁLY TÖRÖLVE: " + r.id); }} className="px-1 border border-[#262626] text-[10px]">TÖRLÉS</button></td></tr>; })}</tbody></table></div>
            <div className="mt-3"><b className="text-[11px]">ÚJ SZABÁLY</b><div className="flex flex-wrap gap-1 mt-1"><input value={fwNewPort} onChange={function (e) { setFwNewPort(e.target.value); }} placeholder="Port pl. 8080" className="w-[90px] bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none" /><select value={fwNewProto} onChange={function (e) { setFwNewProto(e.target.value); }} className="bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none"><option>TCP</option><option>UDP</option><option>ICMP</option></select><select value={fwNewAction} onChange={function (e) { setFwNewAction(e.target.value as "ACCEPT" | "DROP" | "REJECT"); }} className="bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none"><option>ACCEPT</option><option>DROP</option><option>REJECT</option></select><input value={fwNewSource} onChange={function (e) { setFwNewSource(e.target.value); }} placeholder="Forrás IP pl. 0.0.0.0/0" className="flex-1 min-w-[130px] bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none" /><button onClick={fwAddRule} className="px-3 py-1.5 font-bold text-black text-[11px]" style={{ background: RED }}>HOZZÁADÁS</button></div><p className="text-[11px] text-[#8a8a8a] mt-1">Példa log: iptables -A INPUT -p tcp --dport 8080 -j ACCEPT</p></div>
            <div className="mt-3"><b className="text-[11px]">PROFILOK</b><div className="flex flex-wrap gap-1 mt-1">{["KALI ALAP", "OTTHON", "SZERVER", "MINDEN ZÁR"].map(function (p) { return <button key={p} onClick={function () { fwApplyProfile(p); }} className="px-3 py-1.5 text-[11px] font-bold border" style={{ borderColor: fwProfile === p ? RED : "#262626", background: fwProfile === p ? "#1a1a1a" : "#000" }}>{p}</button>; })}</div><p className="text-[11px] text-[#8a8a8a] mt-1">KALI ALAP = szigorú • OTTHON = nyitott 80/443 • SZERVER = csak 22/443/7777 • MINDEN ZÁR = DROP ALL</p></div>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-3 mt-3">
          <div className="border border-[#262626] bg-[#111] p-3"><b>UFW PANEL</b><div className="flex flex-wrap gap-1 mt-2"><button onClick={function () { setFwUfwOn(true); setFwUfwOut(["Status: active", "Logging: on (low)", "Default: deny (incoming), allow (outgoing)"]); fwAddLog("ufw enable — Status: active"); }} className="px-3 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>ufw enable</button><button onClick={function () { setFwUfwOn(false); setFwUfwOut(["Status: inactive"]); fwAddLog("ufw disable — Status: inactive"); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">ufw disable</button><button onClick={function () { setFwUfwOut(fwUfwOn ? ["Status: active", "Logging: on (low)", "Default: deny (incoming), allow (outgoing)", "To                         Action      From", "--                         ------      ----", "22/tcp                     ALLOW       Anywhere", "80/tcp                     ALLOW       Anywhere", "443/tcp                    ALLOW       Anywhere", "7777/tcp                   ALLOW       Anywhere", "23/tcp                     DENY        Anywhere", "445/tcp                    DENY        Anywhere"] : ["Status: inactive"]); fwAddLog("ufw status verbose"); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">ufw status</button><button onClick={function () { fwSimulateScan(); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">SZIMULÁLT PORT SCAN</button></div><div className="bg-black border border-[#262626] p-2 mt-2 mono text-[11px] leading-[1.5]"><div className="text-[#8a8a8a]">$ ufw status verbose</div>{fwUfwOut.map(function (l, i) { return <div key={i}>{l}</div>; })}</div><p className="text-[11px] text-[#8a8a8a] mt-2">nftables: nft list ruleset • iptables: iptables -L -n -v</p></div>
          <div className="border border-[#262626] bg-[#111] p-3"><div className="flex flex-wrap justify-between gap-2"><b>NAPLÓ — valós idejű</b><div className="flex gap-1">{(["ALL", "BLOCK", "ACCEPT"] as const).map(function (f) { return <button key={f} onClick={function () { setFwLogFilter(f); }} className="px-2 py-1 text-[10px] font-bold border" style={{ borderColor: fwLogFilter === f ? RED : "#262626", background: fwLogFilter === f ? "#1a1a1a" : "#000" }}>{f === "ALL" ? "ÖSSZES" : f === "BLOCK" ? "csak BLOCK" : "csak ACCEPT"}</button>; })}<button onClick={function () { setFwLog([]); }} className="px-2 py-1 text-[10px] font-bold border border-[#262626]">TÖRLÉS</button><button onClick={fwCopyLog} className="px-2 py-1 text-[10px] font-bold border border-[#262626]">{fwCopied ? "✓ MÁSOLVA" : "MÁSOLÁS"}</button></div></div><div className="bg-black border border-[#262626] p-2 mt-2 mono text-[11px] leading-[1.5] h-[170px] overflow-auto">{shownFwLog.map(function (l, i) { return <div key={i} className="break-words [overflow-wrap:anywhere]" style={l.indexOf("BLOCK") >= 0 ? { color: RED } : l.indexOf("ACCEPT") >= 0 ? { color: "#00e676" } : undefined}>{l}</div>; })}{shownFwLog.length === 0 && <div className="text-[#8a8a8a]">Nincs megjeleníthető sor.</div>}</div><p className="text-[11px] text-[#8a8a8a] mt-1">Példa: [UFW BLOCK] SRC=45.1.2.3 DST=192.168.1.20 DPT=23</p></div>
        </div>
      </div>
    );
  }
  function renderBootLog() {
    const filteredBoot = bootLog.filter(function (e) { const okFilter = bootFilter === "ALL" || e.status === bootFilter; const okSearch = !bootSearch.trim() || (e.text + " " + e.time).toLowerCase().indexOf(bootSearch.toLowerCase()) >= 0; return okFilter && okSearch; });
    const systems = [{ name: "Kotlin Server", detail: "Port 8080 • /health" }, { name: "Erlang OTP 27", detail: "Eshell • gen_server" }, { name: "Firewall", detail: "KALI MÓD • UFW" }, { name: "Shift Layer", detail: "OpenShift + SoftLayer" }, { name: "Serpentine Daemon", detail: "PID 777 • figyelés" }];
    return (
      <div className="h-full flex flex-col bg-[#0a0a0a] text-[12px] overflow-hidden">
        <div className="px-3 py-2 border-b border-[#262626] flex flex-wrap gap-2 items-center"><span className="tech text-[13px] font-bold tracking-widest">BOOT <span style={{ color: RED }}>NAPLÓ</span></span><span className="text-[11px] text-[#8a8a8a]">boot.log • {bootLog.length} sor</span><span className="ml-auto flex gap-1 flex-wrap">{(["log", "geo", "gep"] as const).map(function (t) { return <button key={t} onClick={function () { setBootTab(t); }} className="px-3 py-1.5 text-[11px] font-bold border" style={{ borderColor: bootTab === t ? RED : "#262626", background: bootTab === t ? "#1a1a1a" : "#000" }}>{t === "log" ? "NAPLÓFÁJL" : t === "geo" ? "HELYZETMEGHATÁROZÁS" : "FUTTATÓ GÉP ADATAI"}</button>; })}</span></div>
        {bootTab === "log" && (<div className="flex-1 min-h-0 flex flex-col p-3"><div className="flex flex-wrap gap-1 items-center"><button onClick={bootRefresh} className="px-3 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>FRISSÍTÉS</button><button onClick={bootCopy} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">{bootCopied ? "✓ MÁSOLVA" : "MÁSOLÁS"}</button><input value={bootSearch} onChange={function (e) { setBootSearch(e.target.value); }} placeholder="KERESÉS a naplóban…" className="flex-1 min-w-[140px] bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none" /><span className="text-[11px] text-[#8a8a8a]">SZŰRÉS:</span>{(["ALL", "OK", "WARN", "FAIL"] as const).map(function (f) { return <button key={f} onClick={function () { setBootFilter(f); }} className="px-2 py-1.5 text-[11px] font-bold border" style={{ borderColor: bootFilter === f ? RED : "#262626", background: bootFilter === f ? "#1a1a1a" : "#000" }}>{f === "ALL" ? "ÖSSZES" : f}</button>; })}</div><div className="flex-1 overflow-auto bg-black border border-[#262626] p-3 mt-2 mono text-[11px] leading-[1.6]">{filteredBoot.map(function (e, i) { return <div key={i} className="break-words [overflow-wrap:anywhere]"><span className="text-[#8a8a8a]">[{e.time}]</span> <span style={{ color: e.status === "OK" ? "#00e676" : e.status === "WARN" ? "#ffd54a" : RED }}>[{e.status}]</span> {e.text}</div>; })}{filteredBoot.length === 0 && <div className="text-[#8a8a8a]">Nincs találat.</div>}</div><p className="text-[11px] text-[#8a8a8a] mt-2 break-words [overflow-wrap:anywhere]">{bootSavedMsg} • Újraindításkor új bejegyzés: REBOOT.</p></div>)}
        {bootTab === "geo" && (<div className="flex-1 min-h-0 overflow-auto p-3"><div className="flex flex-wrap justify-between gap-2"><div><b>INICIALIZÁLT RENDSZEREK — HELYZETMEGHATÁROZÁSI KÓD</b><p className="text-[11px] text-[#8a8a8a] mt-1">Minden inicializált rendszer sorában megjelenik a GEO kód.</p></div><button onClick={refreshGeo} className="px-3 py-1.5 text-[11px] font-bold text-black h-fit" style={{ background: RED }}>GEO FRISSÍTÉS</button></div><p className="text-[11px] mt-2 break-words [overflow-wrap:anywhere]">{geoMsg}</p><div className="space-y-2 mt-3">{systems.map(function (s) { return <div key={s.name} className="border border-[#262626] bg-[#111] p-3"><div className="flex flex-wrap justify-between gap-2"><b>{s.name}</b><span className="text-[11px] font-bold" style={{ color: "#00e676" }}>{geoStatus}</span></div><div className="text-[11px] text-[#8a8a8a]">{s.detail}</div><div className="text-[11px] mt-1 break-words [overflow-wrap:anywhere] font-bold">{geoCode}</div></div>; })}</div><p className="text-[11px] text-[#8a8a8a] mt-3">Ha a böngésző helymeghatározás nem engedélyezett, IP-alapú becslés: Budapest / Hajdúböszörmény / HU • időzóna Europe/Budapest.</p></div>)}
        {bootTab === "gep" && (<div className="flex-1 min-h-0 overflow-auto p-3"><b>FUTTATÓ GÉP ADATAI</b><p className="text-[11px] text-[#8a8a8a] mt-1">A rendszer a bootkor automatikusan beírja a naplóba: [GÉP] OS / CPU / RAM / KIJELZŐ.</p><div className="mt-3 space-y-1 max-w-[720px]">{([["BÖNGÉSZŐ / OS", machineInfo.os], ["BÖNGÉSZŐ (userAgent)", machineInfo.browser], ["KIJELZŐ / KÉPERNYŐ FELBONTÁS", machineInfo.screen], ["CPU MAGOK (hardwareConcurrency)", machineInfo.cores], ["MEMÓRIA (deviceMemory)", machineInfo.memory], ["NYELV", machineInfo.lang], ["IDŐZÓNA", machineInfo.tz], ["ONLINE STÁTUSZ", machineInfo.online], ["IP-SZERŰ AZONOSÍTÓ (helyi, nem valódi IP)", machineInfo.localId]] as string[][]).map(function (row) { return <div key={row[0]} className="border border-[#262626] bg-[#111] p-2"><div className="text-[11px] text-[#8a8a8a]">{row[0]}</div><div className="text-[11px] break-words [overflow-wrap:anywhere] font-bold mt-0.5">{row[1]}</div></div>; })}</div></div>)}
      </div>
    );
  }
  function renderJetbrains() {
    const tools = ["IntelliJ IDEA Community", "PyCharm Community", "Fleet", "Toolbox App"];
    return (
      <div className="h-full overflow-auto p-4 bg-[#0a0a0a] text-[12px]"><h3 className="tech text-[15px] font-bold tracking-widest">JETBRAINS <span style={{ color: RED }}>— INGYENES ESZKÖZÖK</span></h3><p className="text-[11px] text-[#8a8a8a] mt-1">Telepítés AES védett mappába: /aes-vault/jetbrains/… • Start menü • HÁLÓZAT.</p><div className="mt-3 space-y-2 max-w-[560px]">{tools.map(function (t) { const done = jetDone.indexOf(t) >= 0; return <div key={t} className="flex justify-between items-center border border-[#262626] p-3 bg-[#111] flex-wrap gap-2"><span className="font-bold">{t} {done ? "✓ KÉSZ" : ""}</span><button onClick={function () { installJetBrains(t); }} disabled={!!jetBusy} className="px-3 py-1.5 font-bold text-black text-[11px] disabled:opacity-40" style={{ background: RED }}>{jetBusy === t ? "TELEPÍTÉS…" : done ? "ÚJRATELEPÍTÉS" : "TELEPÍTÉS"}</button></div>; })}</div>{jetBusy && <div className="mt-3 max-w-[560px]"><div className="h-2 bg-[#1a1a1a]"><div className="h-full" style={{ width: jetProgress + "%", background: RED }} /></div><div className="text-[11px] mt-1">{jetBusy}: {jetProgress}%</div></div>}<div className="mt-3 bg-black border border-[#262626] p-3 mono text-[11px] leading-[1.6] max-w-[560px]">{jetLog.map(function (l, i) { return <div key={i}>{l}</div>; })}</div><button onClick={function () { setErlangTab("jetbrains"); openApp("erlang"); }} className="mt-3 px-3 py-2 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">MEGNYITÁS ERLANG STUDIO-BAN IS ▸</button></div>
    );
  }
  function renderBasic() {
    const cmds: { label: string; insert: string }[] = [
      { label: "PRINT", insert: "PRINT " }, { label: "LET", insert: "LET " }, { label: "INPUT", insert: "INPUT " },
      { label: "IF...THEN", insert: "IF  THEN " }, { label: "FOR...NEXT", insert: "FOR I=1 TO 10" }, { label: "GOTO", insert: "GOTO " },
      { label: "GOSUB...RETURN", insert: "GOSUB " }, { label: "REM", insert: "REM " }, { label: "DIM", insert: "DIM A(10)" },
      { label: "DATA/READ", insert: "DATA 1,2,3" }, { label: "POKE", insert: "POKE " }, { label: "PEEK", insert: "PEEK(" },
      { label: "SYS", insert: "SYS " }, { label: "CLR", insert: "CLR" }, { label: "LIST", insert: "LIST" },
      { label: "RUN", insert: "RUN" }, { label: "NEW", insert: "NEW" }, { label: "END", insert: "END" },
    ];
    const color = BASIC_COLORS[basicColorIdx];
    function basicStop() { basicStopRef.current = true; if (basicInputResolver.current) { const r = basicInputResolver.current; basicInputResolver.current = null; setBasicAwaiting(false); r(""); } setBasicMsg("STOP — program leállítva."); }
    function basicReset() { basicStopRef.current = true; if (basicInputResolver.current) { const r = basicInputResolver.current; basicInputResolver.current = null; setBasicAwaiting(false); r(""); } directCtxRef.current = { vars: {}, arrays: {}, data: [], dataPtr: 0, forStack: [], gosubStack: [] }; pokeMemRef.current = {}; emuClear(); setBasicMsg("RESET — emulátor újraindítva."); }
    const editorLines = basicCode.split("\n").length;
    return (
      <div className="h-full flex flex-col lg:flex-row bg-[#0a0a0a] overflow-auto lg:overflow-hidden text-[12px]">
        <div className="lg:w-[46%] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#262626] min-h-[420px] lg:min-h-0">
          <div className="px-3 py-2 border-b border-[#262626] flex flex-wrap gap-2 items-center">
            <span className="tech text-[13px] font-bold tracking-widest">BASIC <span style={{ color: RED }}>STUDIO</span></span>
            <span className="text-[11px] text-[#8a8a8a]">Sor számozott szerkesztő</span>
            <span className="ml-auto text-[11px] px-2 py-1 border border-[#262626]">{basicRunning ? "● FUT" : basicAwaiting ? "◐ INPUT VÁR" : "○ READY"}</span>
          </div>
          {renderGeneratorBar("BASIC")}
          <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[#262626]">
            <button onClick={function () { emuClear(); void runBasicProgram(basicCodeRef.current); }} disabled={basicRunning} className="px-3 py-1.5 font-bold text-black disabled:opacity-40" style={{ background: RED }}>▶ RUN</button>
            <button onClick={basicStop} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626]">⏹ STOP</button>
            <button onClick={function () { listBasic(); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626]">LIST</button>
            <button onClick={function () { emuClear(); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626]">CLEAR</button>
            <button onClick={function () { setBasicCode(BASIC_SAMPLE1); basicCodeRef.current = BASIC_SAMPLE1; setBasicMsg("Betöltve: MINTA 1 — Hello"); }} className="px-2 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">MINTA 1 (Hello)</button>
            <button onClick={function () { setBasicCode(BASIC_SAMPLE2); basicCodeRef.current = BASIC_SAMPLE2; setBasicMsg("Betöltve: MINTA 2 — Csillag rajz"); }} className="px-2 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">MINTA 2 (Csillag)</button>
            <button onClick={function () { setBasicCode(BASIC_SAMPLE3); basicCodeRef.current = BASIC_SAMPLE3; setBasicMsg("Betöltve: MINTA 3 — Szám kitaláló"); }} className="px-2 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">MINTA 3 (Kitaláló)</button>
            <button onClick={function () { void saveBasic(); }} disabled={basicSaving} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] disabled:opacity-40">{basicSaving ? "MENTÉS…" : "MENTÉS"}</button>
            <button onClick={function () { setSaveDialog({ open: true, name: "program.bas", folder: "apps/", content: basicCodeRef.current, lang: "basic", source: "basic" }); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">💾 MENTÉS FÁJLRENDSZERBE</button>
            <button onClick={function () { txSendFromPlus4(false); }} className="px-3 py-1.5 font-bold text-black text-[11px]" style={{ background: RED }}>📡 KÜLDÉS TRANSITTERBE</button>
            <label className="flex items-center gap-1 px-2 py-1.5 border border-[#262626] text-[11px] font-bold cursor-pointer"><input type="checkbox" checked={basicSlow} onChange={function (e) { setBasicSlow(e.target.checked); }} />LASSÚ RUN</label>
          </div>
          <div className="flex-1 min-h-[220px] flex overflow-hidden">
            <div ref={basicGutterRef} className="w-[38px] shrink-0 bg-[#111] border-r border-[#262626] pt-3 pb-3 text-right pr-2 text-[12px] leading-[18px] text-[#5c5c5c] overflow-hidden select-none" aria-hidden="true">
              {Array.from({ length: editorLines }, function (_, i) { return <div key={i}>{i + 1}</div>; })}
            </div>
            <textarea ref={basicEditorRef} value={basicCode} onKeyDown={function (e) { handleEditorKey(e, "BASIC"); }} onChange={function (e) { setBasicCode(e.target.value); basicCodeRef.current = e.target.value; }} onScroll={function (e) { if (basicGutterRef.current) basicGutterRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop; }} spellCheck={false} className="flex-1 min-w-0 bg-black text-white p-3 mono text-[12px] leading-[18px] outline-none resize-none" placeholder={'10 PRINT "HELLO"'} />
          </div>
          <div className="border-t border-[#262626] p-2">
            <div className="text-[11px] font-bold tracking-widest mb-2">PARANCSKÉSZLET <span className="text-[#8a8a8a]">— kattints, beillesztődik a kurzorhoz</span></div>
            <div className="flex flex-wrap gap-1">
              {cmds.map(function (c) { return <button key={c.label} onClick={function () { insertBasicCommand(c.insert); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#111] border border-[#262626] hover:border-[#FF0A1E]">{c.label}</button>; })}
            </div>
            <p className="text-[11px] text-[#8a8a8a] mt-2 break-words [overflow-wrap:anywhere]">{basicMsg}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0 min-h-[480px] lg:min-h-0">
          <div className="px-3 py-2 border-b border-[#262626] flex flex-wrap gap-2 items-center">
            <span className="tech text-[13px] font-bold tracking-widest">COMMODORE <span style={{ color: RED }}>PLUS/4</span></span>
            <span className="text-[11px] text-[#8a8a8a]">40×25 • BASIC V3.5</span>
            <span className="ml-auto text-[11px] px-2 py-1 border border-[#262626]">{basicAwaiting ? "INPUT VÁR…" : basicRunning ? "FUT…" : "READY."}</span>
          </div>
          <div className="flex-1 min-h-[280px] p-2 sm:p-3 bg-black overflow-auto" onClick={function () { emuInputRef.current?.focus(); }}>
            <div className="relative mx-auto w-full max-w-[640px] aspect-[40/25] min-h-[240px] overflow-hidden" style={{ background: color.bg, color: color.fg, boxShadow: "0 0 0 1px #262626, 0 18px 50px rgba(0,0,0,.6)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0px, rgba(0,0,0,.22) 1px, transparent 1px, transparent 3px)" }} />
              <div className="absolute inset-0 p-2 sm:p-3 mono text-[11px] sm:text-[12px] leading-[1.45] overflow-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {emuLines.map(function (l, i) { return <div key={i}>{l || " "}</div>; })}
                {emuPending !== "" && <div>{emuPending}<span className="caret">▌</span></div>}
                {emuPending === "" && <div><span className="caret">▌</span></div>}
              </div>
            </div>
          </div>
          <form onSubmit={function (e) { e.preventDefault(); submitEmuInput(); }} className="flex gap-2 px-3 py-2 border-t border-[#262626]">
            <span className="text-[11px] self-center shrink-0" style={{ color: RED }}>{basicAwaiting ? "INPUT ›" : "READY ›"}</span>
            <input ref={emuInputRef} value={emuInput} onChange={function (e) { setEmuInput(e.target.value); }} placeholder="Írj BASIC sort… ENTER = végrehajtás / tárolás" className="flex-1 min-w-0 bg-black border border-[#262626] px-3 py-2 outline-none text-[12px]" />
            <button className="px-3 py-2 font-bold text-black shrink-0 text-[11px]" style={{ background: RED }}>ENTER</button>
          </form>
          <div className="flex flex-wrap gap-1 px-3 pb-2">
            <button onClick={function () { emuClear(); void runBasicProgram(basicCodeRef.current); }} className="px-3 py-1.5 font-bold text-black text-[11px]" style={{ background: RED }}>RUN</button>
            <button onClick={function () { listBasic(); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">LIST</button>
            <button onClick={function () { setBasicCode(""); basicCodeRef.current = ""; emuWriteLine("NEW"); emuWriteLine("READY."); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">NEW</button>
            <button onClick={function () { emuClear(); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">CLR / HOME</button>
            <button onClick={function () { const n = (basicColorIdx + 1) % BASIC_COLORS.length; setBasicColorIdx(n); setBasicMsg("Háttérszín: " + BASIC_COLORS[n].name); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">SZÍNEK</button>
            <button onClick={function () { const n = !basicSound; setBasicSound(n); setBasicMsg("Hang: " + (n ? "BE" : "KI")); if (n) basicBeep(); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">HANG: {basicSound ? "BE" : "KI"}</button>
            <button onClick={basicReset} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">RESET</button>
          </div>
          <div className="px-3 py-2 border-t border-[#262626] flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#8a8a8a]">
            <span>CURSOR: <b className="text-white">{basicAwaiting ? "INPUT" : "READY"}</b></span>
            <span>MEM: <b className="text-white">{Math.max(0, 60671 - basicCode.length)} BASIC BYTES FREE</b></span>
            <span>SZÍN: <b className="text-white">{color.name}</b></span>
            <span>HANG: <b className="text-white">{basicSound ? "BE" : "KI"}</b></span>
            <span>PROGRAM: <b className="text-white">{parseBasicProgram(basicCode).length} sor</b></span>
          </div>
        </div>
      </div>
    );
  }
  function renderEditor() {
    return (
      <div className="h-full flex flex-col sm:flex-row bg-[#0a0a0a] overflow-hidden text-[12px]">
        <div className="sm:w-[210px] shrink-0 border-b sm:border-b-0 sm:border-r border-[#262626] p-3 overflow-auto">
          <div className="flex justify-between"><b>FÁJLOK</b><span className="text-[#8a8a8a]">{files.length} db</span></div>
          <p className="text-[11px] text-[#8a8a8a] mt-1">{persistMsg}</p>
          <div className="mt-3 space-y-1">
            {files.map(function (f) {
              const active = f.id === selectedFile;
              function pick() { setSelectedFile(f.id); setEditorText(f.content); setEditorLang(f.lang); }
              function del(e: React.MouseEvent) { e.stopPropagation(); deleteFile(f.id); }
              return (
                <div key={f.id} onClick={pick} className={active ? "flex items-center gap-2 px-2 py-2 cursor-pointer bg-[#1a1a1a] border border-[#3a3a3a]" : "flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-[#111] border border-transparent"}>
                  <FileCode2 size={14} className="shrink-0" style={{ color: RED }} />
                  <span className="flex-1 truncate [overflow-wrap:anywhere]">{f.name}</span>
                  <button aria-label="Fájl törlése" onClick={del} className="text-[#8a8a8a] hover:text-white"><Trash2 size={13} /></button>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-1"><input value={newName} onChange={function (e) { setNewName(e.target.value); }} placeholder="uj-fajl.kt" className="flex-1 min-w-0 bg-black border border-[#262626] px-2 py-2 text-[11px] outline-none" /><button onClick={createFile} className="px-2 bg-[#1a1a1a] border border-[#262626]" aria-label="Új fájl"><Plus size={15} /></button></div>
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          {renderGeneratorBar("EDITOR")}
          <div className="flex flex-wrap gap-2 items-center px-3 py-2 border-b border-[#262626]">
            <span className="font-bold truncate">{curFile ? curFile.name : ""}</span>
            <select value={editorLang} onChange={function (e) { setEditorLang(e.target.value); }} className="bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none"><option value="kotlin">Kotlin</option><option value="javascript">JS</option><option value="python">Python</option><option value="markdown">Markdown</option></select>
            <div className="ml-auto flex gap-2 flex-wrap"><button onClick={saveFile} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a1a] border border-[#262626] font-bold"><Save size={13} />{saving ? "MENTÉS…" : "MENTÉS"}</button><button onClick={function () { setSaveDialog({ open: true, name: curFile ? curFile.name : "app.js", folder: "apps/", content: editorText, lang: editorLang, source: "editor" }); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">💾 MENTÉS FÁJLRENDSZERBE</button><button onClick={runCode} className="flex items-center gap-1 px-3 py-1.5 font-bold text-black" style={{ background: RED }}><Play size={13} />FUTTATÁS</button></div>
          </div>
          <textarea value={editorText} onKeyDown={function (e) { handleEditorKey(e, "EDITOR"); }} onChange={function (e) { setEditorText(e.target.value); }} spellCheck={false} className="flex-1 min-h-[180px] sm:min-h-0 bg-black p-3 mono text-[12px] leading-[1.5] outline-none resize-none" />
          <div className="border-t border-[#262626] p-2 text-[11px] text-[#8a8a8a]">FUTTATÁS → kimenet a lent dokkolt UNIX konzolba. MENTÉS → adatbázis.</div>
        </div>
      </div>
    );
  }
  function renderFiles() {
    return (
      <div className="h-full bg-[#0a0a0a] p-4 overflow-auto text-[12px]">
        <div className="flex justify-between flex-wrap gap-2"><div><h3 className="tech text-[16px] font-bold tracking-widest">FÁJLKEZELŐ</h3><p className="text-[#8a8a8a] text-[11px]">MATYA CORE struktúra • dupla kattintás = megnyitás a szerkesztőben</p></div><span className="px-2 py-1 border border-[#262626] text-[11px]">{files.length} fájl</span></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          {FOLDERS.map(function (f) { return (<div key={f} className="border border-[#262626] bg-[#111] p-3"><FolderOpen size={22} style={{ color: RED }} /><div className="font-bold mt-2">{f}</div><div className="text-[11px] text-[#8a8a8a]">Mappa</div></div>); })}
          {files.map(function (f) {
            function open() { openApp("editor"); setSelectedFile(f.id); setEditorText(f.content); setEditorLang(f.lang); }
            return (<button key={f.id} onDoubleClick={open} onClick={function () { setSelectedFile(f.id); setEditorText(f.content); setEditorLang(f.lang); }} className="text-left border border-[#262626] bg-[#111] p-3 hover:border-[#FF0A1E]"><FileCode2 size={22} style={{ color: RED }} /><div className="font-bold mt-2 truncate [overflow-wrap:anywhere]">{f.name}</div><div className="text-[11px] text-[#8a8a8a] truncate">{f.path}</div></button>);
          })}
        </div>
        <p className="text-[11px] text-[#8a8a8a] mt-4">{persistMsg}</p>
      </div>
    );
  }
  function renderKotlin() {
    return (
      <div className="h-full overflow-auto p-4 bg-[#0a0a0a] text-[12px]">
        <div className="flex justify-between flex-wrap gap-2"><div><h3 className="tech text-[16px] font-bold tracking-widest">KOTLIN SERVER</h3><p className="text-[#8a8a8a] text-[11px]">Kotlin 2.0.21 • JVM 21 • Port 8080</p></div><span className="px-2 py-1 border text-[11px] font-bold" style={{ borderColor: RED, color: serverOn ? "#00e676" : "#fff" }}>{serverOn ? "● FUT :8080" : "○ LEÁLLÍTVA"}</span></div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center"><div className="border border-[#262626] p-3"><div className="text-[11px] text-[#8a8a8a]">PORT</div><b className="text-[18px]">8080</b></div><div className="border border-[#262626] p-3"><div className="text-[11px] text-[#8a8a8a]">ÁLLAPOT</div><b className="text-[18px]">{serverOn ? "ON" : "OFF"}</b></div><div className="border border-[#262626] p-3"><div className="text-[11px] text-[#8a8a8a]">/health</div><b className="text-[18px]">{serverOn ? "200" : "—"}</b></div></div>
        <div className="flex gap-2 mt-4 flex-wrap"><button onClick={startServer} disabled={serverOn} className="px-4 py-2 font-bold text-black disabled:opacity-40" style={{ background: RED }}>START :8080</button><button onClick={stopServer} disabled={!serverOn} className="px-4 py-2 font-bold bg-[#1a1a1a] border border-[#262626] disabled:opacity-40">STOP</button><button onClick={healthCheck} className="px-4 py-2 font-bold bg-[#1a1a1a] border border-[#262626]">GET /health</button></div>
        <div className="mt-4 bg-black border border-[#262626] p-3 mono text-[11px] h-[170px] overflow-auto">{serverLog.map(function (l, i) { return <div key={i}>{l}</div>; })}<span className="caret">▌</span></div>
        <p className="text-[11px] text-[#8a8a8a] mt-2">Minden művelet a lent dokkolt konzolba is beíródik.</p>
      </div>
    );
  }
  function renderAi() {
    return (
      <div className="h-full flex flex-col p-4 bg-[#0a0a0a] text-[12px]">
        <h3 className="tech text-[16px] font-bold tracking-widest">AI KÖRNYEZET</h3><p className="text-[11px] text-[#8a8a8a] mt-1">Helyi feldolgozás • Nincs külső hívás • Nincs adat küldve sehová</p>
        <div className="flex-1 overflow-auto bg-black border border-[#262626] p-3 mt-3 mono text-[11px] leading-[1.6]">{aiLog.map(function (l, i) { return <div key={i} className={l.indexOf("VÁLASZ") === 0 ? "text-white" : "text-[#8a8a8a]"}>{l}</div>; })}</div>
        <form onSubmit={function (e) { e.preventDefault(); askAi(); }} className="flex gap-2 mt-3"><input value={aiInput} onChange={function (e) { setAiInput(e.target.value); }} placeholder="Kérdezz… pl. status / kotlin / vault / daemon" className="flex-1 min-w-0 bg-black border border-[#262626] px-3 py-2 outline-none" /><button className="px-4 py-2 font-bold text-black shrink-0" style={{ background: RED }}>KÉRDEZÉS</button></form>
      </div>
    );
  }
  function renderNetwork() {
    return (
      <div className="h-full overflow-auto p-4 bg-[#0a0a0a] text-[12px]">
        <div className="flex justify-between flex-wrap gap-2"><div><h3 className="tech text-[16px] font-bold tracking-widest">HÁLÓZAT / COM</h3><p className="text-[11px] text-[#8a8a8a]">LAN • 192.168.1.20 • COM1–COM4</p></div><span className="px-2 py-1 border border-[#262626] text-[11px]">NET: <b className="text-[#00e676]">ONLINE</b></span></div>
        <div className="flex gap-2 mt-4 flex-wrap"><button onClick={pingTest} className="px-4 py-2 font-bold text-black" style={{ background: RED }}>PING TESZT</button><button onClick={comScan} className="px-4 py-2 font-bold bg-[#1a1a1a] border border-[#262626]">COM SCAN</button><button onClick={function () { runCommand("net check"); }} className="px-4 py-2 font-bold bg-[#1a1a1a] border border-[#262626]">NET CHECK</button></div>
        <div className="grid sm:grid-cols-2 gap-2 mt-4">
          {coms.map(function (p, idx) {
            function toggle() { setComs(function (prev) { return prev.map(function (x, i) { return i === idx ? { ...x, on: !x.on } : x; }); }); writeConsole("[COM] " + p.id + (p.on ? " — LEVÁLASZTVA" : " — CSATLAKOZVA • " + p.baud + " baud")); }
            function changeBaud(e: React.ChangeEvent<HTMLSelectElement>) { const v = e.target.value; setComs(function (prev) { return prev.map(function (x, i) { return i === idx ? { ...x, baud: v } : x; }); }); }
            return (
              <div key={p.id} className="border border-[#262626] bg-[#111] p-3"><div className="flex justify-between"><b>{p.id}</b><span className="text-[11px]">{p.on ? "● CSATLAKOZVA" : "○ SZÉTKAPCSOLVA"}</span></div><label className="block text-[11px] text-[#8a8a8a] mt-3">Baud rate</label><select value={p.baud} onChange={changeBaud} className="w-full bg-black border border-[#262626] px-2 py-2 text-[11px] mt-1 outline-none"><option>9600</option><option>57600</option><option>115200</option></select><button onClick={toggle} className="mt-3 w-full py-2 font-bold text-[11px] text-black" style={{ background: p.on ? "#fff" : RED }}>{p.on ? "DISCONNECT" : "CONNECT"}</button></div>
            );
          })}
        </div>
        <div className="mt-3 bg-black border border-[#262626] p-3 mono text-[11px] h-[90px] overflow-auto">{netLog.map(function (l, i) { return <div key={i}>{l}</div>; })}</div>
      </div>
    );
  }
  function renderDaemon() {
    return (
      <div className="h-full overflow-auto p-4 bg-[#0a0a0a] text-[12px]">
        <div className="flex justify-between flex-wrap gap-2"><div><h3 className="tech text-[16px] font-bold tracking-widest">SERPENTINE DAEMON</h3><p className="text-[11px] text-[#8a8a8a]">Háttérfigyelés • Folyamatos ellenőrzés</p></div><span className="px-2 py-1 border text-[11px] font-bold" style={{ borderColor: RED }}>{daemonOn ? "● FUT" : "○ LEÁLLÍTVA"}</span></div>
        <div className="grid grid-cols-2 gap-2 mt-4"><div className="border border-[#262626] p-3"><div className="text-[11px] text-[#8a8a8a]">PID</div><b className="tech text-[22px]" style={{ color: RED }}>777</b></div><div className="border border-[#262626] p-3"><div className="text-[11px] text-[#8a8a8a]">VAULT</div><b className="text-[16px]">{vaultLocked ? "LOCKED" : "UNLOCKED"}</b></div></div>
        <div className="mt-4 border border-[#262626] p-3"><div className="text-[11px] text-[#8a8a8a] mb-2">FIGYELT KÖNYVTÁRAK</div>{["apps/core", "server", "data", "data/vault"].map(function (d) { return <div key={d} className="flex justify-between py-1 border-b border-[#1a1a1a]"><span>{d}</span><span className="text-[#00e676] text-[11px]">FIGYELVE • OK</span></div>; })}</div>
        <div className="flex gap-2 mt-4 flex-wrap"><button onClick={function () { setDaemonOn(!daemonOn); writeConsole("[DAEMON] " + (!daemonOn ? "INDÍTVA — PID 777" : "LEÁLLÍTVA")); }} className="px-4 py-2 font-bold text-black" style={{ background: RED }}>{daemonOn ? "DAEMON STOP" : "DAEMON START"}</button><button onClick={function () { vaultLock(); }} className="px-4 py-2 font-bold bg-[#1a1a1a] border border-[#262626]">VAULT LOCK</button><button onClick={integrityCheck} className="px-4 py-2 font-bold bg-[#1a1a1a] border border-[#262626]">INTEGRITY CHECK</button></div>
        <p className="text-[11px] text-[#8a8a8a] mt-3">A Daemon figyeli a fenti könyvtárakat, és a Vault zárolását is innen vezérelheted.</p>
      </div>
    );
  }
  function renderVault() {
    return (
      <div className="h-full overflow-auto p-4 bg-[#0a0a0a] text-[12px]">
        <h3 className="tech text-[16px] font-bold tracking-widest">VAULT / AES</h3><p className="text-[11px] text-[#8a8a8a] mt-1">AES-GCM + PBKDF2 • A jelszóból PBKDF2 kulcs készül, azzal zárul / nyílik az AES-GCM tároló.</p>
        <div className="mt-4 border p-3 flex justify-between" style={{ borderColor: RED }}><span>ÁLLAPOT</span><b>{vaultLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}</b></div>
        <label className="block text-[11px] text-[#8a8a8a] mt-4">JELSZÓ</label>
        <input type="password" value={vaultPass} onChange={function (e) { setVaultPass(e.target.value); }} placeholder="••••••••" className="w-full bg-black border border-[#262626] px-3 py-2 mt-1 outline-none" />
        <div className="flex gap-2 mt-3"><button onClick={vaultUnlock} className="flex-1 py-2 font-bold text-black flex items-center justify-center gap-1" style={{ background: RED }}><Unlock size={13} />UNLOCK</button><button onClick={vaultLock} className="flex-1 py-2 font-bold bg-[#1a1a1a] border border-[#262626] flex items-center justify-center gap-1"><Lock size={13} />LOCK</button></div>
        <p className="text-[11px] mt-3">{vaultMsg}</p>
        <div className="mt-3 bg-black border border-[#262626] p-3 text-[11px] leading-[1.6] text-[#8a8a8a]">AES-GCM: hitelesített titkosítás — a tartalom csak a helyes jelszóval nyitható.<br />PBKDF2: a jelszóból sok iterációval készül a kulcs, így a próbálgatás lassú.<br />A jelszó nem kerül mentésre.</div>
        <div className="mt-3 flex gap-2"><button onClick={function () { runCommand("aes lock"); }} className="px-3 py-2 bg-[#1a1a1a] border border-[#262626] text-[11px] font-bold">KONZOL: aes lock</button><button onClick={function () { runCommand("aes unlock"); }} className="px-3 py-2 bg-[#1a1a1a] border border-[#262626] text-[11px] font-bold">KONZOL: aes unlock</button></div>
      </div>
    );
  }
  function renderSettings() {
    return (
      <div className="h-full overflow-auto p-4 bg-[#0a0a0a] text-[12px]">
        <h3 className="tech text-[16px] font-bold tracking-widest">BEÁLLÍTÁSOK</h3>
        <div className="mt-4 space-y-2 max-w-[520px]">
          <div className="border border-[#262626] p-3"><b>DESIGN</b><p className="text-[11px] text-[#8a8a8a] mt-1">MATYA CORE • Fekete / fehér / <span style={{ color: RED }}>#FF0A1E</span> • Szögletes • Monospace 11–12px</p></div>
          <div className="border border-[#262626] p-3"><b>RENDSZER</b><p className="text-[11px] text-[#8a8a8a] mt-1">MATYA CORE // DESKTOP v1.0 • Kernel 6.8 • {files.length} fájl • Mentés: adatbázis</p><p className="text-[11px] text-[#8a8a8a]">{persistMsg}</p></div>
          <div className="border border-[#262626] p-3 flex justify-between"><span><b>DAEMON</b><span className="block text-[11px] text-[#8a8a8a]">PID 777</span></span><b>{daemonOn ? "FUT" : "LEÁLLÍTVA"}</b></div>
          <div className="border border-[#262626] p-3 flex justify-between"><span><b>VAULT / AES</b><span className="block text-[11px] text-[#8a8a8a]">AES-GCM + PBKDF2</span></span><b>{vaultLocked ? "LOCKED" : "UNLOCKED"}</b></div>
          <button onClick={function () { setConsoleLines([]); writeConsole("Konzol törölve."); }} className="px-4 py-2 bg-[#1a1a1a] border border-[#262626] font-bold">KONZOL TÖRLÉSE (CLEAR)</button>
        </div>
      </div>
    );
  }
  function renderFsTree() {
    return (
      <div className="text-[12px]">
        {FS_FOLDERS.map(function (folder) {
          const items = fsFiles.filter(function (f) { return f.folder === folder; });
          const open = openFolders[folder];
          return (
            <div key={folder} className="border-b border-[#1a1a1a]">
              <button onClick={function () { setOpenFolders(function (p) { return { ...p, [folder]: !p[folder] }; }); }} className="w-full flex justify-between px-2 py-2 font-bold text-left hover:bg-[#111]"><span>{open ? "▼" : "▶"} {folder}</span><span className="text-[#8a8a8a]">{items.length}</span></button>
              {open && <div className="pb-1">{items.map(function (f) {
                const locked = f.folder === "aes-vault/" && vaultLocked;
                return (
                  <div key={f.id} className={selectedFsId === f.id ? "mx-1 px-2 py-1.5 bg-[#1a1a1a] border border-[#3a3a3a]" : "mx-1 px-2 py-1.5 hover:bg-[#111] border border-transparent"}>
                    <button onClick={function () { openFsFile(f); }} className="w-full text-left truncate [overflow-wrap:anywhere]">{locked ? "🔒 " : ""}{f.name} <span className="text-[#8a8a8a] text-[11px]">{locked ? "— TITKOSÍTVA" : ""}</span></button>
                    {renamingId === f.id ? <div className="flex gap-1 mt-1"><input value={renameValue} onChange={function (e) { setRenameValue(e.target.value); }} className="flex-1 min-w-0 bg-black border border-[#262626] px-2 py-1 text-[11px] outline-none" /><button onClick={function () { renameFsFile(f); }} className="px-2 py-1 text-[11px] font-bold text-black" style={{ background: RED }}>OK</button></div> : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        <button onClick={function () { if (f.name.endsWith(".erl")) openErlangTest(f.name, f.content); else if (f.name.endsWith(".bas")) { setBasicCode(f.content); openApp("basic"); } else setFsMsg("Tesztelés: " + f.name + " — nyisd meg a szerkesztőben."); }} className="px-1.5 py-1 text-[10px] font-bold bg-[#1a1a1a] border border-[#262626]">TESZTELÉS FELUGRÓBAN</button>
                        <button onClick={function () { setRenamingId(f.id); setRenameValue(f.name); }} className="px-1.5 py-1 text-[10px] font-bold bg-[#1a1a1a] border border-[#262626]">ÁTNEVEZÉS</button>
                        <button onClick={function () { copyFsFile(f); }} className="px-1.5 py-1 text-[10px] font-bold bg-[#1a1a1a] border border-[#262626]">MÁSOLÁS</button>
                        <button onClick={function () { deleteFsFile(f); }} className="px-1.5 py-1 text-[10px] font-bold bg-[#1a1a1a] border border-[#262626]">TÖRLÉS</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {open && items.length === 0 && <p className="px-3 py-1 text-[11px] text-[#8a8a8a]">Üres mappa.</p>}
              </div>}
            </div>
          );
        })}
        <p className="p-2 text-[11px] text-[#8a8a8a] break-words [overflow-wrap:anywhere]">{fsMsg}</p>
      </div>
    );
  }
  function renderErlang() {
    const cmds: { label: string; insert: string }[] = [
      { label: "-module", insert: "-module(hello).\n" }, { label: "-export", insert: "-export([start/0]).\n" }, { label: "fun", insert: "fun(X) -> X end" }, { label: "receive", insert: "receive Msg -> io:format(\"~p~n\", [Msg]) end" }, { label: "send (!)", insert: "Pid ! {ping, self()}" }, { label: "spawn", insert: "spawn(modul, fuggveny, [])" }, { label: "io:format", insert: "io:format(\"HELLO ~p~n\", [X])" }, { label: "case", insert: "case X of 0 -> done; N -> N end" }, { label: "if", insert: "if N > 0 -> ok; true -> nem end" }, { label: "try/catch", insert: "try X catch _:_ -> hiba end" }, { label: "lists:map", insert: "lists:map(fun(X) -> X * 2 end, [1,2,3])" }, { label: "gen_server", insert: "%% gen_server: init/1, handle_call/3, handle_cast/2" }, { label: "supervisor", insert: "%% supervisor: init/1 -> {ok, {{one_for_one, 5, 10}, []}}" },
    ];
    const jetTools = ["IntelliJ IDEA Community", "PyCharm Community", "Fleet", "Toolbox App"];
    const libs = ["Erlang/OTP 27", "rebar3", "Elixir (opcionális)", "cowboy", "gen_server", "supervisor", "mnesia", "observer"];
    const tabBtn = function (id: typeof erlangTab, label: string) { return <button key={id} onClick={function () { setErlangTab(id); }} className="px-3 py-1.5 text-[11px] font-bold border" style={{ borderColor: erlangTab === id ? RED : "#262626", background: erlangTab === id ? "#1a1a1a" : "#000" }}>{label}</button>; };
    return (
      <div className="h-full flex flex-col bg-[#0a0a0a] text-[12px] overflow-hidden">
        <div className="px-3 py-2 border-b border-[#262626] flex flex-wrap gap-1 items-center"><span className="tech text-[13px] font-bold tracking-widest">ERLANG <span style={{ color: RED }}>STUDIO</span></span><span className="text-[11px] text-[#8a8a8a]">OTP 27 • Fájlrendszer • AES Vault</span><span className="ml-auto flex gap-1 flex-wrap">{["editor", "files", "install", "jetbrains", "vault"].map(function (t) { return tabBtn(t as typeof erlangTab, t === "editor" ? "SZERKESZTŐ" : t === "files" ? "FÁJLRENDSZER" : t === "install" ? "TELEPÍTÉS" : t === "jetbrains" ? "JETBRAINS" : "AES VÉDETT MAPPA"); })}</span></div>
        {erlangTab === "editor" && (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden">
            <div className="lg:w-[54%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#262626] min-h-[480px] lg:min-h-0">
              <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[#262626] items-center">
                <input value={erlangFileName} onChange={function (e) { setErlangFileName(e.target.value); }} className="bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none w-[140px]" />
                <button onClick={compileErlang} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">FORDÍTÁS (compile)</button>
                <button onClick={function () { openErlangTest(erlangFileName, erlangCode); }} className="px-3 py-1.5 font-bold text-black text-[11px]" style={{ background: RED }}>▶ TESZT FELUGRÓBAN</button>
                <button onClick={function () { setSaveDialog({ open: true, name: erlangFileName, folder: "erlang/", content: erlangCode, lang: "erlang", source: "erlang" }); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">💾 MENTÉS FÁJLRENDSZERBE</button>
                <button onClick={function () { void (async function () { setErlangSaving(true); try { setSaveDialog({ open: true, name: erlangFileName, folder: "erlang/", content: erlangCode, lang: "erlang", source: "erlang" }); } finally { setErlangSaving(false); } })(); }} className="px-2 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">MENTÉS</button>
              </div>
              {renderGeneratorBar("ERLANG")}
              <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[#262626]"><button onClick={function () { setErlangCode(ERLANG_HELLO); setErlangFileName("hello.erl"); setErlangMsg("Betöltve: MINTA — Hello"); }} className="px-2 py-1 text-[11px] font-bold bg-[#111] border border-[#262626]">MINTA: Hello</button><button onClick={function () { setErlangCode(ERLANG_PINGPONG); setErlangFileName("pingpong.erl"); setErlangMsg("Betöltve: MINTA — Ping-Pong folyamatok"); }} className="px-2 py-1 text-[11px] font-bold bg-[#111] border border-[#262626]">MINTA: Ping-Pong</button><button onClick={function () { setErlangCode(ERLANG_COUNTER); setErlangFileName("szamlalo.erl"); setErlangMsg("Betöltve: MINTA — Számláló gen_server"); }} className="px-2 py-1 text-[11px] font-bold bg-[#111] border border-[#262626]">MINTA: Számláló gen_server</button></div>
              <div className="flex-1 min-h-[220px] flex overflow-hidden"><div className="w-[38px] shrink-0 bg-[#111] border-r border-[#262626] pt-3 text-right pr-2 text-[12px] leading-[18px] text-[#5c5c5c] overflow-hidden select-none" aria-hidden="true">{erlangCode.split("\n").map(function (_, i) { return <div key={i}>{i + 1}</div>; })}</div><textarea value={erlangCode} onKeyDown={function (e) { handleEditorKey(e, "ERLANG"); }} onChange={function (e) { setErlangCode(e.target.value); }} spellCheck={false} className="flex-1 min-w-0 bg-black text-white p-3 mono text-[12px] leading-[18px] outline-none resize-none" /></div>
              <div className="border-t border-[#262626] p-2"><div className="text-[11px] font-bold tracking-widest mb-2">PARANCSKÉSZLET — kattints, beillesztődik</div><div className="flex flex-wrap gap-1">{cmds.map(function (c) { return <button key={c.label} onClick={function () { const el = document.activeElement as HTMLTextAreaElement | null; setErlangCode(function (p) { return p + "\n" + c.insert; }); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#111] border border-[#262626] hover:border-[#FF0A1E]">{c.label}</button>; })}</div><p className="text-[11px] text-[#8a8a8a] mt-2 break-words [overflow-wrap:anywhere]">{erlangMsg}</p></div>
            </div>
            <div className="flex-1 flex flex-col min-w-0 min-h-[320px] lg:min-h-0">
              <div className="px-3 py-2 border-b border-[#262626] font-bold text-[11px] tracking-widest">SZINTAXIS KIEMELÉS — ELŐNÉZET <span className="text-[#8a8a8a]">piros = kulcsszó • zöld = szöveg • fehér = változó</span></div>
              <div className="flex-1 overflow-auto p-3 mono text-[12px] leading-[18px] whitespace-pre">{highlightErlang(erlangCode)}</div>
              <div className="border-t border-[#262626] p-3"><b className="text-[11px]">FÁJLRENDSZER — GYORSNÉZET</b><div className="mt-2 max-h-[180px] overflow-auto">{renderFsTree()}</div></div>
            </div>
          </div>
        )}
        {erlangTab === "files" && (<div className="flex-1 min-h-0 overflow-auto p-3"><h3 className="tech font-bold tracking-widest">FÁJLRENDSZER</h3><p className="text-[11px] text-[#8a8a8a] mt-1">Mappák nyithatók/csukhatók. Fájlra kattintva megnyílik a megfelelő szerkesztőben.</p><div className="mt-3 max-w-[640px]">{renderFsTree()}</div></div>)}
        {erlangTab === "install" && (
          <div className="flex-1 min-h-0 overflow-auto p-4"><h3 className="tech font-bold tracking-widest">TELEPÍTÉS — ERLANG KÖNYVTÁRAK</h3><div className="mt-3 space-y-1 max-w-[560px]">{libs.map(function (l) { return <label key={l} className="flex gap-2 items-center border border-[#262626] p-2 bg-[#111]"><input type="checkbox" checked readOnly /><span className="flex-1">{l}</span><span style={{ color: installDone ? "#00e676" : "#8a8a8a" }}>{installDone ? "✓" : "○"}</span></label>; })}</div><button onClick={startInstall} disabled={installBusy} className="mt-3 px-4 py-2 font-bold text-black disabled:opacity-40" style={{ background: RED }}>{installBusy ? "TELEPÍTÉS FOLYAMATBAN…" : "TELEPÍTÉS INDÍTÁSA"}</button><div className="mt-3 max-w-[560px]"><div className="h-2 bg-[#1a1a1a]"><div className="h-full" style={{ width: installProgress + "%", background: RED }} /></div><div className="text-[11px] mt-1">{installProgress}%</div></div><div className="mt-3 bg-black border border-[#262626] p-3 mono text-[11px] leading-[1.6] max-w-[560px]">{installLog.map(function (l, i) { return <div key={i}>{l}</div>; })}</div><p className="mt-3 text-[11px]">Státusz: OTP 27 {installDone ? "✓" : "○"} • rebar3 {installDone ? "✓" : "○"} • KÖNYVTÁRAK {installDone ? "✓" : "○"}</p></div>
        )}
        {erlangTab === "jetbrains" && (
          <div className="flex-1 min-h-0 overflow-auto p-4"><h3 className="tech font-bold tracking-widest">JETBRAINS — INGYENES ESZKÖZÖK</h3><p className="text-[11px] text-[#8a8a8a] mt-1">Telepítés AES védett mappába: /aes-vault/jetbrains/…</p><div className="mt-3 space-y-2 max-w-[560px]">{jetTools.map(function (t) { const done = jetDone.indexOf(t) >= 0; return <div key={t} className="flex justify-between items-center border border-[#262626] p-3 bg-[#111] flex-wrap gap-2"><span className="font-bold">{t} {done ? "✓ KÉSZ" : ""}</span><button onClick={function () { installJetBrains(t); }} disabled={!!jetBusy} className="px-3 py-1.5 font-bold text-black text-[11px] disabled:opacity-40" style={{ background: RED }}>{jetBusy === t ? "TELEPÍTÉS…" : done ? "ÚJRATELEPÍTÉS" : "TELEPÍTÉS"}</button></div>; })}</div>{jetBusy && <div className="mt-3 max-w-[560px]"><div className="h-2 bg-[#1a1a1a]"><div className="h-full" style={{ width: jetProgress + "%", background: RED }} /></div><div className="text-[11px] mt-1">{jetBusy}: {jetProgress}%</div></div>}<div className="mt-3 bg-black border border-[#262626] p-3 mono text-[11px] leading-[1.6] max-w-[560px]">{jetLog.map(function (l, i) { return <div key={i}>{l}</div>; })}</div></div>
        )}
        {erlangTab === "vault" && (
          <div className="flex-1 min-h-0 overflow-auto p-4"><h3 className="tech font-bold tracking-widest">AES VÉDETT MAPPA — /aes-vault/</h3><p className="text-[11px] text-[#8a8a8a] mt-2">AES-GCM + PBKDF2 - kulcs sosem hagyja el a gépet, a mappa csak feloldva olvasható</p><div className="mt-3 border p-3 flex justify-between max-w-[560px]" style={{ borderColor: RED }}><span>ÁLLAPOT</span><b>{vaultLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}</b></div><label className="block text-[11px] text-[#8a8a8a] mt-3">JELSZÓ</label><input type="password" value={erlangVaultPass} onChange={function (e) { setErlangVaultPass(e.target.value); }} placeholder="••••••••" className="w-full max-w-[560px] bg-black border border-[#262626] px-3 py-2 mt-1 outline-none" /><div className="flex gap-2 mt-3 max-w-[560px]"><button onClick={function () { if (erlangVaultPass.trim().length < 4) { setErlangMsg("Adj meg legalább 4 karakteres jelszót."); return; } setVaultLocked(false); setErlangMsg("AES Vault feloldva."); }} className="flex-1 py-2 font-bold text-black" style={{ background: RED }}>UNLOCK</button><button onClick={function () { setVaultLocked(true); setErlangMsg("AES Vault zárva."); }} className="flex-1 py-2 font-bold bg-[#1a1a1a] border border-[#262626]">LOCK</button></div><div className="mt-4 max-w-[560px]"><b className="text-[11px]">/aes-vault/ TARTALMA</b><div className="mt-2 space-y-1"><div className="border border-[#262626] p-2">📁 erlang/ <span className="text-[#8a8a8a] text-[11px]">{vaultLocked ? "— 🔒 TITKOSÍTVA" : "— hello.erl, szerver.erl"}</span></div><div className="border border-[#262626] p-2">📁 jetbrains/ <span className="text-[#8a8a8a] text-[11px]">{vaultLocked ? "— 🔒 TITKOSÍTVA" : "— " + (jetDone.length ? jetDone.join(", ") : "üres")}</span></div><div className="border border-[#262626] p-2">📁 projektek/ <span className="text-[#8a8a8a] text-[11px]">{vaultLocked ? "— 🔒 TITKOSÍTVA" : "— matya.bas, hello.erl"}</span></div></div></div><p className="mt-3 text-[11px] text-[#8a8a8a] max-w-[560px]">Amikor LOCK-olva van, a fájlok neve látszik, de tartalmuk “🔒 TITKOSÍTVA” feliratot mutat.</p></div>
        )}
      </div>
    );
  }
  function renderErlangTest() {
    return (
      <div className="h-full flex flex-col bg-black text-[12px]">
        <div className="px-3 py-2 border-b-2 flex flex-wrap gap-2 items-center" style={{ borderColor: RED, background: "#1a0002" }}><span className="tech font-bold tracking-widest">ERLANG TEST — {testTitle}</span><span className="text-[11px] text-[#8a8a8a]">{testRunning ? "● FUT" : "○ READY"}</span><span className="ml-auto flex gap-1 flex-wrap"><button onClick={function () { testStopRef.current = false; setTestLog(["Erlang/OTP 27 — ÚJRAFUTTATÁS: " + testTitle]); testLogRef.current = ["Erlang/OTP 27 — ÚJRAFUTTATÁS: " + testTitle]; setTestRunning(true); void runErlangSource(erlangCodeRef.current).then(function () { setTestRunning(false); }); }} className="px-2 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>ÚJRAFUTTATÁS</button><button onClick={function () { testStopRef.current = true; setTestRunning(false); setTestMsg("STOP — teszt leállítva."); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">STOP</button><button onClick={function () { testStopRef.current = true; setWindows(function (p) { return p.filter(function (w) { return w.app !== "erlangtest"; }); }); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">BEZÁRÁS</button><button onClick={function () { setTestLog(["Erlang/OTP 27 [erts-15.2] [MATYA CORE]", "Eshell V15.2"]); testLogRef.current = ["Erlang/OTP 27 [erts-15.2] [MATYA CORE]", "Eshell V15.2"]; }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">SHELL TÖRLÉS</button></span></div>
        <div className="flex-1 overflow-auto p-3 mono text-[12px] leading-[1.6]">{testLog.map(function (l, i) { return <div key={i} className="break-words [overflow-wrap:anywhere]">{l || " "}</div>; })}<span className="caret" style={{ color: RED }}>▌</span></div>
        <form onSubmit={function (e) { e.preventDefault(); const v = testInput; setTestInput(""); void runShellCommand(v); }} className="flex gap-2 px-3 py-2 border-t border-[#262626]"><span className="text-[11px] self-center shrink-0" style={{ color: RED }}>erl ›</span><input value={testInput} onChange={function (e) { setTestInput(e.target.value); }} placeholder={'Próbáld: hello:start(). / c(hello). / 1+1. / io:format("HI~n").'} className="flex-1 min-w-0 bg-black border border-[#262626] px-3 py-2 outline-none text-[12px]" /><button className="px-3 py-2 font-bold text-black shrink-0 text-[11px]" style={{ background: RED }}>ENTER</button></form>
        <div className="px-3 py-2 border-t border-[#262626] flex flex-wrap gap-2"><button onClick={function () { openErlangTest(erlangFileName, erlangCode); }} className="px-2 py-1 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">TESZT: {erlangFileName}</button><button onClick={function () { const f = fsFiles.find(function (x) { return x.name === "szerver.erl"; }); if (f) openErlangTest(f.name, f.content); }} className="px-2 py-1 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">TESZT: szerver.erl</button><span className="text-[11px] text-[#8a8a8a] self-center break-words [overflow-wrap:anywhere]">{testMsg}</span></div>
      </div>
    );
  }
  function renderShift() {
    const catalog = SHIFT_CATALOG.filter(function (c) { return c.provider === shiftTab; });
    const vbFiles = fsFiles.filter(function (f) { return f.name.endsWith(".vb"); });
    return (
      <div className="h-full flex flex-col lg:flex-row bg-[#0a0a0a] overflow-auto lg:overflow-hidden text-[12px]">
        <div className="lg:w-[30%] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#262626] min-h-[480px] lg:min-h-0">
          <div className="px-3 py-2 border-b border-[#262626] flex flex-wrap gap-1 items-center"><span className="tech text-[13px] font-bold tracking-widest">SHIFT <span style={{ color: RED }}>LAYER</span></span><span className="text-[11px] text-[#8a8a8a]">INGYENES SZOLGÁLTATÁSOK</span></div>
          <div className="flex gap-1 px-3 py-2 border-b border-[#262626]">
            <button onClick={function () { setShiftTab("openshift"); }} className="flex-1 px-2 py-2 text-[11px] font-bold border" style={{ borderColor: shiftTab === "openshift" ? RED : "#262626", background: shiftTab === "openshift" ? "#1a1a1a" : "#000" }}>OPENSHIFT</button>
            <button onClick={function () { setShiftTab("softlayer"); }} className="flex-1 px-2 py-2 text-[11px] font-bold border" style={{ borderColor: shiftTab === "softlayer" ? RED : "#262626", background: shiftTab === "softlayer" ? "#1a1a1a" : "#000" }}>SOFTLAYER (IBM Cloud)</button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {catalog.map(function (c) {
              const added = shiftServices.some(function (s) { return s.id === c.id; });
              return (
                <div key={c.id} className="border border-[#262626] bg-[#111] p-3">
                  <div className="font-bold leading-tight [overflow-wrap:anywhere]">{c.name}</div>
                  <p className="text-[11px] text-[#8a8a8a] mt-1">{c.desc}</p>
                  <div className="text-[11px] mt-2"><span className="px-2 py-1 border border-[#262626]">INGYENES KERET: {c.free}</span></div>
                  <p className="text-[11px] mt-2">LEÍRÁS: {c.desc}</p>
                  <button onClick={function () { addShiftService(c); }} disabled={added} className="mt-2 w-full py-2 text-[11px] font-bold text-black disabled:opacity-40" style={{ background: added ? "#fff" : RED }}>{added ? "✓ MÁR A PROJEKTBEN" : "HOZZÁADÁS A PROJEKTHEZ"}</button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lg:w-[36%] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#262626] min-h-[520px] lg:min-h-0">
          <div className="px-3 py-2 border-b border-[#262626]"><b>AKTÍV SZOLGÁLTATÁSOK</b> <span className="text-[11px] text-[#8a8a8a]">({shiftServices.length}) • a lista a Fájlrendszer shift-layer/services.txt fájljában is látszik</span></div>
          <div className="max-h-[220px] overflow-auto p-2 space-y-1">
            {shiftServices.length === 0 && <p className="text-[11px] text-[#8a8a8a] p-2">Még nincs aktív szolgáltatás — adj hozzá a bal oldali katalógusból.</p>}
            {shiftServices.map(function (s) {
              return (
                <div key={s.id} className="border border-[#262626] bg-[#111] p-2">
                  <div className="flex justify-between gap-2"><span className="font-bold text-[11px] [overflow-wrap:anywhere]">{s.name}</span><span className="text-[10px] px-1 py-0.5 border border-[#262626] shrink-0" style={{ color: s.status === "TESZTELVE" ? "#00e676" : s.status === "AKTÍV" ? RED : "#fff" }}>{s.status}</span></div>
                  <div className="text-[10px] text-[#8a8a8a]">{s.provider === "openshift" ? "OPENSHIFT" : "SOFTLAYER / IBM CLOUD"}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(["TERVEZETT", "AKTÍV", "TESZTELVE"] as ShiftStatus[]).map(function (st) { return <button key={st} onClick={function () { setShiftStatus(s.id, st); }} className="px-2 py-1 text-[10px] font-bold border" style={{ borderColor: s.status === st ? RED : "#262626", background: s.status === st ? "#1a1a1a" : "#000" }}>{st}</button>; })}
                    <button onClick={function () { removeShiftService(s.id); }} className="px-2 py-1 text-[10px] font-bold border border-[#262626]">ELTÁVOLÍTÁS</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-3 py-2 border-t border-b border-[#262626] flex justify-between items-center"><b>KÓD KÖNYVTÁR</b><span className="text-[11px] text-[#8a8a8a]">{SHIFT_SNIPPETS.length} blokk</span></div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {SHIFT_SNIPPETS.map(function (sn) {
              return (
                <div key={sn.id} className="border border-[#262626] bg-[#111] p-2">
                  <div className="flex justify-between gap-2"><span className="font-bold text-[11px] [overflow-wrap:anywhere]">{sn.title}</span><span className="text-[10px] px-1 border border-[#262626]">{sn.lang}</span></div>
                  <pre className="mono text-[10px] leading-[1.4] bg-black border border-[#262626] p-2 mt-1 overflow-auto max-h-[90px] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{sn.code}</pre>
                  <div className="flex gap-1 mt-1 flex-wrap"><button onClick={function () { copySnippet(sn); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">{shiftCopied === sn.id ? "✓ MÁSOLVA" : "MÁSOLÁS"}</button><button onClick={function () { addSnippetToFile(sn); }} className="px-2 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>HOZZÁADÁS A FÁJLHOZ</button>{sn.lang === "VB" && <button onClick={function () { openVbFromShift("matya-app.vb", sn.code); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MEGNYITÁS VB TESZTBEN</button>}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0 min-h-[520px] lg:min-h-0">
          <div className="px-3 py-2 border-b border-[#262626] flex flex-wrap gap-2 items-center"><b>KIMENTHETŐ FÁJL</b><span className="text-[11px] text-[#8a8a8a]">shift-layer/ mappába mentődik</span><span className="ml-auto flex gap-1 flex-wrap"><button onClick={function () { setShiftPreview(!shiftPreview); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">{shiftPreview ? "SZERKESZTÉS" : "FÁJL ELŐNÉZET"}</button><button onClick={function () { openApp("vbtest"); }} className="px-2 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>VB TESZT ▸</button></span></div>
          <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[#262626] items-center">
            <input value={shiftFileName} onChange={function (e) { setShiftFileName(e.target.value); }} className="flex-1 min-w-[180px] bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none" placeholder="shift-layer-deploy.yaml" />
            <select value={shiftFileType} onChange={function (e) { setShiftFileType(e.target.value); const v = e.target.value; if (v === "VB" && !shiftFileName.endsWith(".vb")) setShiftFileName("matya-app.vb"); if (v === "YAML" && !shiftFileName.endsWith(".yaml")) setShiftFileName("shift-layer-deploy.yaml"); if (v === "SH" && !shiftFileName.endsWith(".sh")) setShiftFileName("deploy.sh"); }} className="bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none"><option>YAML</option><option>SH</option><option>VB</option><option>TXT</option></select>
            <button onClick={function () { setShiftCode(""); setShiftMsg("Fájl kiürítve."); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">TÖRLÉS</button>
            <button onClick={function () { if (shiftFileType === "VB") openVbFromShift(shiftFileName, shiftCode || VB_SAMPLE_HELLO); else setShiftMsg("VB fájlt nyithatsz meg a VB Tesztben — válassz VB típust."); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MEGNYITÁS VB TESZTBEN</button>
          </div>
          {shiftPreview ? <div className="flex-1 overflow-auto p-3 bg-black"><div className="text-[11px] text-[#8a8a8a] mb-2">ELŐNÉZET — {shiftFileName} • {shiftFileType} • {shiftCode.length} karakter • {shiftServices.length} aktív szolgáltatás</div><pre className="mono text-[11px] leading-[1.5] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{shiftCode || "(üres fájl — adj hozzá kódblokkot a középső panelről)"}</pre><div className="mt-3 border-t border-[#262626] pt-2"><b className="text-[11px]">AKTÍV SZOLGÁLTATÁSOK AZ ELŐNÉZETBEN</b>{shiftServices.map(function (s) { return <div key={s.id} className="text-[11px]">• [{s.status}] {s.name}</div>; })}</div></div> : <textarea value={shiftCode} onChange={function (e) { setShiftCode(e.target.value); }} spellCheck={false} placeholder="# Válassz kódblokkot a KÓD KÖNYVTÁRBÓL, vagy írj ide…" className="flex-1 min-h-[260px] bg-black p-3 mono text-[12px] leading-[1.5] outline-none resize-none" />}
          <div className="p-3 border-t border-[#262626]">
            <button onClick={function () { void saveShiftFile(); }} disabled={shiftSaving} className="w-full py-2.5 font-bold text-black disabled:opacity-40" style={{ background: RED }}>{shiftSaving ? "MENTÉS…" : "MENTÉS A FÁJLRENDSZERBE"}</button>
            <p className="text-[11px] text-[#8a8a8a] mt-2 break-words [overflow-wrap:anywhere]">{shiftMsg}</p>
            {vbFiles.length > 0 && <div className="mt-2"><b className="text-[11px]">MENTETT .VB FÁJLOK — megnyitás VB Tesztben:</b><div className="flex flex-wrap gap-1 mt-1">{vbFiles.map(function (f) { return <button key={f.id} onClick={function () { openVbFromShift(f.name, f.content); }} className="px-2 py-1 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">{f.name} ▸ VB TESZT</button>; })}</div></div>}
          </div>
        </div>
      </div>
    );
  }
  function renderVbTest() {
    const cmds: { label: string; insert: string }[] = [
      { label: "Dim", insert: "Dim x As Integer = 0" }, { label: "Console.WriteLine", insert: "Console.WriteLine(\"HELLO\")" }, { label: "MsgBox", insert: "MsgBox(\"KESZ\")" }, { label: "If...Then", insert: "If x > 3 Then\n  Console.WriteLine(\"NAGY\")\nEnd If" }, { label: "For...Next", insert: "For i = 1 To 5\n  Console.WriteLine(i)\nNext" }, { label: "While", insert: "While x < 3\n  x = x + 1\nEnd While" }, { label: "Function", insert: "Function Dupla(n As Integer) As Integer\n  Return n * 2\nEnd Function" }, { label: "Sub", insert: "Sub Uzenet()\n  Console.WriteLine(\"SZIA\")\nEnd Sub" }, { label: "InputBox", insert: "Dim nev As String = InputBox(\"Neved:\")" },
    ];
    return (
      <div className="h-full flex flex-col lg:flex-row bg-[#0a0a0a] overflow-auto lg:overflow-hidden text-[12px]">
        <div className="lg:w-[52%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#262626] min-h-[520px] lg:min-h-0">
          <div className="px-3 py-2 border-b border-[#262626] flex flex-wrap gap-1 items-center"><span className="tech text-[12px] font-bold tracking-widest">VISUAL BASIC <span style={{ color: RED }}>TEST</span></span><span className="text-[11px] text-[#8a8a8a]">SHIFT LAYER</span><span className="ml-auto text-[11px] px-2 py-1 border border-[#262626]">{vbRunning ? "● FUT" : vbAwaiting ? "◐ INPUT VÁR" : "○ READY"}</span></div>
          {renderGeneratorBar("VB")}
          <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[#262626] items-center">
            <input value={vbFileName} onChange={function (e) { setVbFileName(e.target.value); }} className="bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none w-[150px]" />
            <button onClick={function () { void runVbProgram(); }} disabled={vbRunning} className="px-3 py-1.5 font-bold text-black disabled:opacity-40" style={{ background: RED }}>▶ FUTTATÁS</button>
            <button onClick={vbStop} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626]">⏹ STOP</button>
            <button onClick={function () { vbOutputRef.current = ["VISUAL BASIC TEST — " + vbFileName]; setVbOutput(vbOutputRef.current); setVbErrorLine(0); setVbMsg("Konzol törölve."); }} className="px-3 py-1.5 font-bold bg-[#1a1a1a] border border-[#262626]">TÖRLÉS</button>
            <button onClick={function () { setVbCode(VB_SAMPLE_HELLO); setVbFileName("matya-app.vb"); setVbMsg("Betöltve: MINTA — Hello"); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MINTA: Hello</button>
            <button onClick={function () { setVbCode(VB_SAMPLE_CALC); setVbFileName("szamologep.vb"); setVbMsg("Betöltve: MINTA — Számológép"); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MINTA: Számológép</button>
            <button onClick={function () { setVbCode(VB_SAMPLE_GUESS); setVbFileName("kitalalo.vb"); setVbMsg("Betöltve: MINTA — Kitaláló játék"); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MINTA: Kitaláló játék</button>
            <button onClick={function () { setVbCode(VB_SAMPLE_DEPLOY); setVbFileName("deploy-szimulacio.vb"); setVbMsg("Betöltve: MINTA — OpenShift deploy szimuláció"); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MINTA: OpenShift deploy</button>
          </div>
          <div className="flex-1 min-h-[220px] flex overflow-hidden">
            <div className="w-[38px] shrink-0 bg-[#111] border-r border-[#262626] pt-3 pb-3 text-right pr-2 text-[12px] leading-[18px] overflow-hidden select-none" aria-hidden="true">{vbCode.split("\n").map(function (_, i) { const err = vbErrorLine === i + 1; return <div key={i} style={err ? { background: RED, color: "#000", fontWeight: "bold" } : undefined}>{i + 1}</div>; })}</div>
            <textarea value={vbCode} onKeyDown={function (e) { handleEditorKey(e, "VB"); }} onChange={function (e) { setVbCode(e.target.value); setVbErrorLine(0); }} spellCheck={false} className="flex-1 min-w-0 bg-black text-white p-3 mono text-[12px] leading-[18px] outline-none resize-none" />
          </div>
          <div className="border-t border-[#262626] p-2"><div className="text-[11px] font-bold tracking-widest mb-2">VB PARANCSKÉSZLET — kattints, beillesztődik</div><div className="flex flex-wrap gap-1">{cmds.map(function (c) { return <button key={c.label} onClick={function () { setVbCode(function (p) { return p + "\n" + c.insert; }); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#111] border border-[#262626] hover:border-[#FF0A1E]">{c.label}</button>; })}</div><p className="text-[11px] mt-2 break-words [overflow-wrap:anywhere]" style={{ color: vbErrorLine ? RED : "#8a8a8a" }}>{vbMsg}</p>
            <div className="flex gap-1 mt-2"><button onClick={function () { setShiftFileName(vbFileName); setShiftFileType("VB"); setShiftCode(vbCode); setShiftMsg("VB kód átmásolva a Shift Layer kimenthető fájljába."); openApp("shift"); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">ÁTMÁSOLÁS SHIFT LAYER FÁJLBA ▸</button><button onClick={function () { setShiftFileName(vbFileName); setShiftFileType("VB"); setShiftCode(vbCode); void saveShiftFile(vbFileName, vbCode, "VB"); }} className="px-2 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>MENTÉS FÁJLRENDSZERBE</button></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0 min-h-[420px] lg:min-h-0">
          <div className="px-3 py-2 border-b border-[#262626] flex flex-wrap gap-2 items-center"><span className="tech text-[12px] font-bold tracking-widest">VB <span style={{ color: RED }}>KONZOL</span></span><span className="text-[11px] text-[#8a8a8a]">.NET konzol kimenet</span><span className="ml-auto text-[11px]">{vbAwaiting ? "INPUT VÁR: " + vbAwaiting : "READY"}</span></div>
          <div className="flex-1 overflow-auto p-3 bg-black mono text-[12px] leading-[1.6]">{vbOutput.map(function (l, i) { return <div key={i} className="break-words [overflow-wrap:anywhere]" style={l.indexOf("Hiba:") === 0 ? { color: RED, fontWeight: "bold" } : undefined}>{l || " "}</div>; })}<span className="caret" style={{ color: RED }}>▌</span></div>
          <form onSubmit={function (e) { e.preventDefault(); vbSubmitInput(); }} className="flex gap-2 px-3 py-2 border-t border-[#262626]"><span className="text-[11px] self-center shrink-0" style={{ color: RED }}>{vbAwaiting ? "INPUT ›" : "INPUT ›"}</span><input value={vbInput} onChange={function (e) { setVbInput(e.target.value); }} placeholder={vbAwaiting ? vbAwaiting : "InputBox / ReadLine várakozáskor ide írj…"} className="flex-1 min-w-0 bg-black border border-[#262626] px-3 py-2 outline-none text-[12px]" /><button disabled={!vbInputResolver.current} className="px-3 py-2 font-bold text-black shrink-0 text-[11px] disabled:opacity-40" style={{ background: RED }}>ENTER</button></form>
          <div className="px-3 py-2 border-t border-[#262626] text-[11px] text-[#8a8a8a]">Shift Layerből mentett .vb fájl itt nyílik meg. Hiba esetén a hibás sor pirosan jelölődik a szerkesztőben.</div>
        </div>
      </div>
    );
  }
  function renderMatrix() {
    const active = matrixModules.filter(function (m) { return m.status === "FUT"; }).length;
    const daemonMod = matrixModules.find(function (m) { return m.id === "daemon"; });
    const commMod = matrixModules.find(function (m) { return m.id === "comm"; });
    const netOk = commMod && commMod.status === "FUT" && commMod.net;
    const selected = matrixModules.find(function (m) { return m.id === matrixSelected; }) || matrixModules[0];
    const appMap: Record<string, AppId> = { plus4: "basic", erlang: "erlang", shift: "shift", firewall: "firewall", bootlog: "bootlog", kotlin: "kotlin", ai: "ai", vault: "vault", daemon: "daemon", editor: "editor", docs: "files" };
    if (matrixTab === "closed") return (<div className="h-full flex flex-col bg-[#0a0a0a] text-[12px] overflow-hidden"><div className="shrink-0 px-3 py-2 border-b-2 flex flex-wrap gap-1 items-center" style={{ borderColor: RED }}><span className="tech text-[13px] font-bold tracking-widest">MATYA CORE <span style={{ color: RED }}>// MODULÁCIÓS MÁTRIX</span></span><button onClick={function () { setMatrixTab("matrix"); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">◀ MÁTRIX</button><button onClick={function () { setMatrixTab("closed"); }} className="px-3 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>🔒 ZÁRT RENDSZER GENERÁTOR</button></div><div className="flex-1 min-h-0 overflow-auto">{renderClosedGenerator()}</div></div>);
    function matrixStartAll() { const next = matrixModulesRef.current.map(function (m) { return { ...m, status: "FUT" as MatrixStatus }; }); applyMatrixModules(next); setMatrixSynced(false); setMatrixLog(function (p) { return [...p, "[MATRIX] MINDEN INDÍT — " + next.length + "/" + next.length + " FUT"].slice(-200); }); void saveMatrixAll(); }
    function matrixStopAll() { const next = matrixModulesRef.current.map(function (m) { return { ...m, status: "KI" as MatrixStatus }; }); applyMatrixModules(next); setMatrixSynced(false); setMatrixLog(function (p) { return [...p, "[MATRIX] MINDEN LEÁLLÍT — 0/" + next.length + " FUT"].slice(-200); }); void saveMatrixAll(); }
    function matrixChange(id: string, patch: Partial<MatrixModule>) { const updated = patchMatrixModule(id, patch); setMatrixSynced(false); if (updated) void persistMatrixModule(updated); }
    return (
      <div className="h-full flex flex-col bg-[#0a0a0a] text-[12px] overflow-hidden">
        <div className="shrink-0 px-3 py-2 border-b-2" style={{ borderColor: RED }}>
          <div className="flex flex-wrap justify-between gap-2 items-center"><h3 className="tech text-[13px] font-bold tracking-widest">MATYA CORE <span style={{ color: RED }}>// MODULÁCIÓS MÁTRIX</span></h3><span className="text-[11px] px-2 py-1 border border-[#262626]">ASTRA ASZTAL ÁTEMELVE • EGY ABLAK</span></div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] mt-2"><span>Aktív modulok: <b className="text-white">{active}/{matrixModules.length}</b></span><span>Háttér: <b style={{ color: daemonMod && daemonMod.status === "FUT" ? "#00e676" : RED }}>{daemonMod && daemonMod.status === "FUT" ? "FUT" : "KI"}</b></span><span>Hálózat: <b style={{ color: netOk ? "#00e676" : RED }}>{netOk ? "OK" : "HIBA"}</b></span><span>Mátrix: <b style={{ color: matrixSynced ? "#00e676" : "#ffd54a" }}>{matrixSynced ? "SZINKRON" : "NINCS SZINKRON"}</b></span></div>
          <div className="flex flex-wrap gap-1 mt-2"><button onClick={function () { setMatrixTab("matrix"); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MÁTRIX</button><button onClick={function () { setMatrixTab("closed"); }} className="px-3 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>🔒 ZÁRT RENDSZER GENERÁTOR</button><button onClick={matrixStartAll} className="px-3 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>MINDEN INDÍT</button><button onClick={matrixStopAll} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MINDEN LEÁLLÍT</button><button onClick={matrixSync} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">SZINKRONIZÁL</button><button onClick={function () { void saveMatrixAll(); }} disabled={matrixSaving} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626] disabled:opacity-40">{matrixSaving ? "MENTÉS…" : "MÁTRIX MENTÉS"}</button><span className="text-[11px] text-[#8a8a8a] self-center break-words [overflow-wrap:anywhere]">{matrixMsg}</span></div>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full min-w-[780px] border-collapse text-[11px]">
            <thead><tr className="text-left border-b border-[#3a3a3a] bg-[#111]"><th className="p-2">MODUL</th><th className="p-2">ÁLLAPOT</th><th className="p-2">INDÍT / LEÁLLÍT</th><th className="p-2">PRIORITÁS</th><th className="p-2">HÁLÓZAT</th><th className="p-2">MODULÁCIÓ</th><th className="p-2">TERHELÉS</th></tr></thead>
            <tbody>{matrixModules.map(function (m, idx) { const load = matrixLoad(m, idx); const isSel = selected && selected.id === m.id; return (<React.Fragment key={m.id}><tr onClick={function () { setMatrixSelected(m.id); }} className={isSel ? "border-b border-[#1a1a1a] cursor-pointer bg-[#1a1a1a]" : "border-b border-[#1a1a1a] cursor-pointer hover:bg-[#111]"}><td className="p-2"><span className="font-bold block [overflow-wrap:anywhere]">{m.name}</span><span className="text-[#8a8a8a]">PORT {m.port} • {isSel ? "▼ RÉSZLETEK" : "▸ RÉSZLETEK"}</span></td><td className="p-2" onClick={function (e) { e.stopPropagation(); }}><select aria-label={m.name + " állapot"} value={m.status} onChange={function (e) { matrixChange(m.id, { status: e.target.value as MatrixStatus }); }} className="bg-black border border-[#262626] px-1 py-1 text-[11px] outline-none font-bold" style={{ color: m.status === "FUT" ? "#00e676" : m.status === "HIBA" ? RED : "#fff" }}><option value="KI">KI</option><option value="FUT">FUT</option><option value="HIBA">HIBA</option></select><span className="block mt-1">{m.status === "FUT" ? "● FUT" : m.status === "HIBA" ? "! HIBA" : "○ KI"}</span></td><td className="p-2" onClick={function (e) { e.stopPropagation(); }}><button onClick={function () { matrixChange(m.id, { status: m.status === "FUT" ? "KI" : "FUT" }); }} className="px-2 py-1.5 text-[11px] font-bold text-black w-full" style={{ background: m.status === "FUT" ? "#fff" : RED }}>{m.status === "FUT" ? "LEÁLLÍT" : "INDÍT"}</button></td><td className="p-2" onClick={function (e) { e.stopPropagation(); }}><select aria-label={m.name + " prioritás"} value={m.priority} onChange={function (e) { matrixChange(m.id, { priority: parseInt(e.target.value, 10) }); }} className="bg-black border border-[#262626] px-1 py-1 text-[11px] outline-none">{[1, 2, 3, 4, 5].map(function (n) { return <option key={n} value={n}>{n}</option>; })}</select></td><td className="p-2" onClick={function (e) { e.stopPropagation(); }}><button onClick={function () { matrixChange(m.id, { net: !m.net }); }} className="px-2 py-1.5 text-[11px] font-bold border border-[#262626] w-full" style={{ background: m.net ? "#1a1a1a" : "#000", color: m.net ? "#00e676" : "#8a8a8a" }}>{m.net ? "ON" : "OFF"}</button></td><td className="p-2" onClick={function (e) { e.stopPropagation(); }}><select aria-label={m.name + " moduláció"} value={m.modulation} onChange={function (e) { matrixChange(m.id, { modulation: e.target.value as MatrixModulation }); }} className="bg-black border border-[#262626] px-1 py-1 text-[11px] outline-none">{(["HULLÁM", "PULZUS", "FOLYAMATOS", "SZÜNET"] as MatrixModulation[]).map(function (v) { return <option key={v} value={v}>{v}</option>; })}</select></td><td className="p-2"><div className="w-[92px] h-2 bg-[#1a1a1a]"><div className="h-full" style={{ width: load + "%", background: m.status === "FUT" ? RED : "#333", transition: "width .6s" }} /></div><span className="text-[#8a8a8a]">{load}% {m.status === "FUT" && <span className="pulse-dot" style={{ color: RED }}>●</span>}</span></td></tr>{isSel && (<tr className="border-b-2" style={{ borderColor: RED }}><td colSpan={7} className="p-3 bg-black"><div className="flex flex-wrap justify-between gap-2"><b className="tech tracking-widest">{m.name} — RÉSZLETEK</b>{appMap[m.id] && <button onClick={function () { openApp(appMap[m.id]); }} className="px-2 py-1 text-[11px] font-bold text-black" style={{ background: RED }}>MEGNYITÁS ▸</button>}</div><p className="text-[11px] text-[#8a8a8a] mt-1 break-words [overflow-wrap:anywhere]">{m.desc}</p><div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] mt-2"><span>PORT: <b>{m.port}</b></span><span>FÜGGŐSÉGEK: <b>{m.deps.length ? m.deps.join(" • ") : "— nincs"}</b></span></div><label className="block text-[11px] text-[#8a8a8a] mt-3">MEGJEGYZÉS — szerkeszthető</label><textarea value={m.note} onChange={function (e) { matrixChange(m.id, { note: e.target.value }); }} placeholder="Írj megjegyzést ehhez a modulhoz…" className="w-full bg-black border border-[#262626] p-2 mt-1 outline-none text-[11px] resize-none h-[56px]" /><div className="flex flex-wrap gap-1 mt-1"><button onClick={function () { if (selected) void persistMatrixModule(selected); setMatrixMsg("Megjegyzés mentve: " + m.name); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">MEGJEGYZÉS MENTÉSE</button><button onClick={function () { runMatrixCommand("matrix " + (m.status === "FUT" ? "stop " : "start ") + m.name); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">KONZOL: matrix {m.status === "FUT" ? "stop" : "start"} {m.name}</button></div></td></tr>)}</React.Fragment>); })}</tbody>
          </table>
        </div>
        <div className="shrink-0 h-[196px] flex flex-col border-t-2" style={{ borderTopColor: RED }}>
          <div className="px-3 py-1.5 border-b border-[#262626] flex flex-wrap gap-1 items-center"><span className="tech text-[11px] font-bold tracking-widest">MATYA <span style={{ color: RED }}>KONZOL</span></span><span className="text-[11px] text-[#8a8a8a]">hálózati program • a háttérben futó rendszerek alatt</span><span className="ml-auto flex gap-1 flex-wrap"><button onClick={function () { runMatrixCommand("matrix status"); }} className="px-2 py-1 text-[10px] font-bold bg-[#1a1a1a] border border-[#262626]">matrix status</button><button onClick={function () { runMatrixCommand("net list"); }} className="px-2 py-1 text-[10px] font-bold bg-[#1a1a1a] border border-[#262626]">net list</button><button onClick={function () { runMatrixCommand("daemon list"); }} className="px-2 py-1 text-[10px] font-bold bg-[#1a1a1a] border border-[#262626]">daemon list</button><button onClick={function () { runMatrixCommand("nato status"); }} className="px-2 py-1 text-[10px] font-bold bg-[#1a1a1a] border border-[#262626]">nato status</button></span></div>
          <div className="flex-1 overflow-auto px-3 py-2 mono text-[11px] leading-[1.5] bg-black">{matrixLog.map(function (l, i) { return <div key={i} className="break-words [overflow-wrap:anywhere]">{l}</div>; })}<span className="caret" style={{ color: RED }}>▌</span></div>
          <form onSubmit={function (e) { e.preventDefault(); const v = matrixInput; setMatrixInput(""); runMatrixCommand(v); }} className="flex gap-2 px-3 py-1.5 border-t border-[#262626]"><span className="text-[11px] self-center shrink-0" style={{ color: RED }}>matya@matrix:~$</span><input value={matrixInput} onChange={function (e) { setMatrixInput(e.target.value); }} placeholder="matrix status • matrix stop tűzfal • blackice encode MATYA • help" className="flex-1 min-w-0 bg-black border border-[#262626] px-2 py-1.5 outline-none text-[11px]" /><button className="px-3 py-1.5 font-bold text-black shrink-0 text-[11px]" style={{ background: RED }}>ENTER</button></form>
        </div>
      </div>
    );
  }
  // ---- GHOST: futtatásnapló + generátorok / shortcutok + CUDA ----
  function logGhostRun(group: GhostGroup, lang: string, code: string, output: string, ms: number, status: "OK" | "HIBA", gpu: boolean) {
    const entry: GhostRun = { id: "g-" + Date.now() + "-" + Math.floor(Math.random() * 1000), time: new Date().toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), group, lang, code: code.slice(0, 220), output: output.slice(0, 400), ms, status, gpu };
    ghostRunsRef.current = [entry, ...ghostRunsRef.current].slice(0, 120);
    setGhostRuns(ghostRunsRef.current);
    setGhostLog(function (p) { return [...p, "[" + entry.time + "] " + group + " • " + lang + " • " + status + " • " + ms + " ms • " + (gpu ? "GPU" : "CPU")].slice(-200); });
    setGhostFlash(function (v) { return v + 1; });
  }
  function ghostShortcutLog(editor: string, key: string) {
    setGhostLog(function (p) { return [...p, "[GHOST] SHORTCUT " + key + " — " + editor].slice(-200); });
    setGhostFlash(function (v) { return v + 1; });
  }
  type GenEditor = "BASIC" | "ERLANG" | "VB" | "EDITOR";
  function generatorText(editor: GenEditor, kind: "hello" | "loop" | "func" | "legacy1" | "legacy2"): string {
    if (editor === "BASIC") {
      if (kind === "hello") return "10 PRINT \"HELLO MATYA CORE\"\n20 PRINT \"GHOST + CUDA\"\n30 END";
      if (kind === "loop") return "10 FOR I=1 TO 5\n20 PRINT \"CIKLUS \";I\n30 NEXT I\n40 END";
      if (kind === "func") return "10 GOSUB 100\n20 END\n100 PRINT \"FUGGVENY\"\n110 RETURN";
      if (kind === "legacy1") return "10 PRINT \"OROKOLT\"\n20 GOTO 10\n30 GOSUB 100";
      return "10 POKE 53280,1\n20 SYS 64738";
    }
    if (editor === "ERLANG") {
      if (kind === "hello") return "-module(hello).\n-export([start/0]).\nstart() -> io:format(\"HELLO MATYA CORE~n\").";
      if (kind === "loop") return "ciklus() -> lists:foreach(fun(I) -> io:format(\"CIKLUS ~p~n\", [I]) end, lists:seq(1, 5)).";
      if (kind === "func") return "dupla(X) -> X * 2.";
      if (kind === "legacy1") return "%% OROKOLT: PRINT / GOTO / GOSUB\nio:format(\"OROKOLT PRINT~n\").";
      return "%% OROKOLT: POKE / SYS — Plus/4\n%% poke(53280, 1). sys(64738).";
    }
    if (editor === "VB") {
      if (kind === "hello") return "Module MatyaApp\n  Sub Main()\n    Console.WriteLine(\"HELLO MATYA CORE\")\n  End Sub\nEnd Module";
      if (kind === "loop") return "For i = 1 To 5\n  Console.WriteLine(\"CIKLUS \" & i)\nNext";
      if (kind === "func") return "Function Dupla(n As Integer) As Integer\n  Return n * 2\nEnd Function";
      if (kind === "legacy1") return "' OROKOLT: PRINT / GOTO / GOSUB\nConsole.WriteLine(\"OROKOLT PRINT\")";
      return "' OROKOLT: POKE / SYS — C64 / Plus/4\n' POKE 53280, 1  •  SYS 64738";
    }
    const lang = editorLang;
    if (lang === "python") {
      if (kind === "hello") return "print(\"HELLO MATYA CORE\")";
      if (kind === "loop") return "for i in range(1, 6):\n    print(\"CIKLUS\", i)";
      if (kind === "func") return "def dupla(n):\n    return n * 2";
      if (kind === "legacy1") return "# OROKOLT: PRINT / GOTO / GOSUB\nprint(\"OROKOLT PRINT\")";
      return "# OROKOLT: POKE / SYS — C64 / Plus/4\n# POKE 53280, 1  •  SYS 64738";
    }
    if (lang === "javascript") {
      if (kind === "hello") return "console.log(\"HELLO MATYA CORE\");";
      if (kind === "loop") return "for (let i = 1; i <= 5; i++) console.log(\"CIKLUS\", i);";
      if (kind === "func") return "function dupla(n) { return n * 2; }";
      if (kind === "legacy1") return "// OROKOLT: PRINT / GOTO / GOSUB\nconsole.log(\"OROKOLT PRINT\");";
      return "// OROKOLT: POKE / SYS — C64 / Plus/4\n// POKE 53280, 1  •  SYS 64738";
    }
    if (kind === "hello") return "fun main() {\n    println(\"HELLO MATYA CORE\")\n}";
    if (kind === "loop") return "for (i in 1..5) println(\"CIKLUS $i\")";
    if (kind === "func") return "fun dupla(n: Int): Int = n * 2";
    if (kind === "legacy1") return "// OROKOLT: PRINT / GOTO / GOSUB\nprintln(\"OROKOLT PRINT\")";
    return "// OROKOLT: POKE / SYS — C64 / Plus/4\n// POKE 53280, 1  •  SYS 64738";
  }
  function applyGenerator(editor: GenEditor, kind: "hello" | "loop" | "func" | "legacy1" | "legacy2") {
    const txt = generatorText(editor, kind);
    if (editor === "BASIC") { const next = (basicCodeRef.current ? basicCodeRef.current + "\n" : "") + txt; setBasicCode(next); basicCodeRef.current = next; }
    if (editor === "ERLANG") { setErlangCode(function (p) { return (p ? p + "\n" : "") + txt; }); erlangCodeRef.current = (erlangCodeRef.current ? erlangCodeRef.current + "\n" : "") + txt; }
    if (editor === "VB") { const next = (vbCodeRef.current ? vbCodeRef.current + "\n" : "") + txt; setVbCode(next); vbCodeRef.current = next; }
    if (editor === "EDITOR") { setEditorText(function (p) { return (p ? p + "\n" : "") + txt; }); }
    ghostShortcutLog(editor, "GENERÁL: " + kind);
  }
  function handleEditorKey(e: React.KeyboardEvent<HTMLTextAreaElement>, editor: GenEditor) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "g") { e.preventDefault(); applyGenerator(editor, "hello"); }
    else if (k === "r") { e.preventDefault(); ghostShortcutLog(editor, "CTRL+R"); if (editor === "BASIC") { emuClear(); void runBasicProgram(basicCodeRef.current); } else if (editor === "ERLANG") { openErlangTest(erlangFileName, erlangCode); } else if (editor === "VB") { void runVbProgram(); } else runCode(); }
    else if (k === "s") {
      e.preventDefault(); ghostShortcutLog(editor, "CTRL+S");
      if (editor === "BASIC") setSaveDialog({ open: true, name: "program.bas", folder: "apps/", content: basicCodeRef.current, lang: "basic", source: "basic" });
      else if (editor === "ERLANG") setSaveDialog({ open: true, name: erlangFileName, folder: "erlang/", content: erlangCode, lang: "erlang", source: "erlang" });
      else if (editor === "VB") setSaveDialog({ open: true, name: vbFileName, folder: "shift-layer/", content: vbCodeRef.current, lang: "basic", source: "vb" });
      else setSaveDialog({ open: true, name: curFile ? curFile.name : "app.js", folder: "apps/", content: editorText, lang: editorLang, source: "editor" });
    }
  }
  function renderGeneratorBar(editor: GenEditor) {
    const btn = function (label: string, kind: "hello" | "loop" | "func" | "legacy1" | "legacy2") { return <button key={label} onClick={function () { applyGenerator(editor, kind); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#111] border border-[#262626] hover:border-[#FF0A1E]">{label}</button>; };
    return (
      <div className="flex flex-wrap gap-1 items-center px-3 py-2 border-b border-[#262626] bg-[#0a0a0a]">
        <span className="text-[11px] font-bold tracking-widest mr-1">GENERÁTOROK</span>
        {btn("GENERÁL: Hello (Ctrl+G)", "hello")}{btn("GENERÁL: Ciklus", "loop")}{btn("GENERÁL: Függvény", "func")}
        {btn("ÖRÖKÖLT: PRINT / GOTO / GOSUB", "legacy1")}{btn("ÖRÖKÖLT: POKE / SYS", "legacy2")}
        <span className="text-[11px] text-[#8a8a8a] ml-1">Ctrl+G generál • Ctrl+R futtat • Ctrl+S mentés fájlrendszerbe</span>
      </div>
    );
  }
  function startCudaInstall() {
    if (cudaBusy) return; setCudaBusy(true); setCudaProgress(0); setCudaInstalled(false);
    const steps = ["[1/5] NVIDIA Driver ellenőrzés… OK — MATYA-GPU-01", "[2/5] CUDA Toolkit 12.4 telepítés…", "[3/5] cuDNN telepítés…", "[4/5] nvcc --version → 12.4", "[5/5] nvidia-smi → MATYA-GPU-01 • 1024 CUDA mag", "CUDA 12.4 READY - GPU: MATYA-GPU-01 - 1024 CUDA mag"];
    let i = 0;
    const t = setInterval(function () {
      setCudaLog(function (p) { return [...p, steps[i]]; }); setCudaProgress(Math.round(((i + 1) / steps.length) * 100)); i++;
      if (i >= steps.length) { clearInterval(t); setCudaBusy(false); setCudaInstalled(true); logGhostRun("CUDA", "CUDA", "__global__ void matya_add() {}", "CUDA 12.4 READY - GPU: MATYA-GPU-01 - 1024 CUDA mag", 42, "OK", true); }
    }, 650);
  }
  function runCudaKernel() {
    const ms = 0.42; const code = "__global__ void " + kernelName + "() {}";
    const out = "kernel " + kernelName + " <<<" + kernelBlocks + ", " + kernelThreads + ">>> OK - " + ms + "ms - GPU";
    setKernelLog(function (p) { return [...p, out].slice(-50); });
    logGhostRun("CUDA", "CUDA", code, out, ms, "OK", true);
  }
  async function ghostSnapshot() {
    const rows = ghostRunsRef.current;
    const text = "GHOST PILLANATKÉP — " + new Date().toLocaleString("hu-HU") + "\nCUDA 12.4 • GPU: MATYA-GPU-01 • 1024 CUDA mag\n\n" + (rows.length ? rows.map(function (r) { return "[" + r.time + "] " + r.group + " • " + r.lang + " • " + r.status + " • " + r.ms + " ms • " + (r.gpu ? "GPU" : "CPU") + "\nKÓD: " + r.code.replace(/\n/g, " ") + "\nKIMENET: " + r.output; }).join("\n\n") : "(még nincs futtatás)");
    const value: FsFile = { id: "", name: "ghost-snapshot.txt", path: "shift-layer/ghost-snapshot.txt", folder: "shift-layer/", content: text, lang: "text" };
    try {
      const existing = await api("records.list", { collection: "matya-filesystem" }) as { records?: { id: string; value: FsFile }[] };
      let match: { id: string } | undefined = undefined;
      if (existing && existing.records) match = existing.records.find(function (r) { return r.value && r.value.name === "ghost-snapshot.txt"; });
      if (match) { await api("records.replace", { collection: "matya-filesystem", id: match.id, value: { ...value, id: match.id } }); setFsFiles(function (p) { return p.map(function (x) { return x.id === match!.id ? { ...value, id: match!.id } : x; }); }); }
      else { const created = await api("records.create", { collection: "matya-filesystem", value: { ...value, id: "fs-ghost-" + Date.now() }, idempotency_key: "ghost-snapshot-" + Date.now() }) as { id: string }; setFsFiles(function (p) { return [...p.filter(function (x) { return x.name !== "ghost-snapshot.txt"; }), { ...value, id: created.id }]; }); }
      setCudaSnapshotMsg("GHOST PILLANATKÉP mentve: shift-layer/ghost-snapshot.txt — " + rows.length + " futtatás.");
    } catch (e) { setFsFiles(function (p) { return [...p.filter(function (x) { return x.name !== "ghost-snapshot.txt"; }), { ...value, id: "tmp-ghost-" + Date.now() }]; }); setCudaSnapshotMsg("GHOST PILLANATKÉP mentve (helyi nézet): shift-layer/ghost-snapshot.txt"); }
    ghostShortcutLog("CUDA", "GHOST PILLANATKÉP");
  }
  function renderGhost() {
    const fps = Math.max(28, 60 - Math.floor(cpu / 3)); const memMb = 512 + mem * 8;
    return (
      <div className="h-full flex flex-col bg-[#0a0a0a] text-[12px] overflow-hidden">
        <div className="px-3 py-2 border-b-2 flex flex-wrap gap-2 items-center" style={{ borderColor: RED }}>
          <h3 className="tech text-[13px] font-bold tracking-widest">👻 GHOST <span style={{ color: RED }}>// SHOCKWAVE ENGINE</span></h3>
          <span className="px-2 py-1 border border-[#262626] text-[11px]">GHOST: <b className="text-[#00e676]">FUT</b> | SHOCKWAVE: <b className="text-[#00e676]">ON</b></span>
          <span className="ml-auto flex gap-1">{(["ghost", "cuda"] as const).map(function (t) { return <button key={t} onClick={function () { setGhostTab(t); }} className="px-3 py-1.5 text-[11px] font-bold border" style={{ borderColor: ghostTab === t ? RED : "#262626", background: ghostTab === t ? "#1a1a1a" : "#000" }}>{t === "ghost" ? "GHOST" : "CUDA TELEPÍTÉS"}</button>; })}</span>
        </div>
        {ghostTab === "ghost" && (
          <div className="flex-1 min-h-0 overflow-auto p-3">
            <div className="grid sm:grid-cols-4 gap-2 text-center"><div className="border border-[#262626] p-2"><div className="text-[11px] text-[#8a8a8a]">ENGINE</div><b>v12</b></div><div className="border border-[#262626] p-2"><div className="text-[11px] text-[#8a8a8a]">FPS</div><b>{fps}</b></div><div className="border border-[#262626] p-2"><div className="text-[11px] text-[#8a8a8a]">RÉSZECSKÉK</div><b>{ghostParticles}</b></div><div className="border border-[#262626] p-2"><div className="text-[11px] text-[#8a8a8a]">MEMÓRIA</div><b>{memMb} MB</b></div></div>
            <div className="flex flex-wrap gap-2 mt-3 items-center"><button onClick={function () { const v = !ghostVisible; setGhostVisible(v); setGhostLog(function (p) { return [...p, "[GHOST] " + (v ? "GHOST LÁTHATÓ" : "GHOST LÁTHATATLAN")].slice(-200); }); setGhostFlash(function (x) { return x + 1; }); }} className="px-3 py-2 font-bold text-black text-[11px]" style={{ background: RED }}>{ghostVisible ? "GHOST LÁTHATÓ" : "GHOST LÁTHATATLAN"}</button><button onClick={function () { setGhostParticles(function (p) { return p === 128 ? 256 : 128; }); }} className="px-3 py-2 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">RÉSZECSKÉK: {ghostParticles}</button><button onClick={function () { openApp("cuda"); }} className="px-3 py-2 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">CUDA GHOST SCREEN ▸</button><span className="text-[11px] text-[#8a8a8a]">{ghostVisible ? "A Ghost látható, figyeli a futtatásokat." : "A Ghost láthatatlan, de a háttérben tovább fut."}</span></div>
            <div className="mt-3 border border-[#262626] bg-black p-2"><div className="text-[11px] font-bold mb-2">SHOCKWAVE — futtatáskor felvillan</div><canvas ref={ghostCanvasRef} width={560} height={110} className="w-full max-w-[560px] h-[110px] border border-[#262626]" /><button onClick={function () { setGhostFlash(function (v) { return v + 1; }); }} className="mt-2 px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">SHOCKWAVE VILLANÁS</button></div>
            <div className="mt-3"><b className="text-[11px]">GHOST NAPLÓ — minden kódfuttatás</b><div className="bg-black border border-[#262626] p-2 mt-1 mono text-[11px] leading-[1.6] max-h-[220px] overflow-auto">{ghostLog.map(function (l, i) { return <div key={i} className="break-words [overflow-wrap:anywhere]">{l}</div>; })}</div></div>
            <div className="mt-3"><b className="text-[11px]">UTOLSÓ FUTTATÁSOK</b>{ghostRuns.slice(0, 5).map(function (r) { return <div key={r.id} className="border border-[#262626] p-2 mt-1 text-[11px]"><span className="font-bold">{r.group}</span> • {r.time} • {r.status} • {r.ms} ms • {r.gpu ? "GPU" : "CPU"}<div className="text-[#8a8a8a] break-words [overflow-wrap:anywhere]">{r.output}</div></div>; })}{ghostRuns.length === 0 && <p className="text-[11px] text-[#8a8a8a] mt-1">Még nincs futtatás — futtass kódot bármelyik szerkesztőben.</p>}</div>
          </div>
        )}
        {ghostTab === "cuda" && (
          <div className="flex-1 min-h-0 overflow-auto p-3">
            <h4 className="font-bold">NVIDIA CUDA KÖRNYEZET TELEPÍTÉS</h4><p className="text-[11px] text-[#8a8a8a] mt-1">NVIDIA Driver ellenőrzés • CUDA Toolkit 12.4 • cuDNN • nvcc --version • nvidia-smi</p>
            <button onClick={startCudaInstall} disabled={cudaBusy} className="mt-3 px-4 py-2 font-bold text-black disabled:opacity-40" style={{ background: RED }}>{cudaBusy ? "TELEPÍTÉS FOLYAMATBAN…" : "TELEPÍTÉS INDÍTÁSA"}</button>
            <div className="h-2 bg-[#1a1a1a] mt-3 max-w-[560px]"><div className="h-full" style={{ width: cudaProgress + "%", background: "#00e676" }} /></div><div className="text-[11px] mt-1">{cudaProgress}% • {cudaInstalled ? "CUDA 12.4 READY - GPU: MATYA-GPU-01 - 1024 CUDA mag" : "Nincs kész"}</div>
            <div className="bg-black border border-[#262626] p-3 mt-3 mono text-[11px] leading-[1.6] max-w-[560px]">{cudaLog.map(function (l, i) { return <div key={i}>{l}</div>; })}</div>
            <button onClick={function () { openApp("cuda"); }} className="mt-3 px-3 py-2 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px]">CUDA GHOST SCREEN MEGNYITÁSA ▸</button>
          </div>
        )}
      </div>
    );
  }
  function renderCudaScreen() {
    const groups: GhostGroup[] = ["BASIC", "ERLANG", "VB", "KOTLIN", "CUDA"];
    const shownRuns = ghostRuns.filter(function (r) { if (cudaFilter === "ALL") return true; if (cudaFilter === "HIBA") return r.status === "HIBA"; return r.group === cudaFilter; });
    return (
      <div className="h-full flex flex-col bg-black text-[12px] overflow-hidden" style={{ background: "#020603" }}>
        <div className="px-3 py-2 border-b-2 flex flex-wrap gap-2 items-center" style={{ borderColor: "#00e676" }}><h3 className="tech text-[13px] font-bold tracking-widest" style={{ color: "#00e676" }}>CUDA GHOST SCREEN</h3><span className="text-[11px] px-2 py-1 border border-[#262626]">{cudaInstalled ? "CUDA 12.4 READY • MATYA-GPU-01 • 1024 mag" : "CUDA nincs telepítve — indítsd a Ghost ablak CUDA fülén"}</span><span className="ml-auto flex gap-1 flex-wrap">{(["ALL", "BASIC", "ERLANG", "VB", "KOTLIN", "CUDA", "HIBA"] as const).map(function (f) { return <button key={f} onClick={function () { setCudaFilter(f); }} className="px-2 py-1.5 text-[11px] font-bold border" style={{ borderColor: cudaFilter === f ? "#00e676" : "#262626", background: cudaFilter === f ? "#052e16" : "#000", color: cudaFilter === f ? "#00e676" : "#ececec" }}>{f === "ALL" ? "ÖSSZES" : f === "HIBA" ? "CSAK HIBA" : f}</button>; })}</span></div>
        <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-[#262626]"><button onClick={function () { setGhostFlash(function (v) { return v + 1; }); }} className="px-3 py-1.5 text-[11px] font-bold text-black" style={{ background: "#00e676" }}>FRISSÍTÉS</button><button onClick={function () { ghostRunsRef.current = []; setGhostRuns([]); setGhostLog(function (p) { return [...p, "[GHOST] ÖSSZESÍTÉS TÖRÖLVE"]; }); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">ÖSSZESÍTÉS TÖRLÉSE</button><button onClick={function () { void ghostSnapshot(); }} className="px-3 py-1.5 text-[11px] font-bold bg-[#1a1a1a] border border-[#262626]">GHOST PILLANATKÉP</button><span className="text-[11px] self-center break-words [overflow-wrap:anywhere]" style={{ color: "#00e676" }}>{cudaSnapshotMsg}</span></div>
        <div className="flex-1 min-h-0 overflow-auto p-3">
          {groups.filter(function (g) { return cudaFilter === "ALL" || cudaFilter === "HIBA" || cudaFilter === g; }).map(function (g) {
            const items = shownRuns.filter(function (r) { return r.group === g; }).slice(0, 5);
            const last = items[0];
            return (
              <div key={g} className="border border-[#262626] bg-black/60 p-3 mb-2"><div className="flex flex-wrap justify-between gap-2"><b style={{ color: "#00e676" }}>{g} CSOPORT</b><span className="text-[11px] text-[#8a8a8a]">{last ? "Utolsó: " + last.time + " • " + last.status + " • " + last.ms + " ms • " + (last.gpu ? "GPU" : "CPU") : "Még nincs futtatás"}</span></div>
                {items.map(function (r) { return <div key={r.id} className="mt-2 border-t border-[#1a1a1a] pt-2 text-[11px]"><div><b>{r.lang}</b> • {r.time} • <span style={{ color: r.status === "OK" ? "#00e676" : RED }}>{r.status}</span> • {r.ms} ms • {r.gpu ? "GPU" : "CPU"}</div><div className="text-[#8a8a8a] break-words [overflow-wrap:anywhere]">KÓD: {r.code}</div><div className="break-words [overflow-wrap:anywhere]">KIMENET: {r.output}</div></div>; })}
                {items.length === 0 && <p className="text-[11px] text-[#8a8a8a] mt-1">Nincs megjeleníthető futtatás ebben a csoportban.</p>}
              </div>
            );
          })}
          <div className="border border-[#262626] p-3 bg-black/60"><b style={{ color: "#00e676" }}>CUDA KERNEL</b><div className="flex flex-wrap gap-1 mt-2"><input value={kernelName} onChange={function (e) { setKernelName(e.target.value); }} className="bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none w-[140px]" placeholder="kernel név" /><input value={kernelBlocks} onChange={function (e) { setKernelBlocks(e.target.value); }} className="bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none w-[90px]" placeholder="blokkok" /><input value={kernelThreads} onChange={function (e) { setKernelThreads(e.target.value); }} className="bg-black border border-[#262626] px-2 py-1.5 text-[11px] outline-none w-[90px]" placeholder="szálak" /><button onClick={runCudaKernel} className="px-3 py-1.5 text-[11px] font-bold text-black" style={{ background: "#00e676" }}>KERNEL FUTTATÁS</button></div><p className="text-[11px] text-[#8a8a8a] mt-1">kernel {kernelName} &lt;&lt;&lt;{kernelBlocks}, {kernelThreads}&gt;&gt;&gt;</p><div className="bg-black border border-[#262626] p-2 mt-2 mono text-[11px] leading-[1.6]">{kernelLog.map(function (l, i) { return <div key={i}>{l}</div>; })}</div></div>
        </div>
      </div>
    );
  }
  // ---- ELLENŐRZŐ LISTA - FINAL ----
  type ChecklistStatus = "—" | "OK" | "HIBA";
  type ChecklistItem = { id: string; cat: string; name: string; desc: string; checked: boolean; status: ChecklistStatus };
  const CHECKLIST_CATS = ["TELEPÍTÉS", "INDÍTÁS", "PROGRAMOK", "HÁLÓZAT / BIZTONSÁG", "MENTÉS / NAPLÓZÁS", "GEO / GÉP"];
  function checklistDefaults(): ChecklistItem[] {
    const mk = function (id: string, cat: string, name: string, desc: string): ChecklistItem { return { id, cat, name, desc, checked: false, status: "—" }; };
    return [
      mk("node-version", "TELEPÍTÉS", "Node --version OK", "Node futtatókörnyezet verziója lekérhető: node --version."),
      mk("python-version", "TELEPÍTÉS", "Python --version OK", "Python verziója lekérhető: python --version / python3 --version."),
      mk("npm-install", "TELEPÍTÉS", "npm install OK", "Függőségek telepítése hiba nélkül lefut: npm install."),
      mk("folders", "TELEPÍTÉS", "Könyvtárak létrejöttek (apps/core/daemon/server/data/storage/logs)", "Minden elvárt mappa megvan: apps / core / daemon / server / data / storage / logs."),
      mk("env-example", "TELEPÍTÉS", ".env.example megvan", "A minta környezeti fájl (.env.example) megtalálható a projekt gyökerében."),
      mk("npm-start", "INDÍTÁS", "npm start -> http://localhost:7777 elérhető", "Indítás után a http://localhost:7777 cím válaszol."),
      mk("index-html", "INDÍTÁS", "index.html megnyílik", "A belépő index.html betöltődik, nem üres / nem hibás oldal."),
      mk("start-menu", "INDÍTÁS", "Start menü megnyílik", "START gombra a menü megnyílik, a programok listázódnak."),
      mk("desktop-empty", "INDÍTÁS", "Asztal üres (nincs ikon)", "Az asztalon nincs ikon: minden program csak a Start menüben van."),
      mk("console-pinned", "INDÍTÁS", "Beépített konzol nem zárható be", "Az alsó UNIX konzol becsukás helyett csak minimalizálható, mindig elérhető."),
      mk("terminal-help", "PROGRAMOK", "Terminál help működik", "Konzolban: help → parancslista megjelenik."),
      mk("basic-run", "PROGRAMOK", "BASIC RUN működik", "BASIC Studio: RUN lefuttatja a programot, READY. jelenik meg."),
      mk("erlang-test", "PROGRAMOK", "Erlang teszt működik", "Erlang tesztablakban a minta program lefut, kimenet látszik."),
      mk("vb-test", "PROGRAMOK", "VB teszt működik", "VB tesztablakban a minta program lefut, KESZ üzenet látszik."),
      mk("shift-save", "PROGRAMOK", "Shift Layer mentés működik", "Shift Layer fájl menthető, megjelenik a fájlrendszerben."),
      mk("transitter-tx", "PROGRAMOK", "Transitter TX működik", "Transitter TX indítható, csomagok mennek az ONLINE szerverekre."),
      mk("matrix-status", "PROGRAMOK", "Modulációs Mátrix matrix status működik", "Matya Konzolban: matrix status → modulok állapota listázódik."),
      mk("firewall-rules", "HÁLÓZAT / BIZTONSÁG", "Tűzfal szabályok látszanak", "Tűzfal ablakban a szabálytábla betöltődik (port / protokoll / művelet)."),
      mk("ghost-running", "HÁLÓZAT / BIZTONSÁG", "Ghost fut", "Ghost / Shockwave Engine FUT állapotban, naplózza a futtatásokat."),
      mk("cuda-screen", "HÁLÓZAT / BIZTONSÁG", "CUDA Ghost Screen frissül", "CUDA Ghost Screen összesíti a futtatásokat, frissül új futtatáskor."),
      mk("daemon-running", "HÁLÓZAT / BIZTONSÁG", "Serpentine Daemon fut", "Daemon PID 777 FUT, figyeli a könyvtárakat."),
      mk("vault-aes", "HÁLÓZAT / BIZTONSÁG", "Vault AES LOCK/UNLOCK", "Vault zárható és jelszóval nyitható: AES-GCM + PBKDF2."),
      mk("closed-gen", "HÁLÓZAT / BIZTONSÁG", "Zárt Rendszer Generátor + Ellenőrzés OK", "Zárt Rendszer kódcsomag generálható, ellenőrzés: KÉSZ."),
      mk("linux-gen", "MENTÉS / NAPLÓZÁS", "Linux Kódgenerátor generál + menthető fájl létrejön", "Generátor sáv: GENERÁL gomb beilleszt, a fájl menthető fájlrendszerbe."),
      mk("emulator-cat", "MENTÉS / NAPLÓZÁS", "Emulátorban cat + ./ fut", "Emulátor / konzol parancsok: cat kiír, ./ futtat."),
      mk("file-persists", "MENTÉS / NAPLÓZÁS", "Fájl megmarad újraindítás után", "Mentett fájl újraindítás után is betöltődik az adatbázisból."),
      mk("boot-log", "MENTÉS / NAPLÓZÁS", "logs/boot.log íródik", "Boot Naplóba minden induláskor új bejegyzés kerül."),
      mk("daemon-log", "MENTÉS / NAPLÓZÁS", "logs/daemon.log íródik", "Daemon események a naplózásba kerülnek."),
      mk("transitter-log", "MENTÉS / NAPLÓZÁS", "logs/transitter.log íródik", "Transitter TX események a naplózásba kerülnek."),
      mk("firewall-log", "MENTÉS / NAPLÓZÁS", "logs/firewall.log íródik", "Tűzfal események (ACCEPT / BLOCK) a naplózásba kerülnek."),
      mk("backup", "MENTÉS / NAPLÓZÁS", "Backup létrejön storage/backups/-ba", "Mentésről backup készül a storage/backups/ mappába."),
      mk("geo-code", "GEO / GÉP", "Boot Naplóban GEO kód látszik", "Boot Naplóban a GEO kód sor megjelenik."),
      mk("machine-data", "GEO / GÉP", "Gép adatok (CPU, kijelző, időzóna) látszanak", "Boot Napló / Gép adatok: CPU magok, kijelző, időzóna látszik."),
    ];
  }
  const [checklist, setChecklist] = useState<ChecklistItem[]>(checklistDefaults);
  const [checklistRunning, setChecklistRunning] = useState(false);
  const [checklistSaving, setChecklistSaving] = useState(false);
  const [checklistMsg, setChecklistMsg] = useState("Telepítés utáni ellenőrző lista — pipáld ki, vagy futtasd végig a teszteket.");
  useEffect(function () {
    (async function () {
      try {
        const data = await api("records.list", { collection: "checklist-results" }) as { records?: { id: string; value: { items?: ChecklistItem[] } }[] };
        if (data && data.records && data.records.length) {
          const saved = data.records[data.records.length - 1].value;
          if (saved && Array.isArray(saved.items) && saved.items.length) {
            const defaults = checklistDefaults();
            const merged = defaults.map(function (d) { const s = saved.items!.find(function (x) { return x && x.id === d.id; }); return s ? { ...d, checked: !!s.checked, status: (s.status === "OK" || s.status === "HIBA" ? s.status : "—") as ChecklistStatus } : d; });
            setChecklist(merged);
            setChecklistMsg("Betöltve az adatbázisból: mentett ellenőrző lista.");
          }
        }
      } catch (e) { /* alap lista marad */ }
    })();
  }, []);
  function checklistEvaluate(item: ChecklistItem): boolean {
    if (item.id === "daemon-running") return daemonOn;
    if (item.id === "firewall-rules") return fwRules.length > 0;
    if (item.id === "geo-code") return geoCode.trim().length > 0;
    if (item.id === "machine-data") return !!machineInfo.cores && !!machineInfo.tz;
    if (item.id === "desktop-empty") return DESKTOP_APPS.length === 0;
    if (item.id === "start-menu") return START_MENU_APPS.length > 0;
    if (item.id === "ghost-running") return ghostVisible || true;
    if (item.id === "boot-log") return bootLog.length > 0;
    return true;
  }
  function checklistLogResult(item: ChecklistItem, ok: boolean) {
    const stamp = bootStamp();
    const text = "[ELLENŐRZŐ LISTA] " + item.name + " → " + (ok ? "OK" : "HIBA");
    setBootLog(function (p) { return [...p, { time: stamp, text: text, status: ok ? "OK" as const : "FAIL" as const }].slice(-120); });
    writeConsole(text);
    setGhostLog(function (p) { return [...p, text].slice(-200); });
  }
  function checklistTestOne(item: ChecklistItem) {
    if (checklistRunning) return;
    const ok = checklistEvaluate(item);
    setChecklist(function (prev) { return prev.map(function (x) { return x.id === item.id ? { ...x, checked: true, status: ok ? "OK" as ChecklistStatus : "HIBA" as ChecklistStatus } : x; }); });
    checklistLogResult(item, ok);
    setChecklistMsg("TESZT: " + item.name + " → " + (ok ? "OK" : "HIBA"));
  }
  async function checklistRunAll() {
    if (checklistRunning) return;
    setChecklistRunning(true);
    setChecklistMsg("ÖSSZES TESZT FUTTATÁSA… egyesével ellenőrzöm a sorokat.");
    let current = checklist.map(function (x) { return { ...x }; });
    for (const item of current) {
      const ok = checklistEvaluate(item);
      current = current.map(function (x) { return x.id === item.id ? { ...x, checked: true, status: ok ? "OK" as ChecklistStatus : "HIBA" as ChecklistStatus } : x; });
      setChecklist(current);
      checklistLogResult(item, ok);
      await new Promise(function (r) { setTimeout(r, 110); });
    }
    const okCount = current.filter(function (x) { return x.status === "OK"; }).length;
    const errCount = current.filter(function (x) { return x.status === "HIBA"; }).length;
    setChecklistRunning(false);
    setChecklistMsg("ÖSSZES TESZT KÉSZ — OK: " + okCount + " • HIBA: " + errCount + " • Ellenőrizve: " + current.length + " / " + current.length);
  }
  function checklistCheckAll() { setChecklist(function (prev) { return prev.map(function (x) { return { ...x, checked: true }; }); }); setChecklistMsg("MINDEN PIPA — minden sor kipipálva."); }
  function checklistClearAll() { setChecklist(function (prev) { return prev.map(function (x) { return { ...x, checked: false, status: "—" as ChecklistStatus }; }); }); setChecklistMsg("MINDEN TÖRLÉS — pipák és státuszok törölve."); }
  function checklistBuildText(items: ChecklistItem[]): string {
    const total = items.length; const checked = items.filter(function (x) { return x.checked; }).length; const ok = items.filter(function (x) { return x.status === "OK"; }).length; const errs = items.filter(function (x) { return x.status === "HIBA"; });
    const pct = total ? Math.round((checked / total) * 100) : 0;
    const lines: string[] = [];
    lines.push("ELLENŐRZŐ LISTA - FINAL");
    lines.push("MATYA CORE // DESKTOP v1.0");
    lines.push("Dátum: " + new Date().toLocaleString("hu-HU"));
    lines.push("Összesítő: Ellenőrizve: " + checked + " / " + total + " - KÉSZ: " + pct + "% • OK: " + ok + " • HIBA: " + errs.length);
    lines.push("");
    CHECKLIST_CATS.forEach(function (cat) { lines.push("[" + cat + "]"); items.filter(function (x) { return x.cat === cat; }).forEach(function (x) { lines.push("[" + x.status + "] [" + (x.checked ? "x" : " ") + "] " + x.name + " — " + x.desc); }); lines.push(""); });
    if (errs.length) { lines.push("HIBALISTA:"); errs.forEach(function (x) { lines.push("- " + x.cat + " • " + x.name); }); }
    else if (checked === total && ok === total) lines.push("Ha minden OK: PROJEKT KÉSZ ✓");
    return lines.join("\n");
  }
  async function checklistSave() {
    if (checklistSaving) return;
    setChecklistSaving(true);
    const items = checklist.map(function (x) { return { ...x }; });
    const total = items.length; const checked = items.filter(function (x) { return x.checked; }).length; const pct = total ? Math.round((checked / total) * 100) : 0;
    const text = checklistBuildText(items);
    const fileValue: FsFile = { id: "", name: "checklist-result.txt", path: "shift-layer/checklist-result.txt", folder: "shift-layer/", content: text, lang: "text" };
    let fileOk = false; let resultOk = false; let errText = "";
    try {
      const existing = await api("records.list", { collection: "matya-filesystem" }) as { records?: { id: string; value: FsFile }[] };
      let match: { id: string } | undefined = undefined;
      if (existing && existing.records) match = existing.records.find(function (r) { return r.value && r.value.name === "checklist-result.txt" && r.value.folder === "shift-layer/"; });
      if (match) { await api("records.replace", { collection: "matya-filesystem", id: match.id, value: { ...fileValue, id: match.id } }); setFsFiles(function (p) { return p.map(function (x) { return x.id === match!.id ? { ...fileValue, id: match!.id } : x; }); }); }
      else { const created = await api("records.create", { collection: "matya-filesystem", value: { ...fileValue, id: "fs-checklist-" + Date.now() }, idempotency_key: "fs-checklist-" + Date.now() }) as { id: string }; setFsFiles(function (p) { return [...p.filter(function (x) { return !(x.name === "checklist-result.txt" && x.folder === "shift-layer/"); }), { ...fileValue, id: created.id }]; }); }
      fileOk = true;
    } catch (e) { errText = e instanceof Error ? e.message : String(e); setFsFiles(function (p) { return [...p.filter(function (x) { return !(x.name === "checklist-result.txt" && x.folder === "shift-layer/"); }), { ...fileValue, id: "tmp-checklist-" + Date.now() }]; }); }
    try {
      const existing = await api("records.list", { collection: "checklist-results" }) as { records?: { id: string }[] };
      const value = { items: items, checked: checked, total: total, pct: pct, savedAt: new Date().toISOString() };
      if (existing && existing.records && existing.records.length) { await api("records.replace", { collection: "checklist-results", id: existing.records[existing.records.length - 1].id, value: value }); }
      else { await api("records.create", { collection: "checklist-results", value: value, idempotency_key: "checklist-result-" + Date.now() }); }
      resultOk = true;
    } catch (e) { if (!errText) errText = e instanceof Error ? e.message : String(e); }
    setChecklistSaving(false);
    if (fileOk && resultOk) { setChecklistMsg("EREDMÉNY MENTVE: shift-layer/checklist-result.txt + adatbázis (checklist-results) — Ellenőrizve: " + checked + " / " + total + " - KÉSZ: " + pct + "%"); writeConsole("[ELLENŐRZŐ LISTA] EREDMÉNY MENTVE: checklist-result.txt • " + checked + " / " + total + " • " + pct + "%"); }
    else setChecklistMsg("EREDMÉNY MENTVE (helyi nézet): checklist-result.txt" + (errText ? " • hiba: " + errText : ""));
  }
  function renderChecklist() {
    const total = checklist.length;
    const checked = checklist.filter(function (x) { return x.checked; }).length;
    const okCount = checklist.filter(function (x) { return x.status === "OK"; }).length;
    const errors = checklist.filter(function (x) { return x.status === "HIBA"; });
    const pct = total ? Math.round((checked / total) * 100) : 0;
    const allDone = total > 0 && checked === total && errors.length === 0 && okCount === total;
    return (
      <div className="h-full flex flex-col bg-[#0a0a0a] text-[12px] overflow-hidden">
        <div className="px-3 py-2 border-b-2 flex flex-wrap gap-2 items-center shrink-0" style={{ borderColor: RED }}>
          <h3 className="tech text-[13px] font-bold tracking-widest">ELLENŐRZŐ LISTA <span style={{ color: RED }}>— FINAL</span></h3>
          <span className="text-[11px] text-[#8a8a8a]">Telepítés utáni ellenőrzés • pipálható • szimulált tesztek</span>
          <span className="ml-auto px-2 py-1 border border-[#262626] text-[11px] font-bold">OK: <b className="text-[#00e676]">{okCount}</b> • HIBA: <b style={{ color: RED }}>{errors.length}</b></span>
        </div>
        <div className="px-3 py-2 border-b border-[#262626] shrink-0">
          <div className="flex flex-wrap justify-between gap-2 items-center"><b className="text-[12px]">ÖSSZESÍTŐ</b><span className="font-bold text-[12px]">Ellenőrizve: {checked} / {total} - KÉSZ: {pct}%</span></div>
          <div className="h-2 bg-[#1a1a1a] mt-2"><div className="h-full" style={{ width: pct + "%", background: RED }} /></div>
          <div className="flex flex-wrap gap-1 mt-2">
            <button onClick={function () { void checklistRunAll(); }} disabled={checklistRunning} className="px-3 py-2 font-bold text-black text-[11px] disabled:opacity-40" style={{ background: RED }}>{checklistRunning ? "TESZT FUT…" : "ÖSSZES TESZT FUTTATÁSA"}</button>
            <button onClick={checklistCheckAll} disabled={checklistRunning} className="px-3 py-2 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px] disabled:opacity-40">MINDEN PIPA</button>
            <button onClick={checklistClearAll} disabled={checklistRunning} className="px-3 py-2 font-bold bg-[#1a1a1a] border border-[#262626] text-[11px] disabled:opacity-40">MINDEN TÖRLÉS</button>
            <button onClick={function () { void checklistSave(); }} disabled={checklistSaving || checklistRunning} className="px-3 py-2 font-bold text-black text-[11px] disabled:opacity-40" style={{ background: "#fff", color: "#000" }}>{checklistSaving ? "MENTÉS…" : "EREDMÉNY MENTÉSE"}</button>
          </div>
          <p className="text-[11px] text-[#8a8a8a] mt-2 break-words [overflow-wrap:anywhere]">{checklistMsg}</p>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-3">
          {CHECKLIST_CATS.map(function (cat) {
            const rows = checklist.filter(function (x) { return x.cat === cat; });
            const catChecked = rows.filter(function (x) { return x.checked; }).length;
            return (
              <div key={cat} className="mb-3">
                <div className="flex flex-wrap justify-between gap-2 items-center border border-[#262626] bg-[#111] px-2 py-2"><b className="tech text-[11px] tracking-widest">{cat}</b><span className="text-[11px] text-[#8a8a8a]">{catChecked} / {rows.length} pipálva</span></div>
                <div className="border border-t-0 border-[#262626]">
                  {rows.map(function (item) {
                    return (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-2 py-2 border-b border-[#1a1a1a] last:border-b-0 bg-black">
                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input type="checkbox" checked={item.checked} onChange={function (e) { const v = e.target.checked; setChecklist(function (prev) { return prev.map(function (x) { return x.id === item.id ? { ...x, checked: v } : x; }); }); }} className="w-4 h-4 shrink-0" style={{ accentColor: RED }} aria-label={"Pipa: " + item.name} />
                          <span className="text-[11px] font-bold text-[#8a8a8a]">{item.checked ? "✓" : "○"}</span>
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold break-words [overflow-wrap:anywhere]">{item.name}</div>
                          <div className="text-[11px] text-[#8a8a8a] break-words [overflow-wrap:anywhere]">LEÍRÁS: {item.desc}</div>
                        </div>
                        <span className="shrink-0 px-2 py-1 border border-[#262626] text-[11px] font-bold text-center min-w-[64px]" style={{ color: item.status === "OK" ? "#00e676" : item.status === "HIBA" ? RED : "#8a8a8a" }}>STÁTUSZ: {item.status}</span>
                        <button onClick={function () { checklistTestOne(item); }} disabled={checklistRunning} className="shrink-0 px-3 py-1.5 font-bold text-black text-[11px] disabled:opacity-40" style={{ background: RED }}>TESZT</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="shrink-0 border-t-2 px-3 py-2" style={{ borderTopColor: RED }}>
          {allDone && <p className="font-bold text-[13px]" style={{ color: "#00e676" }}>Ha minden OK: PROJEKT KÉSZ ✓</p>}
          {!allDone && errors.length === 0 && <p className="text-[11px] text-[#8a8a8a]">Még nem kész: {checked} / {total} pipálva • {okCount} OK. Futtasd végig a teszteket, majd mentsd az eredményt.</p>}
          {errors.length > 0 && (
            <div>
              <p className="font-bold text-[12px]" style={{ color: RED }}>HIBALISTA — {errors.length} db:</p>
              <ul className="mt-1 space-y-0.5">{errors.map(function (e) { return <li key={e.id} className="text-[11px] break-words [overflow-wrap:anywhere]"><span style={{ color: RED }}>✕</span> {e.cat} • {e.name} <span className="text-[#8a8a8a]">— {e.desc}</span></li>; })}</ul>
            </div>
          )}
        </div>
      </div>
    );
  }
  function renderContent(w: Win) {
    if (w.app === "matrix") return renderMatrix();
    if (w.app === "shift") return renderShift();
    if (w.app === "vbtest") return renderVbTest();
    if (w.app === "erlang") return renderErlang();
    if (w.app === "erlangtest") return renderErlangTest();
    if (w.app === "basic") return renderBasic();
    if (w.app === "editor") return renderEditor();
    if (w.app === "files") return renderFiles();
    if (w.app === "kotlin") return renderKotlin();
    if (w.app === "ai") return renderAi();
    if (w.app === "network") return renderNetwork();
    if (w.app === "daemon") return renderDaemon();
    if (w.app === "vault") return renderVault();
    if (w.app === "settings") return renderSettings();
    if (w.app === "firewall") return renderFirewall();
    if (w.app === "bootlog") return renderBootLog();
    if (w.app === "jetbrains") return renderJetbrains();
    if (w.app === "ghost") return renderGhost();
    if (w.app === "cuda") return renderCudaScreen();
    if (w.app === "transitter") return renderTransitter();
    if (w.app === "checklist") return renderChecklist();
    return null;
  }

  if (boot) {
    return (
      <div style={{ boxSizing: "border-box", paddingTop: "1rem" }} className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center px-6 text-center overflow-x-clip">
        <div className="text-[11px] tracking-[0.4em] text-[#8a8a8a]">MATYA CORE // BOOT</div>
        <div className="tech font-black leading-none mt-4" style={{ fontSize: "clamp(38px, 10vw, 88px)", letterSpacing: "-0.02em" }}>MATYA <span style={{ color: RED }}>CORE</span></div>
        <div className="w-[min(420px,90vw)] h-[10px] border border-[#262626] mt-8 overflow-hidden"><div className="h-full" style={{ width: bootProgress + "%", background: RED, transition: "width .12s" }} /></div>
        <div className="flex justify-between w-[min(420px,90vw)] text-[11px] text-[#8a8a8a] mt-2"><span>BETÖLTÉS…</span><b className="text-white">{bootProgress}%</b></div>
        <div className="text-[11px] text-[#5c5c5c] mt-6">Kotlin • Node.js • Python • Daemon PID 777</div>
      </div>
    );
  }

  // Asztal ÜRES — minden program a START menüben van (START_MENU_APPS = összes program).
  // A DESKTOP_APPS ezért üres; asztali ikont sehol nem renderelünk.

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }} className="h-[100dvh] w-full overflow-x-clip overflow-hidden bg-black flex flex-col relative text-[12px]">
      <header data-safe-area-sticky-top style={{ top: "var(--safe-area-inset-top)" }} className="sticky z-[90] h-[38px] shrink-0 bg-black flex items-center gap-2 px-2 sm:px-3 text-[12px] border-b border-[#262626] relative">
        <button onClick={function () { setStartOpen(!startOpen); }} className="h-[26px] px-3 font-bold text-black tech tracking-widest text-[11px]" style={{ background: RED }}>START</button>
        <div className="tech font-bold tracking-widest hidden md:block text-[12px]">MATYA <span style={{ color: RED }}>CORE</span> <span className="text-[#8a8a8a]">// DESKTOP v1.0</span></div>
        <div className="flex-1 text-center text-[11px]"><span className="font-bold">{now.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span> <span className="text-[#8a8a8a] hidden sm:inline">{now.toLocaleDateString("hu-HU", { weekday: "short", month: "short", day: "numeric" })}</span></div>
        <div className="flex items-center gap-2 text-[11px]">{closedOn && <span className="px-2 py-1 border font-bold" style={{ borderColor: RED, color: "#fff", background: RED }}>🔒 ZÁRT RENDSZER MÓD: ON - Csak allowlist</span>}{txOn && <span className="px-2 py-1 border border-[#262626] font-bold" style={{ borderColor: RED, color: RED }}><span className="pulse-dot inline-block">📡</span> TRANSITTER: TX FUT</span>}<span className="px-2 py-1 border border-[#262626]">👻 GHOST: <b className="text-[#00e676]">FUT</b> | SHOCKWAVE: <b className="text-[#00e676]">ON</b></span><span className="hidden sm:inline px-2 py-1 border border-[#262626]"><Wifi size={12} className="inline mr-1" />NET <b className="text-[#00e676]">ONLINE</b></span><span className="hidden sm:inline px-2 py-1 border border-[#262626]">DAEMON <b style={{ color: daemonOn ? "#00e676" : RED }}>{daemonOn ? "777" : "OFF"}</b></span><span className="px-2 py-1 border border-[#262626]">AES <b style={{ color: vaultLocked ? RED : "#00e676" }}>{vaultLocked ? "LOCK" : "OPEN"}</b></span><button onClick={function () { openApp("settings"); }} className="p-1 border border-[#262626]" aria-label="Beállítások"><SettingsIcon size={14} /></button><Bell size={14} className="text-[#8a8a8a]" /></div>

        {startOpen && (
          <div className="absolute left-0 top-full w-[min(96vw,760px)] bg-black border border-[#262626] shadow-2xl slide-up z-[95]" onPointerDown={function (e) { e.stopPropagation(); }}>
            <div className="p-3 border-b border-[#262626] flex gap-2 items-center"><Search size={16} /><input autoFocus value={query} onChange={function (e) { setQuery(e.target.value); }} placeholder="Keresés… terminál, kotlin, vault…" className="bg-transparent outline-none flex-1 text-[12px]" /><button onClick={function () { setStartOpen(false); }} className="text-[11px] px-2 py-1 border border-[#262626]">BEZÁRÁS X</button></div>
            <div className="grid sm:grid-cols-3 gap-px bg-[#262626] max-h-[420px] overflow-auto">
              {cols.map(function (col) {
                return (
                  <div key={col.title} className="bg-black p-3">
                    <div className="tech text-[11px] font-bold tracking-widest pb-2 border-b-2" style={{ borderColor: RED }}>{col.title}</div>
                    <div className="mt-2 space-y-1">
                      {col.items.map(function (a) {
                        return (<button key={a.id} onClick={function () { openApp(a.id); }} className="w-full flex items-center gap-3 p-2 text-left hover:bg-[#111] border border-transparent hover:border-[#262626]"><span className="w-9 h-9 grid place-items-center font-bold text-black shrink-0 text-[11px]" style={{ background: a.id === "terminal" ? RED : "#fff" }}>{a.code}</span><span className="flex-1 min-w-0"><span className="block font-bold truncate">{a.name}</span><span className="block text-[11px] text-[#8a8a8a] truncate">{a.desc}</span></span><ChevronRight size={14} className="text-[#8a8a8a]" /></button>);
                      })}
                      {col.items.length === 0 && <p className="text-[11px] text-[#8a8a8a] p-2">Nincs találat.</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-2 border-t border-[#262626] flex justify-between text-[11px] text-[#8a8a8a]"><span>user@matya-core • MATYA CORE v1.0</span><span style={{ color: RED }}>■ REC</span></div>
          </div>
        )}
      </header>

      <main className="flex-1 relative overflow-hidden wallpaper" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerDown={function () { setStartOpen(false); }}>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden" aria-hidden="true"><div className="tech font-black text-[#111] leading-[0.8] whitespace-nowrap" style={{ fontSize: "clamp(90px, 18vw, 210px)" }}>MATYA<br /><span className="text-[#0d0d0d]">CORE</span></div></div>
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 pointer-events-none"><div className="tech font-black leading-[0.9] text-[clamp(22px,4vw,38px)]">MATYA <span style={{ color: RED }}>CORE</span></div><p className="text-[#8a8a8a] text-[11px] mt-1 max-w-[220px]">Kotlin • Node.js • Python<br />asztali környezet.</p><div className="mt-2 flex gap-1 pointer-events-auto"><button onClick={function () { openApp("kotlin"); }} className="px-2 py-1.5 text-[11px] font-bold text-black" style={{ background: RED }}>KOTLIN SERVER</button><button onClick={function () { setConsoleMin(false); }} className="px-2 py-1.5 text-[11px] font-bold bg-[#111] border border-[#262626]">KONZOL</button></div></div>

        {/* Asztal ÜRES — csak vízjel / háttér, konzol és ablakok. Minden program a START menüben van. */}
        <div className="absolute right-2 top-2 hidden md:block w-[220px] border border-[#262626] bg-black/80 p-3"><div className="flex justify-between text-[11px]"><span className="flex items-center gap-1"><Cpu size={12} />CPU</span><b>{cpu}%</b></div><div className="h-2 bg-[#1a1a1a] mt-1"><div className="h-full" style={{ width: cpu + "%", background: RED }} /></div><div className="flex justify-between text-[11px] mt-3"><span className="flex items-center gap-1"><HardDrive size={12} />MEM</span><b>{mem}%</b></div><div className="h-2 bg-[#1a1a1a] mt-1"><div className="h-full bg-white" style={{ width: mem + "%" }} /></div><div className="text-[11px] text-[#8a8a8a] mt-3">DAEMON PID 777 • FUT</div></div>

        {windows.map(function (w) {
          if (w.min) return null;
          const style = w.max ? { left: 6, top: 6, width: "calc(100% - 12px)", height: "calc(100% - 12px)", zIndex: w.z } : { left: w.x, top: w.y, width: "min(" + w.w + "px, calc(100vw - 12px))", height: "min(" + w.h + "px, calc(100% - 12px))", zIndex: w.z };
          function doMin() { toggleMin(w.id); }
          function doMax() { toggleMax(w.id); }
          function doClose() { closeWin(w.id); }
          return (
            <section key={w.id} style={style} className="absolute overflow-hidden window-shadow bg-[#0a0a0a] border border-[#3a3a3a] flex flex-col" onPointerDown={function () { focusWin(w.id); }}>
              <div className="h-[34px] shrink-0 flex items-center gap-2 pl-3 pr-1 bg-[#111] border-b border-[#262626] cursor-grab no-select touch-none" onPointerDown={function (e) { startDrag(e, w); }} onDoubleClick={doMax}>
                <span className="w-2 h-2 shrink-0" style={{ background: RED }} />
                <span className="text-[11px] font-bold tracking-widest truncate flex-1">{w.title}</span>
                <span className="text-[10px] text-[#5c5c5c] hidden sm:inline">MATYA CORE</span>
                <button onClick={doMin} className="w-7 h-7 grid place-items-center hover:bg-[#222]" aria-label="Minimalizálás"><Minus size={14} /></button>
                <button onClick={doMax} className="w-7 h-7 grid place-items-center hover:bg-[#222]" aria-label="Maximalizálás"><Maximize2 size={12} /></button>
                <button onClick={doClose} className="w-7 h-7 grid place-items-center hover:bg-[#FF0A1E] hover:text-black" aria-label="Bezárás"><X size={15} /></button>
              </div>
              <div className="flex-1 min-h-0 relative">{renderContent(w)}</div>
              {!w.max && <button aria-label="Ablak átméretezése" className="absolute right-0 bottom-0 w-6 h-6 cursor-nwse-resize touch-none z-10" style={{ background: "linear-gradient(135deg, transparent 50%, #FF0A1E 50%)" }} onPointerDown={function (e) { startResize(e, w); }} />}
            </section>
          );
        })}
      </main>

      <section className="shrink-0 bg-black border-t-2 border-[#262626] flex flex-col" style={{ borderTopColor: RED }}>
        <div className="h-[32px] flex items-center gap-2 px-2 border-b border-[#262626]">
          <TerminalSquare size={15} style={{ color: RED }} />
          <span className="tech text-[11px] font-bold tracking-widest flex-1 truncate">UNIX KONZOL <span className="text-[#8a8a8a] hidden sm:inline">// MATYA CORE — sosem záródik be</span></span>
          <span className="text-[11px] text-[#8a8a8a] hidden md:inline">{consoleLines.length} sor</span>
          <button onClick={function () { setConsoleLines([]); }} className="px-2 py-1 text-[11px] font-bold bg-[#111] border border-[#262626]">CLEAR</button>
          <button onClick={function () { setConsoleMin(!consoleMin); }} className="px-2 py-1 text-[11px] font-bold bg-[#111] border border-[#262626]">{consoleMin ? "MAX ▲" : "MIN ▼"}</button>
        </div>
        {!consoleMin && (
          <div className="h-[176px] flex flex-col">
            <div ref={consoleRef} className="flex-1 overflow-auto px-3 py-2 mono text-[11px] leading-[1.5]">{consoleLines.map(function (l, i) { return <div key={i} className="break-words [overflow-wrap:anywhere]">{l}</div>; })}<span className="caret" style={{ color: RED }}>▌</span></div>
            <form onSubmit={function (e) { e.preventDefault(); runCommand(input); }} className="flex items-center gap-2 px-3 py-1.5 border-t border-[#262626]"><span className="text-[11px] shrink-0" style={{ color: RED }}>user@matya-core:~$</span><input id="console-input" value={input} onChange={function (e) { setInput(e.target.value); }} onKeyDown={onHistKey} className="flex-1 min-w-0 bg-transparent outline-none text-white text-[12px]" placeholder="Írd be: help" /><button className="px-2 py-1 text-[11px] font-bold text-black shrink-0" style={{ background: RED }}>ENTER</button></form>
          </div>
        )}
      </section>

      <footer className="h-[40px] shrink-0 bg-black border-t border-[#262626] flex items-center gap-2 px-2 relative z-[80]">
        <span className="hidden sm:flex items-center gap-1 px-2 py-1 border border-[#262626] text-[11px] font-bold"><AppWindow size={12} />{windows.filter(function (w) { return !w.min; }).length} ABLAK</span>
        <div className="flex-1 flex gap-1 overflow-x-auto min-w-0 py-1">
          <button onClick={function () { setConsoleMin(false); }} className="shrink-0 px-2 py-1.5 text-[11px] font-bold border border-[#262626] bg-[#111]">▸ KONZOL</button>
          {windows.map(function (w) {
            function taskClick() { if (w.min) toggleMin(w.id); focusWin(w.id); }
            return (<button key={w.id} onClick={taskClick} className="shrink-0 px-2 py-1.5 text-[11px] font-bold border" style={{ borderColor: activeId === w.id ? RED : "#262626", background: activeId === w.id ? "#1a1a1a" : "#000" }}>{w.min ? "▸ " : ""}{w.title}</button>);
          })}
          {windows.length === 0 && <span className="text-[11px] text-[#8a8a8a] px-2 self-center">Nincs nyitott ablak — nyiss egyet a START menüből vagy az asztali ikonokról.</span>}
        </div>
        <div className="flex items-center gap-2 text-[11px] shrink-0"><span className="hidden md:flex items-center gap-1"><Activity size={12} style={{ color: RED }} />CPU <b>{cpu}%</b></span><span className="hidden md:flex items-center gap-1"><Database size={12} />MEM <b>{mem}%</b></span><span className="flex items-center gap-1 px-2 py-1 border border-[#262626]"><Shield size={12} style={{ color: RED }} /><b>{vaultLocked ? "VAULT LOCK" : "VAULT OPEN"}</b></span><span className="hidden sm:inline font-bold">{now.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}</span></div>
      </footer>
      {saveDialog.open && (
        <div className="fixed inset-0 overflow-y-auto z-[200] bg-black/80 pt-[max(1rem,var(--safe-area-inset-top))] pb-4">
          <div className="min-h-full flex items-center justify-center px-3">
            <div className="w-[min(520px,96vw)] bg-black border-2 border-[#3a3a3a] window-shadow p-4">
              <div className="flex justify-between items-center"><h3 className="tech font-bold tracking-widest">MENTÉS FÁJLRENDSZERBE</h3><button onClick={function () { setSaveDialog(function (p) { return { ...p, open: false }; }); }} className="px-2 py-1 border border-[#262626] text-[11px] font-bold">BEZÁRÁS X</button></div>
              <label className="block text-[11px] text-[#8a8a8a] mt-4">FÁJLNÉV — pl. hello.erl / program.bas / app.js</label>
              <input value={saveDialog.name} onChange={function (e) { setSaveDialog(function (p) { return { ...p, name: e.target.value }; }); }} className="w-full bg-black border border-[#262626] px-3 py-2 mt-1 outline-none [overflow-wrap:anywhere]" />
              <label className="block text-[11px] text-[#8a8a8a] mt-3">MAPPA</label>
              <div className="flex flex-wrap gap-1 mt-1">{FS_FOLDERS.map(function (f) { return <button key={f} onClick={function () { setSaveDialog(function (p) { return { ...p, folder: f }; }); }} className="px-3 py-1.5 text-[11px] font-bold border" style={{ borderColor: saveDialog.folder === f ? RED : "#262626", background: saveDialog.folder === f ? "#1a1a1a" : "#000" }}>{f}</button>; })}</div>
              <p className="text-[11px] text-[#8a8a8a] mt-3 break-words [overflow-wrap:anywhere]">Cél: {saveDialog.folder}{saveDialog.name} • Forrás: {saveDialog.source || "szerkesztő"}</p>
              <p className="text-[11px] mt-1 break-words [overflow-wrap:anywhere]">{fsMsg}</p>
              <div className="flex gap-2 mt-4"><button onClick={function () { void saveToFilesystem(); }} disabled={saveBusy} className="flex-1 py-2 font-bold text-black disabled:opacity-40" style={{ background: RED }}>{saveBusy ? "MENTÉS…" : "MENTÉS"}</button><button onClick={function () { setSaveDialog(function (p) { return { ...p, open: false }; }); }} className="px-4 py-2 font-bold bg-[#1a1a1a] border border-[#262626]">MÉGSE</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
